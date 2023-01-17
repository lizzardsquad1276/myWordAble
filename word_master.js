const letters = document.querySelectorAll('.scoreboard-letter');
const loadingDiv = document.querySelector('.info-bar');
const ANSWER_LENGTH = 5;
const ROUNDS = 6;


async function init () {
    let currentGuess = '';
    let currentRow = 0;
    let isLoading = true;

    // menampilkan kata yang akan di tebak
    const res = await fetch("https://words.dev-apis.com/word-of-the-day?random=1");
    const resObj = await res.json();
    const word = resObj.word.toUpperCase();
    const wordParts = word.split("");
    let done = false;
    isLoading = false;
    setLoading(false);

    console.log(word);





    function addLetter(letter) {
        if(currentGuess.length < ANSWER_LENGTH) {
            //add letter to the end
            currentGuess += letter;
        } else {
            // replace the last letter
            currentGuess = currentGuess.substring(0, currentGuess.length - 1) + letter;
        }
        letters[ANSWER_LENGTH * currentRow + currentGuess.length - 1].innerText = letter;
    }

    async function commit () {
        if (currentGuess.length !== ANSWER_LENGTH) {
            // do nothing
            return;
        }

        isLoading = true;
        setLoading(true);
        const res = await fetch("https://words.dev-apis.com/validate-word", {
            method: "POST",
            body: JSON.stringify({ word: currentGuess })
        
        });
        
        const resObj = await res.json();
        const validWord = resObj.validWord;
        // const { validWord } = await res.json(); bisa dipakai juga
        isLoading = false;
        setLoading(false);

        if (!validWord) {
            markInvalidWord();
            return;
        }



        const guessParts = currentGuess.split("");
        const map = makeMap(wordParts);

        for (let i = 0; i < ANSWER_LENGTH; i++) {
             // marks as correct
             if (guessParts[i] === wordParts[i]) {
                letters[currentRow * ANSWER_LENGTH + i].classList.add("correct");
                map[guessParts[i]]--;
            }
        }

        for (let i = 0; i < ANSWER_LENGTH; i++) {
            // marks as incorrect
        }

        for (let i = 0; i < ANSWER_LENGTH; i++) {
            if (wordParts.includes(guessParts[i])) {
              // do nothing  
            } else if (wordParts.includes(guessParts[i]) && map[guessParts[i]] > 0) {
                // marks as close 
                letters[currentRow * ANSWER_LENGTH + i].classList.add("close");
                map[guessParts[i]]--;
            } else {
                letters[currentRow * ANSWER_LENGTH + i].classList.add("wrong");
            }   
        }


        // TODO did they win or lose?
        currentRow++;
        if (currentGuess === word) {
            //win
            alert('You win!');
            document.querySelector('.brand').classList.add("winner");
            done = true;
            return;
        } else if (currentRow === ROUNDS) {
            alert(`you lose, the word was ${word}`);
            done = true;
        }
        currentGuess = '';
    }

    function backspace () {
        currentGuess = currentGuess.substring(0, currentGuess.length - 1);
        letters[ANSWER_LENGTH * currentRow + currentGuess.length].innerText = "";
    }

    function markInvalidWord () {
        // alert('not a valid word');
        for (let i = 0; i < currentGuess.length; i++) {
            letters[currentRow * ANSWER_LENGTH + i].classList.remove("invalid");
            setTimeout(function() {
                letters[currentRow * ANSWER_LENGTH + i].classList.add("invalid");
            }, 10);
        }
    }

    document.addEventListener('keydown', function handleKeyPress (event) {
        if (done || isLoading) {
            // do nothing
            return;
        }
        
        const action = event.key;


        if (action === 'Enter') {
            commit ();
        } else if (action === 'Backspace') {
            backspace ();
        } else if (isLetter (action)) {
            addLetter(action.toUpperCase ())
        } else {
            // do nothing
        }
        });
    } 

    function isLetter(letter) {
        return /^[a-zA-Z]$/.test(letter);
    }

    function setLoading (isLoading) {
        loadingDiv.classList.toggle('show', isLoading);
    }

    function makeMap (array) {
        const obj = {};
        for (let i = 0; i < array.length; i++) {
            const letter = array[i];
            if (obj[letter]) {
                obj[letter]++;
            } else {
                obj[letter] = 1;
            }
        }
        return obj;
    }
init ();