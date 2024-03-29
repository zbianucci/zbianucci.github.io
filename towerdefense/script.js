import defendersData from "./json-data/defenders.json" assert { type: "json" };
import bulletsData from "./json-data/bullets.json" assert { type: "json" };

const startTime = new Date(); //the start time in epoch to
const version = "Alpha 2.0";
const canvas = document.getElementById("canvas1");
const ctx = canvas.getContext("2d");
canvas.width = 900;
canvas.height = 600;

//global variables
const cellSize = 100;
const cellGap = 3;

const maxEnemiesInterval = 850;
const maxShootersInterval = 950;
const maxResources = 1000;
let numberOfResources = maxResources;
let enemiesInterval = maxEnemiesInterval;
let shootersInterval = maxShootersInterval;
let menuSpriteInterval = 100;
let frame = 0;
//let gameOver = false;
let score = 0;
const winningScore = 100;
let clicked = false;
let mute = true;
let paused = false;
let menuAnimation = [];
let menu = undefined;
let button = undefined;

let gameGrid = [];
let defenders = [];
let enemies = [];
let shooters = [];
let enemyPositions = [];
let defenderPositions = [];
let shooterPositions = [];
let projectiles = [];
let resources = [];
let menuSprites = [];

//enum of all the possible game states
const gameState = {
  GAME: "game",
  MENU: "menu",
  GAMEOVER: "gameover",
  WIN: "win",
  PAUSE: "pause",
  SHOP: "shop",
};
//let state = gameState.SHOP;
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
  if (!mute) {
    playMusic();
  }
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

//bullet types and objects
const bulletTypes = [];

const bullet1Image = new Image();
bullet1Image.src = "sprites/bullets/d1bullet.png";
bulletTypes.push(bullet1Image); //TODO: change later

bulletsData.bullet1.image = bullet1Image;
const bullet1 = bulletsData.bullet1;
bullet1.image = bullet1Image;

const bullet2Image = new Image();
bullet2Image.src = "sprites/bullets/d2bullet.png";
bulletTypes.push(bullet2Image); //TODO: change later

bulletsData.bullet2.image = bullet2Image;
const bullet2 = bulletsData.bullet2;
bullet2.image = bullet1Image;

const blueBulletImage = new Image();
blueBulletImage.src = "sprites/bullets/blueBullet.png";
bulletTypes.push(blueBulletImage); //TODO: change later
const blueBullet = {
  image: blueBulletImage,
  spriteWidth: 64,
  spriteHeight: 64,
  width: 40,
  height: 40,
  speed: 5,
  power: 5,
  type: "enemy",
  frameX: 0,
  frameY: 0,
  minFrame: 0,
  explodeFrame: 5,
  maxFrame: 9,
  diffX: 0,
  diffY: 20,
};

const brownBulletImage = new Image();
brownBulletImage.src = "sprites/bullets/brownBullet.png";
bulletTypes.push(brownBulletImage); //TODO: change later
const brownBullet = {
  image: brownBulletImage,
  spriteWidth: 64,
  spriteHeight: 64,
  width: 30,
  height: 30,
  speed: 5,
  power: 5,
  type: "enemy",
  frameX: 0,
  frameY: 0,
  minFrame: 0,
  explodeFrame: 5,
  maxFrame: 7,
  diffX: 5,
  diffY: 27,
};

const greenBulletImage = new Image();
greenBulletImage.src = "sprites/bullets/greenBullet.png";
bulletTypes.push(greenBulletImage); //TODO: change later
const greenBullet = {
  image: greenBulletImage,
  spriteWidth: 64,
  spriteHeight: 64,
  width: 40,
  height: 40,
  speed: 5,
  power: 5,
  type: "enemy",
  frameX: 0,
  frameY: 0,
  minFrame: 0,
  explodeFrame: 1,
  maxFrame: 5,
  diffX: 5,
  diffY: 20,
};

const purpleBulletImage = new Image();
purpleBulletImage.src = "sprites/bullets/purpleBullet.png";
bulletTypes.push(purpleBulletImage); //TODO: change later
const purpleBullet = {
  image: purpleBulletImage,
  spriteWidth: 64,
  spriteHeight: 64,
  width: 40,
  height: 40,
  speed: 5,
  power: 5,
  type: "enemy",
  frameX: 0,
  frameY: 0,
  minFrame: 0,
  explodeFrame: 1,
  maxFrame: 5,
  diffX: 10,
  diffY: 25,
};

const redBulletImage = new Image();
redBulletImage.src = "sprites/bullets/redBullet.png";
bulletTypes.push(redBulletImage); //TODO: change later
const redBullet = {
  image: redBulletImage,
  spriteWidth: 64,
  spriteHeight: 64,
  width: 40,
  height: 40,
  speed: 5,
  power: 5,
  type: "enemy",
  frameX: 0,
  frameY: 0,
  minFrame: 0,
  explodeFrame: 1,
  maxFrame: 4,
  diffX: -7,
  diffY: 13,
};

const tealBulletImage = new Image();
tealBulletImage.src = "sprites/bullets/tealBullet.png";
bulletTypes.push(tealBulletImage); //TODO: change later
const tealBullet = {
  image: tealBulletImage,
  spriteWidth: 64,
  spriteHeight: 64,
  width: 40,
  height: 40,
  speed: 5,
  power: 5,
  type: "enemy",
  frameX: 0,
  frameY: 0,
  minFrame: 0,
  explodeFrame: 1,
  maxFrame: 4,
  diffX: -5,
  diffY: 15,
};

//projectiles
class Projectile {
  constructor(x, y, bullet) {
    this.image = bullet.image;
    this.x = x;
    this.y = y;
    this.spriteWidth = bullet.spriteWidth;
    this.spriteHeight = bullet.spriteHeight;
    this.width = bullet.width;
    this.height = bullet.height;
    this.power = bullet.power;
    this.speed = bullet.speed;
    this.frameX = bullet.frameX;
    this.frameY = bullet.frameY;
    this.type = bullet.type;
    this.minFrame = bullet.minFrame;
    this.maxFrame = bullet.maxFrame;
    this.explodeFrame = bullet.explodeFrame;
    this.diffX = bullet.diffX;
    this.diffY = bullet.diffY;
  }
  update() {
    if (frame % 10 === 0) {
      if (this.frameX < this.explodeFrame - 1) this.frameX++;
      else this.frameX = this.minFrame;
      //if (this.frameX === 15) this.shootNow = true;
    }
    if (this.type == "defender") {
      this.x += this.speed;
    } else if (this.type == "enemy") {
      this.x -= this.speed;
    }
  }
  draw() {
    //ctx.drawImage(image, sx, sy, sw, sh, dx, dy, dw, dh)
    ctx.drawImage(
      this.image,
      this.frameX * this.spriteWidth,
      0,
      this.spriteWidth,
      this.spriteHeight,
      this.x + this.diffX,
      this.y + this.diffY,
      this.width,
      this.height
    );
  }
}
function handleProjectiles() {
  for (let i = 0; i < projectiles.length; i++) {
    projectiles[i].update();
    projectiles[i].draw();
    if (projectiles[i].type == "defender") {
      for (let j = 0; j < enemies.length; j++) {
        //TODO: fix this
        if (powerBullets.amount > 0) {
          //maybe make it == 1?
          for (let i = 0; i < defenders.length; i++) {
            defenders[i].bullet.power *= 1.15;
          }
          defender1.power *= 1.15;
          defender2.power *= 1.15;
          powerBullets.amount--;
        }
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
      for (let j = 0; j < shooters.length; j++) {
        //TODO: fix this
        if (
          shooters[j] &&
          projectiles[i] &&
          collision(projectiles[i], shooters[j])
        ) {
          shooters[j].health -= projectiles[i].power;
          projectiles.splice(i, 1);
          i--;
        }
      }
    } else if (projectiles[i].type == "enemy") {
      for (let j = 0; j < shooters.length; j++) {
        //TODO: fix this
        if (
          defenders[j] &&
          projectiles[i] &&
          collision(projectiles[i], defenders[j])
        ) {
          defenders[j].health -= projectiles[i].power;
          projectiles.splice(i, 1);
          i--;
        }
      }
    }
    if (
      projectiles[i] &&
      projectiles[i].type == "defender" &&
      projectiles[i].x > canvas.width - cellSize
    ) {
      projectiles.splice(i, 1);
      i--;
    } else if (
      projectiles[i] &&
      projectiles[i].type == "enemy" &&
      projectiles[i].x < 0
    ) {
      projectiles.splice(i, 1);
      i--;
    }
  }
}

//defenders
const defender1Image = new Image();
defender1Image.src = "sprites/defenders/defender1.png";
const defender2Image = new Image();
defender2Image.src = "sprites/defenders/defender2.png";

defendersData.defender1.image = defender1Image;
const defender1 = defendersData.defender1;
defender1.bullet = bullet1;

defendersData.defender2.image = defender2Image;
const defender2 = defendersData.defender2;
defender2.bullet = bullet2;

let chosenDefender = defender1; //boy for 1, girl for 2
class Defender {
  constructor(x, y, defender) {
    this.x = x;
    this.y = y;
    this.width = defender.width;
    this.height = defender.height;
    this.shooting = false; //enemies will only shoot when defender is on their row
    this.shootNow = false;
    this.health = defender.maxHealth;
    this.maxHealth = defender.maxHealth;
    this.projectiles = [];
    this.timer = 0;
    this.frameX = defender.frameX;
    this.frameY = defender.frameY;
    this.spriteWidth = defender.spriteWidth;
    this.spriteHeight = defender.spriteHeight;
    this.minFrame = defender.minFrame;
    this.shootFrame = defender.shootFrame;
    this.maxFrame = defender.maxFrame;
    this.minIdleFrame = defender.minIdleFrame;
    this.maxIdleFrame = defender.maxIdleFrame;
    this.image = defender.image;
    //this.verticalPosition = verticalPosition;
    this.bullet = defender.bullet;
    this.reloadSpeed = defender.reloadSpeed;
  }
  draw() {
    //ctx.fillStyle = "blue";
    //ctx.fillRect(this.x, this.y, this.width, this.height);
    ctx.fillStyle = "white";
    ctx.font = "30px Orbitron";
    if (Math.floor(this.health) != 0) {
      //health displayed behind defender
      ctx.fillText(Math.floor(this.health), this.x + 15, this.y + 30);
    }
    ctx.drawImage(
      //image of defender
      this.image,
      this.frameX * this.spriteWidth,
      0,
      this.spriteWidth,
      this.spriteHeight,
      this.x,
      this.y,
      this.width,
      this.height
    );
    // ctx.strokeStyle = "white"; //uncomment for hitbox debugging
    // ctx.strokeRect(this.x, this.y, this.width, this.height);
  }
  update() {
    if (frame % Math.floor(10 * this.reloadSpeed) === 0) {
      if (sharpShooter.amount > 0) {
        defender1.reloadSpeed *= 0.9;
        defender2.reloadSpeed *= 0.9;
        for (let i = 0; i < defenders.length; i++) {
          defenders[i].reloadSpeed *= 0.9;
        }
        sharpShooter.amount--;
      }
      //console.log(10 * this.reloadSpeed);
      if (this.shooting) {
        if (this.frameX > this.minFrame) this.frameX--;
        else this.frameX = this.maxFrame;
      } else {
        if (this.frameX > this.minIdleFrame) this.frameX--;
        else this.frameX = this.maxIdleFrame;
      }
      if (this.frameX === this.shootFrame) this.shootNow = true;
    }
    if (this.shooting && this.shootNow) {
      projectiles.push(new Projectile(this.x + 70, this.y + 35, this.bullet));
      this.shootNow = false;
    }
    if (healthPotion.amount > 0) {
      //maybe make it == 1?
      for (let i = 0; i < defenders.length; i++) {
        defenders[i].health = this.maxHealth;
      }
      healthPotion.amount--;
    }
    if (healthCrystals.amount > 0) {
      this.maxHealth *= 1.1;
      for (let i = 0; i < defenders.length; i++) {
        defenders[i].health = this.maxHealth;
      }
      defender1.maxHealth *= 1.1;
      defender2.maxHealth *= 1.1;
      healthCrystals.amount--;
    }
  }
}
function handleDefenders() {
  for (let i = 0; i < defenders.length; i++) {
    defenders[i].draw();
    defenders[i].update();
    if (honey.amount > 0) {
      for (let j = 0; j < shooters.length; j++) {
        shooters[j].speed *= 0.8;
      }
      for (let j = 0; j < shooterOptions.length; j++) {
        shooterOptions[j].speed *= 0.8;
      }
      for (let j = 0; j < enemies.length; j++) {
        enemies[j].speed *= 0.8;
      }
      for (let j = 0; j < enemyOptions.length; j++) {
        enemyOptions[j].speed *= 0.8;
      }
      honey.amount--;
    }
    if (
      enemyPositions.indexOf(defenders[i].y) !== -1 ||
      shooterPositions.indexOf(defenders[i].y) !== -1
    ) {
      defenders[i].shooting = true;
    } else {
      defenders[i].shooting = false;
    }
    for (let j = 0; j < enemies.length; j++) {
      if (enemies[j] && defenders[i] && collision(defenders[i], enemies[j])) {
        enemies[j].movement = 0;
        defenders[i].health -= 0.2;
      }
      if (defenders[i] && defenders[i].health <= 0) {
        const findThisIndex = defenderPositions.indexOf(defenders[i].y);
        defenderPositions.splice(findThisIndex, 1);
        defenders.splice(i, 1);
        i--;
        enemies[j].movement = enemies[j].speed;
      }
    }
    for (let j = 0; j < shooters.length; j++) {
      if (
        projectiles[j] &&
        defenders[i] &&
        collision(defenders[i], projectiles[j]) &&
        projectiles[j].type == "enemy"
      ) {
        //enemies[j].movement = 0;
        defenders[i].health -= 0.2;
      }
      if (defenders[i] && defenders[i].health <= 0) {
        const findThisIndex = defenderPositions.indexOf(defenders[i].y);
        defenderPositions.splice(findThisIndex, 1);
        defenders.splice(i, 1);
        i--;
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
    chosenDefender = defender1;
  } else if (
    collision(mouse, card2) &&
    mouse.clicked &&
    state == gameState.GAME
  ) {
    chosenDefender = defender2;
  }
  if (chosenDefender === defender1 && state == gameState.GAME) {
    card1stroke = "gold";
    card2stroke = "black";
  } else if (chosenDefender === defender2 && state == gameState.GAME) {
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
  ctx.drawImage(defender1Image, 0, 0, 194, 194, 0, 5, 194 / 2, 194 / 2);
  ctx.fillRect(card2.x, card2.y, card2.width, card2.height);
  ctx.drawImage(defender2Image, 0, 0, 194, 194, 80, 5, 194 / 2, 194 / 2);
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

//enemy sprites and objects
const enemyTypes = [];
const crawlEnemyImage = new Image();
crawlEnemyImage.src = "sprites/enemies/crawlEnemy.png";
enemyTypes.push(crawlEnemyImage); //TODO: change later
const crawlEnemy = {
  image: crawlEnemyImage,
  spriteWidth: 256,
  spriteHeight: 256,
  width: cellSize - cellGap * 2,
  height: cellSize - cellGap * 2,
  speed: 0.2,
  maxHealth: 200,
  enemyType: crawlEnemyImage,
  frameX: 0,
  frameY: 0,
  minFrame: 0,
  maxFrame: 4,
};

const greenEnemyImage = new Image();
greenEnemyImage.src = "sprites/enemies/greenEnemy.png";
enemyTypes.push(greenEnemyImage);
const greenEnemy = {
  image: greenEnemyImage,
  spriteWidth: 144,
  spriteHeight: 144,
  width: cellSize - cellGap * 2,
  height: cellSize - cellGap * 2,
  speed: 1.0, //TODO: create specific speed for enemies
  maxHealth: 20,
  enemyType: greenEnemyImage,
  frameX: 0,
  frameY: 0,
  minFrame: 0,
  maxFrame: 4,
};

const orangeEnemyImage = new Image();
orangeEnemyImage.src = "sprites/enemies/orangeEnemy.png";
enemyTypes.push(orangeEnemyImage);
const orangeEnemy = {
  image: orangeEnemyImage,
  spriteWidth: 256,
  spriteHeight: 256,
  width: cellSize - cellGap * 2,
  height: cellSize - cellGap * 2,
  speed: 0.6,
  maxHealth: 100,
  enemyType: orangeEnemyImage,
  frameX: 0,
  frameY: 0,
  minFrame: 0,
  maxFrame: 7,
};

const purpleEnemyImage = new Image();
purpleEnemyImage.src = "sprites/enemies/purpleEnemy.png";
enemyTypes.push(purpleEnemyImage);
const purpleEnemy = {
  image: purpleEnemyImage,
  spriteWidth: 254,
  spriteHeight: 254,
  width: cellSize - cellGap * 2,
  height: cellSize - cellGap * 2,
  speed: 0.4,
  maxHealth: 160,
  enemyType: purpleEnemyImage,
  frameX: 0,
  frameY: 0,
  minFrame: 0,
  maxFrame: 4,
};

const redEnemyImage = new Image();
redEnemyImage.src = "sprites/enemies/redEnemy.png";
enemyTypes.push(redEnemyImage);
const redEnemy = {
  image: redEnemyImage,
  spriteWidth: 254,
  spriteHeight: 254,
  width: cellSize - cellGap * 2,
  height: cellSize - cellGap * 2,
  speed: 0.8,
  maxHealth: 60,
  enemyType: redEnemyImage,
  frameX: 0,
  frameY: 0,
  minFrame: 0,
  maxFrame: 8,
};

const rockEnemyImage = new Image();
rockEnemyImage.src = "sprites/enemies/rockEnemy.png";
enemyTypes.push(rockEnemyImage);
const rockEnemy = {
  image: rockEnemyImage,
  spriteWidth: 254,
  spriteHeight: 254,
  width: cellSize - cellGap * 2,
  height: cellSize - cellGap * 2,
  speed: 0.8,
  maxHealth: 260,
  enemyType: rockEnemyImage,
  frameX: 0,
  frameY: 0,
  minFrame: 0,
  maxFrame: 4,
};

const tealEnemyImage = new Image();
tealEnemyImage.src = "sprites/enemies/tealEnemy.png";
enemyTypes.push(tealEnemyImage);
const tealEnemy = {
  image: tealEnemyImage,
  spriteWidth: 384,
  spriteHeight: 256,
  width: cellSize - cellGap * 2,
  height: cellSize - cellGap * 2,
  speed: 0.3,
  maxHealth: 400,
  enemyType: tealEnemyImage,
  frameX: 0,
  frameY: 0,
  minFrame: 0,
  maxFrame: 5,
};

const enemyOptions = [
  crawlEnemy,
  greenEnemy,
  orangeEnemy,
  purpleEnemy,
  redEnemy,
  rockEnemy,
  tealEnemy,
];
class Enemy {
  constructor(verticalPosition, enemy) {
    this.image = enemy.image;
    this.x = canvas.width;
    this.y = verticalPosition;
    //this.enemy = enemy; //add when there is a spawn mechanism
    this.spriteWidth = enemy.spriteWidth;
    this.spriteHeight = enemy.spriteHeight;
    this.width = enemy.width;
    this.height = enemy.height;
    this.speed = enemy.speed;
    this.movement = this.speed;
    this.maxHealth = enemy.maxHealth;
    this.health = this.maxHealth;
    this.enemyType = enemy.enemyType;
    this.frameX = enemy.frameX;
    this.frameY = enemy.frameY;
    this.minFrame = enemy.minFrame;
    this.maxFrame = enemy.maxFrame;
  }
  update() {
    this.x -= this.movement;
    if (frame % 9 === 0) {
      if (this.frameX < this.maxFrame) this.frameX++;
      else this.frameX = this.minFrame;
    }
  }
  draw() {
    ctx.fillStyle = "white";
    ctx.font = "30px Orbitron";
    if (Math.floor(this.health) != 0) {
      ctx.fillText(Math.floor(this.health), this.x + 15, this.y + 30);
    }
    // ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh);
    ctx.drawImage(
      this.image,
      this.frameX * this.spriteWidth,
      0,
      this.spriteWidth,
      this.spriteHeight,
      this.x,
      this.y,
      this.width,
      this.height
    );
    // ctx.strokeStyle = "white"; // uncomment for debugging
    // ctx.strokeRect(this.x, this.y, this.width, this.height);
  }
}
function handleEnemies() {
  //TODO: remove for spawn class
  for (let i = 0; i < enemies.length; i++) {
    enemies[i].update();
    enemies[i].draw();
    if (grenade.amount > 0) {
      enemies = [];
      enemyPositions = [];
      shooters = [];
      shooterPositions = [];
      projectiles = [];
      grenade.amount--;
      break;
    }
    if (honey.amount > 0) {
      for (let j = 0; j < enemies.length; j++) {
        enemies[j].speed *= 0.8;
      }
      for (let j = 0; j < enemyOptions.length; j++) {
        enemyOptions[j].speed *= 0.8;
      }
      honey.amount--;
    }
    if (enemies[i] && enemies[i].x < 0) {
      state = gameState.GAMEOVER;
    }
    if (enemies[i].health <= 0) {
      if (goldenFin.amount > 0) {
        goldenFin.multiplier *= 2;
        goldenFin.amount--;
      }
      let gainedResources = (enemies[i].maxHealth / 10) * goldenFin.multiplier;
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
  if (
    frame % enemiesInterval === 4 &&
    score < winningScore &&
    state == gameState.GAME
  ) {
    let verticalPosition =
      Math.floor(Math.random() * 5 + 1) * cellSize + cellGap;
    enemies.push(
      new Enemy(
        verticalPosition,
        //enemyOptions[Math.floor(Math.random() * enemyOptions.length)]
        greenEnemy
      )
    );
    enemyPositions.push(verticalPosition);
    if (enemiesInterval > 120 && state == gameState.GAME) enemiesInterval -= 50; //change line to change game difficulty
  }
}

//shooters sprites and objects
const shooterTypes = [];
const blueShooterImage = new Image();
blueShooterImage.src = "sprites/shooters/blueShooter.png";
shooterTypes.push(blueShooterImage); //TODO: change later
const blueShooter = {
  //Alien3
  image: blueShooterImage,
  spriteWidth: 192,
  spriteHeight: 192,
  width: cellSize - cellGap * 2,
  height: cellSize - cellGap * 2,
  speed: 1.2,
  maxHealth: 20,
  shooterType: blueShooterImage,
  frameX: 0,
  frameY: 0,
  minFrame: 0,
  shootFrame: 8, //the walk animation ends on 7
  maxFrame: 14,
  bullet: blueBullet,
  fireAt: 12,
  //add power for the amount of damage that a bullet creates
};

const brownShooterImage = new Image();
brownShooterImage.src = "sprites/shooters/brownShooter.png";
shooterTypes.push(brownShooterImage); //TODO: change later
const brownShooter = {
  //Alien13
  image: brownShooterImage,
  spriteWidth: 192,
  spriteHeight: 192,
  width: cellSize - cellGap * 2,
  height: cellSize - cellGap * 2,
  speed: 1.0,
  maxHealth: 60,
  shooterType: brownShooterImage,
  frameX: 0,
  frameY: 0,
  minFrame: 0,
  shootFrame: 6,
  maxFrame: 10,
  bullet: brownBullet,
  fireAt: 8,
};

const greenShooterImage = new Image();
greenShooterImage.src = "sprites/shooters/greenShooter.png";
shooterTypes.push(greenShooterImage); //TODO: change later
const greenShooter = {
  //Alien7
  image: greenShooterImage,
  spriteWidth: 192,
  spriteHeight: 192,
  width: cellSize - cellGap * 2,
  height: cellSize - cellGap * 2,
  speed: 0.8,
  maxHealth: 100,
  shooterType: greenShooterImage,
  frameX: 0,
  frameY: 0,
  minFrame: 0,
  shootFrame: 8,
  maxFrame: 17,
  bullet: greenBullet,
  fireAt: 17,
};

const purpleShooterImage = new Image();
purpleShooterImage.src = "sprites/shooters/purpleShooter.png";
shooterTypes.push(purpleShooterImage); //TODO: change later
const purpleShooter = {
  //Alien12
  image: purpleShooterImage,
  spriteWidth: 256,
  spriteHeight: 224,
  width: cellSize - cellGap * 2,
  height: cellSize - cellGap * 2,
  speed: 0.5,
  maxHealth: 200,
  shooterType: purpleShooterImage,
  frameX: 0,
  frameY: 0,
  minFrame: 0,
  shootFrame: 8,
  maxFrame: 18,
  bullet: purpleBullet,
  fireAt: 16,
};

const redShooterImage = new Image();
redShooterImage.src = "sprites/shooters/redShooter.png";
shooterTypes.push(redShooterImage); //TODO: change later
const redShooter = {
  //Alien8
  image: redShooterImage,
  spriteWidth: 192,
  spriteHeight: 192,
  width: cellSize - cellGap * 2,
  height: cellSize - cellGap * 2,
  speed: 2.0,
  maxHealth: 160,
  shooterType: redShooterImage,
  frameX: 0,
  frameY: 0,
  minFrame: 0,
  shootFrame: 6,
  maxFrame: 10,
  bullet: redBullet,
  fireAt: 8,
};

const tealShooterImage = new Image();
tealShooterImage.src = "sprites/shooters/tealShooter.png";
shooterTypes.push(tealShooterImage); //TODO: change later
const tealShooter = {
  //Alien14
  image: tealShooterImage,
  spriteWidth: 192,
  spriteHeight: 192,
  width: cellSize - cellGap * 2,
  height: cellSize - cellGap * 2,
  speed: 0.6,
  maxHealth: 400,
  shooterType: tealShooterImage,
  frameX: 0,
  frameY: 0,
  minFrame: 0,
  shootFrame: 6,
  maxFrame: 10,
  bullet: tealBullet,
  fireAt: 8,
};
const shooterOptions = [
  blueShooter, //3
  brownShooter, //13
  greenShooter, //7
  purpleShooter, //12
  redShooter, //8
  tealShooter, //14
];
//Shooter
class Shooter {
  constructor(verticalPosition, shooter) {
    this.image = shooter.image;
    this.x = canvas.width;
    this.y = verticalPosition;
    this.spriteWidth = shooter.spriteWidth;
    this.spriteHeight = shooter.spriteHeight;
    this.width = shooter.width;
    this.height = shooter.height;
    this.speed = shooter.speed;
    this.movement = this.speed;
    this.maxHealth = shooter.maxHealth;
    this.health = this.maxHealth;
    this.shooterType = shooter.shooterType;
    this.frameX = shooter.frameX;
    this.frameY = shooter.frameY;
    this.minFrame = shooter.minFrame;
    this.maxFrame = shooter.maxFrame;
    this.shootFrame = shooter.shootFrame;
    this.bullet = shooter.bullet;
    this.fireAt = shooter.fireAt;
    this.shooting = false;
    //this.shootNow = false;
  }
  update() {
    if (this.frameX < this.shootFrame) {
      this.x -= this.movement;
    }
    // if (this.shooting && this.shootNow) {
    //   if (this.chosenDefender === 1) {
    //     projectiles.push(new Projectile(this.x + 70, this.y + 35, bullet1));
    //   } else if (this.chosenDefender === 2) {
    //     projectiles.push(new Projectile(this.x + 70, this.y + 35, bullet2));
    //   }
    //   this.shootNow = false;
    // }
    if (frame % 9 === 0) {
      if (!this.shooting) {
        if (this.frameX < this.shootFrame - 1) {
          this.frameX++;
        } else {
          this.frameX = this.minFrame;
        }
      } else if (this.shooting) {
        if (this.frameX < this.maxFrame) this.frameX++;
        else this.frameX = this.minFrame;
        if (this.frameX == this.fireAt) {
          projectiles.push(new Projectile(this.x, this.y, this.bullet));
        }
      }
    }
  }
  draw() {
    ctx.fillStyle = "white";
    ctx.font = "30px Orbitron";
    if (Math.floor(this.health) != 0) {
      ctx.fillText(Math.floor(this.health), this.x + 15, this.y + 30);
    }
    // ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh);
    ctx.drawImage(
      this.image,
      this.frameX * this.spriteWidth,
      0,
      this.spriteWidth,
      this.spriteHeight,
      this.x,
      this.y,
      this.width,
      this.height
    );
    // ctx.strokeStyle = "white"; // uncomment for debugging
    // ctx.strokeRect(this.x, this.y, this.width, this.height);
  }
}

function handleShooters() {
  //TODO: remove for spawn class
  for (let i = 0; i < shooters.length; i++) {
    shooters[i].update();
    shooters[i].draw();
    if (shooters[i] && shooters[i].x < 0) {
      state = gameState.GAMEOVER;
    }
    if (shooters[i] && shooters[i].health <= 0) {
      let gainedResources = shooters[i].maxHealth / 10;
      floatingMessages.push(
        new floatingMessage(
          "+" + gainedResources,
          shooters[i].x,
          shooters[i].y,
          30,
          "white"
        )
      );
      floatingMessages.push(
        new floatingMessage("+" + gainedResources, 470, 85, 30, "gold")
      );
      numberOfResources += gainedResources;
      score += gainedResources;
      const findThisIndex = shooterPositions.indexOf(shooters[i].y);
      shooterPositions.splice(findThisIndex, 1);
      shooters.splice(i, 1);
      i--;
    }
    if (shooters[i]) {
      if (defenderPositions.indexOf(shooters[i].y) !== -1) {
        shooters[i].shooting = true;
      } else {
        shooters[i].shooting = false;
      }
    }
    for (let j = 0; j < defenders.length; j++) {
      if (shooters[i] && collision(shooters[i], defenders[j])) {
        defenders[j].movement = 0;
        shooters[i].health -= 0.2;
      }
      if (shooters[i] && shooters[i].health <= 0) {
        shooters.splice(i, 1);
        i--;
        defenders[j].movement = defenders[j].speed;
      }
      // if (shooters[i] && shooterPositions.indexOf(defenders[i].y) > -1){
      //   shooters[i].shooting = false;
      // }
    }
  }

  if (
    frame % shootersInterval === 0 &&
    score < winningScore &&
    state == gameState.GAME
  ) {
    let verticalPosition =
      Math.floor(Math.random() * 5 + 1) * cellSize + cellGap;
    shooters.push(
      new Shooter(
        verticalPosition,
        //shooterOptions[Math.floor(Math.random() * shooterOptions.length)]
        blueShooter
      )
    );
    shooterPositions.push(verticalPosition);
    if (shootersInterval > 120 && state == gameState.GAME) {
      shootersInterval -= 50; //change line to change game difficulty
    }
  }
}

class Spawn {
  //cell is 1-5 from top to bottom
  constructor(enemy, cell, frame, health) {
    this.enemy = enemy;
    this.cell = cell;
    this.frame = frame;
  }
}

function handleSpawn() {}

//resources
const crystal = new Image();
crystal.src = "sprites/resources/crystal.png";
const amounts = [40, 60, 80];
class Resource {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = cellSize * 0.6;
    this.height = cellSize * 0.6;
    this.amount = amounts[Math.floor(Math.random() * amounts.length)];
    this.frameX = 0; //cycles through the frames of the sprite
    this.frameY = 0; //if a sprite sheet is only one row, y stays at 0
    this.minFrame = 0;
    this.maxFrame = 7;
    this.spriteWidth = 130;
    this.spriteHeight = 128;
    this.grabbed = false;
    this.done = false;
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
    resources.push(
      new Resource(
        Math.random() * (canvas.width - cellSize),
        (Math.floor(Math.random() * 5) + 1) * cellSize + 25
      )
    );
  }
  for (let i = 0; i < resources.length; i++) {
    resources[i].update();
    resources[i].draw();
    if (
      resources[i] &&
      mouse.x &&
      mouse.y &&
      collision(resources[i], mouse) &&
      !resources[i].grabbed
    ) {
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
      resources[i].grabbed = true;
      resources.splice(i, 1);
      i--;
    }
    // if (resources[i].grabbed){
    //   ctx.drawImage(
    //     crystal,
    //     resources[i].frameX * resources[i].spriteWidth,
    //     0,
    //     resources[i].spriteWidth,
    //     resources[i].spriteHeight,
    //     resources[i].x,
    //     resources[i].y + 10,
    //     resources[i].width,
    //     resources[i].height
    //   );
    //   resources[i].frameX+=1;
    //   if (resources[i].frameX===13){
    // resources.splice(i, 1);
    // i--;
    //}
    // }
    //if(frame===)
    // resources.splice(i, 1);
    // i--;

    //if ()
  }
}

//utilities
function handleGameStatus(shop = false) {
  ctx.fillStyle = "gold";
  ctx.font = "30px Orbitron";
  let x = 180;
  if (shop) {
    x = 20;
  }
  ctx.fillText("Score: " + score, x, 40);
  ctx.fillText("Resources: " + numberOfResources, x, 80);
  if (score >= winningScore && enemies.length === 0 && shooters.length === 0) {
    state = gameState.WIN;
  }
}

canvas.addEventListener("click", function () {
  const gridPositionX = mouse.x - (mouse.x % cellSize) + cellGap;
  const gridPositionY = mouse.y - (mouse.y % cellSize) + cellGap;
  // canvas.width - 50,
  //     10,
  //     40,
  //     40
  if (
    //mute button
    mouse.y >= 30 - 19 &&
    mouse.y <= 30 + 19 &&
    mouse.x >= 824 - 19 &&
    mouse.x <= 824 + 19
  ) {
    mute = !mute;
    playMusic(mute);
    return;
  } else if (
    //pause button
    mouse.y >= 10 &&
    mouse.y <= 50 &&
    mouse.x >= canvas.width - 50 &&
    mouse.x <= canvas.width - 10 &&
    state == gameState.GAME
  ) {
    state = gameState.PAUSE;
    return;
  } else if (
    //shop button
    mouse.y >= 60 &&
    mouse.y <= 85 &&
    mouse.x >= 809 &&
    mouse.x <= 884
  ) {
    if (state == gameState.GAME) {
      state = gameState.SHOP;
      return;
    } else if (state == gameState.SHOP) {
      state = gameState.GAME;
      return;
    }
  } else if (
    mouse.y >= 10 &&
    mouse.y <= 50 &&
    mouse.x >= canvas.width - 50 &&
    mouse.x <= canvas.width - 10 &&
    state == gameState.PAUSE
  ) {
    state = gameState.GAME;
    //reset();
    return;
  }
  if (gridPositionY < cellSize || !(state == gameState.GAME)) return; //mouse in blue bar
  for (let i = 0; i < defenders.length; i++) {
    if (defenders[i].x === gridPositionX && defenders[i].y === gridPositionY)
      return;
  }
  let defenderCost = 100;
  if (numberOfResources >= defenderCost && state == gameState.GAME && clicked) {
    defenders.push(new Defender(gridPositionX, gridPositionY, chosenDefender));
    defenderPositions.push(gridPositionY);
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

//pause button
const pause = new Image();
pause.src = "features/pause.png";
function drawPause(paused) {
  ctx.strokeStyle = "white";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(canvas.width - 50 + 19, 10 + 19, 19, 0, Math.PI * 2, true); //circle
  ctx.stroke();
  if (paused) {
    //ctx.drawImage(pause, 0, 0, 512, 512, canvas.width - 50, 10, 40, 40);
    ctx.strokeStyle = "white";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(canvas.width - 37, 17);
    ctx.lineTo(canvas.width - 37, 42);
    ctx.moveTo(canvas.width - 25, 17);
    ctx.lineTo(canvas.width - 25, 42);
    ctx.stroke();
  } else {
    ctx.fillStyle = "white";
    ctx.beginPath();
    // ctx.moveTo(809, 30); //start of triangle
    // ctx.lineTo(823, 40);
    // ctx.lineTo(823, 20); //end of triangle
    ctx.moveTo(canvas.width - 40, 20); //start of triangle
    ctx.lineTo(canvas.width - 40, 40);
    ctx.lineTo(canvas.width - 20, 30); //end of triangle
    ctx.fill();
  }
}
//sound button
const sound = new Image();
sound.src = "features/sound.png";
function drawSound(mute) {
  //ctx.drawImage(sound, 0, 0, 840, 695, canvas.width- 50, 10, 40, 40);
  ctx.fillStyle = "white";
  ctx.beginPath();
  ctx.moveTo(809, 30); //start of triangle
  ctx.lineTo(823, 40);
  ctx.lineTo(823, 20); //end of triangle
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = "white";
  ctx.beginPath();
  ctx.arc(824, 30, 19, 0, Math.PI * 2, true); //circle
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(820, 30, 10, 5.3, 7.2, false); //first arc
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(826, 30, 10, 5.1, 7.4, false); //second arc
  ctx.stroke();
  ctx.beginPath();
  //ctx.arc(830, 30, 10, 5, 7.5, false); //third arc
  ctx.stroke();
  //ctx.beginPath();
  //ctx.rect(20, 20, 150, 100);
  ctx.fillRect(809, 26, 6, 8);
  //ctx.arc(820, 30, 10, Math.PI*3/2, Math.PI*5/2, false);
  /*ctx.arc(x: number, y: number, radius: number,
  startAngle: number, endAngle: number, counterclockwise?: boolean*/
  if (mute) {
    ctx.beginPath();
    ctx.lineWidth = 2.5;
    ctx.moveTo(824 + 13.4, 30 - 13.4);
    ctx.lineTo(824 - 13.4, 30 + 13.4); //first line of the x
    ctx.moveTo(824 - 13.4, 30 - 13.4);
    ctx.lineTo(824 + 13.4, 30 + 13.4); //second line of the x
    ctx.stroke();
  }
  playMusic(mute);
}
//shop button
function drawShopButton() {
  ctx.strokeStyle = "white";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(809, 60);
  ctx.lineTo(884, 60); //top line
  ctx.moveTo(809, 85);
  ctx.lineTo(884, 85); //bottom line
  ctx.moveTo(809, 60);
  ctx.lineTo(809, 85); //left line
  ctx.moveTo(884, 60);
  ctx.lineTo(884, 85); //right line
  //ctx.arc(824, 50, 19, 0, Math.PI * 2, true); //circle
  ctx.stroke();
  ctx.font = "20px Orbitron";
  ctx.fillStyle = "white";
  ctx.textAlign = "center";
  if (state == gameState.GAME) {
    ctx.fillText("SHOP", (809 + 884) / 2, (55 + 90) / 2 + 7);
  } else if (state == gameState.SHOP) {
    ctx.fillText("BACK", (809 + 884) / 2, (55 + 90) / 2 + 7);
  }
  ctx.textAlign = "left";
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
      cellSize * 2 - 65,
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
let features = new Features();
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
    ctx.drawImage(logo, 0, 0, 946, 995, -6, 0, 946 / 13, 995 / 13);
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
//Shop Menu
const shopMenu = new Image();
shopMenu.src = "shop/ShopMenu.png";
const shopHoveredIcons = new Image();
shopHoveredIcons.src = "shop/ShopHoveredIcons.png";
const shopInactiveIcons = new Image();
shopInactiveIcons.src = "shop/ShopInactiveIcons.png";
const buyButtonImage = new Image();
buyButtonImage.src = "shop/buyButton.png";
const buyButtonHoverImage = new Image();
buyButtonHoverImage.src = "shop/buyButtonHovered.png";
const buyButtonInactiveImage = new Image();
buyButtonInactiveImage.src = "shop/buyButtonInactive.png";
const buyButton = {
  image: buyButtonImage,
  hover: buyButtonHoverImage,
  inactive: buyButtonInactiveImage,
  sx: 0,
  sy: 0,
  dx: 128, //128//0, 0, 128, 128, 370, 458, 68, 68
  dy: 128,
  x: 370,
  y: 458,
  width: 68,
  height: 68,
  active: true,
  selected: false,
};
function drawShop() {
  const imageWidth = 1920;
  const imageHeight = 1080;
  // ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh);
  ctx.drawImage(
    backgroundColor,
    0,
    0,
    imageWidth,
    imageHeight,
    0,
    0,
    canvas.width,
    canvas.height
  );
  ctx.drawImage(
    stars,
    0,
    0,
    imageWidth,
    imageHeight,
    0,
    0,
    canvas.width,
    canvas.height - 300
  );
  ctx.drawImage(
    moon,
    0,
    0,
    imageWidth,
    imageHeight,
    0,
    0,
    canvas.width - 20,
    canvas.height - 100
  );
  ctx.drawImage(
    factory,
    0,
    0,
    imageWidth,
    imageHeight,
    0,
    86,
    canvas.width,
    canvas.height - 200
  );
  ctx.drawImage(
    dirt,
    0,
    0,
    imageWidth,
    imageHeight,
    0,
    0,
    canvas.width,
    canvas.height
  );
  ctx.drawImage(
    clouds,
    0,
    0,
    imageWidth,
    imageHeight,
    50,
    0,
    canvas.width,
    canvas.height - 100
  );
  ctx.drawImage(
    ship,
    0,
    0,
    imageWidth,
    imageHeight,
    0,
    170,
    canvas.width * 0.8,
    canvas.height * 0.8
  );
  ctx.drawImage(
    shopMenu,
    0,
    0,
    470,
    538,
    canvas.width * 0.48,
    canvas.height * 0.022,
    470,
    538
  );
  ctx.drawImage(
    buyButton.image,
    buyButton.sx,
    buyButton.sy,
    buyButton.dx,
    buyButton.dy,
    buyButton.x,
    buyButton.y,
    buyButton.width,
    buyButton.height
  );
  ctx.fillStyle = "white";
  ctx.font = "17px Orbitron";
  ctx.textAlign = "center";
  ctx.fillText("BUY", 370 + 34, 497);
  ctx.textAlign = "left";
  ctx.font = "45px Orbitron";
  ctx.fillText("SHOP", 507, 95);
  let selectedItem = null;
  for (let i = 0; i < 16; i++) {
    if (items[i].selected) {
      selectedItem = items[i];
      ctx.font = "16px Orbitron";
      let description = selectedItem.description.split("\n");
      for (let j = 0; j < description.length; j++) {
        ctx.fillText(description[j], 467, 474 + j * 20);
      }
      ctx.textAlign = "center";
      let cost = "$" + items[i].cost;
      //(865-815)/2 = 840
      ctx.font = "15px Orbitron";
      ctx.fillStyle = "gold";
      ctx.fillText(cost, 840, 495);
      ctx.fillStyle = "white";
      ctx.font = "17px Orbitron";
      let name = selectedItem.name.split("\n");
      if (name.length > 1) {
        for (let j = 0; j < name.length; j++) {
          ctx.fillText(name[j], 822, 170 + j * 20);
        }
      } else {
        ctx.fillText(items[i].name, 822, 180);
      }
      ctx.textAlign = "left";
    }
  }
}
let healthPotion = {
  name: "Health\nPotion",
  description: "Replenish all defenders' health back\nto 100%",
  cost: 200,
  sx: 35,
  sy: 228,
  dx: canvas.width * 0.48 + 35,
  dy: canvas.height * 0.022 + 228,
  x: 467, //68
  y: 240, //68
  width: 64,
  height: 64,
  active: false,
  selected: false,
  bought: false, //true when bought, after used, should revert back to false
  amount: 0, //amount of an item a player has
};
let healthCrystals = {
  name: "Health\nCrystals",
  description: "Expand all defenders' maximum\nhealth by 10%",
  cost: 50,
  sx: 35 + 68,
  sy: 228,
  dx: canvas.width * 0.48 + 35 + 68,
  dy: canvas.height * 0.022 + 228,
  x: 467 + 68, //68
  y: 240, //68
  width: 64,
  height: 64,
  active: false,
  selected: false,
  bought: false, //true when bought, after used, should revert back to false
  amount: 0, //amount of an item a player has
};
let powerBullets = {
  name: "Power\nBullets",
  description: "Make bullets 15% more destructive",
  cost: 25,
  sx: 35 + 68 * 2,
  sy: 228,
  dx: canvas.width * 0.48 + 35 + 68 * 2,
  dy: canvas.height * 0.022 + 228,
  x: 467 + 68 * 2, //68
  y: 240, //68
  width: 64,
  height: 64,
  active: false,
  selected: false,
  bought: false, //true when bought, after used, should revert back to false
  amount: 0, //amount of an item a player has
};
let speedBullets = {
  name: "Speed\nBullets",
  description: "Increase the speed of bullets by 10%",
  cost: 10,
  sx: 35 + 68 * 3,
  sy: 228,
  dx: canvas.width * 0.48 + 35 + 68 * 3,
  dy: canvas.height * 0.022 + 228,
  x: 467 + 68 * 3, //68
  y: 240, //68
  width: 64,
  height: 64,
  active: false,
  selected: false,
  bought: false, //true when bought, after used, should revert back to false
  amount: 0, //amount of an item a player has
};
let goldenFin = {
  name: "Golden\nFin",
  description: "Earn twice as many resources from\nevery enemy defeated",
  cost: 100,
  sx: 35 + 68 * 4,
  sy: 228,
  dx: canvas.width * 0.48 + 35 + 68 * 4,
  dy: canvas.height * 0.022 + 228,
  x: 467 + 68 * 4, //68
  y: 240, //68
  width: 64,
  height: 64,
  active: false,
  selected: false,
  bought: false, //true when bought, after used, should revert back to false
  amount: 0, //amount of an item a player has
  multiplier: 1,
};
let grenade = {
  name: "Grenade",
  description: "Immediately destroy all enemies on\nscreen in one use",
  cost: 400,
  sx: 35 + 68 * 5,
  sy: 228,
  dx: canvas.width * 0.48 + 35 + 68 * 5,
  dy: canvas.height * 0.022 + 228,
  x: 467 + 68 * 5, //68
  y: 240, //68
  width: 64,
  height: 64,
  active: false,
  selected: false,
  bought: false, //true when bought, after used, should revert back to false
  amount: 0, //amount of an item a player has
};
let honey = {
  name: "Honey",
  description: "Slow enemies down by 20% by\nspreading honey on the ground",
  cost: 30,
  sx: 35,
  sy: 228 + 68,
  dx: canvas.width * 0.48 + 35,
  dy: canvas.height * 0.022 + 228 + 68,
  x: 467, //68
  y: 240 + 68, //68
  width: 64,
  height: 64,
  active: false,
  selected: false,
  bought: false, //true when bought, after used, should revert back to false
  amount: 0, //amount of an item a player has
};
let sharpShooter = {
  name: "Sharp\nShooter",
  description: "Upgrade guns to reload faster by 10%",
  cost: 25,
  sx: 35 + 68,
  sy: 228 + 68,
  dx: canvas.width * 0.48 + 35 + 68,
  dy: canvas.height * 0.022 + 228 + 68,
  x: 467 + 68, //68
  y: 240 + 68, //68
  width: 64,
  height: 64,
  active: false,
  selected: false,
  bought: false, //true when bought, after used, should revert back to false
  amount: 0, //amount of an item a player has
};
let rocks = {
  //TODO: implement some luck for this item using Math.rand. Item should only be bought once
  name: "Rocks",
  description: "They're rocks. Maybe they're lucky.",
  cost: 5,
  sx: 35 + 68 * 2,
  sy: 228 + 68,
  dx: canvas.width * 0.48 + 35 + 68 * 2,
  dy: canvas.height * 0.022 + 228 + 68,
  x: 467 + 68 * 2, //68
  y: 240 + 68, //68
  width: 64,
  height: 64,
  active: false,
  selected: false,
  bought: false, //true when bought, after used, should revert back to false
  amount: 0, //amount of an item a player has
};
let parasite = {
  name: "Parasite",
  description: "Enemies take continual damage for\nthe next 120 seconds",
  cost: 50,
  sx: 35 + 68 * 3,
  sy: 228 + 68,
  dx: canvas.width * 0.48 + 35 + 68 * 3,
  dy: canvas.height * 0.022 + 228 + 68,
  x: 467 + 68 * 3, //68
  y: 240 + 68, //68
  width: 64,
  height: 64,
  active: false,
  selected: false,
  bought: false, //true when bought, after used, should revert back to false
  amount: 0, //amount of an item a player has
};
let basicArmor = {
  name: "Basic\nArmor",
  description: "Protects defenders for 50 health\npoints",
  cost: 100,
  sx: 35 + 68 * 4,
  sy: 228 + 68,
  dx: canvas.width * 0.48 + 35 + 68 * 4,
  dy: canvas.height * 0.022 + 228 + 68,
  x: 467 + 68 * 4, //68
  y: 240 + 68, //68
  width: 64,
  height: 64,
  active: false,
  selected: false,
  bought: false, //true when bought, after used, should revert back to false
  amount: 0, //amount of an item a player has
};
let advancedArmor = {
  name: "Advanced\nArmor",
  description: "Protects defenders for 200 health\npoints",
  cost: 300,
  sx: 35 + 68 * 5,
  sy: 228 + 68,
  dx: canvas.width * 0.48 + 35 + 68 * 5,
  dy: canvas.height * 0.022 + 228 + 68,
  x: 467 + 68 * 5, //68
  y: 240 + 68, //68
  width: 64,
  height: 64,
  active: false,
  selected: false,
  bought: false, //true when bought, after used, should revert back to false
  amount: 0, //amount of an item a player has
};
let freezeBlast = {
  name: "Freeze\nBlast",
  description: "Freeze all on-screen enemies in place\nfor 30 seconds",
  cost: 150,
  sx: 35 + 68 * 0,
  sy: 228 + 68 * 2,
  dx: canvas.width * 0.48 + 35 + 68 * 0,
  dy: canvas.height * 0.022 + 228 + 68 * 2,
  x: 467 + 68 * 0, //68
  y: 240 + 68 * 2, //68
  width: 64,
  height: 64,
  active: false,
  selected: false,
  bought: false, //true when bought, after used, should revert back to false
  amount: 0, //amount of an item a player has
};
let defenseBlast = {
  name: "Defense\nBlast",
  description: "Enemy attacks have 25% less effect\non defenders",
  cost: 75,
  sx: 35 + 68 * 1,
  sy: 228 + 68 * 2,
  dx: canvas.width * 0.48 + 35 + 68 * 1,
  dy: canvas.height * 0.022 + 228 + 68 * 2,
  x: 467 + 68 * 1, //68
  y: 240 + 68 * 2, //68
  width: 64,
  height: 64,
  active: false,
  selected: false,
  bought: false, //true when bought, after used, should revert back to false
  amount: 0, //amount of an item a player has
};
let amuletOfImmunity = {
  name: "Amulet of\nImmunity",
  description: "Defenders earn complete immunity\nfor 60 seconds",
  cost: 150,
  sx: 35 + 68 * 2,
  sy: 228 + 68 * 2,
  dx: canvas.width * 0.48 + 35 + 68 * 2,
  dy: canvas.height * 0.022 + 228 + 68 * 2,
  x: 467 + 68 * 2, //68
  y: 240 + 68 * 2, //68
  width: 64,
  height: 64,
  active: false,
  selected: false,
  bought: false, //true when bought, after used, should revert back to false
  amount: 0, //amount of an item a player has
};
let dustStorm = {
  name: "Dust\nStorm",
  description: "50% less enemies spawn for the next\n60 seconds",
  cost: 200,
  sx: 35 + 68 * 3,
  sy: 228 + 68 * 2,
  dx: canvas.width * 0.48 + 35 + 68 * 3,
  dy: canvas.height * 0.022 + 228 + 68 * 2,
  x: 467 + 68 * 3, //68
  y: 240 + 68 * 2, //68
  width: 64,
  height: 64,
  active: false,
  selected: false,
  bought: false, //true when bought, after used, should revert back to false
  amount: 0, //amount of an item a player has
};
let items = [
  healthPotion,
  healthCrystals,
  powerBullets,
  speedBullets,
  goldenFin,
  grenade,
  honey,
  sharpShooter,
  rocks,
  parasite,
  basicArmor,
  advancedArmor,
  freezeBlast,
  defenseBlast,
  amuletOfImmunity,
  dustStorm,
];
function chooseIcon() {
  for (let i = 0; i < 16; i++) {
    if (
      //checks to see if mouse is hovered over item and the item is active
      (collision(mouse, items[i]) &&
        state == gameState.SHOP &&
        !(mouse.x in window || mouse.y in window) &&
        items[i].active) ||
      items[i].selected //&& !items[i].active
    ) {
      if (mouse.clicked && state == gameState.SHOP) {
        for (let j = 0; j < 16; j++) {
          items[j].selected = false; //ensures that every other item is not selected
        }
        items[i].selected = true;
        //select the icon and keep it highlighted while others are highlighted from hovering
      }
      ctx.drawImage(
        shopHoveredIcons,
        items[i].sx,
        items[i].sy,
        items[i].width,
        items[i].height,
        items[i].dx,
        items[i].dy,
        items[i].width,
        items[i].height
      );
    } else if (!items[i].active) {
      ctx.drawImage(
        shopInactiveIcons,
        items[i].sx,
        items[i].sy,
        items[i].width,
        items[i].height,
        items[i].dx,
        items[i].dy,
        items[i].width,
        items[i].height
      );
    }
    if (
      collision(mouse, buyButton) &&
      state == gameState.SHOP &&
      !(mouse.x in window || mouse.y in window) &&
      buyButton.active
    ) {
      ctx.drawImage(buyButton.hover, 0, 0, 128, 128, 370, 458, 68, 68);
      ctx.fillStyle = "white";
      ctx.font = "17px Orbitron";
      ctx.textAlign = "center";
      ctx.fillText("BUY", 370 + 34, 497);
      ctx.textAlign = "left";
      if (mouse.clicked && state == gameState.SHOP) {
        for (let j = 0; j < 16; j++) {
          if (
            items[j].selected &&
            mouse.clicked &&
            numberOfResources >= items[j].cost
          ) {
            items[j].bought = true;
          } //the amount of times that item was bought is increased by 1
        }
      }
    } else if (!buyButton.active) {
      ctx.drawImage(buyButton.inactive, 0, 0, 128, 128, 370, 458, 68, 68);
      ctx.fillStyle = "white";
      ctx.font = "17px Orbitron";
      ctx.textAlign = "center";
      ctx.fillText("BUY", 370 + 34, 497);
      ctx.textAlign = "left";
    }
  }
  for (let i = 0; i < 16; i++) {
    //adds 1 to amount of an item bought
    if (items[i].bought && !mouse.clicked) {
      items[i].amount++;
      //if(numberOfResources >= items[i].cost){}
      numberOfResources -= items[i].cost;
      //subtract the amount of cost of the item for the resources
      items[i].bought = false;
    }
  }
}
//Menu Animations
//sprites & objects for flying and flying/shooting defenders
//sprites & objects for enemies moving
//objects
const defender1flying = new Image();
defender1flying.src = "sprites/menu/defender1flying.png";
const defender2flying = new Image();
defender2flying.src = "sprites/menu/defender2flying.png";
class MenuAnimation {
  constructor(x, y, defender, verticalPosition) {
    //animationType?
    this.x = x;
    this.y = y;
    this.width = cellSize - cellGap * 2;
    this.height = cellSize - cellGap * 2;
    this.speed = Math.random() * 1 + 1.8;
    this.frameX = 0;
    this.frameY = 0;
    this.spriteWidth = 194;
    this.spriteHeight = 194;
    this.minFrame = 0;
    if (defender === 1) this.maxFrame = 6;
    else this.maxFrame = 7;
    this.defender = defender;
    this.verticalPosition = verticalPosition;
    //this.animationType = animationType;
  }
  draw() {
    let defender;
    if (this.defender === 1) defender = defender1flying;
    else defender = defender2flying;
    ctx.drawImage(
      defender,
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
  update() {
    this.x += this.speed;
    //Math.random() * 0.2 + 1.8;
    if (frame % 10 === 0) {
      if (this.frameX > this.minFrame) this.frameX--;
      else this.frameX = this.maxFrame;
    }
  }
}
function handleMenuAnimations() {
  for (let i = 0; i < menuSprites.length; i++) {
    menuSprites[i].update();
    menuSprites[i].draw();
    if (menuSprites[i].x >= canvas.width + 20) {
      menuSprites.splice(i, 1);
      i--;
    }
  }
  if (
    frame % menuSpriteInterval === 4 &&
    (state == gameState.MENU ||
      state == gameState.WIN ||
      state == gameState.GAMEOVER ||
      state == gameState.SHOP)
  ) {
    let verticalPosition = Math.random() * (canvas.height - 300) + 200;
    menuSprites.push(
      new MenuAnimation(-150, verticalPosition, Math.ceil(Math.random() * 2))
    );
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
    if (state == gameState.GAME) {
      reset();
    } else if (state == gameState.PAUSE) {
      state = gameState.MENU;
    }
  }
}

//reset the game after a game over or win
function reset() {
  defenders = [];
  defenderPositions = [];
  enemies = [];
  enemyPositions = [];
  shooters = [];
  shooterPositions = [];
  projectiles = [];
  resources = [];
  menuSprites = [];
  score = 0;
  frame = 1;
  numberOfResources = maxResources;
  enemiesInterval = maxEnemiesInterval;
  shootersInterval = maxShootersInterval;
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
      handleEnemies();
      handleShooters();
      handleProjectiles();
      handleFeatures();
      chooseDefender();
      handleGameStatus();
      handleFloatingMessages();
      drawPause(true);
      drawSound(mute);
      drawShopButton();
      menuAnimation = [];
      frame++;
      break;
    case gameState.MENU:
      menu = new Menu();
      menu.draw();
      handleMenuAnimations();
      button = new Button();
      button.draw();
      ctx.fillStyle = "white";
      ctx.font = "40px Orbitron";
      ctx.fillText("START", 372, 485);
      clickButton(gameState.GAME);
      drawSound(mute);
      frame++;
      break;
    case gameState.GAMEOVER:
      ctx.fillStyle = "white";
      ctx.font = "90px Orbitron";
      ctx.drawImage(
        menuBackground,
        0,
        0,
        2048,
        1536,
        0,
        0,
        canvas.width,
        canvas.height
      );
      handleMenuAnimations();
      ctx.fillText("GAME OVER", 130, 200);
      button = new Button();
      button.draw();
      ctx.font = "40px Orbitron";
      ctx.fillText("MAIN MENU", 320, 485);
      clickButton(gameState.MENU);
      drawSound(mute);
      //reset();
      frame++;
      break;
    case gameState.WIN:
      ctx.fillStyle = "white";
      ctx.font = "60px Orbitron";
      ctx.drawImage(
        menuBackground,
        0,
        0,
        2048,
        1536,
        0,
        0,
        canvas.width,
        canvas.height
      );
      handleMenuAnimations();
      ctx.fillText("LEVEL COMPLETE", 130, 200);
      ctx.font = "30px Orbitron";
      ctx.fillText("You win with " + score + " points!", 267, 300);
      button = new Button();
      button.draw();
      ctx.font = "40px Orbitron";
      ctx.fillText("MAIN MENU", 320, 485);
      clickButton(gameState.MENU);
      //reset();
      drawSound(mute);
      frame++;
      break;
    case gameState.PAUSE:
      tile();
      background();
      handleFeatures();
      chooseDefender();
      handleGameStatus();
      drawSound(mute);
      drawPause();
      ctx.fillStyle = "white";
      ctx.font = "90px Orbitron";
      ctx.fillText("GAME PAUSED", 70, 350);
      button = new Button();
      button.draw();
      ctx.font = "40px Orbitron";
      ctx.fillText("QUIT", 400, 485);
      clickButton(gameState.MENU);
      break;
    case gameState.SHOP:
      drawShop();
      handleMenuAnimations();
      drawSound(mute);
      chooseIcon();
      handleGameStatus(true);
      drawShopButton();
      //frame++; //may want to remove
      // ctx.font = "40px Orbitron";
      // ctx.fillText("QUIT", 400, 485);
      break;
  }
  //fps check
  const currentTime = new Date();
  console.log(Math.floor((currentTime - startTime) / 1000));
  // if (Math.floor(((currentTime - startTime) / 1000)) % 10 == 0)
  //   console.log((currentTime - startTime) / 1000);
  requestAnimationFrame(animate);
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

//sound & music
let backgroundMusic = new Audio("sound/Wound of The Cosmos.mp3");
function playMusic(mute) {
  try {
    if (!mute) {
      backgroundMusic.play();
    } else {
      backgroundMusic.pause();
    }
  } catch (e) {}
  //playMusic(); //need to loop somehow
}
