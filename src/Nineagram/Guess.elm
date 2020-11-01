module Nineagram.Guess exposing (Guess, Problem(..), fromString, toString)


type Guess
    = Guess String


type Problem
    = GuessTooShort
    | GuessTooLong


fromString : String -> Result (List Problem) Guess
fromString guess =
    if String.length guess < 5 then
        Err [ GuessTooShort ]

    else if String.length guess > 5 then
        Err [ GuessTooLong ]

    else
        Ok <| Guess <| String.toLower guess


toString : Guess -> String
toString (Guess s) =
    s
