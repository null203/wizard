"use strict";

function _createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t["return"] || t["return"](); } finally { if (u) throw o; } } }; }
function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
function drawBitmap(direction, data) {
  var size = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : pixelSize;
  var begin = bitmapHeight * (direction - 1);
  var end = bitmapHeight * direction;
  context.save();
  context.translate(Math.round(screenWidth / 2 - player.x - objSize / 2), Math.round(screenHeight / 2 - player.y - objSize / 2 - objSize * 3));
  for (var y = begin; y < end; y++) {
    var row = data[y];
    for (var x = 0; x < bitmapWidth; x++) {
      var isPixelOn = row >> bitmapWidth - 1 - x & 1;
      context.fillStyle = isPixelOn ? 'white' : 'rgba(0, 0, 0, 0)';
      context.fillRect(x * size + objSize / 2, (y - begin) * size + objSize / 2, size, size);
    }
  }
  context.restore();
}
function updateViewport(player) {
  viewport.x = player.x - viewport.width / 2;
  viewport.y = player.y - viewport.height / 2 + objSize * 3;
}
function isVisible(obj) {
  return obj.x < viewport.x + viewport.width + obj.width / 2 && obj.x + obj.width > viewport.x + obj.width / 2 && obj.y < viewport.y + viewport.height + obj.height / 2 && obj.y + obj.height > viewport.y + obj.height / 2;
}
function weightedRandom(weights) {
  var entries = Object.entries(weights);
  var totalWeight = entries.reduce(function (sum, _ref) {
    var _ref2 = _slicedToArray(_ref, 2),
      weight = _ref2[1];
    return sum + weight;
  }, 0);
  var random = Math.random() * totalWeight;
  var accumulatedWeight = 0;
  for (var _i = 0, _entries = entries; _i < _entries.length; _i++) {
    var _entries$_i = _slicedToArray(_entries[_i], 2),
      number = _entries$_i[0],
      weight = _entries$_i[1];
    accumulatedWeight += weight;
    if (random < accumulatedWeight) {
      return Number(number);
    }
  }
}
function setDirection(sprite, offsetX, offsetY) {
  var angle = Math.atan2(offsetY, offsetX);
  if (offsetY > 0) {
    if (offsetX > 0) {
      sprite.direction = RIGHT;
    } else if (offsetX < 0) {
      sprite.direction = LEFT;
    }
  } else if (offsetY < 0) {
    if (offsetX > 0) {
      sprite.direction = angle < -Math.PI / 3 ? BACK_RIGHT : RIGHT;
    } else if (offsetX < 0) {
      sprite.direction = angle > -Math.PI * 2 / 3 ? BACK_LEFT : LEFT;
    }
  }
}
function isColliding(sprite1, sprite2) {
  return sprite1.x - sprite1.width / 2 < sprite2.x + sprite2.width / 2 && sprite1.x + sprite1.width / 2 > sprite2.x - sprite2.width / 2 && sprite1.y - sprite1.height / 2 < sprite2.y + sprite2.height / 2 && sprite1.y + sprite1.height / 2 > sprite2.y - sprite2.height / 2;
}
function checkBoundary(sprite) {
  if (sprite.x < sprite.width / 2) {
    sprite.x = sprite.width / 2;
  }
  if (sprite.y < sprite.height / 2) {
    sprite.y = sprite.height / 2;
  }
  if (sprite.x + sprite.width / 2 > worldLimit) {
    sprite.x = worldLimit - sprite.width / 2;
  }
  if (sprite.y + sprite.height / 2 > worldLimit) {
    sprite.y = worldLimit - sprite.height / 2;
  }
}
function displayNumber(x) {
  return x < 10 ? "0".concat(x) : "".concat(x);
}
function isClickRect(pointer, rect) {
  return pointer.x >= rect.x && pointer.x <= rect.x + rect.width && pointer.y >= rect.y && pointer.y <= rect.y + rect.height;
}
function isExists(arr, target) {
  var _iterator = _createForOfIteratorHelper(arr),
    _step;
  try {
    for (_iterator.s(); !(_step = _iterator.n()).done;) {
      var obj = _step.value;
      if (obj == target) return true;
    }
  } catch (err) {
    _iterator.e(err);
  } finally {
    _iterator.f();
  }
  return false;
}
function removeFromArr(arr, target) {
  arr.splice(arr.indexOf(target), 1);
}
function clearArr(arr) {
  arr.splice(0, arr.length);
}
function bezier(point, controlPoint1, controlPoint2, t) {
  // 三次贝塞尔曲线公式计算位置
  point.x = Math.pow(1 - t, 3) * point.x + 3 * Math.pow(1 - t, 2) * t * controlPoint1.x + 3 * (1 - t) * Math.pow(t, 2) * controlPoint2.x + Math.pow(t, 3) * player.x;
  point.y = Math.pow(1 - t, 3) * point.y + 3 * Math.pow(1 - t, 2) * t * controlPoint1.y + 3 * (1 - t) * Math.pow(t, 2) * controlPoint2.y + Math.pow(t, 3) * player.y;
}

// 判断两条线段是否相交
function linesIntersect(x1, y1, x2, y2, x3, y3, x4, y4) {
  var denom = (y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1);
  if (denom === 0) return false; // 平行或共线

  var ua = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / denom;
  var ub = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / denom;
  return ua >= 0 && ua <= 1 && ub >= 0 && ub <= 1;
}

// 判断线段是否与矩形相交
function doesLineIntersectRect(startX, startY, endX, endY, rect) {
  // 矩形的四个顶点
  var topLeft = {
    x: rect.x,
    y: rect.y
  };
  var topRight = {
    x: rect.x + rect.width,
    y: rect.y
  };
  var bottomLeft = {
    x: rect.x,
    y: rect.y + rect.height
  };
  var bottomRight = {
    x: rect.x + rect.width,
    y: rect.y + rect.height
  };

  // 检查线段是否与矩形的四条边相交
  return linesIntersect(startX, startY, endX, endY, topLeft.x, topLeft.y, topRight.x, topRight.y) || linesIntersect(startX, startY, endX, endY, topRight.x, topRight.y, bottomRight.x, bottomRight.y) || linesIntersect(startX, startY, endX, endY, bottomRight.x, bottomRight.y, bottomLeft.x, bottomLeft.y) || linesIntersect(startX, startY, endX, endY, bottomLeft.x, bottomLeft.y, topLeft.x, topLeft.y);
}