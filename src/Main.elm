module Main exposing (main)

import Browser
import Cheat exposing (cheatWords)
import Html exposing (Attribute, Html, a, br, button, div, img, input, li, map, text, ul)
import Html.Attributes exposing (class, href, map, placeholder, src, value)
import Html.Events exposing (keyCode, on, onClick, onInput)
import Html.Lazy exposing (lazy2)
import Json.Decode
import Nineagram exposing (Guess, Nineagram, ValidatedGuess(..), removeLetters, validateGuess)



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
    { puzzle : Puzz
    , guesses : List Guess
    , newGuess : Guess
    , cheat : Bool
    }


init : Model
init =
    CreatingPuzzle { letters = "" }


initSolving : Puzz -> SolvingModel
initSolving puzzle =
    { puzzle = puzzle
    , guesses = [ "" ]
    , newGuess = ""
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
    | SubmitGuess String
    | DeleteGuess String
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


enter : Int
enter =
    13


updateCreating : CreatingMsg -> CreatingPuzzleModel -> Model
updateCreating msg model =
    case msg of
        Keyed char ->
            if Char.isAlpha char then
                CreatingPuzzle { model | letters = String.toList model.letters ++ [ char ] |> String.fromList }

            else if Char.toCode char == backspace then
                CreatingPuzzle { model | letters = String.toList model.letters |> List.take (String.length model.letters - 1) |> String.fromList }

            else if Char.toCode char == enter then
                let
                    newPuzzle =
                        puzzleFromString model.letters
                in
                case newPuzzle of
                    ValidPuzz _ ->
                        initSolving newPuzzle |> SolvingPuzzle

                    InvalidPuzzle ->
                        CreatingPuzzle model

            else
                CreatingPuzzle model


updateSolving : SolvingMsg -> SolvingModel -> Model
updateSolving msg model =
    case msg of
        TypingGuess typing ->
            SolvingPuzzle
                { model
                    | newGuess = typing |> String.toUpper
                }

        SubmitGuess guess ->
            SolvingPuzzle { model | guesses = model.guesses ++ [ guess ], newGuess = "" }

        DeleteGuess guess ->
            SolvingPuzzle { model | guesses = model.guesses |> List.filter (\g -> g /= guess) }

        EnableCheat ->
            SolvingPuzzle { model | cheat = True }


onEnter : msg -> Attribute msg
onEnter msg =
    let
        returnMsgOnlyIfEnter : Int -> Json.Decode.Decoder msg
        returnMsgOnlyIfEnter code =
            if code == 13 then
                Json.Decode.succeed msg
                -- Msg -> Decoder Msg
                -- (Decoder Msg that always returns OK Msg)

            else
                Json.Decode.fail "not ENTER"

        -- String -> Decoder Msg
        -- (Decoder Msg that always returns Err String and never Ok Msg)
    in
    -- Json.Decode.andThen : (a -> Decoder b) -> Decoder a -> Decoder b
    on "keydown" (keyCode |> Json.Decode.andThen returnMsgOnlyIfEnter)



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
    case model.puzzle of
        ValidPuzz letters ->
            let
                cheatButton =
                    button [ onClick EnableCheat ] [ text "Cheat" ]
            in
            div []
                [ div [ onEnter <| SubmitGuess model.newGuess ] [ input [ value model.newGuess, onInput TypingGuess, placeholder "Guess..." ] [] ]
                , div [] <| List.map (viewNineagram letters) model.guesses
                , div [ class "cheat" ]
                    [ text "All solutions:"
                    , if model.cheat then
                        lazy2 viewSolutions letters Cheat.cheatWords

                      else
                        cheatButton
                    ]
                ]

        InvalidPuzzle ->
            text ""

type Puzz
    = ValidPuzz PuzzleLetters
    | InvalidPuzzle


type PuzzleLetters
    = PuzzleLetters (List Char)


puzzleFromString : String -> Puzz
puzzleFromString str =
    if String.length str == 9 then
        ValidPuzz (PuzzleLetters <| String.toList <| String.toUpper str)

    else
        InvalidPuzzle


viewNineagram : PuzzleLetters -> Guess -> Html SolvingMsg
viewNineagram puzzleLetters currentGuess =
    let
        letters =
            case puzzleLetters of
                PuzzleLetters x ->
                    x

        remain =
            case removeLetters (String.toList currentGuess) letters of
                Just r ->
                    r

                Nothing ->
                    []

        letter n =
            (List.repeat (String.length currentGuess) ' ' ++ remain)
                |> List.take n
                |> List.drop (n - 1)
                |> String.fromList

        guess n =
            currentGuess |> String.toList |> List.take n |> List.drop (n - 1) |> String.fromList
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


viewSolutions : PuzzleLetters -> List Guess -> Html SolvingMsg
viewSolutions puzzleLetters guesses =
    let
        nineagram =
            case puzzleLetters of
                PuzzleLetters x ->
                    List.map Char.toLower x
                    
        validate guess =
            validateGuess nineagram guess

        hasSolutions guess =
            Nineagram.hasSolutions nineagram guesses guess

        solutions guess =
            Nineagram.solutions nineagram guesses guess

        viewGuessWithSolutions guess =
            case validate guess of
                ValidGuess _ ->
                    if hasSolutions guess then
                        li [] [ text (guess ++ " (" ++ (solutions guess |> String.join ", ") ++ ")") ]

                    else
                        text ""

                InvalidGuess ->
                    text ""
    in
    ul [] <| List.map viewGuessWithSolutions guesses
