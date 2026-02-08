/**
 * 租房大冒险 - Pixi.js 游戏引擎
 */
(function () {
    const W = 480;
    const H = 854;

    const app = new PIXI.Application({
        width: W,
        height: H,
        backgroundColor: 0x1a1a2e,
        antialias: true,
        resolution: window.devicePixelRatio || 1,
        autoDensity: true,
    });
    document.getElementById('game-container').appendChild(app.view);

    // ==================== 工具函数 ====================
    function lerp(a, b, t) { return a + (b - a) * t; }
    function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }

    function createRoundedRect(w, h, r, color, alpha) {
        const g = new PIXI.Graphics();
        g.beginFill(color, alpha !== undefined ? alpha : 1);
        g.drawRoundedRect(0, 0, w, h, r);
        g.endFill();
        return g;
    }

    function createText(str, opts) {
        const defaults = {
            fontFamily: 'PingFang SC, Microsoft YaHei, sans-serif',
            fontSize: 18,
            fill: 0xffffff,
            wordWrap: true,
            breakWords: true,
            wordWrapWidth: W - 80,
            lineHeight: 28,
        };
        return new PIXI.Text(str, { ...defaults, ...opts });
    }

    function animateAlpha(obj, from, to, duration, cb) {
        obj.alpha = from;
        const start = performance.now();
        function tick() {
            const t = clamp((performance.now() - start) / duration, 0, 1);
            obj.alpha = lerp(from, to, t);
            if (t < 1) requestAnimationFrame(tick);
            else if (cb) cb();
        }
        tick();
    }

    function animateY(obj, from, to, duration, cb) {
        obj.y = from;
        const start = performance.now();
        function tick() {
            const t = clamp((performance.now() - start) / duration, 0, 1);
            const ease = 1 - Math.pow(1 - t, 3);
            obj.y = lerp(from, to, ease);
            if (t < 1) requestAnimationFrame(tick);
            else if (cb) cb();
        }
        tick();
    }

    function shake(obj, intensity, duration) {
        const origX = obj.x;
        const origY = obj.y;
        const start = performance.now();
        function tick() {
            const t = (performance.now() - start) / duration;
            if (t >= 1) { obj.x = origX; obj.y = origY; return; }
            const d = intensity * (1 - t);
            obj.x = origX + (Math.random() - 0.5) * d;
            obj.y = origY + (Math.random() - 0.5) * d;
            requestAnimationFrame(tick);
        }
        tick();
    }

    // ==================== 音效系统 (Web Audio API) ====================
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    let audioCtx = null;

    function getAudioCtx() {
        if (!audioCtx) audioCtx = new AudioCtx();
        if (audioCtx.state === 'suspended') audioCtx.resume();
        return audioCtx;
    }

    const SFX = {
        // 选项点击音效：短促的"嘀"声
        click() {
            const ctx = getAudioCtx();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(800, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.08);
            gain.gain.setValueAtTime(0.18, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + 0.1);
        },

        // 骰子投掷音效：连续的摇晃声
        diceRoll() {
            const ctx = getAudioCtx();
            const duration = 0.06;
            const bufferSize = ctx.sampleRate * duration;
            const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
            }
            const noise = ctx.createBufferSource();
            noise.buffer = buffer;
            const bandpass = ctx.createBiquadFilter();
            bandpass.type = 'bandpass';
            bandpass.frequency.value = 3000 + Math.random() * 2000;
            bandpass.Q.value = 0.8;
            const gain = ctx.createGain();
            gain.gain.setValueAtTime(0.25, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
            noise.connect(bandpass);
            bandpass.connect(gain);
            gain.connect(ctx.destination);
            noise.start(ctx.currentTime);
        },

        // 成功音效：上升的和弦
        success() {
            const ctx = getAudioCtx();
            const notes = [523, 659, 784];
            notes.forEach((freq, i) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'sine';
                osc.frequency.value = freq;
                gain.gain.setValueAtTime(0, ctx.currentTime + i * 0.1);
                gain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + i * 0.1 + 0.05);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.1 + 0.4);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start(ctx.currentTime + i * 0.1);
                osc.stop(ctx.currentTime + i * 0.1 + 0.4);
            });
        },

        // 大成功音效：更辉煌的上升和弦
        criticalSuccess() {
            const ctx = getAudioCtx();
            const notes = [523, 659, 784, 1047];
            notes.forEach((freq, i) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'triangle';
                osc.frequency.value = freq;
                gain.gain.setValueAtTime(0, ctx.currentTime + i * 0.12);
                gain.gain.linearRampToValueAtTime(0.18, ctx.currentTime + i * 0.12 + 0.05);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.12 + 0.5);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start(ctx.currentTime + i * 0.12);
                osc.stop(ctx.currentTime + i * 0.12 + 0.5);
            });
        },

        // 失败音效：下降的低沉音调
        fail() {
            const ctx = getAudioCtx();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(400, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.4);
            gain.gain.setValueAtTime(0.12, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + 0.5);
        },

        // 大失败音效：更沉重的失败声
        criticalFail() {
            const ctx = getAudioCtx();
            const notes = [350, 250, 150];
            notes.forEach((freq, i) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'sawtooth';
                osc.frequency.value = freq;
                gain.gain.setValueAtTime(0, ctx.currentTime + i * 0.15);
                gain.gain.linearRampToValueAtTime(0.12, ctx.currentTime + i * 0.15 + 0.03);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.15 + 0.4);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start(ctx.currentTime + i * 0.15);
                osc.stop(ctx.currentTime + i * 0.15 + 0.4);
            });
        },

        // 骰子结果揭晓音效
        diceReveal() {
            const ctx = getAudioCtx();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(600, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.15);
            gain.gain.setValueAtTime(0.2, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + 0.2);
        },
    };

    // ==================== 角色立绘系统 ====================
    const portraitTextures = {};
    let portraitsLoaded = false;

    function preloadPortraits(onComplete) {
        const chars = GAME_DATA.characters;
        if (!chars) { portraitsLoaded = true; if (onComplete) onComplete(); return; }
        const keys = Object.keys(chars);
        let loaded = 0;
        const total = keys.length;

        keys.forEach(key => {
            const img = new Image();
            img.onload = function () {
                portraitTextures[key] = PIXI.Texture.from(img);
                loaded++;
                if (loaded >= total) {
                    portraitsLoaded = true;
                    if (onComplete) onComplete();
                }
            };
            img.onerror = function () {
                loaded++;
                if (loaded >= total) {
                    portraitsLoaded = true;
                    if (onComplete) onComplete();
                }
            };
            img.src = chars[key].image;
        });
    }

    // 显示角色立绘 - 返回包含立绘的Container供showEvent使用
    function createPortraitDisplay(charKey) {
        if (!charKey || !portraitTextures[charKey]) return null;

        const container = new PIXI.Container();
        const tex = portraitTextures[charKey];
        const sprite = new PIXI.Sprite(tex);

        // 立绘显示在画面右侧，不遮挡选项按钮和文本区（文本区约 y=155 起）
        const portraitBottomY = 400;
        const portraitTopY = 160;
        const maxH = Math.min(380, portraitBottomY - portraitTopY);
        const scale = maxH / tex.height;
        sprite.scale.set(scale);

        // 水平翻转让角色面向左侧(文本区)
        sprite.anchor.set(1, 1);
        sprite.x = W - 10;
        sprite.y = portraitBottomY;

        // 如果立绘太宽，进一步缩小
        if (sprite.width > W * 0.5) {
            const s2 = (W * 0.5) / tex.width;
            sprite.scale.set(s2);
        }

        sprite.alpha = 0.85;
        container.addChild(sprite);

        // 角色名字标签
        const charInfo = GAME_DATA.characters[charKey];
        if (charInfo) {
            const nameBg = createRoundedRect(charInfo.name.length * 18 + 24, 28, 14, 0x000000, 0.55);
            nameBg.x = sprite.x - sprite.width + 10;
            nameBg.y = sprite.y - sprite.height + 5;
            container.addChild(nameBg);

            const nameText = createText(charInfo.name, { fontSize: 14, fill: 0xffffff, fontWeight: 'bold' });
            nameText.x = nameBg.x + 12;
            nameText.y = nameBg.y + 4;
            container.addChild(nameText);
        }

        return container;
    }

    // 带入场动画的立绘显示
    function showPortraitAnimated(parentContainer, charKey, prevCharKey) {
        if (!charKey) return;

        const portrait = createPortraitDisplay(charKey);
        if (!portrait) return;

        portrait.name = 'portrait';

        // 如果和上一个事件是同一个角色，不做切换动画
        if (charKey === prevCharKey) {
            parentContainer.addChild(portrait);
            return;
        }

        // 从右侧滑入
        const finalX = portrait.x;
        portrait.x = 60;
        portrait.alpha = 0;
        parentContainer.addChild(portrait);

        // 滑入动画
        const start = performance.now();
        const duration = 400;
        function tick() {
            const t = clamp((performance.now() - start) / duration, 0, 1);
            const ease = 1 - Math.pow(1 - t, 3);
            portrait.x = lerp(60, finalX || 0, ease);
            portrait.alpha = lerp(0, 1, ease);
            if (t < 1) requestAnimationFrame(tick);
        }
        tick();
    }

    let previousCharKey = null;

    // ==================== 游戏状态 ====================
    const gameState = {
        charisma: 5,   // 口才
        handy: 3,      // 动手
        energy: 8,     // 精力
        money: 10,     // 财力
        mood: 8,       // 心态
        items: [],
        buffs: [],
        eventCount: 0,
        bossAgentDefeated: false,
        bossLandlordDefeated: false,
        currentBoss: null,
        bossRound: 0,
        bossSuccessCount: 0,
        bossRage: 0,
        bossChecksCompleted: 0,
        history: [],
        score: 0,
    };

    function getAttr(name) {
        let val = gameState[name] || 0;
        gameState.buffs.forEach(b => {
            if (b.effect && b.effect[name]) val += b.effect[name];
        });
        return Math.max(0, val);
    }

    function modAttr(name, delta) {
        gameState[name] = clamp((gameState[name] || 0) + delta, 0, 99);
    }

    function hasItem(id) {
        return gameState.items.some(i => i.id === id);
    }

    function addItem(id) {
        if (!hasItem(id) && GAME_DATA.items[id]) {
            gameState.items.push({ id, ...GAME_DATA.items[id] });
        }
    }

    function removeItem(id) {
        gameState.items = gameState.items.filter(i => i.id !== id);
    }

    function addBuff(buff) {
        gameState.buffs = gameState.buffs.filter(b => b.id !== buff.id);
        gameState.buffs.push({ ...buff });
    }

    function tickBuffs() {
        gameState.buffs = gameState.buffs.filter(b => {
            if (b.duration === -1) return true;
            b.duration--;
            return b.duration > 0;
        });
    }

    function applyEffects(effects) {
        if (!effects) return;
        Object.entries(effects).forEach(([k, v]) => {
            modAttr(k, v);
        });
    }

    function checkGameOver() {
        if (gameState.mood <= 0) return 'mood';
        if (gameState.money <= -5) return 'money';
        return null;
    }

    // ==================== 场景管理 ====================
    const layers = {
        bg: new PIXI.Container(),
        scene: new PIXI.Container(),
        ui: new PIXI.Container(),
        overlay: new PIXI.Container(),
    };
    Object.values(layers).forEach(l => app.stage.addChild(l));

    // ==================== 背景渲染 ====================
    let currentBg = null;

    function drawBackground(sceneName) {
        layers.bg.removeChildren();
        const colors = GAME_DATA.sceneColors[sceneName] || { bg: 0x1a1a2e, accent: 0x2c3e50 };

        const bg = new PIXI.Graphics();
        bg.beginFill(colors.bg);
        bg.drawRect(0, 0, W, H);
        bg.endFill();

        // 装饰元素
        bg.beginFill(colors.accent, 0.15);
        for (let i = 0; i < 6; i++) {
            const x = Math.random() * W;
            const y = Math.random() * H * 0.5;
            const r = 20 + Math.random() * 60;
            bg.drawCircle(x, y, r);
        }
        bg.endFill();

        // 底部装饰线
        bg.beginFill(colors.accent, 0.3);
        bg.drawRect(0, H - 4, W, 4);
        bg.endFill();

        layers.bg.addChild(bg);

        // 场景标题图标
        const sceneIcons = {
            subway: '🚇', phone: '📱', street: '🏙️', coffee: '☕',
            building: '🏢', room_bad: '😱', room_good: '😊', room: '🏠',
            room_night: '🌙', room_morning: '☀️', contract: '📋',
            hallway: '🚪', restaurant: '🍜', market: '🏪', room_check: '🔍'
        };

        const icon = sceneIcons[sceneName] || '🏠';
        // 立绘区域高度约 240px (160-400)，图标占 80% 约 192px
        const iconText = createText(icon, { fontSize: 180 });
        iconText.anchor.set(0.5);
        iconText.x = W / 2;
        iconText.y = 280;
        iconText.alpha = 0.50;
        layers.bg.addChild(iconText);

        currentBg = colors;
    }

    // ==================== UI 组件 ====================

    // 状态栏
    function drawStatusBar() {
        const statusContainer = layers.ui.getChildByName('statusBar');
        if (statusContainer) layers.ui.removeChild(statusContainer);

        const container = new PIXI.Container();
        container.name = 'statusBar';

        // 背景
        const barBg = createRoundedRect(W - 20, 55, 12, 0x000000, 0.6);
        barBg.x = 10;
        barBg.y = 5;
        container.addChild(barBg);

        const attrs = [
            { key: 'charisma', label: '口才', icon: '🗣️', color: 0x3498db },
            { key: 'handy', label: '动手', icon: '🔧', color: 0xe67e22 },
            { key: 'energy', label: '精力', icon: '⚡', color: 0x2ecc71 },
            { key: 'money', label: '财力', icon: '💰', color: 0xf1c40f },
            { key: 'mood', label: '心态', icon: '❤️', color: 0xe74c3c },
        ];

        const startX = 22;
        const spacing = (W - 44) / attrs.length;

        attrs.forEach((attr, i) => {
            const x = startX + i * spacing;
            const val = getAttr(attr.key);

            const iconT = createText(attr.icon, { fontSize: 18 });
            iconT.x = x;
            iconT.y = 10;
            container.addChild(iconT);

            // 标题和数值在同一行
            const labelText = `${attr.label}`;
            const label = createText(labelText, { fontSize: 12, fill: 0xaaaaaa });
            label.x = x + 22;
            label.y = 12;
            container.addChild(label);

            // 属性条
            const barW = spacing - 16;
            const barBgSmall = new PIXI.Graphics();
            barBgSmall.beginFill(0x333333);
            barBgSmall.drawRoundedRect(0, 0, barW, 6, 3);
            barBgSmall.endFill();
            barBgSmall.x = x;
            barBgSmall.y = 38;
            container.addChild(barBgSmall);

            const fillW = Math.max(2, (val / 15) * barW);
            const barFill = new PIXI.Graphics();
            barFill.beginFill(attr.color);
            barFill.drawRoundedRect(0, 0, Math.min(fillW, barW), 6, 3);
            barFill.endFill();
            barFill.x = x;
            barFill.y = 38;
            container.addChild(barFill);
        });

        layers.ui.addChild(container);
    }

    // 道具面板
    let itemPanelOpen = false;

    function toggleItemPanel() {
        if (itemPanelOpen) {
            closeItemPanel();
        } else {
            openItemPanel();
        }
    }

    function openItemPanel() {
        itemPanelOpen = true;
        const existing = layers.overlay.getChildByName('itemPanel');
        if (existing) layers.overlay.removeChild(existing);

        const panel = new PIXI.Container();
        panel.name = 'itemPanel';

        // 遮罩
        const mask = createRoundedRect(W, H, 0, 0x000000, 0.7);
        mask.eventMode = 'static';
        mask.on('pointertap', closeItemPanel);
        panel.addChild(mask);

        // 面板背景
        const panelBg = createRoundedRect(W - 40, 500, 16, 0x2d3436, 0.95);
        panelBg.x = 20;
        panelBg.y = 160;
        panel.addChild(panelBg);

        // 标题
        const title = createText('🎒 我的背包', { fontSize: 22, fill: 0xffffff, fontWeight: 'bold' });
        title.x = 40;
        title.y = 175;
        panel.addChild(title);

        // 道具列表
        if (gameState.items.length === 0) {
            const empty = createText('背包空空如也...', { fontSize: 16, fill: 0x999999 });
            empty.x = 40;
            empty.y = 220;
            panel.addChild(empty);
        } else {
            gameState.items.forEach((item, i) => {
                const y = 220 + i * 50;
                const itemBg = createRoundedRect(W - 80, 42, 8, 0x444444, 0.7);
                itemBg.x = 40;
                itemBg.y = y;
                panel.addChild(itemBg);

                const itemText = createText(`${item.icon} ${item.name}`, { fontSize: 16, fill: 0xffffff });
                itemText.x = 52;
                itemText.y = y + 4;
                panel.addChild(itemText);

                const descText = createText(item.desc, { fontSize: 12, fill: 0xaaaaaa });
                descText.x = 52;
                descText.y = y + 24;
                panel.addChild(descText);
            });
        }

        // Buff区域
        const buffTitle = createText('✨ 状态效果', { fontSize: 18, fill: 0xffffff, fontWeight: 'bold' });
        buffTitle.x = 40;
        buffTitle.y = Math.min(220 + gameState.items.length * 50 + 20, 470);
        panel.addChild(buffTitle);

        if (gameState.buffs.length === 0) {
            const noBuff = createText('暂无状态效果', { fontSize: 14, fill: 0x999999 });
            noBuff.x = 40;
            noBuff.y = buffTitle.y + 30;
            panel.addChild(noBuff);
        } else {
            gameState.buffs.forEach((buff, i) => {
                const y = buffTitle.y + 30 + i * 36;
                const dur = buff.duration === -1 ? '永久' : `${buff.duration}轮`;
                const buffText = createText(`${buff.name} [${dur}]`, { fontSize: 14, fill: 0xf39c12 });
                buffText.x = 52;
                buffText.y = y;
                panel.addChild(buffText);

                const buffDesc = createText(buff.desc, { fontSize: 11, fill: 0x888888 });
                buffDesc.x = 52;
                buffDesc.y = y + 18;
                panel.addChild(buffDesc);
            });
        }

        // 关闭按钮
        const closeBtn = createText('✕ 关闭', { fontSize: 16, fill: 0xff6b6b });
        closeBtn.x = W - 100;
        closeBtn.y = 175;
        closeBtn.eventMode = 'static';
        closeBtn.cursor = 'pointer';
        closeBtn.on('pointertap', closeItemPanel);
        panel.addChild(closeBtn);

        layers.overlay.addChild(panel);
        animateAlpha(panel, 0, 1, 200);
    }

    function closeItemPanel() {
        itemPanelOpen = false;
        const panel = layers.overlay.getChildByName('itemPanel');
        if (panel) {
            animateAlpha(panel, 1, 0, 150, () => {
                layers.overlay.removeChild(panel);
            });
        }
    }

    // ==================== 骰子系统 ====================

    function showDiceRoll(attrName, difficulty, onResult) {
        const overlay = new PIXI.Container();
        overlay.name = 'diceOverlay';

        // 暗色背景
        const mask = createRoundedRect(W, H, 0, 0x000000, 0.75);
        overlay.addChild(mask);

        const attrNames = { charisma: '口才', handy: '动手', energy: '精力', money: '财力', mood: '心态' };
        const attrVal = getAttr(attrName);
        const successRate = attrVal * 10;

        // 标题
        const title = createText('🎲 故事骰子', { fontSize: 28, fill: 0xffffff, fontWeight: 'bold' });
        title.anchor.set(0.5);
        title.x = W / 2;
        title.y = 180;
        overlay.addChild(title);

        // 检定信息
        const info = createText(
            `检定属性：${attrNames[attrName] || attrName}\n属性值：${attrVal}  |  成功率：${successRate}%\n难度：${difficulty}%`,
            { fontSize: 16, fill: 0xcccccc, align: 'center', wordWrapWidth: 300, lineHeight: 26 }
        );
        info.anchor.set(0.5);
        info.x = W / 2;
        info.y = 250;
        overlay.addChild(info);

        // 骰子显示
        const diceContainer = new PIXI.Container();
        diceContainer.x = W / 2;
        diceContainer.y = 380;

        const diceBg = new PIXI.Graphics();
        diceBg.beginFill(0xffffff, 0.1);
        diceBg.drawRoundedRect(-60, -60, 120, 120, 16);
        diceBg.endFill();
        diceContainer.addChild(diceBg);

        const diceText = createText('🎲', { fontSize: 64 });
        diceText.anchor.set(0.5);
        diceContainer.addChild(diceText);

        overlay.addChild(diceContainer);

        // 投掷按钮
        const btnW = 200;
        const btnH = 56;
        const btn = new PIXI.Container();
        btn.x = W / 2 - btnW / 2;
        btn.y = 500;

        const btnBg = createRoundedRect(btnW, btnH, 28, 0xe74c3c);
        btn.addChild(btnBg);

        const btnText = createText('🎲 投掷！', { fontSize: 22, fill: 0xffffff, fontWeight: 'bold' });
        btnText.x = btnW / 2 - btnText.width / 2;
        btnText.y = btnH / 2 - btnText.height / 2;
        btn.addChild(btnText);

        btn.eventMode = 'static';
        btn.cursor = 'pointer';

        btn.on('pointerover', () => { btnBg.tint = 0xdddddd; });
        btn.on('pointerout', () => { btnBg.tint = 0xffffff; });

        btn.on('pointertap', () => {
            btn.eventMode = 'none';
            btn.visible = false;
            SFX.click();
            rollDice(overlay, diceContainer, diceText, attrName, successRate, difficulty, onResult);
        });

        overlay.addChild(btn);
        layers.overlay.addChild(overlay);
        animateAlpha(overlay, 0, 1, 300);
    }

    function rollDice(overlay, container, diceText, attrName, successRate, difficulty, onResult) {
        const emojis = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
        let rollCount = 0;
        const maxRolls = 20;

        const rollInterval = setInterval(() => {
            diceText.text = emojis[Math.floor(Math.random() * 6)];
            shake(container, 8, 50);
            SFX.diceRoll();
            rollCount++;

            if (rollCount >= maxRolls) {
                clearInterval(rollInterval);

                // 最终结果
                const roll = Math.floor(Math.random() * 100) + 1;
                let result, color, resultText;

                // 计算BUFF加成
                let buffBonus = 0;
                gameState.buffs.forEach(b => {
                    if (b.effect && b.effect[attrName]) buffBonus += b.effect[attrName] * 10;
                });
                const finalRate = clamp(successRate + buffBonus, 5, 95);

                if (roll >= 95) {
                    result = 'critical_success';
                    resultText = '🌟 大成功！';
                    color = 0xf1c40f;
                } else if (roll <= finalRate) {
                    result = 'success';
                    resultText = '✅ 成功！';
                    color = 0x2ecc71;
                } else if (roll >= 90) {
                    result = 'critical_fail';
                    resultText = '💀 大失败！';
                    color = 0xe74c3c;
                } else {
                    result = 'fail';
                    resultText = '❌ 失败...';
                    color = 0xe67e22;
                }

                // 显示结果数字
                diceText.text = String(roll);
                diceText.style.fontSize = 48;
                diceText.style.fill = color;

                // 播放结果音效
                SFX.diceReveal();
                setTimeout(() => {
                    if (result === 'critical_success') SFX.criticalSuccess();
                    else if (result === 'success') SFX.success();
                    else if (result === 'critical_fail') SFX.criticalFail();
                    else SFX.fail();
                }, 200);

                const resultLabel = createText(resultText, { fontSize: 32, fill: color, fontWeight: 'bold' });
                resultLabel.anchor.set(0.5);
                resultLabel.x = W / 2;
                resultLabel.y = 480;
                overlay.addChild(resultLabel);

                const detailText = createText(
                    `骰点：${roll}  |  需要：≤${finalRate}` + (buffBonus ? `  (含buff加成${buffBonus > 0 ? '+' : ''}${buffBonus}%)` : ''),
                    { fontSize: 14, fill: 0xaaaaaa, align: 'center', wordWrapWidth: 400 }
                );
                detailText.anchor.set(0.5);
                detailText.x = W / 2;
                detailText.y = 520;
                overlay.addChild(detailText);

                // 大成功/大失败的额外效果
                if (result === 'critical_success') {
                    modAttr(attrName, 1);
                    modAttr('mood', 1);
                } else if (result === 'critical_fail') {
                    modAttr('mood', -2);
                }

                // 继续按钮
                setTimeout(() => {
                    const contBtn = new PIXI.Container();
                    contBtn.x = W / 2 - 100;
                    contBtn.y = 570;

                    const contBg = createRoundedRect(200, 50, 25, color, 0.8);
                    contBtn.addChild(contBg);

                    const contText = createText('继续', { fontSize: 20, fill: 0xffffff, fontWeight: 'bold' });
                    contText.x = 100 - contText.width / 2;
                    contText.y = 25 - contText.height / 2;
                    contBtn.addChild(contText);

                    contBtn.eventMode = 'static';
                    contBtn.cursor = 'pointer';
                    contBtn.on('pointertap', () => {
                        animateAlpha(overlay, 1, 0, 200, () => {
                            layers.overlay.removeChild(overlay);
                            onResult(result === 'success' || result === 'critical_success');
                        });
                    });

                    overlay.addChild(contBtn);
                    animateAlpha(contBtn, 0, 1, 200);
                }, 600);
            }
        }, 60);
    }

    // ==================== 事件渲染 ====================

    let currentEventId = null;
    let isTransitioning = false;

    function showEvent(eventId) {
        if (isTransitioning) return;

        const event = GAME_DATA.events[eventId];
        if (!event) return;

        // 处理结局
        if (eventId === 'ending' || (event.isEnding && event.id === 'ending')) {
            showEnding();
            return;
        }

        isTransitioning = true;
        currentEventId = eventId;
        gameState.history.push(eventId);

        // 应用事件效果
        if (event.effects) applyEffects(event.effects);
        if (event.gainItem) addItem(event.gainItem);
        if (event.loseItem) removeItem(event.loseItem);
        if (event.addBuff) addBuff(event.addBuff);

        // Boss成功判定
        if (event.bossSuccess) {
            gameState.bossSuccessCount++;
        }
        if (event.bossCheckPass) {
            gameState.bossChecksCompleted++;
        }
        if (event.bossRagePlus) {
            gameState.bossRage += event.bossRagePlus;
        }

        // 检查游戏结束
        const gameOver = checkGameOver();
        if (gameOver) {
            isTransitioning = false;
            showGameOver(gameOver);
            return;
        }

        // BOSS结果判定
        if (event.isBossResult) {
            isTransitioning = false;
            handleBossResult();
            return;
        }

        // 事件计数（用于触发Boss）
        if (event.chapter === 'living') {
            gameState.eventCount++;
        }

        tickBuffs();
        drawBackground(event.scene || 'room');
        drawStatusBar();

        // 清空场景层
        const oldScene = layers.scene;
        const newContent = new PIXI.Container();

        // 角色立绘
        const charKey = GAME_DATA.eventCharacters ? GAME_DATA.eventCharacters[eventId] : null;
        if (charKey) {
            showPortraitAnimated(newContent, charKey, previousCharKey);
        }
        previousCharKey = charKey || null;

        // 事件文本容器
        const textPanel = new PIXI.Container();
        textPanel.y = 410;

        // 文本背景
        const textBg = createRoundedRect(W - 30, 260, 14, 0x000000, 0.65);
        textBg.x = 15;
        textPanel.addChild(textBg);

        // 章节标签
        const chapterNames = {
            finding: '🔍 找房篇',
            signing: '📝 签约篇',
            living: '🏠 居住篇',
            boss_agent: '⚔️ BOSS战',
            boss_landlord: '⚔️ 最终BOSS'
        };
        if (event.chapter) {
            const chapterLabel = createText(chapterNames[event.chapter] || '', {
                fontSize: 12,
                fill: 0xf39c12,
                fontWeight: 'bold'
            });
            chapterLabel.x = 30;
            chapterLabel.y = 8;
            textPanel.addChild(chapterLabel);
        }

        // Boss战进度
        if (event.isBoss && gameState.currentBoss) {
            let progressText = '';
            if (gameState.currentBoss === 'agent') {
                progressText = `第 ${gameState.bossRound}/${5} 轮 | 成功 ${gameState.bossSuccessCount}/${3}`;
            } else if (gameState.currentBoss === 'landlord') {
                const checkNames = ['墙面', '家具', '卫生'];
                const current = gameState.bossChecksCompleted;
                progressText = `检查项 ${current + 1}/3 | 怒气：${'🟥'.repeat(gameState.bossRage)}${'⬜'.repeat(5 - gameState.bossRage)}`;
            }
            if (progressText) {
                const progress = createText(progressText, { fontSize: 13, fill: 0xff6b6b });
                progress.x = W - 30 - progress.width;
                progress.y = 8;
                textPanel.addChild(progress);
            }
        }

        // 事件文本
        const eventText = createText(event.text, {
            fontSize: 15,
            fill: 0xf0f0f0,
            wordWrapWidth: W - 80,
            lineHeight: 24,
        });
        eventText.x = 30;
        eventText.y = 28;
        textPanel.addChild(eventText);

        // 自适应文本背景高度，完全跟随文本高度
        const textHeight = Math.max(eventText.height + 45, 100);
        textBg.clear();
        textBg.beginFill(0x000000, 0.65);
        textBg.drawRoundedRect(0, 0, W - 30, textHeight, 14);
        textBg.endFill();

        newContent.addChild(textPanel);

        // 选项按钮
        const optionsContainer = new PIXI.Container();
        const optionsStartY = textPanel.y + textHeight + 12;

        event.options.forEach((opt, i) => {
            // 检查是否需要道具
            if (opt.needItem && !hasItem(opt.needItem)) return;

            const btnGap = 60;
            const btnY = optionsStartY + i * btnGap;
            const btn = new PIXI.Container();
            btn.y = btnY;
            btn.x = 24;

            const btnW = W - 48;
            const btnH = 50;

            const isCheck = !!opt.check;
            const btnColor = isCheck ? 0x6c5ce7 : 0x2d3436;
            const btnBg = createRoundedRect(btnW, btnH, 12, btnColor, 0.85);
            btn.addChild(btnBg);

            // 高亮边框
            const border = new PIXI.Graphics();
            border.lineStyle(2, isCheck ? 0xa29bfe : 0x636e72, 0.6);
            border.drawRoundedRect(0, 0, btnW, btnH, 12);
            btn.addChild(border);

            const btnLabel = createText(opt.text, {
                fontSize: 15,
                fill: 0xffffff,
                wordWrapWidth: btnW - 30,
            });
            btnLabel.x = 16;
            btnLabel.y = btnH / 2 - btnLabel.height / 2;
            btn.addChild(btnLabel);

            // 检定标记
            if (isCheck) {
                const attrNames = { charisma: '口才', handy: '动手', energy: '精力', money: '财力', mood: '心态' };
                const checkLabel = createText(`[${attrNames[opt.check]}检定]`, {
                    fontSize: 11,
                    fill: 0xa29bfe,
                });
                checkLabel.x = btnW - checkLabel.width - 12;
                checkLabel.y = btnH / 2 - checkLabel.height / 2;
                btn.addChild(checkLabel);
            }

            // 道具需求标记
            if (opt.needItem) {
                const itemInfo = GAME_DATA.items[opt.needItem];
                if (itemInfo) {
                    const itemLabel = createText(`[需要: ${itemInfo.icon}${itemInfo.name}]`, {
                        fontSize: 11,
                        fill: 0xf39c12,
                    });
                    itemLabel.x = btnW - itemLabel.width - 12;
                    itemLabel.y = 4;
                    btn.addChild(itemLabel);
                }
            }

            btn.eventMode = 'static';
            btn.cursor = 'pointer';

            btn.on('pointerover', () => { btnBg.tint = 0xcccccc; });
            btn.on('pointerout', () => { btnBg.tint = 0xffffff; });

            btn.on('pointertap', () => {
                if (isTransitioning) return;
                SFX.click();
                handleOptionClick(opt);
            });

            optionsContainer.addChild(btn);
        });

        newContent.addChild(optionsContainer);

        // 背包按钮
        const bagBtn = new PIXI.Container();
        bagBtn.x = W - 70;
        bagBtn.y = 62;

        const bagBg = createRoundedRect(56, 40, 20, 0x000000, 0.5);
        bagBtn.addChild(bagBg);

        const bagText = createText('🎒', { fontSize: 22 });
        bagText.x = 8;
        bagText.y = 6;
        bagBtn.addChild(bagText);

        const bagCount = createText(String(gameState.items.length), { fontSize: 16, fill: 0xf39c12, fontWeight: 'bold' });
        bagCount.x = 36;
        bagCount.y = 10;
        bagBtn.addChild(bagCount);

        bagBtn.eventMode = 'static';
        bagBtn.cursor = 'pointer';
        bagBtn.on('pointertap', toggleItemPanel);
        newContent.addChild(bagBtn);

        // 切换动画
        layers.scene.removeChildren();
        layers.scene.addChild(newContent);
        animateAlpha(newContent, 0, 1, 350, () => {
            isTransitioning = false;
        });
    }

    function handleOptionClick(opt) {
        if (opt.effects) applyEffects(opt.effects);
        if (opt.gainItem) addItem(opt.gainItem);
        if (opt.loseItem) removeItem(opt.loseItem);

        // Boss战轮次推进
        if (opt.nextBossRound) {
            advanceBossRound();
            return;
        }
        if (opt.nextBossCheck) {
            advanceBossCheck();
            return;
        }

        if (opt.check) {
            showDiceRoll(opt.check, opt.difficulty || 50, (success) => {
                if (success) {
                    if (opt.success) {
                        showEvent(opt.success);
                    } else if (opt.next) {
                        showEvent(opt.next);
                    }
                } else {
                    if (opt.fail) {
                        showEvent(opt.fail);
                    } else if (opt.next) {
                        showEvent(opt.next);
                    }
                }
            });
        } else if (opt.next) {
            // 检查是否该触发Boss
            const nextEvent = GAME_DATA.events[opt.next];
            if (nextEvent && nextEvent.chapter === 'living' && !gameState.bossAgentDefeated &&
                gameState.eventCount >= GAME_DATA.bossAgentTriggerCount) {
                startBoss('agent');
                return;
            }
            if (nextEvent && nextEvent.chapter === 'living' && gameState.bossAgentDefeated &&
                !gameState.bossLandlordDefeated && gameState.eventCount >= GAME_DATA.bossLandlordTriggerCount) {
                startBoss('landlord');
                return;
            }
            showEvent(opt.next);
        } else if (opt.next === 'ending') {
            showEnding();
        }
    }

    // ==================== BOSS战逻辑 ====================

    function startBoss(type) {
        gameState.currentBoss = type;
        gameState.bossRound = 1;
        gameState.bossSuccessCount = 0;
        gameState.bossRage = 0;
        gameState.bossChecksCompleted = 0;

        if (type === 'agent') {
            showEvent(9001);
        } else {
            showEvent(9200);
        }
    }

    function advanceBossRound() {
        // 中介Boss
        if (gameState.currentBoss === 'agent') {
            // 检查胜利条件
            if (gameState.bossSuccessCount >= 3) {
                gameState.bossAgentDefeated = true;
                gameState.currentBoss = null;
                showEvent(9100);
                return;
            }

            gameState.bossRound++;

            if (gameState.bossRound > 5) {
                // 撑过5轮也算胜利
                gameState.bossAgentDefeated = true;
                gameState.currentBoss = null;
                showEvent(9100);
                return;
            }

            // 失败：5轮内没有3次成功
            if (gameState.bossRound > 5 - (3 - gameState.bossSuccessCount) + 1) {
                // 还可以继续
            }

            // 选择下一轮事件
            const rounds = GAME_DATA.bossAgentRounds;
            const idx = Math.min(gameState.bossRound - 2, rounds.length - 1);
            showEvent(rounds[idx]);
        }
    }

    function advanceBossCheck() {
        // 房东Boss
        if (gameState.currentBoss === 'landlord') {
            // 检查怒气
            if (gameState.bossRage >= 5) {
                gameState.currentBoss = null;
                showEvent(9302);
                return;
            }

            // 下一项检查：bossChecksCompleted=已通过项数；下一项在数组中的下标 = max(0, bossChecksCompleted-1)
            const checks = GAME_DATA.bossLandlordChecks;
            const nextCheckIndex = Math.max(0, gameState.bossChecksCompleted - 1);

            if (nextCheckIndex >= checks.length) {
                showEvent(9300);
                return;
            }
            showEvent(checks[nextCheckIndex]);
        }
    }

    function handleBossResult() {
        // 房东Boss结果
        if (gameState.bossRage >= 5) {
            showEvent(9302);
        } else {
            gameState.bossLandlordDefeated = true;
            gameState.currentBoss = null;
            showEvent(9301);
        }
    }

    // ==================== 游戏结束 ====================

    function showGameOver(reason) {
        layers.scene.removeChildren();
        layers.overlay.removeChildren();

        const container = new PIXI.Container();

        const bg = createRoundedRect(W, H, 0, 0x0c0c1d, 1);
        container.addChild(bg);

        const icon = createText(reason === 'mood' ? '😭' : '💸', { fontSize: 80 });
        icon.anchor.set(0.5);
        icon.x = W / 2;
        icon.y = 250;
        container.addChild(icon);

        const title = createText('游戏结束', { fontSize: 36, fill: 0xe74c3c, fontWeight: 'bold' });
        title.anchor.set(0.5);
        title.x = W / 2;
        title.y = 340;
        container.addChild(title);

        const msg = reason === 'mood'
            ? '你的心态彻底崩了...\n租房的压力终于把你压垮了。\n也许下次会做出更好的选择。'
            : '你的钱花光了...\n在这个昂贵的城市里，没钱寸步难行。\n下次要精打细算啊。';

        const msgText = createText(msg, {
            fontSize: 18, fill: 0xcccccc, align: 'center',
            wordWrapWidth: 350, lineHeight: 30
        });
        msgText.anchor.set(0.5);
        msgText.x = W / 2;
        msgText.y = 430;
        container.addChild(msgText);

        // 评分
        const score = calcScore();
        const scoreText = createText(`最终评分：${score} 分`, { fontSize: 24, fill: 0xf1c40f, fontWeight: 'bold' });
        scoreText.anchor.set(0.5);
        scoreText.x = W / 2;
        scoreText.y = 530;
        container.addChild(scoreText);

        // 重新开始
        const restartBtn = new PIXI.Container();
        restartBtn.x = W / 2 - 100;
        restartBtn.y = 600;

        const restartBg = createRoundedRect(200, 56, 28, 0xe74c3c, 0.9);
        restartBtn.addChild(restartBg);

        const restartText = createText('🔄 重新开始', { fontSize: 20, fill: 0xffffff, fontWeight: 'bold' });
        restartText.x = 100 - restartText.width / 2;
        restartText.y = 28 - restartText.height / 2;
        restartBtn.addChild(restartText);

        restartBtn.eventMode = 'static';
        restartBtn.cursor = 'pointer';
        restartBtn.on('pointertap', restartGame);
        container.addChild(restartBtn);

        layers.overlay.addChild(container);
        animateAlpha(container, 0, 1, 500);
    }

    function showEnding() {
        layers.scene.removeChildren();
        layers.overlay.removeChildren();

        const container = new PIXI.Container();

        const bg = createRoundedRect(W, H, 0, 0x1a1a2e, 1);
        container.addChild(bg);

        const score = calcScore();
        const rank = score >= 80 ? 'S' : score >= 60 ? 'A' : score >= 40 ? 'B' : score >= 20 ? 'C' : 'D';
        const rankColors = { S: 0xf1c40f, A: 0x2ecc71, B: 0x3498db, C: 0xe67e22, D: 0xe74c3c };

        const titleEmoji = createText('🏆', { fontSize: 72 });
        titleEmoji.anchor.set(0.5);
        titleEmoji.x = W / 2;
        titleEmoji.y = 150;
        container.addChild(titleEmoji);

        const title = createText('租房大冒险\n— 冒险结束 —', {
            fontSize: 30, fill: 0xffffff, fontWeight: 'bold', align: 'center', lineHeight: 40
        });
        title.anchor.set(0.5);
        title.x = W / 2;
        title.y = 240;
        container.addChild(title);

        // 评级
        const rankText = createText(rank, {
            fontSize: 72, fill: rankColors[rank], fontWeight: 'bold'
        });
        rankText.anchor.set(0.5);
        rankText.x = W / 2;
        rankText.y = 340;
        container.addChild(rankText);

        const scoreText = createText(`${score} 分`, { fontSize: 28, fill: 0xffffff });
        scoreText.anchor.set(0.5);
        scoreText.x = W / 2;
        scoreText.y = 395;
        container.addChild(scoreText);

        // 统计
        const stats = [
            `🗣️ 口才: ${gameState.charisma}`,
            `🔧 动手: ${gameState.handy}`,
            `⚡ 精力: ${gameState.energy}`,
            `💰 财力: ${gameState.money}`,
            `❤️ 心态: ${gameState.mood}`,
            `🎒 道具: ${gameState.items.length}`,
            `📖 经历事件: ${gameState.history.length}`,
        ].join('\n');

        const statsText = createText(stats, {
            fontSize: 16, fill: 0xcccccc, lineHeight: 28, align: 'center',
            wordWrapWidth: 300
        });
        statsText.anchor.set(0.5);
        statsText.x = W / 2;
        statsText.y = 520;
        container.addChild(statsText);

        // 评语
        const comments = {
            S: '🌟 完美的租房达人！你已经完全掌握了城市生存法则！',
            A: '👍 优秀的租客！你的经验可以写成攻略了。',
            B: '😊 还不错，虽然吃了些亏但总算学到了东西。',
            C: '😅 勉强生存下来了...下次要更机智一些。',
            D: '😢 租房之路道阻且长，革命尚未成功...'
        };
        const comment = createText(comments[rank], {
            fontSize: 15, fill: 0xf39c12, align: 'center',
            wordWrapWidth: 360, lineHeight: 24
        });
        comment.anchor.set(0.5);
        comment.x = W / 2;
        comment.y = 660;
        container.addChild(comment);

        // 重新开始按钮
        const restartBtn = new PIXI.Container();
        restartBtn.x = W / 2 - 100;
        restartBtn.y = 720;

        const restartBg = createRoundedRect(200, 56, 28, 0x6c5ce7, 0.9);
        restartBtn.addChild(restartBg);

        const restartLabel = createText('🔄 再来一次', { fontSize: 20, fill: 0xffffff, fontWeight: 'bold' });
        restartLabel.x = 100 - restartLabel.width / 2;
        restartLabel.y = 28 - restartLabel.height / 2;
        restartBtn.addChild(restartLabel);

        restartBtn.eventMode = 'static';
        restartBtn.cursor = 'pointer';
        restartBtn.on('pointertap', restartGame);
        container.addChild(restartBtn);

        layers.overlay.addChild(container);
        animateAlpha(container, 0, 1, 600);
    }

    function calcScore() {
        let score = 0;
        score += gameState.charisma * 3;
        score += gameState.handy * 3;
        score += gameState.energy * 2;
        score += gameState.money * 2;
        score += gameState.mood * 3;
        score += gameState.items.length * 2;
        if (gameState.bossAgentDefeated) score += 15;
        if (gameState.bossLandlordDefeated) score += 25;
        return Math.min(100, Math.max(0, score));
    }

    // ==================== 开始画面 ====================

    function showTitleScreen() {
        layers.bg.removeChildren();
        layers.scene.removeChildren();
        layers.ui.removeChildren();
        layers.overlay.removeChildren();

        const bg = new PIXI.Graphics();
        bg.beginFill(0x1a1a2e);
        bg.drawRect(0, 0, W, H);
        bg.endFill();
        layers.bg.addChild(bg);

        // 动态背景粒子
        const particles = new PIXI.Container();
        for (let i = 0; i < 30; i++) {
            const p = new PIXI.Graphics();
            p.beginFill(0xffffff, 0.1 + Math.random() * 0.2);
            p.drawCircle(0, 0, 2 + Math.random() * 4);
            p.endFill();
            p.x = Math.random() * W;
            p.y = Math.random() * H;
            p._speed = 0.3 + Math.random() * 0.7;
            particles.addChild(p);
        }
        layers.bg.addChild(particles);

        app.ticker.add(function particleTick() {
            particles.children.forEach(p => {
                p.y -= p._speed;
                if (p.y < -10) { p.y = H + 10; p.x = Math.random() * W; }
            });
            if (!particles.parent) app.ticker.remove(particleTick);
        });

        const container = new PIXI.Container();

        // 标题
        const titleIcon = createText('🏠', { fontSize: 80 });
        titleIcon.anchor.set(0.5);
        titleIcon.x = W / 2;
        titleIcon.y = 200;
        container.addChild(titleIcon);

        const title = createText('租房大冒险', {
            fontSize: 42, fill: 0xffffff, fontWeight: 'bold'
        });
        title.anchor.set(0.5);
        title.x = W / 2;
        title.y = 300;
        container.addChild(title);

        const subtitle = createText('Rogue Rental', {
            fontSize: 20, fill: 0x888888, fontStyle: 'italic'
        });
        subtitle.anchor.set(0.5);
        subtitle.x = W / 2;
        subtitle.y = 350;
        container.addChild(subtitle);

        const desc = createText(
            '在这座城市里，找到一个合适的住所\n是一场真正的冒险...\n\n用你的智慧和勇气\n战胜黑心中介和刁钻房东！',
            {
                fontSize: 16, fill: 0xaaaaaa, align: 'center',
                wordWrapWidth: 340, lineHeight: 28
            }
        );
        desc.anchor.set(0.5);
        desc.x = W / 2;
        desc.y = 450;
        container.addChild(desc);

        // 开始按钮
        const startBtn = new PIXI.Container();
        startBtn.x = W / 2 - 120;
        startBtn.y = 590;

        const startBg = createRoundedRect(240, 64, 32, 0xe74c3c, 0.9);
        startBtn.addChild(startBg);

        const startText = createText('🎲 开始冒险！', { fontSize: 24, fill: 0xffffff, fontWeight: 'bold' });
        startText.x = 120 - startText.width / 2;
        startText.y = 32 - startText.height / 2;
        startBtn.addChild(startText);

        // 按钮呼吸动画
        let breathDir = 1;
        app.ticker.add(function breathe() {
            if (!startBtn.parent) { app.ticker.remove(breathe); return; }
            startBtn.scale.x += 0.0008 * breathDir;
            startBtn.scale.y += 0.0008 * breathDir;
            if (startBtn.scale.x > 1.05) breathDir = -1;
            if (startBtn.scale.x < 0.97) breathDir = 1;
        });

        startBtn.eventMode = 'static';
        startBtn.cursor = 'pointer';
        startBtn.pivot.set(0, 0);

        startBtn.on('pointerover', () => { startBg.tint = 0xdddddd; });
        startBtn.on('pointerout', () => { startBg.tint = 0xffffff; });

        startBtn.on('pointertap', () => {
            SFX.click();
            animateAlpha(container, 1, 0, 400, () => {
                layers.scene.removeChildren();
                layers.bg.removeChildren();
                showEvent(1001);
            });
        });

        container.addChild(startBtn);

        // Debug: 快速跳转Boss战（仅localhost显示）
        if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
        const debugBtnW = 180;
        const debugBtnH = 40;

        // 中介Boss按钮
        const debugAgentBtn = new PIXI.Container();
        debugAgentBtn.x = W / 2 - debugBtnW - 5;
        debugAgentBtn.y = 670;
        const debugAgentBg = createRoundedRect(debugBtnW, debugBtnH, 16, 0x6c5ce7, 0.6);
        debugAgentBtn.addChild(debugAgentBg);
        const debugAgentText = createText('🐛 中介Boss', { fontSize: 14, fill: 0xffffff });
        debugAgentText.x = debugBtnW / 2 - debugAgentText.width / 2;
        debugAgentText.y = debugBtnH / 2 - debugAgentText.height / 2;
        debugAgentBtn.addChild(debugAgentText);
        debugAgentBtn.eventMode = 'static';
        debugAgentBtn.cursor = 'pointer';
        debugAgentBtn.on('pointertap', () => {
            SFX.click();
            animateAlpha(container, 1, 0, 300, () => {
                layers.scene.removeChildren();
                layers.bg.removeChildren();
                startBoss('agent');
            });
        });
        container.addChild(debugAgentBtn);

        // 房东Boss按钮
        const debugLandlordBtn = new PIXI.Container();
        debugLandlordBtn.x = W / 2 + 5;
        debugLandlordBtn.y = 670;
        const debugLandlordBg = createRoundedRect(debugBtnW, debugBtnH, 16, 0xe74c3c, 0.6);
        debugLandlordBtn.addChild(debugLandlordBg);
        const debugLandlordText = createText('🐛 房东Boss', { fontSize: 14, fill: 0xffffff });
        debugLandlordText.x = debugBtnW / 2 - debugLandlordText.width / 2;
        debugLandlordText.y = debugBtnH / 2 - debugLandlordText.height / 2;
        debugLandlordBtn.addChild(debugLandlordText);
        debugLandlordBtn.eventMode = 'static';
        debugLandlordBtn.cursor = 'pointer';
        debugLandlordBtn.on('pointertap', () => {
            SFX.click();
            animateAlpha(container, 1, 0, 300, () => {
                layers.scene.removeChildren();
                layers.bg.removeChildren();
                startBoss('landlord');
            });
        });
        container.addChild(debugLandlordBtn);
        }

        // 版本信息
        const ver = createText('v0.1.0 原型版', { fontSize: 12, fill: 0x555555 });
        ver.anchor.set(0.5);
        ver.x = W / 2;
        ver.y = H - 30;
        container.addChild(ver);

        layers.scene.addChild(container);
        animateAlpha(container, 0, 1, 600);
    }

    // ==================== 重新开始 ====================

    function restartGame() {
        gameState.charisma = 5;
        gameState.handy = 3;
        gameState.energy = 8;
        gameState.money = 10;
        gameState.mood = 8;
        gameState.items = [];
        gameState.buffs = [];
        gameState.eventCount = 0;
        gameState.bossAgentDefeated = false;
        gameState.bossLandlordDefeated = false;
        gameState.currentBoss = null;
        gameState.bossRound = 0;
        gameState.bossSuccessCount = 0;
        gameState.bossRage = 0;
        gameState.bossChecksCompleted = 0;
        gameState.history = [];
        gameState.score = 0;

        layers.bg.removeChildren();
        layers.scene.removeChildren();
        layers.ui.removeChildren();
        layers.overlay.removeChildren();
        isTransitioning = false;
        currentEventId = null;

        showTitleScreen();
    }

    // ==================== 启动 ====================
    // 预加载角色立绘后再显示标题画面
    preloadPortraits(() => {
        showTitleScreen();
    });

})();
