module Nineagram.Guess exposing
    ( Guess
    , Problem(..)
    , fromString
    , toString
    )

{-| A wrapper for a String of exactly five letters representing either of
two words that could form a solution to a Nineagram puzzle.
-}


type Guess
    = Guess String


type Problem
    = TooShort Int
    | TooLong Int


fromString : String -> Result (List Problem) Guess
fromString guess =
    let
        length = String.length guess
    in
    if length < 5 then
        Err [ TooShort length ]

    else if length > 5 then
        Err [ TooLong length ]

    else
        Ok <| Guess <| String.toLower guess


toString : Guess -> String
toString (Guess s) =
    s
