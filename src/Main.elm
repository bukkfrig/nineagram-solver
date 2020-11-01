module Main exposing (main)

import Browser
import Cheat exposing (cheatWords)
import Html exposing (Attribute, Html, a, br, button, div, form, img, input, li, map, text, ul)
import Html.Attributes exposing (class, href, map, placeholder, src, style, value)
import Html.Events exposing (keyCode, on, onClick, onInput, onSubmit)
import Html.Lazy exposing (lazy)
import Json.Decode
import Nineagram exposing (CreationProblem(..), NineagramPuzzle, fromString, getLetters, isSolution, isValidGuess, remainingLetters)
import Nineagram.Guess exposing (Guess)



-- MAIN


main : Program () Model Msg
main =
    Browser.sandbox
        { init = init
        , update = update
        , view = view
        }



-- MODEL


type Model
    = CreatingPuzzle CreatingPuzzleModel
    | SolvingPuzzle SolvingModel


type alias CreatingPuzzleModel =
    { letters : String
    , problems : List CreationProblem
    }


type alias SolvingModel =
    { puzzle : NineagramPuzzle
    , attempts : List Attempt
    , currentAttempt : Attempt
    , defaultAttempt : Attempt
    , typingGuess : String
    , cheat : Bool
    }


init : Model
init =
    CreatingPuzzle
        { letters = ""
        , problems = []
        }


initSolving : NineagramPuzzle -> SolvingModel
initSolving puzzle =
    let
        emptyAttempt =
            NoGuesses
    in
    { puzzle = puzzle
    , attempts = [ emptyAttempt ]
    , currentAttempt = emptyAttempt
    , defaultAttempt = emptyAttempt
    , typingGuess = ""
    , cheat = False
    }


type Attempt
    = NoGuesses
    | OneGuess Guess
    | TwoGuesses Guess Guess



-- UPDATE


type Msg
    = CreatingMsg CreatingMsg
    | SolvingMsg SolvingMsg


type CreatingMsg
    = TypedLetters String
    | SubmitLetters


type SolvingMsg
    = TypingGuess String
    | SubmitAttempt
    | SelectAttempt Attempt
    | SelectDefaultAttempt
    | DeleteAttempt Attempt
    | EnableCheat


update : Msg -> Model -> Model
update msg model =
    case ( msg, model ) of
        ( CreatingMsg creatingMsg, CreatingPuzzle creatingModel ) ->
            updateCreating creatingMsg creatingModel

        ( SolvingMsg solvingMsg, SolvingPuzzle solvingModel ) ->
            updateSolving solvingMsg solvingModel

        ( CreatingMsg _, _ ) ->
            model

        ( SolvingMsg _, _ ) ->
            model


backspace : Int
backspace =
    8


updateCreating : CreatingMsg -> CreatingPuzzleModel -> Model
updateCreating msg model =
    case msg of
        TypedLetters letters ->
            CreatingPuzzle { model | letters = letters |> String.toUpper }

        SubmitLetters ->
            case Nineagram.fromString model.letters of
                Ok puzzle ->
                    SolvingPuzzle (initSolving puzzle)

                Err problems ->
                    CreatingPuzzle { model | problems = problems }


updateSolving : SolvingMsg -> SolvingModel -> Model
updateSolving msg model =
    case msg of
        TypingGuess typing ->
            SolvingPuzzle
                { model
                    | typingGuess = typing
                }

        SubmitAttempt ->
            case Nineagram.Guess.fromString model.typingGuess of
                Err problems ->
                    SolvingPuzzle model

                Ok newGuess ->
                    if isValidGuess model.puzzle newGuess then
                        case model.currentAttempt of
                            OneGuess firstGuess ->
                                let
                                    newAttempt =
                                        if isSolution model.puzzle firstGuess newGuess then
                                            TwoGuesses firstGuess newGuess

                                        else
                                            OneGuess newGuess
                                in
                                SolvingPuzzle
                                    { model
                                        | attempts = model.attempts ++ [ newAttempt ]
                                        , currentAttempt = newAttempt
                                        , typingGuess = ""
                                    }

                            _ ->
                                let
                                    newAttempt =
                                        OneGuess newGuess
                                in
                                SolvingPuzzle
                                    { model
                                        | attempts = model.attempts ++ [ newAttempt ]
                                        , currentAttempt = newAttempt
                                        , typingGuess = ""
                                    }

                    else
                        SolvingPuzzle model

        SelectAttempt attempt ->
            SolvingPuzzle { model | currentAttempt = attempt }

        DeleteAttempt attempt ->
            SolvingPuzzle
                { model
                    | attempts = model.attempts |> List.filter (\a -> a /= attempt)
                    , currentAttempt =
                        if model.currentAttempt == attempt then
                            model.defaultAttempt

                        else
                            model.currentAttempt
                }

        EnableCheat ->
            SolvingPuzzle { model | cheat = True }

        SelectDefaultAttempt ->
            SolvingPuzzle { model | currentAttempt = model.defaultAttempt }


onKeyHandler : Attribute SolvingMsg
onKeyHandler =
    let
        keyCodeDecoder =
            Html.Events.keyCode

        chooseMessage : Int -> Json.Decode.Decoder SolvingMsg
        chooseMessage code =
            let
                enter =
                    13

                escape =
                    27
            in
            if code == enter then
                Json.Decode.succeed SubmitAttempt

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
    case model of
        CreatingPuzzle creatingModel ->
            Html.map CreatingMsg <| viewCreating creatingModel

        SolvingPuzzle solvingModel ->
            Html.map SolvingMsg <| viewSolving solvingModel


viewCreating : CreatingPuzzleModel -> Html CreatingMsg
viewCreating model =
    form [ onSubmit SubmitLetters, style "font-family" "Helvetica, Arial, sans-serif" ]
        [ div [ style "margin" "10px" ]
            [ text "Enter puzzle letters"
            , br [] []
            , input
                [ onInput TypedLetters
                , style "font-family" "Courier New, monospace"
                , placeholder "e.g. AEEHPPRSS"
                , value model.letters
                ]
                []
            ]
        , div [ style "margin" "10px" ] [ viewCreationProblems model.problems ]
        ]


viewCreationProblems : List CreationProblem -> Html CreatingMsg
viewCreationProblems problems =
    let
        displayProblem : CreationProblem -> Maybe String
        displayProblem problem =
            case problem of
                LettersTooFew 0 ->
                    Nothing

                LettersTooFew n ->
                    Just <| "that's only " ++ String.fromInt n ++ " letters, and a puzzle should have exactly nine letters."

                LettersTooMany n ->
                    Just <| "that's " ++ String.fromInt n ++ " letters, and a puzzle should have exactly nine letters."

                ContainsNonAlphaCharacters first _ ->
                    Just <| "that's got a '" ++ String.fromChar first ++ "', and a puzzle should only have letters."
    in
    case List.filterMap displayProblem problems of
        [] ->
            text ""

        [ message ] ->
            div []
                [ text <| "Sorry, but " ++ message ]

        messages ->
            div []
                [ text "Sorry, but"
                , ul [] <| List.map (\message -> li [] [ text message ]) messages
                ]


viewSolving : SolvingModel -> Html SolvingMsg
viewSolving model =
    let
        cheatButton =
            button [ onClick EnableCheat ] [ text "Cheat" ]
    in
    div [ onKeyHandler ]
        [ div [] [ viewNineagram model.puzzle model.currentAttempt ]
        , input [ value model.typingGuess, onInput TypingGuess, placeholder "Guess..." ] []
        , ul [] <| List.map viewAttempt model.attempts
        , div [ class "cheat" ]
            [ text "All solutions:"
            , if model.cheat then
                lazy viewCheatSolutions model.puzzle

              else
                cheatButton
            ]
        ]


viewAttempt : Attempt -> Html SolvingMsg
viewAttempt attempt =
    case attempt of
        NoGuesses ->
            li []
                [ div [ onClick (SelectAttempt attempt) ] [ text "New attempt" ]
                , button [ onClick (DeleteAttempt attempt) ] [ text "X" ]
                ]

        OneGuess guess ->
            li []
                [ div [ onClick (SelectAttempt attempt) ] [ text <| Nineagram.Guess.toString guess ++ " - " ]
                , button [ onClick (DeleteAttempt attempt) ] [ text "X" ]
                ]

        TwoGuesses firstGuess secondGuess ->
            li []
                [ div [ onClick (SelectAttempt attempt) ] [ text <| Nineagram.Guess.toString firstGuess ++ " - " ++ Nineagram.Guess.toString secondGuess ]
                , button [ onClick (DeleteAttempt attempt) ] [ text "X" ]
                ]


viewCheatSolutions : NineagramPuzzle -> Html SolvingMsg
viewCheatSolutions puzzle =
    let
        cheatGuesses =
            Cheat.cheatWords
                |> List.filterMap (Result.toMaybe << Nineagram.Guess.fromString)
                |> List.filter (isValidGuess puzzle)
    in
    viewSolutions puzzle cheatGuesses


viewNineagram : NineagramPuzzle -> Attempt -> Html SolvingMsg
viewNineagram puzzle attempt =
    case attempt of
        NoGuesses ->
            viewNineagramNoGuesses puzzle

        OneGuess guess ->
            viewNineagramOneGuess puzzle guess

        TwoGuesses firstGuess secondGuess ->
            viewNineagramTwoGuesses puzzle ( firstGuess, secondGuess )


viewNineagramNoGuesses : NineagramPuzzle -> Html SolvingMsg
viewNineagramNoGuesses puzzle =
    let
        letter n =
            getLetters puzzle
                |> List.take n
                |> List.drop (n - 1)
                |> String.fromList
                |> String.toUpper

        guess n =
            ""
    in
    div [ class "nineagram" ]
        [ div [ class "letterbox" ] [ input [ class "letter", placeholder (letter 1), value (guess 1) ] [] ]
        , br [] []
        , div [ class "letterbox" ] [ input [ class "letter", placeholder (letter 2), value (guess 2) ] [] ]
        , br [] []
        , div [ class "letterbox" ] [ input [ class "letter", placeholder (letter 6), value (guess 6) ] [] ]
        , div [ class "letterbox" ] [ input [ class "letter", placeholder (letter 7), value (guess 7) ] [] ]
        , div [ class "letterbox" ] [ input [ class "letter", placeholder (letter 3), value (guess 3) ] [] ]
        , div [ class "letterbox" ] [ input [ class "letter", placeholder (letter 8), value (guess 8) ] [] ]
        , div [ class "letterbox" ] [ input [ class "letter", placeholder (letter 9), value (guess 9) ] [] ]
        , br [] []
        , div [ class "letterbox" ] [ input [ class "letter", placeholder (letter 4), value (guess 4) ] [] ]
        , br [] []
        , div [ class "letterbox" ] [ input [ class "letter", placeholder (letter 5), value (guess 5) ] [] ]
        ]


viewNineagramOneGuess : NineagramPuzzle -> Guess -> Html SolvingMsg
viewNineagramOneGuess puzzle guess =
    let
        remain =
            case remainingLetters puzzle guess of
                Just r ->
                    r

                Nothing ->
                    []

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
        [ div [ class "letterbox" ] [ input [ class "letter", placeholder (letter 1), value (guessLetter 1) ] [] ]
        , br [] []
        , div [ class "letterbox" ] [ input [ class "letter", placeholder (letter 2), value (guessLetter 2) ] [] ]
        , br [] []
        , div [ class "letterbox" ] [ input [ class "letter", placeholder (letter 6), value (guessLetter 6) ] [] ]
        , div [ class "letterbox" ] [ input [ class "letter", placeholder (letter 7), value (guessLetter 7) ] [] ]
        , div [ class "letterbox" ] [ input [ class "letter", placeholder (letter 3), value (guessLetter 3) ] [] ]
        , div [ class "letterbox" ] [ input [ class "letter", placeholder (letter 8), value (guessLetter 8) ] [] ]
        , div [ class "letterbox" ] [ input [ class "letter", placeholder (letter 9), value (guessLetter 9) ] [] ]
        , br [] []
        , div [ class "letterbox" ] [ input [ class "letter", placeholder (letter 4), value (guessLetter 4) ] [] ]
        , br [] []
        , div [ class "letterbox" ] [ input [ class "letter", placeholder (letter 5), value (guessLetter 5) ] [] ]
        ]


viewNineagramTwoGuesses : NineagramPuzzle -> ( Guess, Guess ) -> Html SolvingMsg
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
        [ div [ class "letterbox" ] [ input [ class "letter", placeholder (letter 1), value (firstGuessLetter 1) ] [] ]
        , br [] []
        , div [ class "letterbox" ] [ input [ class "letter", placeholder (letter 2), value (firstGuessLetter 2) ] [] ]
        , br [] []
        , div [ class "letterbox" ] [ input [ class "letter", placeholder (letter 6), value (secondGuessLetter 1) ] [] ]
        , div [ class "letterbox" ] [ input [ class "letter", placeholder (letter 7), value (secondGuessLetter 2) ] [] ]
        , div [ class "letterbox" ] [ input [ class "letter", placeholder (letter 3), value (secondGuessLetter 3) ] [] ]
        , div [ class "letterbox" ] [ input [ class "letter", placeholder (letter 8), value (secondGuessLetter 4) ] [] ]
        , div [ class "letterbox" ] [ input [ class "letter", placeholder (letter 9), value (secondGuessLetter 5) ] [] ]
        , br [] []
        , div [ class "letterbox" ] [ input [ class "letter", placeholder (letter 4), value (firstGuessLetter 4) ] [] ]
        , br [] []
        , div [ class "letterbox" ] [ input [ class "letter", placeholder (letter 5), value (firstGuessLetter 5) ] [] ]
        ]


viewSolutions : NineagramPuzzle -> List Guess -> Html SolvingMsg
viewSolutions puzzle guesses =
    let
        hasSolutions =
            Nineagram.hasSolutions puzzle guesses

        solutions =
            Nineagram.solutions puzzle guesses

        isValid =
            Nineagram.isValidGuess puzzle

        viewSolutionsForGuess guess =
            if isValid guess && hasSolutions guess then
                li [] [ text (Nineagram.Guess.toString guess ++ " (" ++ (solutions guess |> List.map Nineagram.Guess.toString |> String.join ", ") ++ ")") ]

            else
                text ""
    in
    ul [] <| List.map viewSolutionsForGuess guesses
