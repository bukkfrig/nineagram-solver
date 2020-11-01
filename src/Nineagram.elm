module Nineagram exposing (CreationProblem(..), NineagramPuzzle, fromCharList, fromString, getLetters, hasSolutions, isSolution, isValidGuess, remainingLetters, solutions)

import Nineagram.Guess exposing (Guess, Problem(..), fromString, toString)


type NineagramPuzzle
    = NineagramPuzzle (List Char)


fromCharList : List Char -> Result (List CreationProblem) NineagramPuzzle
fromCharList letters =
    let
        problems =
            []
                ++ (case List.filter (\c -> not <| Char.isAlpha c) letters of
                        [] ->
                            []

                        nonAlphaCharacters ->
                            [ ContainsNonAlphaCharacters nonAlphaCharacters ]
                   )
                ++ (let
                        length =
                            List.length letters
                    in
                    if length == 0 then
                        [ IsEmpty ]

                    else if length < 9 then
                        [ LettersTooFew length ]

                    else if length > 9 then
                        [ LettersTooMany length ]

                    else
                        []
                   )
    in
    case problems of
        [] ->
            Ok <| NineagramPuzzle <| List.map Char.toLower letters

        _ ->
            Err problems


apaStyleNumber : Int -> String
apaStyleNumber n =
    case n of
        1 ->
            "one"

        2 ->
            "two"

        3 ->
            "three"

        4 ->
            "four"

        5 ->
            "five"

        6 ->
            "six"

        7 ->
            "seven"

        8 ->
            "eight"

        9 ->
            "nine"

        _ ->
            String.fromInt n


fromString : String -> Result (List CreationProblem) NineagramPuzzle
fromString letters =
    letters
        |> String.trim
        |> String.toList
        |> fromCharList


getLetters : NineagramPuzzle -> List Char
getLetters (NineagramPuzzle letters) =
    letters


type CreationProblem
    = ContainsNonAlphaCharacters (List Char)
    | LettersTooFew Int
    | LettersTooMany Int
    | IsEmpty


hasSolutions : NineagramPuzzle -> List Guess -> Guess -> Bool
hasSolutions nineagram earlierGuesses guess =
    earlierGuesses |> List.any (\earlierGuess -> guess |> isSolution nineagram earlierGuess)


solutions : NineagramPuzzle -> List Guess -> Guess -> List Guess
solutions nineagram guesses guess =
    guesses |> List.filter (isSolution nineagram guess)


isSolution : NineagramPuzzle -> Guess -> Guess -> Bool
isSolution (NineagramPuzzle puzzleLetters) guess otherGuess =
    if getMiddleLetter guess /= getMiddleLetter otherGuess then
        False

    else
        case removeLetters puzzleLetters (guess |> Nineagram.Guess.toString |> String.toList) of
            Nothing ->
                False

            Just letters ->
                case removeLetters letters (otherGuess |> Nineagram.Guess.toString |> String.toList |> removeMiddleLetter) of
                    Nothing ->
                        False

                    Just [] ->
                        True

                    Just _ ->
                        False


isValidGuess : NineagramPuzzle -> Guess -> Bool
isValidGuess nineagram guess =
    if (guess |> Nineagram.Guess.toString |> String.length) /= 5 then
        False

    else
        case remainingLetters nineagram guess of
            Nothing ->
                False

            Just letters ->
                True


remainingLetters : NineagramPuzzle -> Guess -> Maybe (List Char)
remainingLetters (NineagramPuzzle puzzleLetters) guess =
    removeLetters puzzleLetters (String.toList <| Nineagram.Guess.toString guess)


removeLetters : List Char -> List Char -> Maybe (List Char)
removeLetters input lettersToRemove =
    case lettersToRemove of
        [] ->
            Just input

        x :: rest ->
            case removeLetter input x of
                Nothing ->
                    Nothing

                Just inputWithXRemoved ->
                    removeLetters inputWithXRemoved rest


removeLetter : List Char -> Char -> Maybe (List Char)
removeLetter input letter =
    case input of
        [] ->
            Nothing

        x :: rest ->
            if x == letter then
                Just rest

            else
                case removeLetter rest letter of
                    Nothing ->
                        Nothing

                    Just remainingInput ->
                        Just (x :: remainingInput)


getMiddleLetter : Guess -> List Char
getMiddleLetter guess =
    guess
        |> Nineagram.Guess.toString
        |> String.toList
        |> List.take 3
        |> List.drop 2


removeMiddleLetter : List Char -> List Char
removeMiddleLetter guess =
    (guess |> List.take 2) ++ (guess |> List.drop 3)
