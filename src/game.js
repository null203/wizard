function createBackground() {
    let points = generatePoints();
    for (let point of points) {
        if (!isColliding(player, point) && point.x + objSize < worldLimit && point.y + objSize < worldLimit) {
            let direction = weightedRandom({
                1: 0.2,
                2: 0.2,
                3: 2,
                4: 2,
                5: 8,
                6: 8
            });
            let hp = 0;
            let maxHp = 0;
            let def = 0;
            if (direction <= 2) {
                hp = 100;
                maxHp = 100;
            }
            if (direction >= 3 && direction <= 4) {
                hp = 100;
                maxHp = 100;
                def = 90;
            }
            if (direction >= 5 && direction <= 6) {
                hp = 100;
                maxHp = 100;
                def = 70;
            }
            backgroundArr.push(Sprite({
                hp: hp,
                maxHp: maxHp,
                def: def,
                x: point.x,
                y: point.y,
                width: objSize,
                height: objSize,
                anchor: { x: 0.5, y: 0.5 },
                type: 'background',
                direction: direction,
                frameCount: 0,
                isAlive: function () {
                    return this.hp > 0 && this.ttl > 60;
                },
                ttl: Infinity,
                update() {
                    this.frameCount++;
                    if (this.ttl > 0) {
                        this.ttl--;
                    }
                    // 火把动画
                    if (this.frameCount % 15 == 0) {
                        if (this.direction == 1) {
                            this.direction = 2;
                        } else if (this.direction == 2) {
                            this.direction = 1;
                        }
                    }
                    if (this.hp <= 0 && this.ttl > 60) {
                        this.hp = 0;
                        this.ttl = 60;
                        if (direction <= 2) {
                            createItem(this.x, this.y, 100, heart);
                        }
                        scoreboard.break++;
                    }
                    if (this.hp < this.maxHp && this.frameCount % 60 == 0) {
                        this.hp++;
                        if (this.hp == this.maxHp) {
                            this.ttl = Infinity;
                        }
                    }
                    if (this.frameCount > 30000) {
                        this.frameCount = 0;
                    }
                },
                render() {
                    if (this.ttl > 60) {
                        drawBitmap(this.direction, background);
                    } else if (this.ttl > 0) {
                        drawBitmap(Math.ceil(this.ttl / 15), boom);
                    }
                }
            }));
        }
    }
}

function createEnemy(data) {
    let angle = Math.random() * 2 * Math.PI;
    let x = Math.round(player.x + screenHeight * 0.8 * Math.cos(angle));
    let y = Math.round(player.y + screenHeight * 0.8 * Math.sin(angle));

    let speed = (enemyPool.getAliveObjects().length >= (enemyPool.maxSize / 2) && randInt(1, 100) <= 20) ? 2 : 1;

    return enemyPool.get({
        hp: data.hp,
        atk: data.atk,
        def: data.def,
        exp: data.exp,
        x: x,
        y: y,
        width: objSize * (data.size ? data.size / pixelSize : 1),
        height: objSize * (data.size ? data.size / pixelSize : 1),
        anchor: { x: 0.5, y: 0.5 },
        type: data.isBoss ? 'boss' : 'enemy',
        direction: LEFT,
        speed: (data.speed ? data.speed : speed) * kw,
        frameCount: 0,
        timeCount: 0,
        ttl: Infinity,
        isDead: false,
        attack() {
            let damage = Math.floor(this.atk - player.def);
            if (damage < 1) {
                damage = 1;
            }
            player.hp = player.hp - (damage > 0 ? damage : 1);
            if (player.hp < 0) {
                player.hp = 0;
            }
            audioAssets[data.audioPath].play();
            showDamage(player.x, player.y, damage, 1);
            scoreboard.receivedDamage += damage;
        },
        isAlive() {
            return this.ttl > 0;
        },
        update(dt) {
            this.frameCount++;
            if (this.ttl > 0) {
                this.ttl--;
            }
            if (this.ttl < 60) {
                return;
            }
            if (this.hp <= 0) {
                createItem(this.x, this.y, this.exp, exp_ball);
                this.ttl = 60;
                this.isDead = true;
                scoreboard.kill++;
                return;
            }
            this.timeCount += dt;
            if (this.timeCount >= 1) {
                if (isVisible(this)) {
                    const dx = (Math.abs(player.x - this.x) / objSize) | 0;
                    const dy = (Math.abs(player.y - this.y) / objSize) | 0;
                    if (Math.max(dx, dy) < enemyAttackRangeTiles) {
                        this.attack();
                    }
                }
                this.timeCount = 0;
            }
            let acrossFlag = false;
            for (let otherEnemy of quadtree.get(this)) {
                if (otherEnemy != player && otherEnemy.isAlive() && isColliding(this, otherEnemy) && otherEnemy.type != 'skill') {

                    let deltaX = this.x - otherEnemy.x;
                    let deltaY = this.y - otherEnemy.y;
                    let distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

                    if (distance > 0 && distance < minDistance) {
                        if (otherEnemy.type == 'background') {
                            acrossFlag = true;
                            break;
                        } else {
                            let unitX = deltaX / distance;
                            let unitY = deltaY / distance;
                            let offset = pixelSize * 0.5;
                            this.x += Math.round(unitX * offset);
                            this.y += Math.round(unitY * offset);
                        }
                    }
                }
            }
            if (this.frameCount % 30 === 0) {
                // 计算敌人到玩家的方向向量
                let deltaX = player.x - this.x;
                let deltaY = player.y - this.y;
                let distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
                if (distance < approachDistance) {
                    // 计算目标方向
                    let angle = Math.atan2(deltaY, deltaX);
                    // 计算包围的目标点（可以稍微偏移玩家的位置）
                    let targetX = player.x + Math.cos(angle + Math.PI / 2) * 30; // 目标点向右偏移
                    let targetY = player.y + Math.sin(angle + Math.PI / 2) * 30; // 目标点向下偏移
                    // 更新敌人位置
                    let targetDeltaX = targetX - this.x;
                    let targetDeltaY = targetY - this.y;
                    let targetDistance = Math.sqrt(targetDeltaX * targetDeltaX + targetDeltaY * targetDeltaY);

                    if (targetDistance > minDistance) {
                        let unitX = targetDeltaX / targetDistance;
                        let unitY = targetDeltaY / targetDistance;
                        this.dx = Math.round(unitX * this.speed);
                        this.dy = Math.round(unitY * this.speed);
                    } else {
                        this.dx = 0;
                        this.dy = 0;
                    }
                } else {
                    // 更新敌人的速度和方向，使其朝向玩家移动
                    if (distance > minDistance) {
                        let unitX = deltaX / distance;
                        let unitY = deltaY / distance;
                        this.dx = Math.round(unitX * this.speed);
                        this.dy = Math.round(unitY * this.speed);
                    } else {
                        this.dx = 0;
                        this.dy = 0;
                    }
                }
                setDirection(this, deltaX, deltaY);
            }
            checkBoundary(this);
            if (acrossFlag) {
                if (this.frameCount % 3 === 0) {
                    this.advance();
                }

            } else {
                this.advance();
            }
            if (this.frameCount > 30000) {
                this.frameCount = 0;
            }
        },
        render() {
            if (isVisible(this)) {
                if (this.ttl > 60) {
                    drawBitmap(this.direction, data.mat, data.size);
                } else {
                    drawBitmap(Math.ceil(this.ttl / 15), boom, data.size);
                }
            }
        }
    });
}

function createItem(x, y, v, mat) {
    if (itemPool.size == itemPool.maxSize) {
        for (let item of itemPool.getAliveObjects()) {
            if (!isVisible(item)) {
                item.ttl = 0;
                itemPool.update();
                break;
            }
        }
    }
    itemPool.get({
        x: x,
        y: y,
        width: objSize,
        height: objSize,
        anchor: { x: 0.5, y: 0.5 },
        type: 'item',
        direction: LEFT,
        progress: 0,
        fly: false,
        ttl: 1800,
        effect() {
            if (mat == exp_ball) {
                player.addExp(v);
            } else if (mat == heart) {
                player.addHp(v);
            }
        },
        update() {
            if (this.ttl > 0) {
                this.ttl--;
            }
            if (this.fly) {
                const controlPoint1 = {
                    x: x + (player.x - x) * 0.3,
                    y: y - 50 * kw
                };
                const controlPoint2 = {
                    x: x + (player.x - x) * 0.7,
                    y: player.y - 50 * kw
                };
                this.progress += 0.02;
                bezier(this, controlPoint1, controlPoint2, this.progress);
                if (this.progress >= 1) {
                    this.ttl = 0;
                    this.effect();
                }
            } else {
                let deltaX = player.x - this.x;
                let deltaY = player.y - this.y;
                let distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

                if (distance < player.pickupDistance) {
                    this.fly = true;
                }
            }
        },
        render() {
            if (isVisible(this)) {
                drawBitmap(this.direction, mat);
            }
        }
    });
}

function showDamage(x, y, damage, crit) {
    msgPool.get({
        x: x,
        y: y,
        ttl: 90,
        update() {
            if (this.ttl > 0) {
                this.ttl--;
                this.dy = -0.5;
            }
            this.advance();
        },
        render() {
            if (isVisible(this)) {
                context.save();
                context.translate(Math.round(screenWidth / 2 - player.x), Math.round(screenHeight / 2 - player.y - objSize * 3));
                context.fillStyle = 'white';
                context.font = `${Math.floor(13 * kw * crit)}px Arial`;
                context.fillText(damage, -objSize * 3 / 5, -objSize / 2);
                context.restore();
            }
        }
    });
}

function showMsg(x, y, msg, ttl = 120) {
    msgPool.get({
        x: x,
        y: y,
        ttl: ttl,
        update() {
            if (this.ttl > 0) {
                this.ttl--;
                this.dy = -1;
            }
            this.advance();
        },
        render() {
            if (isVisible(this)) {
                context.save();
                context.translate(Math.round(screenWidth / 2 - player.x + objSize / 2), Math.round(screenHeight / 2 - player.y + objSize / 2 - objSize * 3));
                context.fillStyle = 'white';
                context.font = `${Math.floor(19 * kw)}px Arial`;
                context.textAlign = 'center';
                context.fillText(msg, 0, 0);
                context.restore();
            }
        }
    });
}

const expBar = Sprite({
    x: 0,
    y: 0,
    width: screenWidth,
    height: objSize * 2 / 3,
    render() {
        context.fillStyle = 'black';
        context.fillRect(0, 0, this.width, this.height);

        const expBarWidth = (player.exp / player.maxExp) * screenWidth;

        context.fillStyle = 'gray';
        context.fillRect(0, 0, expBarWidth, this.height);

        let fontSize = Math.floor(17 * kw);
        context.fillStyle = 'white';
        context.font = `${fontSize}px Arial`;
        context.textAlign = 'center';
        context.fillText(`LV ${player.lv}`, this.width / 2, this.height - 2 * kw);
    }
});

const statusBar = Sprite({
    x: 0,
    y: expBar.height,
    m: 0,
    s: 0,
    time: '00:00',
    init() {
        this.m = 0;
        this.s = 0;
        this.time = '00:00';
    },
    update() {
        this.s++;
        if (this.s == 60) {
            this.m++;
            this.s = 0;
        }
        this.time = displayNumber(this.m) + ':' + displayNumber(this.s);
    },
    render() {
        const hpBarWidth = Math.round((player.hp / player.maxHp) * 10);
        context.fillStyle = 'white';
        context.font = `${Math.floor(13 * kw)}px Arial`;
        context.fillText('HP ', objSize / 2, objSize / 2);

        for (let i = 1; i <= hpBarWidth; i++) {
            let x = i * pixelSize * 4.5 + objSize;
            context.fillRect(
                x,
                objSize / 2 - 10 * kw,
                pixelSize * 3,
                pixelSize * 5
            );
        }

        context.textAlign = 'center';
        context.font = `${Math.floor(19 * kw)}px Arial`;
        context.fillText(`${this.time}`, screenWidth / 2, objSize);
    }
});

const menu = Button({
    x: screenWidth - objSize - pixelSize * 5,
    y: objSize / 2 + pixelSize * 5,
    width: objSize,
    height: objSize,
    onUp() {
        openDialog(mainDialog);
    },
    onOut() {
        this.pressed = false;
    },
    render() {
        let color = this.pressed ? 'white' : 'gray';
        for (let y = 0; y < bitmapHeight; y++) {
            let row = menu_book[y];
            for (let x = 0; x < bitmapWidth; x++) {
                let isPixelOn = (row >> (bitmapWidth - 1 - x)) & 1;
                context.fillStyle = isPixelOn ? color : 'black';
                context.fillRect(
                    x * pixelSize,
                    y * pixelSize,
                    pixelSize,
                    pixelSize
                );
            }
        }
    }
});

const worldBoundary = Sprite({
    x: 0,
    y: 0,
    width: worldLimit,
    height: worldLimit,
    render() {
        context.save();
        context.strokeStyle = 'white';
        context.lineWidth = 2 * kw;
        context.strokeRect(
            -viewport.x,
            -viewport.y,
            worldLimit,
            worldLimit
        );
        context.restore();
    }
});

const player = Sprite({
    x: playerData.x,
    y: playerData.y,
    maxHp: playerData.maxHp,
    hp: playerData.maxHp,
    atk: playerData.atk,
    def: playerData.def,
    crit: playerData.crit,
    maxExp: playerData.maxExp,
    lv: 1,
    exp: 0,
    anchor: { x: 0.5, y: 0.5 },
    width: objSize,
    height: objSize,
    direction: LEFT,
    skill: [],
    cards: [],
    stop: false,
    point: 0,
    pickupDistance: 50 * kw,
    angle: 0,
    lastDx : 0,
    lastDy : 0,
    init() {
        this.x = playerData.x;
        this.y = playerData.y;
        this.maxHp = playerData.maxHp;
        this.hp = playerData.maxHp;
        this.atk = playerData.atk;
        this.def = playerData.def;
        this.crit = playerData.crit;
        this.maxExp = playerData.maxExp;
        this.lv = 1;
        this.exp = 0;
        this.direction = LEFT;
        this.skill = [];
        this.cards = [];
        this.stop = false;
        this.point = 0;
        this.pickupDistance = 50 * kw;
    },
    checkPoint() {
        if (this.point > 0) {
            audioAssets['/audio/level_up'].play();
            showMsg(this.x, this.y, 'LEVEL UP');
            openDialog(levelUpDialog);
        }
    },
    addExp(exp) {
        if (this.lv < maxExp.length) {
            let tempExp = exp;
            while (tempExp > 0) {
                this.exp += tempExp;
                if (this.exp >= this.maxExp) {
                    this.lv++;
                    tempExp = this.exp - this.maxExp;
                    this.exp = 0;
                    this.maxExp = maxExp[this.lv - 1];
                    this.point++;
                } else {
                    return;
                }
            }
        }
    },
    addHp(hp) {
        this.hp += hp;
        if (this.hp > this.maxHp) {
            this.hp = this.maxHp;
        }
        showDamage(this.x, this.y, '+' + hp, 1);
    },
    isAlive() {
        return this.hp > 0;
    },
    attack(enemy, ratio) {
        const critFlg = this.crit > randInt(1, 100) ? 2 : 1;
        let damage = Math.floor((this.atk - enemy.def) * (ratio / 100)) * critFlg;
        if (damage < 1) {
            damage = 1;
        }
        enemy.hp = enemy.hp - damage;
        showDamage(enemy.x, enemy.y, damage, critFlg);
        scoreboard.damage += damage;
    },
    update() {
        if (!this.isAlive()) {
            openDialog(gameOverDialog);
        }
        if (this.stop) {
            return;
        }
        for (let obj of quadtree.get(this)) {
            if (obj.type == 'background' && obj.isAlive() && isColliding(this, obj)) {
                let deltaX = this.x - obj.x;
                let deltaY = this.y - obj.y;
                let distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

                if (distance > 0) {
                    let unitX = deltaX / distance;
                    let unitY = deltaY / distance;
                    let offset = pixelSize;
                    this.x += Math.round(unitX * offset);
                    this.y += Math.round(unitY * offset);
                    break;
                }
            }
        }
        if (joystick.active) {
            setDirection(this, joystick.offsetX, joystick.offsetY);
        } else {
            keyboard();
        }
        this.dx = Math.round(joystick.offsetX * speedFactor);
        this.dy = Math.round(joystick.offsetY * speedFactor);
        if (this.dx != 0 || this.dy != 0){
            this.angle = Math.atan2(this.dy, this.dx);
        }
        this.lastDx = this.dx != 0 ? this.dx : this.lastDx;
        this.lastDy = this.dy != 0 ? this.dy : this.lastDy;
        checkBoundary(this);
        this.advance();
    },
    render() {
        drawBitmap(this.direction, wizard);
    }
});

const loop = GameLoop({

    update(dt) {
        for (let dialog of dialogArr) {
            dialog.update(dt);
        }
        if (paused) return;

        updateViewport(player);
        quadtree.clear();
        quadtree.add(player, enemyPool.getAliveObjects(), backgroundArr, fireball, deathbook, poisonsmoke, axe, lance);

        player.update(dt);
        enemyPool.update(dt);
        itemPool.update(dt);
        msgPool.update(dt);
        for (let skill of player.skill) {
            skill.update(dt);
        }
        for (let background of backgroundArr) {
            background.update();
        }
        expBar.update(dt);
        menu.update(dt);
    },

    render() {
        player.render();
        enemyPool.render();
        for (let background of backgroundArr) {
            if (isVisible(background)) {
                background.render();
            }
        }
        itemPool.render();
        msgPool.render();
        worldBoundary.render();
        expBar.render();
        statusBar.render();
        menu.render();
        drawJoystick();
        for (let skill of player.skill) {
            skill.render();
        }
        for (let dialog of dialogArr) {
            if (dialog.show) {
                dialog.render();
                break;
            }
        }
    }
});

function createBoss(boss) {
    let flag = !createEnemy(boss);
    if (flag) {
        for (let enemy of enemyPool.getAliveObjects()) {
            if (!isVisible(enemy)) {
                enemy.ttl = 0;
                return !createEnemy(boss);
            }
        }
    }
    return flag;
}

function wave(...args) {
    for (let i = 0; i < enemyCount; i++) {
        for (let data of args) {
            createEnemy(data);
        }
    }
}

function respawnEnemy() {
    if (enemyPool.getAliveObjects().length == enemyPool.maxSize) {
        for (let enemy of enemyPool.getAliveObjects()) {
            if (!isVisible(enemy) && enemy.type != 'boss') {
                let distance = Math.sqrt((enemy.x - player.x) ** 2 + (enemy.y - player.y) ** 2);
                if (distance > screenHeight * 0.8) {
                    enemy.ttl = 0;
                    enemy.update();
                }
            }
        }
    }
}

let boss_skeleton_flag = true;
let boss_crab_flag = true;
let boss_tauren_flag = true;
let no_skill_flag = true;

let low_hp_time = 0;

function intervalHandle() {
    respawnEnemy();
    player.checkPoint();
    statusBar.update();

    if (player.hp < player.maxHp / 2) {
        low_hp_time++;
        if (low_hp_time == 60) {
            showMsg(player.x, player.y, '摧毁火把可以恢复生命值', 600);
            low_hp_time = 0;
        }
    }

    if (no_skill_flag && player.skill.length > 1){
        for (let card of cardArr){
            if (card.type == CARD_TYPE_WEAPON){
                card.weight -= 0.5;
            }
        }
        no_skill_flag = false;
    }

    if (statusBar.m < 5) {
        wave(slime, skeleton);
    }
    else if (boss_skeleton_flag) {
        boss_skeleton_flag = createBoss(boss_skeleton);
    }
    else if (statusBar.m < 9) {
        wave(spider, snake);
    }
    else if (boss_crab_flag) {
        boss_crab_flag = createBoss(boss_crab);
    }
    else if (statusBar.m < 14) {
        wave(mummy, orc);
    }
    else if (boss_tauren_flag) {
        boss_tauren_flag = createBoss(boss_tauren);
    }
    else if (statusBar.m < 18) {
        wave(devil, fox);
    } else if (statusBar.m < 25) {
        wave(reaper, reaper);
    }
}

load(
    '/audio/attack_slime.mp3',
    '/audio/attack_sword.mp3',
    '/audio/attack_bite.mp3',
    '/audio/attack_blunt.mp3',
    '/audio/attack_fork.mp3',
    '/audio/attack_scythe.mp3',
    '/audio/attack_spider.mp3',
    '/audio/attack_big_sword.mp3',
    '/audio/skill_lightning.mp3',
    '/audio/skill_fireball.mp3',
    '/audio/skill_book.mp3',
    '/audio/skill_charge.mp3',
    '/audio/skill_lightsaber1.mp3',
    '/audio/skill_lightsaber2.mp3',
    '/audio/skill_poison.mp3',
    '/audio/skill_axe.mp3',
    '/audio/skill_lance.mp3',
    '/audio/level_up.mp3'
).then(function () {
    canvas.addEventListener('touchstart', handleTouchStart);
    canvas.addEventListener('touchmove', handleTouchMove);
    canvas.addEventListener('touchend', handleTouchEnd);
});

loadDialog.numAssets = 18;
loadDialog.assetsLoaded = 0;
on('assetLoaded', function () {
    loadDialog.assetsLoaded++;
});

loop.start();
openDialog(loadDialog);