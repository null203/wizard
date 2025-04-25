"use strict";

function _createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t["return"] || t["return"](); } finally { if (u) throw o; } } }; }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function openDialog(dialog) {
  if (!dialog.show) {
    paused = true;
    joystick.enable = false;
    joystick.frameCount = 300;
    track(dialog);
    dialog.open();
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
  }
}
function closeDialog(dialog) {
  if (dialog.show) {
    untrack(dialog);
    dialog.close();
    var flag = true;
    var _iterator = _createForOfIteratorHelper(dialogArr),
      _step;
    try {
      for (_iterator.s(); !(_step = _iterator.n()).done;) {
        var d = _step.value;
        if (d.show) {
          flag = false;
          break;
        }
      }
    } catch (err) {
      _iterator.e(err);
    } finally {
      _iterator.f();
    }
    if (flag) {
      paused = false;
      joystick.enable = true;
      intervalId = setInterval(intervalHandle, 1000);
    }
  }
}
function openSubDialog(parent, dialog) {
  parent.show = false;
  untrack(parent);
  track(dialog);
  dialog.open(parent);
}
function closeSubDialog(parent, dialog) {
  untrack(dialog);
  dialog.close();
  parent.show = true;
  track(parent);
}
function drawSubWindow(x, y, width, height) {
  context.fillStyle = 'black';
  context.fillRect(x, y, width, height);
  context.strokeStyle = 'white';
  context.lineWidth = 4 * kw;
  var padding = pixelSize * 4;
  context.strokeRect(x + padding, y + padding, width - padding * 2, height - padding * 2);
}
function _drawCloseBtn(x, y, size) {
  context.strokeStyle = 'white';
  context.lineWidth = 2 * kw;
  context.beginPath();
  context.moveTo(x, y);
  context.lineTo(x + size, y + size);
  context.stroke();
  context.beginPath();
  context.moveTo(x + size, y);
  context.lineTo(x, y + size);
  context.stroke();
}
function drawCard(_x, _y, card, selectedCard) {
  var size = pixelSize * 2;
  var color = 'white';
  if (selectedCard) {
    if (selectedCard == card) {
      color = 'white';
    } else {
      color = 'gray';
    }
  }
  card.x = _x;
  card.y = _y;
  if (card.lv == 0) {
    context.fillStyle = 'white';
    context.textAlign = 'center';
    var fontSize = Math.floor(13 * kw);
    context.font = "".concat(fontSize, "px Arial");
    context.fillText('NEW', _x + card.width / 2, _y - size);
  }
  for (var y = 0; y < bitmapHeight; y++) {
    var row = card.icon[y];
    for (var x = 0; x < bitmapWidth; x++) {
      var isPixelOn = row >> bitmapWidth - 1 - x & 1;
      context.fillStyle = isPixelOn ? color : 'black';
      context.fillRect(_x + x * size, _y + y * size, size, size);
    }
  }
}
var mainDialog = Sprite({
  x: 0,
  y: 0,
  width: screenWidth,
  height: screenHeight,
  show: false,
  msgArr: [],
  btnArr: [],
  selectedCard: null,
  addBtn: function addBtn(btn) {
    if (!this.btnArr.find(function (b) {
      return b.id === btn.id;
    })) {
      this.btnArr.push(btn);
    }
  },
  open: function open() {
    this.show = true;
    this.btnArr = [];
    this.selectedCard = null;
  },
  close: function close() {
    this.show = false;
  },
  onUp: function onUp() {
    var pointer = getPointer();
    var _iterator2 = _createForOfIteratorHelper(this.btnArr),
      _step2;
    try {
      for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
        var btn = _step2.value;
        if (isClickRect(pointer, btn)) {
          btn.onPressed();
        }
      }
    } catch (err) {
      _iterator2.e(err);
    } finally {
      _iterator2.f();
    }
  },
  update: function update() {
    this.msgArr = ["\u7B49\u7EA7: ".concat(player.lv), "\u7ECF\u9A8C\u503C: ".concat(player.exp, " / ").concat(player.maxExp), "\u751F\u547D\u503C: ".concat(player.hp, " / ").concat(player.maxHp), "\u653B\u51FB\u529B: ".concat(player.atk), "\u9632\u5FA1\u529B: ".concat(player.def), "\u66B4\u51FB\u7387: ".concat(player.crit, "%")];
  },
  render: function render() {
    var x = 0;
    var y = 0;
    drawSubWindow(x, y, this.width, this.height);
    var fontSize = Math.floor(16 * kw);
    context.fillStyle = 'white';
    context.font = "".concat(fontSize, "px Arial");
    context.lineWidth = 1;
    context.textAlign = 'left';
    x = Math.floor(screenWidth / 2 - objSize * 4);
    y += objSize / 2;
    var _iterator3 = _createForOfIteratorHelper(this.msgArr),
      _step3;
    try {
      for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
        var line = _step3.value;
        y += objSize;
        context.fillText(line, x, y);
      }
    } catch (err) {
      _iterator3.e(err);
    } finally {
      _iterator3.f();
    }
    y += objSize;
    this.drawCards(x, y);
    this.drawCloseBtn();
  },
  drawCards: function drawCards(x, y) {
    var _this = this;
    var colNum = 0;
    var rowNum = 0;
    var left = x;
    var top = y;
    var fontSize = Math.floor(16 * kw);
    context.fillStyle = 'white';
    context.font = "".concat(fontSize, "px Arial");
    context.lineWidth = 1;
    context.textAlign = 'center';
    var _iterator4 = _createForOfIteratorHelper(player.cards),
      _step4;
    try {
      var _loop = function _loop() {
        var card = _step4.value;
        x = left + objSize * 3 * colNum;
        y = top + objSize * 3 * rowNum;
        drawCard(x, y, card);
        context.fillText(card.name, x + objSize, y + objSize * 2.5);
        if (colNum < 2) {
          colNum++;
        } else {
          colNum = 0;
          rowNum++;
        }
        _this.addBtn({
          id: card.name,
          x: x,
          y: y,
          width: card.width,
          height: card.height,
          onPressed: function onPressed() {
            mainDialog.selectedCard = card;
            openSubDialog(mainDialog, cardDetailDialog);
          }
        });
      };
      for (_iterator4.s(); !(_step4 = _iterator4.n()).done;) {
        _loop();
      }
    } catch (err) {
      _iterator4.e(err);
    } finally {
      _iterator4.f();
    }
  },
  drawCloseBtn: function drawCloseBtn() {
    var startX = screenWidth - objSize - pixelSize * 10;
    var startY = objSize / 2 + pixelSize * 2;
    var size = objSize;
    this.addBtn({
      id: 'close',
      x: startX,
      y: startY,
      width: size,
      height: size,
      onPressed: function onPressed() {
        closeDialog(mainDialog);
      }
    });
    _drawCloseBtn(startX, startY, size);
  }
});
var levelUpDialog = Sprite({
  x: 0,
  y: 0,
  width: screenWidth,
  height: screenHeight,
  show: false,
  active: false,
  name: '',
  msgArr: '',
  cards: [],
  selectedCard: null,
  timeCount: 0,
  resetCount: 3,
  okBtn: {
    x: 0,
    y: 0,
    width: 0,
    height: 0
  },
  resetBtn: {
    x: 0,
    y: 0,
    width: 0,
    height: 0
  },
  closeBtn: {
    x: 0,
    y: 0,
    width: 0,
    height: 0
  },
  open: function open() {
    this.cards = getCards();
    this.selectedCard = this.cards[0];
    this.show = true;
    this.active = false;
    this.timeCount = 0;
    this.btnArr = [];
  },
  close: function close() {
    this.show = false;
  },
  onUp: function onUp() {
    if (this.active) {
      var pointer = getPointer();
      if (isClickRect(pointer, this.closeBtn)) {
        player.point--;
        closeDialog(this);
        return;
      }
      if (this.resetCount > 0 && isClickRect(pointer, this.resetBtn)) {
        this.resetCount--;
        this.cards = getCards();
        this.selectedCard = this.cards[0];
        return;
      }
      if (isClickRect(pointer, this.okBtn)) {
        if (isExists(player.cards, this.selectedCard) || player.cards.length < cardLimit) {
          this.selectedCard.get();
          player.point--;
          closeDialog(this);
        } else {
          openSubDialog(this, cardDialog);
        }
        return;
      }
      var _iterator5 = _createForOfIteratorHelper(this.cards),
        _step5;
      try {
        for (_iterator5.s(); !(_step5 = _iterator5.n()).done;) {
          var card = _step5.value;
          if (isClickRect(pointer, card)) {
            this.selectedCard = card;
          }
        }
      } catch (err) {
        _iterator5.e(err);
      } finally {
        _iterator5.f();
      }
    }
  },
  update: function update(dt) {
    this.timeCount += dt;
    if (this.selectedCard) {
      this.name = this.selectedCard.name;
      this.msgArr = this.selectedCard.getDescription();
    }
    if (this.timeCount > 1) {
      this.active = true;
      this.timeCount = 0;
    }
  },
  render: function render() {
    var x = 0;
    var y = 0;
    drawSubWindow(x, y, this.width, this.height);
    context.fillStyle = 'white';
    context.font = "".concat(Math.floor(19 * kw), "px Arial");
    context.lineWidth = 1;
    context.textAlign = 'center';
    context.fillText('升级', x + screenWidth / 2, y + objSize * 1.5);
    x = Math.floor(screenWidth / 2 - objSize);
    y += objSize * 2.5;
    drawCard(x, y, this.cards[0], this.selectedCard);
    x -= objSize * 3;
    drawCard(x, y, this.cards[1], this.selectedCard);
    x += objSize * 6;
    drawCard(x, y, this.cards[2], this.selectedCard);
    context.fillStyle = 'white';
    context.font = "".concat(Math.floor(16 * kw), "px Arial");
    context.textAlign = 'left';
    context.fillStyle = 'white';
    x = objSize * 1.5;
    y += objSize * 2;
    var _iterator6 = _createForOfIteratorHelper(this.msgArr),
      _step6;
    try {
      for (_iterator6.s(); !(_step6 = _iterator6.n()).done;) {
        var msg = _step6.value;
        y += objSize;
        context.fillText(msg, x, y);
      }
    } catch (err) {
      _iterator6.e(err);
    } finally {
      _iterator6.f();
    }
    x = (screenWidth - objSize * 5) / 2;
    y += objSize;
    if (this.resetCount > 0) {
      this.drawResetBtn(x, y, objSize * 5, objSize);
      y += 1.8 * objSize;
    }
    this.drawOkBtn(x, y, objSize * 5, objSize);
    this.drawCloseBtn();
  },
  drawOkBtn: function drawOkBtn(x, y, width, height) {
    this.okBtn.x = x;
    this.okBtn.y = y;
    this.okBtn.width = width;
    this.okBtn.height = height;
    context.strokeStyle = 'white';
    context.lineWidth = 2 * kw;
    context.strokeRect(x, y, width, height);
    context.fillStyle = 'white';
    context.textAlign = 'center';
    context.font = "".concat(Math.floor(16 * kw), "px Arial");
    context.fillText('确定', screenWidth / 2, y + height * 0.7);
  },
  drawResetBtn: function drawResetBtn(x, y, width, height) {
    this.resetBtn.x = x;
    this.resetBtn.y = y;
    this.resetBtn.width = width;
    this.resetBtn.height = height;
    context.strokeStyle = 'white';
    context.lineWidth = 2 * kw;
    context.strokeRect(x, y, width, height);
    context.fillStyle = 'white';
    context.textAlign = 'center';
    context.font = "".concat(Math.floor(16 * kw), "px Arial");
    context.fillText("\u91CD\u7F6E(\u5269\u4F59".concat(this.resetCount, "\u6B21)"), screenWidth / 2, y + height * 0.7);
  },
  drawCloseBtn: function drawCloseBtn() {
    this.closeBtn.x = screenWidth - objSize - pixelSize * 10;
    this.closeBtn.y = objSize / 2 + pixelSize * 2;
    this.closeBtn.width = objSize;
    this.closeBtn.height = objSize;
    _drawCloseBtn(this.closeBtn.x, this.closeBtn.y, objSize);
  }
});
var startDialog = Sprite({
  x: 0,
  y: 0,
  width: screenWidth,
  height: screenHeight,
  show: false,
  open: function open() {
    this.show = true;
  },
  close: function close() {
    this.show = false;
    for (var i = 0; i < enemyCount; i++) {
      createEnemy(slime);
      createEnemy(skeleton);
    }
    createBackground();
    card_lightning.get();
    // card_lightsaber.get();
    // card_fireball.get();
    // card_deathbook.get();
    // card_poison.get();
    // card_belt.get();
    // card_hp_medicine.get();
    // card_necklace.get();
    // card_tooth.get();
    // card_shield.get();
    // card_magnet.get();
    // card_axe.get();
    // card_lance.get();
  },
  onUp: function onUp() {
    closeDialog(this);
  },
  render: function render() {
    context.fillStyle = 'black';
    context.fillRect(0, 0, screenWidth, screenHeight);
    context.fillStyle = 'white';
    context.font = "".concat(Math.floor(30 * kw), "px Arial");
    context.textAlign = 'center';
    context.fillText('点击开始游戏', screenWidth / 2, screenHeight / 2);
  }
});
var gameOverDialog = Sprite({
  x: 0,
  y: 0,
  width: screenWidth,
  height: screenHeight,
  show: false,
  okBtn: {
    x: 0,
    y: 0,
    width: 0,
    height: 0
  },
  getText: function getText() {
    return ["\u751F\u5B58\u65F6\u95F4: ".concat(statusBar.time), "\u7B49\u7EA7: ".concat(player.lv), "\u51FB\u6740: ".concat(scoreboard.kill), "\u573A\u666F\u7834\u574F: ".concat(scoreboard["break"]), "\u603B\u4F24\u5BB3: ".concat(scoreboard.damage), "\u53D7\u5230\u4F24\u5BB3: ".concat(scoreboard.receivedDamage)];
  },
  open: function open() {
    this.show = true;
  },
  close: function close() {
    this.show = false;
  },
  onUp: function onUp() {
    var pointer = getPointer();
    if (isClickRect(pointer, this.okBtn)) {
      player.init();
      statusBar.init();
      scoreboard.init();
      initCard();
      initSkill();
      clearArr(backgroundArr);
      enemyPool.clear();
      itemPool.clear();
      msgPool.clear();
      quadtree.clear();
      levelUpDialog.resetCount = 3;
      closeDialog(this);
      openDialog(startDialog);
    }
  },
  render: function render() {
    var x = 0;
    var y = 0;
    context.fillStyle = 'black';
    context.fillRect(x, y, screenWidth, screenHeight);
    x = screenWidth / 2;
    y += objSize * 1.5;
    context.fillStyle = 'white';
    context.font = "".concat(Math.floor(19 * kw), "px Arial");
    context.lineWidth = 1;
    context.textAlign = 'center';
    context.fillText('游戏结束', x, y);
    context.font = "".concat(Math.floor(16 * kw), "px Arial");
    context.lineWidth = 1;
    context.textAlign = 'left';
    x = Math.floor(screenWidth / 2 - objSize * 4);
    y += objSize / 2;
    var _iterator7 = _createForOfIteratorHelper(this.getText()),
      _step7;
    try {
      for (_iterator7.s(); !(_step7 = _iterator7.n()).done;) {
        var line = _step7.value;
        y += objSize;
        context.fillText(line, x, y);
      }
    } catch (err) {
      _iterator7.e(err);
    } finally {
      _iterator7.f();
    }
    y += objSize;
    this.drawCards(x, y);
    x = (screenWidth - objSize * 5) / 2;
    y += objSize * 9.5;
    this.drawOkBtn(x, y, objSize * 5, objSize);
  },
  drawCards: function drawCards(x, y) {
    var colNum = 0;
    var rowNum = 0;
    var left = x;
    var top = y;
    context.fillStyle = 'white';
    context.font = "".concat(Math.floor(16 * kw), "px Arial");
    context.lineWidth = 1;
    context.textAlign = 'center';
    var _iterator8 = _createForOfIteratorHelper(player.cards),
      _step8;
    try {
      for (_iterator8.s(); !(_step8 = _iterator8.n()).done;) {
        var card = _step8.value;
        x = left + objSize * 3 * colNum;
        y = top + objSize * 3 * rowNum;
        drawCard(x, y, card);
        context.fillText(card.name, x + objSize, y + objSize * 2.5);
        if (colNum < 2) {
          colNum++;
        } else {
          colNum = 0;
          rowNum++;
        }
      }
    } catch (err) {
      _iterator8.e(err);
    } finally {
      _iterator8.f();
    }
  },
  drawOkBtn: function drawOkBtn(x, y, width, height) {
    this.okBtn.x = x;
    this.okBtn.y = y;
    this.okBtn.width = width;
    this.okBtn.height = height;
    context.strokeStyle = 'white';
    context.lineWidth = 2 * kw;
    context.strokeRect(x, y, width, height);
    context.fillStyle = 'white';
    context.textAlign = 'center';
    context.font = "".concat(Math.floor(16 * kw), "px Arial");
    context.fillText('重新开始', screenWidth / 2, y + height * 0.7);
  }
});
var loadDialog = Sprite({
  x: 0,
  y: 0,
  width: screenWidth,
  height: screenHeight,
  show: false,
  numAssets: 0,
  assetsLoaded: 0,
  update: function update() {
    if (this.assetsLoaded == this.numAssets) {
      closeDialog(this);
    }
  },
  open: function open() {
    this.show = true;
  },
  close: function close() {
    this.show = false;
    openDialog(startDialog);
  },
  render: function render() {
    context.fillStyle = 'black';
    context.fillRect(0, 0, screenWidth, screenHeight);
    context.fillStyle = 'white';
    context.font = "".concat(Math.floor(30 * kw), "px Arial");
    context.textAlign = 'center';
    context.fillText("Loading... (".concat(this.assetsLoaded, " / ").concat(this.numAssets, ")"), screenWidth / 2, screenHeight / 2);
  }
});
var cardDialog = Sprite({
  x: 0,
  y: 0,
  width: screenWidth,
  height: screenHeight,
  show: false,
  parent: null,
  selectedCard: {},
  msgArr: ['最多只能携带9张卡片', '要获得新卡片，请选择一张卡片舍弃'],
  btnArr: [],
  addBtn: function addBtn(btn) {
    if (!this.btnArr.find(function (b) {
      return b.id === btn.id;
    })) {
      this.btnArr.push(btn);
    }
  },
  onUp: function onUp() {
    var pointer = getPointer();
    var _iterator9 = _createForOfIteratorHelper(this.btnArr),
      _step9;
    try {
      for (_iterator9.s(); !(_step9 = _iterator9.n()).done;) {
        var btn = _step9.value;
        if (isClickRect(pointer, btn)) {
          btn.onPressed();
        }
      }
    } catch (err) {
      _iterator9.e(err);
    } finally {
      _iterator9.f();
    }
  },
  open: function open(parent) {
    this.show = true;
    this.parent = parent;
    this.selectedCard = {};
  },
  close: function close() {
    this.show = false;
  },
  render: function render() {
    var x = 0;
    var y = 0;
    drawSubWindow(x, y, this.width, this.height);
    context.fillStyle = 'white';
    context.font = "".concat(Math.floor(16 * kw), "px Arial");
    context.lineWidth = 1;
    context.textAlign = 'left';
    x = Math.floor(screenWidth / 2 - objSize * 4);
    y += objSize;
    var _iterator10 = _createForOfIteratorHelper(this.msgArr),
      _step10;
    try {
      for (_iterator10.s(); !(_step10 = _iterator10.n()).done;) {
        var line = _step10.value;
        y += objSize;
        context.fillText(line, x, y);
      }
    } catch (err) {
      _iterator10.e(err);
    } finally {
      _iterator10.f();
    }
    y += objSize;
    this.drawCards(x, y);
    this.drawCloseBtn();
    if (this.selectedCard.name) {
      context.fillStyle = 'white';
      context.font = "".concat(Math.floor(16 * kw), "px Arial");
      context.lineWidth = 1;
      context.textAlign = 'left';
      y += objSize * 10;
      context.fillText("\u786E\u5B9A\u8981\u5C06 LV.".concat(this.selectedCard.lv, " ").concat(this.selectedCard.name), x, y);
      y += objSize;
      context.fillText("\u66FF\u6362\u4E3A LV.1 ".concat(this.parent.selectedCard.name, " \u5417\uFF1F"), x, y);
      x = (screenWidth - objSize * 5) / 2;
      y += objSize;
      this.drawOkBtn(x, y, objSize * 5, objSize);
    }
  },
  drawCards: function drawCards(x, y) {
    var _this2 = this;
    var colNum = 0;
    var rowNum = 0;
    var left = x;
    var top = y;
    var fontSize = Math.floor(16 * kw);
    context.font = "".concat(fontSize, "px Arial");
    context.lineWidth = 1;
    context.textAlign = 'center';
    var _iterator11 = _createForOfIteratorHelper(player.cards),
      _step11;
    try {
      var _loop2 = function _loop2() {
        var card = _step11.value;
        x = left + objSize * 3 * colNum;
        y = top + objSize * 3 * rowNum;
        drawCard(x, y, card, cardDialog.selectedCard);
        context.fillText(card.name, x + objSize, y + objSize * 2.5);
        if (colNum < 2) {
          colNum++;
        } else {
          colNum = 0;
          rowNum++;
        }
        _this2.addBtn({
          id: card.name,
          x: x,
          y: y,
          width: card.width,
          height: card.height,
          onPressed: function onPressed() {
            cardDialog.selectedCard = card;
          }
        });
      };
      for (_iterator11.s(); !(_step11 = _iterator11.n()).done;) {
        _loop2();
      }
    } catch (err) {
      _iterator11.e(err);
    } finally {
      _iterator11.f();
    }
  },
  drawOkBtn: function drawOkBtn(x, y, width, height) {
    context.strokeStyle = 'white';
    context.lineWidth = 2 * kw;
    context.strokeRect(x, y, width, height);
    context.fillStyle = 'white';
    context.textAlign = 'center';
    context.font = "".concat(Math.floor(16 * kw), "px Arial");
    context.fillText('确定', screenWidth / 2, y + height * 0.7);
    this.addBtn({
      id: 'ok',
      x: x,
      y: y,
      width: width,
      height: height,
      onPressed: function onPressed() {
        removeFromArr(player.cards, cardDialog.selectedCard);
        cardDialog.selectedCard.remove();
        cardDialog.parent.selectedCard.get();
        player.point--;
        closeSubDialog(cardDialog.parent, cardDialog);
        closeDialog(cardDialog.parent);
      }
    });
  },
  drawCloseBtn: function drawCloseBtn() {
    var startX = screenWidth - objSize - pixelSize * 10;
    var startY = objSize / 2 + pixelSize * 2;
    var size = objSize;
    this.addBtn({
      id: 'close',
      x: startX,
      y: startY,
      width: size,
      height: size,
      onPressed: function onPressed() {
        closeSubDialog(cardDialog.parent, cardDialog);
      }
    });
    _drawCloseBtn(startX, startY, size);
  }
});
var cardDetailDialog = Sprite({
  x: 0,
  y: 0,
  width: screenWidth,
  height: screenHeight,
  show: false,
  parent: null,
  btnArr: [],
  addBtn: function addBtn(btn) {
    if (!this.btnArr.find(function (b) {
      return b.id === btn.id;
    })) {
      this.btnArr.push(btn);
    }
  },
  onUp: function onUp() {
    var pointer = getPointer();
    var _iterator12 = _createForOfIteratorHelper(this.btnArr),
      _step12;
    try {
      for (_iterator12.s(); !(_step12 = _iterator12.n()).done;) {
        var btn = _step12.value;
        if (isClickRect(pointer, btn)) {
          btn.onPressed();
        }
      }
    } catch (err) {
      _iterator12.e(err);
    } finally {
      _iterator12.f();
    }
  },
  open: function open(parent) {
    this.show = true;
    this.parent = parent;
  },
  close: function close() {
    this.show = false;
  },
  render: function render() {
    var x = 0;
    var y = 0;
    drawSubWindow(x, y, this.width, this.height);
    context.fillStyle = 'white';
    context.font = "".concat(Math.floor(16 * kw), "px Arial");
    context.lineWidth = 1;
    context.textAlign = 'left';
    x = Math.floor(screenWidth / 2 - objSize * 4);
    y += objSize;
    var _iterator13 = _createForOfIteratorHelper(this.parent.selectedCard.getDetail()),
      _step13;
    try {
      for (_iterator13.s(); !(_step13 = _iterator13.n()).done;) {
        var line = _step13.value;
        y += objSize;
        context.fillText(line, x, y);
      }
    } catch (err) {
      _iterator13.e(err);
    } finally {
      _iterator13.f();
    }
    y += objSize;
    this.drawCloseBtn();
  },
  drawCloseBtn: function drawCloseBtn() {
    var startX = screenWidth - objSize - pixelSize * 10;
    var startY = objSize / 2 + pixelSize * 2;
    var size = objSize;
    this.addBtn({
      id: 'close',
      x: startX,
      y: startY,
      width: size,
      height: size,
      onPressed: function onPressed() {
        closeSubDialog(cardDetailDialog.parent, cardDetailDialog);
      }
    });
    _drawCloseBtn(startX, startY, size);
  }
});
dialogArr.push(gameOverDialog);
dialogArr.push(levelUpDialog);
dialogArr.push(mainDialog);
dialogArr.push(startDialog);
dialogArr.push(loadDialog);
dialogArr.push(cardDialog);
dialogArr.push(cardDetailDialog);