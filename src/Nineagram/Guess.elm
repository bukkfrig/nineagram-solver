module Nineagram.Guess exposing
    ( Guess
    , Problem(..)
    , fromString
    , getMiddleLetter
    , toList
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
        length =
            String.length guess
    in
    if length < 5 then
        Err [ TooShort length ]

    else if length > 5 then
        Err [ TooLong length ]

    else
        (Ok << Guess) (String.toLower guess)


toString : Guess -> String
toString (Guess s) =
    s

toList : Guess -> List Char
toList (Guess s) =
    String.toList s


getMiddleLetter : Guess -> Char
getMiddleLetter (Guess s) =
    case
        (String.slice 2 3 >> String.toList) s
    of
        [ letter ] ->
            letter

        _ ->
            ' '
