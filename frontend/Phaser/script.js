// --- DIMENSIONS ---
const GAME_W = window.innerWidth;
const GAME_H = window.innerHeight; 
const BASE_HEIGHT = 120; 
const PLAY_H = GAME_H - BASE_HEIGHT; 
const HORIZON_Y = PLAY_H * 0.4; 

const config = {
    type: Phaser.AUTO,
    width: GAME_W,
    height: GAME_H,
    backgroundColor: '#000000', 
    physics: {
        default: 'arcade',
        arcade: { gravity: { y: 0 }, debug: false }
    },
    scene: { preload: preload, create: create, update: update }
};

const game = new Phaser.Game(config);

// --- VARIABLES ---
let playerGroup, enemyGroup;
let isRoundActive = false;
let isTacticalPhase = false;
let colWidth = GAME_W / 3; 
let interactionBlocked = false;

let currentRound = 1;
let playerWins = 0;
let enemyWins = 0;

const MAX_SPAWNS = 7;
let playerPool = MAX_SPAWNS;
let enemyPool = MAX_SPAWNS;

let playerUnitsInRound = 0;
let enemyUnitsInRound = 0;
let playerLaneCounts = [0, 0, 0];
let enemyLaneCounts = [0, 0, 0];

let roundPlayerScore = 0;
let roundEnemyScore = 0;

let activeWaterLane = -1; 
let waterLaneGraphics; 

let abilityAvailable = true; 

let topInfoText, roundScoreText, centerMessageText;
let startBtn, nextRoundBtn, nextLevelBtn;

// New Button Variables
let abilityBtnContainer;
let abilityBtnGraphics;
let abilityBtnText;

// PERSPECTIVE SETTINGS
const PERSPECTIVE_SCALE = 0.5; 

// --- THEME COLORS ---
const COLOR_ORANGE = '#ff9900'; 
const COLOR_DARK_BLUE = '#0f1926'; 
const COLOR_CYAN = '#00aaff'; 
const FONT_FAMILY = '"Orbitron", sans-serif';

function preload () {
    this.load.image('floor_bg', 'floor.png'); 
    this.load.image('wall_bg', 'wall.png');  
    this.load.image('base_bg', 'base.png'); 
    
    this.load.spritesheet('adventurer', 'character_maleAdventurer_sheet.png', { frameWidth: 96, frameHeight: 128 });
    this.load.image('water_static', '5368739-Photoroom.png'); 
    this.load.image('rock', 'rock.png'); 
    
    this.load.image('icon', 'icon.png'); 
}

function create () {
    resetMatchVariables();

    // --- BACKGROUND ---
    let wallBg = this.add.image(GAME_W / 2, HORIZON_Y / 2, 'wall_bg');
    wallBg.setDisplaySize(GAME_W, HORIZON_Y); 
    wallBg.setDepth(-101); 

    let floorHeight = PLAY_H - HORIZON_Y;
    let floorBg = this.add.image(GAME_W / 2, HORIZON_Y + (floorHeight / 2), 'floor_bg');
    floorBg.setDisplaySize(GAME_W, floorHeight); 
    floorBg.setDepth(-100);

    let baseBg = this.add.image(GAME_W / 2, GAME_H, 'base_bg');
    baseBg.setOrigin(0.5, 1); 
    baseBg.setDisplaySize(GAME_W, BASE_HEIGHT); 
    baseBg.setDepth(2000); 

    placeLaneMarkers(this);

    waterLaneGraphics = this.add.graphics();

    playerGroup = this.physics.add.group();
    enemyGroup = this.physics.add.group();

    // --- UI SETUP ---
    
    // 1. UI BACKGROUND (Black Translucent Rounded Box)
    let uiBg = this.add.graphics();
    // *** UPDATED: 50% Opacity (0.5) ***
    uiBg.fillStyle(0x000000, 0.5); 
    // *** UPDATED: fillRoundedRect with 15px corner radius ***
    // x, y, width, height, radius
    uiBg.fillRoundedRect(10, 10, 280, 110, 15);
    uiBg.setDepth(2999);

    // 2. INFO TEXT
    topInfoText = this.add.text(25, 25, '', { 
        fontSize: '20px', 
        fill: '#ffffff', 
        fontFamily: FONT_FAMILY,
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 2
    });
    topInfoText.setDepth(3000); 

    // 3. SCORE TEXT
    roundScoreText = this.add.text(GAME_W / 2, 40, 'SCORE: 0 - 0', { 
        fontSize: '36px', 
        fill: '#ffffff', 
        fontFamily: FONT_FAMILY, 
        fontStyle: 'bold', 
        stroke: '#000000', 
        strokeThickness: 6
    }).setOrigin(0.5).setVisible(false).setDepth(3000);

    // START BUTTON
    startBtn = this.add.text(GAME_W - 20, 40, ' START ROUND ', {
        fontSize: '22px', 
        fill: '#ffffff', 
        backgroundColor: COLOR_ORANGE, 
        padding: { x: 20, y: 12 }, 
        fontFamily: FONT_FAMILY,
        fontStyle: 'bold'
    }).setOrigin(1, 0.5).setDepth(3000);

    // STACK OVERFLOW BUTTON
    let btnW = 280; 
    let btnH = 55;
    
    abilityBtnContainer = this.add.container(GAME_W - 20, 110);
    abilityBtnContainer.setDepth(3000);

    abilityBtnGraphics = this.add.graphics();
    
    let icon = this.add.image(-btnW + 30, 0, 'icon'); 
    icon.setDisplaySize(35, 35); 
    
    abilityBtnText = this.add.text(-btnW + 60, 0, 'STACK OVERFLOW', { 
        fontSize: '18px', 
        fill: '#ffffff', 
        fontFamily: FONT_FAMILY,
        fontStyle: 'bold' 
    }).setOrigin(0, 0.5);

    abilityBtnContainer.add([abilityBtnGraphics, icon, abilityBtnText]);

    updateUI();

    // --- CENTER MESSAGE ---
    centerMessageText = this.add.text(GAME_W / 2, GAME_H / 2, '', {
        fontSize: '50px', 
        fill: COLOR_ORANGE, 
        fontFamily: FONT_FAMILY,
        stroke: '#000', 
        strokeThickness: 8, 
        fontStyle: 'bold',
        align: 'center',
        lineSpacing: 10 
    }).setOrigin(0.5).setVisible(false).setDepth(3000);

    // --- NEXT ROUND BUTTON ---
    nextRoundBtn = this.add.text(GAME_W / 2, (GAME_H / 2) + 100, ' NEXT ROUND ', {
        fontSize: '28px', 
        fill: '#ffffff', 
        backgroundColor: COLOR_ORANGE, 
        padding: { x: 30, y: 15 },
        fontFamily: FONT_FAMILY,
        fontStyle: 'bold'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true }).setVisible(false).setDepth(3000);

    nextRoundBtn.on('pointerdown', () => {
        interactionBlocked = true;
        this.time.delayedCall(200, () => { interactionBlocked = false; });
        if (currentRound >= 3 && !isRoundActive) {
            this.scene.restart();
        } else {
            prepareNextRound(this);
        }
    });

    // --- NEXT LEVEL BUTTON ---
    nextLevelBtn = this.add.text(GAME_W / 2, (GAME_H / 2) + 100, ' NEXT LEVEL ', {
        fontSize: '28px', 
        fill: '#ffffff', 
        backgroundColor: '#00cc00', 
        padding: { x: 30, y: 15 },
        fontFamily: FONT_FAMILY,
        fontStyle: 'bold'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true }).setVisible(false).setDepth(3000);

    nextLevelBtn.on('pointerdown', () => {
        // Calculate spawns used
        const spawnsUsed = MAX_SPAWNS - playerPool;
        
        // Prepare data to send
        const gameData = {
            spawnsUsed: spawnsUsed,
            status: 'won',
            playerWins: playerWins,
            enemyWins: enemyWins,
            totalRounds: currentRound
        };
        
        // Create URL with parameters
        const baseUrl = 'next-level.html';
        const params = new URLSearchParams(gameData);
        window.location.href = `${baseUrl}?${params.toString()}`;
    });

    if (!this.anims.exists('run_away')) {
        this.anims.create({ key: 'run_away', frames: this.anims.generateFrameNumbers('adventurer', { frames: [5, 9, 6, 9] }), frameRate: 8, repeat: -1 });
    }
    if (!this.anims.exists('run_towards')) {
        this.anims.create({ key: 'run_towards', frames: this.anims.generateFrameNumbers('adventurer', { frames: [12, 0, 13, 0] }), frameRate: 8, repeat: -1 });
    }

    // --- INPUT ---
    this.input.on('pointerdown', (pointer) => {
        if (interactionBlocked) return;

        if (startBtn.visible && startBtn.getBounds().contains(pointer.x, pointer.y)) {
            startRound(this);
            return;
        }

        let btnX = GAME_W - 20; 
        let btnY = 110;
        let btnRect = new Phaser.Geom.Rectangle(btnX - btnW, btnY - (btnH/2), btnW, btnH);

        if (abilityBtnContainer.visible && btnRect.contains(pointer.x, pointer.y)) {
            if (!abilityAvailable) return;
            
            this.tweens.add({
                targets: abilityBtnContainer, scaleX: 0.95, scaleY: 0.95, duration: 100, yoyo: true
            });
            
            initiateTacticalPhase(this);
            return;
        }

        if (nextRoundBtn.visible) return; 

        if (pointer.y < HORIZON_Y - 50) return; 

        if (isTacticalPhase) {
            setWaterLane(this, pointer.x);
            return;
        }

        if (!isRoundActive && playerPool > 0) {
            spawnPlayerUnit(this, pointer.x);
        }
    });

    this.physics.add.overlap(playerGroup, enemyGroup, onMeet, null, this);
    
    updateUI();
}

function resetMatchVariables() {
    currentRound = 1;
    playerWins = 0;
    enemyWins = 0;
    playerPool = MAX_SPAWNS;
    enemyPool = MAX_SPAWNS;
    isRoundActive = false;
    isTacticalPhase = false;
    interactionBlocked = false;
    activeWaterLane = -1;
    abilityAvailable = true;
    resetRoundScores();
}

function resetRoundScores() {
    roundPlayerScore = 0;
    roundEnemyScore = 0;
    playerUnitsInRound = 0;
    enemyUnitsInRound = 0;
    playerLaneCounts = [0, 0, 0];
    enemyLaneCounts = [0, 0, 0];
    activeWaterLane = -1;
    if (waterLaneGraphics) waterLaneGraphics.clear();
}

function updateUI() {
    topInfoText.setText(
        `ROUNDS: ${currentRound} / 3\n` +
        `SCORE: ${playerWins} - ${enemyWins}\n` +
        `UNITS: ${playerPool}`
    );

    if (abilityBtnGraphics) {
        abilityBtnGraphics.clear();
        
        let bgColor = abilityAvailable ? 0x0f1926 : 0x333333; 
        let lineColor = abilityAvailable ? 0x00aaff : 0x555555;
        let w = 280;
        let h = 55;
        
        abilityBtnGraphics.fillStyle(bgColor, 0.9);
        abilityBtnGraphics.fillRect(-w, -h/2, w, h);
        
        abilityBtnGraphics.lineStyle(2, lineColor);
        abilityBtnGraphics.strokeRect(-w, -h/2, w, h);
        
        if(abilityAvailable) {
            abilityBtnGraphics.beginPath();
            abilityBtnGraphics.moveTo(-w, -h/2 + 10);
            abilityBtnGraphics.lineTo(-w, -h/2);
            abilityBtnGraphics.lineTo(-w + 10, -h/2);
            abilityBtnGraphics.strokePath();
        }

        if (abilityAvailable) {
            abilityBtnText.setText("STACK OVERFLOW").setFill('#ffffff');
        } else {
            abilityBtnText.setText("SYSTEM OFFLINE").setFill('#777777');
        }
    }
}

function getPerspectiveCoords(colIndex) {
    let horizonTotalW = GAME_W * PERSPECTIVE_SCALE;
    let horizonStartX = (GAME_W - horizonTotalW) / 2;
    let horizonLaneW = horizonTotalW / 3;

    let topX1 = horizonStartX + (colIndex * horizonLaneW);
    let topX2 = topX1 + horizonLaneW;

    let botX1 = colIndex * colWidth;
    let botX2 = botX1 + colWidth;

    return { topX1, topX2, botX1, botX2 };
}

function getXForY(colIndex, currentY) {
    let coords = getPerspectiveCoords(colIndex);
    let centerTop = (coords.topX1 + coords.topX2) / 2;
    let centerBot = (coords.botX1 + coords.botX2) / 2;
    let t = (currentY - HORIZON_Y) / (PLAY_H - HORIZON_Y);
    return centerTop + (centerBot - centerTop) * t;
}

function spawnPlayerUnit(scene, x) {
    let colIndex = Math.floor(x / colWidth);
    if (colIndex > 2) colIndex = 2; 

    let baseSpawnY = PLAY_H - 20; 
    let spawnY = baseSpawnY - (playerLaneCounts[colIndex] * 40);
    
    let spawnX = getXForY(colIndex, spawnY);

    let p = playerGroup.create(spawnX, spawnY, 'adventurer');
    p.setOrigin(0.5, 1);
    p.setFrame(5);
    p.body.setSize(40, 60);
    p.setDepth(p.y);
    p.setScale(1.1);

    p.laneIndex = colIndex; 

    playerLaneCounts[colIndex]++; 
    playerPool--; 
    playerUnitsInRound++; 
    updateUI();
}

function initiateTacticalPhase(scene) {
    if (!abilityAvailable) return;
    if (playerUnitsInRound === 0 && playerPool > 0) {
        alert("Place at least one unit first!");
        return;
    }

    isTacticalPhase = true;
    startBtn.setVisible(false);
    abilityBtnContainer.setVisible(false); 

    centerMessageText.setText("SELECT TARGET LANE").setFill(COLOR_CYAN).setVisible(true);
}

function setWaterLane(scene, x) {
    let colIndex = Math.floor(x / colWidth);
    if (colIndex > 2) colIndex = 2;
    
    activeWaterLane = colIndex; 
    abilityAvailable = false; 

    waterLaneGraphics.clear();
    waterLaneGraphics.fillStyle(0x006994, 0.6); 

    let coords = getPerspectiveCoords(colIndex);

    waterLaneGraphics.fillPoints([
        { x: coords.topX1, y: HORIZON_Y },
        { x: coords.topX2, y: HORIZON_Y },
        { x: coords.botX2, y: PLAY_H },
        { x: coords.botX1, y: PLAY_H }
    ]);

    let centerTop = (coords.topX1 + coords.topX2) / 2;
    let centerBot = (coords.botX1 + coords.botX2) / 2;
    let textX = (centerTop + centerBot) / 2; 

    let floodText = scene.add.text(textX, HORIZON_Y + 100, "DATA FLOOD!", {
        fontSize: '40px', fill: COLOR_CYAN, fontFamily: FONT_FAMILY, stroke: '#000', strokeThickness: 4
    }).setOrigin(0.5);
    
    scene.tweens.add({
        targets: floodText,
        y: '+=20',
        alpha: 0,
        duration: 2000
    });

    isTacticalPhase = false;
    centerMessageText.setVisible(false);
    
    updateUI(); 

    interactionBlocked = true;
    scene.time.delayedCall(1000, () => {
        interactionBlocked = false;
        startRound(scene);
    });
}

function startRound(scene) {
    if (playerUnitsInRound === 0) {
        if (playerPool > 0) {
            alert("Place at least one unit!");
            return;
        }
    }

    isRoundActive = true;
    startBtn.setVisible(false);
    abilityBtnContainer.setVisible(false);
    roundScoreText.setVisible(true);
    roundScoreText.setText('ROUND SCORE: 0 - 0');

    let enemyToSpawn = decideEnemySpawns();
    for (let i = 0; i < enemyToSpawn; i++) {
        spawnEnemyUnit(scene);
    }

    playerGroup.getChildren().forEach(p => {
        if(p.anims) p.play('run_away', true);
    });
}

function decideEnemySpawns() {
    let count = 0;
    if (currentRound === 3) {
        count = enemyPool; 
    } else if (currentRound === 2) {
        if (enemyWins > playerWins) {
            count = Math.floor(enemyPool / 2);
        } else {
            count = Math.max(1, enemyPool - 1);
        }
    } else {
        count = Phaser.Math.Between(2, 3);
    }
    if (count > enemyPool) count = enemyPool;
    if (count === 0 && enemyPool > 0) count = 1; 
    return count;
}

function spawnEnemyUnit(scene) {
    let randomCol = Phaser.Math.Between(0, 2);
    
    let baseSpawnY = HORIZON_Y + 80;
    let spawnY = baseSpawnY - (enemyLaneCounts[randomCol] * 40);

    let spawnX = getXForY(randomCol, spawnY);

    if (randomCol === activeWaterLane) {
        let txt = scene.add.text(spawnX, spawnY - 40, "CRASHED!", { 
            fontSize: '25px', fill: '#FF0000', fontFamily: FONT_FAMILY, stroke:'#FFF', strokeThickness: 3 
        }).setOrigin(0.5);
        scene.tweens.add({ targets: txt, y: '-=30', alpha: 0, duration: 1500, onComplete: () => txt.destroy() });
        enemyPool--;
        return; 
    }

    let e = enemyGroup.create(spawnX, spawnY, 'adventurer');
    e.setOrigin(0.5, 1);
    e.setFrame(12);
    e.setTint(0xff9999);
    e.body.setSize(40, 60);
    e.setDepth(e.y);
    e.setScale(1.1);
    e.play('run_towards'); 
    
    e.laneIndex = randomCol;

    enemyLaneCounts[randomCol]++;
    enemyPool--;
    enemyUnitsInRound++;
}

function update () {
    if (!isRoundActive) return;

    if (playerGroup.countActive() === 0 && enemyGroup.countActive() === 0) {
        endRound(this);
        return;
    }

    playerGroup.getChildren().forEach(p => {
        if (p.active) {
            p.y -= 1.0; 
            p.x = getXForY(p.laneIndex, p.y);
            p.setDepth(p.y); 
            let depthScale = Phaser.Math.Clamp(p.y / GAME_H, 0.4, 1.2);
            p.setScale(depthScale);

            if (p.y < HORIZON_Y) { 
                roundPlayerScore++;
                roundScoreText.setText(`ROUND SCORE: ${roundPlayerScore} - ${roundEnemyScore}`);
                p.destroy();
            }
        }
    });

    enemyGroup.getChildren().forEach(e => {
        if (e.active) {
            e.y += 1.0; 
            e.x = getXForY(e.laneIndex, e.y);
            e.setDepth(e.y);
            let depthScale = Phaser.Math.Clamp(e.y / GAME_H, 0.4, 1.2);
            e.setScale(depthScale);

            // Enemies win if they reach the bottom wall (PLAY_H), not screen bottom
            if (e.y > PLAY_H) { 
                roundEnemyScore++;
                roundScoreText.setText(`ROUND SCORE: ${roundPlayerScore} - ${roundEnemyScore}`);
                e.destroy();
            }
        }
    });
}

function endRound(scene) {
    isRoundActive = false;
    let resultMsg = "";
    let color = "#FFF";

    if (roundPlayerScore > roundEnemyScore) {
        playerWins++;
        resultMsg = "YOU WON ROUND " + currentRound + "!";
        color = COLOR_ORANGE;
    } else if (roundEnemyScore > roundPlayerScore) {
        enemyWins++;
        resultMsg = "ENEMY WON ROUND " + currentRound + "!";
        color = "#FF0000";
    } else {
        resultMsg = "ROUND " + currentRound + " DRAW!";
        color = "#FFFF00";
    }

    centerMessageText.setText(resultMsg).setFill(color).setVisible(true);
    updateUI();

    if (currentRound === 3) {
        let matchResult = "";
        let matchColor = "";
        let btnText = "";

        if (playerWins > enemyWins) {
            matchResult = "MATCH WINNER:\nYOU!";
            matchColor = COLOR_ORANGE; 
            btnText = " PLAY AGAIN ";
            
            // Show both restart and next level buttons
            centerMessageText.setText(matchResult).setFill(matchColor);
            
            nextRoundBtn.setText(btnText)
                .setBackgroundColor(COLOR_ORANGE)
                .setX((GAME_W / 2) - 140)
                .setY((GAME_H / 2) + 200) 
                .setVisible(true);
            
            nextLevelBtn.setText(" NEXT LEVEL ")
                .setBackgroundColor('#00cc00')
                .setX((GAME_W / 2) + 140)
                .setY((GAME_H / 2) + 200) 
                .setVisible(true);
        } else {
            matchResult = "MATCH WINNER:\nENEMY!";
            matchColor = "#FF0000"; 
            if (playerWins === enemyWins) matchResult += "\n(Draw = Enemy Win)";
            btnText = " YOU LOST. TRY AGAIN ";
            
            centerMessageText.setText(matchResult).setFill(matchColor);
            
            nextRoundBtn.setText(btnText)
                .setBackgroundColor('#333')
                .setX(GAME_W / 2)
                .setY((GAME_H / 2) + 200) 
                .setVisible(true);
            
            nextLevelBtn.setVisible(false);
        }
            
    } else {
        nextRoundBtn.setText(" START ROUND " + (currentRound + 1) + " ")
            .setBackgroundColor(COLOR_ORANGE)
            .setY((GAME_H / 2) + 100) 
            .setVisible(true);
    }
}

function prepareNextRound(scene) {
    currentRound++;
    resetRoundScores();
    updateUI();

    centerMessageText.setVisible(false);
    nextRoundBtn.setVisible(false);
    nextLevelBtn.setVisible(false);
    roundScoreText.setVisible(false);
    
    startBtn.setVisible(true);
    abilityBtnContainer.setVisible(true);
}

function onMeet(p, e) {
    if (!p.active || !e.active) return;
    p.body.enable = false;
    e.body.enable = false;
    this.tweens.add({ targets: [p, e], alpha: 0, duration: 200, onComplete: () => { p.destroy(); e.destroy(); }});
}

function placeLaneMarkers(scene) {
    let rock1 = scene.add.image(colWidth, PLAY_H - 10, 'rock');
    rock1.setOrigin(0.5, 1); 
    rock1.setScale(0.05); 
    rock1.setDepth(GAME_H); 

    let rock2 = scene.add.image(colWidth * 2, PLAY_H - 10, 'rock');
    rock2.setOrigin(0.5, 1);
    rock2.setScale(0.05); 
    rock2.setDepth(GAME_H);
}
