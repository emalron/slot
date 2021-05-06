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
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

var game = new Phaser.Game(config);

function preload() {
    console.log(this);
    this.load.image('reel', 'assets/reel.png');
    this.coin = 10;
    init();
}

function create() {
    console.log(this);
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
}

function update(time, delta) {
    if(this.start) {
        for(var i=0; i<9; i++) {
            this.boxes[i].tilePositionY -= this.speeds[i] * delta;
            let y_ = this.boxes[i].tilePositionY;
            if(time > this.now + 2000 & y_ % 200 < -1) {
                let yint_ = Math.round(y_);
                this.boxes[i].tilePositionY = yint_ - (yint_ % 200);
                this.speeds[i] = 0;
                this.result[i] = (this.boxes[i].tilePositionY % 600) / (-200);
            }
        }
        if(checkEnd(this)) {
            this.start = false;
            const matched = checkResult(this.result);
            if(matched > 0) {
                console.log(`MATCHED! ${matched}`);
                this.coin += matched;
                updatedom();
            }
            setSpeed(this);
        }
    }
}

function setSpeed(scene) {
    for(var i=0; i<9; i++) {
        const rnd = (Math.random() * 10) % 3;
        scene.speeds[i] = Phaser.Math.GetSpeed(600, 0.5 * rnd + 0.3);
    }
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
    matched = 0;
    for(var j=0; j<3; j++) {
        let item0 = result[0 + j*3];
        let item1 = result[1 + j*3];
        let item2 = result[2 + j*3];
        const are_matched = item0 == item1 && item1 == item2;
        if(are_matched) {
            matched++;
        }
    }
    for(var i=0; i<3; i++) {
        let item0 = result[i + 0*3];
        let item1 = result[i + 1*3];
        let item2 = result[i + 2*3];
        const are_matched = item0 == item1 && item1 == item2;
        if(are_matched) {
            matched++;
        }
    }
    let tat = [[0, 4, 8], [2, 4, 6]];
    for(var i=0; i<2; i++) {
        let item0 = result[tat[i][0]];
        let item1 = result[tat[i][1]];
        let item2 = result[tat[i][2]];
        const are_matched = item0 == item1 && item1 == item2;
        if(are_matched) {
            matched++;
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
}

function updatedom() {
    const coin = game.scene.scenes[0].coin;
    const coin_display = document.querySelector("span#coin");
    coin_display.textContent = coin;
    const coin_bar = document.querySelector("div.progress-bar");
    const ratio = coin / 30 * 100;
    coin_bar.style = `width:${ratio}%`;
}

function init() {
    updatedom()
}