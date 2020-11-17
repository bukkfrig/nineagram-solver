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
    | SubmitAttempt NineagramPuzzle
    | SelectAttempt Attempt
    | SelectDefaultAttempt
    | DeleteAttempt Attempt
    | EnableCheat


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        Focussed what result ->
            ( model, Cmd.none )

        TypedPuzzleLetters letters ->
            ( { model | letters = letters |> String.toUpper }
            , Cmd.none
            )

        SubmitPuzzleLetters ->
            ( case Nineagram.fromString model.letters of
                Ok puzzle ->
                    { init
                        | puzzle = Just puzzle
                        , attempts = []
                        , letters = String.toUpper model.letters
                    }

                Err problems ->
                    { model | problems = problems }
            , Task.attempt (Focussed "guess") <| Browser.Dom.focus "guess"
            )

        TypingGuess typing ->
            ( { model | typingGuess = String.toUpper typing }
            , Cmd.none
            )

        SubmitAttempt puzzle ->
            let
                modelWithNoProblems =
                    { model | guessProblems = [], guessForPuzzleProblems = [] }
            in
            ( case Nineagram.Guess.fromString (String.trim model.typingGuess) of
                Err guessProblems ->
                    { modelWithNoProblems | guessProblems = guessProblems }

                Ok newGuess ->
                    case Nineagram.validateGuess puzzle newGuess of
                        Err problems ->
                            { modelWithNoProblems | guessForPuzzleProblems = problems }

                        Ok () ->
                            case model.currentAttempt of
                                OneGuess firstGuess ->
                                    let
                                        newAttempt =
                                            if Nineagram.isSolution puzzle firstGuess newGuess then
                                                TwoGuesses firstGuess newGuess

                                            else
                                                OneGuess newGuess
                                    in
                                    { modelWithNoProblems
                                        | attempts = newAttempt :: model.attempts
                                        , currentAttempt = newAttempt
                                        , typingGuess = ""
                                    }

                                _ ->
                                    let
                                        newAttempt =
                                            OneGuess newGuess
                                    in
                                    { modelWithNoProblems
                                        | attempts = newAttempt :: model.attempts
                                        , currentAttempt = newAttempt
                                        , typingGuess = ""
                                    }
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


onKeyHandler : NineagramPuzzle -> Attribute Msg
onKeyHandler puzzle =
    let
        keyCodeDecoder =
            Html.Events.keyCode

        chooseMessage : Int -> Json.Decode.Decoder Msg
        chooseMessage code =
            let
                enter =
                    13

                escape =
                    27
            in
            if code == enter then
                Json.Decode.succeed <| SubmitAttempt puzzle

            else if code == escape then
                Json.Decode.succeed SelectDefaultAttempt

            else
                Json.Decode.fail "other key"
    in
    -- Json.Decode.andThen : (a -> Decoder b) -> Decoder a -> Decoder b
    on "keydown" (keyCodeDecoder |> Json.Decode.andThen chooseMessage)



-- VIEW


view : Model -> Html Msg
view model =
    let
        puzzle =
            Maybe.withDefault Nineagram.defaultPuzzle model.puzzle
    in
    div [ class "nineagramSolver" ]
        [ div []
            [ Html.form [ class "puzzleform", onSubmit SubmitPuzzleLetters ]
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
                    ]
                , div []
                    [ button [ onClick Reset, type_ "button" ] [ text "Clear" ]
                    ]
                ]
            ]
        , div [ onKeyHandler puzzle ]
            [ div [] [ viewNineagram puzzle model.currentAttempt ]
            , Html.form [ onSubmit <| SubmitAttempt puzzle, class "guessForm" ]
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
            , div [ class "attempts" ] <| List.map (viewAttempt puzzle) model.attempts
            , div [ class "cheat" ]
                [ text "All solutions:"
                , if model.cheat then
                    Html.Lazy.lazy viewCheatSolutions puzzle

                  else
                    button
                        [ type_ "button"
                        , onClick EnableCheat
                        , disabled (model.puzzle == Nothing)
                        ]
                        [ text "Cheat" ]
                ]
            ]
        , h1 [] [ text "Nineagram Solver" ]
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
                , button [ onClick (DeleteAttempt attempt) ] [ text "X" ]
                ]

        TwoGuesses firstGuess secondGuess ->
            div [ class "attempt", class "twoguesses", onClick (SelectAttempt attempt) ]
                [ b [] [ text <| String.toUpper <| Nineagram.Guess.toString firstGuess ++ " - " ++ Nineagram.Guess.toString secondGuess ]
                , button [ onClick (DeleteAttempt attempt) ] [ text "X" ]
                ]


viewCheatSolutions : NineagramPuzzle -> Html Msg
viewCheatSolutions puzzle =
    let
        cheatGuesses =
            Cheat.cheatWords
                |> List.filterMap (Result.toMaybe << Nineagram.Guess.fromString)
                |> List.filter (\guess -> Nineagram.validateGuess puzzle guess == Ok ())
    in
    viewSolutions puzzle cheatGuesses


viewNineagram : NineagramPuzzle -> Attempt -> Html Msg
viewNineagram puzzle attempt =
    case attempt of
        NoGuesses ->
            viewNineagramNoGuesses puzzle

        OneGuess guess ->
            viewNineagramOneGuess puzzle guess

        TwoGuesses firstGuess secondGuess ->
            viewNineagramTwoGuesses puzzle ( firstGuess, secondGuess )


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


viewNineagramTwoGuesses : NineagramPuzzle -> ( Guess, Guess ) -> Html Msg
viewNineagramTwoGuesses puzzle ( firstGuess, secondGuess ) =
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


viewSolutions : NineagramPuzzle -> List Guess -> Html Msg
viewSolutions puzzle guesses =
    let
        hasSolutions =
            Nineagram.hasSolutions puzzle guesses

        solutions =
            Nineagram.solutions puzzle guesses

        isValid guess =
            Nineagram.validateGuess puzzle guess == Ok ()

        viewSolutionsForGuess guess =
            if isValid guess && hasSolutions guess then
                li [] [ text (Nineagram.Guess.toString guess ++ " (" ++ (solutions guess |> List.map Nineagram.Guess.toString |> String.join ", ") ++ ")") ]

            else
                text ""
    in
    ul [] <| List.map viewSolutionsForGuess guesses
