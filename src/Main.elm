module Main exposing (main)

import Browser
import Browser.Dom
import Cheat
import Html exposing (..)
import Html.Attributes exposing (..)
import Html.Events exposing (..)
import Html.Lazy
import Json.Decode
import Nineagram exposing (NineagramPuzzle)
import Nineagram.Guess exposing (Guess)
import Task


{-| The goal in solving a Nineagram puzzle is to find two five-letter words
from the nine letters provided that share the same middle letter.

For example, given AAEEHPPSS, one solution is PEARS and SHAPE:

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
    Browser.element
        { init = \flags -> ( init, Cmd.none )
        , subscriptions = \model -> Sub.none
        , update = update
        , view = view
        }



-- MODEL


type Attempt
    = NoGuesses
    | OneGuess Guess
    | TwoGuesses Guess Guess


type alias Model =
    { letters : String
    , problems : List Nineagram.CreationProblem
    , puzzle : Maybe NineagramPuzzle
    , guessProblems : List Nineagram.Guess.Problem
    , guessForPuzzleProblems : List Nineagram.GuessProblem
    , attempts : List Attempt
    , currentAttempt : Attempt
    , defaultAttempt : Attempt
    , typingGuess : String
    , cheat : Bool
    }


init : Model
init =
    { letters = ""
    , problems = []
    , puzzle = Nothing
    , guessProblems = []
    , guessForPuzzleProblems = []
    , attempts = []
    , currentAttempt = NoGuesses
    , defaultAttempt = NoGuesses
    , typingGuess = ""
    , cheat = False
    }



-- UPDATE


type Msg
    = Focussed String (Result Browser.Dom.Error ())
    | TypedPuzzleLetters String
    | SubmitPuzzleLetters
    | Reset
    | TypingGuess String
    | SubmitAttempt NineagramPuzzle String
    | SelectAttempt Attempt
    | SelectDefaultAttempt
    | DeleteAttempt Attempt
    | EnableCheat


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        Focussed what result ->
            -- NoOp, but the debugger will show what was focussed and whether it worked
            ( model, Cmd.none )

        TypedPuzzleLetters letters ->
            ( { model | letters = letters |> String.toUpper }, Cmd.none )

        SubmitPuzzleLetters ->
            case Nineagram.fromString model.letters of
                Ok puzzle ->
                    startSolving puzzle

                Err problems ->
                    ( { model | problems = problems }, Cmd.none )

        TypingGuess typing ->
            ( { model | typingGuess = String.toUpper typing }, Cmd.none )

        SubmitAttempt puzzle typed ->
            case Nineagram.Guess.fromString (String.trim typed) of
                Err guessProblems ->
                    ( { model | guessProblems = guessProblems, guessForPuzzleProblems = [] }
                    , Cmd.none
                    )

                Ok newGuess ->
                    ( addGuess { model | guessProblems = [] } puzzle newGuess
                    , Cmd.none
                    )

        SelectAttempt attempt ->
            ( { model | currentAttempt = attempt }
            , Cmd.none
            )

        DeleteAttempt attempt ->
            ( { model
                | attempts = model.attempts |> List.filter (\a -> a /= attempt)
                , currentAttempt =
                    if model.currentAttempt == attempt then
                        model.defaultAttempt

                    else
                        model.currentAttempt
              }
            , Cmd.none
            )

        EnableCheat ->
            ( { model | cheat = True }
            , Cmd.none
            )

        SelectDefaultAttempt ->
            ( { model | currentAttempt = model.defaultAttempt }
            , Cmd.none
            )

        Reset ->
            ( init, Cmd.none )


startSolving : NineagramPuzzle -> ( Model, Cmd Msg )
startSolving puzzle =
    ( { init
        | puzzle = Just puzzle
        , letters =
            puzzle
                |> Nineagram.getLetters
                |> String.fromList
                |> String.toUpper
      }
    , focus "guess"
    )


focus : String -> Cmd Msg
focus id =
    Task.attempt (Focussed id) (Browser.Dom.focus id)


addGuess : Model -> NineagramPuzzle -> Guess -> Model
addGuess model puzzle guess =
    case Nineagram.validateGuess puzzle guess of
        Err problems ->
            { model | guessForPuzzleProblems = problems }

        Ok () ->
            let
                newAttempt =
                    case model.currentAttempt of
                        OneGuess firstGuess ->
                            if Nineagram.isSolution puzzle firstGuess guess then
                                TwoGuesses firstGuess guess

                            else
                                OneGuess guess

                        _ ->
                            OneGuess guess
            in
            { model
                | guessForPuzzleProblems = []
                , attempts = newAttempt :: model.attempts
                , currentAttempt = newAttempt
                , typingGuess = ""
            }



-- VIEW


view : Model -> Html Msg
view model =
    let
        puzzle =
            Maybe.withDefault Nineagram.defaultPuzzle model.puzzle
    in
    div ([ class "nineagramSolver" ] ++ keyHandlers model)
        [ viewPuzzleCreation model
        , viewNineagram puzzle model.currentAttempt
        , viewGuessing model puzzle
        , viewAttempts model puzzle
        , viewAllSolutions model puzzle
        , h1 [] [ text "Nineagram Solver" ]
        ]


keyHandlers : Model -> List (Attribute Msg)
keyHandlers model =
    case model.puzzle of
        Just puzzle ->
            [ on "keydown"
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


viewPuzzleCreation : Model -> Html Msg
viewPuzzleCreation model =
    Html.form [ class "puzzleform", onSubmit SubmitPuzzleLetters ]
        [ div [ class "lettersInput" ]
            [ label [ for "puzzleLetters" ] [ b [] [ text "Nineagram Letters" ] ]
            , br [] []
            , input
                [ type_ "text"
                , id "puzzleLetters"
                , class "lettersInput"
                , onInput TypedPuzzleLetters
                , spellcheck False
                , autocomplete False
                , value model.letters
                , disabled (model.puzzle /= Nothing)
                ]
                []
            , div [ class "creationProblems" ] [ viewCreationProblems model.problems ]
            ]
        , div []
            [ button [ disabled (model.puzzle /= Nothing) ] [ text "Submit" ]
            , button [ onClick Reset, type_ "button" ] [ text "Clear" ]
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
        |> div [ class "creationProblem" ]



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

        guess n =
            ""
    in
    div [ class "nineagram" ]
        [ div [ class "letterbox" ] [ input [ type_ "text", class "letter", placeholder (letter 1), value (guess 1) ] [] ]
        , br [] []
        , div [ class "letterbox" ] [ input [ type_ "text", class "letter", placeholder (letter 2), value (guess 2) ] [] ]
        , br [] []
        , div [ class "letterbox" ] [ input [ type_ "text", class "letter", placeholder (letter 6), value (guess 6) ] [] ]
        , div [ class "letterbox" ] [ input [ type_ "text", class "letter", placeholder (letter 7), value (guess 7) ] [] ]
        , div [ class "letterbox" ] [ input [ type_ "text", class "letter", placeholder (letter 3), value (guess 3) ] [] ]
        , div [ class "letterbox" ] [ input [ type_ "text", class "letter", placeholder (letter 8), value (guess 8) ] [] ]
        , div [ class "letterbox" ] [ input [ type_ "text", class "letter", placeholder (letter 9), value (guess 9) ] [] ]
        , br [] []
        , div [ class "letterbox" ] [ input [ type_ "text", class "letter", placeholder (letter 4), value (guess 4) ] [] ]
        , br [] []
        , div [ class "letterbox" ] [ input [ type_ "text", class "letter", placeholder (letter 5), value (guess 5) ] [] ]
        ]


viewNineagramOneGuess : NineagramPuzzle -> Guess -> Html Msg
viewNineagramOneGuess puzzle guess =
    let
        remain =
            Nineagram.remainingLetters puzzle guess
                |> Result.withDefault []

        letter n =
            (List.repeat (String.length (Nineagram.Guess.toString guess)) ' ' ++ remain)
                |> List.take n
                |> List.drop (n - 1)
                |> String.fromList
                |> String.toUpper

        guessLetter n =
            guess
                |> Nineagram.Guess.toString
                |> String.toList
                |> List.take n
                |> List.drop (n - 1)
                |> String.fromList
                |> String.toUpper
    in
    div [ class "nineagram" ]
        [ div [ class "letterbox" ] [ input [ type_ "text", class "letter", placeholder (letter 1), value (guessLetter 1) ] [] ]
        , br [] []
        , div [ class "letterbox" ] [ input [ type_ "text", class "letter", placeholder (letter 2), value (guessLetter 2) ] [] ]
        , br [] []
        , div [ class "letterbox" ] [ input [ type_ "text", class "letter", placeholder (letter 6), value (guessLetter 6) ] [] ]
        , div [ class "letterbox" ] [ input [ type_ "text", class "letter", placeholder (letter 7), value (guessLetter 7) ] [] ]
        , div [ class "letterbox" ] [ input [ type_ "text", class "letter", placeholder (letter 3), value (guessLetter 3) ] [] ]
        , div [ class "letterbox" ] [ input [ type_ "text", class "letter", placeholder (letter 8), value (guessLetter 8) ] [] ]
        , div [ class "letterbox" ] [ input [ type_ "text", class "letter", placeholder (letter 9), value (guessLetter 9) ] [] ]
        , br [] []
        , div [ class "letterbox" ] [ input [ type_ "text", class "letter", placeholder (letter 4), value (guessLetter 4) ] [] ]
        , br [] []
        , div [ class "letterbox" ] [ input [ type_ "text", class "letter", placeholder (letter 5), value (guessLetter 5) ] [] ]
        ]


viewNineagramTwoGuesses : NineagramPuzzle -> Guess -> Guess -> Html Msg
viewNineagramTwoGuesses puzzle firstGuess secondGuess =
    let
        letter n =
            ""

        firstGuessLetter n =
            firstGuess
                |> Nineagram.Guess.toString
                |> String.toList
                |> List.take n
                |> List.drop (n - 1)
                |> String.fromList
                |> String.toUpper

        secondGuessLetter n =
            secondGuess
                |> Nineagram.Guess.toString
                |> String.toList
                |> List.take n
                |> List.drop (n - 1)
                |> String.fromList
                |> String.toUpper
    in
    div [ class "nineagram", class "solution" ]
        [ div [ class "letterbox" ] [ input [ type_ "text", class "letter", placeholder (letter 1), value (firstGuessLetter 1) ] [] ]
        , br [] []
        , div [ class "letterbox" ] [ input [ type_ "text", class "letter", placeholder (letter 2), value (firstGuessLetter 2) ] [] ]
        , br [] []
        , div [ class "letterbox" ] [ input [ type_ "text", class "letter", placeholder (letter 6), value (secondGuessLetter 1) ] [] ]
        , div [ class "letterbox" ] [ input [ type_ "text", class "letter", placeholder (letter 7), value (secondGuessLetter 2) ] [] ]
        , div [ class "letterbox" ] [ input [ type_ "text", class "letter", placeholder (letter 3), value (secondGuessLetter 3) ] [] ]
        , div [ class "letterbox" ] [ input [ type_ "text", class "letter", placeholder (letter 8), value (secondGuessLetter 4) ] [] ]
        , div [ class "letterbox" ] [ input [ type_ "text", class "letter", placeholder (letter 9), value (secondGuessLetter 5) ] [] ]
        , br [] []
        , div [ class "letterbox" ] [ input [ type_ "text", class "letter", placeholder (letter 4), value (firstGuessLetter 4) ] [] ]
        , br [] []
        , div [ class "letterbox" ] [ input [ type_ "text", class "letter", placeholder (letter 5), value (firstGuessLetter 5) ] [] ]
        ]



-- Guessing


viewGuessing : Model -> NineagramPuzzle -> Html Msg
viewGuessing model puzzle =
    Html.form [ onSubmit <| SubmitAttempt puzzle model.typingGuess, class "guessForm" ]
        [ label [ for "guess" ] [ b [] [ text "Next Guess" ] ]
        , br [] []
        , input
            [ id "guess"
            , name "guess"
            , class "lettersInput"
            , autocomplete False
            , spellcheck False
            , disabled (model.puzzle == Nothing)
            , value model.typingGuess
            , onInput TypingGuess
            ]
            []
        , div [ class "guessProblems" ]
            [ viewGuessProblems model.guessProblems
            , viewGuessForPuzzleProblems model.guessForPuzzleProblems
            ]
        , button [] [ text "Guess" ]
        ]


viewGuessProblems : List Nineagram.Guess.Problem -> Html Msg
viewGuessProblems problems =
    let
        displayProblem : Nineagram.Guess.Problem -> Maybe String
        displayProblem problem =
            case problem of
                Nineagram.Guess.GuessTooShort 0 ->
                    Nothing

                Nineagram.Guess.GuessTooShort n ->
                    Just <| "That's only " ++ String.fromInt n ++ " letters. Your words should have exactly five letters."

                Nineagram.Guess.GuessTooLong n ->
                    Just <| "That's " ++ String.fromInt n ++ " letters. Your words should have exactly five letters."
    in
    List.filterMap displayProblem problems
        |> List.map (\message -> div [] [ text message ])
        |> div [ class "guessProblem" ]


viewGuessForPuzzleProblems : List Nineagram.GuessProblem -> Html Msg
viewGuessForPuzzleProblems problems =
    let
        displayProblem : Nineagram.GuessProblem -> Maybe String
        displayProblem problem =
            case problem of
                Nineagram.LetterNotFound letter ->
                    Just <| "There aren't enough '" ++ (String.fromChar letter |> String.toUpper) ++ "' for that word."
    in
    List.filterMap displayProblem problems
        |> List.map (\message -> div [] [ text message ])
        |> div [ class "guessForPuzzleProblem" ]



-- Displaying attempts --


viewAttempts : Model -> NineagramPuzzle -> Html Msg
viewAttempts model puzzle =
    div [ class "attempts" ] <| List.map (viewAttempt puzzle) model.attempts


viewAttempt : NineagramPuzzle -> Attempt -> Html Msg
viewAttempt puzzle attempt =
    case attempt of
        NoGuesses ->
            div [ class "attempt", class "noguesses", onClick (SelectAttempt attempt) ] [ i [] [ text "New word" ] ]

        OneGuess guess ->
            let
                remaining =
                    Nineagram.remainingLetters puzzle guess
                        |> Result.map String.fromList
                        |> Result.withDefault ""

                middleLetter =
                    guess |> Nineagram.Guess.toString |> String.left 3 |> String.right 1
            in
            div [ class "attempt", class "oneguess", onClick (SelectAttempt attempt) ]
                [ b [] [ text <| String.toUpper <| Nineagram.Guess.toString guess ++ " - " ]
                , text <| String.toUpper <| String.left 2 remaining
                , b [] [ text <| String.toUpper <| middleLetter ]
                , text <| String.toUpper <| String.right 2 remaining
                , button [ stopPropagationOn "click" <| Json.Decode.succeed ( DeleteAttempt attempt, True ) ] [ text "X" ]
                ]

        TwoGuesses firstGuess secondGuess ->
            div [ class "attempt", class "twoguesses", onClick (SelectAttempt attempt) ]
                [ b [] [ text <| String.toUpper <| Nineagram.Guess.toString firstGuess ++ " - " ++ Nineagram.Guess.toString secondGuess ]
                , button [ stopPropagationOn "click" <| Json.Decode.succeed ( DeleteAttempt attempt, True ) ] [ text "X" ]
                ]



-- All solutions


viewAllSolutions : Model -> NineagramPuzzle -> Html Msg
viewAllSolutions model puzzle =
    div [ class "cheat" ]
        [ text "All solutions:"
        , if model.cheat then
            Html.Lazy.lazy viewSolutions puzzle

          else
            button
                [ type_ "button"
                , onClick EnableCheat
                , disabled (model.puzzle == Nothing)
                ]
                [ text "Cheat" ]
        ]


viewSolutions : NineagramPuzzle -> Html Msg
viewSolutions puzzle =
    let
        cheatGuesses =
            Cheat.cheatWords
                |> List.filterMap (Result.toMaybe << Nineagram.Guess.fromString)
                |> List.filter (\guess -> Nineagram.validateGuess puzzle guess == Ok ())

        viewSolutionsForGuess guess =
            case Nineagram.solutions puzzle cheatGuesses guess of
                [] ->
                    Nothing

                solutions ->
                    Just <| li [] [ text (Nineagram.Guess.toString guess ++ " (" ++ (solutions |> List.map Nineagram.Guess.toString |> String.join ", ") ++ ")") ]
    in
    List.filterMap viewSolutionsForGuess cheatGuesses
        |> ul []
