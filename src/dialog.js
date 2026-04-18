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
        let flag = true;
        for (let d of dialogArr) {
            if (d.show) {
                flag = false;
                break;
            }
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
    let padding = pixelSize * 4;
    context.strokeRect(x + padding, y + padding, width - padding * 2, height - padding * 2);
}

function drawCloseBtn(x, y, size) {
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

function drawCard(x, y, card, selectedCard) {
    const size = pixelSize * 2;
    let color = 'white';
    if (selectedCard) {
        if (selectedCard == card) {
            color = 'white';
        } else {
            color = 'gray';
        }
    }
    card.x = x;
    card.y = y;
    if (card.lv == 0) {
        context.fillStyle = 'white';
        context.textAlign = 'center';
        let fontSize = Math.floor(15 * kw);
        context.font = `${fontSize}px ${fontFamily}`;
        context.fillText('NEW', x + card.width / 2, y - size);
    }
    for (let _y = 0; _y < bitmapHeight; _y++) {
        let row = card.icon[_y];
        for (let _x = 0; _x < bitmapWidth; _x++) {
            let isPixelOn = (row >> (bitmapWidth - 1 - _x)) & 1;
            context.fillStyle = isPixelOn ? color : 'black';
            context.fillRect(
                x + _x * size,
                y + _y * size,
                size,
                size
            );
        }
    }
}

function addBtn(btn, btnArr) {
    const i = btnArr.findIndex(b => b.id === btn.id);
    if (i === -1) {
        btnArr.push(btn);
    } else if (btnArr[i].x !== btn.x || btnArr[i].y !== btn.y) {
        Object.assign(btnArr[i], btn);
    }
}

const mainDialog = Sprite({
    x: 0,
    y: 0,
    width: screenWidth,
    height: screenHeight,
    show: false,
    msgArr: [],
    btnArr: [],
    selectedCard: null,
    open() {
        this.show = true;
        this.btnArr = [];
        this.selectedCard = null;
        playAudio('/audio/click_button');
    },
    close() {
        this.show = false;
    },
    onUp() {
        let pointer = getPointer();
        for (let btn of this.btnArr) {
            if (isClickRect(pointer, btn)) {
                btn.onPressed();
                playAudio('/audio/click_button');
            }
        }
    },
    update() {
        this.msgArr = [
            `等级: ${player.lv}`,
            `经验值: ${player.exp} / ${player.maxExp}`,
            `生命值: ${player.hp} / ${player.maxHp}`,
            `攻击力: ${player.atk}`,
            `防御力: ${player.def}`,
            `暴击率: ${player.crit}%`,
            `DPS: ${getDPS()}`,
        ]
    },
    render() {
        let x = 0;
        let y = 0;
        drawSubWindow(x, y, this.width, this.height);
        let fontSize = Math.floor(16 * kw);
        context.fillStyle = 'white';
        context.font = `${fontSize}px ${fontFamily}`;
        context.lineWidth = 1;
        context.textAlign = 'left';
        x = Math.floor(screenWidth / 2 - objSize * 4);
        y += objSize / 2;
        for (let line of this.msgArr) {
            y += objSize;
            context.fillText(line, x, y);
        }
        y += objSize;
        this.drawCards(x, y);
        this.drawCloseBtn();
    },
    drawCards(x, y) {
        let colNum = 0;
        let rowNum = 0;
        let left = x;
        let top = y;
        let fontSize = Math.floor(16 * kw);
        context.fillStyle = 'white';
        context.font = `${fontSize}px ${fontFamily}`;
        context.lineWidth = 1;
        context.textAlign = 'center';
        for (let card of player.cards) {
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
            addBtn({
                id: card.name,
                x: x,
                y: y,
                width: card.width,
                height: card.height,
                onPressed() {
                    mainDialog.selectedCard = card;
                    openSubDialog(mainDialog, cardDetailDialog);
                }
            }, this.btnArr);
        }
    },
    drawCloseBtn() {
        let startX = screenWidth - objSize - pixelSize * 10;
        let startY = objSize / 2 + pixelSize * 2;
        let size = objSize;
        addBtn({
            id: 'close',
            x: startX,
            y: startY,
            width: size,
            height: size,
            onPressed() {
                closeDialog(mainDialog);
            }
        }, this.btnArr);
        drawCloseBtn(startX, startY, size);
    }
});

const levelUpDialog = Sprite({
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
    open() {
        this.cards = getCards();
        this.selectedCard = this.cards[0];
        this.show = true;
        this.active = false;
        this.timeCount = 0;
        this.btnArr = [];
    },
    close() {
        this.show = false;
    },
    onUp() {
        if (this.active) {
            let pointer = getPointer();
            if (isClickRect(pointer, this.closeBtn)) {
                player.point--;
                closeDialog(this);
                return;
            }
            if (this.resetCount > 0 && isClickRect(pointer, this.resetBtn)) {
                this.resetCount--;
                this.cards = getCards();
                this.selectedCard = this.cards[0];
                playAudio('/audio/click_button');
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
                playAudio('/audio/click_button');
                return;
            }
            for (let card of this.cards) {
                if (isClickRect(pointer, card)) {
                    this.selectedCard = card;
                    playAudio('/audio/click_button');
                }
            }
        }
    },
    update(dt) {
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
    render() {
        let x = 0;
        let y = 0;
        drawSubWindow(x, y, this.width, this.height);
        context.fillStyle = 'white';
        context.font = `${Math.floor(19 * kw)}px ${fontFamily}`;
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
        context.font = `${Math.floor(16 * kw)}px ${fontFamily}`;
        context.textAlign = 'left';
        context.fillStyle = 'white';
        x = objSize * 1.5;
        y += objSize * 2;
        for (let msg of this.msgArr) {
            y += objSize;
            context.fillText(msg, x, y);
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
    drawOkBtn(x, y, width, height) {
        this.okBtn.x = x;
        this.okBtn.y = y;
        this.okBtn.width = width;
        this.okBtn.height = height;
        context.strokeStyle = 'white';
        context.lineWidth = 2 * kw;
        context.strokeRect(x, y, width, height);
        context.fillStyle = 'white';
        context.textAlign = 'center';
        context.font = `${Math.floor(16 * kw)}px ${fontFamily}`;
        context.fillText('确定', screenWidth / 2, y + height * 0.7);
    },
    drawResetBtn(x, y, width, height) {
        this.resetBtn.x = x;
        this.resetBtn.y = y;
        this.resetBtn.width = width;
        this.resetBtn.height = height;
        context.strokeStyle = 'white';
        context.lineWidth = 2 * kw;
        context.strokeRect(x, y, width, height);
        context.fillStyle = 'white';
        context.textAlign = 'center';
        context.font = `${Math.floor(16 * kw)}px ${fontFamily}`;
        context.fillText(`重置(剩余${this.resetCount}次)`, screenWidth / 2, y + height * 0.7);
    },
    drawCloseBtn() {
        this.closeBtn.x = screenWidth - objSize - pixelSize * 10;
        this.closeBtn.y = objSize / 2 + pixelSize * 2;
        this.closeBtn.width = objSize;
        this.closeBtn.height = objSize;
        drawCloseBtn(this.closeBtn.x, this.closeBtn.y, objSize);
    }
});

const startDialog = Sprite({
    x: 0,
    y: 0,
    width: screenWidth,
    height: screenHeight,
    show: false,
    tutorial: true,
    open() {
        this.show = true;
    },
    close() {
        this.show = false;
        initGame();
        playAudio('/audio/click_button');
        if (this.tutorial) {
            openDialog(tutorialDialog);
            this.tutorial = false;
        }
    },
    onUp() {
        closeDialog(this);
    },
    render() {
        context.fillStyle = 'black';
        context.fillRect(0, 0, screenWidth, screenHeight);
        context.fillStyle = 'white';
        context.font = `${Math.floor(30 * kw)}px ${fontFamily}`;
        context.textAlign = 'center';
        context.fillText(`${window.APP_NAME}`, screenWidth / 2, screenHeight / 2 - objSize * 1.5);
        context.font = `${Math.floor(19 * kw)}px ${fontFamily}`;
        context.fillText(`v${window.APP_VERSION}`, screenWidth / 2, screenHeight / 2 - objSize / 3);
        context.fillText('点击开始游戏', screenWidth / 2, screenHeight / 2 + objSize);
    }
});

const gameOverDialog = Sprite({
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
    getText() {
        return [
            `生存时间: ${statusBar.time}`,
            `等级: ${player.lv}`,
            `DPS: ${getDPS()}`,
            `击杀敌人: ${scoreboard.kill}`,
            `击杀BOSS: ${scoreboard.bossKill} / ${bossCount}`,
            `总伤害: ${scoreboard.damage}`,
            `受到伤害: ${scoreboard.receivedDamage}`,
            `破坏: ${scoreboard.break}`,
        ];
    },
    open() {
        this.show = true;
    },
    close() {
        this.show = false;
    },
    onUp() {
        let pointer = getPointer();
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
            playAudio('/audio/click_button');
        }
    },
    render() {
        let x = 0;
        let y = 0;
        context.fillStyle = 'black';
        context.fillRect(x, y, screenWidth, screenHeight);
        x = screenWidth / 2;
        y += objSize;
        context.fillStyle = 'white';
        context.font = `${Math.floor(19 * kw)}px ${fontFamily}`;
        context.lineWidth = 1;
        context.textAlign = 'center';
        context.fillText('游戏结束', x, y);
        context.font = `${Math.floor(16 * kw)}px ${fontFamily}`;
        context.lineWidth = 1;
        context.textAlign = 'left';
        x = Math.floor(screenWidth / 2 - objSize * 4);
        for (let line of this.getText()) {
            y += objSize;
            context.fillText(line, x, y);
        }
        y += objSize / 2;
        this.drawCards(x, y);
        x = (screenWidth - objSize * 5) / 2;
        y += objSize * 9.5;
        this.drawOkBtn(x, y, objSize * 5, objSize);
    },
    drawCards(x, y) {
        let colNum = 0;
        let rowNum = 0;
        let left = x;
        let top = y;
        context.fillStyle = 'white';
        context.font = `${Math.floor(16 * kw)}px ${fontFamily}`;
        context.lineWidth = 1;
        context.textAlign = 'center';
        for (let card of player.cards) {
            x = left + objSize * 3 * colNum;
            y = top + (objSize * 3 * rowNum);
            drawCard(x, y, card);
            context.fillText(card.name, x + objSize, y + objSize * 2.5);
            if (colNum < 2) {
                colNum++;
            } else {
                colNum = 0;
                rowNum++;
            }
        }
    },
    drawOkBtn(x, y, width, height) {
        this.okBtn.x = x;
        this.okBtn.y = y;
        this.okBtn.width = width;
        this.okBtn.height = height;
        context.strokeStyle = 'white';
        context.lineWidth = 2 * kw;
        context.strokeRect(x, y, width, height);
        context.fillStyle = 'white';
        context.textAlign = 'center';
        context.font = `${Math.floor(16 * kw)}px ${fontFamily}`;
        context.fillText('重新开始', screenWidth / 2, y + height * 0.7);
    }
});

const loadDialog = Sprite({
    x: 0,
    y: 0,
    width: screenWidth,
    height: screenHeight,
    show: false,
    numAssets: 0,
    assetsLoaded: 0,
    update() {
        if (this.assetsLoaded == this.numAssets) {
            closeDialog(this);
        }
    },
    open() {
        this.show = true;
    },
    close() {
        this.show = false;
        openDialog(startDialog);
        initHooks();
    },
    render() {
        context.fillStyle = 'black';
        context.fillRect(0, 0, screenWidth, screenHeight);
        context.fillStyle = 'white';
        context.font = `${Math.floor(30 * kw)}px ${fontFamily}`;
        context.textAlign = 'center';
        context.fillText(`Loading... (${this.assetsLoaded} / ${this.numAssets})`, screenWidth / 2, screenHeight / 2);
    }
});

const cardDialog = Sprite({
    x: 0,
    y: 0,
    width: screenWidth,
    height: screenHeight,
    show: false,
    parent: null,
    selectedCard: {},
    msgArr: [
        '最多只能携带9张卡片',
        '要获得新卡片，请选择一张卡片舍弃'
    ],
    btnArr: [],
    onUp() {
        let pointer = getPointer();
        for (let btn of this.btnArr) {
            if (isClickRect(pointer, btn)) {
                btn.onPressed();
                playAudio('/audio/click_button');
            }
        }
    },
    open(parent) {
        this.show = true;
        this.parent = parent;
        this.selectedCard = {};
        clearArr(this.btnArr);
    },
    close() {
        this.show = false;
    },
    render() {
        let x = 0;
        let y = 0;
        drawSubWindow(x, y, this.width, this.height);
        context.fillStyle = 'white';
        context.font = `${Math.floor(16 * kw)}px ${fontFamily}`;
        context.lineWidth = 1;
        context.textAlign = 'left';
        x = Math.floor(screenWidth / 2 - objSize * 4);
        y += objSize;
        for (let line of this.msgArr) {
            y += objSize;
            context.fillText(line, x, y);
        }
        y += objSize;
        this.drawCards(x, y);
        this.drawCloseBtn();
        if (this.selectedCard.name) {
            context.fillStyle = 'white';
            context.font = `${Math.floor(16 * kw)}px ${fontFamily}`;
            context.lineWidth = 1;
            context.textAlign = 'left';
            y += objSize * 10;
            context.fillText(`确定要将 LV.${this.selectedCard.lv} ${this.selectedCard.name}`, x, y);
            y += objSize;
            context.fillText(`替换为 LV.1 ${this.parent.selectedCard.name} 吗？`, x, y);
            x = (screenWidth - objSize * 5) / 2;
            y += objSize;
            this.drawOkBtn(x, y, objSize * 5, objSize);
        }
    },
    drawCards(x, y) {
        let colNum = 0;
        let rowNum = 0;
        let left = x;
        let top = y;
        let fontSize = Math.floor(16 * kw);
        context.font = `${fontSize}px ${fontFamily}`;
        context.lineWidth = 1;
        context.textAlign = 'center';
        for (let card of player.cards) {
            x = left + objSize * 3 * colNum;
            y = top + (objSize * 3 * rowNum);
            drawCard(x, y, card, cardDialog.selectedCard);
            context.fillText(card.name, x + objSize, y + objSize * 2.5);
            if (colNum < 2) {
                colNum++;
            } else {
                colNum = 0;
                rowNum++;
            }
            addBtn({
                id: card.name,
                x: x,
                y: y,
                width: card.width,
                height: card.height,
                onPressed() {
                    cardDialog.selectedCard = card;
                }
            }, this.btnArr);
        }
    },
    drawOkBtn(x, y, width, height) {
        context.strokeStyle = 'white';
        context.lineWidth = 2 * kw;
        context.strokeRect(x, y, width, height);
        context.fillStyle = 'white';
        context.textAlign = 'center';
        context.font = `${Math.floor(16 * kw)}px ${fontFamily}`;
        context.fillText('确定', screenWidth / 2, y + height * 0.7);
        addBtn({
            id: 'ok',
            x: x,
            y: y,
            width: width,
            height: height,
            onPressed() {
                removeFromArr(player.cards, cardDialog.selectedCard);
                cardDialog.selectedCard.remove();
                cardDialog.parent.selectedCard.get();
                player.point--;
                closeSubDialog(cardDialog.parent, cardDialog);
                closeDialog(cardDialog.parent);
            }
        }, this.btnArr);
    },
    drawCloseBtn() {
        let startX = screenWidth - objSize - pixelSize * 10;
        let startY = objSize / 2 + pixelSize * 2;
        let size = objSize;
        addBtn({
            id: 'close',
            x: startX,
            y: startY,
            width: size,
            height: size,
            onPressed() {
                closeSubDialog(cardDialog.parent, cardDialog);
            }
        }, this.btnArr);
        drawCloseBtn(startX, startY, size);
    }
});

const cardDetailDialog = Sprite({
    x: 0,
    y: 0,
    width: screenWidth,
    height: screenHeight,
    show: false,
    parent: null,
    btnArr: [],
    onUp() {
        let pointer = getPointer();
        for (let btn of this.btnArr) {
            if (isClickRect(pointer, btn)) {
                btn.onPressed();
                playAudio('/audio/click_button');
            }
        }
    },
    open(parent) {
        this.show = true;
        this.parent = parent;
    },
    close() {
        this.show = false;
    },
    render() {
        let x = 0;
        let y = 0;
        drawSubWindow(x, y, this.width, this.height);
        context.fillStyle = 'white';
        context.font = `${Math.floor(16 * kw)}px ${fontFamily}`;
        context.lineWidth = 1;
        context.textAlign = 'left';
        x = Math.floor(screenWidth / 2 - objSize * 4);
        y += objSize;
        for (let line of this.parent.selectedCard.getDetail()) {
            y += objSize;
            context.fillText(line, x, y);
        }
        y += objSize;
        this.drawCloseBtn();
    },
    drawCloseBtn() {
        let startX = screenWidth - objSize - pixelSize * 10;
        let startY = objSize / 2 + pixelSize * 2;
        let size = objSize;
        addBtn({
            id: 'close',
            x: startX,
            y: startY,
            width: size,
            height: size,
            onPressed() {
                closeSubDialog(cardDetailDialog.parent, cardDetailDialog);
            }
        }, this.btnArr);
        drawCloseBtn(startX, startY, size);
    }
});

const tutorialDialog = Sprite({
    x: 0,
    y: 0,
    width: screenWidth,
    height: screenHeight,
    show: false,
    msgArr: [],
    btnArr: [],
    okBtn: {
        x: 0,
        y: 0,
        width: 0,
        height: 0
    },
    open() {
        this.show = true;
    },
    close() {
        this.show = false;
    },
    onUp() {
        let pointer = getPointer()
        if (isClickRect(pointer, this.okBtn)) {
            closeDialog(this);
            playAudio('/audio/click_button');
        }
    },
    update() {
        this.msgArr = [
            `[操作说明]`,
            `移动端:触碰屏幕操作虚拟摇杆移动`,
            `PC端:使用 A,W,S,D 或 ↑,↓,←,→ 移动`,
            `[提示]`,
            `移动到敌人附近会自动攻击`,
            `拾取敌人掉的经验球，可以提升等级`,
            `摧毁树/石头，有概率掉落生命恢复`,
            `摧毁火把，必定掉落生命恢复`,
            `生存下去吧...`,
        ]
    },
    render() {
        let x = 0;
        let y = 0;
        drawSubWindow(x, y, this.width, this.height);
        let fontSize = Math.floor(16 * kw);
        context.fillStyle = 'white';
        context.font = `${fontSize}px ${fontFamily}`;
        context.lineWidth = 1;
        context.textAlign = 'left';
        x = Math.floor(screenWidth / 2 - objSize * 5);
        y += objSize / 2;
        for (let line of this.msgArr) {
            y += objSize;
            context.fillText(line, x, y);
        }
        x = screenWidth / 2 - objSize * 5 / 2;
        y += objSize;
        this.drawOkBtn(x, y, objSize * 5, objSize);
    },
    drawOkBtn(x, y, width, height) {
        this.okBtn.x = x;
        this.okBtn.y = y;
        this.okBtn.width = width;
        this.okBtn.height = height;
        context.strokeStyle = 'white';
        context.lineWidth = 2 * kw;
        context.strokeRect(x, y, width, height);
        context.fillStyle = 'white';
        context.textAlign = 'center';
        context.font = `${Math.floor(16 * kw)}px ${fontFamily}`;
        context.fillText('确定', screenWidth / 2, y + height * 0.7);
    },
});

dialogArr.push(gameOverDialog);
dialogArr.push(levelUpDialog);
dialogArr.push(mainDialog);
dialogArr.push(startDialog);
dialogArr.push(loadDialog);
dialogArr.push(cardDialog);
dialogArr.push(cardDetailDialog);
dialogArr.push(tutorialDialog);