module Main exposing (main)

import Browser
import Cheat
import Html exposing (..)
import Html.Attributes exposing (..)
import Html.Events exposing (..)
import Html.Lazy
import Json.Decode
import Nineagram exposing (NineagramPuzzle)
import Nineagram.Guess exposing (Guess)


main : Program () Model Msg
main =
    Browser.sandbox
        { init = init
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
    , attempts = []
    , currentAttempt = NoGuesses
    , defaultAttempt = NoGuesses
    , typingGuess = ""
    , cheat = False
    }



-- UPDATE


type Msg
    = TypedPuzzleLetters String
    | SubmittedPuzzleLetters
    | Reset
    | TypingGuess String
    | SubmitAttempt NineagramPuzzle
    | SelectAttempt Attempt
    | SelectDefaultAttempt
    | DeleteAttempt Attempt
    | EnableCheat


update : Msg -> Model -> Model
update msg model =
    case msg of
        TypedPuzzleLetters letters ->
            { model | letters = letters |> String.toUpper }

        SubmittedPuzzleLetters ->
            case Nineagram.fromString model.letters of
                Ok puzzle ->
                    { init
                        | puzzle = Just puzzle
                        , attempts = []
                        , letters = String.toUpper model.letters
                    }

                Err problems ->
                    { model | problems = problems }

        TypingGuess typing ->
            { model | typingGuess = String.toUpper typing }

        SubmitAttempt puzzle ->
            case Nineagram.Guess.fromString model.typingGuess of
                Err problems ->
                    model

                Ok newGuess ->
                    if not <| Nineagram.isValidGuess puzzle newGuess then
                        model

                    else
                        case model.currentAttempt of
                            OneGuess firstGuess ->
                                let
                                    newAttempt =
                                        if Nineagram.isSolution puzzle firstGuess newGuess then
                                            TwoGuesses firstGuess newGuess

                                        else
                                            OneGuess newGuess
                                in
                                { model
                                    | attempts = [ newAttempt ] ++ model.attempts
                                    , currentAttempt = newAttempt
                                    , typingGuess = ""
                                }

                            _ ->
                                let
                                    newAttempt =
                                        OneGuess newGuess
                                in
                                { model
                                    | attempts = [ newAttempt ] ++ model.attempts
                                    , currentAttempt = newAttempt
                                    , typingGuess = ""
                                }

        SelectAttempt attempt ->
            { model | currentAttempt = attempt }

        DeleteAttempt attempt ->
            { model
                | attempts = model.attempts |> List.filter (\a -> a /= attempt)
                , currentAttempt =
                    if model.currentAttempt == attempt then
                        model.defaultAttempt

                    else
                        model.currentAttempt
            }

        EnableCheat ->
            { model | cheat = True }

        SelectDefaultAttempt ->
            { model | currentAttempt = model.defaultAttempt }

        Reset ->
            init


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
    div [ style "font-family" "Helvetica, Arial, sans-serif", style "font-size" "small" ]
        [ div []
            [ Html.form [ class "puzzleform", onSubmit SubmittedPuzzleLetters ]
                [ div [ class "lettersInput" ]
                    [ label [ for "puzzleLetters", style "margin" "10px" ] [ b [] [ text "Letters of your Nineagram" ] ]
                    , br [] []
                    , input
                        [ id "puzzleLetters"
                        , class "lettersInput"
                        , onInput TypedPuzzleLetters
                        , spellcheck False
                        , autocomplete False
                        , value model.letters
                        , disabled (model.puzzle /= Nothing)
                        ]
                        []
                    , div [] [ viewCreationProblems model.problems ]
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
            , Html.form [ onSubmit <| SubmitAttempt puzzle ]
                [ label [ for "guess" ] [ text "Guess a word" ]
                , br [] []
                , input
                    [ name "guess"
                    , class "lettersInput"
                    , autocomplete False
                    , spellcheck False
                    , disabled (model.puzzle == Nothing)
                    , value model.typingGuess
                    , onInput TypingGuess
                    ]
                    []
                , button [] [ text "Guess" ]
                ]
            , List.map (viewAttempt puzzle) model.attempts
                |> div [style "border-style" "solid", style "width" "280px", style "padding" "10px", style "border-radius" "10px", style "height" "300px", style "overflow-y" "auto" ] 
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
        |> div [ style "color" "red", style "font-size" "x-small", style "width" "max-content" ]


viewAttempt : NineagramPuzzle -> Attempt -> Html Msg
viewAttempt puzzle attempt =
    case attempt of
        NoGuesses ->
            div [ class "attempt", class "noguesses", onClick (SelectAttempt attempt) ] [ i [] [ text "New word" ] ]

        OneGuess guess ->
            let
                remaining =
                    Nineagram.remainingLetters puzzle guess
                        |> Maybe.map String.fromList
                        |> Maybe.withDefault ""

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
                |> List.filter (Nineagram.isValidGuess puzzle)
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


viewNineagramOneGuess : NineagramPuzzle -> Guess -> Html Msg
viewNineagramOneGuess puzzle guess =
    let
        remain =
            Nineagram.remainingLetters puzzle guess
                |> Maybe.withDefault []

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


viewSolutions : NineagramPuzzle -> List Guess -> Html Msg
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
