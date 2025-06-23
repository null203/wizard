"use strict";

function _createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t["return"] || t["return"](); } finally { if (u) throw o; } } }; }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function createBackground() {
  var points = generatePoints();
  var _iterator = _createForOfIteratorHelper(points),
    _step;
  try {
    var _loop = function _loop() {
      var point = _step.value;
      if (!isColliding(player, point) && point.x + objSize < worldLimit && point.y + objSize < worldLimit) {
        var direction = weightedRandom({
          1: 0.2,
          2: 0.2,
          3: 2,
          4: 2,
          5: 8,
          6: 8
        });
        var hp = 0;
        var maxHp = 0;
        var def = 0;
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
          anchor: {
            x: 0.5,
            y: 0.5
          },
          type: 'background',
          direction: direction,
          frameCount: 0,
          isAlive: function isAlive() {
            return this.hp > 0 && this.ttl > 60;
          },
          ttl: Infinity,
          update: function update() {
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
              scoreboard["break"]++;
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
          render: function render() {
            if (this.ttl > 60) {
              drawBitmap(this.direction, background);
            } else if (this.ttl > 0) {
              drawBitmap(Math.ceil(this.ttl / 15), boom);
            }
          }
        }));
      }
    };
    for (_iterator.s(); !(_step = _iterator.n()).done;) {
      _loop();
    }
  } catch (err) {
    _iterator.e(err);
  } finally {
    _iterator.f();
  }
}
function createEnemy(data) {
  var angle = Math.random() * 2 * Math.PI;
  var x = Math.round(player.x + screenHeight * 0.8 * Math.cos(angle));
  var y = Math.round(player.y + screenHeight * 0.8 * Math.sin(angle));
  var speed = enemyPool.getAliveObjects().length >= enemyPool.maxSize / 2 && randInt(1, 100) <= 20 ? 2 : 1;
  return enemyPool.get({
    hp: data.hp,
    atk: data.atk,
    def: data.def,
    exp: data.exp,
    x: x,
    y: y,
    width: objSize * (data.size ? data.size / pixelSize : 1),
    height: objSize * (data.size ? data.size / pixelSize : 1),
    anchor: {
      x: 0.5,
      y: 0.5
    },
    type: data.isBoss ? 'boss' : 'enemy',
    direction: LEFT,
    speed: (data.speed ? data.speed : speed) * kw,
    frameCount: 0,
    timeCount: 0,
    ttl: Infinity,
    isDead: false,
    attack: function attack() {
      var damage = Math.floor(this.atk - player.def);
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
    isAlive: function isAlive() {
      return this.ttl > 0;
    },
    update: function update(dt) {
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
          var dx = Math.abs(player.x - this.x) / objSize | 0;
          var dy = Math.abs(player.y - this.y) / objSize | 0;
          if (Math.max(dx, dy) < enemyAttackRangeTiles) {
            this.attack();
          }
        }
        this.timeCount = 0;
      }
      var acrossFlag = false;
      var _iterator2 = _createForOfIteratorHelper(quadtree.get(this)),
        _step2;
      try {
        for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
          var otherEnemy = _step2.value;
          if (otherEnemy != player && otherEnemy.isAlive() && isColliding(this, otherEnemy) && otherEnemy.type != 'skill') {
            var _deltaX = this.x - otherEnemy.x;
            var _deltaY = this.y - otherEnemy.y;
            var _distance = Math.sqrt(_deltaX * _deltaX + _deltaY * _deltaY);
            if (_distance > 0 && _distance < minDistance) {
              if (otherEnemy.type == 'background') {
                acrossFlag = true;
                break;
              } else {
                var _unitX2 = _deltaX / _distance;
                var _unitY2 = _deltaY / _distance;
                var offset = pixelSize * 0.5;
                this.x += Math.round(_unitX2 * offset);
                this.y += Math.round(_unitY2 * offset);
              }
            }
          }
        }
      } catch (err) {
        _iterator2.e(err);
      } finally {
        _iterator2.f();
      }
      if (this.frameCount % 30 === 0) {
        // 计算敌人到玩家的方向向量
        var deltaX = player.x - this.x;
        var deltaY = player.y - this.y;
        var distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        if (distance < approachDistance) {
          // 计算目标方向
          var _angle = Math.atan2(deltaY, deltaX);
          // 计算包围的目标点（可以稍微偏移玩家的位置）
          var targetX = player.x + Math.cos(_angle + Math.PI / 2) * 30; // 目标点向右偏移
          var targetY = player.y + Math.sin(_angle + Math.PI / 2) * 30; // 目标点向下偏移
          // 更新敌人位置
          var targetDeltaX = targetX - this.x;
          var targetDeltaY = targetY - this.y;
          var targetDistance = Math.sqrt(targetDeltaX * targetDeltaX + targetDeltaY * targetDeltaY);
          if (targetDistance > minDistance) {
            var unitX = targetDeltaX / targetDistance;
            var unitY = targetDeltaY / targetDistance;
            this.dx = Math.round(unitX * this.speed);
            this.dy = Math.round(unitY * this.speed);
          } else {
            this.dx = 0;
            this.dy = 0;
          }
        } else {
          // 更新敌人的速度和方向，使其朝向玩家移动
          if (distance > minDistance) {
            var _unitX = deltaX / distance;
            var _unitY = deltaY / distance;
            this.dx = Math.round(_unitX * this.speed);
            this.dy = Math.round(_unitY * this.speed);
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
    render: function render() {
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
    var _iterator3 = _createForOfIteratorHelper(itemPool.getAliveObjects()),
      _step3;
    try {
      for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
        var item = _step3.value;
        if (!isVisible(item)) {
          item.ttl = 0;
          itemPool.update();
          break;
        }
      }
    } catch (err) {
      _iterator3.e(err);
    } finally {
      _iterator3.f();
    }
  }
  itemPool.get({
    x: x,
    y: y,
    width: objSize,
    height: objSize,
    anchor: {
      x: 0.5,
      y: 0.5
    },
    type: 'item',
    direction: LEFT,
    progress: 0,
    fly: false,
    ttl: 1800,
    effect: function effect() {
      if (mat == exp_ball) {
        player.addExp(v);
      } else if (mat == heart) {
        player.addHp(v);
      }
    },
    update: function update() {
      if (this.ttl > 0) {
        this.ttl--;
      }
      if (this.fly) {
        var controlPoint1 = {
          x: x + (player.x - x) * 0.3,
          y: y - 50 * kw
        };
        var controlPoint2 = {
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
        var deltaX = player.x - this.x;
        var deltaY = player.y - this.y;
        var distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        if (distance < player.pickupDistance) {
          this.fly = true;
        }
      }
    },
    render: function render() {
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
    update: function update() {
      if (this.ttl > 0) {
        this.ttl--;
        this.dy = -0.5;
      }
      this.advance();
    },
    render: function render() {
      if (isVisible(this)) {
        context.save();
        context.translate(Math.round(screenWidth / 2 - player.x), Math.round(screenHeight / 2 - player.y - objSize * 3));
        context.fillStyle = 'white';
        context.font = "".concat(Math.floor(13 * kw * crit), "px ").concat(fontFamily);
        context.fillText(damage, -objSize * 3 / 5, -objSize / 2);
        context.restore();
      }
    }
  });
}
function showMsg(x, y, msg) {
  var ttl = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 120;
  msgPool.get({
    x: x,
    y: y,
    ttl: ttl,
    update: function update() {
      if (this.ttl > 0) {
        this.ttl--;
        this.dy = -1;
      }
      this.advance();
    },
    render: function render() {
      if (isVisible(this)) {
        context.save();
        context.translate(Math.round(screenWidth / 2 - player.x + objSize / 2), Math.round(screenHeight / 2 - player.y + objSize / 2 - objSize * 3));
        context.fillStyle = 'white';
        context.font = "".concat(Math.floor(19 * kw), "px ").concat(fontFamily);
        context.textAlign = 'center';
        context.fillText(msg, 0, 0);
        context.restore();
      }
    }
  });
}
var expBar = Sprite({
  x: 0,
  y: 0,
  width: screenWidth,
  height: objSize * 2 / 3,
  render: function render() {
    context.fillStyle = 'black';
    context.fillRect(0, 0, this.width, this.height);
    var expBarWidth = player.exp / player.maxExp * screenWidth;
    context.fillStyle = 'gray';
    context.fillRect(0, 0, expBarWidth, this.height);
    var fontSize = Math.floor(17 * kw);
    context.fillStyle = 'white';
    context.font = "".concat(fontSize, "px ").concat(fontFamily);
    context.textAlign = 'center';
    context.fillText("LV ".concat(player.lv), this.width / 2, this.height - 2 * kw);
  }
});
var statusBar = Sprite({
  x: 0,
  y: expBar.height,
  m: 0,
  s: 0,
  time: '00:00',
  init: function init() {
    this.m = 0;
    this.s = 0;
    this.time = '00:00';
  },
  update: function update() {
    this.s++;
    if (this.s == 60) {
      this.m++;
      this.s = 0;
    }
    this.time = displayNumber(this.m) + ':' + displayNumber(this.s);
  },
  render: function render() {
    var hpBarWidth = Math.round(player.hp / player.maxHp * 10);
    context.fillStyle = 'white';
    context.font = "".concat(Math.floor(16 * kw), "px ").concat(fontFamily);
    context.fillText('HP ', objSize / 2, objSize / 2);
    for (var i = 1; i <= hpBarWidth; i++) {
      var x = i * pixelSize * 4.5 + objSize;
      context.fillRect(x, objSize / 2 - 10 * kw, pixelSize * 3, pixelSize * 5);
    }
    context.textAlign = 'center';
    context.font = "".concat(Math.floor(19 * kw), "px ").concat(fontFamily);
    context.fillText("".concat(this.time), screenWidth / 2, objSize);
  }
});
var menu = Button({
  x: screenWidth - objSize - pixelSize * 5,
  y: objSize / 2 + pixelSize * 5,
  width: objSize,
  height: objSize,
  onUp: function onUp() {
    openDialog(mainDialog);
  },
  onOut: function onOut() {
    this.pressed = false;
  },
  render: function render() {
    var color = this.pressed ? 'white' : 'gray';
    for (var y = 0; y < bitmapHeight; y++) {
      var row = menu_book[y];
      for (var x = 0; x < bitmapWidth; x++) {
        var isPixelOn = row >> bitmapWidth - 1 - x & 1;
        context.fillStyle = isPixelOn ? color : 'black';
        context.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
      }
    }
  }
});
var worldBoundary = Sprite({
  x: 0,
  y: 0,
  width: worldLimit,
  height: worldLimit,
  render: function render() {
    context.save();
    context.strokeStyle = 'white';
    context.lineWidth = 2 * kw;
    context.strokeRect(-viewport.x, -viewport.y, worldLimit, worldLimit);
    context.restore();
  }
});
var player = Sprite({
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
  anchor: {
    x: 0.5,
    y: 0.5
  },
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
  init: function init() {
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
  checkPoint: function checkPoint() {
    if (this.point > 0) {
      audioAssets['/audio/level_up'].play();
      showMsg(this.x, this.y, 'LEVEL UP');
      openDialog(levelUpDialog);
    }
  },
  addExp: function addExp(exp) {
    exp = Math.floor(exp * expRatio);
    if (this.lv < maxExp.length) {
      var tempExp = exp;
      while (tempExp > 0) {
        this.exp += tempExp;
        if (this.exp >= this.maxExp) {
          this.lv++;
          tempExp = this.exp - this.maxExp;
          this.exp = 0;
          this.maxExp = maxExp[this.lv - 1];
          this.point++;
          if (this.lv == 5) {
            putItemCard();
          }
        } else {
          return;
        }
      }
    }
  },
  addHp: function addHp(hp) {
    this.hp += hp;
    if (this.hp > this.maxHp) {
      this.hp = this.maxHp;
    }
    showDamage(this.x, this.y, '+' + hp, 1);
  },
  isAlive: function isAlive() {
    return this.hp > 0;
  },
  attack: function attack(enemy, ratio) {
    var critFlg = this.crit > randInt(1, 100) ? 2 : 1;
    var damage = Math.floor((this.atk - enemy.def) * (ratio / 100)) * critFlg;
    if (damage < 1) {
      damage = 1;
    }
    enemy.hp = enemy.hp - damage;
    showDamage(enemy.x, enemy.y, damage, critFlg);
    scoreboard.damage += damage;
  },
  update: function update() {
    if (!this.isAlive()) {
      openDialog(gameOverDialog);
    }
    if (this.stop) {
      return;
    }
    var _iterator4 = _createForOfIteratorHelper(quadtree.get(this)),
      _step4;
    try {
      for (_iterator4.s(); !(_step4 = _iterator4.n()).done;) {
        var obj = _step4.value;
        if (obj.type == 'background' && obj.isAlive() && isColliding(this, obj)) {
          var deltaX = this.x - obj.x;
          var deltaY = this.y - obj.y;
          var distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
          if (distance > 0) {
            var unitX = deltaX / distance;
            var unitY = deltaY / distance;
            var offset = pixelSize;
            this.x += Math.round(unitX * offset);
            this.y += Math.round(unitY * offset);
            break;
          }
        }
      }
    } catch (err) {
      _iterator4.e(err);
    } finally {
      _iterator4.f();
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
  render: function render() {
    drawBitmap(this.direction, wizard);
  }
});
var loop = GameLoop({
  update: function update(dt) {
    var _iterator5 = _createForOfIteratorHelper(dialogArr),
      _step5;
    try {
      for (_iterator5.s(); !(_step5 = _iterator5.n()).done;) {
        var dialog = _step5.value;
        dialog.update(dt);
      }
    } catch (err) {
      _iterator5.e(err);
    } finally {
      _iterator5.f();
    }
    if (paused) return;
    updateViewport(player);
    quadtree.clear();
    quadtree.add(player, enemyPool.getAliveObjects(), backgroundArr, fireball, deathbook, poisonsmoke, axe, lance);
    player.update(dt);
    enemyPool.update(dt);
    itemPool.update(dt);
    msgPool.update(dt);
    var _iterator6 = _createForOfIteratorHelper(player.skill),
      _step6;
    try {
      for (_iterator6.s(); !(_step6 = _iterator6.n()).done;) {
        var skill = _step6.value;
        skill.update(dt);
      }
    } catch (err) {
      _iterator6.e(err);
    } finally {
      _iterator6.f();
    }
    var _iterator7 = _createForOfIteratorHelper(backgroundArr),
      _step7;
    try {
      for (_iterator7.s(); !(_step7 = _iterator7.n()).done;) {
        var _background = _step7.value;
        _background.update();
      }
    } catch (err) {
      _iterator7.e(err);
    } finally {
      _iterator7.f();
    }
    expBar.update(dt);
    menu.update(dt);
  },
  render: function render() {
    player.render();
    enemyPool.render();
    var _iterator8 = _createForOfIteratorHelper(backgroundArr),
      _step8;
    try {
      for (_iterator8.s(); !(_step8 = _iterator8.n()).done;) {
        var _background2 = _step8.value;
        if (isVisible(_background2)) {
          _background2.render();
        }
      }
    } catch (err) {
      _iterator8.e(err);
    } finally {
      _iterator8.f();
    }
    itemPool.render();
    msgPool.render();
    worldBoundary.render();
    expBar.render();
    statusBar.render();
    menu.render();
    drawJoystick();
    var _iterator9 = _createForOfIteratorHelper(player.skill),
      _step9;
    try {
      for (_iterator9.s(); !(_step9 = _iterator9.n()).done;) {
        var skill = _step9.value;
        skill.render();
      }
    } catch (err) {
      _iterator9.e(err);
    } finally {
      _iterator9.f();
    }
    var _iterator10 = _createForOfIteratorHelper(dialogArr),
      _step10;
    try {
      for (_iterator10.s(); !(_step10 = _iterator10.n()).done;) {
        var dialog = _step10.value;
        if (dialog.show) {
          dialog.render();
          break;
        }
      }
    } catch (err) {
      _iterator10.e(err);
    } finally {
      _iterator10.f();
    }
  }
});
function createBoss(boss) {
  var flag = !createEnemy(boss);
  if (flag) {
    var _iterator11 = _createForOfIteratorHelper(enemyPool.getAliveObjects()),
      _step11;
    try {
      for (_iterator11.s(); !(_step11 = _iterator11.n()).done;) {
        var enemy = _step11.value;
        if (!isVisible(enemy)) {
          enemy.ttl = 0;
          return !createEnemy(boss);
        }
      }
    } catch (err) {
      _iterator11.e(err);
    } finally {
      _iterator11.f();
    }
  }
  return flag;
}
function wave() {
  for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }
  for (var i = 0; i < enemyCount; i++) {
    var _iterator12 = _createForOfIteratorHelper(args),
      _step12;
    try {
      for (_iterator12.s(); !(_step12 = _iterator12.n()).done;) {
        var data = _step12.value;
        createEnemy(data);
      }
    } catch (err) {
      _iterator12.e(err);
    } finally {
      _iterator12.f();
    }
  }
}
function respawnEnemy() {
  if (enemyPool.getAliveObjects().length == enemyPool.maxSize) {
    var _iterator13 = _createForOfIteratorHelper(enemyPool.getAliveObjects()),
      _step13;
    try {
      for (_iterator13.s(); !(_step13 = _iterator13.n()).done;) {
        var enemy = _step13.value;
        if (!isVisible(enemy) && enemy.type != 'boss') {
          var distance = Math.sqrt(Math.pow(enemy.x - player.x, 2) + Math.pow(enemy.y - player.y, 2));
          if (distance > screenHeight * 0.8) {
            enemy.ttl = 0;
            enemy.update();
          }
        }
      }
    } catch (err) {
      _iterator13.e(err);
    } finally {
      _iterator13.f();
    }
  }
}
var boss_skeleton_flag = true;
var boss_crab_flag = true;
var boss_tauren_flag = true;
var no_skill_flag = true;
var low_hp_time = 0;
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
  if (no_skill_flag && player.skill.length > 1) {
    var _iterator14 = _createForOfIteratorHelper(cardArr),
      _step14;
    try {
      for (_iterator14.s(); !(_step14 = _iterator14.n()).done;) {
        var card = _step14.value;
        if (card.type == CARD_TYPE_WEAPON) {
          card.weight -= 0.5;
        }
      }
    } catch (err) {
      _iterator14.e(err);
    } finally {
      _iterator14.f();
    }
    no_skill_flag = false;
  }
  if (statusBar.m < 3) {
    wave(slime, skeleton);
  } else if (boss_skeleton_flag) {
    boss_skeleton_flag = createBoss(boss_skeleton);
  } else if (statusBar.m < 6) {
    wave(spider, snake);
  } else if (boss_crab_flag) {
    boss_crab_flag = createBoss(boss_crab);
  } else if (statusBar.m < 9) {
    wave(mummy, orc);
  } else if (boss_tauren_flag) {
    boss_tauren_flag = createBoss(boss_tauren);
  } else if (statusBar.m < 12) {
    wave(devil, fox);
  } else if (statusBar.m < 15) {
    wave(reaper, reaper);
  }
}
load('/audio/attack_slime.mp3', '/audio/attack_sword.mp3', '/audio/attack_bite.mp3', '/audio/attack_blunt.mp3', '/audio/attack_fork.mp3', '/audio/attack_scythe.mp3', '/audio/attack_spider.mp3', '/audio/attack_big_sword.mp3', '/audio/skill_lightning.mp3', '/audio/skill_fireball.mp3', '/audio/skill_book.mp3', '/audio/skill_charge.mp3', '/audio/skill_lightsaber1.mp3', '/audio/skill_lightsaber2.mp3', '/audio/skill_poison.mp3', '/audio/skill_axe.mp3', '/audio/skill_lance.mp3', '/audio/level_up.mp3').then(function () {
  document.fonts.load("12px ".concat(fontFamily)).then(function () {
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