module Nineagram.Guess exposing (Guess, Problem(..), fromString, toString)


type Guess
    = Guess String


type Problem
    = GuessTooShort
    | GuessTooLong


fromString : String -> Result (List Problem) Guess
fromString guess =
    let
        lowerCaseGuess =
            guess |> String.toLower
    in
    if String.length guess < 5 then
        Err [ GuessTooShort ]

    else if String.length guess > 5 then
        Err [ GuessTooLong ]

    else
        Ok <| Guess lowerCaseGuess


toString : Guess -> String
toString (Guess s) =
    s
