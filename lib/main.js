var GameScene = new Phaser.Class({
    Extends: Phaser.Scene,
    initialize: function GameScene() {
        Phaser.Scene.call(this, { key: 'GameScene' })
    },
    preload: function() {
        this.load.image('reel', 'assets/reel.png');
        this.load.audio('coin', ['assets/coin.wav'])
        this.coin = 10;
        init();
    },
    create: function() {
        this.boxes = [];
        this.result = [];
        this.speeds = [];
        this.start = false;
        for(var i=0; i<9; i++) {
            let x_ = (i % 3) * 200;
            let y_ = parseInt(i/3) * 200;
            let reel_ = this.add.tileSprite(x_, y_, 200, 600, 'reel').setOrigin(0,0);
            this.boxes.push(reel_);
            this.result.push(-1);
        }
        setSpeed(this);
        this.coin_sounds = [];
        for(var i=0; i<9; i++) {
            this.coin_sounds.push(this.sound.add('coin'));
        }
    },
    update: function(time, delta) {
        if(this.start) {
            for(var i=0; i<9; i++) {
                this.boxes[i].tilePositionY -= this.speeds[i] * delta;
                let y_ = this.boxes[i].tilePositionY;
                if(time > this.now + 2000 & (y_ % 200) < -194) {
                    let yint_ = Math.round(y_-6);
                    // this.boxes[i].tilePositionY = yint_ - (yint_ % 200);
                    this.boxes[i].tilePositionY = yint_;
                    this.speeds[i] = 0;
                    this.result[i] = ((this.boxes[i].tilePositionY - (yint_ % 200)) % 600) / (-200);
                }
            }
            if(checkEnd(this)) {
                this.start = false;
                const matched = checkResult(this.result);
    
                if(matched.length > 0) {
                    console.log(`MATCHED! ${matched}`);
                    this.coin += matched.filter(m => m == true).length;
                    console.log(this.result);
                    reward(matched);
                    updatedom();
                }
                setSpeed(this);
            }
        }
    }
})

var UIScene = new Phaser.Class({
    Extends: Phaser.Scene,
    initialize: function UIScene() {
        Phaser.Scene.call(this, {key: 'UIScene', active: true})
    },
    create: function() {
        const coords = [
            {start: [0, 200], end: [600, 200]},
            {start: [0, 400], end: [600, 400]},
            {start: [200, 0], end: [200, 600]},
            {start: [400, 0], end: [400, 600]}
        ]
        for(var i=0; i<4; i++) {
            let line_ = this.add.graphics();
            line_.lineStyle(5, 0x000000, 1);
            line_.lineBetween(coords[i].start[0], coords[i].start[1], coords[i].end[0], coords[i].end[1])
        }
    }
})

const config = {
    type: Phaser.CANVAS,
    canvas: document.querySelector("canvas#display"),
    width: 600,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: {y: 300},
            debug: false
        }
    },
    scene: [ GameScene, UIScene ]
};
var game = new Phaser.Game(config);

function setSpeed(scene) {
    for(var i=0; i<9; i++) {
        const rnd = (Math.random() * 10) % 3;
        scene.speeds[i] = Phaser.Math.GetSpeed(600, 0.2 * rnd + 0.8);
    }
    console.log(scene.speeds)
}

function checkEnd(scene) {
    let stopped = scene.speeds.filter(s => s == 0).length
    if(stopped == 9) {
        console.log(`stoppppped`)
        return true;
    } else {
        return false;
    }
}

function checkResult(result) {
    matched = [];
    for(var j=0; j<3; j++) {
        let item0 = result[0 + j*3];
        let item1 = result[1 + j*3];
        let item2 = result[2 + j*3];
        const are_matched = item0 == item1 && item1 == item2;
        if(are_matched) {
            matched[j] = true;
        }
    }
    for(var i=0; i<3; i++) {
        let item0 = result[i + 0*3];
        let item1 = result[i + 1*3];
        let item2 = result[i + 2*3];
        const are_matched = item0 == item1 && item1 == item2;
        if(are_matched) {
            matched[3+i] = true;
        }
    }
    let tat = [[0, 4, 8], [2, 4, 6]];
    for(var i=0; i<2; i++) {
        let item0 = result[tat[i][0]];
        let item1 = result[tat[i][1]];
        let item2 = result[tat[i][2]];
        const are_matched = item0 == item1 && item1 == item2;
        if(are_matched) {
            matched[6+i] = true;
        }
    }
    return matched;
}

function setStart(game) {
    let scene = game.scene.scenes[0];
    scene.start = true;
    scene.now = scene.time.now;
    scene.coin--;
    updatedom();
    if(scene.lines == null) {
        scene.lines = [];
    } else {
        scene.lines.forEach(l => l.destroy());
    }
}

function updatedom() {
    const coin = game.scene.scenes[0].coin;
    const coin_display = document.querySelector("span#coin");
    coin_display.textContent = coin;
    const coin_bar = document.querySelector("div.progress-bar");
    const ratio = coin / 30 * 100;
    coin_bar.style = `width:${ratio}%`;

    const hit_max = coin == 30;
    if(hit_max) {
        alert(`축하합니다~ 승리!`);
    }
}

function init() {
    updatedom()
}


var graphic;
const coords = [
    {start: [100, 100], end: [500, 100]},
    {start: [100, 300], end: [500, 300]},
    {start: [100, 500], end: [500, 500]},
    {start: [100, 100], end: [100, 500]},
    {start: [300, 100], end: [300, 500]},
    {start: [500, 100], end: [500, 500]},
    {start: [100, 100], end: [500, 500]},
    {start: [500, 100], end: [100, 500]}
]

function reward(matched) {
    const scene = game.scene.scenes[0];
    matched.forEach((m, i) => {
        if(m == true) {
            // play sound
            scene.coin_sounds[i].play();

            // draw line
            drawlines(scene, i);
        }
    })
}

function drawlines(scene, i) {
    let line_ = scene.add.graphics();
    line_.lineStyle(5, 0x00ff00, 0.8);
    line_.lineBetween(coords[i].start[0], coords[i].start[1], coords[i].end[0], coords[i].end[1])
    scene.lines.push(line_);
}