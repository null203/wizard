function getCards() {
    let pool = [];
    for (let i = 0; i < cardArr.length; i++) {
        pool[i] = cardArr[i];
    }
    let arr = [];
    let len = Math.min(pool.length, 3);
    while (arr.length < len) {
        let totalWeight = pool.reduce((total, card) => total + card.weight, 0)
        let random = Math.random() * totalWeight;
        for (let i = 0; i < pool.length; i++) {
            random -= pool[i].weight;
            if (random <= 0) {
                arr.push(pool[i]);
                pool.splice(i, 1);
                break;
            }
        }
    }
    return arr;
}

const card_lightning = {
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
    getDetail() {
        return [
            `魔法: ${this.name}`,
            `等级: ${this.lv} / ${this.maxLv}`,
            `伤害倍率: ${lightning.ratio}%`,
            `攻击距离: ${lightning.radius / kw}`,
            `持续时间: ${lightning.time}秒`,
            `冷却时间: ${lightning.cd}秒`,
            `发射强力闪电，攻击最近的敌人。`,
        ];
    },
    getDescription() {
        return [
            `魔法: ${this.name}`,
            `等级: ${this.lv + 1} / ${this.maxLv}`,
            `伤害倍率: ${lightning.ratio + (this.lv == 0 ? 0 : this.step)}%`,
            `攻击距离: ${lightning.radius / kw}`,
            `持续时间: ${lightning.time}秒`,
            `冷却时间: ${lightning.cd}秒`,
            `发射强力闪电，攻击最近的敌人。`,
        ];
    },
    remove() {
        removeFromArr(cardArr, this);
        removeFromArr(player.skill, lightning);
    },
    get() {
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
    levelUp() {
        lightning.ratio += this.step;
        if (this.lv == this.maxLv) {
            removeFromArr(cardArr, this);
        }
    },
    icon: [
        0xffff, 0x8001, 0x8001, 0x8001,
        0x83c1, 0x8381, 0x8701, 0x8601,
        0x8fe1, 0x80c1, 0x8181, 0x8101,
        0x8001, 0x8001, 0x8001, 0xffff,
    ]
};

const card_fireball = {
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
    getDetail() {
        return [
            `魔法: ${this.name}`,
            `等级: ${this.lv} / ${this.maxLv}`,
            `伤害倍率: ${fireball.ratio}%`,
            `攻击距离: ${fireball.radius / kw}`,
            `持续时间: ${fireball.time}秒`,
            `冷却时间: ${fireball.cd}秒`,
            `向面朝的方向发射可穿透敌人的火球。`,
        ];
    },
    getDescription() {
        return [
            `魔法: ${this.name}`,
            `等级: ${this.lv + 1} / ${this.maxLv}`,
            `伤害倍率: ${fireball.ratio + (this.lv == 0 ? 0 : this.step)}%`,
            `攻击距离: ${fireball.radius / kw}`,
            `持续时间: ${fireball.time}秒`,
            `冷却时间: ${fireball.cd}秒`,
            `向面朝的方向发射可穿透敌人的火球。`,
        ];
    },
    remove() {
        removeFromArr(cardArr, this);
        removeFromArr(player.skill, fireball);
    },
    get() {
        this.lv++;
        if (isExists(player.cards, this)) {
            this.levelUp();
        } else {
            player.skill.push(fireball);
            player.cards.push(this);
            this.weight++;
        }
    },
    levelUp() {
        fireball.ratio += this.step;
        if (this.lv == this.maxLv) {
            removeFromArr(cardArr, this);
        }
    },
    icon: [
        0xffff, 0x8005, 0x8001, 0x802b,
        0x8001, 0x80a9, 0x8041, 0x8501,
        0x8821, 0x9a01, 0xbc81, 0xbe01,
        0xbe01, 0xbc01, 0x8001, 0xffff,
    ]
};

const card_deathbook = {
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
    getDetail() {
        return [
            `武器: ${this.name}`,
            `等级: ${this.lv} / ${this.maxLv}`,
            `伤害倍率: ${deathbook.ratio}%`,
            `攻击距离: ${deathbook.radius / kw}`,
            `旋转圈数: ${deathbook.maxCount}`,
            `冷却时间: ${deathbook.cd}秒`,
            `攻击力 + 5`,
            `防御力 + 5`,
            `跟随玩家旋转，攻击周围的敌人。`,
        ];
    },
    getDescription() {
        return [
            `武器: ${this.name}`,
            `等级: ${this.lv + 1} / ${this.maxLv}`,
            `伤害倍率: ${deathbook.ratio + (this.lv == 0 ? 0 : this.step)}%`,
            `攻击距离: ${deathbook.radius / kw}`,
            `旋转圈数: ${deathbook.maxCount}`,
            `冷却时间: ${deathbook.cd}秒`,
            `攻击力 + 5`,
            `防御力 + 5`,
            `跟随玩家旋转，攻击周围的敌人。`,
        ];
    },
    remove() {
        removeFromArr(cardArr, this);
        removeFromArr(player.skill, deathbook);
        player.atk -= 5;
        player.def -= 5;
    },
    get() {
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
    levelUp() {
        deathbook.ratio += this.step;
        if (this.lv == this.maxLv) {
            removeFromArr(cardArr, this);
        }
    },
    icon: [
        0xffff, 0x8001, 0x8001, 0x83f9,
        0x8409, 0x8fe9, 0x8829, 0x8929,
        0x8ba9, 0x8929, 0x8929, 0x8831,
        0x8fe1, 0x8001, 0x8001, 0xffff,
    ]
};

const card_lightsaber = {
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
    getDetail() {
        return [
            `武器: ${this.name}`,
            `等级: ${this.lv} / ${this.maxLv}`,
            `伤害倍率: ${lightsaber.ratio}%`,
            `攻击距离: ${lightsaber.height}`,
            `前摇时间: ${lightsaber.preTime}秒`,
            `持续时间: ${lightsaber.time}秒`,
            `冷却时间: ${lightsaber.cd}秒`,
            `攻击力 + 10`,
            `可发动圣剑解放攻击大量敌人。`,
        ];
    },
    getDescription() {
        return [
            `武器: ${this.name}`,
            `等级: ${this.lv + 1} / ${this.maxLv}`,
            `伤害倍率: ${lightsaber.ratio + (this.lv == 0 ? 0 : this.step)}%`,
            `攻击距离: ${lightsaber.height}`,
            `前摇时间: ${lightsaber.preTime}秒`,
            `持续时间: ${lightsaber.time}秒`,
            `冷却时间: ${lightsaber.cd}秒`,
            `攻击力 + 10`,
            `可发动圣剑解放攻击大量敌人。`,
        ];
    },
    remove() {
        removeFromArr(cardArr, this);
        removeFromArr(player.skill, lightsaber);
        player.atk -= 10;
    },
    get() {
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
    levelUp() {
        lightsaber.ratio += this.step;
        if (this.lv == this.maxLv) {
            removeFromArr(cardArr, this);
        }
    },
    icon: [
        0xffff, 0x8001, 0x800d, 0x801d,
        0x8039, 0x8071, 0x80e1, 0x81c1,
        0x8381, 0xa701, 0xba01, 0x8c01,
        0x9401, 0xa601, 0xc001, 0xffff,
    ]
};

const card_shield = {
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
    getDetail() {
        return [
            `装备: ${this.name}`,
            `等级: ${this.lv} / ${this.maxLv}`,
            `防御力 + ${this.def + (this.lv - 1) * this.step}`,
        ];
    },
    getDescription() {
        return [
            `装备: ${this.name}`,
            `等级: ${this.lv + 1} / ${this.maxLv}`,
            `防御力 + ${this.def + this.lv * this.step}`,
        ];
    },
    remove() {
        removeFromArr(cardArr, this);
        player.def -= (this.def + (this.lv - 1) * this.step);
    },
    get() {
        this.lv++;
        if (isExists(player.cards, this)) {
            this.levelUp();
        } else {
            player.cards.push(this);
            player.def += this.def;
            this.weight++;
        }
    },
    levelUp() {
        player.def += this.step;
        if (this.lv == this.maxLv) {
            removeFromArr(cardArr, this);
        }
    },
    icon: [
        0xffff, 0x8001, 0x9ff9, 0x9009,
        0x97e9, 0x90e9, 0x90e9, 0x90e9,
        0x90e9, 0x90e9, 0x90e9, 0x88d1,
        0x84a1, 0x8241, 0x8181, 0xffff,
    ]
};

const card_belt = {
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
    getDetail() {
        return [
            `装备: ${this.name}`,
            `等级: ${this.lv} / ${this.maxLv}`,
            `攻击力 + ${this.atk + (this.lv - 1) * this.step}`,
        ];
    },
    getDescription() {
        return [
            `装备: ${this.name}`,
            `等级: ${this.lv + 1} / ${this.maxLv}`,
            `攻击力 + ${this.atk + this.lv * this.step}`,
        ];
    },
    remove() {
        removeFromArr(cardArr, this);
        player.atk -= (this.atk + (this.lv - 1) * this.step);
    },
    get() {
        this.lv++;
        if (isExists(player.cards, this)) {
            this.levelUp();
        } else {
            player.cards.push(this);
            player.atk += this.atk;
            this.weight++;
        }
    },
    levelUp() {
        player.atk += this.step;
        if (this.lv == this.maxLv) {
            removeFromArr(cardArr, this);
        }
    },
    icon: [
        0xffff, 0x8001, 0x8001, 0x8ff1,
        0x9ff9, 0xb00d, 0xa005, 0xa3c5,
        0xa425, 0xb5ad, 0xb5ad, 0x95a9,
        0x8421, 0x83c1, 0x8001, 0xffff,
    ]
};

const card_hp_medicine = {
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
    getDetail() {
        return [
            `装备: ${this.name}`,
            `等级: ${this.lv} / ${this.maxLv}`,
            `最大生命值 + ${this.lv * this.hp}`,
        ];
    },
    getDescription() {
        return [
            `装备: ${this.name}`,
            `等级: ${this.lv + 1} / ${this.maxLv}`,
            `立即恢复150生命值。`,
            `最大生命值 + ${(this.lv + 1) * this.hp}`,
        ];
    },
    remove() {
        removeFromArr(cardArr, this);
        player.maxHp -= (this.hp * this.lv);
        if (player.hp > player.maxHp) {
            player.hp = player.maxHp;
        }
    },
    get() {
        this.lv++;
        if (isExists(player.cards, this)) {
            this.levelUp();
        } else {
            player.cards.push(this);
            player.maxHp += this.hp;
        }
        player.addHp(150);
    },
    levelUp() {
        player.maxHp += this.hp;
        if (this.lv == this.maxLv) {
            removeFromArr(cardArr, this);
        }
    },
    icon: [
        0xffff, 0x8001, 0x83c1, 0x83c9,
        0x819d, 0x8249, 0x8421, 0x8811,
        0x9009, 0x97e9, 0x97e9, 0x97e9,
        0x9009, 0x8ff1, 0x8001, 0xffff,
    ]
};

const card_poison = {
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
    getDetail() {
        return [
            `武器: ${this.name}`,
            `等级: ${this.lv} / ${this.maxLv}`,
            `伤害倍率: ${poisonsmoke.ratio}%`,
            `攻击范围: ${poisonsmoke.radius / kw}`,
            `飞行时间: ${poisonsmoke.flyTime}秒`,
            `持续时间: ${poisonsmoke.time}秒`,
            `冷却时间: ${poisonsmoke.cd}秒`,
            `攻击力 + 5`,
            `投掷毒瓶，对范围内的敌人造成持续伤害。`,
        ];
    },
    getDescription() {
        return [
            `武器: ${this.name}`,
            `等级: ${this.lv + 1} / ${this.maxLv}`,
            `伤害倍率: ${poisonsmoke.ratio + (this.lv == 0 ? 0 : this.step)}%`,
            `攻击范围: ${poisonsmoke.radius / kw}`,
            `飞行时间: ${poisonsmoke.flyTime}秒`,
            `持续时间: ${poisonsmoke.time}秒`,
            `冷却时间: ${poisonsmoke.cd}秒`,
            `攻击力 + 5`,
            `投掷毒瓶，对范围内的敌人造成持续伤害。`,
        ];
    },
    remove() {
        removeFromArr(cardArr, this);
        removeFromArr(player.skill, poisonsmoke);
        player.atk -= 5;
    },
    get() {
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
    levelUp() {
        poisonsmoke.ratio += this.step;
        if (this.lv == this.maxLv) {
            removeFromArr(cardArr, this);
        }
    },
    icon: [
        0xffff, 0x8001, 0x8181, 0x83c1,
        0x8241, 0x8241, 0x8241, 0x8421,
        0x8891, 0x9209, 0xbffd, 0xbffd,
        0xbffd, 0x9ff9, 0x8001, 0xffff,
    ]
};

const card_tooth = {
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
    getDetail() {
        return [
            `装备: ${this.name}`,
            `等级: ${this.lv} / ${this.maxLv}`,
            `攻击力 + ${(this.lv - 1) * this.step + 5}`,
            `暴击率 + ${(this.lv - 1) * this.step + 5}`,
        ];
    },
    getDescription() {
        return [
            `装备: ${this.name}`,
            `等级: ${this.lv + 1} / ${this.maxLv}`,
            `攻击力 + ${this.lv * this.step + 5}`,
            `暴击率 + ${this.lv * this.step + 5}`,
        ];
    },
    remove() {
        removeFromArr(cardArr, this);
        player.atk -= (5 + (this.lv - 1) * this.step);
        player.crit -= (5 + (this.lv - 1) * this.step);
    },
    get() {
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
    levelUp() {
        player.atk += this.step;
        player.crit += this.step;
        if (this.lv == this.maxLv) {
            removeFromArr(cardArr, this);
        }
    },
    icon: [
        0xffff, 0x8001, 0x80f9, 0x831d,
        0x84fd, 0x8bfd, 0x97f9, 0x97e1,
        0xaf81, 0xae11, 0xac11, 0xb881,
        0xb001, 0xb041, 0xa001, 0xffff,
    ]
};

const card_necklace = {
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
    getDetail() {
        return [
            `装备: ${this.name}`,
            `等级: ${this.lv} / ${this.maxLv}`,
            `攻击力 + ${(this.lv - 1) * this.step + 2}`,
            `防御力 + ${(this.lv - 1) * this.step + 2}`,
            `最大生命值 + ${(this.lv - 1) * this.step + 10}`,
        ];
    },
    getDescription() {
        return [
            `装备: ${this.name}`,
            `等级: ${this.lv + 1} / ${this.maxLv}`,
            `攻击力 + ${this.lv * this.step + 2}`,
            `防御力 + ${this.lv * this.step + 2}`,
            `最大生命值 + ${this.lv * this.step + 10}`,
        ];
    },
    remove() {
        removeFromArr(cardArr, this);
        player.atk -= (2 + (this.lv - 1) * this.step);
        player.def -= (2 + (this.lv - 1) * this.step);
        player.hp -= (10 + (this.lv - 1) * this.step);
    },
    get() {
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
    levelUp() {
        player.atk += this.step;
        player.def += this.step;
        player.maxHp += this.step;
        if (this.lv == this.maxLv) {
            removeFromArr(cardArr, this);
        }
    },
    icon: [
        0xffff, 0x8001, 0x81f1, 0x8609,
        0x8805, 0x9005, 0xa005, 0xa009,
        0xa011, 0x9021, 0x8981, 0x8241,
        0x8241, 0x8181, 0x8001, 0xffff,
    ]
};

const card_axe = {
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
    getDetail() {
        return [
            `武器: ${this.name}`,
            `等级: ${this.lv} / ${this.maxLv}`,
            `伤害倍率: ${axe.ratio}%`,
            `攻击距离: ${axe.distance / kw}`,
            `冷却时间: ${axe.cd}秒`,
            `攻击力 + 15`,
            `回旋攻击玩家朝向的敌人。`,
        ];
    },
    getDescription() {
        return [
            `武器: ${this.name}`,
            `等级: ${this.lv + 1} / ${this.maxLv}`,
            `伤害倍率: ${axe.ratio + (this.lv == 0 ? 0 : this.step)}%`,
            `攻击距离: ${axe.distance / kw}`,
            `冷却时间: ${axe.cd}秒`,
            `攻击力 + 15`,
            `回旋攻击玩家朝向的敌人。`,
        ];
    },
    remove() {
        removeFromArr(cardArr, this);
        removeFromArr(player.skill, axe);
        player.atk -= 15;
    },
    get() {
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
    levelUp() {
        axe.ratio += this.step;
        if (this.lv == this.maxLv) {
            removeFromArr(cardArr, this);
        }
    },
    icon: [
        0xffff, 0x8001, 0x8061, 0x8ce5,
        0x8fcd, 0x878d, 0x87fd, 0x8f9d,
        0x9d3d, 0xb979, 0xf1f9, 0xe7f1,
        0xcfc1, 0x8001, 0x8001, 0xffff,
    ]
};

const card_magnet = {
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
    getDetail() {
        return [
            `装备: ${this.name}`,
            `等级: ${this.lv} / ${this.maxLv}`,
            `拾取距离 + ${this.lv * 10}`,
        ];
    },
    getDescription() {
        return [
            `装备: ${this.name}`,
            `等级: ${this.lv + 1} / ${this.maxLv}`,
            `立即吸取地图上所有的道具。`,
            `拾取距离 + ${(this.lv + 1) * 10}`,
        ];
    },
    remove() {
        removeFromArr(cardArr, this);
        player.pickupDistance -= (this.lv * this.step);
    },
    get() {
        this.lv++;
        if (isExists(player.cards, this)) {
            this.levelUp();
        } else {
            player.cards.push(this);
            player.pickupDistance += this.step;
            this.weight++;
        }
        for (let item of itemPool.getAliveObjects()) {
            item.fly = true;
        }
    },
    levelUp() {
        player.pickupDistance += this.step;
        if (this.lv == this.maxLv) {
            removeFromArr(cardArr, this);
        }
    },
    icon: [
        0xffff, 0x8001, 0x9c39, 0x9c39,
        0x9c39, 0x9429, 0x9429, 0x9429,
        0x9429, 0x9429, 0x9429, 0x93c9,
        0x8811, 0x87e1, 0x8001, 0xffff,
    ]
};

const card_lance = {
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
    getDetail() {
        return [
            `武器: ${this.name}`,
            `等级: ${this.lv} / ${this.maxLv}`,
            `伤害倍率: ${lance.ratio}%`,
            `攻击距离: ${lance.width / kw}`,
            `冷却时间: ${lance.cd}秒`,
            `攻击力 + 10`,
            `可攻击水平方向的敌人。`,
        ];
    },
    getDescription() {
        return [
            `武器: ${this.name}`,
            `等级: ${this.lv + 1} / ${this.maxLv}`,
            `伤害倍率: ${lance.ratio + (this.lv == 0 ? 0 : this.step)}%`,
            `攻击距离: ${lance.width / kw}`,
            `冷却时间: ${lance.cd}秒`,
            `攻击力 + 10`,
            `可攻击水平方向的敌人。`,
        ];
    },
    remove() {
        removeFromArr(cardArr, this);
        removeFromArr(player.skill, lance);
        player.atk -= 10;
    },
    get() {
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
    levelUp() {
        lance.ratio += this.step;
        if (this.lv == this.maxLv) {
            removeFromArr(cardArr, this);
        }
    },
    icon: [
        0xffff, 0x8001, 0x800d, 0x801d,
        0x8039, 0x80d1, 0x8061, 0x80a1,
        0x8101, 0x8201, 0x8401, 0x8801,
        0x9001, 0xa001, 0x8001, 0xffff,
    ]
};

function initCard() {
    clearArr(cardArr);
    cardArr.push(card_lightning);
    cardArr.push(card_fireball);
    cardArr.push(card_deathbook);
    cardArr.push(card_lightsaber);
    cardArr.push(card_shield);
    cardArr.push(card_belt);
    cardArr.push(card_hp_medicine);
    cardArr.push(card_poison);
    cardArr.push(card_tooth);
    cardArr.push(card_necklace);
    cardArr.push(card_axe);
    cardArr.push(card_magnet);
    cardArr.push(card_lance);
    for (let card of cardArr) {
        card.lv = 0;
        if (card.type == CARD_TYPE_WEAPON) {
            card.weight = 1.5;
        } 
        else if (card.type == CARD_TYPE_SUPER_WEAPON) {
            card.weight = 0.1;
        }
        else  {
            card.weight = 1;
        }
    }
}
initCard();
