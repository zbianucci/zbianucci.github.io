const version = "Alpha 1.0";
const canvas = document.getElementById("canvas1");
const ctx = canvas.getContext("2d");
canvas.width = 900;
canvas.height = 600;

//global variables
const cellSize = 100;
const cellGap = 3;
let numberOfResources = 300;
let enemiesInterval = 600;
let frame = 0;
//let gameOver = false;
let score = 0;
const winningScore = 100;
let chosenDefender = 1; //boy for 1, girl for 2
let clicked = false;

let gameGrid = [];
let defenders = [];
let enemies = [];
let enemyPositions = [];
let projectiles = [];
let resources = [];

//enum of all the possible game states
const gameState = {
  GAME: "game",
  MENU: "menu",
  GAMEOVER: "gameover",
  WIN: "win",
};
let state = gameState.MENU;

//mouse
const mouse = {
  x: undefined,
  y: undefined,
  width: 0.1,
  height: 0.1,
  clicked: false,
};
canvas.addEventListener("mousedown", function () {
  mouse.clicked = true;
});
canvas.addEventListener("mouseup", function () {
  mouse.clicked = false;
});
let canvasPosition = canvas.getBoundingClientRect();
canvas.addEventListener("mousemove", function (e) {
  mouse.x = e.x - canvasPosition.left;
  mouse.y = e.y - canvasPosition.top;
});
canvas.addEventListener("mouseleave", function () {
  mouse.x = undefined;
  mouse.y = undefined;
});
// // For scrollX
// (((t = document.documentElement) || (t = document.body.parentNode))
//   && typeof t.scrollLeft == 'number' ? t : document.body).scrollLeft
// // For scrollY
// (((t = document.documentElement) || (t = document.body.parentNode))
//   && typeof t.scrollTop == 'number' ? t : document.body).scrollTop

// game board
const controlsBar = {
  width: canvas.width,
  height: cellSize,
};

class Cell {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = cellSize;
    this.height = cellSize;
  }
  draw() {
    if (mouse.x && mouse.y && collision(this, mouse)) {
      ctx.strokeStyle = "white";
      ctx.strokeRect(this.x, this.y, this.width, this.height);
    }
  }
}
function createGrid() {
  for (let y = cellSize; y < canvas.height; y += cellSize) {
    for (let x = 0; x < canvas.width; x += cellSize) {

      gameGrid.push(new Cell(x, y));
    }
  }
}
createGrid();
function handleGameGrid() {
  for (let i = 0; i < gameGrid.length; i++) {
    gameGrid[i].draw();
  }
}

//projectiles
const bullet1 = new Image();
bullet1.src = "sprites/d1bullet.png";
const bullet2 = new Image();
bullet2.src = "sprites/d2bullet.png";
class Projectile {
  constructor(x, y, color) {
    this.x = x;
    this.y = y;
    this.width = 40;
    this.height = 40;
    this.power = 20;
    this.speed = 5;
    this.frameX = 0;
    this.frameY = 0;
    this.spriteWidth = 64;
    this.spriteHeight = 64;
    this.minFrame = 0;
    this.maxFrame = 6;
    this.color = color;
  }
  update() {
    if (frame % 10 === 0) {
      if (this.frameX < this.maxFrame) this.frameX++;
      else this.frameX = this.minFrame;
      //if (this.frameX === 15) this.shootNow = true;
    }
    this.x += this.speed;
    if (!this.impact) {
      this.minFrame = 0;
      this.maxFrame = 2;
    } else {
      this.minFrame = 3;
      this.maxFrame = 6;
    }
  }
  draw() {
    if (this.color === "blue") {
      //ctx.drawImage(image, sx, sy, sw, sh, dx, dy, dw, dh)
      ctx.drawImage(
        bullet1,
        this.frameX * this.spriteWidth,
        0,
        this.spriteWidth,
        this.spriteHeight,
        this.x,
        this.y - 15,
        this.width,
        this.height
      );
    } else if (this.color === "pink") {
      ctx.drawImage(
        bullet2,
        this.frameX * this.spriteWidth,
        0,
        this.spriteWidth,
        this.spriteHeight,
        this.x,
        this.y - 20,
        this.width,
        this.height
      );
    }
  }
}
function handleProjectiles() {
  for (let i = 0; i < projectiles.length; i++) {
    projectiles[i].update();
    projectiles[i].draw();

    for (let j = 0; j < enemies.length; j++) {
      if (
        enemies[j] &&
        projectiles[i] &&
        collision(projectiles[i], enemies[j])
      ) {
        enemies[j].health -= projectiles[i].power;
        projectiles.splice(i, 1);
        i--;
      }
    }
    if (projectiles[i] && projectiles[i].x > canvas.width - cellSize) {
      projectiles.splice(i, 1);
      i--;
    }
  }
}

//defenders
const defender1 = new Image();
defender1.src = "sprites/defenders/defender1.png";
const defender2 = new Image();
defender2.src = "sprites/defenders/defender2.png";
class Defender {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = cellSize - cellGap * 2;
    this.height = cellSize - cellGap * 2;
    this.shooting = false; //enemies will only shoot when defender is on their row
    this.shootNow = false;
    this.health = 100;
    this.projectiles = [];
    this.timer = 0;
    this.frameX = 0;
    this.frameY = 0;
    this.spriteWidth = 194;
    this.spriteHeight = 194;
    this.minFrame = 0;
    this.maxFrame = 16;
    this.chosenDefender = chosenDefender;
  }
  draw() {
    //ctx.fillStyle = "blue";
    //ctx.fillRect(this.x, this.y, this.width, this.height);
    ctx.fillStyle = "white";
    ctx.font = "30px Orbitron";
    ctx.fillText(Math.floor(this.health), this.x + 15, this.y + 30);
    if (this.chosenDefender === 1) {
      ctx.drawImage(
        defender1,
        this.frameX * this.spriteWidth,
        0,
        this.spriteWidth,
        this.spriteHeight,
        this.x,
        this.y,
        this.width,
        this.height
      );
    } else if (this.chosenDefender === 2) {
      ctx.drawImage(
        defender2,
        this.frameX * this.spriteWidth,
        0,
        this.spriteWidth,
        this.spriteHeight,
        this.x,
        this.y,
        this.width,
        this.height
      );
    }
  }
  update() {
    if (frame % 10 === 0) {
      if (this.frameX < this.maxFrame) this.frameX++;
      else this.frameX = this.minFrame;
      if (this.frameX === 15) this.shootNow = true;
    }
    if (this.chosenDefender == 1) {
      if (this.shooting) {
        this.minFrame = 0;
        this.maxFrame = 16;
      } else {
        this.minFrame = 17;
        this.maxFrame = 24;
      }
    } else if (this.chosenDefender === 2) {
      if (this.shooting) {
        this.minFrame = 13;
        this.maxFrame = 28;
      } else {
        this.minFrame = 0;
        this.maxFrame = 12;
      }
    }
    if (this.shooting && this.shootNow) {
      if (this.chosenDefender === 1) {
        projectiles.push(new Projectile(this.x + 70, this.y + 35, "blue"));
      } else if (this.chosenDefender === 2) {
        projectiles.push(new Projectile(this.x + 70, this.y + 35, "pink"));
      }
      this.shootNow = false;
    }
  }
}
function handleDefenders() {
  for (let i = 0; i < defenders.length; i++) {
    defenders[i].draw();
    defenders[i].update();
    if (enemyPositions.indexOf(defenders[i].y) !== -1) {
      defenders[i].shooting = true;
    } else {
      defenders[i].shooting = false;
    }
    for (let j = 0; j < enemies.length; j++) {
      if (defenders[i] && collision(defenders[i], enemies[j])) {
        enemies[j].movement = 0;
        defenders[i].health -= 0.2;
      }
      if (defenders[i] && defenders[i].health <= 0) {
        defenders.splice(i, 1);
        i--;
        enemies[j].movement = enemies[j].speed;
      }
    }
  }
}

const card1 = {
  x: 10,
  y: 10,
  width: 70,
  height: 85,
};

const card2 = {
  x: 90,
  y: 10,
  width: 70,
  height: 85,
};

function chooseDefender() {
  let card1stroke = "black";
  let card2stroke = "black";
  if (collision(mouse, card1) && mouse.clicked && state == gameState.GAME) {
    chosenDefender = 1;
  } else if (
    collision(mouse, card2) &&
    mouse.clicked &&
    state == gameState.GAME
  ) {
    chosenDefender = 2;
  }
  if (chosenDefender === 1 && state == gameState.GAME) {
    card1stroke = "gold";
    card2stroke = "black";
  } else if (chosenDefender === 2 && state == gameState.GAME) {
    card1stroke = "black";
    card2stroke = "gold";
  } else {
    card1stroke = "black";
    card2stroke = "black";
  }
  ctx.lineWidth = 1;
  ctx.fillStyle = "rgba(0,0,0,0.2)";
  ctx.fillRect(card1.x, card1.y, card1.width, card1.height);
  ctx.strokeStyle = card1stroke;
  ctx.strokeRect(card1.x, card1.y, card1.width, card1.height);
  ctx.drawImage(defender1, 0, 0, 194, 194, 0, 5, 194 / 2, 194 / 2);
  ctx.fillRect(card2.x, card2.y, card2.width, card2.height);
  ctx.drawImage(defender2, 0, 0, 194, 194, 80, 5, 194 / 2, 194 / 2);
  ctx.strokeStyle = card2stroke;
  ctx.strokeRect(card2.x, card2.y, card2.width, card2.height);
}

//Floating Messages
const floatingMessages = [];
class floatingMessage {
  constructor(value, x, y, size, color) {
    this.value = value;
    this.x = x;
    this.y = y;
    this.size = size;
    this.lifeSpan = 0;
    this.color = color;
    this.opacity = 1;
  }
  update() {
    this.y -= 0.3;
    this.lifeSpan += 1;
    if (this.opacity > 0.03) this.opacity -= 0.03;
  }
  draw() {
    ctx.globalAlpha = this.opacity;
    ctx.fillStyle = this.color;
    ctx.font = this.size + "px Orbitron";
    ctx.fillText(this.value, this.x, this.y);
    ctx.globalAlpha = 1;
  }
}
function handleFloatingMessages() {
  for (let i = 0; i < floatingMessages.length; i++) {
    floatingMessages[i].update();
    floatingMessages[i].draw();
    if (floatingMessages[i].lifeSpan >= 50) {
      floatingMessages.splice(i, 1);
      i--;
    }
  }
}

//enemies
const enemyTypes = [];
const enemy1 = new Image();
enemy1.src = "sprites/enemies/enemy1.png";
enemyTypes.push(enemy1);
const enemy2 = new Image();
enemy2.src = "sprites/enemies/enemy2.png";
enemyTypes.push(enemy2);

class Enemy {
  constructor(verticalPosition) {
    this.x = canvas.width;
    this.y = verticalPosition;
    this.width = cellSize - cellGap * 2;
    this.height = cellSize - cellGap * 2;
    this.speed = Math.random() * 0.2 + 0.4;
    this.movement = this.speed;
    this.health = 100;
    this.maxHealth = this.health;
    this.enemyType = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
    this.frameX = 0; //cycles through the frames of the sprite
    this.frameY = 0; //if a sprite sheet is only one row, y stays at 0
    this.minFrame = 0;
    if (this.enemyType === enemy1) {
      this.maxFrame = 4;
    } else if (this.enemyType === enemy2) {
      this.maxFrame = 7;
    }
    this.spriteWidth = 256;
    this.spriteHeight = 256;
  }
  update() {
    this.x -= this.movement;
    if (frame % 9 === 0) {
      if (this.frameX < this.maxFrame) this.frameX++;
      else this.frameX = this.minFrame;
    }
  }
  draw() {
    // ctx.fillStyle = "red";
    // ctx.fillRect(this.x, this.y, this.width, this.height);
    ctx.fillStyle = "white";
    ctx.font = "30px Orbitron";
    ctx.fillText(Math.floor(this.health), this.x + 15, this.y + 30);
    // ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh);
    ctx.drawImage(
      this.enemyType,
      this.frameX * this.spriteWidth,
      0,
      this.spriteWidth,
      this.spriteHeight,
      this.x,
      this.y,
      this.width,
      this.height
    );
  }
}
function handleEnemies() {
  for (let i = 0; i < enemies.length; i++) {
    enemies[i].update();
    enemies[i].draw();
    if (enemies[i].x < 0) {
      state = gameState.GAMEOVER;
    }
    if (enemies[i].health <= 0) {
      let gainedResources = enemies[i].maxHealth / 10;
      floatingMessages.push(
        new floatingMessage(
          "+" + gainedResources,
          enemies[i].x,
          enemies[i].y,
          30,
          "white"
        )
      );
      floatingMessages.push(
        new floatingMessage("+" + gainedResources, 470, 85, 30, "gold")
      );
      numberOfResources += gainedResources;
      score += gainedResources;
      const findThisIndex = enemyPositions.indexOf(enemies[i].y);
      enemyPositions.splice(findThisIndex, 1);
      enemies.splice(i, 1);
      i--;
    }
  }
  if (frame % enemiesInterval === 0 && score < winningScore) {
    let verticalPosition =
      Math.floor(Math.random() * 5 + 1) * cellSize + cellGap;
    enemies.push(new Enemy(verticalPosition));
    enemyPositions.push(verticalPosition);
    if (enemiesInterval > 120) enemiesInterval -= 50; //change line to change game difficulty
  }
}

//resources
const crystal = new Image();
crystal.src = "sprites/crystal.png";
const amounts = [40, 60, 80];
class Resource {
  constructor() {
    this.x = Math.random() * (canvas.width - cellSize);
    this.y = (Math.floor(Math.random() * 5) + 1) * cellSize + 25;
    this.width = cellSize * 0.6;
    this.height = cellSize * 0.6;
    this.amount = amounts[Math.floor(Math.random() * amounts.length)];
    this.frameX = 0; //cycles through the frames of the sprite
    this.frameY = 0; //if a sprite sheet is only one row, y stays at 0
    this.minFrame = 0;
    this.maxFrame = 7;
    this.spriteWidth = 130;
    this.spriteHeight = 128;
  }
  draw() {
    // ctx.fillStyle = "yellow";
    // ctx.fillRect(this.x, this.y, this.width, this.height);
    ctx.fillStyle = "white";
    ctx.font = "20px Orbitron";
    ctx.fillText(this.amount, this.x + 12, this.y + 18);
    ctx.drawImage(
      crystal,
      this.frameX * this.spriteWidth,
      0,
      this.spriteWidth,
      this.spriteHeight,
      this.x,
      this.y + 10,
      this.width,
      this.height
    );
  }
  update() {
    if (frame % 9 === 0) {
      if (this.frameX < this.maxFrame) this.frameX++;
      else this.frameX = this.minFrame;
    }
  }
}
function handleResources() {
  if (frame % 500 === 0 && score < winningScore) {
    resources.push(new Resource());
  }
  for (let i = 0; i < resources.length; i++) {
    resources[i].update();
    resources[i].draw();
    if (resources[i] && mouse.x && mouse.y && collision(resources[i], mouse)) {
      numberOfResources += resources[i].amount;
      floatingMessages.push(
        new floatingMessage(
          "+" + resources[i].amount,
          resources[i].x,
          resources[i].y,
          30,
          "white"
        )
      );
      floatingMessages.push(
        new floatingMessage("+" + resources[i].amount, 470, 85, 30, "gold")
      );
      resources.splice(i, 1);
      i--;
    }
  }
}

//utilities
function handleGameStatus() {
  ctx.fillStyle = "gold";
  ctx.font = "30px Orbitron";
  ctx.fillText("Score: " + score, 180, 40);
  ctx.fillText("Resources: " + numberOfResources, 180, 80);
  if (score >= winningScore && enemies.length === 0) {
    state = gameState.WIN;
  }
}

canvas.addEventListener("click", function () {
  const gridPositionX = mouse.x - (mouse.x % cellSize) + cellGap;
  const gridPositionY = mouse.y - (mouse.y % cellSize) + cellGap;
  if (gridPositionY < cellSize || !(state == gameState.GAME)) return; //mouse in blue bar
  for (let i = 0; i < defenders.length; i++) {
    if (defenders[i].x === gridPositionX && defenders[i].y === gridPositionY)
      return;
  }
  let defenderCost = 100;
  if (numberOfResources >= defenderCost && state == gameState.GAME && clicked) {
    defenders.push(new Defender(gridPositionX, gridPositionY));
    numberOfResources -= defenderCost;
  } else if (state == gameState.GAME && !clicked) {
    clicked = true;
  } else if (state == gameState.GAME && clicked) {
    floatingMessages.push(
      new floatingMessage("need more resources", mouse.x, mouse.y, 15, "white")
    );
  }
});

//ground
const ground = new Image();
ground.src = "backgrounds/ground.png";

function tile() {
  let tiles = [
    [2, 3, 8, 3, 7, 7],
    [7, 2, 9, 10, 8, 10],
    [9, 6, 10, 7, 10, 7],
    [2, 2, 10, 2, 7, 3],
    [2, 7, 6, 10, 6, 10],
    [7, 7, 8, 6, 8, 3],
    [3, 6, 10, 9, 8, 2],
    [6, 8, 9, 2, 7, 2],
    [3, 7, 3, 9, 10, 9],
  ];
  const spriteWidth = 130;
  const spriteHeight = 130;
  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 6; j++) {
      // ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh);
      ctx.drawImage(
        ground,
        tiles[i][j] * spriteWidth,
        2,
        spriteWidth,
        spriteHeight - 4,
        i * cellSize,
        j * cellSize,
        cellSize,
        cellSize
      );
    }
  }
}

//background
const backgroundColor = new Image();
backgroundColor.src = "backgrounds/Night-Background8.png";
const dirt = new Image();
dirt.src = "backgrounds/Night-Background3.png";
const moon = new Image();
moon.src = "backgrounds/Night-Background2.png";
const ship = new Image();
ship.src = "backgrounds/Dusk-Background3.png";
const stars = new Image();
stars.src = "backgrounds/Night-Background5.png";
const clouds = new Image();
clouds.src = "backgrounds/Factory-Background-3.png";
const factory = new Image();
factory.src = "backgrounds/Factory-Background-2.png";
function background() {
  const imageWidth = 1920;
  const imageHeight = 1080;
  // ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh);
  ctx.drawImage(
    backgroundColor,
    0,
    imageHeight / 2 - cellSize * 2 + 200,
    imageWidth,
    cellSize * 2,
    0,
    0,
    canvas.width,
    cellSize * 2
  );
  ctx.drawImage(
    stars,
    0,
    0,
    imageWidth,
    imageHeight,
    canvas.width / 2,
    0,
    canvas.width / 2,
    cellSize
  );
  ctx.drawImage(
    moon,
    120,
    80,
    imageWidth / 4 + 100,
    imageHeight / 2,
    canvas.width - canvas.width / 4,
    0,
    cellSize,
    cellSize
  );
  ctx.drawImage(
    dirt,
    0,
    imageHeight - cellSize * 5,
    imageWidth,
    cellSize * 4,
    0,
    0,
    canvas.width,
    cellSize * 2 + 10
  );
  ctx.drawImage(
    factory,
    0,
    0,
    imageWidth,
    imageHeight,
    canvas.width / 2,
    0,
    cellSize * 2,
    cellSize + 27
  );
  ctx.drawImage(
    clouds,
    0,
    0,
    imageWidth,
    imageHeight,
    canvas.width / 2,
    0,
    canvas.width / 2,
    cellSize
  );
  ctx.drawImage(
    ship,
    0,
    imageHeight / 4,
    (imageWidth * 3) / 4,
    imageHeight,
    0,
    20,
    canvas.width / 2,
    cellSize * 2 + 10
  );
}

//features
const brownBush = new Image();
brownBush.src = "features/brownBush.png";
const purpleBush = new Image();
purpleBush.src = "features/purpleBush.png";
const purpleTree = new Image();
purpleTree.src = "features/purpleTree.png";
const thorns = new Image();
thorns.src = "features/thorns.png";
class Features {
  constructor() {
    this.width = cellSize * 0.6;
    this.height = cellSize * 0.6;
    this.frameX = 0; //cycles through the frames of the sprite
    this.frameY = 0; //if a sprite sheet is only one row, y stays at 0
    this.minFrame = 0;
    this.maxFrame = 3;
    this.bushHeight = 128;
    this.thornsHeight = 192;
  }
  draw() {
    ctx.drawImage(
      brownBush,
      this.frameX * this.bushHeight,
      0,
      this.bushHeight,
      this.bushHeight,
      cellSize,
      cellSize * 2 - 25,
      this.bushHeight,
      this.bushHeight
    );
    ctx.drawImage(
      purpleBush,
      this.frameX * this.bushHeight,
      0,
      this.bushHeight,
      this.bushHeight,
      cellSize * 5,
      cellSize * 3 - 25,
      this.bushHeight,
      this.bushHeight
    );
    ctx.drawImage(
      purpleTree,
      this.frameX * this.bushHeight,
      0,
      this.bushHeight,
      this.bushHeight,
      cellSize * 2 - 40,
      cellSize * 5 - 40,
      this.bushHeight,
      this.bushHeight
    );
    ctx.drawImage(
      thorns,
      this.frameX * this.thornsHeight,
      0,
      this.thornsHeight,
      this.thornsHeight,
      cellSize * 7,
      cellSize * 2 - 50,
      this.thornsHeight - 20,
      this.thornsHeight - 20
    );
  }
  update() {
    if (frame % 13 === 0) {
      if (this.frameX < this.maxFrame) this.frameX++;
      else this.frameX = this.minFrame;
    }
  }
}
features = new Features();
function handleFeatures() {
  features.draw();
  features.update();
}

//Menu
const menuBackground = new Image();
menuBackground.src = "backgrounds/Theme1-BG.jpg";
const logo = new Image();
logo.src = "features/LogoZB-pic.png";
class Menu {
  constructor() {
    this.width = 2048;
    this.height = 1536;
  }
  draw() {
    ctx.drawImage(
      menuBackground,
      0,
      0,
      this.width,
      this.height,
      0,
      0,
      canvas.width,
      canvas.height
    );
    ctx.drawImage(
      logo,
      0,
      0,
      946,
      995,
      -6,
      0,
      946/13,
      995/13
    );
    ctx.fillStyle = "white";
    ctx.font = "15px Orbitron";
    ctx.fillText(version, canvas.width - 155, 270);
      ctx.font = "30px Orbitron";
      ctx.fillText("Bianucci Games Presents:", 60, 50);
      ctx.font = "100px Orbitron";
      ctx.fillText("GALAXY", 20, 150);
      ctx.fillText("DEFENDERS", 100, 250);
  }
}

//Button
class Button {
  constructor() {
    this.button = new Image();
    this.button.src = "features/button.png";
    this.width = 512;
    this.height = 240;
  }
  draw() {
    ctx.drawImage(
      this.button,
      0,
      0,
      this.width,
      this.height,
      canvas.width / 2 - (this.width - 100) / 2,
      canvas.height / 2 + 100,
      this.width - 100,
      this.height - 100
    );
  }
}

function clickButton(s) {
  const buttonShape = {
    x: canvas.width / 2 - 412 / 2,
    y: canvas.height / 2 + 100,
    width: 412,
    height: 140,
  };
  if (collision(mouse, buttonShape) && mouse.clicked) {
    mouse.clicked = false;
    if (state == gameState.MENU) {
      clicked = false;
    }
    state = s;
  }
}

//reset the game after a game over or win
function reset() {
  defenders = [];
  enemies = [];
  enemyPositions = [];
  projectiles = [];
  resources = [];
  score = 0;
  numberOfResources = 300;
  enemiesInterval = 600;
}

//animate
function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  switch (state) {
    case gameState.GAME:
      tile();
      background();
      handleGameGrid();
      handleDefenders();
      handleResources();
      handleProjectiles();
      handleEnemies();
      handleFeatures();
      chooseDefender();
      handleGameStatus();
      handleFloatingMessages();
      break;
    case gameState.MENU:
      menu = new Menu();
      menu.draw();
      button = new Button();
      button.draw();
      ctx.fillStyle = "white";
      ctx.font = "40px Orbitron";
      ctx.fillText("START", 372, 485);
      reset();
      clickButton(gameState.GAME);
      break;
    case gameState.GAMEOVER:
      ctx.fillStyle = "white";
      ctx.font = "90px Orbitron";
      ctx.fillText("GAME OVER", 130, 200);
      button = new Button();
      button.draw();
      ctx.font = "40px Orbitron";
      ctx.fillText("MAIN MENU", 320, 485);
      clickButton(gameState.MENU);
      //reset();
      break;
    case gameState.WIN:
      ctx.fillStyle = "white";
      ctx.font = "60px Orbitron";
      ctx.fillText("LEVEL COMPLETE", 130, 200);
      ctx.font = "30px Orbitron";
      ctx.fillText("You win with " + score + " points!", 267, 300);
      button = new Button();
      button.draw();
      ctx.font = "40px Orbitron";
      ctx.fillText("MAIN MENU", 320, 485);
      clickButton(gameState.MENU);
      //reset();
      break;
  }
  requestAnimationFrame(animate);
  frame++;
}
animate();
//collision
function collision(first, second) {
  if (
    !(
      first.x > second.x + second.width ||
      first.x + first.width < second.x ||
      first.y > second.y + second.height ||
      first.y + first.height < second.y
    )
  ) {
    return true;
  }
}

window.addEventListener("resize", function () {
  canvasPosition = canvas.getBoundingClientRect();
});
