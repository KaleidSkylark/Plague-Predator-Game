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
deathAudio.volume = 0.2;

//Function to generate random position for the food
const randomFoodPosistion = () => {
  let foundValidPosition = false;
  while (!foundValidPosition) {
    //Generate random coordinates for the food within the game grid
    foodX = Math.floor(Math.random() * 20) + 1;
    foodY = Math.floor(Math.random() * 20) + 1;
    //Check if the food is on top of an obstacle
    let isOnObstacle = false;
    for (let i = 0; i < obstacles.length; i++) {
      if (foodX === obstacles[i][0] && foodY === obstacles[i][1]) {
        isOnObstacle = true;
        break;
      }
    }
    //If the food is not on top of an obstacle, set foundValidPosition to true to end the while loop
    if (!isOnObstacle) {
      foundValidPosition = true;
    }
  }
};
//Call the function to set a random position for the food
randomFoodPosistion();

//Obstacle Selector
obstacleSelect.addEventListener("change", (event) => {
  // Get the selected value from the dropdown
  const selectedObstacle = event.target.value;
  switch (selectedObstacle) {
    // If "without" is selected, remove all obstacles
    case "without":
      obstacles = [];
      break;
    // If "with" is selected, generate 13 random obstacles within the grid
    case "with":
      obstacles = [];
      for (let i = 0; i < 13; i++) {
        let obstacleX = Math.floor(Math.random() * 20) + 1;
        let obstacleY = Math.floor(Math.random() * 20) + 1;
        obstacles.push([obstacleX, obstacleY]);
      }
      break;   
  }
});

//Speed Selector
speedSelect.addEventListener("change", (event) => {
  // Get the selected speed value
  const selectedSpeed = event.target.value;
  // Set the speed based on the selected value
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
// Initialize health and foodsEaten
let health = 0;
let foodsEaten = 0;

// Set the maximum amount of health
const maxHp = 3;

// Function to add health
const addHp = () => {
  // Check if health is less than the maximum amount
  if (health < maxHp) {
    // Increase health by one and add the 'hp-recovered' class to the corresponding health icon
    health++;
    hpIcons[health - 1].classList.add('hp-recovered');
    // If health is now 1, add the 'lime' class to the corresponding health icon
    if (health === 1) {
      hpIcons[health - 1].classList.add('lime');
    }
  }
};

// Function to remove health
const removeHp = () => {
  // Check if health is greater than 0
  if (health > 0) {
    // Decrease health by one and remove the 'hp-recovered' class and 'lime' class (if present) from the corresponding health icon
    health--;
    hpIcons[health].classList.remove('hp-recovered', health === 1 ? 'lime' : '');
    
    // If health is now 0, add the 'gray' class to the first health icon
    if (health === 0) {
      hpIcons[0].classList.add('gray');
    } 
    // If health is now 1, remove the 'lime' class and add the 'gray' class to the first health icon
    else if (health === 1) {
      hpIcons[0].classList.remove('lime');
      hpIcons[0].classList.add('gray');
    }
  }
};

// Function to check for collisions
const checkCollision = () => {
  // Check for collision with snake's own body
  for (let i = 1; i < snakeBody.length; i++) {
    if (snakeX === snakeBody[i][0] && snakeY === snakeBody[i][1]) {
      // If collision is detected, call getHit() function and exit the loop
      getHit();
      break;
    }
  }
  
  // Check for collision with obstacles
  for (let i = 0; i < obstacles.length; i++) {
    if (snakeX === obstacles[i][0] && snakeY === obstacles[i][1]) {
      // If collision is detected, call getHit() function and exit the loop
      getHit();
      break;
    }
  }
};

// Function to handle getting hit
const getHit = () => {
  // If health is greater than 1, decrease health by one
  if (health > 1) {
    health--;
  } 
  // If health is 1, decrease health by one and remove the 'hp-recovered' and 'lime' classes from the first health icon
  else if (health === 1) {
    health--;
    hpIcons[0].classList.remove('hp-recovered', 'lime');
  } 
  // If health is 0, set death to true and call reset() function after 100 milliseconds
  else {
    death = true;
    setTimeout(reset, 100);
  }
  
  // If health is 3 and collision is detected with the snake's own body or an obstacle, add the 'gray' class to the third health icon
  if (health === 3 && (snake.collidesWithBody() || snake.collidesWithObstacle())) {
    hpIcons[2].classList.add('gray');
  } 
  // Otherwise, remove the 'hp-recovered' and 'lime' classes (if present) from the corresponding health icon
  else {
    hpIcons[health].classList.remove('hp-recovered', 'lime');
  }
  
  // Reset the position and movement of the snake, and set the foodsEaten counter back to 0
  [snakeX, snakeY, speedX, speedY, foodX, foodY] = [10, 10, 0, 0, 15, 15];
  snakeBody = [[snakeX, snakeY]];
};
const skylarkGame = () => {

  // If the player has died, reset the game
  if (death) return reset();

  let htmlMarkup = `<div class="food" style="grid-area: ${foodY}/${foodX}"></div>`;

  // Display obstacles on the game board
  obstacles.forEach((obstacle) => {
    const obstacleMarkup = `<div class="obstacle" style="grid-area: ${obstacle[1]}/${obstacle[0]}"></div>`;
    htmlMarkup += obstacleMarkup;
  });

  let eaten = false; // Track if food has been eaten

  // If the snake eats the food, update game state and score
  if (snakeX === foodX && snakeY === foodY) {
    randomFoodPosistion();
    snakeBody.push([foodX, foodY]);
    score++;
    highscore = score > highscore ? score : highscore;
    localStorage.setItem("highscore", highscore);
    scoring.innerHTML = `Score: ${score}`;

    foodsEaten++;
    if (foodsEaten ===10) {
      addHp();
      foodsEaten = 0;
    }

    eaten = true;
    if (snake.collidesWithObstacle()) {
      handleObstacleCollision();
    }
  }

  // Move the snake body and handle wrapping around to the other side of the game board
  for (let i = snakeBody.length - 1; i > 0; i--) {
    snakeBody[i] = snakeBody[i - 1];
  }
  if (snakeX <= 0) {
    snakeX = 20;
  } else if (snakeX > 20) {
    snakeX = 1;
  } else if (snakeY <= 0) {
    snakeY = 20;
  } else if (snakeY > 20) {
    snakeY = 1;
  }
  snakeBody[0] = [snakeX, snakeY];
  snakeX += speedX;
  snakeY += speedY;

  // Render the snake body and check for collisions with the snake or obstacles
  for (let i = 0; i < snakeBody.length; i++) {
    htmlMarkup += `<div class="head" style="grid-area: ${snakeBody[i][1]}/${snakeBody[i][0]}"></div>`;
    if (i !== 0 && snakeBody[0][1] === snakeBody[i][1] && snakeBody[0][0] === snakeBody[i][0]) {
      removeHp(); // If the snake collides with its own body, remove health
      break;
    }
    for (let j = 0; j < obstacles.length; j++) {
      if (snakeBody[i][0] === obstacles[j][0] && snakeBody[i][1] === obstacles[j][1]) {
        removeHp(); // If the snake collides with an obstacle, remove health
        break;
      }
    }
  }

  // Check for collisions with other objects on the game board
  checkCollision();

  // Update the game board with the new state
  gameBoard.innerHTML = htmlMarkup;
};
// Function to draw the snake on the game board
const drawSnake = () => {
  // Loop through each segment of the snake's body and create a new div element for it
  snakeBody.forEach((segment, index) => {
    const snakeElement = document.createElement("div");
    // Set the position of the snake element based on its grid coordinates
    snakeElement.style.gridColumnStart = segment[0];
    snakeElement.style.gridRowStart = segment[1];
    // If the current segment is the head of the snake, add the 'snake-head' class to the element
    if (index === 0) {
      snakeElement.classList.add("snake-head");
      // Check if the snake's head is on an obstacle, change its color to gray
      const isOnObstacle = obstacles.some(obstacle => obstacle[0] === segment[0] && obstacle[1] === segment[1]);
      if (isOnObstacle) {
        snakeElement.style.backgroundColor = "gray";
      }
    // If the current segment is not the head, add the 'snake-body' class to the element
    } else {
      snakeElement.classList.add("snake-body");
    }
    // Append the snake element to the game board
    gameBoard.appendChild(snakeElement);
  });
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

//Movements for Desktop
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
//Movements for Mobile
arrowIcons.forEach((arrow) => {
  arrow.addEventListener('click', (event) => {
    const direction = event.target.dataset.direction;
    randomDirection({ key: direction });
  });
});

document.addEventListener("keydown", randomDirection);