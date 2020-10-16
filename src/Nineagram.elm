module Nineagram exposing (Guess, Nineagram, ValidatedGuess(..), hasSolutions, removeLetters, solutions, validateGuess, isSolution)

-- EXPOSED


type alias Nineagram =
    List Char


type alias Guess =
    String


type ValidatedGuess
    = ValidGuess (List Char)
    | InvalidGuess


hasSolutions : Nineagram -> List Guess -> Guess -> Bool
hasSolutions nineagram guesses guess =
    guesses |> List.any (\otherguess -> guess |> isSolution nineagram otherguess)


solutions : Nineagram -> List Guess -> Guess -> List Guess
solutions nineagram guesses guess =
    guesses |> List.filter (\otherguess -> guess |> isSolution nineagram otherguess)


isSolution : Nineagram -> Guess -> Guess -> Bool
isSolution nineagram guess otherguess =
    if guess == otherguess || getMiddleLetter guess /= getMiddleLetter otherguess then
        False

    else
        case nineagram |> removeLetters (String.toList guess) of
            Nothing ->
                False

            Just letters ->
                case letters |> removeLetters (removeMiddleLetter (String.toList otherguess)) of
                    Nothing ->
                        False

                    Just [] ->
                        True

                    Just _ ->
                        False


validateGuess : Nineagram -> Guess -> ValidatedGuess
validateGuess nineagram guess =
    let
        remaining =
            remainingLetters nineagram
    in
    if List.length (String.toList guess) /= 5 then
        InvalidGuess

    else
        case remaining guess of
            Nothing ->
                InvalidGuess

            Just letters ->
                ValidGuess letters



-- PRIVATE


remainingLetters : Nineagram -> Guess -> Maybe (List Char)
remainingLetters nineagram guess =
    removeLetters (String.toList guess) nineagram


removeLetters : List Char -> List Char -> Maybe (List Char)
removeLetters lettersToRemove input =
    case lettersToRemove of
        [] ->
            Just input

        letterToRemove :: remainingLettersToRemove ->
            case removeLetter letterToRemove input of
                Nothing ->
                    Nothing

                Just inputWithLetterRemoved ->
                    removeLetters remainingLettersToRemove inputWithLetterRemoved


removeLetter : Char -> List Char -> Maybe (List Char)
removeLetter letter input =
    case input of
        [] ->
            Nothing

        x :: rest ->
            if letter == x then
                Just rest

            else
                case removeLetter letter rest of
                    Nothing ->
                        Nothing

                    Just remainingInput ->
                        Just (x :: remainingInput)


getMiddleLetter : Guess -> List Char
getMiddleLetter guess =
    guess
        |> String.toList
        |> List.take 3
        |> List.drop 2


removeMiddleLetter : List Char -> List Char
removeMiddleLetter guess =
    (guess |> List.take 2) ++ (guess |> List.drop 3)
