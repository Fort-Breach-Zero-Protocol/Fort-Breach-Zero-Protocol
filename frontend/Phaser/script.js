// --- DIMENSIONS ---
const GAME_W = window.innerWidth;
const GAME_H = window.innerHeight; 
const BASE_HEIGHT = 0; 
const PLAY_H = GAME_H - BASE_HEIGHT; 
const HORIZON_Y = GAME_H * 0.5; 

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

// Toast helper using Toastify (loaded via CDN in index.html)
function showToast(message, type = 'info') {
    const colors = {
        success: '#22c55e',
        error: '#ef4444',
        warning: '#f97316',
        info: '#0ea5e9'
    };

    const background = colors[type] || colors.info;

    if (typeof Toastify === 'function') {
        Toastify({
            text: message,
            duration: 3000,
            gravity: 'top',
            position: 'center',
            close: true,
            style: { background }
        }).showToast();
    } else {
        console.warn('Toastify not available:', message);
    }
}

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
let abilitiesUsed = 0; 

let topInfoText, roundScoreText, centerMessageText;
let startBtn, nextRoundBtn, nextLevelBtn;

// New Button Variables
let abilityBtnContainer;
let abilityBtnGraphics;
let abilityBtnText;

// Undo Button Variables
let undoBtnContainer;
let undoBtnGraphics;
let undoBtnText;
let spawnedPlayerStack = []; // Track spawned players for undo

// Restart Button Variables
let restartBtnContainer;
let restartBtnGraphics;
let restartBtnText;

// Character Selection Variables
let characterSelectionPanel;
let selectedCharacter = 'adventurer'; // Default character
let isCharacterSelected = false;
const CHARACTER_OPTIONS = ['adventurer', 'female', 'character_male'];
const CHARACTER_NAMES = ['Adventurer', 'Female', 'Male'];

// PERSPECTIVE SETTINGS
const PERSPECTIVE_SCALE = 0.5; 

// --- THEME COLORS ---
const COLOR_ORANGE = '#ff9900'; 
const COLOR_DARK_BLUE = '#0f1926'; 
const COLOR_CYAN = '#00aaff'; 
const FONT_FAMILY = '"Orbitron", sans-serif';

function preload () {
    this.load.image('floor_bg', 'floor.jpeg'); 
    this.load.image('wall_bg', 'sky.jpeg');  
    this.load.image('base_bg', 'base.png'); 
    
    this.load.spritesheet('adventurer', 'character.png', { frameWidth: 96, frameHeight: 128 });
    this.load.spritesheet('female', 'female.png', { frameWidth: 96, frameHeight: 128 });
    this.load.spritesheet('character_male', 'character_maleAdventurer_sheet.png', { frameWidth: 96, frameHeight: 128 });
    this.load.spritesheet('enemy', 'enemy.png', { frameWidth: 96, frameHeight: 128 });
    this.load.image('water_static', '5368739-Photoroom.png'); 
    this.load.image('rock', 'rock.png'); 
    
    this.load.spritesheet('fire', 'fire.png', { frameWidth: 679, frameHeight: 679 });
    
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

    placeLaneMarkers(this);

    waterLaneGraphics = this.add.graphics();

    // --- ANIMATED FLAMES ---
    // Create fire animation
    if (!this.anims.exists('fire_burn')) {
        this.anims.create({ 
            key: 'fire_burn', 
            frames: this.anims.generateFrameNumbers('fire', {frames : [3,4,5] }), 
            frameRate: 8, 
            repeat: -1 
        });
    }
    
    // Left bottom flame
    let leftFlame = this.add.sprite(120, PLAY_H - 100, 'fire');
    leftFlame.setScale(0.18);
    leftFlame.setDepth(100);
    leftFlame.play('fire_burn');
    
    // Right bottom flame
    let rightFlame = this.add.sprite(GAME_W - 220, PLAY_H - 100, 'fire');
    rightFlame.setScale(0.18);
    rightFlame.setDepth(100);
    rightFlame.play('fire_burn');

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

    // UNDO BUTTON (Outside UI box, to the right)
    let undoBtnW = 80;
    let undoBtnH = 32;
    let undoBtnX = 310 + (undoBtnW / 2); // Position outside the black UI box
    let undoBtnY = 25; // Aligned with top of UI box
    
    undoBtnContainer = this.add.container(undoBtnX, undoBtnY);
    undoBtnContainer.setDepth(3001);
    
    undoBtnGraphics = this.add.graphics();
    
    undoBtnText = this.add.text(0, 0, '↩ UNDO', {
        fontSize: '14px',
        fill: '#ffffff',
        fontFamily: FONT_FAMILY,
        fontStyle: 'bold'
    }).setOrigin(0.5, 0.5);
    
    undoBtnContainer.add([undoBtnGraphics, undoBtnText]);
    updateUndoButton();

    // RESTART BUTTON (Below undo button)
    let restartBtnW = 110;
    let restartBtnH = 38;
    let restartBtnX = 310 + (restartBtnW / 2); // Same X as undo button
    let restartBtnY = undoBtnY + undoBtnH + 10; // Below undo button with 10px gap
    
    restartBtnContainer = this.add.container(restartBtnX, restartBtnY);
    restartBtnContainer.setDepth(3001);
    
    restartBtnGraphics = this.add.graphics();
    
    restartBtnText = this.add.text(0, 0, '⟳ RESTART', {
        fontSize: '14px',
        fill: '#ffffff',
        fontFamily: FONT_FAMILY,
        fontStyle: 'bold'
    }).setOrigin(0.5, 0.5);
    
    restartBtnContainer.add([restartBtnGraphics, restartBtnText]);
    updateRestartButton();

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

    nextLevelBtn.on('pointerdown', async () => {
        // Calculate spawns used and abilities used, then calculate points
        const spawnsUsed = MAX_SPAWNS - playerPool;
        const points = 100 - spawnsUsed - (5 * abilitiesUsed);
        
        try {
            // Get token from localStorage
            const token = localStorage.getItem('token');
            
            if (!token) {
                showToast('Please login to save your progress', 'warning');
                (window.top || window).location.href = '/login';
                return;
            }
            
            // Send completion data to backend
            const response = await fetch('http://localhost:3000/user/complete-level', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    level: 1,
                    points: points
                })
            });
            
            if (response.ok) {
                const data = await response.json();
                console.log('Level completed successfully:', data);
                
                // Flag for home page to reset history, then redirect without leaving a back entry
                sessionStorage.setItem('resetHistoryOnHome', 'true');
                (window.top || window).location.replace('/home?levelCompleted=1');
            } else {
                const errorData = await response.json();
                showToast('Failed to save progress: ' + (errorData.message || 'Unknown error'), 'error');
                (window.top || window).location.href = '/home';
            }
        } catch (error) {
            console.error('Error saving level completion:', error);
            showToast('Failed to save progress. Redirecting to home...', 'error');
            (window.top || window).location.href = '/home';
        }
    });

    // Create animations for all character types
    CHARACTER_OPTIONS.forEach(charKey => {
        if (!this.anims.exists('run_away_' + charKey)) {
            this.anims.create({ key: 'run_away_' + charKey, frames: this.anims.generateFrameNumbers(charKey, { frames: [5, 9, 6, 9] }), frameRate: 7, repeat: -1 });
        }
    });
    
    if (!this.anims.exists('run_towards')) {
        this.anims.create({ key: 'run_towards', frames: this.anims.generateFrameNumbers('enemy', { frames: [12, 0, 13, 0] }), frameRate: 7, repeat: -1 });
    }

    // --- INPUT ---
    this.input.on('pointerdown', (pointer) => {
        if (interactionBlocked) return;
        
        // Block game interaction when character selection panel is visible
        if (characterSelectionPanel && characterSelectionPanel.visible) return;

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

        // Undo button click detection
        let undoBtnW = 80;
        let undoBtnH = 32;
        let undoBtnX = 310 + (undoBtnW / 2);
        let undoBtnY = 25;
        let undoBtnRect = new Phaser.Geom.Rectangle(undoBtnX - (undoBtnW/2), undoBtnY - (undoBtnH/2), undoBtnW, undoBtnH);
        
        if (undoBtnContainer.visible && undoBtnRect.contains(pointer.x, pointer.y)) {
            if (spawnedPlayerStack.length === 0 || isRoundActive || isTacticalPhase) return;
            
            this.tweens.add({
                targets: undoBtnContainer, scaleX: 0.95, scaleY: 0.95, duration: 100, yoyo: true
            });
            
            undoLastSpawn(this);
            return;
        }

        // Restart button click detection
        let restartBtnW = 110;
        let restartBtnH = 38;
        let restartBtnX = 310 + (restartBtnW / 2);
        let restartBtnY = undoBtnY + undoBtnH + 10;
        let restartBtnRect = new Phaser.Geom.Rectangle(restartBtnX - (restartBtnW/2), restartBtnY - (restartBtnH/2), restartBtnW, restartBtnH);
        
        if (restartBtnContainer.visible && restartBtnRect.contains(pointer.x, pointer.y)) {
            this.tweens.add({
                targets: restartBtnContainer, scaleX: 0.95, scaleY: 0.95, duration: 100, yoyo: true
            });
            
            // Restart the entire match
            this.scene.restart();
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
    
    // --- CHARACTER SELECTION PANEL (created last so UI elements exist) ---
    createCharacterSelectionPanel(this);
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
    abilitiesUsed = 0;
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
    spawnedPlayerStack = []; // Clear undo stack
    if (waterLaneGraphics) waterLaneGraphics.clear();
}

function createCharacterSelectionPanel(scene) {
    // Create container for the selection panel
    characterSelectionPanel = scene.add.container(GAME_W / 2, GAME_H / 2);
    characterSelectionPanel.setDepth(4000);
    
    // Dark overlay background
    let overlay = scene.add.graphics();
    overlay.fillStyle(0x000000, 0.8);
    overlay.fillRect(-GAME_W / 2, -GAME_H / 2, GAME_W, GAME_H);
    characterSelectionPanel.add(overlay);
    
    // Panel background
    let panelW = 500;
    let panelH = 350;
    let panelBg = scene.add.graphics();
    panelBg.fillStyle(0x0f1926, 0.95);
    panelBg.fillRoundedRect(-panelW / 2, -panelH / 2, panelW, panelH, 20);
    panelBg.lineStyle(3, 0x00aaff);
    panelBg.strokeRoundedRect(-panelW / 2, -panelH / 2, panelW, panelH, 20);
    characterSelectionPanel.add(panelBg);
    
    // Title
    let title = scene.add.text(0, -panelH / 2 + 40, 'SELECT YOUR CHARACTER', {
        fontSize: '24px',
        fill: COLOR_ORANGE,
        fontFamily: FONT_FAMILY,
        fontStyle: 'bold'
    }).setOrigin(0.5);
    characterSelectionPanel.add(title);
    
    // Character options
    let startX = -150;
    let spacing = 150;
    
    CHARACTER_OPTIONS.forEach((charKey, index) => {
        let x = startX + (index * spacing);
        let y = 0;
        
        // Character frame background
        let frameBg = scene.add.graphics();
        frameBg.fillStyle(0x1a2a3a, 1);
        frameBg.fillRoundedRect(x - 55, y - 70, 110, 140, 10);
        frameBg.lineStyle(2, 0x00aaff);
        frameBg.strokeRoundedRect(x - 55, y - 70, 110, 140, 10);
        characterSelectionPanel.add(frameBg);
        
        // Character sprite preview
        let charPreview = scene.add.sprite(x, y, charKey, 0);
        charPreview.setScale(0.9);
        characterSelectionPanel.add(charPreview);
        
        // Character name
        let charName = scene.add.text(x, y + 85, CHARACTER_NAMES[index], {
            fontSize: '14px',
            fill: '#ffffff',
            fontFamily: FONT_FAMILY,
            fontStyle: 'bold'
        }).setOrigin(0.5);
        characterSelectionPanel.add(charName);
        
        // Make frame interactive
        let hitArea = scene.add.rectangle(x, y + 10, 110, 160, 0x000000, 0);
        hitArea.setInteractive({ useHandCursor: true });
        characterSelectionPanel.add(hitArea);
        
        // Store reference for highlight
        hitArea.frameBg = frameBg;
        hitArea.charKey = charKey;
        
        hitArea.on('pointerover', () => {
            frameBg.clear();
            frameBg.fillStyle(0x2a4a5a, 1);
            frameBg.fillRoundedRect(x - 55, y - 70, 110, 140, 10);
            frameBg.lineStyle(3, COLOR_ORANGE.replace('#', '0x'));
            frameBg.strokeRoundedRect(x - 55, y - 70, 110, 140, 10);
        });
        
        hitArea.on('pointerout', () => {
            frameBg.clear();
            frameBg.fillStyle(0x1a2a3a, 1);
            frameBg.fillRoundedRect(x - 55, y - 70, 110, 140, 10);
            frameBg.lineStyle(2, 0x00aaff);
            frameBg.strokeRoundedRect(x - 55, y - 70, 110, 140, 10);
        });
        
        hitArea.on('pointerdown', () => {
            selectedCharacter = charKey;
            isCharacterSelected = true;
            characterSelectionPanel.setVisible(false);
            
            // Block interaction briefly to prevent accidental spawn
            interactionBlocked = true;
            scene.time.delayedCall(100, () => { interactionBlocked = false; });
            
            // Show game UI elements
            startBtn.setVisible(true);
            abilityBtnContainer.setVisible(true);
            undoBtnContainer.setVisible(true);
            restartBtnContainer.setVisible(true);
        });
    });
    
    // Initially hide game UI until character is selected
    if (!isCharacterSelected) {
        startBtn.setVisible(false);
        abilityBtnContainer.setVisible(false);
        undoBtnContainer.setVisible(false);
        restartBtnContainer.setVisible(false);
    }
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

function updateUndoButton() {
    if (!undoBtnGraphics) return;
    
    undoBtnGraphics.clear();
    
    let w = 80;
    let h = 32;
    let canUndo = spawnedPlayerStack.length > 0 && !isRoundActive && !isTacticalPhase;
    
    let bgColor = canUndo ? 0x0f1926 : 0x333333;
    let lineColor = canUndo ? 0x00aaff : 0x555555;
    let textColor = canUndo ? '#ffffff' : '#777777';
    
    undoBtnGraphics.fillStyle(bgColor, 0.9);
    undoBtnGraphics.fillRoundedRect(-w/2, -h/2, w, h, 8);
    
    undoBtnGraphics.lineStyle(2, lineColor);
    undoBtnGraphics.strokeRoundedRect(-w/2, -h/2, w, h, 8);
    
    if (undoBtnText) {
        undoBtnText.setFill(textColor);
    }
}

function undoLastSpawn(scene) {
    if (spawnedPlayerStack.length === 0) return;
    if (isRoundActive || isTacticalPhase) return;
    
    // Get the last spawned player
    let lastPlayer = spawnedPlayerStack.pop();
    
    if (lastPlayer && lastPlayer.active) {
        // Restore lane count
        let laneIndex = lastPlayer.laneIndex;
        if (laneIndex !== undefined && playerLaneCounts[laneIndex] > 0) {
            playerLaneCounts[laneIndex]--;
        }
        
        // Restore pool and unit count
        playerPool++;
        playerUnitsInRound--;
        
        // Destroy the player sprite
        lastPlayer.destroy();
        
        updateUI();
        updateUndoButton();
    }
}

function updateRestartButton() {
    if (!restartBtnGraphics) return;
    
    restartBtnGraphics.clear();
    
    let w = 110;
    let h = 38;
    
    let bgColor = 0x0f1926;
    let lineColor = 0xff3333; // Red color
    
    restartBtnGraphics.fillStyle(bgColor, 0.9);
    restartBtnGraphics.fillRoundedRect(-w/2, -h/2, w, h, 8);
    
    restartBtnGraphics.lineStyle(2, lineColor);
    restartBtnGraphics.strokeRoundedRect(-w/2, -h/2, w, h, 8);
}

function getPerspectiveCoords(colIndex) {
    // Fixed top center positions where stone paths converge at horizon
    // All paths converge closer to center at the top
    const topPathCenters = [GAME_W * 0.315, GAME_W * 0.5, GAME_W * 0.695];
    let topPathWidth = GAME_W * 0.045; // narrower at top to match path convergence
    
    let topX1 = topPathCenters[colIndex] - (topPathWidth / 2);
    let topX2 = topPathCenters[colIndex] + (topPathWidth / 2);

    // Fixed bottom center positions aligned with the visual stone paths
    // Left path ~23.5%, Middle path ~50%, Right path ~73.5% of screen width
    const pathCenters = [GAME_W * 0.235, GAME_W * 0.5, GAME_W * 0.735];
    let pathWidth = GAME_W * 0.20; // match stone path width at bottom
    
    let botX1 = pathCenters[colIndex] - (pathWidth / 2);
    let botX2 = pathCenters[colIndex] + (pathWidth / 2);

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

    let baseSpawnY = PLAY_H - 30; 
    let spawnY = baseSpawnY - (playerLaneCounts[colIndex] * 40);
    
    let spawnX = getXForY(colIndex, spawnY);

    let p = playerGroup.create(spawnX, spawnY, selectedCharacter);
    p.setOrigin(0.5, 1);
    p.setFrame(5);
    p.body.setSize(40, 60);
    p.setDepth(p.y);
    p.setScale(1.1);

    p.laneIndex = colIndex; 

    playerLaneCounts[colIndex]++; 
    playerPool--; 
    playerUnitsInRound++;
    
    // Track for undo
    spawnedPlayerStack.push(p);
    
    updateUI();
    updateUndoButton();
}

function initiateTacticalPhase(scene) {
    if (!abilityAvailable) return;
    if (playerUnitsInRound === 0 && playerPool > 0) {
        showToast("Place at least one unit first!", 'warning');
        return;
    }

    isTacticalPhase = true;
    startBtn.setVisible(false);
    abilityBtnContainer.setVisible(false);
    undoBtnContainer.setVisible(false);
    restartBtnContainer.setVisible(false);

    centerMessageText.setText("SELECT TARGET LANE").setFill(COLOR_CYAN).setVisible(true);
    console.log('Abilities used: ' + abilitiesUsed);
}

function setWaterLane(scene, x) {
    let colIndex = Math.floor(x / colWidth);
    if (colIndex > 2) colIndex = 2;
    
    activeWaterLane = colIndex; 
    abilitiesUsed++;
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
    updateUndoButton(); 

    interactionBlocked = true;
    scene.time.delayedCall(1000, () => {
        interactionBlocked = false;
        startRound(scene);
    });
}

function startRound(scene) {
    if (playerUnitsInRound === 0) {
        if (playerPool > 0) {
            showToast("Place at least one unit!", 'warning');
            return;
        }
    }

    isRoundActive = true;
    startBtn.setVisible(false);
    abilityBtnContainer.setVisible(false);
    undoBtnContainer.setVisible(false);
    restartBtnContainer.setVisible(false);
    roundScoreText.setVisible(true);
    roundScoreText.setText('ROUND SCORE: 0 - 0');

    let enemyToSpawn = decideEnemySpawns();
    for (let i = 0; i < enemyToSpawn; i++) {
        spawnEnemyUnit(scene);
    }

    playerGroup.getChildren().forEach(p => {
        if(p.anims) p.play('run_away_' + selectedCharacter, true);
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

    let e = enemyGroup.create(spawnX, spawnY, 'enemy');
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

function update (time, delta) {
    if (!isRoundActive) return;

    if (playerGroup.countActive() === 0 && enemyGroup.countActive() === 0) {
        endRound(this);
        return;
    }

    // Use delta time for frame-rate independent movement
    // delta is in milliseconds, so we divide by 16.67 (60fps baseline) to normalize
    let moveSpeed = 1.0 * (delta / 16.67);

    playerGroup.getChildren().forEach(p => {
        if (p.active) {
            p.y -= moveSpeed; 
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
            e.y += moveSpeed; 
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
    updateUndoButton();

    centerMessageText.setVisible(false);
    nextRoundBtn.setVisible(false);
    nextLevelBtn.setVisible(false);
    roundScoreText.setVisible(false);
    
    startBtn.setVisible(true);
    abilityBtnContainer.setVisible(true);
    undoBtnContainer.setVisible(true);
    restartBtnContainer.setVisible(true);
}

function onMeet(p, e) {
    if (!p.active || !e.active) return;
    p.body.enable = false;
    e.body.enable = false;
    this.tweens.add({ targets: [p, e], alpha: 0, duration: 200, onComplete: () => { p.destroy(); e.destroy(); }});
}

function placeLaneMarkers(scene) {
    // Position rocks between the stone paths
    let rock1 = scene.add.image(GAME_W * 0.36, PLAY_H - 10, 'rock');
    rock1.setOrigin(0.5, 1); 
    rock1.setScale(0.05); 
    rock1.setDepth(GAME_H); 

    let rock2 = scene.add.image(GAME_W * 0.61, PLAY_H - 10, 'rock');
    rock2.setOrigin(0.5, 1);
    rock2.setScale(0.05); 
    rock2.setDepth(GAME_H);
}