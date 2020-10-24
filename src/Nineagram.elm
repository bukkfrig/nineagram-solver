module Nineagram exposing (Guess, NineagramPuzzle, ValidatedGuess(..), fromString, getLetters, guessToString, hasSolutions, isSolution, remainingLetters, solutions, stringToGuess, validateGuess)

-- EXPOSED


type NineagramPuzzle
    = NineagramPuzzle (List Char)


fromCharList : List Char -> Maybe NineagramPuzzle
fromCharList letters =
    let
        lowerCaseLetters =
            letters |> List.map Char.toLower
    in
    if List.all Char.isAlpha letters && List.length letters == 9 then
        Just <| NineagramPuzzle lowerCaseLetters

    else
        Nothing


fromString : String -> Maybe NineagramPuzzle
fromString letters =
    String.toList letters |> fromCharList


getLetters : NineagramPuzzle -> List Char
getLetters (NineagramPuzzle letters) =
    letters


type Guess
    = Guess String


stringToGuess : String -> Maybe Guess
stringToGuess guess =
    let
        lowerCaseGuess =
            guess |> String.toLower
    in
    if String.length guess == 5 then
        Just <| Guess lowerCaseGuess

    else
        Nothing


guessToString : Guess -> String
guessToString (Guess s) =
    s


type ValidatedGuess
    = ValidGuess (List Char)
    | InvalidGuess


hasSolutions : NineagramPuzzle -> List Guess -> Guess -> Bool
hasSolutions nineagram earlierGuesses guess =
    earlierGuesses |> List.any (\earlierGuess -> guess |> isSolution nineagram earlierGuess)


solutions : NineagramPuzzle -> List Guess -> Guess -> List Guess
solutions nineagram guesses guess =
    guesses |> List.filter (\otherguess -> guess |> isSolution nineagram otherguess)


isSolution : NineagramPuzzle -> Guess -> Guess -> Bool
isSolution (NineagramPuzzle puzzleLetters) guess otherGuess =
    if guessToString guess == guessToString otherGuess || getMiddleLetter guess /= getMiddleLetter otherGuess then
        False

    else
        case removeLetters puzzleLetters (guess |> guessToString |> String.toList) of
            Nothing ->
                False

            Just letters ->
                case removeLetters letters (otherGuess |> guessToString |> String.toList |> removeMiddleLetter) of
                    Nothing ->
                        False

                    Just [] ->
                        True

                    Just _ ->
                        False


validateGuess : NineagramPuzzle -> Guess -> ValidatedGuess
validateGuess nineagram guess =
    let
        lowerCaseGuess =
            case guess of
                Guess g ->
                    String.toLower g

        remaining =
            remainingLetters nineagram
    in
    if List.length (String.toList lowerCaseGuess) /= 5 then
        InvalidGuess

    else
        case remaining guess of
            Nothing ->
                InvalidGuess

            Just letters ->
                ValidGuess (String.toList lowerCaseGuess)



-- PRIVATE


remainingLetters : NineagramPuzzle -> Guess -> Maybe (List Char)
remainingLetters (NineagramPuzzle puzzleLetters) (Guess guess) =
    removeLetters puzzleLetters (String.toList guess)


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
getMiddleLetter (Guess guess) =
    guess
        |> String.toList
        |> List.take 3
        |> List.drop 2


removeMiddleLetter : List Char -> List Char
removeMiddleLetter guess =
    (guess |> List.take 2) ++ (guess |> List.drop 3)
