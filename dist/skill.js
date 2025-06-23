"use strict";

function _createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t["return"] || t["return"](); } finally { if (u) throw o; } } }; }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function damageDetection(obj, enemy) {
  return enemy != player && enemy.hp > 0 && enemy.ttl > 60 && isColliding(obj, enemy);
}
function multiDamageDetection(obj, enemy) {
  return damageDetection(obj, enemy) && !isExists(obj.targetArr, enemy);
}
var lightning = Sprite({
  x: 0,
  y: 0,
  ratio: 0,
  time: 1,
  cd: 2,
  radius: objSize * 6,
  timeCount: 0,
  frameCount: 0,
  target: null,
  init: function init() {
    this.ratio = 360;
    this.timeCount = 0;
    this.target = null;
  },
  update: function update(dt) {
    this.frameCount++;
    this.timeCount += dt;
    if (this.timeCount > this.cd + this.time) {
      this.timeCount = 0;
      this.target = null;
    }
    if (this.timeCount > this.cd) {
      // 搜索目标
      if (this.target == null) {
        var closestDistance = this.radius;
        var _iterator = _createForOfIteratorHelper(enemyPool.getAliveObjects()),
          _step;
        try {
          for (_iterator.s(); !(_step = _iterator.n()).done;) {
            var enemy = _step.value;
            var distance = Math.sqrt(Math.pow(enemy.x - player.x, 2) + Math.pow(enemy.y - player.y, 2));
            if (distance < closestDistance) {
              closestDistance = distance;
              this.target = enemy;
            }
          }
          // 发动攻击
        } catch (err) {
          _iterator.e(err);
        } finally {
          _iterator.f();
        }
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
  render: function render() {
    if (this.target != null) {
      var distance = Math.sqrt(Math.pow(this.target.x - player.x, 2) + Math.pow(this.target.y - player.y, 2));
      if (distance < this.radius * 1.2) {
        var i = Math.round(distance / (objSize * 2));
        if (i < 2) i = 2;
        if (i > 4) i = 4;
        this.drawLightning(player.x, player.y, this.target.x, this.target.y, i);
      }
    }
  },
  drawLightning: function drawLightning(x1, y1, x2, y2, iterations) {
    if (iterations === 0) {
      context.save();
      context.translate(Math.round(screenWidth / 2 - player.x), Math.round(screenHeight / 2 - player.y - objSize * 3));
      context.beginPath();
      context.moveTo(x1, y1);
      context.lineTo(x2, y2);
      context.strokeStyle = "rgba(255, 255, 255, ".concat(Math.random(), ")"); // 随机透明度模拟闪烁效果
      context.lineWidth = 2 * kw;
      context.stroke();
      context.restore();
      return;
    }
    // 计算中点，并随机偏移
    var midX = (x1 + x2) / 2 + (Math.random() - 0.5) * (objSize * 1.2);
    var midY = (y1 + y2) / 2 + (Math.random() - 0.5) * (objSize * 1.2);
    // 递归绘制左右两半段
    this.drawLightning(x1, y1, midX, midY, iterations - 1);
    this.drawLightning(midX, midY, x2, y2, iterations - 1);
  }
});
var fireball = Sprite({
  x: 0,
  y: 0,
  width: 12 * kw,
  height: 12 * kw,
  type: 'skill',
  anchor: {
    x: 0.5,
    y: 0.5
  },
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
  init: function init() {
    this.ratio = 240;
    this.timeCount = 0;
    this.dx = 0;
    this.dy = 0;
    this.active = false;
  },
  update: function update(dt) {
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
      var _iterator2 = _createForOfIteratorHelper(quadtree.get(this)),
        _step2;
      try {
        for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
          var enemy = _step2.value;
          if (multiDamageDetection(this, enemy)) {
            player.attack(enemy, this.ratio);
            this.targetArr.push(enemy);
          }
        }
      } catch (err) {
        _iterator2.e(err);
      } finally {
        _iterator2.f();
      }
    }
    this.advance(dt);
  },
  render: function render() {
    if (this.active) {
      this.particles.render();
    }
  },
  createParticles: function createParticles() {
    this.particles.get({
      x: 0,
      y: 0,
      anchor: {
        x: 0.5,
        y: 0.5
      },
      radius: (Math.random() * (fireball.width / 2 - 2) + 2) * kw,
      color: "rgba(255, 255, 255, ".concat(Math.random() * 0.5 + 0.5, ")"),
      ttl: 60,
      update: function update() {
        var particle = this;
        particle.dx = Math.random() * 0.5 - 0.25 - fireball.dx * 0.02;
        particle.dy = Math.random() * 0.5 - 0.25 - fireball.dy * 0.02;
        particle.radius *= 0.95;
        particle.ttl--;
        this.advance();
      },
      render: function render() {
        var particle = this;
        context.save();
        context.translate(Math.round(screenWidth / 2 - player.x), Math.round(screenHeight / 2 - player.y - objSize * 3));
        context.beginPath();
        context.arc(0, 0, particle.radius, 0, Math.PI * 2, false);
        context.fillStyle = particle.color;
        context.fill();
        context.restore();
      }
    });
  }
});
var deathbook = Sprite({
  x: 0,
  y: 0,
  width: objSize,
  height: objSize,
  type: 'skill',
  anchor: {
    x: 0.5,
    y: 0.5
  },
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
  init: function init() {
    this.ratio = 100;
    this.angle = Math.PI * 3 / 2;
    this.endAngle = Math.PI * 7 / 2;
    this.step = 0.05;
    this.active = false;
    this.timeCount = 0;
    this.count = 0;
  },
  update: function update(dt) {
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
      var _iterator3 = _createForOfIteratorHelper(quadtree.get(this)),
        _step3;
      try {
        for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
          var enemy = _step3.value;
          if (multiDamageDetection(this, enemy)) {
            player.attack(enemy, this.ratio);
            this.targetArr.push(enemy);
          }
        }
      } catch (err) {
        _iterator3.e(err);
      } finally {
        _iterator3.f();
      }
      this.x = player.x + Math.cos(this.angle) * this.radius;
      this.y = player.y + Math.sin(this.angle) * this.radius;
    }
  },
  render: function render() {
    if (this.active) {
      drawBitmap(1, skill_book);
    }
  }
});
var lightsaber = kontra.Sprite({
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
  init: function init() {
    this.ratio = 300;
    this.timeCount = 0;
    this.active = false;
    this.angle = Math.PI;
    this.radius = 0;
    this.op = 1;
    this.targetArr = [];
  },
  update: function update(dt) {
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
        var endX = player.x + Math.cos(this.angle + Math.PI / 2) * this.height;
        var endY = player.y + Math.sin(this.angle + Math.PI / 2) * this.height;
        var _iterator4 = _createForOfIteratorHelper(enemyPool.getAliveObjects()),
          _step4;
        try {
          for (_iterator4.s(); !(_step4 = _iterator4.n()).done;) {
            var enemy = _step4.value;
            if (!isExists(this.targetArr, enemy) && doesLineIntersectRect(player.x, player.y, endX, endY, enemy)) {
              player.attack(enemy, this.ratio);
              this.targetArr.push(enemy);
            }
          }
        } catch (err) {
          _iterator4.e(err);
        } finally {
          _iterator4.f();
        }
        var _iterator5 = _createForOfIteratorHelper(backgroundArr),
          _step5;
        try {
          for (_iterator5.s(); !(_step5 = _iterator5.n()).done;) {
            var background = _step5.value;
            if (background.isAlive() && !isExists(this.targetArr, background) && doesLineIntersectRect(player.x, player.y, endX, endY, background)) {
              player.attack(background, this.ratio);
              this.targetArr.push(background);
            }
          }
        } catch (err) {
          _iterator5.e(err);
        } finally {
          _iterator5.f();
        }
      }
    }
  },
  render: function render() {
    if (this.charge) {
      // 绘制光圈
      context.beginPath();
      context.arc(0, 0, this.radius, 0, Math.PI * 2);
      context.fillStyle = "rgba(255, 255, 255, ".concat(this.op, ")");
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
        var x = Math.cos(this.angle + Math.PI / 2) * Math.random() * this.height;
        var y = Math.sin(this.angle + Math.PI / 2) * Math.random() * this.height;
        this.createParticles(x, y);
      } else {
        this.createParticles(0, Math.random() * -this.height);
      }
      this.particles.render();
    }
  },
  createParticles: function createParticles(x, y) {
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
      update: function update() {
        this.ttl -= 1;
        this.advance();
      },
      render: function render() {
        this.drawLightning(0, 0, this.tx, this.ty, 2);
      },
      drawLightning: function drawLightning(x1, y1, x2, y2, iterations) {
        if (iterations === 0) {
          context.beginPath();
          context.moveTo(x1, y1);
          context.lineTo(x2, y2);
          context.strokeStyle = "rgba(255, 255, 255, ".concat(this.a, ")");
          context.lineWidth = kw;
          context.stroke();
          return;
        }
        var midX = (x1 + x2) / 2 + this.offsetX * (objSize * 1.2);
        var midY = (y1 + y2) / 2 + this.offsetY - 0.5 * (objSize * 1.2);
        this.drawLightning(x1, y1, midX, midY, iterations - 1);
        this.drawLightning(midX, midY, x2, y2, iterations - 1);
      }
    });
  }
});
var poisonsmoke = Sprite({
  x: 0,
  y: 0,
  width: objSize / 3,
  height: objSize / 3,
  type: 'skill',
  anchor: {
    x: 0.5,
    y: 0.5
  },
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
  init: function init() {
    this.ratio = 40;
    this.count = 0;
    this.timeCount = 0;
    this.activeTimeCount = 0;
    this.fly = false;
    this.active = false;
  },
  update: function update(dt) {
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
      var target = null;
      // 搜索目标
      if (target == null) {
        var closestDistance = this.distance;
        var _iterator6 = _createForOfIteratorHelper(enemyPool.getAliveObjects()),
          _step6;
        try {
          for (_iterator6.s(); !(_step6 = _iterator6.n()).done;) {
            var enemy = _step6.value;
            var deltaX = enemy.x - player.x;
            var deltaY = enemy.y - player.y;
            var distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
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
        } catch (err) {
          _iterator6.e(err);
        } finally {
          _iterator6.f();
        }
        if (target != null) {
          var unitX = target.dx / target.distance;
          var unitY = target.dy / target.distance;
          this.dx = Math.round(unitX * this.speed);
          this.dy = Math.round(unitY * this.speed);
          this.fly = true;
        }
      }
    }
    if (this.fly) {
      var _iterator7 = _createForOfIteratorHelper(quadtree.get(this)),
        _step7;
      try {
        for (_iterator7.s(); !(_step7 = _iterator7.n()).done;) {
          var _enemy = _step7.value;
          if (damageDetection(this, _enemy)) {
            this.dx = 0;
            this.dy = 0;
            this.particles.clear();
            this.fly = false;
            this.active = true;
            audioAssets['/audio/skill_poison'].play();
            break;
          }
        }
      } catch (err) {
        _iterator7.e(err);
      } finally {
        _iterator7.f();
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
        var _iterator8 = _createForOfIteratorHelper(enemyPool.getAliveObjects()),
          _step8;
        try {
          for (_iterator8.s(); !(_step8 = _iterator8.n()).done;) {
            var _enemy2 = _step8.value;
            if (_enemy2 != player && _enemy2.hp > 0) {
              var _deltaX = _enemy2.x - this.x;
              var _deltaY = _enemy2.y - this.y;
              var _distance = Math.sqrt(_deltaX * _deltaX + _deltaY * _deltaY);
              if (_distance < this.radius) {
                player.attack(_enemy2, this.ratio);
              }
            }
          }
        } catch (err) {
          _iterator8.e(err);
        } finally {
          _iterator8.f();
        }
      }
    }
    this.advance();
  },
  render: function render() {
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
  createParticles: function createParticles() {
    this.particles.get({
      x: 0,
      y: 0,
      dx: (Math.random() - 0.5) * 1,
      dy: (Math.random() - 0.5) * 1,
      size: Math.random() * 5 + 5 * kw,
      growth: Math.random() * 0.05 + 0.01 * kw,
      op: 0.8,
      ttl: 60,
      update: function update() {
        this.ttl--;
        this.x += this.dx;
        this.y += this.dy;
        this.size += this.growth;
        this.op -= 0.01;
        this.advance();
      },
      render: function render() {
        context.save();
        context.translate(Math.round(screenWidth / 2 - player.x), Math.round(screenHeight / 2 - player.y - objSize * 3));
        context.beginPath();
        context.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        context.fillStyle = "rgba(255, 255, 255, ".concat(this.op, ")");
        context.fill();
        context.restore();
      }
    });
  }
});
var axe = Sprite({
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
  init: function init() {
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
  update: function update(dt) {
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
      var _iterator9 = _createForOfIteratorHelper(quadtree.get(this)),
        _step9;
      try {
        for (_iterator9.s(); !(_step9 = _iterator9.n()).done;) {
          var enemy = _step9.value;
          if (multiDamageDetection(this, enemy)) {
            player.attack(enemy, this.ratio);
            this.targetArr.push(enemy);
          }
        }
      } catch (err) {
        _iterator9.e(err);
      } finally {
        _iterator9.f();
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
        var angleToPlayer = Math.atan2(player.y - this.y, player.x - this.x);
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
  render: function render() {
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
var lance = Sprite({
  x: 0,
  y: 0,
  width: 150 * kw,
  height: 4 * kw,
  type: 'skill',
  anchor: {
    x: 0.5,
    y: 0.5
  },
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
  init: function init() {
    this.x = 0;
    this.y = 0;
    this.ratio = 90;
    this.active = false;
    this.timeCount = 0;
    this.targetArr = [];
  },
  update: function update(dt) {
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
      var _iterator10 = _createForOfIteratorHelper(quadtree.get(this)),
        _step10;
      try {
        for (_iterator10.s(); !(_step10 = _iterator10.n()).done;) {
          var enemy = _step10.value;
          if (multiDamageDetection(this, enemy)) {
            player.attack(enemy, this.ratio);
            this.targetArr.push(enemy);
          }
        }
      } catch (err) {
        _iterator10.e(err);
      } finally {
        _iterator10.f();
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
  render: function render() {
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
  var _iterator11 = _createForOfIteratorHelper(skillArr),
    _step11;
  try {
    for (_iterator11.s(); !(_step11 = _iterator11.n()).done;) {
      var skill = _step11.value;
      skill.init();
    }
  } catch (err) {
    _iterator11.e(err);
  } finally {
    _iterator11.f();
  }
}
initSkill();

// setInterval(function () {
//     console.log(fireball.particles.getAliveObjects().length);
// }, 1000);