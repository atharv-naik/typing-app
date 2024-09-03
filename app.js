// CONSTANTS //

const ALLOWED_KEYS = [
  ..."abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ 0123456789-=[]\\;',./`~!@#$%^&*()_+{}|:\"<>?"
];
const SPECIAL_KEYS = [
  "Backspace", "Tab", "Enter", "Shift", "Control", "Alt", "CapsLock", "Escape",
  "ArrowLeft", "ArrowUp", "ArrowRight", "ArrowDown", "Delete"
];
const TEXT_ELEMENT = document.querySelector("#text");
const WPM_GRAPH_CANVAS = document.querySelector("#wpm-graph");
const WPM_GRAPH_CONTEXT = WPM_GRAPH_CANVAS.getContext("2d");
const REFRESH_BUTTON = document.querySelector(".refresh");
const SCORE_ELEMENT = document.querySelector("#score");
const RECORD_ELEMENT = document.querySelector("#record");
const COLOR_HUE_ADJUSTMENT = 170;
const COLOR_THRESHOLD_MIN = 30;
const COLOR_THRESHOLD_MAX = 200;
const WPM_UPDATE_INTERVAL = 500;
const TEXT_ARRAY_DEFAULT = ["The quick brown fox jumps over the lazy dog"];

let textArray = TEXT_ARRAY_DEFAULT;
let currentIndex = 0;
let disablePreventDefault = false;
let startTime;
let dataPoints = [];
let level = 1;

// FUNCTIONS //

// load a random text sentence from the text array
function getRandomText() {
  return textArray[Math.floor(Math.random() * textArray.length)];
}

// update the text content with a new random sentence
function updateTextContent() {
  TEXT_ELEMENT.innerHTML = "";
  const textSentence = getRandomText();
  textSentence.split("").forEach((letter) => {
    const span = document.createElement("span");
    span.innerHTML = letter;
    TEXT_ELEMENT.appendChild(span);
  });
  TEXT_ELEMENT.children[0].classList.add("current-letter");
  currentIndex = 0;
}

// calculate and display Words Per Minute (WPM) speed
function updateWPM() {
  if (currentIndex === 0) {
    startTime = new Date();
    dataPoints = [];
  } else {
    const endTime = new Date();
    const timeElapsed = endTime - startTime;
    const WPM = Math.round(currentIndex / (timeElapsed / 60000) / 5);
    SCORE_ELEMENT.innerText = WPM;
    dataPoints.push({ x: timeElapsed / 1000, y: WPM });
    drawGraph(dataPoints);
  }
}

// update and save the new WPM record in local storage
function updateNewRecord() {
  const WPM = parseInt(SCORE_ELEMENT.innerText, 10);
  const savedRecord = localStorage.getItem("record");

  if (savedRecord === null || WPM > savedRecord) {
    localStorage.setItem("record", WPM);
    RECORD_ELEMENT.innerText = WPM;
  }
}

// load the saved WPM record from local storage
function loadSavedRecord() {
  const savedRecord = localStorage.getItem("record");
  if (savedRecord !== null) {
    RECORD_ELEMENT.innerText = savedRecord;
  }
}

// draw the WPM vs. time graph
function drawGraph(dataPoints) {
  WPM_GRAPH_CONTEXT.clearRect(0, 0, WPM_GRAPH_CANVAS.width, WPM_GRAPH_CANVAS.height);
  WPM_GRAPH_CONTEXT.beginPath();

  dataPoints.forEach((dataPoint, index) => {
    const x = (dataPoint.x / dataPoints[dataPoints.length - 1].x) * WPM_GRAPH_CANVAS.width;
    const y = WPM_GRAPH_CANVAS.height - (dataPoint.y / Math.max(...dataPoints.map(dp => dp.y))) * WPM_GRAPH_CANVAS.height;
    index === 0 ? WPM_GRAPH_CONTEXT.moveTo(x, y) : WPM_GRAPH_CONTEXT.lineTo(x, y);
  });

  WPM_GRAPH_CONTEXT.strokeStyle = "black";
  WPM_GRAPH_CONTEXT.lineWidth = 1;
  WPM_GRAPH_CONTEXT.stroke();
}

// display a message if the user is on a mobile device
function displayMobileMessage() {
  const messageWrapper = document.createElement("div");
  messageWrapper.classList.add("desktop-only-wrapper");

  const messageBg = document.createElement("img");
  messageBg.src = "/images/monkey.png";
  messageWrapper.appendChild(messageBg);

  const message = document.createElement("div");
  message.classList.add("desktop-only-message");
  message.innerHTML = "<span class='app-name__gradiant'>Speed-Type</span> is only available on desktop browsers";
  messageWrapper.appendChild(message);

  document.body.appendChild(messageWrapper);
}

// init the app
function initializeApp() {
  updateTextContent();
  loadSavedRecord();
  setInterval(updateWPM, WPM_UPDATE_INTERVAL);
}

// EVENT LISTENERS //

document.addEventListener("keydown", (event) => {
  if (event.key === "Control") disablePreventDefault = true;
});

document.addEventListener("keyup", (event) => {
  if (event.key === "Control") disablePreventDefault = false;
});

document.addEventListener("keydown", (event) => {
  if (!disablePreventDefault && ALLOWED_KEYS.includes(event.key)) {
    event.preventDefault();
  }
  if (event.key === TEXT_ELEMENT.children[currentIndex].innerHTML) {
    TEXT_ELEMENT.children[currentIndex].classList.remove("current-letter", "incorrect-letter");
    currentIndex++;
    if (currentIndex >= TEXT_ELEMENT.children.length) {
      level++;
      currentIndex = 0;
      updateTextContent();
      updateNewRecord();
    }
    TEXT_ELEMENT.children[currentIndex].classList.add("current-letter");
  } else if (ALLOWED_KEYS.includes(event.key) && !SPECIAL_KEYS.includes(event.key)) {
    TEXT_ELEMENT.children[currentIndex].classList.add("incorrect-letter");
  }
});

REFRESH_BUTTON.addEventListener("click", () => {
  updateTextContent();
});

fetch("/corpus/clean.txt")
  .then((response) => response.text())
  .then((textCorpusSentence) => {
    textArray = textCorpusSentence.split(". ").filter(
      (sentence) => sentence.length > 75 && sentence.length < 200
    );
  });

if (/Mobi|Android/i.test(navigator.userAgent)) {
  displayMobileMessage();
} else {
  const container = document.querySelector(".container");
  container.style.display = "block";
  initializeApp();
}
