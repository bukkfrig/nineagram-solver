module Nineagram exposing (CreationProblem(..), Guess, GuessProblem(..), NineagramPuzzle, fromCharList, fromString, getLetters, guessToString, hasSolutions, isSolution, isValidGuess, remainingLetters, solutions, stringToGuess)


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
                    -- <| "that's got a '" ++ String.fromChar firstNonLetter ++ "' and your puzzle should only have letters." ]
                   )
                ++ (let
                        length =
                            List.length letters
                    in
                    if length == 0 then
                        [ IsEmpty ]

                    else if length < 9 then
                        [ LettersTooFew length ]
                        -- <| "that's only " ++ apaStyleNumber length ++ " letters, and a puzzle should have exactly nine letters." ]

                    else if length > 9 then
                        [ LettersTooMany length ]
                        -- <| "that's " ++ apaStyleNumber length ++ " letters, and a puzzle should have exactly nine letters." ]

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


type Guess
    = Guess String


type CreationProblem
    = ContainsNonAlphaCharacters (List Char)
    | LettersTooFew Int
    | LettersTooMany Int
    | IsEmpty


type GuessProblem
    = GuessTooShort
    | GuessTooLong


stringToGuess : String -> Result (List GuessProblem) Guess
stringToGuess guess =
    let
        lowerCaseGuess =
            guess |> String.toLower
    in
    -- "Your guess should be exactly five letters." ]
    if String.length guess < 5 then
        Err [ GuessTooShort ]

    else if String.length guess > 5 then
        Err [ GuessTooLong ]

    else
        Ok <| Guess lowerCaseGuess


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
