"use strict";

function _createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t["return"] || t["return"](); } finally { if (u) throw o; } } }; }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function drawJoystick() {
  if (joystick.frameCount < 300) {
    context.globalAlpha = 0.4;
    context.beginPath();
    context.arc(joystick.x, joystick.y, joystick.outerRadius, 0, 2 * Math.PI);
    context.strokeStyle = 'gray';
    context.lineWidth = 4;
    context.stroke();
    context.globalAlpha = 0.7;
    context.beginPath();
    context.arc(joystick.x + joystick.offsetX, joystick.y + joystick.offsetY, joystick.innerRadius, 0, 2 * Math.PI);
    context.fillStyle = 'gray';
    context.fill();
    context.globalAlpha = 1;
    joystick.frameCount++;
  }
}
function isClickInRectangle(clickX, clickY, rect) {
  return clickX >= rect.x && clickX <= rect.x + rect.width && clickY >= rect.y && clickY <= rect.y + rect.height;
}
function handleTouchStart(event) {
  if (joystick.enable) {
    var _iterator = _createForOfIteratorHelper(event.touches),
      _step;
    try {
      for (_iterator.s(); !(_step = _iterator.n()).done;) {
        var touch = _step.value;
        if (!isClickInRectangle(touch.clientX, touch.clientY, menu)) {
          joystick.x = touch.clientX;
          joystick.y = touch.clientY;
          joystick.touchId = touch.identifier;
          joystick.active = true;
          joystick.frameCount = 0;
        }
      }
    } catch (err) {
      _iterator.e(err);
    } finally {
      _iterator.f();
    }
  }
}
function handleTouchMove(event) {
  if (joystick.enable && joystick.active) {
    var _iterator2 = _createForOfIteratorHelper(event.touches),
      _step2;
    try {
      for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
        var touch = _step2.value;
        if (touch.identifier === joystick.touchId) {
          var dx = touch.clientX - joystick.x;
          var dy = touch.clientY - joystick.y;
          var distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < joystick.outerRadius) {
            joystick.offsetX = dx;
            joystick.offsetY = dy;
          } else {
            // 限制在手柄范围内
            var angle = Math.atan2(dy, dx);
            joystick.offsetX = Math.cos(angle) * joystick.outerRadius;
            joystick.offsetY = Math.sin(angle) * joystick.outerRadius;
          }
          joystick.frameCount = 0;
        }
      }
    } catch (err) {
      _iterator2.e(err);
    } finally {
      _iterator2.f();
    }
  }
}
function handleTouchEnd(event) {
  if (joystick.enable) {
    var _iterator3 = _createForOfIteratorHelper(event.changedTouches),
      _step3;
    try {
      for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
        var touch = _step3.value;
        if (touch.identifier === joystick.touchId) {
          joystick.active = false;
          joystick.offsetX = 0;
          joystick.offsetY = 0;
        }
      }
    } catch (err) {
      _iterator3.e(err);
    } finally {
      _iterator3.f();
    }
  }
}
function keyboard() {
  // 按下方向键或 WASD 键移动
  if (kontra.keyPressed('arrowup') || kontra.keyPressed('w')) {
    joystick.offsetY -= 10;
  }
  if (kontra.keyPressed('arrowdown') || kontra.keyPressed('s')) {
    joystick.offsetY += 10;
  }
  if (kontra.keyPressed('arrowleft') || kontra.keyPressed('a')) {
    joystick.offsetX -= 10;
  }
  if (kontra.keyPressed('arrowright') || kontra.keyPressed('d')) {
    joystick.offsetX += 10;
  }
  if (Math.abs(joystick.offsetX) >= 50) {
    joystick.offsetX = joystick.offsetX > 0 ? 49 : -49;
  }
  if (Math.abs(joystick.offsetY) >= 50) {
    joystick.offsetY = joystick.offsetY > 0 ? 49 : -49;
  }
  if (joystick.offsetY < 0) {
    if (joystick.offsetX > 0) {
      player.direction = BACK_RIGHT;
    } else if (joystick.offsetX < 0) {
      player.direction = BACK_LEFT;
    }
  } else if (joystick.offsetX > 0) {
    player.direction = RIGHT;
  } else if (joystick.offsetX < 0) {
    player.direction = LEFT;
  }
}
window.addEventListener('keyup', function (event) {
  // 松开键后停止移动
  if (event.key === 'ArrowLeft' || event.key === 'a' || event.key === 'ArrowRight' || event.key === 'd') {
    joystick.offsetX = 0;
  }
  if (event.key === 'ArrowUp' || event.key === 'w' || event.key === 'ArrowDown' || event.key === 's') {
    joystick.offsetY = 0;
  }
});
var joystick = {
  x: screenWidth / 2,
  y: screenHeight / 1.15,
  outerRadius: 50,
  innerRadius: 20,
  touchId: null,
  offsetX: 0,
  offsetY: 0,
  enable: true,
  active: false,
  frameCount: 300
};