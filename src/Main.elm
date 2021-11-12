module Main exposing (main)

import Browser
import Browser.Dom
import Browser.Navigation
import Cheat
import Html exposing (Html, b, br, button, div, h1, i, input, label, li, text, ul)
import Html.Attributes
import Html.Events
import Json.Decode
import Nineagram exposing (NineagramPuzzle)
import Nineagram.Guess as Guess exposing (Guess)
import Ports
import Process
import Task exposing (Task)
import Url
import Url.Builder
import Url.Parser
import Url.Parser.Query


{-| The goal in solving a Nineagram puzzle is to find two five-letter words from
the nine letters provided that share the same middle letter.

For example, given AEEHPPRSS, one solution is PEARS and SHAPE:

        P
        E
    S H A P E
        R
        S

The main way that the Program assists the user is by displaying the remaining
letters after the player guesses at one of the words.

The Program can also find and display solutions by exhaustively searching its
own word list.

-}
main : Program () Model Msg
main =
    Browser.application
        { init = init
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
    | DefaultPuzzleLoaded LoadedModel


type alias LoadedModel =
    { defaultPuzzle : NineagramPuzzle
    , navigationKey : Browser.Navigation.Key
    , state : State
    }


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case model of
        DefaultPuzzleProblem ->
            ( model, Cmd.none )

        DefaultPuzzleLoaded loadedModel ->
            updateState msg loadedModel
                |> Tuple.mapFirst (\newState -> DefaultPuzzleLoaded { loadedModel | state = newState })


init : () -> Url.Url -> Browser.Navigation.Key -> ( Model, Cmd Msg )
init _ url key =
    case Nineagram.fromString "GRNAMNIEA" of
        Ok defaultPuzzle ->
            ( DefaultPuzzleLoaded
                { defaultPuzzle = defaultPuzzle
                , navigationKey = key
                , state = initState
                }
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
    { url | path = "" }
        |> Url.Parser.parse
            (Url.Parser.query (Url.Parser.Query.string target))
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


updateState : Msg -> LoadedModel -> ( State, Cmd Msg )
updateState msg { navigationKey, state } =
    case msg of
        Focussed _ _ ->
            ( state, Cmd.none )

        TypedPuzzleLetters letters ->
            ( { state | letters = letters |> String.toUpper }, Cmd.none )

        SubmitPuzzleLetters letters ->
            case Nineagram.fromString letters of
                Ok puzzle ->
                    startSolving navigationKey puzzle

                Err puzzleCreationProblems ->
                    ( { state | puzzleCreationProblems = puzzleCreationProblems }, Cmd.none )

        TypingGuess typing ->
            ( { state | guessInput = String.toUpper typing }, Cmd.none )

        SubmitAttempt puzzle typed ->
            case Guess.fromString (String.trim typed) of
                Ok newGuess ->
                    ( addAttempt { state | guessProblems = [] } puzzle newGuess, Cmd.none )

                Err guessProblems ->
                    ( { state | guessProblems = guessProblems, guessForPuzzleProblems = [] }, Cmd.none )

        SelectAttempt attempt ->
            ( { state | currentAttempt = attempt }, Cmd.none )

        DeleteAttempt attempt ->
            ( deleteAttempt attempt state, Cmd.none )

        EnableCheat ->
            ( { state | cheat = True }, Cmd.none )

        SelectDefaultAttempt ->
            ( { state | currentAttempt = state.defaultAttempt }, Cmd.none )

        Reset ->
            ( initState
            , Cmd.batch
                [ focus "puzzleLetters"
                , Ports.clearQuery ()
                ]
            )

        ComputerSolved solutions ->
            ( { state | computerSolutions = Just solutions }, Cmd.none )

        NoOp ->
            ( state, Cmd.none )


startSolving : Browser.Navigation.Key -> NineagramPuzzle -> ( State, Cmd Msg )
startSolving key puzzle =
    let
        letters =
            (String.fromList >> String.toUpper) (Nineagram.getLetters puzzle)
    in
    ( { initState
        | puzzle = Just puzzle
        , letters = letters
      }
    , Cmd.batch
        [ focus "guess"
        , solve ComputerSolved puzzle
        , Browser.Navigation.pushUrl key
            (Url.Builder.relative [] [ Url.Builder.string "letters" letters ])
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
                , guessInput = ""
                , currentAttempt = newAttempt
            }


deleteAttempt : Attempt -> State -> State
deleteAttempt attempt state =
    { state
        | attempts = List.filter (\a -> a /= attempt) state.attempts
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
        List.singleton
            (case model of
                DefaultPuzzleProblem ->
                    text "Sorry, something went wrong."

                DefaultPuzzleLoaded { defaultPuzzle, state } ->
                    viewState defaultPuzzle state
            )
    }


viewState : NineagramPuzzle -> State -> Html Msg
viewState defaultPuzzle model =
    let
        puzzle =
            Maybe.withDefault defaultPuzzle model.puzzle
    in
    div
        (Html.Attributes.class "nineagramSolver"
            :: keyHandlers model
        )
        [ viewPuzzleCreation model
        , viewNineagram puzzle model.currentAttempt
        , viewGuessing model puzzle
        , viewAttempts model puzzle
        , viewAllSolutions model
        , h1 [] [ text "Nineagram Solver" ]
        ]


keyHandlers : State -> List (Html.Attribute Msg)
keyHandlers model =
    case model.puzzle of
        Just _ ->
            [ Html.Events.on "keydown"
                (Html.Events.keyCode
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
        [ Html.Attributes.class "puzzleform"
        , Html.Events.onSubmit (SubmitPuzzleLetters model.letters)
        ]
        [ div [ Html.Attributes.class "lettersInput" ]
            [ label
                [ Html.Attributes.for "puzzleLetters" ]
                [ b [] [ text "Nineagram Letters" ] ]
            , br [] []
            , input
                [ Html.Attributes.type_ "text"
                , Html.Attributes.id "puzzleLetters"
                , Html.Attributes.class "lettersInput"
                , Html.Attributes.spellcheck False
                , Html.Attributes.autocomplete False
                , Html.Attributes.value model.letters
                , Html.Attributes.disabled (model.puzzle /= Nothing)
                , Html.Events.onInput TypedPuzzleLetters
                ]
                []
            , div
                [ Html.Attributes.class "creationProblems" ]
                [ viewCreationProblems model.puzzleCreationProblems ]
            ]
        , div []
            [ button
                [ Html.Attributes.disabled (model.puzzle /= Nothing) ]
                [ text "Submit" ]
            , button
                [ Html.Attributes.type_ "button"
                , Html.Events.onClick Reset
                ]
                [ text "Clear" ]
            ]
        ]


viewCreationProblems : List Nineagram.CreationProblem -> Html Msg
viewCreationProblems problems =
    div [ Html.Attributes.class "creationProblem" ]
        (List.map (\html -> div [] [ html ])
            (List.filterMap viewCreationProblem problems)
        )


viewCreationProblem : Nineagram.CreationProblem -> Maybe (Html msg)
viewCreationProblem problem =
    case problem of
        Nineagram.LettersTooFew 0 ->
            Nothing

        Nineagram.LettersTooFew n ->
            (Just << text << String.concat)
                [ "That's only "
                , String.fromInt n
                , " letters. A puzzle should have exactly nine letters."
                ]

        Nineagram.LettersTooMany n ->
            (Just << text << String.concat)
                [ "That's "
                , String.fromInt n
                , " letters. A puzzle should have exactly nine letters."
                ]

        Nineagram.ContainsNonAlphaCharacters firstNonAlpha _ ->
            (Just << text << String.concat)
                [ "That's got a '"
                , String.fromChar firstNonAlpha
                , "'. A puzzle should only have letters."
                ]



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
            (String.fromList >> String.toUpper)
                (Nineagram.getLetters puzzle
                    |> (List.take n >> List.drop (n - 1))
                )
    in
    div [ Html.Attributes.class "nineagram" ]
        [ letterbox { placeholder = letter 1, value = "" }
        , br [] []
        , letterbox { placeholder = letter 2, value = "" }
        , br [] []
        , letterbox { placeholder = letter 6, value = "" }
        , letterbox { placeholder = letter 7, value = "" }
        , letterbox { placeholder = letter 3, value = "" }
        , letterbox { placeholder = letter 8, value = "" }
        , letterbox { placeholder = letter 9, value = "" }
        , br [] []
        , letterbox { placeholder = letter 4, value = "" }
        , br [] []
        , letterbox { placeholder = letter 5, value = "" }
        ]


viewNineagramOneGuess : NineagramPuzzle -> Guess -> Html Msg
viewNineagramOneGuess puzzle guess =
    let
        remain n =
            (String.fromList >> String.toUpper)
                (Nineagram.remainingLetters puzzle guess
                    |> Result.map (List.take n >> List.drop (n - 1))
                    |> Result.withDefault []
                )

        guessed n =
            (String.fromList >> String.toUpper)
                ((Guess.toString >> String.toList) guess
                    |> (List.take n >> List.drop (n - 1))
                )
    in
    div [ Html.Attributes.class "nineagram" ]
        [ letterbox { placeholder = "", value = guessed 1 }
        , br [] []
        , letterbox { placeholder = "", value = guessed 2 }
        , br [] []
        , letterbox { placeholder = remain 1, value = "" }
        , letterbox { placeholder = remain 2, value = "" }
        , letterbox { placeholder = "", value = guessed 3 }
        , letterbox { placeholder = remain 3, value = "" }
        , letterbox { placeholder = remain 4, value = "" }
        , br [] []
        , letterbox { placeholder = "", value = guessed 4 }
        , br [] []
        , letterbox { placeholder = "", value = guessed 5 }
        ]


letterbox : { placeholder : String, value : String } -> Html Msg
letterbox { placeholder, value } =
    div [ Html.Attributes.class "letterbox" ]
        [ input
            [ Html.Attributes.type_ "text"
            , Html.Attributes.class "letter"
            , Html.Attributes.placeholder placeholder
            , Html.Attributes.value value
            ]
            []
        ]


viewNineagramTwoGuesses : NineagramPuzzle -> Guess -> Guess -> Html Msg
viewNineagramTwoGuesses _ first second =
    let
        letter guess n =
            (String.fromList >> String.toUpper)
                ((Guess.toString >> String.toList) guess
                    |> (List.take n >> List.drop (n - 1))
                )
    in
    div [ Html.Attributes.class "nineagram", Html.Attributes.class "solution" ]
        [ letterbox { placeholder = "", value = letter first 1 }
        , br [] []
        , letterbox { placeholder = "", value = letter first 2 }
        , br [] []
        , letterbox { placeholder = "", value = letter second 1 }
        , letterbox { placeholder = "", value = letter second 2 }
        , letterbox { placeholder = "", value = letter second 3 }
        , letterbox { placeholder = "", value = letter second 4 }
        , letterbox { placeholder = "", value = letter second 5 }
        , br [] []
        , letterbox { placeholder = "", value = letter first 4 }
        , br [] []
        , letterbox { placeholder = "", value = letter first 5 }
        ]



-- Guessing


viewGuessing : State -> NineagramPuzzle -> Html Msg
viewGuessing state puzzle =
    Html.form
        [ Html.Attributes.class "guessForm"
        , Html.Events.onSubmit (SubmitAttempt puzzle state.guessInput)
        ]
        [ label [ Html.Attributes.for "guess" ]
            [ b [] [ text "Next Guess" ] ]
        , br [] []
        , input
            [ Html.Attributes.id "guess"
            , Html.Attributes.name "guess"
            , Html.Attributes.class "lettersInput"
            , Html.Attributes.autocomplete False
            , Html.Attributes.spellcheck False
            , Html.Attributes.disabled (state.puzzle == Nothing)
            , Html.Attributes.value state.guessInput
            , Html.Events.onInput TypingGuess
            ]
            []
        , div [ Html.Attributes.class "guessProblems" ]
            [ viewGuessProblems state.guessProblems
            , viewGuessForPuzzleProblems state.guessForPuzzleProblems
            ]
        , button [] [ text "Guess" ]
        ]


viewGuessProblems : List Guess.Problem -> Html Msg
viewGuessProblems problems =
    div [ Html.Attributes.class "guessProblem" ]
        (List.map (\html -> div [] [ html ])
            (List.filterMap viewGuessProblem problems)
        )


viewGuessProblem : Guess.Problem -> Maybe (Html msg)
viewGuessProblem problem =
    case problem of
        Guess.TooShort 0 ->
            Nothing

        Guess.TooShort n ->
            (Just << text << String.concat)
                [ "That's only "
                , String.fromInt n
                , " letters. Your words should have exactly five letters."
                ]

        Guess.TooLong n ->
            (Just << text << String.concat)
                [ "That's "
                , String.fromInt n
                , " letters. Your words should have exactly five letters."
                ]


viewGuessForPuzzleProblems : List Nineagram.GuessProblem -> Html Msg
viewGuessForPuzzleProblems problems =
    div [ Html.Attributes.class "guessForPuzzleProblem" ]
        (List.map (\html -> div [] [ html ])
            (List.filterMap viewGuessForPuzzleProblem problems)
        )


viewGuessForPuzzleProblem : Nineagram.GuessProblem -> Maybe (Html msg)
viewGuessForPuzzleProblem (Nineagram.LetterNotFound letter) =
    (Just << text)
        ((\missingLetter -> "There aren't enough '" ++ missingLetter ++ "' for that word.")
            ((String.toUpper << String.fromChar) letter)
        )



-- Displaying attempts --


viewAttempts : State -> NineagramPuzzle -> Html Msg
viewAttempts model puzzle =
    div [ Html.Attributes.class "attempts" ]
        (List.map (viewAttempt puzzle) model.attempts)


viewAttempt : NineagramPuzzle -> Attempt -> Html Msg
viewAttempt puzzle attempt =
    case attempt of
        NoGuesses ->
            div
                [ Html.Attributes.class "attempt"
                , Html.Attributes.class "noguesses"
                , Html.Events.onClick (SelectAttempt attempt)
                ]
                [ i [] [ text "New word" ] ]

        OneGuess guess ->
            let
                remaining =
                    Nineagram.remainingLetters puzzle guess
                        |> Result.map String.fromList
                        |> Result.withDefault ""
            in
            div
                [ Html.Attributes.class "attempt"
                , Html.Attributes.class "oneguess"
                , Html.Events.onClick (SelectAttempt attempt)
                ]
                [ (b [] << List.singleton << text << String.toUpper)
                    (Guess.toString guess)
                , text
                    " - "
                , (text << String.toUpper)
                    (String.left 2 remaining)
                , (b [] << List.singleton << text << String.toUpper << String.fromChar)
                    (Guess.getMiddleLetter guess)
                , (text << String.toUpper)
                    (String.right 2 remaining)
                , button [ onClickStopPropagation (DeleteAttempt attempt) ]
                    [ text "x" ]
                ]

        TwoGuesses firstGuess secondGuess ->
            div
                [ Html.Attributes.class "attempt"
                , Html.Attributes.class "twoguesses"
                , Html.Events.onClick (SelectAttempt attempt)
                ]
                [ (b [] << List.singleton << text << String.toUpper)
                    (Guess.toString firstGuess)
                , text " - "
                , (b [] << List.singleton << text << String.toUpper)
                    (Guess.toString secondGuess)
                , button [ onClickStopPropagation (DeleteAttempt attempt) ]
                    [ text "x" ]
                ]


onClickStopPropagation : msg -> Html.Attribute msg
onClickStopPropagation =
    alwaysStopPropagationOn "click"


alwaysStopPropagationOn : String -> msg -> Html.Attribute msg
alwaysStopPropagationOn event msg =
    Html.Events.stopPropagationOn event
        (Json.Decode.succeed ( msg, True ))



-- All solutions


viewAllSolutions : State -> Html Msg
viewAllSolutions model =
    let
        viewComputerSolved computerSolutions =
            div [ Html.Attributes.class "cheat" ]
                [ (text << (\solutionCount -> "The computer found " ++ solutionCount ++ " solutions."))
                    ((String.fromInt << List.length) computerSolutions)
                , br [] []
                , if model.cheat then
                    viewSolutions computerSolutions

                  else
                    button [ Html.Attributes.type_ "button", Html.Events.onClick EnableCheat ]
                        [ text "Show me!" ]
                ]

        viewComputerStillSolving =
            div [ Html.Attributes.class "cheat" ]
                [ text "The computer is solving... "
                , br [] []
                , button
                    [ Html.Attributes.type_ "button"
                    , Html.Attributes.disabled True
                    ]
                    [ text "Show me!" ]
                ]

        viewNoPuzzleYet =
            div [ Html.Attributes.class "cheat" ]
                [ text "The computer will try to solve your puzzle. "
                , br [] []
                , button
                    [ Html.Attributes.type_ "button"
                    , Html.Attributes.disabled True
                    ]
                    [ text "Show me!" ]
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
        (List.map (\sln -> li [] [ viewSolution sln ])
            solutions
        )


{-| For example, "pears (heaps, phase, shape)"
-}
viewSolution : ComputerSolution -> Html msg
viewSolution (ComputerSolution first matches) =
    text
        ((\word words -> word ++ " (" ++ words ++ ")")
            (Guess.toString first)
            ((String.join ", " << List.map Guess.toString) matches)
        )
