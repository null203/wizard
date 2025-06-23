"use strict";

function _createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t["return"] || t["return"](); } finally { if (u) throw o; } } }; }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function getCards() {
  var pool = [];
  for (var i = 0; i < cardArr.length; i++) {
    pool[i] = cardArr[i];
  }
  var arr = [];
  var len = Math.min(pool.length, 3);
  while (arr.length < len) {
    var totalWeight = pool.reduce(function (total, card) {
      return total + card.weight;
    }, 0);
    var random = Math.random() * totalWeight;
    for (var _i = 0; _i < pool.length; _i++) {
      random -= pool[_i].weight;
      if (random <= 0) {
        arr.push(pool[_i]);
        pool.splice(_i, 1);
        break;
      }
    }
  }
  return arr;
}
var card_lightning = {
  x: 0,
  y: 0,
  lv: 0,
  type: CARD_TYPE_MAGIC,
  maxLv: 5,
  name: '护身闪电',
  width: objSize * 2,
  height: objSize * 2,
  step: 60,
  weight: 1,
  getDetail: function getDetail() {
    return ["\u9B54\u6CD5: ".concat(this.name), "\u7B49\u7EA7: ".concat(this.lv, " / ").concat(this.maxLv), "\u4F24\u5BB3\u500D\u7387: ".concat(lightning.ratio, "%"), "\u653B\u51FB\u8DDD\u79BB: ".concat(lightning.radius / kw), "\u6301\u7EED\u65F6\u95F4: ".concat(lightning.time, "\u79D2"), "\u51B7\u5374\u65F6\u95F4: ".concat(lightning.cd, "\u79D2"), "\u53D1\u5C04\u5F3A\u529B\u95EA\u7535\uFF0C\u653B\u51FB\u6700\u8FD1\u7684\u654C\u4EBA\u3002"];
  },
  getDescription: function getDescription() {
    return ["\u9B54\u6CD5: ".concat(this.name), "\u7B49\u7EA7: ".concat(this.lv + 1, " / ").concat(this.maxLv), "\u4F24\u5BB3\u500D\u7387: ".concat(lightning.ratio + (this.lv == 0 ? 0 : this.step), "%"), "\u653B\u51FB\u8DDD\u79BB: ".concat(lightning.radius / kw), "\u6301\u7EED\u65F6\u95F4: ".concat(lightning.time, "\u79D2"), "\u51B7\u5374\u65F6\u95F4: ".concat(lightning.cd, "\u79D2"), "\u53D1\u5C04\u5F3A\u529B\u95EA\u7535\uFF0C\u653B\u51FB\u6700\u8FD1\u7684\u654C\u4EBA\u3002"];
  },
  remove: function remove() {
    removeFromArr(cardArr, this);
    removeFromArr(player.skill, lightning);
  },
  get: function get() {
    this.lv++;
    if (isExists(player.cards, this)) {
      this.levelUp();
      return true;
    } else {
      player.skill.push(lightning);
      player.cards.push(this);
      this.weight++;
    }
  },
  levelUp: function levelUp() {
    lightning.ratio += this.step;
    if (this.lv == this.maxLv) {
      removeFromArr(cardArr, this);
    }
  },
  icon: [0xffff, 0x8001, 0x8001, 0x8001, 0x83c1, 0x8381, 0x8701, 0x8601, 0x8fe1, 0x80c1, 0x8181, 0x8101, 0x8001, 0x8001, 0x8001, 0xffff]
};
var card_fireball = {
  x: 0,
  y: 0,
  lv: 0,
  type: CARD_TYPE_MAGIC,
  maxLv: 5,
  name: '火球术',
  width: objSize * 2,
  height: objSize * 2,
  step: 60,
  weight: 1,
  getDetail: function getDetail() {
    return ["\u9B54\u6CD5: ".concat(this.name), "\u7B49\u7EA7: ".concat(this.lv, " / ").concat(this.maxLv), "\u4F24\u5BB3\u500D\u7387: ".concat(fireball.ratio, "%"), "\u653B\u51FB\u8DDD\u79BB: ".concat(fireball.radius / kw), "\u6301\u7EED\u65F6\u95F4: ".concat(fireball.time, "\u79D2"), "\u51B7\u5374\u65F6\u95F4: ".concat(fireball.cd, "\u79D2"), "\u5411\u9762\u671D\u7684\u65B9\u5411\u53D1\u5C04\u53EF\u7A7F\u900F\u654C\u4EBA\u7684\u706B\u7403\u3002"];
  },
  getDescription: function getDescription() {
    return ["\u9B54\u6CD5: ".concat(this.name), "\u7B49\u7EA7: ".concat(this.lv + 1, " / ").concat(this.maxLv), "\u4F24\u5BB3\u500D\u7387: ".concat(fireball.ratio + (this.lv == 0 ? 0 : this.step), "%"), "\u653B\u51FB\u8DDD\u79BB: ".concat(fireball.radius / kw), "\u6301\u7EED\u65F6\u95F4: ".concat(fireball.time, "\u79D2"), "\u51B7\u5374\u65F6\u95F4: ".concat(fireball.cd, "\u79D2"), "\u5411\u9762\u671D\u7684\u65B9\u5411\u53D1\u5C04\u53EF\u7A7F\u900F\u654C\u4EBA\u7684\u706B\u7403\u3002"];
  },
  remove: function remove() {
    removeFromArr(cardArr, this);
    removeFromArr(player.skill, fireball);
  },
  get: function get() {
    this.lv++;
    if (isExists(player.cards, this)) {
      this.levelUp();
    } else {
      player.skill.push(fireball);
      player.cards.push(this);
      this.weight++;
    }
  },
  levelUp: function levelUp() {
    fireball.ratio += this.step;
    if (this.lv == this.maxLv) {
      removeFromArr(cardArr, this);
    }
  },
  icon: [0xffff, 0x8005, 0x8001, 0x802b, 0x8001, 0x80a9, 0x8041, 0x8501, 0x8821, 0x9a01, 0xbc81, 0xbe01, 0xbe01, 0xbc01, 0x8001, 0xffff]
};
var card_deathbook = {
  x: 0,
  y: 0,
  lv: 0,
  type: CARD_TYPE_WEAPON,
  maxLv: 5,
  name: '圣书',
  width: objSize * 2,
  height: objSize * 2,
  step: 40,
  weight: 1,
  getDetail: function getDetail() {
    return ["\u6B66\u5668: ".concat(this.name), "\u7B49\u7EA7: ".concat(this.lv, " / ").concat(this.maxLv), "\u4F24\u5BB3\u500D\u7387: ".concat(deathbook.ratio, "%"), "\u653B\u51FB\u8DDD\u79BB: ".concat(deathbook.radius / kw), "\u65CB\u8F6C\u5708\u6570: ".concat(deathbook.maxCount), "\u51B7\u5374\u65F6\u95F4: ".concat(deathbook.cd, "\u79D2"), "\u653B\u51FB\u529B + 5", "\u9632\u5FA1\u529B + 5", "\u8DDF\u968F\u73A9\u5BB6\u65CB\u8F6C\uFF0C\u653B\u51FB\u5468\u56F4\u7684\u654C\u4EBA\u3002"];
  },
  getDescription: function getDescription() {
    return ["\u6B66\u5668: ".concat(this.name), "\u7B49\u7EA7: ".concat(this.lv + 1, " / ").concat(this.maxLv), "\u4F24\u5BB3\u500D\u7387: ".concat(deathbook.ratio + (this.lv == 0 ? 0 : this.step), "%"), "\u653B\u51FB\u8DDD\u79BB: ".concat(deathbook.radius / kw), "\u65CB\u8F6C\u5708\u6570: ".concat(deathbook.maxCount), "\u51B7\u5374\u65F6\u95F4: ".concat(deathbook.cd, "\u79D2"), "\u653B\u51FB\u529B + 5", "\u9632\u5FA1\u529B + 5", "\u8DDF\u968F\u73A9\u5BB6\u65CB\u8F6C\uFF0C\u653B\u51FB\u5468\u56F4\u7684\u654C\u4EBA\u3002"];
  },
  remove: function remove() {
    removeFromArr(cardArr, this);
    removeFromArr(player.skill, deathbook);
    player.atk -= 5;
    player.def -= 5;
  },
  get: function get() {
    this.lv++;
    if (isExists(player.cards, this)) {
      this.levelUp();
    } else {
      player.skill.push(deathbook);
      player.cards.push(this);
      player.atk += 5;
      player.def += 5;
      this.weight++;
    }
  },
  levelUp: function levelUp() {
    deathbook.ratio += this.step;
    if (this.lv == this.maxLv) {
      removeFromArr(cardArr, this);
    }
  },
  icon: [0xffff, 0x8001, 0x8001, 0x83f9, 0x8409, 0x8fe9, 0x8829, 0x8929, 0x8ba9, 0x8929, 0x8929, 0x8831, 0x8fe1, 0x8001, 0x8001, 0xffff]
};
var card_lightsaber = {
  x: 0,
  y: 0,
  lv: 0,
  type: CARD_TYPE_SUPER_WEAPON,
  maxLv: 5,
  name: '圣剑',
  width: objSize * 2,
  height: objSize * 2,
  step: 40,
  weight: 0.1,
  getDetail: function getDetail() {
    return ["\u6B66\u5668: ".concat(this.name), "\u7B49\u7EA7: ".concat(this.lv, " / ").concat(this.maxLv), "\u4F24\u5BB3\u500D\u7387: ".concat(lightsaber.ratio, "%"), "\u653B\u51FB\u8DDD\u79BB: ".concat(parseInt(lightsaber.height)), "\u524D\u6447\u65F6\u95F4: ".concat(lightsaber.preTime, "\u79D2"), "\u6301\u7EED\u65F6\u95F4: ".concat(lightsaber.time, "\u79D2"), "\u51B7\u5374\u65F6\u95F4: ".concat(lightsaber.cd, "\u79D2"), "\u653B\u51FB\u529B + 10", "\u53EF\u53D1\u52A8\u5723\u5251\u89E3\u653E\u653B\u51FB\u5927\u91CF\u654C\u4EBA\u3002"];
  },
  getDescription: function getDescription() {
    return ["\u6B66\u5668: ".concat(this.name), "\u7B49\u7EA7: ".concat(this.lv + 1, " / ").concat(this.maxLv), "\u4F24\u5BB3\u500D\u7387: ".concat(lightsaber.ratio + (this.lv == 0 ? 0 : this.step), "%"), "\u653B\u51FB\u8DDD\u79BB: ".concat(parseInt(lightsaber.height)), "\u524D\u6447\u65F6\u95F4: ".concat(lightsaber.preTime, "\u79D2"), "\u6301\u7EED\u65F6\u95F4: ".concat(lightsaber.time, "\u79D2"), "\u51B7\u5374\u65F6\u95F4: ".concat(lightsaber.cd, "\u79D2"), "\u653B\u51FB\u529B + 10", "\u53EF\u53D1\u52A8\u5723\u5251\u89E3\u653E\u653B\u51FB\u5927\u91CF\u654C\u4EBA\u3002"];
  },
  remove: function remove() {
    removeFromArr(cardArr, this);
    removeFromArr(player.skill, lightsaber);
    player.atk -= 10;
  },
  get: function get() {
    this.lv++;
    if (isExists(player.cards, this)) {
      this.levelUp();
    } else {
      player.skill.push(lightsaber);
      player.cards.push(this);
      player.atk += 10;
      this.weight++;
    }
  },
  levelUp: function levelUp() {
    lightsaber.ratio += this.step;
    if (this.lv == this.maxLv) {
      removeFromArr(cardArr, this);
    }
  },
  icon: [0xffff, 0x8001, 0x800d, 0x801d, 0x8039, 0x8071, 0x80e1, 0x81c1, 0x8381, 0xa701, 0xba01, 0x8c01, 0x9401, 0xa601, 0xc001, 0xffff]
};
var card_shield = {
  x: 0,
  y: 0,
  lv: 0,
  type: CARD_TYPE_EQUIPMENT,
  maxLv: 5,
  name: '钢盾',
  width: objSize * 2,
  height: objSize * 2,
  def: 10,
  step: 5,
  weight: 1,
  getDetail: function getDetail() {
    return ["\u88C5\u5907: ".concat(this.name), "\u7B49\u7EA7: ".concat(this.lv, " / ").concat(this.maxLv), "\u9632\u5FA1\u529B + ".concat(this.def + (this.lv - 1) * this.step)];
  },
  getDescription: function getDescription() {
    return ["\u88C5\u5907: ".concat(this.name), "\u7B49\u7EA7: ".concat(this.lv + 1, " / ").concat(this.maxLv), "\u9632\u5FA1\u529B + ".concat(this.def + this.lv * this.step)];
  },
  remove: function remove() {
    removeFromArr(cardArr, this);
    player.def -= this.def + (this.lv - 1) * this.step;
  },
  get: function get() {
    this.lv++;
    if (isExists(player.cards, this)) {
      this.levelUp();
    } else {
      player.cards.push(this);
      player.def += this.def;
      this.weight++;
    }
  },
  levelUp: function levelUp() {
    player.def += this.step;
    if (this.lv == this.maxLv) {
      removeFromArr(cardArr, this);
    }
  },
  icon: [0xffff, 0x8001, 0x9ff9, 0x9009, 0x97e9, 0x90e9, 0x90e9, 0x90e9, 0x90e9, 0x90e9, 0x90e9, 0x88d1, 0x84a1, 0x8241, 0x8181, 0xffff]
};
var card_belt = {
  x: 0,
  y: 0,
  lv: 0,
  type: CARD_TYPE_EQUIPMENT,
  maxLv: 5,
  name: '力量腰带',
  width: objSize * 2,
  height: objSize * 2,
  atk: 10,
  step: 5,
  weight: 1,
  getDetail: function getDetail() {
    return ["\u88C5\u5907: ".concat(this.name), "\u7B49\u7EA7: ".concat(this.lv, " / ").concat(this.maxLv), "\u653B\u51FB\u529B + ".concat(this.atk + (this.lv - 1) * this.step)];
  },
  getDescription: function getDescription() {
    return ["\u88C5\u5907: ".concat(this.name), "\u7B49\u7EA7: ".concat(this.lv + 1, " / ").concat(this.maxLv), "\u653B\u51FB\u529B + ".concat(this.atk + this.lv * this.step)];
  },
  remove: function remove() {
    removeFromArr(cardArr, this);
    player.atk -= this.atk + (this.lv - 1) * this.step;
  },
  get: function get() {
    this.lv++;
    if (isExists(player.cards, this)) {
      this.levelUp();
    } else {
      player.cards.push(this);
      player.atk += this.atk;
      this.weight++;
    }
  },
  levelUp: function levelUp() {
    player.atk += this.step;
    if (this.lv == this.maxLv) {
      removeFromArr(cardArr, this);
    }
  },
  icon: [0xffff, 0x8001, 0x8001, 0x8ff1, 0x9ff9, 0xb00d, 0xa005, 0xa3c5, 0xa425, 0xb5ad, 0xb5ad, 0x95a9, 0x8421, 0x83c1, 0x8001, 0xffff]
};
var card_hp_medicine = {
  x: 0,
  y: 0,
  lv: 0,
  type: CARD_TYPE_ITEM,
  maxLv: 5,
  name: '生命药水',
  width: objSize * 2,
  height: objSize * 2,
  hp: 20,
  weight: 1,
  getDetail: function getDetail() {
    return ["\u88C5\u5907: ".concat(this.name), "\u7B49\u7EA7: ".concat(this.lv, " / ").concat(this.maxLv), "\u6700\u5927\u751F\u547D\u503C + ".concat(this.lv * this.hp)];
  },
  getDescription: function getDescription() {
    return ["\u88C5\u5907: ".concat(this.name), "\u7B49\u7EA7: ".concat(this.lv + 1, " / ").concat(this.maxLv), "\u7ACB\u5373\u6062\u590D150\u751F\u547D\u503C\u3002", "\u6700\u5927\u751F\u547D\u503C + ".concat((this.lv + 1) * this.hp)];
  },
  remove: function remove() {
    removeFromArr(cardArr, this);
    player.maxHp -= this.hp * this.lv;
    if (player.hp > player.maxHp) {
      player.hp = player.maxHp;
    }
  },
  get: function get() {
    this.lv++;
    if (isExists(player.cards, this)) {
      this.levelUp();
    } else {
      player.cards.push(this);
      player.maxHp += this.hp;
    }
    player.addHp(150);
  },
  levelUp: function levelUp() {
    player.maxHp += this.hp;
    if (this.lv == this.maxLv) {
      removeFromArr(cardArr, this);
    }
  },
  icon: [0xffff, 0x8001, 0x83c1, 0x83c9, 0x819d, 0x8249, 0x8421, 0x8811, 0x9009, 0x97e9, 0x97e9, 0x97e9, 0x9009, 0x8ff1, 0x8001, 0xffff]
};
var card_poison = {
  x: 0,
  y: 0,
  lv: 0,
  type: CARD_TYPE_WEAPON,
  maxLv: 5,
  name: '毒瓶',
  width: objSize * 2,
  height: objSize * 2,
  step: 40,
  weight: 1,
  getDetail: function getDetail() {
    return ["\u6B66\u5668: ".concat(this.name), "\u7B49\u7EA7: ".concat(this.lv, " / ").concat(this.maxLv), "\u4F24\u5BB3\u500D\u7387: ".concat(poisonsmoke.ratio, "%"), "\u653B\u51FB\u8303\u56F4: ".concat(poisonsmoke.radius / kw), "\u98DE\u884C\u65F6\u95F4: ".concat(poisonsmoke.flyTime, "\u79D2"), "\u6301\u7EED\u65F6\u95F4: ".concat(poisonsmoke.time, "\u79D2"), "\u51B7\u5374\u65F6\u95F4: ".concat(poisonsmoke.cd, "\u79D2"), "\u653B\u51FB\u529B + 5", "\u6295\u63B7\u6BD2\u74F6\uFF0C\u5BF9\u8303\u56F4\u5185\u7684\u654C\u4EBA\u9020\u6210\u6301\u7EED\u4F24\u5BB3\u3002"];
  },
  getDescription: function getDescription() {
    return ["\u6B66\u5668: ".concat(this.name), "\u7B49\u7EA7: ".concat(this.lv + 1, " / ").concat(this.maxLv), "\u4F24\u5BB3\u500D\u7387: ".concat(poisonsmoke.ratio + (this.lv == 0 ? 0 : this.step), "%"), "\u653B\u51FB\u8303\u56F4: ".concat(poisonsmoke.radius / kw), "\u98DE\u884C\u65F6\u95F4: ".concat(poisonsmoke.flyTime, "\u79D2"), "\u6301\u7EED\u65F6\u95F4: ".concat(poisonsmoke.time, "\u79D2"), "\u51B7\u5374\u65F6\u95F4: ".concat(poisonsmoke.cd, "\u79D2"), "\u653B\u51FB\u529B + 5", "\u6295\u63B7\u6BD2\u74F6\uFF0C\u5BF9\u8303\u56F4\u5185\u7684\u654C\u4EBA\u9020\u6210\u6301\u7EED\u4F24\u5BB3\u3002"];
  },
  remove: function remove() {
    removeFromArr(cardArr, this);
    removeFromArr(player.skill, poisonsmoke);
    player.atk -= 5;
  },
  get: function get() {
    this.lv++;
    if (isExists(player.cards, this)) {
      this.levelUp();
    } else {
      player.skill.push(poisonsmoke);
      player.cards.push(this);
      player.atk += 5;
      this.weight++;
    }
  },
  levelUp: function levelUp() {
    poisonsmoke.ratio += this.step;
    if (this.lv == this.maxLv) {
      removeFromArr(cardArr, this);
    }
  },
  icon: [0xffff, 0x8001, 0x8181, 0x83c1, 0x8241, 0x8241, 0x8241, 0x8421, 0x8891, 0x9209, 0xbffd, 0xbffd, 0xbffd, 0x9ff9, 0x8001, 0xffff]
};
var card_tooth = {
  x: 0,
  y: 0,
  lv: 0,
  type: CARD_TYPE_EQUIPMENT,
  maxLv: 5,
  name: '狼牙挂坠',
  width: objSize * 2,
  height: objSize * 2,
  step: 2,
  weight: 1,
  getDetail: function getDetail() {
    return ["\u88C5\u5907: ".concat(this.name), "\u7B49\u7EA7: ".concat(this.lv, " / ").concat(this.maxLv), "\u653B\u51FB\u529B + ".concat((this.lv - 1) * this.step + 5), "\u66B4\u51FB\u7387 + ".concat((this.lv - 1) * this.step + 5)];
  },
  getDescription: function getDescription() {
    return ["\u88C5\u5907: ".concat(this.name), "\u7B49\u7EA7: ".concat(this.lv + 1, " / ").concat(this.maxLv), "\u653B\u51FB\u529B + ".concat(this.lv * this.step + 5), "\u66B4\u51FB\u7387 + ".concat(this.lv * this.step + 5)];
  },
  remove: function remove() {
    removeFromArr(cardArr, this);
    player.atk -= 5 + (this.lv - 1) * this.step;
    player.crit -= 5 + (this.lv - 1) * this.step;
  },
  get: function get() {
    this.lv++;
    if (isExists(player.cards, this)) {
      this.levelUp();
    } else {
      player.cards.push(this);
      player.atk += 5;
      player.crit += 5;
      this.weight++;
    }
  },
  levelUp: function levelUp() {
    player.atk += this.step;
    player.crit += this.step;
    if (this.lv == this.maxLv) {
      removeFromArr(cardArr, this);
    }
  },
  icon: [0xffff, 0x8001, 0x80f9, 0x831d, 0x84fd, 0x8bfd, 0x97f9, 0x97e1, 0xaf81, 0xae11, 0xac11, 0xb881, 0xb001, 0xb041, 0xa001, 0xffff]
};
var card_necklace = {
  x: 0,
  y: 0,
  lv: 0,
  type: CARD_TYPE_EQUIPMENT,
  maxLv: 5,
  name: '宝石项链',
  width: objSize * 2,
  height: objSize * 2,
  step: 1,
  weight: 1,
  getDetail: function getDetail() {
    return ["\u88C5\u5907: ".concat(this.name), "\u7B49\u7EA7: ".concat(this.lv, " / ").concat(this.maxLv), "\u653B\u51FB\u529B + ".concat((this.lv - 1) * this.step + 2), "\u9632\u5FA1\u529B + ".concat((this.lv - 1) * this.step + 2), "\u6700\u5927\u751F\u547D\u503C + ".concat((this.lv - 1) * this.step + 10)];
  },
  getDescription: function getDescription() {
    return ["\u88C5\u5907: ".concat(this.name), "\u7B49\u7EA7: ".concat(this.lv + 1, " / ").concat(this.maxLv), "\u653B\u51FB\u529B + ".concat(this.lv * this.step + 2), "\u9632\u5FA1\u529B + ".concat(this.lv * this.step + 2), "\u6700\u5927\u751F\u547D\u503C + ".concat(this.lv * this.step + 10)];
  },
  remove: function remove() {
    removeFromArr(cardArr, this);
    player.atk -= 2 + (this.lv - 1) * this.step;
    player.def -= 2 + (this.lv - 1) * this.step;
    player.hp -= 10 + (this.lv - 1) * this.step;
  },
  get: function get() {
    this.lv++;
    if (isExists(player.cards, this)) {
      this.levelUp();
    } else {
      player.cards.push(this);
      player.atk += 2;
      player.def += 2;
      player.maxHp += 10;
      this.weight++;
    }
  },
  levelUp: function levelUp() {
    player.atk += this.step;
    player.def += this.step;
    player.maxHp += this.step;
    if (this.lv == this.maxLv) {
      removeFromArr(cardArr, this);
    }
  },
  icon: [0xffff, 0x8001, 0x81f1, 0x8609, 0x8805, 0x9005, 0xa005, 0xa009, 0xa011, 0x9021, 0x8981, 0x8241, 0x8241, 0x8181, 0x8001, 0xffff]
};
var card_axe = {
  x: 0,
  y: 0,
  lv: 0,
  type: CARD_TYPE_WEAPON,
  maxLv: 5,
  name: '战斧',
  width: objSize * 2,
  height: objSize * 2,
  step: 40,
  weight: 1,
  getDetail: function getDetail() {
    return ["\u6B66\u5668: ".concat(this.name), "\u7B49\u7EA7: ".concat(this.lv, " / ").concat(this.maxLv), "\u4F24\u5BB3\u500D\u7387: ".concat(axe.ratio, "%"), "\u653B\u51FB\u8DDD\u79BB: ".concat(axe.distance / kw), "\u51B7\u5374\u65F6\u95F4: ".concat(axe.cd, "\u79D2"), "\u653B\u51FB\u529B + 15", "\u56DE\u65CB\u653B\u51FB\u73A9\u5BB6\u671D\u5411\u7684\u654C\u4EBA\u3002"];
  },
  getDescription: function getDescription() {
    return ["\u6B66\u5668: ".concat(this.name), "\u7B49\u7EA7: ".concat(this.lv + 1, " / ").concat(this.maxLv), "\u4F24\u5BB3\u500D\u7387: ".concat(axe.ratio + (this.lv == 0 ? 0 : this.step), "%"), "\u653B\u51FB\u8DDD\u79BB: ".concat(axe.distance / kw), "\u51B7\u5374\u65F6\u95F4: ".concat(axe.cd, "\u79D2"), "\u653B\u51FB\u529B + 15", "\u56DE\u65CB\u653B\u51FB\u73A9\u5BB6\u671D\u5411\u7684\u654C\u4EBA\u3002"];
  },
  remove: function remove() {
    removeFromArr(cardArr, this);
    removeFromArr(player.skill, axe);
    player.atk -= 15;
  },
  get: function get() {
    this.lv++;
    if (isExists(player.cards, this)) {
      this.levelUp();
    } else {
      player.skill.push(axe);
      player.cards.push(this);
      player.atk += 15;
      this.weight++;
    }
  },
  levelUp: function levelUp() {
    axe.ratio += this.step;
    if (this.lv == this.maxLv) {
      removeFromArr(cardArr, this);
    }
  },
  icon: [0xffff, 0x8001, 0x8061, 0x8ce5, 0x8fcd, 0x878d, 0x87fd, 0x8f9d, 0x9d3d, 0xb979, 0xf1f9, 0xe7f1, 0xcfc1, 0x8001, 0x8001, 0xffff]
};
var card_magnet = {
  x: 0,
  y: 0,
  lv: 0,
  type: CARD_TYPE_ITEM,
  maxLv: 5,
  name: '磁铁',
  width: objSize * 2,
  height: objSize * 2,
  step: 10,
  weight: 1,
  getDetail: function getDetail() {
    return ["\u88C5\u5907: ".concat(this.name), "\u7B49\u7EA7: ".concat(this.lv, " / ").concat(this.maxLv), "\u62FE\u53D6\u8DDD\u79BB + ".concat(this.lv * 10)];
  },
  getDescription: function getDescription() {
    return ["\u88C5\u5907: ".concat(this.name), "\u7B49\u7EA7: ".concat(this.lv + 1, " / ").concat(this.maxLv), "\u7ACB\u5373\u5438\u53D6\u5730\u56FE\u4E0A\u6240\u6709\u7684\u9053\u5177\u3002", "\u62FE\u53D6\u8DDD\u79BB + ".concat((this.lv + 1) * 10)];
  },
  remove: function remove() {
    removeFromArr(cardArr, this);
    player.pickupDistance -= this.lv * this.step;
  },
  get: function get() {
    this.lv++;
    if (isExists(player.cards, this)) {
      this.levelUp();
    } else {
      player.cards.push(this);
      player.pickupDistance += this.step;
      this.weight++;
    }
    var _iterator = _createForOfIteratorHelper(itemPool.getAliveObjects()),
      _step;
    try {
      for (_iterator.s(); !(_step = _iterator.n()).done;) {
        var item = _step.value;
        item.fly = true;
      }
    } catch (err) {
      _iterator.e(err);
    } finally {
      _iterator.f();
    }
  },
  levelUp: function levelUp() {
    player.pickupDistance += this.step;
    if (this.lv == this.maxLv) {
      removeFromArr(cardArr, this);
    }
  },
  icon: [0xffff, 0x8001, 0x9c39, 0x9c39, 0x9c39, 0x9429, 0x9429, 0x9429, 0x9429, 0x9429, 0x9429, 0x93c9, 0x8811, 0x87e1, 0x8001, 0xffff]
};
var card_lance = {
  x: 0,
  y: 0,
  lv: 0,
  type: CARD_TYPE_WEAPON,
  maxLv: 5,
  name: '长矛',
  width: objSize * 2,
  height: objSize * 2,
  step: 40,
  weight: 1,
  getDetail: function getDetail() {
    return ["\u6B66\u5668: ".concat(this.name), "\u7B49\u7EA7: ".concat(this.lv, " / ").concat(this.maxLv), "\u4F24\u5BB3\u500D\u7387: ".concat(lance.ratio, "%"), "\u653B\u51FB\u8DDD\u79BB: ".concat(lance.width / kw), "\u51B7\u5374\u65F6\u95F4: ".concat(lance.cd, "\u79D2"), "\u653B\u51FB\u529B + 10", "\u53EF\u653B\u51FB\u6C34\u5E73\u65B9\u5411\u7684\u654C\u4EBA\u3002"];
  },
  getDescription: function getDescription() {
    return ["\u6B66\u5668: ".concat(this.name), "\u7B49\u7EA7: ".concat(this.lv + 1, " / ").concat(this.maxLv), "\u4F24\u5BB3\u500D\u7387: ".concat(lance.ratio + (this.lv == 0 ? 0 : this.step), "%"), "\u653B\u51FB\u8DDD\u79BB: ".concat(lance.width / kw), "\u51B7\u5374\u65F6\u95F4: ".concat(lance.cd, "\u79D2"), "\u653B\u51FB\u529B + 10", "\u53EF\u653B\u51FB\u6C34\u5E73\u65B9\u5411\u7684\u654C\u4EBA\u3002"];
  },
  remove: function remove() {
    removeFromArr(cardArr, this);
    removeFromArr(player.skill, lance);
    player.atk -= 10;
  },
  get: function get() {
    this.lv++;
    if (isExists(player.cards, this)) {
      this.levelUp();
    } else {
      player.skill.push(lance);
      player.cards.push(this);
      player.atk += 15;
      this.weight++;
    }
  },
  levelUp: function levelUp() {
    lance.ratio += this.step;
    if (this.lv == this.maxLv) {
      removeFromArr(cardArr, this);
    }
  },
  icon: [0xffff, 0x8001, 0x800d, 0x801d, 0x8039, 0x80d1, 0x8061, 0x80a1, 0x8101, 0x8201, 0x8401, 0x8801, 0x9001, 0xa001, 0x8001, 0xffff]
};
function putItemCard() {
  var arr = [];
  arr.push(card_shield);
  arr.push(card_belt);
  arr.push(card_hp_medicine);
  arr.push(card_necklace);
  arr.push(card_tooth);
  arr.push(card_magnet);
  for (var _i2 = 0, _arr = arr; _i2 < _arr.length; _i2++) {
    var card = _arr[_i2];
    card.weight = 1;
    cardArr.push(card);
  }
}
function initCard() {
  clearArr(cardArr);
  cardArr.push(card_lightning);
  cardArr.push(card_fireball);
  cardArr.push(card_deathbook);
  cardArr.push(card_lightsaber);
  cardArr.push(card_poison);
  cardArr.push(card_axe);
  cardArr.push(card_lance);
  var _iterator2 = _createForOfIteratorHelper(cardArr),
    _step2;
  try {
    for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
      var card = _step2.value;
      card.lv = 0;
      if (card.type == CARD_TYPE_WEAPON) {
        card.weight = 1.5;
      } else if (card.type == CARD_TYPE_SUPER_WEAPON) {
        card.weight = 0.1;
      } else {
        card.weight = 1;
      }
    }
  } catch (err) {
    _iterator2.e(err);
  } finally {
    _iterator2.f();
  }
}
initCard();