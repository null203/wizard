function initFlowField() {
    costField = Array(rows).fill(0).map(() => Array(cols).fill(1));
    integrationField = Array(rows).fill(0).map(() => Array(cols).fill(Infinity));
    flowField = Array(rows).fill(0).map(() => Array(cols).fill(null));
    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            costField[y][x] = 1;
            integrationField[y][x] = Infinity;
            flowField[y][x] = null;
        }
    }
}

function updateFlowField() {

    let px = (player.x / gridSize) | 0;
    let py = (player.y / gridSize) | 0;

    let minX = Math.max(0, px - FLOW_RANGE);
    let maxX = Math.min(cols - 1, px + FLOW_RANGE);
    let minY = Math.max(0, py - FLOW_RANGE);
    let maxY = Math.min(rows - 1, py + FLOW_RANGE);

    // costField
    for (let y = minY; y <= maxY; y++) {
        for (let x = minX; x <= maxX; x++) {
            costField[y][x] = 1;
        }
    }
    for (let bg of backgroundArr) {
        if (!bg.isAlive()) continue;

        let cx = (bg.x / gridSize) | 0;
        let cy = (bg.y / gridSize) | 0;

        if (cx >= minX && cx <= maxX && cy >= minY && cy <= maxY) {
            costField[cy][cx] = 50;
        }
    }
    // 局部清空
    for (let y = minY; y <= maxY; y++) {
        for (let x = minX; x <= maxX; x++) {
            integrationField[y][x] = Infinity;
        }
    }
    // BFS
    let queue = [];
    integrationField[py][px] = 0;
    queue.push([px, py]);
    while (queue.length > 0) {
        let [x, y] = queue.shift();
        if (x < minX || x > maxX || y < minY || y > maxY) continue;
        let base = integrationField[y][x];
        for (let [dx, dy] of dirs) {
            let nx = x + dx;
            let ny = y + dy;
            if (nx >= minX && nx <= maxX && ny >= minY && ny <= maxY) {
                let newCost = base + costField[ny][nx];
                if (newCost < integrationField[ny][nx]) {
                    integrationField[ny][nx] = newCost;
                    queue.push([nx, ny]);
                }
            }
        }
    }
    // flowField
    for (let y = minY; y <= maxY; y++) {
        for (let x = minX; x <= maxX; x++) {
            let best = integrationField[y][x];
            let bestDir = null;
            if (best === Infinity) {
                flowField[y][x] = null;
                continue;
            }
            for (let [dx, dy] of dirs) {
                let nx = x + dx;
                let ny = y + dy;

                if (nx >= 0 && ny >= 0 && nx < cols && ny < rows) {
                    if (integrationField[ny][nx] < best) {
                        best = integrationField[ny][nx];
                        bestDir = { x: dx, y: dy };
                    }
                }
            }
            flowField[y][x] = bestDir;
        }
    }
    flowLastPlayerX = player.x;
    flowLastPlayerY = player.y;
}

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
            let dr = 0;
            if (direction <= 2) {
                hp = 100;
                maxHp = 100;
            }
            if (direction >= 3 && direction <= 4) {
                hp = 100;
                maxHp = 100;
                def = 120;
                dr = 0.35;
            }
            if (direction >= 5 && direction <= 6) {
                hp = 100;
                maxHp = 100;
                def = 90;
                dr = 0.2;
            }
            backgroundArr.push(Sprite({
                hp: hp,
                maxHp: maxHp,
                def: def,
                dr: dr,
                x: point.x,
                y: point.y,
                width: objSize,
                height: objSize,
                anchor: { x: 0.5, y: 0.5 },
                type: 'background',
                direction: direction,
                frameCount: 0,
                underAttack(damage) {
                    damage = Math.floor(damage * (1 - this.dr));
                    if (damage < 1) {
                        damage = 1;
                    }
                    this.hp = this.hp - damage;
                    return damage;
                },
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
                        var ratio = 0;
                        if (this.direction <= 2) {
                            ratio = 101;
                        }
                        if (this.direction >= 3 && this.direction <= 4) {
                            ratio = 20;
                        }
                        if (this.direction >= 5 && this.direction <= 6) {
                            ratio = 5;
                        }
                        if (ratio > randInt(1, 100)) {
                            createItem(this.x, this.y, 100, heart);
                        }
                        scoreboard.break++;
                    }
                    if (this.hp < this.maxHp && randInt(1, 100) <= 2) {
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
        underAttack(damage) {
            if (damage < 1) {
                damage = 1;
            }
            this.hp = this.hp - damage;
            return damage;
        },
        isAlive() {
            return this.ttl > 0;
        },
        update(dt) {
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
            // 寻路
            let cx = Math.floor(this.x / gridSize);
            let cy = Math.floor(this.y / gridSize);
            let dir = flowField[cy]?.[cx];
            let dx = 0;
            let dy = 0;
            if (dir) {
                dx = dir.x;
                dy = dir.y;
                let deltaX = player.x - this.x;
                let deltaY = player.y - this.y;
                let dist2 = deltaX * deltaX + deltaY * deltaY;
                if (dist2 < approachDistance * approachDistance) {
                    let len = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
                    if (len > 0) {
                        let ux = deltaX / len;
                        let uy = deltaY / len;
                        let inv = 30 / (Math.abs(ux) + Math.abs(uy));
                        let targetX = player.x - dy * inv;
                        let targetY = player.y + dx * inv;
                        let tx = targetX - this.x;
                        let ty = targetY - this.y;
                        let tlen = Math.sqrt(tx * tx + ty * ty);
                        if (tlen > minDistance) {
                            dx = tx / tlen;
                            dy = ty / tlen;
                        } else {
                            dx = 0;
                            dy = 0;
                        }
                    }
                }
            } else {
                let tx = player.x - this.x;
                let ty = player.y - this.y;
                let len = Math.sqrt(tx * tx + ty * ty);
                if (len > 0) {
                    dx = tx / len;
                    dy = ty / len;
                }
            }
            // 防重叠
            for (let other of quadtree.get(this)) {
                if (other === this) continue;
                if (other.type !== 'enemy') continue;
                if (!other.isAlive()) continue;
                let ux = this.x - other.x;
                let uy = this.y - other.y;
                let dist2 = ux * ux + uy * uy;
                if (dist2 === 0) continue;
                let minDist = (this.width + other.width) * 0.5;
                if (dist2 < minDist * minDist) {
                    let dist = Math.sqrt(dist2);
                    let overlap = (minDist - dist) * 0.5;
                    let nx = ux / dist;
                    let ny = uy / dist;
                    // 双方各退一半
                    this.x += nx * overlap;
                    this.y += ny * overlap;
                    other.x -= nx * overlap;
                    other.y -= ny * overlap;
                }
            }
            // 归一化速度
            let len = Math.sqrt(dx * dx + dy * dy);
            if (len > 0) {
                this.dx = (dx / len) * this.speed;
                this.dy = (dy / len) * this.speed;
            } else {
                this.dx = 0;
                this.dy = 0;
            }
            setDirection(this, this.dx, this.dy);
            checkBoundary(this);
            this.advance();
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
                let distance = deltaX * deltaX + deltaY * deltaY;
                if (distance < player.pickupDistance * player.pickupDistance) {
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
                context.font = `${Math.floor(13 * kw * crit)}px ${fontFamily}`;
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
                context.font = `${Math.floor(19 * kw)}px ${fontFamily}`;
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
        context.font = `${fontSize}px ${fontFamily}`;
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
        context.font = `${Math.floor(16 * kw)}px ${fontFamily}`;
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
        context.font = `${Math.floor(19 * kw)}px ${fontFamily}`;
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
    lastDx: 0,
    lastDy: 0,
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
        exp = Math.floor(exp * expRatio);
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
                    if (this.lv == 3) {
                        putItemCard();
                    }
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
        damage = enemy.underAttack(damage);
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
                let distance = deltaX * deltaX + deltaY * deltaY;
                if (distance > pixelSize * pixelSize) {
                    let d = Math.sqrt(distance);
                    let unitX = deltaX / d;
                    let unitY = deltaY / d;
                    let offset = pixelSize / 2;
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
        if (this.dx != 0 || this.dy != 0) {
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

        let dx = player.x - flowLastPlayerX;
        let dy = player.y - flowLastPlayerY;
        if (dx * dx + dy * dy > approachDistance * approachDistance) {
            updateFlowField();
        }
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
    let boss = createEnemy(boss);
    if (boss == null) {
        for (let enemy of enemyPool.getAliveObjects()) {
            if (!isVisible(enemy)) {
                enemy.ttl = 0;
                return createEnemy(boss);
            }
        }
    }
    return boss;
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
                let distance = (enemy.x - player.x) ** 2 + (enemy.y - player.y) ** 2;
                if (distance > screenHeight * screenHeight * 0.64) {
                    enemy.ttl = 0;
                    enemy.update();
                }
            }
        }
        respawnTime = 0;
    }
}

function intervalHandle() {
    if (respawnTime >= 5) {
        respawnEnemy();
    } else {
        respawnTime++;
    }
    player.checkPoint();
    statusBar.update();

    if (player.hp < player.maxHp / 2) {
        lowHpTime++;
        if (lowHpTime >= 60) {
            showMsg(player.x, player.y, '摧毁火把可以恢复生命值', 800);
            lowHpTime = 0;
        }
    }

    if (statusBar.m < 3) {
        wave(slime, skeleton);
    }
    else if (boss.skeleton == null) {
        boss.skeleton = createBoss(boss_skeleton);
    }
    else if (statusBar.m < 6) {
        wave(spider, snake);
    }
    else if (boss.crab == null) {
        boss.crab = createBoss(boss_crab);
    }
    else if (statusBar.m < 9) {
        wave(mummy, orc);
    }
    else if (boss.tauren == null) {
        boss.tauren = createBoss(boss_tauren);
    }
    else if (statusBar.m < 12) {
        wave(devil, fox);
    }
    else if (boss.alien == null) {
        boss.alien = createBoss(boss_alien);
    }
    else if (statusBar.m < 15) {
        wave(reaper, reaper);
    } else if (!boss.skeleton.isAlive()
        && !boss.crab.isAlive()
        && !boss.tauren.isAlive()
        && !boss.alien.isAlive()
    ) {
        openDialog(gameOverDialog);
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
    document.fonts.load(`12px ${fontFamily}`).then(function () {
        loadDialog.assetsLoaded++;
        canvas.addEventListener('touchstart', handleTouchStart);
        canvas.addEventListener('touchmove', handleTouchMove);
        canvas.addEventListener('touchend', handleTouchEnd);
    });
});


loadDialog.numAssets = 19;
loadDialog.assetsLoaded = 0;
on('assetLoaded', function () {
    loadDialog.assetsLoaded++;
});

loop.start();
openDialog(loadDialog);