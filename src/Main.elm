module Main exposing (main)

import Browser
import Cheat exposing (cheatWords)
import Html exposing (Attribute, Html, button, div, input, li, text, ul)
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


type alias Model =
    { nineagram : Nineagram
    , guesses : List Guess
    , newguess : Guess
    , newLetters : String
    , cheat : Bool
    }


init : Model
init =
    { nineagram = { letters = [] }
    , guesses = []
    , newguess = ""
    , newLetters = ""
    , cheat = False
    }



-- UPDATE


type Msg
    = TypingGuess String
    | SubmitGuess String
    | TypingLetters String
    | SubmitLetters String
    | EnableCheat


update : Msg -> Model -> Model
update msg model =
    case msg of
        SubmitGuess newGuess ->
            { model
                | guesses = model.guesses ++ [ String.toLower newGuess ]
                , newguess = ""
            }

        TypingGuess typing ->
            { model | newguess = typing }

        TypingLetters typing ->
            { model | newLetters = typing }

        SubmitLetters newLetters ->
            { model | nineagram = { letters = newLetters |> String.toLower |> String.toList } }

        EnableCheat ->
            { model | cheat = True }


onEnter : Msg -> Attribute Msg
onEnter msg =
    let
        returnMsgOnlyIfEnter : Int -> Json.Decode.Decoder Msg
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
    let
        letters =
            model.nineagram.letters

        guesses =
            model.guesses

        newLetters =
            model.newLetters

        newguess =
            model.newguess

        cheat =
            model.cheat

        viewguess =
            viewGuess model.nineagram

        viewsolutions =
            viewSolutions model.nineagram
    in
    case model.nineagram.letters of
        [] ->
            div []
                [ div []
                    [ input [ placeholder "Enter Nineagram letters...", onInput TypingLetters, onEnter (SubmitLetters newLetters) ] []
                    , button [ onClick (SubmitLetters newLetters) ] [ text "Submit" ]
                    ]
                ]

        _ ->
            div []
                [ div []
                    [ input [ placeholder "Take a guess...", value newguess, onInput TypingGuess, onEnter (SubmitGuess newguess) ] []
                    , button [ onClick (SubmitGuess newguess) ] [ text "Submit" ]
                    ]
                , div [] [ text (String.fromList letters) ]
                , div []
                    [ text "Your guesses:"
                    , ul [] (List.map (\guess -> li [] [ viewguess guess ]) guesses)
                    ]
                , div []
                    [ text "Your solutions:"
                    , viewsolutions guesses
                    ]
                , div []
                    [ text "Cheat solutions:"
                    , lazy2 viewCheat model.nineagram cheat
                    ]
                ]


viewCheat : Nineagram -> Bool -> Html Msg
viewCheat nineagram cheat =
    case cheat of
        False ->
            button [ onClick EnableCheat ] [ text "Show" ]

        True ->
            viewSolutions nineagram cheatWords


viewSolutions : Nineagram -> List Guess -> Html Msg
viewSolutions nineagram guesses =
    ul []
        (guesses
            |> List.map
                (\guess ->
                    case validateGuess nineagram guess of
                        ValidGuess _ ->
                            if guess |> hasSolutions nineagram guesses then
                                li [] [ text (guess ++ " (" ++ (guess |> solutions nineagram guesses |> String.join ", ") ++ ")") ]

                            else
                                text ""

                        InvalidGuess ->
                            text ""
                )
        )


viewGuess : Nineagram -> Guess -> Html msg
viewGuess nineagram guess =
    case validateGuess nineagram guess of
        InvalidGuess ->
            div [] [ text (guess ++ " - " ++ "Invalid guess!") ]

        ValidGuess letters ->
            div [] [ text (guess ++ " - " ++ String.fromList letters) ]
