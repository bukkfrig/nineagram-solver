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

import Nineagram.Guess as Guess exposing (Guess)


type NineagramPuzzle
    = NineagramPuzzle (List Char)


fromCharList : List Char -> Result (List CreationProblem) NineagramPuzzle
fromCharList letters =
    let
        problems =
            let
                length =
                    List.length letters
            in
            List.filterMap identity
                [ case List.filter (not << Char.isAlpha) letters of
                    x :: xs ->
                        Just (ContainsNonAlphaCharacters x xs)

                    [] ->
                        Nothing
                , if length < 9 then
                    Just (LettersTooFew length)

                  else if length > 9 then
                    Just (LettersTooMany length)

                  else
                    Nothing
                ]
    in
    if problems == [] then
        (Ok << NineagramPuzzle) (List.map Char.toLower letters)

    else
        Err problems


fromString : String -> Result (List CreationProblem) NineagramPuzzle
fromString =
    String.trim >> String.toList >> fromCharList


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
    earlierGuesses
        |> List.any (\earlierGuess -> isSolution nineagram earlierGuess guess)


solutions : NineagramPuzzle -> List Guess -> Guess -> List Guess
solutions nineagram guesses guess =
    guesses
        |> List.filter (isSolution nineagram guess)


isSolution : NineagramPuzzle -> Guess -> Guess -> Bool
isSolution (NineagramPuzzle puzzleLetters) first second =
    (Guess.getMiddleLetter first == Guess.getMiddleLetter second)
        && (List.sort (Guess.getMiddleLetter first :: puzzleLetters)
                == List.sort (Guess.toList first ++ Guess.toList second)
           )


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
    removeLettersFrom puzzleLetters
        (Guess.toList guess)


removeLettersFrom : List Char -> List Char -> Result (List GuessProblem) (List Char)
removeLettersFrom input lettersToRemove =
    case lettersToRemove of
        [] ->
            Ok input

        firstToRemove :: restToRemove ->
            removeLetterFrom input firstToRemove
                |> Result.mapError (\err -> [ err ])
                |> Result.andThen (\remaining -> removeLettersFrom remaining restToRemove)


removeLetterFrom : List Char -> Char -> Result GuessProblem (List Char)
removeLetterFrom input letter =
    case input of
        [] ->
            Err (LetterNotFound letter)

        first :: rest ->
            if first == letter then
                Ok rest

            else
                removeLetterFrom rest letter
                    |> Result.map ((::) first)
