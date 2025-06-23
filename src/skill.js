function damageDetection(obj, enemy) {
    return enemy != player
        && enemy.hp > 0
        && enemy.ttl > 60
        && isColliding(obj, enemy);
}

function multiDamageDetection(obj, enemy) {
    return damageDetection(obj, enemy)
        && !isExists(obj.targetArr, enemy);
}

const lightning = Sprite({
    x: 0,
    y: 0,
    ratio: 0,
    time: 1,
    cd: 2,
    radius: objSize * 6,
    timeCount: 0,
    frameCount: 0,
    target: null,
    init() {
        this.ratio = 360;
        this.timeCount = 0;
        this.target = null;
    },
    update(dt) {
        this.frameCount++;
        this.timeCount += dt;
        if (this.timeCount > this.cd + this.time) {
            this.timeCount = 0;
            this.target = null;
        }
        if (this.timeCount > this.cd) {
            // 搜索目标
            if (this.target == null) {
                let closestDistance = this.radius;
                for (let enemy of enemyPool.getAliveObjects()) {
                    const distance = Math.sqrt((enemy.x - player.x) ** 2 + (enemy.y - player.y) ** 2);
                    if (distance < closestDistance) {
                        closestDistance = distance;
                        this.target = enemy;
                    }
                }
                // 发动攻击
                if (this.target != null) {
                    audioAssets['/audio/skill_lightning'].play();
                    player.attack(this.target, this.ratio);
                }
            }
            // 没有目标刷新cd
            if (this.target == null) {
                this.timeCount = this.cd;
            }
        }
        if (this.frameCount > 30000) {
            this.frameCount = 0;
        }
    },
    render() {
        if (this.target != null) {
            const distance = Math.sqrt((this.target.x - player.x) ** 2 + (this.target.y - player.y) ** 2);
            if (distance < this.radius * 1.2) {
                let i = Math.round(distance / (objSize * 2));
                if (i < 2) i = 2;
                if (i > 4) i = 4;
                this.drawLightning(player.x, player.y, this.target.x, this.target.y, i);
            }
        }
    },
    drawLightning(x1, y1, x2, y2, iterations) {
        if (iterations === 0) {
            context.save();
            context.translate(Math.round(screenWidth / 2 - player.x), Math.round(screenHeight / 2 - player.y - objSize * 3));
            context.beginPath();
            context.moveTo(x1, y1);
            context.lineTo(x2, y2);
            context.strokeStyle = `rgba(255, 255, 255, ${Math.random()})`; // 随机透明度模拟闪烁效果
            context.lineWidth = 2 * kw;
            context.stroke();
            context.restore();
            return;
        }
        // 计算中点，并随机偏移
        const midX = (x1 + x2) / 2 + (Math.random() - 0.5) * (objSize * 1.2);
        const midY = (y1 + y2) / 2 + (Math.random() - 0.5) * (objSize * 1.2);
        // 递归绘制左右两半段
        this.drawLightning(x1, y1, midX, midY, iterations - 1);
        this.drawLightning(midX, midY, x2, y2, iterations - 1);
    }
});

const fireball = Sprite({
    x: 0,
    y: 0,
    width: 12 * kw,
    height: 12 * kw,
    type: 'skill',
    anchor: { x: 0.5, y: 0.5 },
    ratio: 0,
    time: 3,
    cd: 2,
    radius: objSize * 8,
    speed: 180 * kw,
    particles: Pool({
        maxSize: 170,
        create: Sprite
    }),
    timeCount: 0,
    active: false,
    targetArr: [],
    init() {
        this.ratio = 240;
        this.timeCount = 0;
        this.dx = 0;
        this.dy = 0;
        this.active = false;
    },
    update(dt) {
        this.timeCount += dt;
        this.particles.update();
        if (this.timeCount > this.cd + this.time) {
            this.timeCount = 0;
            this.dx = 0;
            this.dy = 0;
            this.active = false;
        }
        if (!this.active && this.timeCount > this.cd) {
            this.x = player.x;
            this.y = player.y;
            this.particles.clear();

            this.dx = Math.round(Math.cos(player.angle) * this.speed);
            this.dy = Math.round(Math.sin(player.angle) * this.speed);
            audioAssets['/audio/skill_fireball'].play();
            this.active = true;
            this.targetArr = [];
        }
        if (this.active) {
            this.particles.get(this.createParticles());
            for (let enemy of quadtree.get(this)) {
                if (multiDamageDetection(this, enemy)) {
                    player.attack(enemy, this.ratio);
                    this.targetArr.push(enemy);
                }
            }
        }
        this.advance(dt);
    },
    render() {
        if (this.active) {
            this.particles.render();
        }
    },
    createParticles() {
        this.particles.get({
            x: 0,
            y: 0,
            anchor: { x: 0.5, y: 0.5 },
            radius: (Math.random() * (fireball.width / 2 - 2) + 2) * kw,
            color: `rgba(255, 255, 255, ${Math.random() * 0.5 + 0.5})`,
            ttl: 60,
            update() {
                const particle = this;
                particle.dx = Math.random() * 0.5 - 0.25 - fireball.dx * 0.02;
                particle.dy = Math.random() * 0.5 - 0.25 - fireball.dy * 0.02;
                particle.radius *= 0.95;
                particle.ttl--;
                this.advance();
            },
            render() {
                const particle = this;
                context.save();
                context.translate(Math.round(screenWidth / 2 - player.x), Math.round(screenHeight / 2 - player.y - objSize * 3));
                context.beginPath();
                context.arc(
                    0,
                    0,
                    particle.radius,
                    0,
                    Math.PI * 2,
                    false
                );
                context.fillStyle = particle.color;
                context.fill();
                context.restore();
            }
        });
    }
});

const deathbook = Sprite({
    x: 0,
    y: 0,
    width: objSize,
    height: objSize,
    type: 'skill',
    anchor: { x: 0.5, y: 0.5 },
    ratio: 0,
    maxCount: 3,
    cd: 3,
    radius: objSize * 2.5,
    angle: Math.PI * 3 / 2,
    targetArr: [],
    active: false,
    timeCount: 0,
    count: 0,
    step: 0.05,
    endAngle: Math.PI * 7 / 2,
    init() {
        this.ratio = 100;
        this.angle = Math.PI * 3 / 2;
        this.endAngle = Math.PI * 7 / 2;
        this.step = 0.05;
        this.active = false;
        this.timeCount = 0;
        this.count = 0;
    },
    update(dt) {
        this.timeCount += dt;
        if (!this.active && this.timeCount > this.cd) {
            this.active = true;
            audioAssets['/audio/skill_book'].play();
            if (player.lastDx > 0) {
                this.endAngle = Math.PI * 7 / 2;
                this.step = 0.05;
            } else {
                this.endAngle = -Math.PI / 2;
                this.step = -0.05;
            }
        }
        if (this.count >= this.maxCount) {
            this.angle = Math.PI * 3 / 2;
            this.active = false;
            this.timeCount = 0;
            this.count = 0;
        }
        if (this.endAngle > 0) {
            if (this.angle > this.endAngle) {
                this.angle -= Math.PI * 2;
                this.count++;
                this.targetArr = [];
            }
        } else {
            if (this.angle < this.endAngle) {
                this.angle += Math.PI * 2;
                this.count++;
                this.targetArr = [];
            }
        }
        if (this.active) {
            this.angle += this.step;
            for (let enemy of quadtree.get(this)) {
                if (multiDamageDetection(this, enemy)) {
                    player.attack(enemy, this.ratio);
                    this.targetArr.push(enemy);
                }
            }
            this.x = player.x + Math.cos(this.angle) * this.radius;
            this.y = player.y + Math.sin(this.angle) * this.radius;
        }
    },
    render() {
        if (this.active) {
            drawBitmap(1, skill_book);
        }
    }
});

const lightsaber = kontra.Sprite({
    x: screenWidth / 2,
    y: screenHeight / 2 - objSize * 3,
    width: 10 * kw,
    height: 300 * kw,
    ratio: 0,
    preTime: 3,
    time: 1,
    cd: 6,
    angle: Math.PI,
    rotationSpeed: 0.1,
    radius: 0,
    maxRadius: 60 * kw,
    op: 1,
    fadeSpeed: 0.015,
    charge: false,
    active: false,
    timeCount: 0,
    playerDx: 1,
    particles: Pool({
        maxSize: 10,
        create: Sprite
    }),
    targetArr: [],
    init() {
        this.ratio = 300;
        this.timeCount = 0;
        this.active = false;
        this.angle = Math.PI;
        this.radius = 0;
        this.op = 1;
        this.targetArr = [];
    },
    update(dt) {
        this.timeCount += dt;
        this.particles.update();
        if (!this.active && this.timeCount > this.cd) {
            this.charge = true;
            audioAssets['/audio/skill_charge'].play();
            if (this.radius < this.maxRadius) {
                this.radius += 1 * kw;
            } else {
                audioAssets['/audio/skill_charge'].play();
                this.radius = 0;
                this.op = 1;
            }
            if (this.op > 0) {
                this.op -= this.fadeSpeed;
            }
        }
        if (!this.active && this.timeCount > this.cd + this.preTime) {
            player.stop = true;
            this.charge = false;
            this.active = true;
            audioAssets['/audio/skill_lightsaber1'].play();
            setTimeout(function () {
                audioAssets['/audio/skill_lightsaber2'].play();
            }, 1300);
        }
        if (this.timeCount > this.cd + this.preTime + this.time) {
            this.timeCount = 0;
            this.active = false;
            this.angle = Math.PI;
            this.radius = 0;
            this.op = 1;
            player.stop = false;
            this.targetArr = [];
        }
        if (this.active) {
            if (this.angle > Math.PI / 2 && this.angle < Math.PI * 3 / 2) {
                this.angle += this.rotationSpeed * (player.lastDx > 0 ? 1 : -1);
                const endX = player.x + Math.cos(this.angle + Math.PI / 2) * this.height;
                const endY = player.y + Math.sin(this.angle + Math.PI / 2) * this.height;
                for (let enemy of enemyPool.getAliveObjects()) {
                    if (!isExists(this.targetArr, enemy) && doesLineIntersectRect(player.x, player.y, endX, endY, enemy)) {
                        player.attack(enemy, this.ratio);
                        this.targetArr.push(enemy);
                    }
                }
                for (let background of backgroundArr) {
                    if (background.isAlive() && !isExists(this.targetArr, background) && doesLineIntersectRect(player.x, player.y, endX, endY, background)) {
                        player.attack(background, this.ratio);
                        this.targetArr.push(background);
                    }
                }
            }
        }
    },
    render() {
        if (this.charge) {
            // 绘制光圈
            context.beginPath();
            context.arc(0, 0, this.radius, 0, Math.PI * 2);
            context.fillStyle = `rgba(255, 255, 255, ${this.op})`;
            context.fill();
            this.particles.render();
        }
        if (this.charge || this.active) {
            // 绘制光剑
            context.save();
            context.translate(0, objSize / 2);
            context.rotate(this.angle);
            context.fillStyle = 'white';
            context.fillRect(-2 * this.width, objSize * 1.2, this.width * 4, this.width);
            context.fillRect(-this.width / 2, 0, this.width, this.height);
            context.restore();
            // 绘制闪电
            if (this.active) {
                const x = Math.cos(this.angle + Math.PI / 2) * Math.random() * this.height;
                const y = Math.sin(this.angle + Math.PI / 2) * Math.random() * this.height;
                this.createParticles(x, y);
            } else {
                this.createParticles(0, Math.random() * -this.height);
            }
            this.particles.render();
        }
    },
    createParticles(x, y) {
        this.particles.get({
            x: x,
            y: y,
            dx: Math.round((Math.random() * 2 - 1) * 100) / 100,
            dy: Math.round((Math.random() * 2 - 1) * 100) / 100,
            tx: (Math.random() - 0.5) * 180 * kw,
            ty: (Math.random() - 0.5) * 180 * kw,
            a: Math.random(),
            offsetX: Math.random() - 0.5,
            offsetY: Math.random() - 0.5,
            ttl: 5,
            update() {
                this.ttl -= 1;
                this.advance();
            },
            render() {
                this.drawLightning(0, 0, this.tx, this.ty, 2);
            },
            drawLightning(x1, y1, x2, y2, iterations) {
                if (iterations === 0) {
                    context.beginPath();
                    context.moveTo(x1, y1);
                    context.lineTo(x2, y2);
                    context.strokeStyle = `rgba(255, 255, 255, ${this.a})`;
                    context.lineWidth = kw;
                    context.stroke();
                    return;
                }
                const midX = (x1 + x2) / 2 + this.offsetX * (objSize * 1.2);
                const midY = (y1 + y2) / 2 + this.offsetY - 0.5 * (objSize * 1.2);
                this.drawLightning(x1, y1, midX, midY, iterations - 1);
                this.drawLightning(midX, midY, x2, y2, iterations - 1);
            },
        });
    }
});

const poisonsmoke = Sprite({
    x: 0,
    y: 0,
    width: objSize / 3,
    height: objSize / 3,
    type: 'skill',
    anchor: { x: 0.5, y: 0.5 },
    ratio: 0,
    flyTime: 3,
    time: 6,
    cd: 3,
    radius: objSize * 3,
    distance: objSize * 6,
    timeCount: 0,
    activeTimeCount: 0,
    count: 0,
    fly: false,
    active: false,
    particles: Pool({
        maxSize: 100,
        create: Sprite
    }),
    speed: 3 * kw,
    init() {
        this.ratio = 40;
        this.count = 0;
        this.timeCount = 0;
        this.activeTimeCount = 0;
        this.fly = false;
        this.active = false;
    },
    update(dt) {
        this.timeCount += dt;
        this.particles.update();

        if (!this.active && this.timeCount > this.cd + this.flyTime) {
            this.dx = 0;
            this.dy = 0;
            this.timeCount = 0;
            this.fly = false;
        }
        if (!this.fly && !this.active && this.timeCount > this.cd) {
            this.x = player.x;
            this.y = player.y;
            let target = null;
            // 搜索目标
            if (target == null) {
                let closestDistance = this.distance;
                for (let enemy of enemyPool.getAliveObjects()) {
                    let deltaX = enemy.x - player.x;
                    let deltaY = enemy.y - player.y;
                    let distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
                    if (distance < closestDistance) {
                        closestDistance = distance;
                        target = {
                            dx: deltaX,
                            dy: deltaY,
                            distance: distance
                        };
                    }
                }
                // 投掷
                if (target != null) {
                    let unitX = target.dx / target.distance;
                    let unitY = target.dy / target.distance;
                    this.dx = Math.round(unitX * this.speed);
                    this.dy = Math.round(unitY * this.speed);
                    this.fly = true;
                }
            }

        }
        if (this.fly) {
            for (let enemy of quadtree.get(this)) {
                if (damageDetection(this, enemy)) {
                    this.dx = 0;
                    this.dy = 0;
                    this.particles.clear();
                    this.fly = false;
                    this.active = true;
                    audioAssets['/audio/skill_poison'].play();
                    break;
                }
            }
        }
        if (this.active) {
            this.activeTimeCount += dt;
            if (this.count >= 6) {
                this.count = 0;
                this.timeCount = 0;
                this.activeTimeCount = 0;
                this.fly = false;
                this.active = false;
                return;
            }
            if (this.activeTimeCount >= 1) {
                this.count++;
                this.activeTimeCount = 0;
                // 伤害
                for (let enemy of enemyPool.getAliveObjects()) {
                    if (enemy != player && enemy.hp > 0) {
                        let deltaX = enemy.x - this.x;
                        let deltaY = enemy.y - this.y;
                        let distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
                        if (distance < this.radius) {
                            player.attack(enemy, this.ratio);
                        }
                    }
                }
            }
        }
        this.advance();
    },
    render() {
        if (this.fly) {
            context.save();
            context.translate(Math.round(screenWidth / 2 - player.x), Math.round(screenHeight / 2 - player.y - objSize * 3));
            context.fillStyle = 'white';
            context.fillRect(this.width / 4, 0, this.width / 2, this.height / 2);
            context.fillRect(0, this.height / 2, this.width, this.height / 2);
            context.restore();
        }
        if (this.active) {
            this.particles.get(this.createParticles());
            this.particles.render();
        }
    },
    createParticles() {
        this.particles.get({
            x: 0,
            y: 0,
            dx: (Math.random() - 0.5) * 1,
            dy: (Math.random() - 0.5) * 1,
            size: Math.random() * 5 + 5 * kw,
            growth: Math.random() * 0.05 + 0.01 * kw,
            op: 0.8,
            ttl: 60,
            update() {
                this.ttl--;
                this.x += this.dx;
                this.y += this.dy;
                this.size += this.growth;
                this.op -= 0.01;
                this.advance();
            },
            render() {
                context.save();
                context.translate(Math.round(screenWidth / 2 - player.x), Math.round(screenHeight / 2 - player.y - objSize * 3));
                context.beginPath();
                context.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                context.fillStyle = `rgba(255, 255, 255, ${this.op})`;
                context.fill();
                context.restore();
            }
        });
    }
});

const axe = Sprite({
    x: 0,
    y: 0,
    width: objSize,
    height: objSize,
    type: 'skill',
    ratio: 0,
    cd: 1,
    distance: objSize * 8,
    returnToPlayer: false,
    angle: 0,
    targetArr: [],
    active: false,
    timeCount: 0,
    startX: 0,
    startY: 0,
    speed: 2 * kw,
    init() {
        this.x = 0;
        this.y = 0;
        this.ratio = 90;
        this.angle = 0;
        this.active = false;
        this.timeCount = 0;
        this.startX = 0;
        this.startY = 0;
        this.targetArr = [];
        this.speed = 2 * kw;
        this.distance = objSize * 8;
        this.returnToPlayer = false;
    },
    update(dt) {
        this.timeCount += dt;
        if (!this.active && this.timeCount > this.cd) {
            this.active = true;
            this.x = player.x;
            this.y = player.y;
            this.startX = this.x;
            this.startY = this.y;
            this.dx = Math.cos(player.angle) * this.speed;
            this.dy = Math.sin(player.angle) * this.speed;
            audioAssets['/audio/skill_axe'].play();
        }
        if (this.active) {
            this.angle -= 15;
            for (let enemy of quadtree.get(this)) {
                if (multiDamageDetection(this, enemy)) {
                    player.attack(enemy, this.ratio);
                    this.targetArr.push(enemy);
                }
            }
            if (!this.returnToPlayer) {
                this.x += this.dx;
                this.y += this.dy;
                // 检查飞行距离是否达到最大
                if (Math.hypot(this.x - this.startX, this.y - this.startY) >= this.distance) {
                    this.returnToPlayer = true;
                    this.targetArr = [];
                }
            } else {
                // 回旋镖开始返回玩家
                let angleToPlayer = Math.atan2(player.y - this.y, player.x - this.x);
                this.dx = Math.cos(angleToPlayer) * this.speed;
                this.dy = Math.sin(angleToPlayer) * this.speed;
                this.x += this.dx;
                this.y += this.dy;
                // 检查是否已接近玩家
                if (isColliding(this, player)) {
                    this.angle = 0;
                    this.active = false;
                    this.timeCount = 0;
                    this.returnToPlayer = false;
                    this.targetArr = [];
                }
            }
            this.advance();
        }
    },
    render() {
        if (this.active) {
            context.save();
            context.translate(Math.round(screenWidth / 2 - player.x), Math.round(screenHeight / 2 - player.y - objSize * 3));
            context.rotate(this.angle * Math.PI / 180);
            context.fillStyle = 'white';
            context.fillRect(0, -20 * kw, 5 * kw, 40 * kw);
            context.beginPath();
            context.moveTo(10 * kw, -10 * kw);
            context.lineTo(-10 * kw, -20 * kw);
            context.lineTo(-10 * kw, 0);
            context.closePath();
            context.fill();
            context.restore();
        }
    }
});

const lance = Sprite({
    x: 0,
    y: 0,
    width: 150 * kw,
    height: 4 * kw,
    type: 'skill',
    anchor: { x: 0.5, y: 0.5 },
    ratio: 0,
    cd: 1,
    time: 1,
    targetArr: [],
    active: false,
    timeCount: 0,
    playerLastDx: 0,
    particles: Pool({
        maxSize: 20,
        create: Sprite
    }),
    init() {
        this.x = 0;
        this.y = 0;
        this.ratio = 90;
        this.active = false;
        this.timeCount = 0;
        this.targetArr = [];
    },
    update(dt) {
        this.timeCount += dt;
        if (!this.active && this.timeCount > this.cd) {
            this.active = true;
            this.playerLastDx = player.lastDx > 0 ? 10 : -10;
            audioAssets['/audio/skill_lance'].play();
        }
        if (this.active) {
            if (this.playerLastDx > 0) {
                this.playerLastDx += this.playerLastDx < 60 ? 10 : 0;
            } else {
                this.playerLastDx -= this.playerLastDx > -60 ? 10 : 0;
            }
            this.x = player.x + this.playerLastDx * kw;
            this.y = player.y + this.height / 2;

            for (let enemy of quadtree.get(this)) {
                if (multiDamageDetection(this, enemy)) {
                    player.attack(enemy, this.ratio);
                    this.targetArr.push(enemy);
                }
            }
            if (this.timeCount > this.cd + this.time) {
                this.active = false;
                this.timeCount = 0;
                this.targetArr = [];
            }
            this.advance();
            this.particles.update();
        }
    },
    render() {
        if (this.active) {
            context.save();
            context.translate(Math.round(screenWidth / 2 - player.x), Math.round(screenHeight / 2 - player.y - objSize * 3));
            context.fillStyle = 'white';
            if (this.playerLastDx > 0) {
                context.fillRect(0, 0, this.width - 10 * kw, this.height);
                context.beginPath();
                context.moveTo(this.width - 20 * kw, -this.height / 2);
                context.lineTo(this.width, this.height / 2);
                context.lineTo(this.width - 20 * kw, this.height + this.height / 2);
                context.closePath();
                context.fill();
            } else {
                context.fillRect(10 * kw, 0, this.width - 10 * kw, this.height);
                context.beginPath();
                context.moveTo(20 * kw, -this.height / 2);
                context.lineTo(0, this.height / 2);
                context.lineTo(20 * kw, this.height + this.height / 2);
                context.closePath();
                context.fill();
            }
            context.restore();
        }
        this.particles.render();
    }
});

skillArr.push(lightning);
skillArr.push(fireball);
skillArr.push(deathbook);
skillArr.push(lightsaber);
skillArr.push(poisonsmoke);
skillArr.push(axe);
skillArr.push(lance);

function initSkill() {
    for (let skill of skillArr) {
        skill.init();
    }
}
initSkill();

// setInterval(function () {
//     console.log(fireball.particles.getAliveObjects().length);
// }, 1000);