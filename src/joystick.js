const joystick = {
    x: screenWidth / 2,
    y: screenHeight / 1.15,
    outerRadius: joystickOuterRadius,
    innerRadius: 20,
    touchId: null,
    offsetX: 0,
    offsetY: 0,
    renderX: 0,
    renderY: 0,
    enable: true,
    active: false,
    frameCount: 300,
    lastMoveTime: 0
};

function updateJoystick() {
    let dx = joystick.offsetX;
    let dy = joystick.offsetY;
    let max = joystick.outerRadius;
    let dist2 = dx * dx + dy * dy;
    if (dist2 > max * max) {
        let inv = max / Math.sqrt(dist2);
        dx *= inv;
        dy *= inv;
    }
    joystick.renderX = dx;
    joystick.renderY = dy;
}

function renderJoystick() {
    if (joystick.frameCount < 300) {
        context.globalAlpha = 0.4;
        context.beginPath();
        context.arc(joystick.x, joystick.y, joystick.outerRadius, 0, 2 * Math.PI);
        context.strokeStyle = 'gray';
        context.lineWidth = 4;
        context.stroke();

        context.globalAlpha = 0.7;
        context.beginPath();
        context.arc(
            joystick.x + joystick.renderX,
            joystick.y + joystick.renderY,
            joystick.innerRadius, 0, 2 * Math.PI
        );
        context.fillStyle = 'gray';
        context.fill();

        context.globalAlpha = 1;
        joystick.frameCount++;
    }
}

function handleTouchStart(event) {
    if (joystick.enable) {
        for (let touch of event.touches) {
            if (!isClickInRectangle(touch.clientX, touch.clientY, menu)) {
                joystick.x = touch.clientX;
                joystick.y = touch.clientY;
                joystick.touchId = touch.identifier;
                joystick.active = true;
                joystick.frameCount = 0;
            }
        }
    }
}

function handleTouchMove(event) {
    if (!joystick.enable || !joystick.active) return;
    let now = performance.now();
    if (now - joystick.lastMoveTime < 16) return;
    joystick.lastMoveTime = now;
    for (let i = 0; i < event.touches.length; i++) {
        const touch = event.touches[i];
        if (touch.identifier !== joystick.touchId) continue;
        joystick.offsetX = touch.clientX - joystick.x;
        joystick.offsetY = touch.clientY - joystick.y;
        joystick.frameCount = 0;
        break;
    }
}

function handleTouchEnd(event) {
    if (joystick.enable) {
        for (let touch of event.changedTouches) {
            if (touch.identifier === joystick.touchId) {
                joystick.active = false;
                joystick.offsetX = 0;
                joystick.offsetY = 0;
                joystick.renderX = 0;
                joystick.renderY = 0;
            }
        }
    }
}

function keyboard() {
    // 按下方向键或 WASD 键移动
    if (kontra.keyPressed('arrowup') || kontra.keyPressed('w')) {
        joystick.offsetY -= 5;
    }
    if (kontra.keyPressed('arrowdown') || kontra.keyPressed('s')) {
        joystick.offsetY += 5;
    }
    if (kontra.keyPressed('arrowleft') || kontra.keyPressed('a')) {
        joystick.offsetX -= 5;
    }
    if (kontra.keyPressed('arrowright') || kontra.keyPressed('d')) {
        joystick.offsetX += 5;
    }
    let r = joystickOuterRadius - 1;
    if (Math.abs(joystick.offsetX) >= joystickOuterRadius) {
        joystick.offsetX = joystick.offsetX > 0 ? r : -r;
    }
    if (Math.abs(joystick.offsetY) >= joystickOuterRadius) {
        joystick.offsetY = joystick.offsetY > 0 ? r : -r;
    }
    let dx = joystick.renderX;
    let dy = joystick.renderY;
    if (dy < 0) {
        if (dx > 0) {
            player.direction = BACK_RIGHT;
        } else if (dx < 0) {
            player.direction = BACK_LEFT;
        }
    } else if (dx > 0) {
        player.direction = RIGHT;
    } else if (dx < 0) {
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