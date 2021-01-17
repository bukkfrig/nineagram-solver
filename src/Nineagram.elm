module Nineagram exposing
    ( CreationProblem(..)
    , GuessProblem(..)
    , NineagramPuzzle
    , fromCharList
    , fromString
    , getLetters
    , hasSolutions
    , isSolution
    , remainingLetters
    , solutions
    , validateGuess
    )

import Nineagram.Guess exposing (Guess)


type NineagramPuzzle
    = NineagramPuzzle (List Char)


fromCharList : List Char -> Result (List CreationProblem) NineagramPuzzle
fromCharList letters =
    let
        length =
            List.length letters

        checks =
            [ case List.filter (not << Char.isAlpha) letters of
                x :: xs ->
                    Just
                        (ContainsNonAlphaCharacters x xs)

                [] ->
                    Nothing
            , if length < 9 then
                Just
                    (LettersTooFew length)

              else if length > 9 then
                Just
                    (LettersTooMany length)

              else
                Nothing
            ]

        problems =
            checks
                |> List.filterMap identity
                
    in
    if problems == [] then
        Ok
            (letters
                |> List.map Char.toLower
                |> NineagramPuzzle
            )

    else
        Err problems


fromString : String -> Result (List CreationProblem) NineagramPuzzle
fromString letters =
    letters
        |> String.trim
        |> String.toList
        |> fromCharList


getLetters : NineagramPuzzle -> List Char
getLetters (NineagramPuzzle letters) =
    letters


{-| Reason why a Nineagram isn't valid from the supplied List Char.
-}
type CreationProblem
    = ContainsNonAlphaCharacters Char (List Char)
    | LettersTooFew Int
    | LettersTooMany Int


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
            Err _ ->
                False

            Ok letters ->
                case removeLetters letters (otherGuess |> Nineagram.Guess.toString |> String.toList |> removeMiddleLetter) of
                    Err _ ->
                        False

                    Ok [] ->
                        True

                    Ok _ ->
                        False


type GuessProblem
    = LetterNotFound Char


validateGuess : NineagramPuzzle -> Guess -> Result (List GuessProblem) ()
validateGuess nineagram guess =
    case remainingLetters nineagram guess of
        Ok _ ->
            Ok ()

        Err problems ->
            Err problems


remainingLetters : NineagramPuzzle -> Guess -> Result (List GuessProblem) (List Char)
remainingLetters (NineagramPuzzle puzzleLetters) guess =
    removeLetters puzzleLetters (String.toList <| Nineagram.Guess.toString guess)


removeLetters : List Char -> List Char -> Result (List GuessProblem) (List Char)
removeLetters input lettersToRemove =
    case lettersToRemove of
        [] ->
            Ok input

        x :: rest ->
            case removeLetter input x of
                Err problem ->
                    Err [ problem ]

                Ok inputWithXRemoved ->
                    removeLetters inputWithXRemoved rest


removeLetter : List Char -> Char -> Result GuessProblem (List Char)
removeLetter input letter =
    case input of
        [] ->
            Err (LetterNotFound letter)

        x :: rest ->
            if x == letter then
                Ok rest

            else
                case removeLetter rest letter of
                    Err err ->
                        Err err

                    Ok remainingInput ->
                        Ok (x :: remainingInput)


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
