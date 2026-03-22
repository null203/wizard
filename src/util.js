function preprocessBitmap(data) {
    let result = [];
    for (let y = 0; y < data.length; y++) {
        let row = data[y];
        let cols = [];
        for (let x = 0; x < bitmapWidth; x++) {
            if ((row >> (bitmapWidth - 1 - x)) & 1) {
                cols.push(x);
            }
        }
        result.push(cols);
    }
    return result;
}

function createBitmapCanvas(direction, data, size) {
    const parsedData = preprocessBitmap(data);
    const frameStart = (direction - 1) * bitmapHeight;
    const frameEnd = direction * bitmapHeight;
    const canvas = document.createElement('canvas');
    canvas.width = bitmapWidth * size;
    canvas.height = bitmapHeight * size;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'white';
    for (let y = frameStart; y < frameEnd; y++) {
        const row = parsedData[y];
        const drawY = (y - frameStart) * size;

        for (let i = 0; i < row.length; i++) {
            const x = row[i];
            ctx.fillRect(
                x * size,
                drawY,
                size,
                size
            );
        }
    }
    return canvas;
}

function drawBitmap(direction, obj, size = pixelSize) {
    let data = null;
    const key = 'canvas_' + direction + '_' + size;
    if (obj.hasOwnProperty(key)) {
        data = obj[key];
    } else {
        data = createBitmapCanvas(direction, obj.mat, size);
        obj[key] = data;
    }
    const dx = screenWidth / 2 - player.x;
    const dy = screenHeight / 2 - player.y - objSize * 3;
    context.drawImage(
        data,
        dx,
        dy
    );
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
    var i = arr.length;
    while (i--) {
        if (arr[i] === target) return true;
    }
    return false;
}

function removeFromArr(arr, target) {
    arr.splice(arr.indexOf(target), 1);
}

function clearArr(arr) {
    //arr.splice(0, arr.length);
    arr.length = 0;
}

function isClickInRectangle(clickX, clickY, rect) {
    return (
        clickX >= rect.x &&
        clickX <= rect.x + rect.width &&
        clickY >= rect.y &&
        clickY <= rect.y + rect.height
    );
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

function heapPush(heap, node) {
    heap.push(node);
    let i = heap.length - 1;

    while (i > 0) {
        let p = (i - 1) >> 1;
        if (heap[p].cost <= heap[i].cost) break;

        let tmp = heap[p];
        heap[p] = heap[i];
        heap[i] = tmp;

        i = p;
    }
}

function heapPop(heap) {
    if (heap.length === 1) return heap.pop();

    let top = heap[0];
    heap[0] = heap.pop();

    let i = 0;
    let n = heap.length;

    while (true) {
        let l = i * 2 + 1;
        let r = i * 2 + 2;
        let smallest = i;

        if (l < n && heap[l].cost < heap[smallest].cost) smallest = l;
        if (r < n && heap[r].cost < heap[smallest].cost) smallest = r;

        if (smallest === i) break;

        let tmp = heap[i];
        heap[i] = heap[smallest];
        heap[smallest] = tmp;

        i = smallest;
    }

    return top;
}

function getDPS(){
    return Math.floor(scoreboard.damage / Math.max(1, statusBar.m * 60 + statusBar.s));
}

function getEnemyCount() {
    const dps = getDPS();
    const maxDps = 1200;
    const maxCount = 5;
    let count = Math.floor(dps / maxDps * maxCount);
    return Math.max(1, Math.min(maxCount, count));
}