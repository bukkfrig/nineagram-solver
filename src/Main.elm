module Main exposing (main)

import Browser
import Browser.Dom
import Cheat
import Html exposing (Attribute, Html, b, br, button, div, h1, i, input, label, li, text, ul)
import Html.Attributes as Attributes
import Html.Events as Events
import Json.Decode
import Nineagram exposing (NineagramPuzzle)
import Nineagram.Guess as Guess exposing (Guess)
import Process
import Task exposing (Task)
import Url
import Url.Parser exposing ((<?>))
import Url.Parser.Query


{-| The goal in solving a Nineagram puzzle is to find two five-letter words
from the nine letters provided that share the same middle letter.

For example, given AEEHPPRSS, one solution is PEARS and SHAPE:

        P
        E
    S H A P E
        R
        S

The main way that the Program assists the user is by displaying the remaining
letters after the player guesses at one of the words.

The Program can also find and display solutions by exhaustively searching
its own word list.

-}
main : Program () Model Msg
main =
    Browser.application
        { init = \() url _ -> init url
        , update = update
        , view = view
        , subscriptions = \_ -> Sub.none
        , onUrlRequest = \_ -> NoOp
        , onUrlChange = \_ -> NoOp
        }



-- MODEL


type Attempt
    = NoGuesses
    | OneGuess Guess
    | TwoGuesses Guess Guess


type ComputerSolution
    = ComputerSolution Guess (List Guess)


type alias State =
    { letters : String
    , puzzleCreationProblems : List Nineagram.CreationProblem
    , puzzle : Maybe NineagramPuzzle
    , guessProblems : List Guess.Problem
    , guessForPuzzleProblems : List Nineagram.GuessProblem
    , attempts : List Attempt
    , currentAttempt : Attempt
    , defaultAttempt : Attempt
    , guessInput : String
    , cheat : Bool
    , computerSolutions : Maybe (List ComputerSolution)
    }


type Model
    = DefaultPuzzleProblem
    | DefaultPuzzleLoaded NineagramPuzzle State


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case model of
        DefaultPuzzleProblem ->
            ( model, Cmd.none )

        DefaultPuzzleLoaded defaultPuzzle state ->
            case updateState defaultPuzzle msg state of
                ( newState, commands ) ->
                    ( DefaultPuzzleLoaded defaultPuzzle newState, commands )


init : Url.Url -> ( Model, Cmd Msg )
init url =
    case Nineagram.fromString "GRNAMNIEA" of
        Ok defaultPuzzle ->
            ( DefaultPuzzleLoaded defaultPuzzle initState
            , Cmd.batch
                [ focus "puzzleLetters"
                , case parseQueryParameter "letters" url of
                    Just letters ->
                        Task.perform SubmitPuzzleLetters (Task.succeed letters)

                    Nothing ->
                        Cmd.none
                ]
            )

        Err _ ->
            ( DefaultPuzzleProblem, Cmd.none )

{- ignore the path and just get the query parameter -}
parseQueryParameter : String -> Url.Url -> Maybe String
parseQueryParameter target url =
    Url.Parser.parse
        (Url.Parser.query (Url.Parser.Query.string target))
        { url | path = "" }
        |> Maybe.withDefault Nothing

initState : State
initState =
    { letters = ""
    , puzzle = Nothing
    , puzzleCreationProblems = []
    , computerSolutions = Nothing
    , guessProblems = []
    , guessForPuzzleProblems = []
    , currentAttempt = NoGuesses
    , defaultAttempt = NoGuesses
    , attempts = []
    , guessInput = ""
    , cheat = False
    }



-- UPDATE


type Msg
    = Focussed String (Result Browser.Dom.Error ())
    | TypedPuzzleLetters String
    | SubmitPuzzleLetters String
    | Reset
    | TypingGuess String
    | SubmitAttempt NineagramPuzzle String
    | SelectAttempt Attempt
    | SelectDefaultAttempt
    | DeleteAttempt Attempt
    | EnableCheat
    | ComputerSolved (List ComputerSolution)
    | NoOp


updateState : NineagramPuzzle -> Msg -> State -> ( State, Cmd Msg )
updateState _ msg model =
    case msg of
        Focussed _ _ ->
            ( model, Cmd.none )

        TypedPuzzleLetters letters ->
            ( { model | letters = letters |> String.toUpper }, Cmd.none )

        SubmitPuzzleLetters letters ->
            case Nineagram.fromString letters of
                Ok puzzle ->
                    startSolving puzzle

                Err puzzleCreationProblems ->
                    ( { model | puzzleCreationProblems = puzzleCreationProblems }, Cmd.none )

        TypingGuess typing ->
            ( { model | guessInput = String.toUpper typing }, Cmd.none )

        SubmitAttempt puzzle typed ->
            case Guess.fromString (String.trim typed) of
                Ok newGuess ->
                    ( addAttempt { model | guessProblems = [] } puzzle newGuess, Cmd.none )

                Err guessProblems ->
                    ( { model | guessProblems = guessProblems, guessForPuzzleProblems = [] }, Cmd.none )

        SelectAttempt attempt ->
            ( { model | currentAttempt = attempt }, Cmd.none )

        DeleteAttempt attempt ->
            ( deleteAttempt attempt model, Cmd.none )

        EnableCheat ->
            ( { model | cheat = True }, Cmd.none )

        SelectDefaultAttempt ->
            ( { model | currentAttempt = model.defaultAttempt }, Cmd.none )

        Reset ->
            ( initState, focus "puzzleLetters" )

        ComputerSolved solutions ->
            ( { model | computerSolutions = Just solutions }, Cmd.none )

        NoOp ->
            ( model, Cmd.none )


startSolving : NineagramPuzzle -> ( State, Cmd Msg )
startSolving puzzle =
    ( { initState
        | puzzle = Just puzzle
        , letters =
            Nineagram.getLetters puzzle
                |> String.fromList
                |> String.toUpper
      }
    , Cmd.batch
        [ focus "guess"
        , solve ComputerSolved puzzle
        ]
    )


focus : String -> Cmd Msg
focus id =
    Task.attempt (Focussed id) (Browser.Dom.focus id)


solve : (List ComputerSolution -> msg) -> NineagramPuzzle -> Cmd msg
solve tagger puzzle =
    Cheat.cheatWords
        |> batchedFilterMap 200 (Result.toMaybe << Guess.fromString)
        |> Task.andThen (batchedFilter 200 (\guess -> Nineagram.validateGuess puzzle guess == Ok ()))
        |> Task.andThen
            (\validGuesses ->
                batchedFilterMap 200
                    (\guess ->
                        case Nineagram.solutions puzzle validGuesses guess of
                            [] ->
                                Nothing

                            solutions ->
                                Just <| ComputerSolution guess solutions
                    )
                    validGuesses
            )
        |> Task.perform tagger


addAttempt : State -> NineagramPuzzle -> Guess -> State
addAttempt model puzzle guess =
    case Nineagram.validateGuess puzzle guess of
        Err problems ->
            { model | guessForPuzzleProblems = problems }

        Ok () ->
            let
                newAttempt =
                    case model.currentAttempt of
                        NoGuesses ->
                            OneGuess guess

                        OneGuess firstGuess ->
                            if Nineagram.isSolution puzzle firstGuess guess then
                                TwoGuesses firstGuess guess

                            else
                                OneGuess guess

                        TwoGuesses _ _ ->
                            OneGuess guess
            in
            { model
                | guessForPuzzleProblems = []
                , attempts = newAttempt :: model.attempts
                , currentAttempt = newAttempt
                , guessInput = ""
            }


deleteAttempt : Attempt -> State -> State
deleteAttempt attempt state =
    { state
        | attempts =
            List.filter (\a -> a /= attempt)
                state.attempts
        , currentAttempt =
            if state.currentAttempt == attempt then
                state.defaultAttempt

            else
                state.currentAttempt
    }



-- Helpers for doing Elm Tasks to do Elm computations while occasionally deferring to update the UI.
--     Thanks Simon of Elm Slack #beginners for the idea and early implementations
--     Thanks jfmengels of Elm Slack #beginners for help with a bug.


batchedFoldl : Int -> (a -> b -> b) -> b -> List a -> Task Never b
batchedFoldl batchSize reducer ini list =
    let
        batchItems =
            List.take batchSize list

        remainingItems =
            List.drop batchSize list

        workResult =
            List.foldl reducer ini batchItems
    in
    case remainingItems of
        [] ->
            Task.succeed workResult

        _ ->
            Process.sleep 0
                |> Task.andThen (\_ -> batchedFoldl batchSize reducer workResult remainingItems)


batchedFilter : Int -> (a -> Bool) -> List a -> Task Never (List a)
batchedFilter batchSize fn list =
    batchedFoldl batchSize
        (\a acc ->
            if fn a then
                a :: acc

            else
                acc
        )
        []
        list


batchedFilterMap : Int -> (a -> Maybe b) -> List a -> Task Never (List b)
batchedFilterMap batchSize fn list =
    batchedFoldl batchSize
        (\a acc ->
            case fn a of
                Just b ->
                    b :: acc

                Nothing ->
                    acc
        )
        []
        list



-- VIEW


view : Model -> Browser.Document Msg
view model =
    { title = "Nineagram Solver"
    , body =
        [ case model of
            DefaultPuzzleProblem ->
                text "Sorry, something went wrong."

            DefaultPuzzleLoaded defaultPuzzle state ->
                viewState defaultPuzzle state
        ]
    }


viewState : NineagramPuzzle -> State -> Html Msg
viewState defaultPuzzle model =
    let
        puzzle =
            Maybe.withDefault defaultPuzzle model.puzzle
    in
    div (Attributes.class "nineagramSolver" :: keyHandlers model)
        [ viewPuzzleCreation model
        , viewNineagram puzzle model.currentAttempt
        , viewGuessing model puzzle
        , viewAttempts model puzzle
        , viewAllSolutions model
        , h1 [] [ text "Nineagram Solver" ]
        ]


keyHandlers : State -> List (Attribute Msg)
keyHandlers model =
    case model.puzzle of
        Just _ ->
            [ Events.on "keydown"
                (Events.keyCode
                    |> Json.Decode.andThen
                        (\keyCode ->
                            {- esc -}
                            if keyCode == 27 then
                                Json.Decode.succeed SelectDefaultAttempt

                            else
                                Json.Decode.fail "other key"
                        )
                )
            ]

        Nothing ->
            []



-- Creating the puzzle


viewPuzzleCreation : State -> Html Msg
viewPuzzleCreation model =
    Html.form
        [ Attributes.class "puzzleform"
        , Events.onSubmit (SubmitPuzzleLetters model.letters)
        ]
        [ div [ Attributes.class "lettersInput" ]
            [ label [ Attributes.for "puzzleLetters" ]
                [ b []
                    [ text "Nineagram Letters"
                    ]
                ]
            , br [] []
            , input
                [ Attributes.type_ "text"
                , Attributes.id "puzzleLetters"
                , Attributes.class "lettersInput"
                , Attributes.spellcheck False
                , Attributes.autocomplete False
                , Attributes.value model.letters
                , Attributes.disabled (model.puzzle /= Nothing)
                , Events.onInput TypedPuzzleLetters
                ]
                []
            , div [ Attributes.class "creationProblems" ]
                [ viewCreationProblems model.puzzleCreationProblems
                ]
            ]
        , div []
            [ button [ Attributes.disabled (model.puzzle /= Nothing) ]
                [ text "Submit"
                ]
            , button
                [ Attributes.type_ "button"
                , Events.onClick Reset
                ]
                [ text "Clear"
                ]
            ]
        ]


viewCreationProblems : List Nineagram.CreationProblem -> Html Msg
viewCreationProblems problems =
    let
        displayProblem : Nineagram.CreationProblem -> Maybe String
        displayProblem problem =
            case problem of
                Nineagram.LettersTooFew 0 ->
                    Nothing

                Nineagram.LettersTooFew n ->
                    Just <| "That's only " ++ String.fromInt n ++ " letters. A puzzle should have exactly nine letters."

                Nineagram.LettersTooMany n ->
                    Just <| "That's " ++ String.fromInt n ++ " letters. A puzzle should have exactly nine letters."

                Nineagram.ContainsNonAlphaCharacters first _ ->
                    Just <| "That's got a '" ++ String.fromChar first ++ "'. A puzzle should only have letters."
    in
    List.filterMap displayProblem problems
        |> List.map (\message -> div [] [ text message ])
        |> div [ Attributes.class "creationProblem" ]



-- Displaying the Nineagram puzzle Grid --


viewNineagram : NineagramPuzzle -> Attempt -> Html Msg
viewNineagram puzzle attempt =
    case attempt of
        NoGuesses ->
            viewNineagramNoGuesses puzzle

        OneGuess guess ->
            viewNineagramOneGuess puzzle guess

        TwoGuesses firstGuess secondGuess ->
            viewNineagramTwoGuesses puzzle firstGuess secondGuess


viewNineagramNoGuesses : NineagramPuzzle -> Html Msg
viewNineagramNoGuesses puzzle =
    let
        letter n =
            Nineagram.getLetters puzzle
                |> List.take n
                |> List.drop (n - 1)
                |> String.fromList
                |> String.toUpper

        guess _ =
            ""
    in
    div [ Attributes.class "nineagram" ]
        [ div [ Attributes.class "letterbox" ] [ input [ Attributes.type_ "text", Attributes.class "letter", Attributes.placeholder (letter 1), Attributes.value (guess 1) ] [] ]
        , br [] []
        , div [ Attributes.class "letterbox" ] [ input [ Attributes.type_ "text", Attributes.class "letter", Attributes.placeholder (letter 2), Attributes.value (guess 2) ] [] ]
        , br [] []
        , div [ Attributes.class "letterbox" ] [ input [ Attributes.type_ "text", Attributes.class "letter", Attributes.placeholder (letter 6), Attributes.value (guess 6) ] [] ]
        , div [ Attributes.class "letterbox" ] [ input [ Attributes.type_ "text", Attributes.class "letter", Attributes.placeholder (letter 7), Attributes.value (guess 7) ] [] ]
        , div [ Attributes.class "letterbox" ] [ input [ Attributes.type_ "text", Attributes.class "letter", Attributes.placeholder (letter 3), Attributes.value (guess 3) ] [] ]
        , div [ Attributes.class "letterbox" ] [ input [ Attributes.type_ "text", Attributes.class "letter", Attributes.placeholder (letter 8), Attributes.value (guess 8) ] [] ]
        , div [ Attributes.class "letterbox" ] [ input [ Attributes.type_ "text", Attributes.class "letter", Attributes.placeholder (letter 9), Attributes.value (guess 9) ] [] ]
        , br [] []
        , div [ Attributes.class "letterbox" ] [ input [ Attributes.type_ "text", Attributes.class "letter", Attributes.placeholder (letter 4), Attributes.value (guess 4) ] [] ]
        , br [] []
        , div [ Attributes.class "letterbox" ] [ input [ Attributes.type_ "text", Attributes.class "letter", Attributes.placeholder (letter 5), Attributes.value (guess 5) ] [] ]
        ]


viewNineagramOneGuess : NineagramPuzzle -> Guess -> Html Msg
viewNineagramOneGuess puzzle guess =
    let
        remain =
            Nineagram.remainingLetters puzzle guess
                |> Result.withDefault []

        letter n =
            (List.repeat (String.length (Guess.toString guess)) ' ' ++ remain)
                |> List.take n
                |> List.drop (n - 1)
                |> String.fromList
                |> String.toUpper

        guessLetter n =
            guess
                |> Guess.toString
                |> String.toList
                |> List.take n
                |> List.drop (n - 1)
                |> String.fromList
                |> String.toUpper
    in
    div [ Attributes.class "nineagram" ]
        [ div [ Attributes.class "letterbox" ] [ input [ Attributes.type_ "text", Attributes.class "letter", Attributes.placeholder (letter 1), Attributes.value (guessLetter 1) ] [] ]
        , br [] []
        , div [ Attributes.class "letterbox" ] [ input [ Attributes.type_ "text", Attributes.class "letter", Attributes.placeholder (letter 2), Attributes.value (guessLetter 2) ] [] ]
        , br [] []
        , div [ Attributes.class "letterbox" ] [ input [ Attributes.type_ "text", Attributes.class "letter", Attributes.placeholder (letter 6), Attributes.value (guessLetter 6) ] [] ]
        , div [ Attributes.class "letterbox" ] [ input [ Attributes.type_ "text", Attributes.class "letter", Attributes.placeholder (letter 7), Attributes.value (guessLetter 7) ] [] ]
        , div [ Attributes.class "letterbox" ] [ input [ Attributes.type_ "text", Attributes.class "letter", Attributes.placeholder (letter 3), Attributes.value (guessLetter 3) ] [] ]
        , div [ Attributes.class "letterbox" ] [ input [ Attributes.type_ "text", Attributes.class "letter", Attributes.placeholder (letter 8), Attributes.value (guessLetter 8) ] [] ]
        , div [ Attributes.class "letterbox" ] [ input [ Attributes.type_ "text", Attributes.class "letter", Attributes.placeholder (letter 9), Attributes.value (guessLetter 9) ] [] ]
        , br [] []
        , div [ Attributes.class "letterbox" ] [ input [ Attributes.type_ "text", Attributes.class "letter", Attributes.placeholder (letter 4), Attributes.value (guessLetter 4) ] [] ]
        , br [] []
        , div [ Attributes.class "letterbox" ] [ input [ Attributes.type_ "text", Attributes.class "letter", Attributes.placeholder (letter 5), Attributes.value (guessLetter 5) ] [] ]
        ]


viewNineagramTwoGuesses : NineagramPuzzle -> Guess -> Guess -> Html Msg
viewNineagramTwoGuesses _ firstGuess secondGuess =
    let
        letter _ =
            ""

        firstGuessLetter n =
            firstGuess
                |> Guess.toString
                |> String.toList
                |> List.take n
                |> List.drop (n - 1)
                |> String.fromList
                |> String.toUpper

        secondGuessLetter n =
            secondGuess
                |> Guess.toString
                |> String.toList
                |> List.take n
                |> List.drop (n - 1)
                |> String.fromList
                |> String.toUpper
    in
    div [ Attributes.class "nineagram", Attributes.class "solution" ]
        [ div [ Attributes.class "letterbox" ] [ input [ Attributes.type_ "text", Attributes.class "letter", Attributes.placeholder (letter 1), Attributes.value (firstGuessLetter 1) ] [] ]
        , br [] []
        , div [ Attributes.class "letterbox" ] [ input [ Attributes.type_ "text", Attributes.class "letter", Attributes.placeholder (letter 2), Attributes.value (firstGuessLetter 2) ] [] ]
        , br [] []
        , div [ Attributes.class "letterbox" ] [ input [ Attributes.type_ "text", Attributes.class "letter", Attributes.placeholder (letter 6), Attributes.value (secondGuessLetter 1) ] [] ]
        , div [ Attributes.class "letterbox" ] [ input [ Attributes.type_ "text", Attributes.class "letter", Attributes.placeholder (letter 7), Attributes.value (secondGuessLetter 2) ] [] ]
        , div [ Attributes.class "letterbox" ] [ input [ Attributes.type_ "text", Attributes.class "letter", Attributes.placeholder (letter 3), Attributes.value (secondGuessLetter 3) ] [] ]
        , div [ Attributes.class "letterbox" ] [ input [ Attributes.type_ "text", Attributes.class "letter", Attributes.placeholder (letter 8), Attributes.value (secondGuessLetter 4) ] [] ]
        , div [ Attributes.class "letterbox" ] [ input [ Attributes.type_ "text", Attributes.class "letter", Attributes.placeholder (letter 9), Attributes.value (secondGuessLetter 5) ] [] ]
        , br [] []
        , div [ Attributes.class "letterbox" ] [ input [ Attributes.type_ "text", Attributes.class "letter", Attributes.placeholder (letter 4), Attributes.value (firstGuessLetter 4) ] [] ]
        , br [] []
        , div [ Attributes.class "letterbox" ] [ input [ Attributes.type_ "text", Attributes.class "letter", Attributes.placeholder (letter 5), Attributes.value (firstGuessLetter 5) ] [] ]
        ]



-- Guessing


viewGuessing : State -> NineagramPuzzle -> Html Msg
viewGuessing state puzzle =
    Html.form
        [ Attributes.class "guessForm"
        , Events.onSubmit
            (SubmitAttempt puzzle state.guessInput)
        ]
        [ label [ Attributes.for "guess" ]
            [ b [] [ text "Next Guess" ] ]
        , br [] []
        , input
            [ Attributes.id "guess"
            , Attributes.name "guess"
            , Attributes.class "lettersInput"
            , Attributes.autocomplete False
            , Attributes.spellcheck False
            , Attributes.disabled (state.puzzle == Nothing)
            , Attributes.value state.guessInput
            , Events.onInput TypingGuess
            ]
            []
        , div [ Attributes.class "guessProblems" ]
            [ viewGuessProblems state.guessProblems
            , viewGuessForPuzzleProblems state.guessForPuzzleProblems
            ]
        , button [] [ text "Guess" ]
        ]


viewGuessProblems : List Guess.Problem -> Html Msg
viewGuessProblems problems =
    let
        displayProblem : Guess.Problem -> Maybe String
        displayProblem problem =
            case problem of
                Guess.TooShort 0 ->
                    Nothing

                Guess.TooShort n ->
                    Just <| "That's only " ++ String.fromInt n ++ " letters. Your words should have exactly five letters."

                Guess.TooLong n ->
                    Just <| "That's " ++ String.fromInt n ++ " letters. Your words should have exactly five letters."
    in
    List.filterMap displayProblem problems
        |> List.map (\message -> div [] [ text message ])
        |> div [ Attributes.class "guessProblem" ]


viewGuessForPuzzleProblems : List Nineagram.GuessProblem -> Html Msg
viewGuessForPuzzleProblems problems =
    div [ Attributes.class "guessForPuzzleProblem" ]
        (List.filterMap
            (viewGuessForPuzzleProblem
                >> Maybe.andThen (Just << div [] << List.singleton)
            )
            problems
        )


viewGuessForPuzzleProblem : Nineagram.GuessProblem -> Maybe (Html msg)
viewGuessForPuzzleProblem problem =
    case problem of
        Nineagram.LetterNotFound letter ->
            (Just << text << String.concat)
                [ "There aren't enough "
                , "'"
                , (String.toUpper << String.fromChar) letter
                , "'"
                , " for that word."
                ]



-- Displaying attempts --


viewAttempts : State -> NineagramPuzzle -> Html Msg
viewAttempts model puzzle =
    div [ Attributes.class "attempts" ] <| List.map (viewAttempt puzzle) model.attempts


viewAttempt : NineagramPuzzle -> Attempt -> Html Msg
viewAttempt puzzle attempt =
    case attempt of
        NoGuesses ->
            div
                [ Attributes.class "attempt"
                , Attributes.class "noguesses"
                , Events.onClick (SelectAttempt attempt)
                ]
                [ i []
                    [ text "New word" ]
                ]

        OneGuess guess ->
            let
                remaining =
                    guess
                        |> Nineagram.remainingLetters puzzle
                        |> Result.map String.fromList
                        |> Result.withDefault ""

                middleLetter =
                    (Guess.toString >> String.left 3 >> String.right 1)
                        guess
            in
            div
                [ Attributes.class "attempt"
                , Attributes.class "oneguess"
                , Events.onClick (SelectAttempt attempt)
                ]
                [ (b [] << List.singleton << text << String.toUpper)
                    (Guess.toString guess)
                , text
                    " - "
                , (text << String.toUpper)
                    (String.left 2 remaining)
                , (b [] << List.singleton << text << String.toUpper)
                    middleLetter
                , (text << String.toUpper)
                    (String.right 2 remaining)
                , button [ onClickStopPropagation (DeleteAttempt attempt) ]
                    [ text "X" ]
                ]

        TwoGuesses firstGuess secondGuess ->
            div [ Attributes.class "attempt", Attributes.class "twoguesses", Events.onClick (SelectAttempt attempt) ]
                [ b [] [ text <| String.toUpper <| Guess.toString firstGuess ++ " - " ++ Guess.toString secondGuess ]
                , button [ Events.stopPropagationOn "click" <| Json.Decode.succeed ( DeleteAttempt attempt, True ) ] [ text "X" ]
                ]


onClickStopPropagation : msg -> Attribute msg
onClickStopPropagation =
    alwaysStopPropagationOn "click"


alwaysStopPropagationOn : String -> msg -> Attribute msg
alwaysStopPropagationOn event msg =
    Events.stopPropagationOn event
        (Json.Decode.succeed ( msg, True ))



-- All solutions


viewAllSolutions : State -> Html Msg
viewAllSolutions model =
    let
        viewComputerSolved computerSolutions =
            div [ Attributes.class "cheat" ]
                [ text <| "The computer found " ++ (String.fromInt << List.length) computerSolutions ++ " solutions. "
                , br [] []
                , if not <| model.cheat then
                    button [ Attributes.type_ "button", Events.onClick EnableCheat ] [ text "Show me!" ]

                  else
                    viewSolutions computerSolutions
                ]

        viewComputerStillSolving =
            div [ Attributes.class "cheat" ]
                [ text "The computer is solving... "
                , br [] []
                , button [ Attributes.type_ "button", Attributes.disabled True ] [ text "Show me!" ]
                ]

        viewNoPuzzleYet =
            div [ Attributes.class "cheat" ]
                [ text "The computer will try to solve your puzzle. "
                , br [] []
                , button [ Attributes.type_ "button", Attributes.disabled True ] [ text "Show me!" ]
                ]
    in
    case ( model.puzzle, model.computerSolutions ) of
        ( Nothing, _ ) ->
            viewNoPuzzleYet

        ( Just _, Nothing ) ->
            viewComputerStillSolving

        ( Just _, Just computerSolutions ) ->
            viewComputerSolved computerSolutions


viewSolutions : List ComputerSolution -> Html msg
viewSolutions solutions =
    ul []
        (List.map (\solution -> li [] [ viewSolution solution ])
            solutions
        )


viewSolution : ComputerSolution -> Html msg
viewSolution (ComputerSolution first matches) =
    text
        (String.concat
            [ Guess.toString first
            , " "
            , "("
            , String.join ", "
                (List.map Guess.toString
                    matches
                )
            , ")"
            ]
        )
