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

// --- VARIABLES ---
let playerGroup, enemyGroup;
let stackOverflowGraphics;
let isRoundActive = false;
let isTacticalPhase = false;
let stackOverflowText; // <--- ADD THIS
let colWidth = GAME_W / 5; 
let interactionBlocked = false;

let currentRound = 1;
let playerWins = 0;
let enemyWins = 0;

const MAX_SPAWNS = 25;
let playerPool = MAX_SPAWNS;
let enemyPool = MAX_SPAWNS;

let playerUnitsInRound = 0;
let enemyUnitsInRound = 0;
let playerLaneCounts = [0, 0, 0, 0, 0];
let enemyLaneCounts = [0, 0, 0, 0, 0];

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

// Survival Platform Variables
let survivalPlatformY = 0;
let survivalPlatformY2 = 0; // Y position for second survival platform
let survivalPlatformRadius = 30; // Radius for collision detection

// Threat Hash Ability Variables
let threatHashBtnContainer;
let threatHashBtnGraphics;
let threatHashBtnText;
let threatHashAvailable = true;
let preCalculatedEnemySpawns = 0; // Store enemy spawn count for consistency
let enemySpawnsPerRound = [0, 0, 0, 0, 0]; // Pre-distributed spawns for all 5 rounds

// Recursive Call Ability Variables
let recursiveBtnContainer;
let recursiveBtnGraphics;
let recursiveBtnText;
let recursiveCallAvailable = false; // Not available in round 1
let recursiveCallUsed = false; // Track if used in match
let isRecursivePhase = false;
let previousRoundPlayerLanes = [0, 0, 0, 0, 0]; // Track spawns per lane from previous round

// Merge Protocol Ability Variables
let mergeBtnContainer;
let mergeBtnGraphics;
let mergeBtnText;
let mergeProtocolAvailable = true;
let isMergePhase = false;

// Gate Variables
let gateSprite;
let gateYPosition = 0;
let gateLaneIndex = 1; // Lane 2 (index 1)
let gateGlowY = 0; // Y position of the gate glow (pressure plate)
let isGateOpen = false; // Track if gate is open
let gatePassCount = 0; // How many can pass through currently
let playerHoldingGate = null; // Reference to player holding the gate open

// Gate 2 Variables (Lane 4, index 3)
let gate2Sprite;
let gate2YPosition = 0;
let gate2LaneIndex = 3; // Lane 4 (index 3)
let gate2GlowY = 0;
let isGate2Open = false;
let gate2PassCount = 0;
let playerHoldingGate2 = null;

// Portal Variables
let portal0X = 0;
let portal0Y = 0;
let portal4X = 0;
let portal4Y = 0;
const PORTAL_RADIUS = 20; // Collision detection radius

// PERSPECTIVE SETTINGS
const PERSPECTIVE_SCALE = 0.5; 

// --- THEME COLORS ---
const COLOR_ORANGE = '#ff9900'; 
const COLOR_DARK_BLUE = '#0f1926'; 
const COLOR_CYAN = '#00aaff'; 
const FONT_FAMILY = '"Orbitron", sans-serif';

// --- Enemy Ability State ---
let enemyStackOverflowUsed = false;
let enemyImmortalCount = 2;
let enemyImmortalUsed = 0;
let enemyImmortalQueue = [];

// --- Track which round enemy uses Stack Overflow ---
let enemyStackOverflowRound = -1;

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
    
    this.load.image('survival', 'survival.png');
    
    this.load.image('icon', 'icon.png'); 
    this.load.image('threat_icon', 'threat_icon.png');
    this.load.image('recursive_icon', 'recursive_icon.png');
    
    // Gate opening animation spritesheet (5 frames - 4 columns x 2 rows)
    this.load.spritesheet('gate', 'gate.png', { frameWidth: 494, frameHeight: 473 });
    this.load.image('gate_glow', 'gate_glow.png');
    
    // Portal image
    this.load.image('merge_icon', 'merge_icon.png');
    this.load.image('portal', 'portal.png');
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
    
    // --- ADDED: Graphics for Enemy Stack Overflow (Red Lane) ---
    stackOverflowGraphics = this.add.graphics();
    stackOverflowGraphics.setDepth(5); // Above floor, below characters

    // --- SURVIVAL PLATFORM (Center of middle lane) ---
    let middleLaneX = GAME_W / 2;
    let middleLaneY = HORIZON_Y + (PLAY_H - HORIZON_Y) / 2; // Center of playable area
    survivalPlatformY = middleLaneY; // Store for collision detection
    let survivalPlatform = this.add.image(middleLaneX, middleLaneY, 'survival');
    survivalPlatform.setScale(0.1);
    survivalPlatform.setDepth(0); // Fixed low depth so characters always appear above

    // --- SECOND SURVIVAL PLATFORM (Above the first, same lane) ---
    survivalPlatformY2 = middleLaneY - 100; // Store for collision detection (top platform)
    let survivalPlatform2 = this.add.image(middleLaneX, survivalPlatformY2, 'survival');
    survivalPlatform2.setScale(0.07);
    survivalPlatform2.setDepth(0); // Same depth as the first

    // --- PORTALS (Y-axis center in lane 0 and lane 4) ---
    let portalY = HORIZON_Y + (PLAY_H - HORIZON_Y) / 2 - 90; // Y-axis center moved up
    portal0Y = portalY; // Store for collision detection
    portal4Y = portalY; // Store for collision detection
    
    // Portal in lane 0
    portal0X = getXForY(0, portalY) - 40; // Moved left
    let portal0Sprite = this.add.image(portal0X, portalY, 'portal');
    portal0Sprite.setScale(0.20);
    portal0Sprite.setDepth(1); // Above survival platform but below characters
    
    // Portal in lane 4
    portal4X = getXForY(4, portalY) + 35; // Moved right
    let portal4Sprite = this.add.image(portal4X, portalY, 'portal');
    portal4Sprite.setScale(0.20);
    portal4Sprite.setDepth(1); // Above survival platform but below characters

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
    let leftFlame = this.add.sprite(620, PLAY_H - 310, 'fire');
    leftFlame.setScale(0.18);
    leftFlame.setDepth(100);
    leftFlame.play('fire_burn');
    
    // Right bottom flame
    let rightFlame = this.add.sprite(GAME_W - 620, PLAY_H - 310, 'fire');
    rightFlame.setScale(0.18);
    rightFlame.setDepth(100);
    rightFlame.play('fire_burn');

    // --- GATE ANIMATION (Lane 1) ---
    if (!this.anims.exists('gate_open')) {
        this.anims.create({
            key: 'gate_open',
            frames: this.anims.generateFrameNumbers('gate', { frames:[0,1,3,2] }),
            frameRate: 4,
            repeat: 0
        });
    }
    
    // Position gate in lane 2 (index 1) towards the top
    gateYPosition = HORIZON_Y + (PLAY_H - HORIZON_Y) * 0.25;
    let lane2X = getXForY(1, gateYPosition) - 30;
    gateSprite = this.add.sprite(lane2X, gateYPosition, 'gate');
    gateSprite.setOrigin(0.5, 0.5); // Center the gate
    gateSprite.setScale(0.3);
    gateSprite.setDepth(500); // Base depth for gate
    gateSprite.setFrame(0); // Start with closed gate (don't auto-play)
    
    // Gate glow in front of the gate (pressure plate)
    gateGlowY = gateYPosition + 90;
    let gateGlow = this.add.image(lane2X-12, gateGlowY, 'gate_glow');
    gateGlow.setOrigin(0.5, 0.5);
    gateGlow.setScale(0.04);
    gateGlow.setDepth(49); // Below the gate

    // Position gate 2 in lane 4 (index 3) towards the top
    gate2YPosition = HORIZON_Y + (PLAY_H - HORIZON_Y) * 0.25;
    let lane4X = getXForY(3, gate2YPosition) + 30;
    gate2Sprite = this.add.sprite(lane4X, gate2YPosition, 'gate');
    gate2Sprite.setOrigin(0.5, 0.5);
    gate2Sprite.setScale(0.3);
    gate2Sprite.setDepth(500);
    gate2Sprite.setFrame(0); // Start with closed gate
    
    // Gate 2 glow in front of the gate (pressure plate)
    gate2GlowY = gate2YPosition + 90;
    let gate2Glow = this.add.image(lane4X+3, gate2GlowY, 'gate_glow');
    gate2Glow.setOrigin(0.5, 0.5);
    gate2Glow.setScale(0.04);
    gate2Glow.setDepth(49);

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

    // THREAT HASH BUTTON
    let threatBtnW = 280;
    let threatBtnH = 55;
    
    threatHashBtnContainer = this.add.container(GAME_W - 20, 175);
    threatHashBtnContainer.setDepth(3000);

    threatHashBtnGraphics = this.add.graphics();
    
    let threatIcon = this.add.image(-threatBtnW + 30, 0, 'threat_icon');
    threatIcon.setDisplaySize(35, 35);
    
    threatHashBtnText = this.add.text(-threatBtnW + 60, 0, 'THREAT HASH', { 
        fontSize: '18px', 
        fill: '#ffffff', 
        fontFamily: FONT_FAMILY,
        fontStyle: 'bold' 
    }).setOrigin(0, 0.5);

    threatHashBtnContainer.add([threatHashBtnGraphics, threatIcon, threatHashBtnText]);
    updateThreatHashButton();

    // RECURSIVE CALL BUTTON
    let recursiveBtnW = 280;
    let recursiveBtnH = 55;
    
    recursiveBtnContainer = this.add.container(GAME_W - 20, 240);
    recursiveBtnContainer.setDepth(3000);

    recursiveBtnGraphics = this.add.graphics();
    
    let recursiveIcon = this.add.image(-recursiveBtnW + 30, 0, 'recursive_icon');
    recursiveIcon.setDisplaySize(35, 35);
    
    recursiveBtnText = this.add.text(-recursiveBtnW + 60, 0, 'RECURSIVE CALL', { 
        fontSize: '18px', 
        fill: '#ffffff', 
        fontFamily: FONT_FAMILY,
        fontStyle: 'bold' 
    }).setOrigin(0, 0.5);

    recursiveBtnContainer.add([recursiveBtnGraphics, recursiveIcon, recursiveBtnText]);
    updateRecursiveButton();
    
    recursiveBtnContainer.setInteractive(new Phaser.Geom.Rectangle(-recursiveBtnW, -recursiveBtnH/2, recursiveBtnW, recursiveBtnH), Phaser.Geom.Rectangle.Contains);
    recursiveBtnContainer.on('pointerdown', () => {
        if (!recursiveCallAvailable || isRoundActive || isTacticalPhase || isRecursivePhase || isMergePhase) return;
        initiateRecursivePhase(this);
    });

    // MERGE PROTOCOL BUTTON
    let mergeBtnW = 280;
    let mergeBtnH = 55;
    
    mergeBtnContainer = this.add.container(GAME_W - 20, 305);
    mergeBtnContainer.setDepth(3000);

    mergeBtnGraphics = this.add.graphics();
    
    let mergeIcon = this.add.image(-mergeBtnW + 30, 0, 'merge_icon');
    mergeIcon.setDisplaySize(35, 35);
    
    mergeBtnText = this.add.text(-mergeBtnW + 60, 0, 'MERGE PROTOCOL', { 
        fontSize: '18px', 
        fill: '#ffffff', 
        fontFamily: FONT_FAMILY,
        fontStyle: 'bold' 
    }).setOrigin(0, 0.5);

    mergeBtnContainer.add([mergeBtnGraphics, mergeIcon, mergeBtnText]);
    updateMergeButton();
    
    mergeBtnContainer.setInteractive(new Phaser.Geom.Rectangle(-mergeBtnW, -mergeBtnH/2, mergeBtnW, mergeBtnH), Phaser.Geom.Rectangle.Contains);
    mergeBtnContainer.on('pointerdown', () => {
        if (!mergeProtocolAvailable || isRoundActive || isTacticalPhase || isRecursivePhase || isMergePhase) return;
        initiateMergePhase(this);
    });

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
        if (currentRound >= 5 && !isRoundActive) {
            // Play Again - reload the page to restart
            window.location.reload();
        } else {
            // Next Round
            interactionBlocked = true;
            this.time.delayedCall(200, () => { interactionBlocked = false; });
            prepareNextRound(this);
        }
    });

    // --- HOME BUTTON ---
    nextLevelBtn = this.add.text(GAME_W / 2, (GAME_H / 2) + 100, ' HOME ', {
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
            totalRounds: currentRound,
            levelCompleted: 1
        };
        
        // Redirect to home page with parameters
        const params = new URLSearchParams(gameData);
        window.location.href = `/home?${params.toString()}`;
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
            window.location.reload();
            return;
        }

        // Threat Hash button click detection
        let threatBtnW = 280;
        let threatBtnH = 55;
        let threatBtnX = GAME_W - 20;
        let threatBtnY = 175;
        let threatBtnRect = new Phaser.Geom.Rectangle(threatBtnX - threatBtnW, threatBtnY - (threatBtnH/2), threatBtnW, threatBtnH);
        
        if (threatHashBtnContainer.visible && threatBtnRect.contains(pointer.x, pointer.y)) {
            if (!threatHashAvailable) return;
            
            this.tweens.add({
                targets: threatHashBtnContainer, scaleX: 0.95, scaleY: 0.95, duration: 100, yoyo: true
            });
            
            useThreatHash(this);
            return;
        }

        if (nextRoundBtn.visible) return; 

        if (pointer.y < HORIZON_Y - 50) return; 

        if (isTacticalPhase) {
            setWaterLane(this, pointer.x);
            return;
        }

        if (isRecursivePhase) {
            executeRecursiveCall(this, pointer.x);
            return;
        }

        if (isMergePhase) {
            executeMergeProtocol(this, pointer.x);
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
    threatHashAvailable = true;
    recursiveCallAvailable = false; 
    recursiveCallUsed = false; 
    previousRoundPlayerLanes = [0, 0, 0, 0, 0];
    isCharacterSelected = false; 
    
    // --- ENEMY SPAWN DISTRIBUTION: 5 ROUNDS, 25 SPAWNS TOTAL ---
    enemySpawnsPerRound = [1, 1, 1, 1, 1];
    let remaining = MAX_SPAWNS - 5;
    while (remaining > 0) {
        let roundIndex = Phaser.Math.Between(0, 4);
        enemySpawnsPerRound[roundIndex]++;
        remaining--;
    }

    // --- ENEMY LANE ASSIGNMENTS: Ensure at least 2 in middle lane, immortals always in middle ---
    enemyLaneAssignments = [];
    let immortalsToAssign = 2;
    for (let r = 0; r < 5; r++) {
        let count = enemySpawnsPerRound[r];
        let assignments = [];
        let lanes = [1, 2, 3];
        // Ensure at least 2 in middle lane
        let minMiddle = Math.min(2, count);
        for (let i = 0; i < minMiddle; i++) assignments.push(2);
        // Fill the rest equally
        for (let i = minMiddle; i < count; i++) assignments.push(lanes[(i - minMiddle) % 3]);
        Phaser.Utils.Array.Shuffle(assignments);
        enemyLaneAssignments.push(assignments);
    }
    // Mark which spawns will be immortal: always assign to first available middle lane in any round
    enemyImmortalSpawnPlan = [];
    let immortalsLeft = 2;
    for (let r = 0; r < 5 && immortalsLeft > 0; r++) {
        let idx = enemyLaneAssignments[r].findIndex(lane => lane === 2);
        if (idx !== -1) {
            enemyImmortalSpawnPlan.push({ round: r, index: idx });
            immortalsLeft--;
        }
    }
    
    // --- Reset enemy ability state ---
    enemyStackOverflowUsed = false;
    enemyImmortalCount = 2;
    enemyImmortalUsed = 0;
    enemyImmortalQueue = [];
    
    // *** FIX IS HERE: Assign a random round (0-4) for the ability ***
    enemyStackOverflowRound = Phaser.Math.Between(0, 4); 
    
    resetRoundScores();
}

function resetRoundScores() {
    roundPlayerScore = 0;
    roundEnemyScore = 0;
    playerUnitsInRound = 0;
    enemyUnitsInRound = 0;
    playerLaneCounts = [0, 0, 0, 0, 0];
    enemyLaneCounts = [0, 0, 0, 0, 0];
    activeWaterLane = -1;
    spawnedPlayerStack = []; 
    preCalculatedEnemySpawns = calculateEnemySpawns(); 
    
    if (waterLaneGraphics) waterLaneGraphics.clear();

    // --- UPDATED: Clear Graphics AND Text ---
    if (stackOverflowGraphics) stackOverflowGraphics.clear();
    
    if (stackOverflowText) {
        stackOverflowText.destroy();
        stackOverflowText = null;
    }
    
    // ... existing gate reset logic ...
    if (playerHoldingGate) {
        playerHoldingGate.destroy();
        playerHoldingGate = null;
    }
    isGateOpen = false;
    gatePassCount = 0;
    if (gateSprite) gateSprite.setFrame(0); 
    
    if (playerHoldingGate2) {
        playerHoldingGate2.destroy();
        playerHoldingGate2 = null;
    }
    isGate2Open = false;
    gate2PassCount = 0;
    if (gate2Sprite) gate2Sprite.setFrame(0);
    
    if (enemyGroup) {
        enemyGroup.getChildren().forEach(e => {
            if (e.active && (e.blockedByGate || e.blockedByGate2)) {
                e.destroy();
            }
        });
    }
}
function drawStackOverflowLane(scene) {
    stackOverflowGraphics.clear();
    stackOverflowGraphics.fillStyle(0xff0000, 0.5); // Red with 50% opacity

    // Middle Lane is Index 2
    let colIndex = 2;

    const waterTopCenters = [GAME_W * 0.313, GAME_W * 0.37, GAME_W * 0.5, GAME_W * 0.632, GAME_W * 0.695];
    const waterBotCenters = [GAME_W * 0.11, GAME_W * 0.281, GAME_W * 0.5, GAME_W * 0.70, GAME_W * 0.83];
    
    let topWidth = GAME_W * 0.032;
    let botWidth = GAME_W * 0.17;
    
    topWidth *= 1.5;
    botWidth *= 1.5;
    
    let topX1 = waterTopCenters[colIndex] - topWidth / 2;
    let topX2 = waterTopCenters[colIndex] + topWidth / 2;
    let botX1 = waterBotCenters[colIndex] - botWidth / 2;
    let botX2 = waterBotCenters[colIndex] + botWidth / 2;

    stackOverflowGraphics.fillPoints([
        { x: topX1, y: HORIZON_Y },
        { x: topX2, y: HORIZON_Y },
        { x: botX2, y: PLAY_H },
        { x: botX1, y: PLAY_H }
    ]);

    // Add Text Effect
    let textX = (waterTopCenters[colIndex] + waterBotCenters[colIndex]) / 2; 
    
    // --- UPDATED: Save to global variable ---
    stackOverflowText = scene.add.text(textX, HORIZON_Y + 140, "STACK OVERFLOW!", {
        fontSize: '32px', fill: '#ff0000', fontFamily: FONT_FAMILY, stroke: '#000', strokeThickness: 4, fontStyle: 'bold'
    }).setOrigin(0.5);
    
    scene.tweens.add({
        targets: stackOverflowText, // Target the global variable
        alpha: 0.2,
        duration: 500,
        yoyo: true,
        repeat: -1
    });
}

function createCharacterSelectionPanel(scene) {
    // Create container for the selection panel
    characterSelectionPanel = scene.add.container(GAME_W / 2, GAME_H / 2);
    characterSelectionPanel.setDepth(4000);
    characterSelectionPanel.setVisible(false); // Hidden by default until needed
    
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
            threatHashBtnContainer.setVisible(true);
        });
    });
    
    // Initially hide game UI until character is selected
    if (!isCharacterSelected) {
        startBtn.setVisible(false);
        abilityBtnContainer.setVisible(false);
        undoBtnContainer.setVisible(false);
        restartBtnContainer.setVisible(false);
        threatHashBtnContainer.setVisible(false);
        characterSelectionPanel.setVisible(true); // Show panel when no character selected
    }
}

function updateUI() {
    topInfoText.setText(
        `ROUNDS: ${currentRound} / 5\n` +
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

function updateThreatHashButton() {
    if (!threatHashBtnGraphics) return;
    
    threatHashBtnGraphics.clear();
    
    let bgColor = threatHashAvailable ? 0x0f1926 : 0x333333;
    let lineColor = threatHashAvailable ? 0x00cc44 : 0x555555; // Green color
    let w = 280;
    let h = 55;
    
    threatHashBtnGraphics.fillStyle(bgColor, 0.9);
    threatHashBtnGraphics.fillRect(-w, -h/2, w, h);
    
    threatHashBtnGraphics.lineStyle(2, lineColor);
    threatHashBtnGraphics.strokeRect(-w, -h/2, w, h);
    
    if (threatHashAvailable) {
        threatHashBtnGraphics.beginPath();
        threatHashBtnGraphics.moveTo(-w, -h/2 + 10);
        threatHashBtnGraphics.lineTo(-w, -h/2);
        threatHashBtnGraphics.lineTo(-w + 10, -h/2);
        threatHashBtnGraphics.strokePath();
    }

    if (threatHashBtnText) {
        if (threatHashAvailable) {
            threatHashBtnText.setText("THREAT HASH").setFill('#ffffff');
        } else {
            threatHashBtnText.setText("HASH BROKEN").setFill('#777777');
        }
    }
}

function useThreatHash(scene) {
    if (!threatHashAvailable) return;
    
    threatHashAvailable = false;
    updateThreatHashButton();
    
    // Use the pre-calculated enemy spawn count
    let enemySpawnCount = preCalculatedEnemySpawns;
    
    // Show the intel message
    centerMessageText.setText(`THREAT DETECTED\nENEMY UNITS: ${enemySpawnCount}`).setFill('#00cc44').setVisible(true);
    
    // Hide message after 2 seconds
    scene.time.delayedCall(2000, () => {
        centerMessageText.setVisible(false);
    });
}

function updateRecursiveButton() {
    if (!recursiveBtnGraphics) return;
    
    recursiveBtnGraphics.clear();
    
    let bgColor = recursiveCallAvailable ? 0x0f1926 : 0x333333;
    let lineColor = recursiveCallAvailable ? 0xff6600 : 0x555555; // Orange color
    let w = 280;
    let h = 55;
    
    recursiveBtnGraphics.fillStyle(bgColor, 0.9);
    recursiveBtnGraphics.fillRect(-w, -h/2, w, h);
    
    recursiveBtnGraphics.lineStyle(2, lineColor);
    recursiveBtnGraphics.strokeRect(-w, -h/2, w, h);
    
    if (recursiveCallAvailable) {
        recursiveBtnGraphics.beginPath();
        recursiveBtnGraphics.moveTo(-w, -h/2 + 10);
        recursiveBtnGraphics.lineTo(-w, -h/2);
        recursiveBtnGraphics.lineTo(-w + 10, -h/2);
        recursiveBtnGraphics.strokePath();
    }

    if (recursiveBtnText) {
        if (recursiveCallAvailable) {
            recursiveBtnText.setText("RECURSIVE CALL").setFill('#ffffff');
        } else if (currentRound === 1) {
            recursiveBtnText.setText("LOCKED (ROUND 2+)").setFill('#777777');
        } else {
            recursiveBtnText.setText("CALL COMPLETE").setFill('#777777');
        }
    }
}

function updateMergeButton() {
    if (!mergeBtnGraphics) return;
    
    mergeBtnGraphics.clear();
    
    let bgColor = mergeProtocolAvailable ? 0x0f1926 : 0x333333;
    let lineColor = mergeProtocolAvailable ? 0xffaa00 : 0x555555; // Orange yellow color
    let w = 280;
    let h = 55;
    
    mergeBtnGraphics.fillStyle(bgColor, 0.9);
    mergeBtnGraphics.fillRect(-w, -h/2, w, h);
    
    mergeBtnGraphics.lineStyle(2, lineColor);
    mergeBtnGraphics.strokeRect(-w, -h/2, w, h);
    
    if (mergeProtocolAvailable) {
        mergeBtnGraphics.beginPath();
        mergeBtnGraphics.moveTo(-w, -h/2 + 10);
        mergeBtnGraphics.lineTo(-w, -h/2);
        mergeBtnGraphics.lineTo(-w + 10, -h/2);
        mergeBtnGraphics.strokePath();
    }

    if (mergeBtnText) {
        if (mergeProtocolAvailable) {
            mergeBtnText.setText("MERGE PROTOCOL").setFill('#ffffff');
        } else {
            mergeBtnText.setText("MERGE COMPLETE").setFill('#777777');
        }
    }
}

function initiateMergePhase(scene) {
    if (!mergeProtocolAvailable) return;
    
    isMergePhase = true;
    startBtn.setVisible(false);
    abilityBtnContainer.setVisible(false);
    undoBtnContainer.setVisible(false);
    restartBtnContainer.setVisible(false);
    threatHashBtnContainer.setVisible(false);
    recursiveBtnContainer.setVisible(false);
    mergeBtnContainer.setVisible(false);

    centerMessageText.setText("SELECT LANE TO MERGE\n(Needs 2 players)").setFill('#ffaa00').setVisible(true);
}

function executeMergeProtocol(scene, x) {
    let colIndex = Math.floor(x / colWidth);
    if (colIndex > 4) colIndex = 4;
    
    // Check if there are 2 players in that lane
    let playersInLane = [];
    playerGroup.getChildren().forEach(p => {
        if (p.active && p.laneIndex === colIndex) {
            playersInLane.push(p);
        }
    });
    
    if (playersInLane.length < 2) {
        // Not enough players in lane
        let noMergeText = scene.add.text(GAME_W / 2, GAME_H / 2 + 80, "NEED 2 PLAYERS IN LANE!", {
            fontSize: '30px', fill: '#ff0000', fontFamily: FONT_FAMILY, stroke: '#000', strokeThickness: 4
        }).setOrigin(0.5);
        scene.tweens.add({
            targets: noMergeText,
            alpha: 0,
            duration: 1500,
            onComplete: () => noMergeText.destroy()
        });
        
        isMergePhase = false;
        centerMessageText.setVisible(false);
        startBtn.setVisible(true);
        abilityBtnContainer.setVisible(true);
        undoBtnContainer.setVisible(true);
        restartBtnContainer.setVisible(true);
        threatHashBtnContainer.setVisible(true);
        recursiveBtnContainer.setVisible(true);
        mergeBtnContainer.setVisible(true);
        return;
    }
    
    // Merge the two players - destroy both and create a merged one
    let player1 = playersInLane[0];
    let player2 = playersInLane[1];
    
    // Use the position of the first player for the merged unit
    let mergedX = player1.x;
    let mergedY = player1.y;
    
    // Destroy both players
    player1.destroy();
    player2.destroy();
    
    // Reduce lane count by 1 (2 players merged into 1)
    playerLaneCounts[colIndex] -= 1;
    
    // Create the merged player
    let merged = playerGroup.create(mergedX, mergedY, selectedCharacter);
    merged.setOrigin(0.5, 1);
    merged.setFrame(5);
    merged.body.setSize(50, 70); // Slightly bigger hitbox
    merged.setDepth(merged.y);
    merged.setScale(1.5); // Bigger scale
    merged.setTint(0xffaa00); // Orange yellow tint to show merged state
    
    merged.laneIndex = colIndex;
    merged.isMerged = true; // Mark as merged - immortal
    
    // Show success message
    let mergeSuccessText = scene.add.text(GAME_W / 2, GAME_H / 2 + 80, "MERGE COMPLETE!", {
        fontSize: '30px', fill: '#ffaa00', fontFamily: FONT_FAMILY, stroke: '#000', strokeThickness: 4
    }).setOrigin(0.5);
    scene.tweens.add({
        targets: mergeSuccessText,
        alpha: 0,
        duration: 1500,
        onComplete: () => mergeSuccessText.destroy()
    });
    
    // Mark ability as used
    mergeProtocolAvailable = false;
    isMergePhase = false;
    centerMessageText.setVisible(false);
    
    // Show buttons again
    startBtn.setVisible(true);
    abilityBtnContainer.setVisible(true);
    undoBtnContainer.setVisible(true);
    restartBtnContainer.setVisible(true);
    threatHashBtnContainer.setVisible(true);
    recursiveBtnContainer.setVisible(true);
    mergeBtnContainer.setVisible(true);
    
    updateMergeButton();
}

function initiateRecursivePhase(scene) {
    if (!recursiveCallAvailable) return;
    
    isRecursivePhase = true;
    startBtn.setVisible(false);
    abilityBtnContainer.setVisible(false);
    undoBtnContainer.setVisible(false);
    restartBtnContainer.setVisible(false);
    threatHashBtnContainer.setVisible(false);
    recursiveBtnContainer.setVisible(false);
    mergeBtnContainer.setVisible(false);

    centerMessageText.setText("SELECT LANE TO REVIVE").setFill('#ff6600').setVisible(true);
}

function executeRecursiveCall(scene, x) {
    let colIndex = Math.floor(x / colWidth);
    if (colIndex > 4) colIndex = 4;
    
    let unitsToRevive = previousRoundPlayerLanes[colIndex];
    
    if (unitsToRevive === 0) {
        // No units in that lane from previous round
        let noUnitsText = scene.add.text(GAME_W / 2, GAME_H / 2 + 80, "NO UNITS TO REVIVE!", {
            fontSize: '30px', fill: '#ff0000', fontFamily: FONT_FAMILY, stroke: '#000', strokeThickness: 4
        }).setOrigin(0.5);
        scene.tweens.add({
            targets: noUnitsText,
            alpha: 0,
            duration: 1500,
            onComplete: () => noUnitsText.destroy()
        });
        
        isRecursivePhase = false;
        centerMessageText.setVisible(false);
        startBtn.setVisible(true);
        abilityBtnContainer.setVisible(true);
        undoBtnContainer.setVisible(true);
        restartBtnContainer.setVisible(true);
        threatHashBtnContainer.setVisible(true);
        recursiveBtnContainer.setVisible(true);
        mergeBtnContainer.setVisible(true);
        return;
    }
    
    recursiveCallAvailable = false;
    recursiveCallUsed = true; // Mark as used for the match
    updateRecursiveButton();
    
    // Spawn the revived units
    let baseSpawnY = GAME_H - 100;
    for (let i = 0; i < unitsToRevive; i++) {
        let spawnY = baseSpawnY - (playerLaneCounts[colIndex] * 40);
        let spawnX = getXForY(colIndex, spawnY);
        
        let p = playerGroup.create(spawnX, spawnY, selectedCharacter);
        p.setOrigin(0.5, 1);
        p.setFrame(12); // Back-facing frame
        p.body.setSize(40, 60);
        p.setDepth(Math.max(p.y, 100));
        p.setScale(1.2);
        p.play('run_away_' + selectedCharacter); // Back-facing animation
        p.laneIndex = colIndex;
        
        playerLaneCounts[colIndex]++;
        playerUnitsInRound++;
    }
    
    // Show revive message
    let reviveText = scene.add.text(GAME_W / 2, GAME_H / 2 + 80, `REVIVED ${unitsToRevive} UNITS!`, {
        fontSize: '35px', fill: '#ff6600', fontFamily: FONT_FAMILY, stroke: '#000', strokeThickness: 4
    }).setOrigin(0.5);
    scene.tweens.add({
        targets: reviveText,
        y: '-=30',
        alpha: 0,
        duration: 2000,
        onComplete: () => reviveText.destroy()
    });
    
    isRecursivePhase = false;
    centerMessageText.setVisible(false);
    
    startBtn.setVisible(true);
    abilityBtnContainer.setVisible(true);
    undoBtnContainer.setVisible(true);
    restartBtnContainer.setVisible(true);
    threatHashBtnContainer.setVisible(true);
    recursiveBtnContainer.setVisible(true);
    mergeBtnContainer.setVisible(true);
    
    updateUI();
    updateUndoButton();
}

function getPerspectiveCoords(colIndex) {
    // Fixed top center positions where stone paths converge at horizon
    // 5 paths converging towards center at the top
    const topPathCenters = [GAME_W * 0.31, GAME_W * 0.375, GAME_W * 0.5, GAME_W * 0.628, GAME_W * 0.695];
    let topPathWidth = GAME_W * 0.035; // narrower at top to match path convergence
    
    let topX1 = topPathCenters[colIndex] - (topPathWidth / 2);
    let topX2 = topPathCenters[colIndex] + (topPathWidth / 2);

    // Fixed bottom center positions aligned with the visual stone paths
    // 5 paths spread across the screen
    const pathCenters = [GAME_W * 0.15, GAME_W * 0.29, GAME_W * 0.5, GAME_W * 0.69, GAME_W * 0.81];
    let pathWidth = GAME_W * 0.10; // match stone path width at bottom
    
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

// Spawn enemy from portal (when player enters portal)
function spawnEnemyFromPortal(scene, laneIndex, spawnY) {
    let spawnX = getXForY(laneIndex, spawnY);
    
    let e = enemyGroup.create(spawnX, spawnY, 'enemy');
    e.setOrigin(0.5, 1);
    e.setFrame(12);
    e.setTint(0xff9999);
    e.body.setSize(40, 60);
    e.setDepth(e.y);
    let depthScale = Phaser.Math.Clamp(e.y / GAME_H, 0.4, 1.2);
    e.setScale(depthScale);
    e.play('run_towards');
    
    e.laneIndex = laneIndex;
    e.fromPortal = true; // Mark as spawned from portal - won't re-enter portal
    e.enteredPortal = true; // Prevent re-entering portal
}

// Spawn player from portal (when enemy enters portal) - runs toward top (horizon)
function spawnPlayerFromPortal(scene, laneIndex, spawnY) {
    let spawnX = getXForY(laneIndex, spawnY);
    
    let p = playerGroup.create(spawnX, spawnY, selectedCharacter);
    p.setOrigin(0.5, 1);
    p.setFrame(5);
    p.body.setSize(40, 60);
    p.setDepth(p.y);
    let depthScale = Phaser.Math.Clamp(p.y / GAME_H, 0.4, 1.2);
    p.setScale(depthScale);
    p.play('run_away_' + selectedCharacter);
    
    p.laneIndex = laneIndex;
    p.fromPortal = true; // Mark as spawned from portal - won't re-enter portal
    p.enteredPortal = true; // Prevent re-entering portal
}

function spawnPlayerUnit(scene, x) {
    let colIndex = Math.floor(x / colWidth);
    if (colIndex > 4) colIndex = 4; 
    
    // Limit to max 2 players per lane
    if (playerLaneCounts[colIndex] >= 2) {
        return; // Don't spawn if lane already has 2 players
    }

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
        alert("Place at least one unit first!");
        return;
    }

    isTacticalPhase = true;
    startBtn.setVisible(false);
    abilityBtnContainer.setVisible(false);
    undoBtnContainer.setVisible(false);
    restartBtnContainer.setVisible(false);
    threatHashBtnContainer.setVisible(false);
    recursiveBtnContainer.setVisible(false);
    mergeBtnContainer.setVisible(false);

    centerMessageText.setText("SELECT TARGET LANE").setFill(COLOR_CYAN).setVisible(true);
}

function setWaterLane(scene, x) {
    let colIndex = Math.floor(x / colWidth);
    if (colIndex > 4) colIndex = 4;
    
    activeWaterLane = colIndex; 
    abilityAvailable = false; 

    waterLaneGraphics.clear();
    waterLaneGraphics.fillStyle(0x006994, 0.6); 

    // Custom water lane coordinates aligned with visual stone paths
    const waterTopCenters = [GAME_W * 0.313, GAME_W * 0.37, GAME_W * 0.5, GAME_W * 0.632, GAME_W * 0.695];
    const waterBotCenters = [GAME_W * 0.11, GAME_W * 0.281, GAME_W * 0.5, GAME_W * 0.70, GAME_W * 0.83];
    let topWidth = GAME_W * 0.032;
    let botWidth = GAME_W * 0.17;
    
    // Wider for middle lane
    if (colIndex === 2) {
        topWidth *= 1.5;
        botWidth *= 1.5;
    }
    
    let topX1 = waterTopCenters[colIndex] - topWidth / 2;
    let topX2 = waterTopCenters[colIndex] + topWidth / 2;
    let botX1 = waterBotCenters[colIndex] - botWidth / 2;
    let botX2 = waterBotCenters[colIndex] + botWidth / 2;

    waterLaneGraphics.fillPoints([
        { x: topX1, y: HORIZON_Y },
        { x: topX2, y: HORIZON_Y },
        { x: botX2, y: PLAY_H },
        { x: botX1, y: PLAY_H }
    ]);

    let textX = (waterTopCenters[colIndex] + waterBotCenters[colIndex]) / 2; 

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
            alert("Place at least one unit!");
            return;
        }
    }

    isRoundActive = true;
    startBtn.setVisible(false);
    abilityBtnContainer.setVisible(false);
    undoBtnContainer.setVisible(false);
    restartBtnContainer.setVisible(false);
    threatHashBtnContainer.setVisible(false);
    recursiveBtnContainer.setVisible(false);
    mergeBtnContainer.setVisible(false);
    roundScoreText.setVisible(true);
    roundScoreText.setText('ROUND SCORE: 0 - 0');

    // --- ADDED: Trigger Stack Overflow Visuals ---
    if (currentRound - 1 === enemyStackOverflowRound) {
        drawStackOverflowLane(scene);
    }

    let enemyToSpawn = preCalculatedEnemySpawns;
    for (let i = 0; i < enemyToSpawn; i++) {
        spawnEnemyUnit(scene);
    }

    playerGroup.getChildren().forEach(p => {
        if(p.anims) p.play('run_away_' + selectedCharacter, true);
    });
}

function calculateEnemySpawns() {
    // Use pre-distributed spawns for the current round
    return enemySpawnsPerRound[currentRound - 1];
}

function spawnEnemyUnit(scene) {
    let roundIdx = currentRound - 1;
    let randomCol;
    let spawnIndex = enemyLaneCounts[1] + enemyLaneCounts[2] + enemyLaneCounts[3];
    if (!enemyLaneAssignments || !enemyLaneAssignments[roundIdx] || enemyLaneAssignments[roundIdx].length === 0) {
        randomCol = 2;
    } else {
        randomCol = enemyLaneAssignments[roundIdx].shift();
    }
    // Immortal enemy logic: always spawn in middle lane if planned
    let isImmortal = false;
    let isStackOverflow = false;
    if (enemyImmortalSpawnPlan && enemyImmortalSpawnPlan.length > 0) {
        let plan = enemyImmortalSpawnPlan[0];
        if (plan.round === roundIdx && plan.index === enemyLaneCounts[2] && randomCol === 2) {
            isImmortal = true;
            enemyImmortalSpawnPlan.shift();
        }
    }
    
    if (enemyStackOverflowRound === roundIdx && randomCol === 2) {
        isStackOverflow = true;
    }

    // ... (rest of the spawn logic is the same) ...
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
    if (isImmortal) {
        e.setTint(0xffd700); 
    } else if (isStackOverflow) {
        e.setTint(0xff0000); 
    } else {
        e.setTint(0xff9999);
    }
    e.body.setSize(isImmortal ? 60 : 40, isImmortal ? 90 : 60);
    e.setDepth(e.y);
    e.setScale(isImmortal ? 1.35 : 1.1);
    e.play('run_towards'); 
    e.laneIndex = randomCol;
    e.isImmortal = isImmortal;
    e.isStackOverflow = isStackOverflow;
    enemyLaneCounts[randomCol]++;
    enemyPool--;
    enemyUnitsInRound++;
}

function update (time, delta) {
    if (!isRoundActive) return;

    // Count active units that can still move (exclude stuck units)
    let activeMovingPlayers = 0;
    let activeMovingEnemies = 0;
    
    playerGroup.getChildren().forEach(p => {
        if (p.active && !p.holdingGate && !p.holdingGate2) activeMovingPlayers++;
    });
    
    enemyGroup.getChildren().forEach(e => {
        if (e.active && !e.blockedByGate && !e.blockedByGate2) activeMovingEnemies++;
    });
    
    // End round when no moving units left (ignore stuck units)
    if (activeMovingPlayers === 0 && activeMovingEnemies === 0) {
        endRound(this);
        return;
    }

    // Use delta time for frame-rate independent movement
    // delta is in milliseconds, so we divide by 16.67 (60fps baseline) to normalize
    let moveSpeed = 1.0 * (delta / 16.67);
    
    // Store scene reference for use inside forEach callbacks
    let scene = this;

    playerGroup.getChildren().forEach(p => {
        if (p.active) {

            if (currentRound - 1 === enemyStackOverflowRound && p.laneIndex === 2) {
                // Visual Text
                let txt = scene.add.text(p.x, p.y - 40, "OVERFLOWED!", { 
                    fontSize: '20px', fill: '#FF0000', fontFamily: FONT_FAMILY, stroke:'#000', strokeThickness: 3 
                }).setOrigin(0.5);
                scene.tweens.add({ targets: txt, y: '-=40', alpha: 0, duration: 1000, onComplete: () => txt.destroy() });
                
                // Kill Player
                p.destroy();
                return; // Stop processing this player
            }
            // Gate pressure plate logic for lane 2 (gateLaneIndex)
            if (p.laneIndex === gateLaneIndex) {
                // Check if player reached the gate glow (pressure plate)
                if (p.y <= gateGlowY + 10 && !p.passedGateGlow) {
                    if (!isGateOpen) {
                        // Gate is closed - first player stops and holds the gate open permanently
                        p.y = gateGlowY + 10; // Stop at the glow
                        p.passedGateGlow = true;
                        p.holdingGate = true; // This player holds the gate
                        playerHoldingGate = p;
                        p.anims.stop(); // Stop animation
                        p.setFrame(9); // Use frame 9 for stopped pose
                        
                        // Open the gate
                        isGateOpen = true;
                        gateSprite.play('gate_open');
                    } else {
                        // Gate is already open - player can pass through
                        p.passedGateGlow = true;
                        p.y -= moveSpeed;
                    }
                } else if (p.holdingGate) {
                    // This player is holding the gate - stay at the glow permanently
                    p.y = gateGlowY + 10;
                } else {
                    // Normal movement
                    p.y -= moveSpeed;
                }
            } else if (p.laneIndex === gate2LaneIndex) {
                // Gate 2 pressure plate logic for lane 4 (gate2LaneIndex)
                if (p.y <= gate2GlowY + 10 && !p.passedGate2Glow) {
                    if (!isGate2Open) {
                        // Gate 2 is closed - first player stops and holds it open
                        p.y = gate2GlowY + 10;
                        p.passedGate2Glow = true;
                        p.holdingGate2 = true;
                        playerHoldingGate2 = p;
                        p.anims.stop();
                        p.setFrame(9);
                        
                        isGate2Open = true;
                        gate2Sprite.play('gate_open');
                    } else {
                        // Gate 2 is open - player can pass through
                        p.passedGate2Glow = true;
                        p.y -= moveSpeed;
                    }
                } else if (p.holdingGate2) {
                    p.y = gate2GlowY + 10;
                } else {
                    p.y -= moveSpeed;
                }
            } else {
                // Not in gate lane - normal movement
                p.y -= moveSpeed;
            }
            
            p.x = getXForY(p.laneIndex, p.y);
            // Ensure depth is always above background elements (minimum depth of 100)
            let baseDepth = Math.max(p.y, 100);
            
            // Gate crossing depth logic: when player is in gate lane and crossing through
            if (p.laneIndex === gateLaneIndex && gateSprite) {
                if (p.y > gateYPosition - 20 && p.y < gateYPosition + 40) {
                    // Player is crossing through gate - gate should be on top
                    p.setDepth(gateSprite.depth - 1);
                } else {
                    p.setDepth(baseDepth);
                }
            } else if (p.laneIndex === gate2LaneIndex && gate2Sprite) {
                if (p.y > gate2YPosition - 20 && p.y < gate2YPosition + 40) {
                    p.setDepth(gate2Sprite.depth - 1);
                } else {
                    p.setDepth(baseDepth);
                }
            } else {
                p.setDepth(baseDepth);
            }
            
            let depthScale = Phaser.Math.Clamp(p.y / GAME_H, 0.4, 1.2);
            p.setScale(depthScale);

            // Check survival platform (middle lane only, lane index 2)
            if (p.laneIndex === 2 && !p.survivedPlatform) {
                if (Math.abs(p.y - survivalPlatformY) < survivalPlatformRadius) {
                    p.survivedPlatform = true; // Mark as checked
                    if (Math.random() < 0.5) {
                        // 50% chance to die
                        p.destroy();
                        return;
                    }
                }
            }

            // Check second survival platform (middle lane only, lane index 2)
            if (p.laneIndex ===  2 && !p.survivedPlatform2) {
                if (Math.abs(p.y - survivalPlatformY2) < survivalPlatformRadius) {
                    p.survivedPlatform2 = true; // Mark as checked for second platform
                    if (Math.random() < 0.5) {
                        // 50% chance to die
                        p.destroy();
                        return;
                    }
                }
            }

            // Portal collision detection for players (players move UP, so check when y reaches portal y)
            if (p.laneIndex === 0 && !p.enteredPortal && !p.fromPortal) {
                // Check if player reached portal in lane 0
                if (p.y <= portal0Y + PORTAL_RADIUS && p.y >= portal0Y - PORTAL_RADIUS) {
                    p.enteredPortal = true;
                    // Transform player to enemy at lane 4 portal
                    spawnEnemyFromPortal(scene, 4, portal4Y);
                    p.destroy();
                    return;
                }
            } else if (p.laneIndex === 4 && !p.enteredPortal && !p.fromPortal) {
                // Check if player reached portal in lane 4
                if (p.y <= portal4Y + PORTAL_RADIUS && p.y >= portal4Y - PORTAL_RADIUS) {
                    p.enteredPortal = true;
                    // Transform player to enemy at lane 0 portal
                    spawnEnemyFromPortal(scene, 0, portal0Y);
                    p.destroy();
                    return;
                }
            }

            if (p.y < HORIZON_Y) { 
                roundPlayerScore++;
                roundScoreText.setText(`ROUND SCORE: ${roundPlayerScore} - ${roundEnemyScore}`);
                p.destroy();
            }
        }
    });

    enemyGroup.getChildren().forEach(e => {
        if (e.active) {
            // Gate blocking logic for enemies in lane 2
            if (e.laneIndex === gateLaneIndex) {
                // Check if enemy reached the gate
                if (e.y >= gateYPosition - 20 && !e.passedGate) {
                    if (!isGateOpen) {
                        // Gate is closed - enemy stops behind gate
                        e.y = gateYPosition - 20;
                        e.blockedByGate = true;
                        e.anims.stop(); // Stop animation
                        e.setFrame(0); // Use frame 0 for stopped pose
                    } else {
                        // Gate is open - enemy can pass
                        e.passedGate = true;
                        e.y += moveSpeed;
                    }
                } else if (e.blockedByGate) {
                    // Enemy was blocked - check if gate opened
                    if (isGateOpen) {
                        e.blockedByGate = false;
                        e.passedGate = true;
                        e.play('run_towards'); // Resume animation
                        e.y += moveSpeed;
                    } else {
                        e.y = gateYPosition - 20; // Keep stopped
                    }
                } else {
                    e.y += moveSpeed;
                }
            } else if (e.laneIndex === gate2LaneIndex) {
                // Gate 2 blocking logic for enemies in lane 4
                if (e.y >= gate2YPosition - 20 && !e.passedGate2) {
                    if (!isGate2Open) {
                        e.y = gate2YPosition - 20;
                        e.blockedByGate2 = true;
                        e.anims.stop();
                        e.setFrame(0);
                    } else {
                        e.passedGate2 = true;
                        e.y += moveSpeed;
                    }
                } else if (e.blockedByGate2) {
                    if (isGate2Open) {
                        e.blockedByGate2 = false;
                        e.passedGate2 = true;
                        e.play('run_towards');
                        e.y += moveSpeed;
                    } else {
                        e.y = gate2YPosition - 20;
                    }
                } else {
                    e.y += moveSpeed;
                }
            } else {
                e.y += moveSpeed;
            }
            
            e.x = getXForY(e.laneIndex, e.y);
            let baseDepth = e.y;
            
            // Gate crossing depth logic: enemy moves top to bottom
            // Initially gate on top, then enemy on top after crossing
            if (e.laneIndex === gateLaneIndex && gateSprite) {
                if (e.y > gateYPosition - 40 && e.y < gateYPosition +  20) {
                    // Enemy is crossing through gate - gate should be on top
                    e.setDepth(gateSprite.depth - 1);
                } else {
                    e.setDepth(baseDepth);
                }
            } else if (e.laneIndex === gate2LaneIndex && gate2Sprite) {
                if (e.y > gate2YPosition - 40 && e.y < gate2YPosition + 20) {
                    e.setDepth(gate2Sprite.depth - 1);
                } else {
                    e.setDepth(baseDepth);
                }
            } else {
                e.setDepth(baseDepth);
            }
            
            let depthScale = Phaser.Math.Clamp(e.y / GAME_H, 0.4, 1.2);
            e.setScale(depthScale);

            // Check survival platform (middle lane only, lane index 2)
            if (e.laneIndex === 2 && !e.survivedPlatform) {
                if (Math.abs(e.y - survivalPlatformY) < survivalPlatformRadius) {
                    e.survivedPlatform = true; // Mark as checked
                    if (Math.random() < 0.5) {
                        // 50% chance to die
                        e.destroy();
                        return;
                    }
                }
            }

            // Check second survival platform (middle lane only, lane index 2)
            if (e.laneIndex === 2 && !e.survivedPlatform2) {
                if (Math.abs(e.y - survivalPlatformY2) < survivalPlatformRadius) {
                    e.survivedPlatform2 = true; // Mark as checked for second platform
                    if (Math.random() < 0.5) {
                        // 50% chance to die
                        e.destroy();
                        return;
                    }
                }
            }

            // Portal collision detection for enemies (enemies move DOWN, so check when y reaches portal y)
            if (e.laneIndex === 0 && !e.enteredPortal && !e.fromPortal) {
                // Check if enemy reached portal in lane 0
                if (e.y >= portal0Y - PORTAL_RADIUS && e.y <= portal0Y + PORTAL_RADIUS) {
                    e.enteredPortal = true;
                    // Transform enemy to player at lane 4 portal
                    spawnPlayerFromPortal(scene, 4, portal4Y);
                    e.destroy();
                    return;
                }
            } else if (e.laneIndex === 4 && !e.enteredPortal && !e.fromPortal) {
                // Check if enemy reached portal in lane 4
                if (e.y >= portal4Y - PORTAL_RADIUS && e.y <= portal4Y + PORTAL_RADIUS) {
                    e.enteredPortal = true;
                    // Transform enemy to player at lane 0 portal
                    spawnPlayerFromPortal(scene, 0, portal0Y);
                    e.destroy();
                    return;
                }
            }

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
    
    // Hide character selection panel so buttons can be clicked
    if (characterSelectionPanel) {
        characterSelectionPanel.setVisible(false);
    }
    
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

    if (currentRound === 5) {
        let matchResult = "";
        let matchColor = "";
        let btnText = "";

        if (playerWins > enemyWins) {
            matchResult = "MATCH WINNER:\nYOU!";
            matchColor = COLOR_ORANGE; 
            btnText = " PLAY AGAIN ";
            
            // Show both restart and home buttons
            centerMessageText.setText(matchResult).setFill(matchColor);
            
            nextRoundBtn.setText(btnText)
                .setBackgroundColor(COLOR_ORANGE)
                .setX((GAME_W / 2) - 140)
                .setY((GAME_H / 2) + 200) 
                .setVisible(true);
            
            nextLevelBtn.setText(" HOME ")
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
    // Store current round's player lane counts for Recursive Call ability
    previousRoundPlayerLanes = [...playerLaneCounts];
    
    currentRound++;
    
    // Enable Recursive Call for round 2+ only if not already used
    if (!recursiveCallUsed) {
        recursiveCallAvailable = true;
    }
    
    resetRoundScores();
    updateUI();
    updateUndoButton();
    updateRecursiveButton();

    centerMessageText.setVisible(false);
    nextRoundBtn.setVisible(false);
    nextLevelBtn.setVisible(false);
    roundScoreText.setVisible(false);
    
    startBtn.setVisible(true);
    abilityBtnContainer.setVisible(true);
    undoBtnContainer.setVisible(true);
    restartBtnContainer.setVisible(true);
    threatHashBtnContainer.setVisible(true);
    recursiveBtnContainer.setVisible(true);
    mergeBtnContainer.setVisible(true);
    updateThreatHashButton();
    updateMergeButton();
}

function onMeet(p, e) {
    if (!p.active || !e.active) return;
    
    // 1. Merged Player Wins (Player survives, Enemy dies)
    if (p.isMerged) {
        e.body.enable = false;
        this.tweens.add({ targets: e, alpha: 0, duration: 200, onComplete: () => { e.destroy(); }});
        return;
    }
    
    // 2. *** FIX HERE: Immortal Enemy Wins (Enemy survives, Player dies) ***
    if (e.isImmortal) {
        p.body.enable = false;
        this.tweens.add({ targets: p, alpha: 0, duration: 200, onComplete: () => { p.destroy(); }});
        return;
    }
    
    // 3. Stack Overflow Attack (Player dies instantly if conditions met)
    // Note: Since Stack Overflow enemies are usually just Red (not immortal), they die too in the collision below
    // unless you want the Stack Overflow enemy to survive the hit as well. 
    // Currently, your logic implies the player dies before they can kill the enemy? 
    // If you want the Stack Overflow enemy to survive, move this logic up or return here.
    if (enemyStackOverflowRound === currentRound - 1 && p.laneIndex === e.laneIndex) {
        p.body.enable = false;
        this.tweens.add({ targets: p, alpha: 0, duration: 200, onComplete: () => { p.destroy(); }});
        // If the enemy triggers stack overflow, do we destroy the enemy too? 
        // Usually "Stack Overflow" implies a crash/kill. 
        // If the enemy should also die (suicide bomber style), keep going. 
        // If the enemy should survive, add 'return;' here.
        return; 
    }
    
    // 4. Standard Collision (Both die)
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
