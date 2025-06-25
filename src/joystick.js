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
        context.arc(
            joystick.x + joystick.offsetX,
            joystick.y + joystick.offsetY,
            joystick.innerRadius, 0, 2 * Math.PI
        );
        context.fillStyle = 'gray';
        context.fill();

        context.globalAlpha = 1;
        joystick.frameCount++;
    }
}

function isClickInRectangle(clickX, clickY, rect) {
    return (
        clickX >= rect.x &&
        clickX <= rect.x + rect.width &&
        clickY >= rect.y &&
        clickY <= rect.y + rect.height
    );
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
    if (joystick.enable && joystick.active) {
        for (let touch of event.touches) {
            if (touch.identifier === joystick.touchId) {
                let dx = touch.clientX - joystick.x;
                let dy = touch.clientY - joystick.y;
                let distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < joystick.outerRadius) {
                    joystick.offsetX = dx;
                    joystick.offsetY = dy;
                } else {
                    // 限制在手柄范围内
                    let angle = Math.atan2(dy, dx);
                    joystick.offsetX = Math.cos(angle) * joystick.outerRadius;
                    joystick.offsetY = Math.sin(angle) * joystick.outerRadius;
                }
                joystick.frameCount = 0;
            }
        }
    }
}

function handleTouchEnd(event) {
    if (joystick.enable) {
        for (let touch of event.changedTouches) {
            if (touch.identifier === joystick.touchId) {
                joystick.active = false;
                joystick.offsetX = 0;
                joystick.offsetY = 0;
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

const joystick = {
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