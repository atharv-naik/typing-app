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
  if (randomLightColor > 30 && randomLightColor < 200) {
    randomLightColor = (randomLightColor + 170) % 360;
  }
  console.log(randomLightColor);
  // document.body.style.backgroundColor = `hsl(${randomLightColor}, 100%, 80%)`;

  // apply a corresponding dark shade on current-letter
  randomDarkColor = Math.floor(Math.random() * 360) + 180;
  document.body.style.setProperty(
    "--current-letter-bg-color",
    `hsl(${randomDarkColor}, 100%, 30%)`
  );
  document.body.style.setProperty(
    "--body-bg-color",
    `hsl(${randomLightColor}, 100%, 80%)`
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
  wpmGraphContext.lineTo(
    (dataPoints[0].x / dataPoints[dataPoints.length - 1].x) *
      wpmGraphCanvas.width,
    wpmGraphCanvas.height
  );
  // wpmGraphContext.lineTo(0, wpmGraphCanvas.height);
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
  wpmGraphContext.fillStyle = "rgba(0, 0, 0, 0.2)";
  wpmGraphContext.font = "12px monospace";
  wpmGraphContext.fillText(
    "time (s)",
    wpmGraphCanvas.width - 60,
    wpmGraphCanvas.height - 10
  );
  wpmGraphContext.fillText("WPM", 10, 10);
  wpmGraphContext.lineTo(wpmGraphCanvas.width, wpmGraphCanvas.height);
  wpmGraphContext.fill();
  // wpmGraphContext.closePath();
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

// If accessed from mobile, show a message
window.mobileCheck = function () {
  let check = false;
  (function (a) {
    if (
      /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(
        a
      ) ||
      /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(
        a.substr(0, 4)
      )
    )
      check = true;
  })(navigator.userAgent || navigator.vendor || window.opera);
  return check;
};

if (mobileCheck()) {
  // add a message
  let messageWrapper = document.createElement("div");
  messageWrapper.classList.add("desktop-only-wrapper");
  let messageBg = document.createElement("img");
  messageBg.src =
    "https://www.gstatic.com/youtube/src/web/htdocs/img/monkey.png";
  messageWrapper.appendChild(messageBg);
  let message = document.createElement("div");
  message.classList.add("desktop-only-message");
  message.innerHTML =
    "<span class='app-name__gradiant'>Speed-Type</span> is only available on desktop browsers";
  messageWrapper.appendChild(message);
  document.body.appendChild(messageWrapper);
} else {
  // INITIALIZE //
  const container = document.querySelector(".container");
  container.style.display = "block";

  level = 1;
  WPM = 0;
  i = 0;
  startTime = 0;
  applyRandomColor();
  newText();
  // update wpm every 500ms
  setInterval(updateWPM, 500);
}
