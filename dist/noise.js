"use strict";

function fade(t) {
  return t * t * t * (t * (t * 6 - 15) + 10);
}
function lerp(a, b, t) {
  return a + t * (b - a);
}
function grad(hash, x, y) {
  var h = hash & 3;
  var u = h < 2 ? x : y;
  var v = h < 2 ? y : x;
  return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
}

// 初始化随机排列数组，用于生成随机梯度方向
var permutation = [];
for (var i = 0; i < 256; i++) permutation.push(i);
permutation.sort(function () {
  return Math.random() - 0.5;
});
var p = [].concat(permutation, permutation); // 创建重复的排列数组，方便处理边界情况

function noise(x, y) {
  var X = Math.floor(x) & 255; // 获得x的整数部分并进行模运算
  var Y = Math.floor(y) & 255; // 获得y的整数部分并进行模运算
  x -= Math.floor(x); // 保留x的小数部分
  y -= Math.floor(y); // 保留y的小数部分

  var u = fade(x);
  var v = fade(y);

  // 获取梯度方向
  var aa = p[p[X] + Y];
  var ab = p[p[X] + Y + 1];
  var ba = p[p[X + 1] + Y];
  var bb = p[p[X + 1] + Y + 1];

  // 计算每个顶点的贡献值，并进行插值
  var gradAA = grad(aa, x, y);
  var gradBA = grad(ba, x - 1, y);
  var gradAB = grad(ab, x, y - 1);
  var gradBB = grad(bb, x - 1, y - 1);
  var lerpX1 = lerp(gradAA, gradBA, u);
  var lerpX2 = lerp(gradAB, gradBB, u);
  return lerp(lerpX1, lerpX2, v);
}
function octaveNoise(x, y, octaves, persistence) {
  var total = 0;
  var frequency = 1;
  var amplitude = 1;
  var maxValue = 0; // 用于归一化结果

  for (var _i = 0; _i < octaves; _i++) {
    total += noise(x * frequency, y * frequency) * amplitude;
    maxValue += amplitude;
    amplitude *= persistence;
    frequency *= 2;
  }
  return (total / maxValue + 1) / 2; // 归一化结果，使结果在0-1之间
}
function generatePoints() {
  var noiseScale = 0.1; // 控制噪声缩放，值越小生成的区域越大

  var octaves = 5; // 噪声叠加次数
  var persistence = 0.6; // 每个叠加的影响系数
  var lowThreshold = 0.37; // 较低阈值，决定生成树木的基本密度
  var highThreshold = 0.5; // 较高阈值，用于保留空白区域

  var points = [];
  for (var x = objSize / 2; x < worldLimit - objSize / 2; x += objSize) {
    for (var y = objSize / 2; y < worldLimit - objSize / 2; y += objSize) {
      var value = octaveNoise(x * noiseScale, y * noiseScale, octaves, persistence);
      value = Math.pow(value, 2);
      if (value > lowThreshold && value < highThreshold) {
        points.push({
          x: x,
          y: y
        });
      }
    }
  }
  return points;
}