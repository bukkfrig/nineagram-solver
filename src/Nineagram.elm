module Nineagram exposing (Guess, NineagramPuzzle, fromCharList, fromString, getLetters, guessToString, hasSolutions, isSolution, isValidGuess, remainingLetters, solutions, stringToGuess)


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


isValidGuess : NineagramPuzzle -> Guess -> Bool
isValidGuess nineagram guess =
    if (guess |> guessToString |> String.length) /= 5 then
        False

    else
        case remainingLetters nineagram guess of
            Nothing ->
                False

            Just letters ->
                True


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
