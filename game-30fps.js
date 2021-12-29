/**
 * GLOBAL VARIABLES AND SETTINGS
 */
const canvas = document.querySelector("#canvas1");
const ctx = canvas.getContext("2d");
canvas.width = 900;
canvas.height = 700;

const fpsMultiplier = 2;
const cellSize = 100;
const cellGap = 2;
let frame = 480;
let numberOfResources = 300;
let actualWave = 1;
let enemiesInterval = 600;
let score = 0;
let winningScore = 110;
let chosenDefender = 0;

let numberOfLoses = 0;
let gameRunning = false;
let gameInPause = true;

let bossComing = false;

const gameGrid = [];
const defenders = [];
const enemies = [];
const enemiesVerticalPosition = [];
const projectiles = [];
const bagsOfResources = [];
const deathAnimations = [];

let userFirstInteraction = false;
let touchscreen = false;

/**
 * GLOBAL IMAGES
 */
const purseImage = new Image();
purseImage.src = "./assets/images/purse.png";
const messageIntroImage = new Image();
messageIntroImage.src = "./assets/images/message-intro-image.png";
const ZbraaaProductionImage = new Image();
ZbraaaProductionImage.src = "./assets/images/zbraaa-production-image.png";
const mainMenuImage = new Image();
mainMenuImage.src = "./assets/images/main-menu-image.png";
const didacticielImage = new Image();
didacticielImage.src = "./assets/images/didacticiel-menu-image.png";
const backgroundImage = new Image();
backgroundImage.src = "./assets/images/background-image.png";
const backgroundImageBrokenDoor = new Image();
backgroundImageBrokenDoor.src = "./assets/images/background-image-broken-door.png";
const defeatImage = new Image();
defeatImage.src = "./assets/images/defeat-image.png";
const victoryImage = new Image();
victoryImage.src = "./assets/images/victory-image.png";
const defaiteBdImage = new Image();
defaiteBdImage.src = "./assets/images/defaite-bd.png";
const defaiteBdImage2 = new Image();
defaiteBdImage2.src = "./assets/images/defaite-bd-2.png";
const victoireBdImage = new Image();
victoireBdImage.src = "./assets/images/victoire-bd.png";

/**
 * GLOBAL AUDIO
 */
const mainMenuMusic = new Audio("./assets/audio/main-menu-music.mp3");
mainMenuMusic.loop = true;
mainMenuMusic.volume = 0.7;
const battleMusic = new Audio("./assets/audio/battle-music.mp3");
battleMusic.loop = true;
battleMusic.volume = 0.7;
const bossMusic = new Audio("./assets/audio/boss-music.mp3");
bossMusic.loop = true;
bossMusic.volume = 0.6;
const victoryMenuMusic = new Audio("./assets/audio/victory-menu-music.mp3");
victoryMenuMusic.loop = true;
victoryMenuMusic.volume = 0.7;
const defeatMenuMusic = new Audio("./assets/audio/defeat-menu-music.mp3");
defeatMenuMusic.loop = true;
defeatMenuMusic.volume = 0.7;

/**
 * MOUSE MANAGEMENT
 */
const mouse = {
    x: undefined,
    y: undefined,
    width: -0.1,
    height: -0.1,
    clicked: false
};
let canvasPosition = canvas.getBoundingClientRect();
if (window.innerWidth <= 1024) touchscreen = true;
window.addEventListener("resize", function() {
    canvasPosition = canvas.getBoundingClientRect();
    if (window.innerWidth <= 1024) touchscreen = true;
    else touchscreen = false;
});
canvas.addEventListener("mousemove", function(event) {
    mouse.x = event.x - canvasPosition.left;
    mouse.y = event.y - canvasPosition.top;
});
canvas.addEventListener("mouseleave", function() {
    mouse.x = undefined;
    mouse.y = undefined;
});
let clickLatency = false;
canvas.addEventListener("mouseup", function(e) {
    if (!clickLatency) {
        clickLatency = true;
        if (e.button === 0) mouse.clicked = true;
        if (e.button === 2 && gameRunning && !gameInPause) chosenDefender = 0;
        setTimeout(() => {
            mouse.clicked = false;
            clickLatency = false;
        }, 40);
    }
});
canvas.addEventListener("contextmenu", function(e) {
    e.preventDefault();
});

/**
 * GAME BOARD
 */
const controlsBarTop = {
    width: canvas.width,
    height: cellSize
};
const controlsBarBot = {
    width: canvas.width,
    height: cellSize
};
class Cell {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = cellSize;
        this.height = cellSize;
    }
    draw() {
        if (mouse.x && mouse.y && collision(this, mouse) && mouse.x > 100 && mouse.x < 700 && !touchscreen) {
            const chevalier = defendersMeleeUnits.chevalier;
            const arbaletrier = defendersRangeUnits.arbaletrier;
            // ctx.strokeStyle = "black";
            // ctx.strokeRect(this.x, this.y, this.width, this.height);
            switch (chosenDefender) {
                case 2:
                    ctx.drawImage(arbaletrier.spriteSheet, 0 * arbaletrier.spriteWidth, 0, arbaletrier.spriteWidth, arbaletrier.spriteHeight, this.x - arbaletrier.drawModifierX, this.y - arbaletrier.drawModifierY, this.width + arbaletrier.drawSizeModifier, this.height + arbaletrier.drawSizeModifier);
                break;
                case 1:
                    ctx.drawImage(chevalier.spriteSheet, 0 * chevalier.spriteWidth, 0, chevalier.spriteWidth, chevalier.spriteHeight, this.x - chevalier.drawModifierX, this.y - chevalier.drawModifierY, this.width + chevalier.drawSizeModifier, this.height + chevalier.drawSizeModifier);
                break;
                default:
                break;
            }
        }
    }
}
function createGrid() {
    for (let y = cellSize ; y < canvas.height - cellSize ; y += cellSize) {
        for (let x = 0 ; x < canvas.width ; x += cellSize) {
            gameGrid.push(new Cell(x, y));
        }
    }
}
createGrid();
function handleGameGrid() {
    for (let i = 0 ; i < gameGrid.length ; i++) {
        gameGrid[i].draw();
    }
}

/**
 * HANDLE COLLISIONS FUNCTIONS
 */
 function collision(first, second) {
    if (!(
        first.x > second.x + second.width ||
        first.x + first.width < second.x ||
        first.y > second.y + second.height ||
        first.y + first.height < second.y
        )) {
            return true;
    }
}
function collisionBetweenMouseAndEnemies(first, mouse) {
    const second = {...mouse};
    second.x = second.x - (second.x % cellSize) + cellGap;
    second.y = second.y - (second.y % cellSize) + cellGap;
    second.width = 40;
    second.height = cellSize - cellGap;
    if (!(
        first.x > second.x + second.width ||
        first.x + first.width < second.x ||
        first.y > second.y + second.height ||
        first.y + first.height < second.y
        )) {
            return true;
    }
}

/**
 * PROJECTILES
 */
const carreau = new Image();
carreau.src = "./assets/images/carreau.png";
class Projectile {
    constructor(x, y, projectileDamage) {
        this.x = x;
        this.y = y;
        this.width = 32;
        this.height = 32;
        this.speed = 5 * fpsMultiplier;
        this.damage = projectileDamage;
    }
    update() {
        this.x += this.speed;
    }
    draw() {
        ctx.drawImage(carreau, this.x, this.y, this.width, this.height);
    }
}
function handleProjectiles() {
    for (let i = 0 ; i < projectiles.length ; i++) {
        projectiles[i].update();
        projectiles[i].draw();
        for (let j = 0 ; j < enemies.length ; j++) {
            if (enemies[j] && projectiles[i] && collision(projectiles[i], enemies[j])) {
                enemies[j].actualHealth -= projectiles[i].damage;
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

/**
 * DEFENDERS UNITS
 */
const defendersMeleeUnits = {
    chevalier: {
        spriteSheet: new Image(),
        hitAttackFrameSoundFile: "chevalier-attack-sound.mp3",
        hitAttackFrameSoundVolume: 0.2,
        deathSoundFile: "chevalier-death-sound.mp3",
        deathSoundVolume: 0.5,
        spriteWidth: 522,
        spriteHeight: 432,
        drawSizeModifier: 40,
        drawModifierX: 20,
        drawModifierY: 40,
        idleSpeedAnimation: 6,
        attackSpeedAnimation: 8,
        deathSpeedAnimation: 8,
        minIdleFrame: 0,
        maxIdleFrame: 5,
        minAttackFrame: 6,
        hitAttackFrame: 8,
        maxAttackFrame: 11,
        minDeathFrame: 12,
        maxDeathFrame: 17,
        cost: 100,
        type: "melee",
        health: 100,
        damage: 10
    }
};
defendersMeleeUnits.chevalier.spriteSheet.src = "./assets/images/spritesheet-chevalier.png";
const defendersRangeUnits = {
    arbaletrier: {
        spriteSheet: new Image(),
        hitAttackFrameSoundFile: "arbaletrier-shoot-sound.mp3",
        hitAttackFrameSoundVolume: 1,
        deathSoundFile: "chevalier-death-sound.mp3",
        deathSoundVolume: 0.5,
        spriteWidth: 522,
        spriteHeight: 432,
        drawSizeModifier: 45,
        drawModifierX: 22.5,
        drawModifierY: 45,
        idleSpeedAnimation: 6,
        attackSpeedAnimation: 8,
        deathSpeedAnimation: 8,
        minIdleFrame: 0,
        maxIdleFrame: 5,
        minAttackFrame: 6,
        hitAttackFrame: 12,
        maxAttackFrame: 18,
        minDeathFrame: 19,
        maxDeathFrame: 24,
        cost: 150,
        type: "range",
        health: 50,
        damage: 10
    }
};
defendersRangeUnits.arbaletrier.spriteSheet.src = "./assets/images/spritesheet-arbaletrier.png";

/**
 * DEFENDERS
 */
class Defender {
    constructor(x, y, unit) {
        this.x = x;
        this.y = y;
        this.width = cellSize - cellGap * 2;
        this.height = cellSize - cellGap * 2;
        this.spriteSheet = unit.spriteSheet;
        this.hitAttackFrameSound = new Audio(`./assets/audio/${unit.hitAttackFrameSoundFile}`);
        this.hitAttackFrameSound.volume = unit.hitAttackFrameSoundVolume;
        this.deathSound = new Audio(`./assets/audio/${unit.deathSoundFile}`);
        this.deathSound.volume = unit.deathSoundVolume;
        this.spriteWidth = unit.spriteWidth;
        this.spriteHeight = unit.spriteHeight;
        this.drawSizeModifier = unit.drawSizeModifier;
        this.drawModifierX = unit.drawModifierX;
        this.drawModifierY = unit.drawModifierY;
        this.actualFrame = 0;
        this.idleSpeedAnimation = unit.idleSpeedAnimation;
        this.attackSpeedAnimation = unit.attackSpeedAnimation;
        this.deathSpeedAnimation = unit.deathSpeedAnimation;
        this.minIdleFrame = unit.minIdleFrame;
        this.maxIdleFrame = unit.maxIdleFrame;
        this.minAttackFrame = unit.minAttackFrame;
        this.hitAttackFrame = unit.hitAttackFrame;
        this.maxAttackFrame = unit.maxAttackFrame;
        this.minDeathFrame = unit.minDeathFrame;
        this.maxDeathFrame = unit.maxDeathFrame;
        this.cost = unit.cost;
        this.type = unit.type;
        this.health = unit.health;
        this.damage = unit.damage;
        this.actualHealth = unit.health;
        this.inCombat = false;
        this.shootNow = false;
        this.dead = false;
    }
    update() {
        if (!this.inCombat) {
            if (this.actualFrame > this.maxIdleFrame) this.actualFrame = this.minIdleFrame;
            if (frame % this.idleSpeedAnimation === 0) {
                if (this.actualFrame < this.maxIdleFrame) this.actualFrame++;
                else this.actualFrame = this.minIdleFrame;
            }
        } else if (this.inCombat) {
            if (this.actualFrame < this.minAttackFrame || this.actualFrame > this.maxAttackFrame) this.actualFrame = this.minAttackFrame;
            if (frame % this.attackSpeedAnimation === 0) {
                if (this.actualFrame < this.maxAttackFrame) this.actualFrame++;
                else this.actualFrame = this.minAttackFrame;
                if (this.actualFrame === this.hitAttackFrame && this.type === "range") this.shootNow = true;
            }
        }
        if (this.inCombat && this.shootNow && this.type === "range") {
            projectiles.push(new Projectile(this.x + 70, this.y + 26, this.damage));
            this.hitAttackFrameSound.play();
            this.shootNow = false;
        }
        if (this.inCombat && this.actualFrame === this.hitAttackFrame) this.hitAttackFrameSound.play();
    }
    draw() {
        // ctx.fillStyle = "blue";
        // ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.drawImage(this.spriteSheet, this.actualFrame * this.spriteWidth, 0, this.spriteWidth, this.spriteHeight, this.x - this.drawModifierX, this.y - this.drawModifierY, this.width + this.drawSizeModifier, this.height + this.drawSizeModifier);
        ctx.fillStyle = "#0ee31c";
        ctx.font = "12px Comic Neue bold";
        ctx.shadowColor= "black";
        ctx.shadowBlur = 5;
        ctx.fillText(Math.floor(this.actualHealth), this.x + 15, this.y);
        ctx.shadowBlur = 0;
    }
}
function handleDefenders() {
    for (let i = 0 ; i < defenders.length ; i++) {
        defenders[i].update();
        defenders[i].draw();
        if(enemies.length === 0) {
            for (let i = 0 ; i < defenders.length ; i++) {
                defenders[i].inCombat = false;
            }
        }
        if (defenders[i].type === "range" && enemiesVerticalPosition.indexOf(defenders[i].y) === -1) defenders[i].inCombat = false;
        if (defenders[i] && defenders[i].actualHealth > 0) {
            for (let j = 0 ; j < enemies.length ; j++) {
                if (defenders[i].type === "range" && enemies[j].y === defenders[i].y && enemies[j].x > defenders[i].x) defenders[i].inCombat = true;
                if (defenders[i] && collision(defenders[i], enemies[j])) {
                    defenders[i].inCombat = true;
                    enemies[j].inCombat = true;
                    enemies[j].actualMovementSpeed = 0;
                    if(frame % 60 === 0) defenders[i].actualHealth -= enemies[j].damage;
                } else {
                    if (defenders[i].type === "melee") defenders[i].inCombat = false;
                }
                if (defenders[i].actualHealth <= 0) enemies[j].actualMovementSpeed = enemies[j].movementSpeed;
            }
        } else {
            deathAnimations.push({...defenders[i]});
            defenders[i].deathSound.play();
            defenders.splice(i, 1);
            i--;
        }
    }
}

/**
 * ENEMIES UNITS
 */
const enemiesUnitsList = [
    "gobelin",
    "orc"
];
const enemiesUnits = {
    gobelin: {
        spriteSheet: new Image(),
        hitAttackFrameSoundFile: "gobelin-attack-sound.mp3",
        hitAttackFrameSoundVolume: 0.2,
        deathSoundFile: "gobelin-death-sound.mp3",
        deathSoundVolume: 0.5,
        spriteWidth: 522,
        spriteHeight: 432,
        drawSizeModifier: 15,
        drawModifierX: 7.5,
        drawModifierY: 15,
        walkSpeedAnimation: 3,
        attackSpeedAnimation: 8,
        deathSpeedAnimation: 8,
        minWalkFrame: 0,
        maxWalkFrame: 5,
        minAttackFrame: 6,
        hitAttackFrame: 8,
        maxAttackFrame: 11,
        minDeathFrame: 12,
        maxDeathFrame: 17,
        reward: 40,
        type: "melee",
        health: 40,
        damage: 10,
        movementSpeedModifier: 1.2 * fpsMultiplier
    },
    orc: {
        spriteSheet: new Image(),
        hitAttackFrameSoundFile: "orc-attack-sound.mp3",
        hitAttackFrameSoundVolume: 0.2,
        deathSoundFile: "orc-death-sound.mp3",
        deathSoundVolume: 0.5,
        spriteWidth: 522,
        spriteHeight: 432,
        drawSizeModifier: 40,
        drawModifierX: 20,
        drawModifierY: 40,
        walkSpeedAnimation: 6,
        attackSpeedAnimation: 8,
        deathSpeedAnimation: 8,
        minWalkFrame: 0,
        maxWalkFrame: 5,
        minAttackFrame: 6,
        hitAttackFrame: 8,
        maxAttackFrame: 11,
        minDeathFrame: 12,
        maxDeathFrame: 17,
        reward: 70,
        type: "melee",
        health: 100,
        damage: 10,
        movementSpeedModifier: 1 * fpsMultiplier
    }
};
enemiesUnits.gobelin.spriteSheet.src = "./assets/images/spritesheet-gobelin.png";
enemiesUnits.orc.spriteSheet.src = "./assets/images/spritesheet-orc.png";
const bossUnits = {
    bossOrc: {
        spriteSheet: new Image(),
        hitAttackFrameSoundFile: "boss-attack-sound.mp3",
        hitAttackFrameSoundVolume: 0.2,
        deathSoundFile: "boss-death-sound.mp3",
        deathSoundVolume: 0.5,
        spriteWidth: 522,
        spriteHeight: 432,
        drawSizeModifier: 28,
        drawModifierX: 14,
        drawModifierY: 28,
        walkSpeedAnimation: 8,
        attackSpeedAnimation: 8,
        deathSpeedAnimation: 10,
        minWalkFrame: 0,
        maxWalkFrame: 5,
        minAttackFrame: 6,
        hitAttackFrame: 8,
        maxAttackFrame: 11,
        minDeathFrame: 12,
        maxDeathFrame: 20,
        reward: 200,
        type: "melee",
        health: 300,
        damage: 20,
        movementSpeedModifier: 0.6 * fpsMultiplier
    }
};
bossUnits.bossOrc.spriteSheet.src = "./assets/images/spritesheet-bossOrc.png";

/**
 * ENEMIES
 */
class Enemy {
    constructor(verticalPosition, unit) {
        this.x = canvas.width;
        this.y = verticalPosition;
        this.width = cellSize - cellGap * 2;
        this.height = cellSize - cellGap * 2;
        this.spriteSheet = unit.spriteSheet;
        this.hitAttackFrameSound = new Audio(`./assets/audio/${unit.hitAttackFrameSoundFile}`);
        this.hitAttackFrameSound.volume = unit.hitAttackFrameSoundVolume;
        this.deathSound = new Audio(`./assets/audio/${unit.deathSoundFile}`);
        this.deathSound.volume = unit.deathSoundVolume;
        this.spriteWidth = unit.spriteWidth;
        this.spriteHeight = unit.spriteHeight;
        this.drawSizeModifier = unit.drawSizeModifier;
        this.drawModifierX = unit.drawModifierX;
        this.drawModifierY = unit.drawModifierY;
        this.actualFrame = 0;
        this.walkSpeedAnimation = unit.walkSpeedAnimation;
        this.attackSpeedAnimation = unit.attackSpeedAnimation;
        this.deathSpeedAnimation = unit.deathSpeedAnimation;
        this.minWalkFrame = unit.minWalkFrame;
        this.maxWalkFrame = unit.maxWalkFrame;
        this.minAttackFrame = unit.minAttackFrame;
        this.hitAttackFrame = unit.hitAttackFrame;
        this.maxAttackFrame = unit.maxAttackFrame;
        this.minDeathFrame = unit.minDeathFrame;
        this.maxDeathFrame = unit.maxDeathFrame;
        this.reward = unit.reward;
        this.type = unit.type;
        this.health = unit.health;
        this.damage = unit.damage;
        this.movementSpeed = Math.random() * 0.2 + unit.movementSpeedModifier;
        this.actualHealth = unit.health;
        this.actualMovementSpeed = this.movementSpeed;
        this.inCombat = false;
        this.dead = false;
    }
    update() {
        this.x -= this.actualMovementSpeed;
        if (!this.inCombat) {
            this.actualMovementSpeed = this.movementSpeed;
            if (this.actualFrame > this.maxWalkFrame) this.actualFrame = this.minWalkFrame;
            if (frame % this.walkSpeedAnimation === 0) {
                if (this.actualFrame < this.maxWalkFrame) this.actualFrame++;
                else this.actualFrame = this.minWalkFrame;
            }
        } else if (this.inCombat) {
            if (this.actualFrame < this.minAttackFrame || this.actualFrame > this.maxAttackFrame) this.actualFrame = this.minAttackFrame;
            if (frame % this.attackSpeedAnimation === 0) {
                if (this.actualFrame < this.maxAttackFrame) this.actualFrame++;
                else this.actualFrame = this.minAttackFrame;
            }
        }
    }
    draw() {
        // ctx.fillStyle = "red";
        // ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.drawImage(this.spriteSheet, this.actualFrame * this.spriteWidth, 0, this.spriteWidth, this.spriteHeight, this.x - this.drawModifierX, this.y - this.drawModifierY, this.width + this.drawSizeModifier, this.height + this.drawSizeModifier);
        ctx.fillStyle = "red";
        ctx.font = "12px Comic Neue bold";
        ctx.shadowColor= "black";
        ctx.shadowBlur = 5;
        ctx.fillText(Math.floor(this.actualHealth), this.x + 70, this.y);
        ctx.shadowBlur = 0;
    }
}
function handleEnemies() {
    for (let i = 0 ; i < enemies.length ; i++) {
        enemies[i].update();
        enemies[i].draw();
        if (enemies[i].x < 100) {
            // enemies[i].actualHealth = 0;
            gameRunning = false;
            displayDefeatMessageBool = true;
        }
        if(defenders.length === 0) {
            for (let i = 0 ; i < enemies.length ; i++) {
                enemies[i].actualMovementSpeed = enemies[i].movementSpeed;
                enemies[i].inCombat = false;
            }
        }
        if (enemies[i] && enemies[i].actualHealth > 0) {
            for (let j = 0 ; j < defenders.length ; j++) {
                if (enemies[i] && collision(enemies[i], defenders[j])) {
                    enemies[i].inCombat = true;
                    defenders[j].inCombat = true;
                    enemies[i].actualMovementSpeed = 0;
                    if (frame % 60 === 0 && defenders[j].type === "melee") enemies[i].actualHealth -= defenders[j].damage;
                    if(enemies[i].actualFrame === enemies[i].hitAttackFrame) enemies[i].hitAttackFrameSound.play();
                } else {
                    enemies[i].inCombat = false;
                    enemies[i].actualMovementSpeed = enemies[i].movementSpeed;
                }
            }
        } else {
            deathAnimations.push({...enemies[i]});
            enemies[i].deathSound.play();
            floatingMessages.push(new FloatingMessage("+" + enemies[i].reward, enemies[i].x, enemies[i].y, 30, "gold"));
            numberOfResources += enemies[i].reward;
            score += enemies[i].reward;
            const thisEnemyVerticalPosition = enemiesVerticalPosition.indexOf(enemies[i].y);
            enemiesVerticalPosition.splice(thisEnemyVerticalPosition, 1);
            enemies.splice(i, 1);
            i--;
        }
    }
}

/**
 * HANDLE ENEMIES GENERATION
 */
function handleEnemiesGeneration() {
    const verticalPosition = Math.floor(Math.random() * 5 + 1) * cellSize + cellGap;
    const percentageForEnemy = Math.floor(Math.random() * 10 + 1) * 10;
    if (actualWave === 1 && frame % enemiesInterval === 0 && score < winningScore) {
        if (percentageForEnemy <= 70) {
            enemies.push(new Enemy(verticalPosition, enemiesUnits.gobelin));
            enemiesVerticalPosition.push(verticalPosition);
        } else {
            enemies.push(new Enemy(verticalPosition, enemiesUnits.orc));
            enemiesVerticalPosition.push(verticalPosition);
        }
        if (enemiesInterval > 120) enemiesInterval -= 30;
    } else if (actualWave === 1 && score >= winningScore && enemies.length === 0 && deathAnimations.length === 0) {
        gameInPause = true;
        announceNextWave = true;
        score = 0;
        winningScore = 220;
        frame = 480;
        enemiesInterval = 600;
        actualWave = 2;
    }
    if (actualWave === 2 && frame % enemiesInterval === 0 && score < winningScore) {
        if (percentageForEnemy <= 50) {
            enemies.push(new Enemy(verticalPosition, enemiesUnits.gobelin));
            enemiesVerticalPosition.push(verticalPosition);
        } else {
            enemies.push(new Enemy(verticalPosition, enemiesUnits.orc));
            enemiesVerticalPosition.push(verticalPosition);
        }
        if (enemiesInterval > 120) enemiesInterval -= 30;
    } else if (actualWave === 2 && score >= winningScore && enemies.length === 0 && deathAnimations.length === 0) {
        gameInPause = true;
        announceNextWave = true;
        score = 0;
        winningScore = 420;
        frame = 480;
        enemiesInterval = 600;
        actualWave = 3;
    }
    if (actualWave === 3 && frame % enemiesInterval === 0 && score < winningScore) {
        if (percentageForEnemy <= 30) {
            enemies.push(new Enemy(verticalPosition, enemiesUnits.gobelin));
            enemiesVerticalPosition.push(verticalPosition);
        } else {
            enemies.push(new Enemy(verticalPosition, enemiesUnits.orc));
            enemiesVerticalPosition.push(verticalPosition);
        }
        if (enemiesInterval > 120) enemiesInterval -= 30;
    } else if (actualWave === 3 && score >= winningScore && enemies.length === 0 && deathAnimations.length === 0) {
        gameRunning = false;
        displayVictoryMessageBool = true;
    }
    if (score >= 10 && !bossComing && actualWave === 3) {
        gameInPause = true;
        bossComing = true;
        bossDialogue = true;
        const bossVerticalPosition = Math.floor(Math.random() * 2 + 3) * cellSize + cellGap;
        setTimeout(() => {
            enemies.push(new Enemy(bossVerticalPosition, bossUnits.bossOrc));
            enemiesVerticalPosition.push(bossVerticalPosition);
        }, 7000);
    }
}

/**
 * RANDOM BAG OF RESOURCES GENERATION
 */
const bagImage = new Image();
bagImage.src = "./assets/images/spritesheet-bag.png";
const amounts = [40, 50, 60];
class BagOfResources {
    constructor() {
        this.x = Math.random() * (400) + 400;
        this.y = (Math.floor(Math.random() * 5) + 1) * cellSize + 45;
        this.width = cellSize * 0.5;
        this.height = cellSize * 0.5;
        this.spriteWidth = 52;
        this.spriteHeight = 52;
        this.minFrame = 0;
        this.maxFrame = 6;
        this.actualFrame = this.minFrame;
        this.amount = amounts[Math.floor(Math.random() * amounts.length)];
    }
    update() {
        if (frame % 7 === 0) {
            if (this.actualFrame < this.maxFrame) this.actualFrame++;
            else this.actualFrame = this.minFrame;
        }
    }
    draw() {
        ctx.drawImage(bagImage, this.actualFrame * this.spriteWidth, 0, this.spriteWidth, this.spriteHeight, this.x, this.y, this.width, this.height);
    }
}
function handleBagsOfResources() {
    if (frame % 500 === 0 && score < winningScore && frame > 1000) bagsOfResources.push(new BagOfResources);
    for (let i = 0 ; i < bagsOfResources.length ; i++) {
        bagsOfResources[i].update();
        bagsOfResources[i].draw();
        if (bagsOfResources[i] && mouse.x && mouse.y && collision(bagsOfResources[i], mouse)) {
            numberOfResources += bagsOfResources[i].amount;
            floatingMessages.push(new FloatingMessage("+" + bagsOfResources[i].amount, bagsOfResources[i].x, bagsOfResources[i].y, 30, "gold"));
            bagsOfResources.splice(i, 1);
            i--;
        }
    }
}

/**
 * HANDLE DEATH ANIMATIONS
 */
function handleDeathAnimations() {
    for (let i = 0 ; i < deathAnimations.length ; i++) {
        ctx.drawImage(deathAnimations[i].spriteSheet, deathAnimations[i].minDeathFrame * deathAnimations[i].spriteWidth, 0, deathAnimations[i].spriteWidth, deathAnimations[i].spriteHeight, deathAnimations[i].x - deathAnimations[i].drawModifierX, deathAnimations[i].y - deathAnimations[i].drawModifierY, deathAnimations[i].width + deathAnimations[i].drawSizeModifier, deathAnimations[i].height + deathAnimations[i].drawSizeModifier);
        if (frame % deathAnimations[i].deathSpeedAnimation === 0 && deathAnimations[i].minDeathFrame < deathAnimations[i].maxDeathFrame) deathAnimations[i].minDeathFrame++;
        if (deathAnimations[i].minDeathFrame === deathAnimations[i].maxDeathFrame) {
            deathAnimations.splice(i, 1);
        }
    }
}

/**
 * FLOATING MESSAGES
 */
const floatingMessages = [];
class FloatingMessage {
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
        ctx.font = this.size + "px Comic Neue bold";
        ctx.fillText(this.value, this.x, this.y);
        ctx.globalAlpha = 1;
    }
}
function handleFloatingMessages() {
    for (let i = 0 ; i < floatingMessages.length ; i++) {
        floatingMessages[i].update();
        floatingMessages[i].draw();
        if (floatingMessages[i].lifeSpan >= 50) {
            floatingMessages.splice(i, 1);
            i--;
        }
    }
}

/**
 * CHOOSE DEFENDER
 */
const chevalierCard = {
    x: 150,
    y: 10,
    width: 70,
    height: 70,
    image: new Image()
};
chevalierCard.image.src = "./assets/images/image-chevalier.png";
const arbaletrierCard = {
    x: 230,
    y: 10,
    width: 70,
    height: 70,
    image: new Image()
};
arbaletrierCard.image.src = "./assets/images/image-arbaletrier.png";
function chooseDefender() {
    let chevalierCardStroke = "black";
    let arbaletrierCardStroke = "black";
    if (collision(mouse, chevalierCard) && mouse.clicked) {
        if (!touchscreen) chosenDefender = 1;
        if (touchscreen && chosenDefender !== 1) chosenDefender = 1;
        else if (touchscreen && chosenDefender === 1) chosenDefender = 0;
    }
    if (collision(mouse, arbaletrierCard) && mouse.clicked) {
        if (!touchscreen) chosenDefender = 2;
        if (touchscreen && chosenDefender !== 2) chosenDefender = 2;
        else if (touchscreen && chosenDefender === 2) chosenDefender = 0;
    };
    if (chosenDefender === 1) {
        chevalierCardStroke = "gold";
        arbaletrierCardStroke = "black";
    } else if (chosenDefender === 2) {
        chevalierCardStroke = "black";
        arbaletrierCardStroke = "gold";
    } else {
        chevalierCardStroke = "black";
        arbaletrierCardStroke = "black";
    }
    ctx.lineWidth = 3;
    ctx.drawImage(chevalierCard.image, chevalierCard.x, chevalierCard.y, chevalierCard.width, chevalierCard.height);
    ctx.strokeStyle = chevalierCardStroke;
    ctx.strokeRect(chevalierCard.x, chevalierCard.y, chevalierCard.width, chevalierCard.height);
    ctx.drawImage(arbaletrierCard.image, arbaletrierCard.x, arbaletrierCard.y, arbaletrierCard.width, arbaletrierCard.height);
    ctx.strokeStyle = arbaletrierCardStroke;
    ctx.strokeRect(arbaletrierCard.x, arbaletrierCard.y, arbaletrierCard.width, arbaletrierCard.height);
}

/**
 * PLACE DEFENDER
 */
canvas.addEventListener("click", function() {
    const gridPositionX = mouse.x - (mouse.x % cellSize) + cellGap;
    const gridPositionY = mouse.y - (mouse.y % cellSize) + cellGap;
    if (chosenDefender === 0 || gameInPause) return;
    if (gridPositionX < 100 || gridPositionX > 700 || gridPositionY < 100 || gridPositionY > 600) return;
    for (let i = 0 ; i < defenders.length ; i++) {
        if (defenders[i].x === gridPositionX && defenders[i].y === gridPositionY) return;
    }
    for (let i = 0 ; i < enemies.length ; i++) {
        if (collisionBetweenMouseAndEnemies(enemies[i], mouse) && enemies[i].y - (enemies[i].y % cellSize) + cellGap === gridPositionY) {
            if (chosenDefender != 0) floatingMessages.push(new FloatingMessage("Ennemi trop proche", gridPositionX, gridPositionY, 20, "red"));
            return;
        }
    }
    let defenderCost = undefined;
    let unitToPush = undefined;
    switch (chosenDefender) {
        case 2:
            defenderCost = defendersRangeUnits.arbaletrier.cost;
            unitToPush = defendersRangeUnits.arbaletrier;
        break;
        case 1:
            defenderCost = defendersMeleeUnits.chevalier.cost;
            unitToPush = defendersMeleeUnits.chevalier;
        break;
        default:
            console.log("Valeur, de choix d'unité non traité");
        break;
    }
    if (numberOfResources >= defenderCost) {
        defenders.push(new Defender(gridPositionX, gridPositionY, unitToPush));
        numberOfResources -= defenderCost;
        chosenDefender = 0;
    } else {
        if (chosenDefender != 0) floatingMessages.push(new FloatingMessage("Pas assez d'or", gridPositionX, gridPositionY, 20, "gold"));
    }
});

/**
 * HANDLE GAME STATUS
 */
function handleGameStatus() {
    ctx.fillStyle = "gold";
    ctx.font = "19px Comic Neue bold";
    ctx.fillText(numberOfResources, 65, 64);
    ctx.fillStyle = "black";
    ctx.font = "17px Comic Neue bold";
    ctx.fillText(`Nombre d'échecs : ${numberOfLoses}`, 675, 72);
    ctx.fillStyle = "black";
    ctx.font = "30px Comic Neue bold";
    ctx.fillText(`Vague : ${actualWave} / 3`, 675, 50);
}

/**
 * DISPLAY AND HANDLE MENUS
 */
// Buttons
const buttonJouer = {
    x: 320,
    y: 305,
    width: 307,
    height: 64,
    image: new Image()
};
buttonJouer.image.src = "./assets/images/button-jouer.png";
const buttonDidacticiel = {
    x: 320,
    y: 380,
    width: 307,
    height: 64,
    image: new Image()
};
buttonDidacticiel.image.src = "./assets/images/button-didacticiel.png";
const buttonMenuPrincipal = {
    x: 297,
    y: 630,
    width: 307,
    height: 64,
    image: new Image()
};
buttonMenuPrincipal.image.src = "./assets/images/button-menu-principal.png";
const buttonCommencer = {
    x: 297,
    y: 480,
    width: 307,
    height: 64,
    image: new Image()
};
buttonCommencer.image.src = "./assets/images/button-commencer.png";
// Menus
let displayZbraaProductionBool = true;
let displayZbraaProductionSetTimeout = true;
let messageIntroMenuBool = false;
let mainMenuBool = false;
let didacticielMenuBool = false;
let defeatMenuBool = false;
let victoryMenuBool = false;
function displayZbraaProduction() {
    ctx.drawImage(ZbraaaProductionImage, 0, 0);
    if (displayZbraaProductionSetTimeout) {
        setTimeout(() => {
            displayZbraaProductionBool = false;
            messageIntroMenuBool = true;
        }, 3000);
    }
    displayZbraaProductionSetTimeout = false;
}
function messageIntroMenu() {
    ctx.drawImage(messageIntroImage, 0, 0);
    ctx.drawImage(buttonCommencer.image, buttonCommencer.x, buttonCommencer.y, buttonCommencer.width, buttonCommencer.height);
    if (mouse.x && mouse.y && collision(mouse, buttonCommencer)) {
        ctx.drawImage(buttonCommencer.image, buttonCommencer.x - 3, buttonCommencer.y - 3, buttonCommencer.width + 6, buttonCommencer.height + 6);
    }
    if (collision(mouse, buttonCommencer) && mouse.clicked) {
        userFirstInteraction = true;
        messageIntroMenuBool = false;
        mainMenuBool = true;
    }
}
function mainMenu() {
    ctx.drawImage(mainMenuImage, 0, 0);
    buttonJouer.y = 305;
    ctx.drawImage(buttonJouer.image, buttonJouer.x, buttonJouer.y, buttonJouer.width, buttonJouer.height);
    ctx.drawImage(buttonDidacticiel.image, buttonDidacticiel.x, buttonDidacticiel.y, buttonDidacticiel.width, buttonDidacticiel.height);
    if (userFirstInteraction && mainMenuMusic.paused) {
        mainMenuMusic.currentTime = 0;
        mainMenuMusic.play();
    }
    if (mouse.x && mouse.y && collision(mouse, buttonJouer)) {
        ctx.drawImage(buttonJouer.image, buttonJouer.x - 3, buttonJouer.y - 3, buttonJouer.width + 6, buttonJouer.height + 6);
    }
    if (collision(mouse, buttonJouer) && mouse.clicked) {
        userFirstInteraction = true;
        if (mainMenuMusic.paused) {
            mainMenuMusic.play();
        }
        mainMenuBool = false;
        gameRunning = true;
    }
    if (mouse.x && mouse.y && collision(mouse, buttonDidacticiel)) {
        ctx.drawImage(buttonDidacticiel.image, buttonDidacticiel.x - 3, buttonDidacticiel.y - 3, buttonDidacticiel.width + 6, buttonDidacticiel.height + 6);
    }
    if (collision(mouse, buttonDidacticiel) && mouse.clicked) {
        userFirstInteraction = true;
        if (mainMenuMusic.paused) {
            mainMenuMusic.play();
        }
        mainMenuBool = false;
        didacticielMenuBool = true;
    }
}
function didacticielMenu() {
    buttonJouer.y = 595;
    ctx.drawImage(didacticielImage, 0, 0);
    ctx.drawImage(buttonJouer.image, buttonJouer.x, buttonJouer.y, buttonJouer.width, buttonJouer.height);
    if (mouse.x && mouse.y && collision(mouse, buttonJouer)) {
        ctx.drawImage(buttonJouer.image, buttonJouer.x - 3, buttonJouer.y - 3, buttonJouer.width + 6, buttonJouer.height + 6);
    }
    if (collision(mouse, buttonJouer) && mouse.clicked) {
        didacticielMenuBool = false;
        gameRunning = true;
    }
}
function defeatMenu() {
    if (numberOfLoses === 0) ctx.drawImage(defaiteBdImage, 0, 0);
    else ctx.drawImage(defaiteBdImage2, 0, 0);
    ctx.drawImage(buttonMenuPrincipal.image, buttonMenuPrincipal.x, buttonMenuPrincipal.y, buttonMenuPrincipal.width, buttonMenuPrincipal.height);
    if (mouse.x && mouse.y && collision(mouse, buttonMenuPrincipal)) {
        ctx.drawImage(buttonMenuPrincipal.image, buttonMenuPrincipal.x - 3, buttonMenuPrincipal.y - 3, buttonMenuPrincipal.width + 6, buttonMenuPrincipal.height + 6);
    }
    if (collision(mouse, buttonMenuPrincipal) && mouse.clicked) {
        if (!defeatMenuMusic.paused) {
            defeatMenuMusic.pause();
            defeatMenuMusic.currentTime = 0;
        }
        numberOfLoses++;
        resetGame();
    }
}
function victoryMenu() {
    ctx.drawImage(victoireBdImage, 0, 0);
    ctx.drawImage(buttonMenuPrincipal.image, buttonMenuPrincipal.x, buttonMenuPrincipal.y, buttonMenuPrincipal.width, buttonMenuPrincipal.height);
    if (mouse.x && mouse.y && collision(mouse, buttonMenuPrincipal)) {
        ctx.drawImage(buttonMenuPrincipal.image, buttonMenuPrincipal.x - 3, buttonMenuPrincipal.y - 3, buttonMenuPrincipal.width + 6, buttonMenuPrincipal.height + 6);
    }
    if (collision(mouse, buttonMenuPrincipal) && mouse.clicked) {
        if (!victoryMenuMusic.paused) {
            victoryMenuMusic.pause();
            victoryMenuMusic.currentTime = 0;
        }
        numberOfLoses = 0;
        resetGame();
    }
}

/**
 * DISPLAY DEFEAT AND VICTORY MESSAGE
 */
let displayDefeatMessageBool = false;
let displayVictoryMessageBool = false;
let deafeatOrVictoryMessageSetTimeout = true;
function displayDefeatMessage() {
    if (defeatMenuMusic.paused) {
        battleMusic.pause();
        battleMusic.currentTime = 0;
        bossMusic.pause();
        bossMusic.currentTime = 0;
        defeatMenuMusic.currentTime = 0;
        defeatMenuMusic.play();
    }
    ctx.drawImage(backgroundImageBrokenDoor, 0, 0);
    ctx.drawImage(defeatImage, 0, 0);
    if (deafeatOrVictoryMessageSetTimeout) {
        setTimeout(() => {
            displayDefeatMessageBool = false;
            defeatMenuBool = true;
        }, 3000);
    }
    deafeatOrVictoryMessageSetTimeout = false;
}
function displayVictoryMessage() {
    if (victoryMenuMusic.paused) {
        bossMusic.pause();
        bossMusic.currentTime = 0;
        victoryMenuMusic.currentTime = 0;
        victoryMenuMusic.play();
    }
    ctx.drawImage(backgroundImage, 0, 0);
    ctx.drawImage(victoryImage, 0, 0);
    if (deafeatOrVictoryMessageSetTimeout) {
        setTimeout(() => {
            displayVictoryMessageBool = false;
            victoryMenuBool = true;
        }, 3000);
    }
    deafeatOrVictoryMessageSetTimeout = false;
}

/**
 * HANDLE DIALOGUES AND WAVE ANNOUCEMENT
 */
// introDialogue1 images
const kingAndMageImage1 = new Image();
kingAndMageImage1.src = "./assets/images/king-and-mage-image-1.png";
const kingAndMageImage2 = new Image();
kingAndMageImage2.src = "./assets/images/king-and-mage-image-2.png";
const kingAndMageImage3 = new Image();
kingAndMageImage3.src = "./assets/images/king-and-mage-image-3.png";
// introDialogue2 images
const kingAndMageImage1Alternatif = new Image();
kingAndMageImage1Alternatif.src = "./assets/images/king-and-mage-image-1-alternatif.png";
const kingAndMageImage2Alternatif = new Image();
kingAndMageImage2Alternatif.src = "./assets/images/king-and-mage-image-2-alternatif.png";
// bossDialogue images
const kingWave3BossImage = new Image();
kingWave3BossImage.src = "./assets/images/king-wave-3-boss.png";
const bossOrcComingImage = new Image();
bossOrcComingImage.src = "./assets/images/bossOrc-coming.png";
// announceNextWave images
const kingWave1Image = new Image();
kingWave1Image.src = "./assets/images/king-wave-1.png";
const kingWave2Image = new Image();
kingWave2Image.src = "./assets/images/king-wave-2.png";
const kingWave3Image = new Image();
kingWave3Image.src = "./assets/images/king-wave-3.png";

let actualDialogueImage = 1;
let actualDialogueSetTimeout = 1;
let introDialogue1 = true;
let introDialogue2 = false;
let bossDialogue = false;
let announceNextWave = false;
function handleDialogues() {
    if (introDialogue1) {
        if (actualDialogueImage === 1) {
            ctx.drawImage(kingAndMageImage1, 0, 0);
            if (actualDialogueSetTimeout === 1) {
                setTimeout(() => {
                    actualDialogueImage = 2;
                }, 4000);
                actualDialogueSetTimeout = 2;
            }
        } else if (actualDialogueImage === 2) {
            ctx.drawImage(kingAndMageImage2, 0, 0);
            if (actualDialogueSetTimeout === 2) {
                setTimeout(() => {
                    actualDialogueImage = 3;
                }, 4000);
                actualDialogueSetTimeout = 3;
            }
        } else if (actualDialogueImage === 3) {
            ctx.drawImage(kingAndMageImage3, 0, 0);
            if (actualDialogueSetTimeout === 3) {
                setTimeout(() => {
                    introDialogue1 = false;
                    actualDialogueImage = 1;
                    announceNextWave = true;
                }, 4000);
                actualDialogueSetTimeout = 1;
            }
        }
    }
    if (introDialogue2) {
        if (actualDialogueImage === 1) {
            ctx.drawImage(kingAndMageImage1Alternatif, 0, 0);
            if (actualDialogueSetTimeout === 1) {
                setTimeout(() => {
                    actualDialogueImage = 2;
                }, 3000);
                actualDialogueSetTimeout = 2;
            }
        } else if (actualDialogueImage === 2) {
            ctx.drawImage(kingAndMageImage2Alternatif, 0, 0);
            if (actualDialogueSetTimeout === 2) {
                setTimeout(() => {
                    introDialogue2 = false;
                    actualDialogueImage = 1;
                    announceNextWave = true;
                }, 3000);
                actualDialogueSetTimeout = 1;
            }
        }
    }
    if (bossDialogue) {
        if (bossMusic.paused) {
            battleMusic.pause();
            battleMusic.currentTime = 0;
            bossMusic.play();
        }
        if (actualDialogueImage === 1) {
            ctx.drawImage(kingWave3BossImage, 0, 0);
            if (actualDialogueSetTimeout === 1) {
                setTimeout(() => {
                    actualDialogueImage = 2;
                }, 3000);
                actualDialogueSetTimeout = 2;
            }
        } else if (actualDialogueImage === 2) {
            ctx.drawImage(bossOrcComingImage, 0, 0);
            if (actualDialogueSetTimeout === 2) {
                setTimeout(() => {
                    bossDialogue = false;
                    actualDialogueImage = 1;
                    gameInPause = false;
                }, 3000);
                actualDialogueSetTimeout = 1;
            }
        }
    }
}
function handleAnnounceNextWave() {
    if (announceNextWave && actualWave === 1) {
        if (battleMusic.paused) {
            mainMenuMusic.pause();
            mainMenuMusic.currentTime = 0;
            battleMusic.play();
        }
        ctx.drawImage(kingWave1Image, 0, 0);
        setTimeout(() => {
            announceNextWave = false;
            gameInPause = false;
        }, 4000);
    } else if (announceNextWave && actualWave === 2) {
        ctx.drawImage(kingWave2Image, 0, 0);
        setTimeout(() => {
            announceNextWave = false;
            gameInPause = false;
        }, 3000);
    } else if (announceNextWave && actualWave === 3) {
        ctx.drawImage(kingWave3Image, 0, 0);
        setTimeout(() => {
            announceNextWave = false;
            gameInPause = false;
        }, 3000);
    }
}

/**
 * RESET GAME
 */
function resetGame() {
    frame = 480;
    actualWave = 1;
    enemiesInterval = 600;
    score = 0;
    winningScore = 110;
    chosenDefender = 0;

    gameRunning = false;
    gameInPause = true;

    bossComing = false;

    defenders.length = 0;
    enemies.length = 0;
    enemiesVerticalPosition.length = 0;
    projectiles.length = 0;
    bagsOfResources.length = 0;
    deathAnimations.length = 0;

    floatingMessages.length = 0;

    mainMenuBool = true;
    didacticielMenuBool = false;
    defeatMenuBool = false;
    victoryMenuBool = false;

    displayDefeatMessageBool = false;
    displayVictoryMessageBool = false;
    deafeatOrVictoryMessageSetTimeout = true;

    actualDialogueImage = 1;
    actualDialogueSetTimeout = 1;
    if (numberOfLoses === 0) {
        introDialogue1 = true;
        introDialogue2 = false;
        numberOfResources = 300;
    } else if (numberOfLoses === 1) {
        introDialogue1 = false;
        introDialogue2 = true;
        numberOfResources = 600;
    } else if (numberOfLoses === 2) {
        introDialogue1 = false;
        introDialogue2 = true;
        numberOfResources = 650;
    } else if (numberOfLoses >= 3) {
        introDialogue1 = false;
        introDialogue2 = true;
        numberOfResources = 800;
    }
    bossDialogue = false;
    announceNextWave = false;
}

/**
 * GAME PLAYING
 */
function animate() {
    setTimeout(() => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        if (displayZbraaProductionBool) displayZbraaProduction();
        if (messageIntroMenuBool) messageIntroMenu();
        if (mainMenuBool) mainMenu();
        if (didacticielMenuBool) didacticielMenu();
        if (displayDefeatMessageBool) displayDefeatMessage();
        if (displayVictoryMessageBool) displayVictoryMessage();
        if (defeatMenuBool) defeatMenu();
        if (victoryMenuBool) victoryMenu();
        if (gameRunning) {
            ctx.drawImage(backgroundImage, 0, 0);
            ctx.drawImage(purseImage, 14, -22, 140, 140);
            if (!gameInPause) {
                handleGameGrid();
                handleDefenders();
                handleProjectiles();
                handleEnemies();
                handleEnemiesGeneration();
                handleDeathAnimations();
                handleBagsOfResources();
                handleFloatingMessages();
                chooseDefender();
                frame += (1 * fpsMultiplier);
            }
            handleGameStatus();
            handleDialogues();
            handleAnnounceNextWave();
        }
        requestAnimationFrame(animate);
    }, 33);
}
animate();