const HACK = false; //for testing locally

const score = {
  getOldScore: () => localStorage.getItem("woofwho-score") || 0,
  getHighScore: () => localStorage.getItem("woofwho-high-score") || 0,
  setHighScore: (val) => localStorage.setItem("woofwho-high-score", val),
  incrementScore: () => {
    const newScore = parseInt(score.getOldScore()) + 1;
    const highScore = newScore > score.getHighScore() ? newScore : score.getHighScore();
    score.setHighScore(highScore);
    localStorage.setItem("woofwho-score", newScore);
  },
  reset: () => localStorage.setItem("woofwho-score", 0),
};

const winElement = () => {
  const elemContainer = document.createElement("div");
  const elem = document.createElement("div");
  elem.className = "win";
  elem.innerHTML = "You win !";

  elemContainer.append(elem);
  return elemContainer;
};

const loseElement = (message) => {
  const elemContainer = document.createElement("div");
  const elem = document.createElement("div");
  elem.className = "lose";
  elem.innerHTML = message;

  elemContainer.append(elem);
  return elemContainer;
};

function checkAnswer(correct, answer) {
  const dogContainer = document.querySelector("#dogContainer");
  if (correct) {
    dogContainer.innerHTML = winElement().innerHTML;
    score.incrementScore();
  } else {
    dogContainer.innerHTML = loseElement("You lose, the correct answer was " + answer).innerHTML;
    score.reset();
  }
  getScores();
  const gettingNextQuiz = document.createElement("div");
  gettingNextQuiz.innerHTML = "Fetching a new pup in 3 seconds !";
  dogContainer.append(gettingNextQuiz);

  setTimeout(() => {
    getNewDog();
  }, 3000);
}

function showOptions(optionArray, answer) {
  const optionContainer = document.querySelector(".options");
  for (let item of optionArray) {
    const btn = document.createElement("button");
    btn.innerHTML = item;
    btn.addEventListener("click", () => {
      console.log(`clicked ${item}`);
      checkAnswer(item == answer, answer);
    });
    if (HACK && item == answer) {
      btn.style.border = "1px solid green";
    }
    // btn.setAttribute("onclick", () => checkAnswer(item == answer, answer));
    optionContainer.append(btn);
  }
}

function getNewDog() {
  const dogContainer = document.querySelector("#dogContainer");
  const optionContainer = document.querySelector(".options");
  const content = document.querySelector(".content");
  const loader = document.querySelector(".loader");
  dogContainer.innerHTML = "";
  optionContainer.innerHTML = "";

  const img = document.createElement("img");
  img.onload = () => {
    loader.style.opacity = 0;
    content.style.opacity = 1;
  };
  dogContainer.append(img);
  fetch("https://dog.ceo/api/breeds/image/random")
    .then((response) => response.json())
    .then(async (response) => {
      console.log("response", response);
      const breed = response.message.split("breeds/")[1].split("/")[0];
      const otherBreeds = await getBreedList();
      console.log(breed, otherBreeds);
      const optArray = select3AndAddAnswer(breed, otherBreeds);
      showOptions(optArray, breed);
      img.src = response.message;
      //   dogContainer.style.background = `url(${response.message})`;
    });
}

function select3AndAddAnswer(breed, otherBreeds) {
  const numbers = Array(otherBreeds.length)
    .fill()
    .map((_, index) => index);
  numbers.sort(() => Math.random() - 0.5);
  const indexes = numbers.slice(0, 3);
  let result = [];
  for (let ind of indexes) {
    result.push(otherBreeds[ind]);
  }
  result.splice(((indexes.length + 1) * Math.random()) | 0, 0, breed);

  return result;
}

function getBreedList() {
  return fetch("https://dog.ceo/api/breeds/list/all")
    .then((response) => response.json())
    .then((response) => {
      console.log("breeds", Object.keys(response.message));
      return Object.keys(response.message);
    });
}

function getScores() {
  const currScoreElem = document.querySelector("#current-score");
  const highScoreElem = document.querySelector("#high-score");
  currScoreElem.innerHTML = "Score: " + score.getOldScore();
  highScoreElem.innerHTML = "Longest streak: " + score.getHighScore();
}

window.onload = function () {
  getScores();
  getNewDog();
};
