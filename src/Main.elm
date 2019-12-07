module Main exposing (main)

import Browser
import Cheat exposing (cheatWords)
import Html exposing (Attribute, Html, button, div, input, li, map, text, ul)
import Html.Attributes exposing (placeholder, value)
import Html.Events exposing (keyCode, on, onClick, onInput)
import Html.Lazy exposing (lazy2)
import Json.Decode
import Nineagram exposing (Guess, Nineagram, ValidatedGuess(..), hasSolutions, solutions, validateGuess)



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
    { typingLetters : String }


type alias SolvingModel =
    { puzzle : Nineagram
    , guesses : List Guess
    , newGuess : Guess
    , cheat : Bool
    }


init : Model
init =
    CreatingPuzzle { typingLetters = "" }


initSolving : Nineagram -> SolvingModel
initSolving puzzle =
    { puzzle = puzzle
    , guesses = []
    , newGuess = ""
    , cheat = False
    }


type alias Puzzle =
    { letters : List Char }



-- UPDATE


type Msg
    = CreatingMsg CreatingMsg
    | SolvingMsg SolvingMsg


type CreatingMsg
    = TypingLetters String
    | CreatePuzzle String


type SolvingMsg
    = TypingGuess String
    | SubmitGuess String
    | EnableCheat


update : Msg -> Model -> Model
update msg model =
    case ( msg, model ) of
        ( CreatingMsg creatingMsg, CreatingPuzzle creatingModel ) ->
            updateCreating creatingMsg creatingModel

        ( SolvingMsg solvingMsg, SolvingPuzzle solvingModel ) ->
            updateSolving solvingMsg solvingModel

        ( _, _ ) ->
            model


updateCreating : CreatingMsg -> CreatingPuzzleModel -> Model
updateCreating msg model =
    case msg of
        TypingLetters typed ->
            { model | typingLetters = typed } |> CreatingPuzzle

        CreatePuzzle puzzleLetters ->
            puzzleLetters
                |> String.toList
                |> Nineagram
                |> initSolving
                |> SolvingPuzzle


updateSolving : SolvingMsg -> SolvingModel -> Model
updateSolving msg model =
    case msg of
        SubmitGuess newGuess ->
            SolvingPuzzle
                { model
                    | guesses = model.guesses ++ [ String.toLower newGuess ]
                    , newGuess = ""
                }

        TypingGuess typing ->
            SolvingPuzzle { model | newGuess = typing }

        EnableCheat ->
            SolvingPuzzle { model | cheat = True }


onEnter : CreatingMsg -> Attribute CreatingMsg
onEnter msg =
    let
        returnMsgOnlyIfEnter : Int -> Json.Decode.Decoder CreatingMsg
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
    keyCode
        |> Json.Decode.andThen returnMsgOnlyIfEnter
        |> on "keydown"


solvingOnEnter : SolvingMsg -> Attribute SolvingMsg
solvingOnEnter msg =
    let
        returnMsgOnlyIfEnter : Int -> Json.Decode.Decoder SolvingMsg
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
    keyCode
        |> Json.Decode.andThen returnMsgOnlyIfEnter
        |> on "keydown"



-- Decoder Int
-- VIEW


view : Model -> Html Msg
view model =
    case model of
        CreatingPuzzle creatingModel ->
            viewCreating creatingModel
                |> Html.map CreatingMsg

        SolvingPuzzle solvingModel ->
            viewSolving solvingModel
                |> Html.map SolvingMsg


viewCreating : CreatingPuzzleModel -> Html CreatingMsg
viewCreating model =
    div []
        [ div []
            [ input [ placeholder "Enter Nineagram letters...", onInput TypingLetters, onEnter (CreatePuzzle model.typingLetters) ] []
            , button [ onClick (CreatePuzzle model.typingLetters) ] [ text "Submit" ]
            ]
        ]


viewSolving : SolvingModel -> Html SolvingMsg
viewSolving model =
    div []
        [ div []
            [ input [ placeholder "Take a guess...", value model.newGuess, onInput TypingGuess, solvingOnEnter (SubmitGuess model.newGuess) ] []
            , button [ onClick (SubmitGuess model.newGuess) ] [ text "Submit" ]
            ]
        , div [] [ text (String.fromList model.puzzle.letters) ]
        , div []
            [ text "Your guesses:"
            , ul [] (List.map (\guess -> li [] [ viewGuess model.puzzle guess ]) model.guesses)
            ]
        , div []
            [ text "Your solutions:"
            , viewSolutions model.puzzle model.guesses
            ]
        , div []
            [ text "Cheat solutions:"
            , lazy2 viewCheat model.puzzle model.cheat
            ]
        ]


viewCheat : Nineagram -> Bool -> Html SolvingMsg
viewCheat nineagram cheat =
    case cheat of
        False ->
            button
                [ onClick EnableCheat ] 
                [ text "Show" ]

        True ->
            let
                viewAllSolutions =
                    viewSolutions nineagram

            in
                viewAllSolutions cheatWords
            


viewSolutions : Nineagram -> List Guess -> Html SolvingMsg
viewSolutions nineagram guesses =
    let
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
    guesses
        |> List.map viewGuessWithSolutions
        |> ul [] 


viewGuess : Nineagram -> Guess -> Html SolvingMsg
viewGuess nineagram guess =
    case validateGuess nineagram guess of
        InvalidGuess ->
            div [] [ text (guess ++ " - " ++ "Invalid guess!") ]

        ValidGuess letters ->
            div [] [ text (guess ++ " - " ++ String.fromList letters) ]
