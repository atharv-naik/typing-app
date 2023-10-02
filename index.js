// list of valid keys; alphabets, spaces, numbers and symbols
allowedKeys = [
  "a",
  "b",
  "c",
  "d",
  "e",
  "f",
  "g",
  "h",
  "i",
  "j",
  "k",
  "l",
  "m",
  "n",
  "o",
  "p",
  "q",
  "r",
  "s",
  "t",
  "u",
  "v",
  "w",
  "x",
  "y",
  "z",
  " ",
  "0",
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "-",
  "=",
  "[",
  "]",
  "\\",
  ";",
  "'",
  ",",
  ".",
  "/",
  "`",
  "~",
  "!",
  "@",
  "#",
  "$",
  "%",
  "^",
  "&",
  "*",
  "(",
  ")",
  "_",
  "+",
  "{",
  "}",
  "|",
  ":",
  '"',
  "<",
  ">",
  "?",
];

// list of special keys
specialKeys = [
  "Backspace",
  "Tab",
  "Enter",
  "Shift",
  "Control",
  "Alt",
  "CapsLock",
  "Escape",
  "ArrowLeft",
  "ArrowUp",
  "ArrowRight",
  "ArrowDown",
  "Delete",
];

text = document.querySelector("#text");

// load a random text sentence from the text array
textArray = ["The quick brown fox jumps over the lazy dog"];

// apply random background color on every page refresh
function applyRandomColor() {
  randomLightColor = Math.floor(Math.random() * 360);
  // avoid very light colors
  if (randomLightColor > 60 && randomLightColor < 120) {
    randomLightColor += 60;
  }
  document.body.style.backgroundColor = `hsl(${randomLightColor}, 100%, 80%)`;

  // apply a corresponding dark shade on current-letter
  randomDarkColor = Math.floor(Math.random() * 360) + 180;
  document.body.style.setProperty(
    "--current-letter-bg-color",
    `hsl(${randomDarkColor}, 100%, 30%)`
  );
  document.body.style.setProperty(
    "--light-color",
    `hsl(${randomLightColor}, 70%, 70%)`
  );
}

// function to get a random text from the text array
function getRandomText() {
  return textArray[Math.floor(Math.random() * textArray.length)];
}

function newText() {
  // remove all the children from the text div
  while (text.firstChild) {
    text.removeChild(text.firstChild);
  }
  // get a random text
  textSentence = getRandomText();
  // split the text into letters
  try {
    textSentenceArray = textSentence.split("");
  } catch {
    textSentenceArray = getRandomText().split("");
  }
  // create a span element for each letter and append it to the text div
  textSentenceArray.forEach((letter) => {
    let span = document.createElement("span");
    span.innerHTML = letter;
    text.appendChild(span);
  });
  // add the class current-letter to the first letter
  text.children[0].classList.add("current-letter");
  i = 0;
}

function updateWPM() {
  if (i == 0) {
    startTime = new Date();
    dataPoints = [];
  }
  if (i > 0) {
    endTime = new Date();
    timeElapsed = endTime - startTime;
    WPM = Math.round(i / (timeElapsed / 60000) / 5);
    document.querySelector("#score").innerText = WPM; // 60000 ms = 1 min; compute words per minute where 1 word = 5 characters
    dataPoints.push({
      x: timeElapsed / 1000,
      y: WPM,
    });
    drawGraph(dataPoints);
  }
}

// Plot wpm vs time graph
const wpmGraphCanvas = document.querySelector("#wpm-graph");
const wpmGraphContext = wpmGraphCanvas.getContext("2d");

// Draw the graph
function drawGraph(dataPoints) {
  wpmGraphContext.clearRect(0, 0, wpmGraphCanvas.width, wpmGraphCanvas.height); // Clear the canvas
  wpmGraphContext.beginPath();
  dataPoints.forEach((dataPoint) => {
    wpmGraphContext.lineTo(
      (dataPoint.x / dataPoints[dataPoints.length - 1].x) *
        wpmGraphCanvas.width,
      wpmGraphCanvas.height -
        (dataPoint.y /
          Math.max(...dataPoints.map((dataPoint) => dataPoint.y))) *
          wpmGraphCanvas.height
    );
  });
  wpmGraphContext.strokeStyle = "black";
  wpmGraphContext.lineWidth = 1;
  wpmGraphContext.stroke();
}

// EVENT LISTENERS //

document.addEventListener("keydown", function (event) {
  // the task is to listen for keydown and check if the key pressed is valid and equal to the current letter && !specialKeys.includes(event.key)
  // if it is then remove the class current-letter from current letter and add the class current-letter to the next letter
  // if it is not then add the class incorrect-letter to the current letter
  if (event.key === text.children[i].innerHTML) {
    text.children[i].classList.remove("current-letter");
    text.children[i].classList.remove("incorrect-letter");
    i++;
    if (i >= text.children.length) {
      level++;
      i = 0;
      newText();
      applyRandomColor();
    }
    text.children[i].classList.add("current-letter");
  } else if (
    allowedKeys.includes(event.key) &&
    !specialKeys.includes(event.key)
  ) {
    text.children[i].classList.add("incorrect-letter");
  }
});

document.querySelector(".refresh").addEventListener("click", function () {
  // refresh the text and apply a random background color
  newText();
  applyRandomColor();
});

// read from corpus.txt and split it into sentences
fetch("corpus_cleaned.txt")
  .then((response) => response.text())
  .then((textCorpusSentence) => {
    // split the text into sentences; split after every full stop
    textArray = textCorpusSentence.split(". ");
    // delete sentences with less than 75 characters and more than 200 characters
    textArray = textArray.filter(
      (sentence) => sentence.length > 75 && sentence.length < 200
    );
  });

level = 1;
WPM = 0;
i = 0;
startTime = 0;
applyRandomColor();
newText();
// update wpm every 200ms
setInterval(updateWPM, 200);
