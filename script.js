const gameBoard = document.querySelector(".gameboard");
const scoring = document.querySelector(".score");
const highScore = document.querySelector(".highscore");
const arrowIcons = document.querySelectorAll('.controls div');
const themeSong = document.getElementById("theme-audio");
const musicBtn = document.getElementById('musicbtn');
const modalScore = document.getElementById("modal-score");
const modalBtn = document.getElementById("modal-btn");
const modal = document.getElementById("modal");
const deathAudio = document.getElementById("death-audio");
const obstacleSelect = document.getElementById("obstacle");
const speedSelect = document.getElementById("speed");
const applyButton = document.getElementById("apply");

const hp = document.querySelector('.hp');
const hpIcons = document.querySelectorAll('.hp-icon');

let currentHp = hpIcons.length;

let foodX, foodY;
let snakeX = 5, snakeY = 10;
let speedX = 0, speedY = 0;
let snakeBody = [];
let death = false;
let revive;
let score = 0;
let highscore = localStorage.getItem("highscore") || 0;
let obstacles = [];
let speed = parseInt(localStorage.getItem("speed")) || 125;
highScore.innerHTML = `HighScore: ${highscore}`;

//Audio's
deathAudio.volume = 0.05;
themeSong.play();
themeSong.volume=0.02;
themeSong.playbackRate=2.5;
themeSong.loop =true;

//Food Section
const randomFoodPosistion = () => {
  foodX = Math.floor(Math.random() * 30) + 1;
  foodY = Math.floor(Math.random() * 30) + 1;
};
randomFoodPosistion();

//Obstacle Selector
obstacleSelect.addEventListener("change", (event) => {
  const selectedObstacle = event.target.value;
  switch (selectedObstacle) {
    case "without":
      obstacles = [];
      break;
    case "with":
      obstacles = [];
      for (let i = 0; i < 10; i++) {
        let obstacleX = Math.floor(Math.random() * 30) + 1;
        let obstacleY = Math.floor(Math.random() * 30) + 1;
        obstacles.push([obstacleX, obstacleY]);
      }
      break;   
  }
});

//Speed Selector
speedSelect.addEventListener("change", (event) => {
  const selectedSpeed = event.target.value;
  switch (selectedSpeed) {
    case "easy":
      speed = 250;
      break;
    case "normal":
      speed = 125;
      break;
    case "hard":
      speed = 75;
      break;
  }
});

//Apply Button
applyButton.addEventListener("click", () => {
  clearInterval(revive);
  revive = setInterval(skylarkGame, speed);
});

const skylarkGame = () => {

  if (death) return reset();

  let htmlMarkup = `<div class="food" style="grid-area: ${foodY}/${foodX}"></div>`;

  //Obstacle Display
  obstacles.forEach((obstacle) => {
    const obstacleMarkup = `<div class="obstacle" style="grid-area: ${obstacle[1]}/${obstacle[0]}"></div>`;
    htmlMarkup += obstacleMarkup;
  });

  if (snakeX === foodX && snakeY === foodY) {
    randomFoodPosistion();
    snakeBody.push([foodX, foodY]);
    score++;
    highscore = score > highscore ? score : highscore;
    localStorage.setItem("highscore", highscore);
    scoring.innerHTML = `Score: ${score}`;
  }
  for (let i = snakeBody.length - 1; i > 0; i--) {
    snakeBody[i] = snakeBody[i - 1];
  }

  snakeBody[0] = [snakeX, snakeY];
  snakeX += speedX;
  snakeY += speedY;

  if (snakeX <= 0 || snakeX > 30 || snakeY <= 0 || snakeY > 30) {
    death = true;
  }

  for (let i = 0; i < snakeBody.length; i++) {
    htmlMarkup += `<div class="head" style="grid-area: ${snakeBody[i][1]}/${snakeBody[i][0]}"></div>`;
    if (i !== 0 && snakeBody[0][1] === snakeBody[i][1] && snakeBody[0][0] === snakeBody[i][0]) {
      death = true;
    }

    for (let j = 0; j < obstacles.length; j++) {
      if (snakeBody[i][0] === obstacles[j][0] && snakeBody[i][1] === obstacles[j][1]) {
        death = true;
        break;
      }
    }
  }

  gameBoard.innerHTML = htmlMarkup;
};
//Reset
revive = setInterval(skylarkGame, 125)
const reset = () => {
  clearInterval(revive);
  modalScore.innerText = "Score: " + score;
  modal.style.display = "flex";
  deathAudio.play();
  modalBtn.addEventListener("click", () => {
    location.reload();
  });
};

//Prevention for scrolling.
window.addEventListener("keydown", function(e) {
  if(["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].indexOf(e.key) > -1) {
      e.preventDefault();
  }
}, false);

//Movements
const randomDirection = (e) => {
  switch (e.key) {
    case "ArrowUp":
      if (speedY !== 1) {
        speedX = 0;
        speedY = -1;
      }
      break;
    case "ArrowDown":
      if (speedY !== -1) {
        speedX = 0;
        speedY = 1;
      }
      break;
    case "ArrowLeft":
      if (speedX !== 1) {
        speedX = -1;
        speedY = 0;
      }
      break;
    case "ArrowRight":
      if (speedX !== -1) {
        speedX = 1;
        speedY = 0;
      }
      break;
    default:
      return;
  }
};

arrowIcons.forEach((arrow) => {
  arrow.addEventListener('click', (event) => {
    const direction = event.target.dataset.direction;
    randomDirection({ key: direction });
  });
});

document.addEventListener("keydown", randomDirection);