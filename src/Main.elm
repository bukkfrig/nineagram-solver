module Main exposing (main)

import Browser
import Cheat exposing (cheatWords)
import Html exposing (Attribute, Html, a, br, button, div, img, input, li, map, text, ul)
import Html.Attributes exposing (class, href, map, placeholder, src, value)
import Html.Events exposing (keyCode, on, onClick, onInput)
import Html.Lazy exposing (lazy)
import Json.Decode
import Nineagram exposing (Guess, NineagramPuzzle, ValidatedGuess(..), fromString, getLetters, guessToString, remainingLetters, stringToGuess, validateGuess)



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
    { letters : String }


type alias SolvingModel =
    { puzzle : NineagramPuzzle
    , guesses : List Guess
    , typingGuess : String
    , cheat : Bool
    }


init : Model
init =
    CreatingPuzzle { letters = "" }


initSolving : NineagramPuzzle -> SolvingModel
initSolving puzzle =
    { puzzle = puzzle
    , guesses = []
    , typingGuess = ""
    , cheat = False
    }



-- UPDATE


type Msg
    = CreatingMsg CreatingMsg
    | SolvingMsg SolvingMsg


type CreatingMsg
    = Keyed Char


type SolvingMsg
    = TypingGuess String
    | SubmitGuess (Maybe Guess)
    | DeleteGuess Guess
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
    let
        enter =
            13
    in
    case msg of
        Keyed char ->
            if Char.isAlpha char then
                CreatingPuzzle { model | letters = String.toList model.letters ++ [ char ] |> String.fromList }

            else if Char.toCode char == backspace then
                CreatingPuzzle { model | letters = String.toList model.letters |> List.take (String.length model.letters - 1) |> String.fromList }

            else if Char.toCode char == enter then
                let
                    maybePuzzle =
                        Nineagram.fromString model.letters
                in
                case maybePuzzle of
                    Just puzzle ->
                        SolvingPuzzle (initSolving puzzle)

                    Nothing ->
                        CreatingPuzzle model

            else
                CreatingPuzzle model


updateSolving : SolvingMsg -> SolvingModel -> Model
updateSolving msg model =
    case msg of
        TypingGuess typing ->
            SolvingPuzzle
                { model
                    | typingGuess = typing
                }

        SubmitGuess maybeGuess ->
            case maybeGuess of
                Nothing ->
                    SolvingPuzzle model

                Just guess ->
                    SolvingPuzzle { model | guesses = model.guesses ++ [ guess ], typingGuess = "" }

        DeleteGuess guess ->
            SolvingPuzzle { model | guesses = model.guesses |> List.filter (\g -> guessToString guess /= guessToString g) }

        EnableCheat ->
            SolvingPuzzle { model | cheat = True }


onEnter : msg -> Attribute msg
onEnter msg =
    let
        keyCodeDecoder =
            Html.Events.keyCode

        succeedIfEnter : a -> Int -> Json.Decode.Decoder a
        succeedIfEnter a code =
            let
                enter =
                    13
            in
            if code == enter then
                Json.Decode.succeed a

            else
                Json.Decode.fail "not ENTER"
    in
    -- Json.Decode.andThen : (a -> Decoder b) -> Decoder a -> Decoder b
    on "keydown" (keyCodeDecoder |> Json.Decode.andThen (succeedIfEnter msg))



-- VIEW


view : Model -> Html Msg
view model =
    case model of
        CreatingPuzzle creatingModel ->
            Html.map CreatingMsg <| viewCreating creatingModel

        SolvingPuzzle solvingModel ->
            Html.map SolvingMsg <| viewSolving solvingModel


getChar : (Char -> msg) -> Int -> Json.Decode.Decoder msg
getChar msgConstructor code =
    Json.Decode.succeed <| msgConstructor (Char.fromCode code)


viewCreating : CreatingPuzzleModel -> Html CreatingMsg
viewCreating model =
    let
        letters =
            case model.letters of
                "" ->
                    [ ' ' ]

                _ ->
                    String.toList model.letters
    in
    div
        [ on "keydown" (keyCode |> Json.Decode.andThen (getChar Keyed))
        , Html.Attributes.tabindex 0
        ]
        [ div [] (letters |> List.map (\char -> div [ class "letterbox" ] [ text (String.fromChar char) ]))
        ]


viewSolving : SolvingModel -> Html SolvingMsg
viewSolving model =
    let
        cheatButton =
            button [ onClick EnableCheat ] [ text "Cheat" ]
    in
    div []
        [ div [ onEnter <| SubmitGuess (stringToGuess model.typingGuess) ] [ input [ value model.typingGuess, onInput TypingGuess, placeholder "Guess..." ] [] ]
        , div [] <| List.map (viewNineagram model.puzzle) model.guesses
        , div [ class "cheat" ]
            [ text "All solutions:"
            , if model.cheat then
                lazy viewCheatSolutions model.puzzle

              else
                cheatButton
            ]
        ]


viewCheatSolutions : NineagramPuzzle -> Html SolvingMsg
viewCheatSolutions puzzle =
    let
        cheatGuesses =
            Cheat.cheatWords |> List.filterMap stringToGuess
    in
    viewSolutions puzzle cheatGuesses


viewNineagram : NineagramPuzzle -> Guess -> Html SolvingMsg
viewNineagram puzzle currentGuess =
    let
        remain =
            case remainingLetters puzzle currentGuess of
                Just r ->
                    r

                Nothing ->
                    []

        letter n =
            (List.repeat (String.length (guessToString currentGuess)) ' ' ++ remain)
                |> List.take n
                |> List.drop (n - 1)
                |> String.fromList
                |> String.toUpper

        guess n =
            currentGuess
                |> guessToString
                |> String.toList
                |> List.take n
                |> List.drop (n - 1)
                |> String.fromList
                |> String.toUpper
    in
    div [ class "nineagram" ]
        [ div [ class "delete-icon", onClick (DeleteGuess currentGuess) ] [ a [ href "#" ] [ img [ src "trash-can.svg" ] [] ] ]
        , div [ class "letterbox" ] [ input [ class "letter", placeholder (letter 1), value (guess 1) ] [] ]
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


viewSolutions : NineagramPuzzle -> List Guess -> Html SolvingMsg
viewSolutions puzzle guesses =
    let
        hasSolutions guess =
            Nineagram.hasSolutions puzzle guesses guess

        solutions guess =
            Nineagram.solutions puzzle guesses guess

        viewSolutionsForGuess guess =
            case Nineagram.validateGuess puzzle guess of
                ValidGuess _ ->
                    if hasSolutions guess then
                        li [] [ text (guessToString guess ++ " (" ++ (solutions guess |> List.map guessToString |> String.join ", ") ++ ")") ]

                    else
                        text ""

                InvalidGuess ->
                    text ""
    in
    ul [] <| List.map viewSolutionsForGuess guesses
