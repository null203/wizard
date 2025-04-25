function drawBitmap(direction, data, size = pixelSize) {
    let begin = bitmapHeight * (direction - 1);
    let end = bitmapHeight * direction;
    context.save();
    context.translate(Math.round(screenWidth / 2 - player.x - objSize / 2), Math.round(screenHeight / 2 - player.y - objSize / 2 - objSize * 3));
    for (let y = begin; y < end; y++) {
        let row = data[y];
        for (let x = 0; x < bitmapWidth; x++) {
            let isPixelOn = (row >> (bitmapWidth - 1 - x)) & 1;
            context.fillStyle = isPixelOn ? 'white' : 'rgba(0, 0, 0, 0)';
            context.fillRect(
                x * size + objSize / 2,
                (y - begin) * size + objSize / 2,
                size,
                size
            );
        }
    }
    context.restore();
}

function updateViewport(player) {
    viewport.x = player.x - viewport.width / 2;
    viewport.y = player.y - viewport.height / 2 + objSize * 3;
}

function isVisible(obj) {
    return (
        obj.x < viewport.x + viewport.width + obj.width / 2 &&
        obj.x + obj.width > viewport.x + obj.width / 2 &&
        obj.y < viewport.y + viewport.height + obj.height / 2 &&
        obj.y + obj.height > viewport.y + obj.height / 2
    );
}

function weightedRandom(weights) {
    const entries = Object.entries(weights);
    const totalWeight = entries.reduce((sum, [, weight]) => sum + weight, 0);
    const random = Math.random() * totalWeight;
    let accumulatedWeight = 0;
    for (const [number, weight] of entries) {
        accumulatedWeight += weight;
        if (random < accumulatedWeight) {
            return Number(number);
        }
    }
}

function setDirection(sprite, offsetX, offsetY) {
    let angle = Math.atan2(offsetY, offsetX);
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
    return (
        sprite1.x - sprite1.width / 2 < sprite2.x + sprite2.width / 2 &&
        sprite1.x + sprite1.width / 2 > sprite2.x - sprite2.width / 2 &&
        sprite1.y - sprite1.height / 2 < sprite2.y + sprite2.height / 2 &&
        sprite1.y + sprite1.height / 2 > sprite2.y - sprite2.height / 2
    );
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
    return x < 10 ? `0${x}` : `${x}`;
}

function isClickRect(pointer, rect) {
    return pointer.x >= rect.x &&
        pointer.x <= rect.x + rect.width &&
        pointer.y >= rect.y &&
        pointer.y <= rect.y + rect.height;
}

function isExists(arr, target) {
    for (let obj of arr) {
        if (obj == target) return true;
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
    point.x = Math.pow(1 - t, 3) * point.x +
        3 * Math.pow(1 - t, 2) * t * controlPoint1.x +
        3 * (1 - t) * Math.pow(t, 2) * controlPoint2.x +
        Math.pow(t, 3) * player.x;

    point.y = Math.pow(1 - t, 3) * point.y +
        3 * Math.pow(1 - t, 2) * t * controlPoint1.y +
        3 * (1 - t) * Math.pow(t, 2) * controlPoint2.y +
        Math.pow(t, 3) * player.y;
}

// 判断两条线段是否相交
function linesIntersect(x1, y1, x2, y2, x3, y3, x4, y4) {
    const denom = (y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1);
    if (denom === 0) return false; // 平行或共线

    const ua = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / denom;
    const ub = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / denom;

    return ua >= 0 && ua <= 1 && ub >= 0 && ub <= 1;
}

// 判断线段是否与矩形相交
function doesLineIntersectRect(startX, startY, endX, endY, rect) {
    // 矩形的四个顶点
    const topLeft = { x: rect.x, y: rect.y };
    const topRight = { x: rect.x + rect.width, y: rect.y };
    const bottomLeft = { x: rect.x, y: rect.y + rect.height };
    const bottomRight = { x: rect.x + rect.width, y: rect.y + rect.height };

    // 检查线段是否与矩形的四条边相交
    return (
        linesIntersect(startX, startY, endX, endY, topLeft.x, topLeft.y, topRight.x, topRight.y) ||
        linesIntersect(startX, startY, endX, endY, topRight.x, topRight.y, bottomRight.x, bottomRight.y) ||
        linesIntersect(startX, startY, endX, endY, bottomRight.x, bottomRight.y, bottomLeft.x, bottomLeft.y) ||
        linesIntersect(startX, startY, endX, endY, bottomLeft.x, bottomLeft.y, topLeft.x, topLeft.y)
    );
}