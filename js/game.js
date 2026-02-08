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

    // ==================== 投票统计 API ====================
    const VOTE_API = (() => {
        // 自动检测 API 地址：同源时用相对路径，否则用 localhost:3000
        const base = (location.port === '3000' || location.protocol === 'file:')
            ? 'http://localhost:3000' : '';

        async function fetchVotes(eventId) {
            try {
                const res = await fetch(`${base}/api/votes?eventId=${eventId}`);
                if (!res.ok) return null;
                return await res.json();
            } catch (e) {
                return null;
            }
        }

        async function submitVote(eventId, optionIndex) {
            try {
                const res = await fetch(`${base}/api/vote`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ eventId, optionIndex }),
                });
                if (!res.ok) return null;
                return await res.json();
            } catch (e) {
                return null;
            }
        }

        return { fetchVotes, submitVote };
    })();

    // ==================== 弹幕吐槽 API ====================
    const DANMAKU_API = (() => {
        const base = (location.port === '3000' || location.protocol === 'file:')
            ? 'http://localhost:3000' : '';

        async function fetchDanmaku(eventId) {
            try {
                const res = await fetch(`${base}/api/danmaku?eventId=${eventId}`);
                if (!res.ok) return [];
                const data = await res.json();
                return data.danmaku || [];
            } catch (e) {
                return [];
            }
        }

        async function submitDanmaku(eventId, text) {
            try {
                const res = await fetch(`${base}/api/danmaku`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ eventId, text }),
                });
                if (!res.ok) return false;
                return true;
            } catch (e) {
                return false;
            }
        }

        return { fetchDanmaku, submitDanmaku };
    })();

    // ==================== 浮动Tips系统 ====================
    const attrNameMap = { charisma: '口才', handy: '动手', energy: '精力', money: '财力', mood: '心态' };
    const attrColorMap = { charisma: 0x3498db, handy: 0xe67e22, energy: 0x2ecc71, money: 0xf1c40f, mood: 0xe74c3c };
    let tipsQueue = [];
    let tipsPlaying = false;

    function showFloatingTip(text, color) {
        const tip = createText(text, {
            fontSize: 22,
            fill: color,
            fontWeight: 'bold',
            stroke: 0x000000,
            strokeThickness: 3,
            align: 'center',
        });
        tip.anchor.set(0.5);
        tip.x = W / 2;
        tip.y = 370;
        tip.alpha = 0;
        layers.overlay.addChild(tip);

        const startY = 370;
        const endY = 300;
        const start = performance.now();
        const duration = 1200;

        // 400ms后触发下一个Tip（不等当前完全消失）
        setTimeout(playNextTip, 400);

        function tick() {
            const elapsed = performance.now() - start;
            const t = clamp(elapsed / duration, 0, 1);

            // 上升
            tip.y = lerp(startY, endY, t);

            // 淡入淡出：前15%淡入，后40%淡出
            if (t < 0.15) {
                tip.alpha = t / 0.15;
            } else if (t > 0.6) {
                tip.alpha = 1 - (t - 0.6) / 0.4;
            } else {
                tip.alpha = 1;
            }

            // 轻微缩放弹跳
            if (t < 0.15) {
                const bounce = 1 + 0.2 * Math.sin(t / 0.15 * Math.PI);
                tip.scale.set(bounce);
            } else {
                tip.scale.set(1);
            }

            if (t < 1) {
                requestAnimationFrame(tick);
            } else {
                if (tip.parent) tip.parent.removeChild(tip);
            }
        }
        tick();
    }

    function playNextTip() {
        if (tipsQueue.length === 0) {
            tipsPlaying = false;
            return;
        }
        const { text, color } = tipsQueue.shift();
        showFloatingTip(text, color);
    }

    function queueAttrTips(effects) {
        if (!effects) return;
        Object.entries(effects).forEach(([k, v]) => {
            if (v === 0) return;
            const name = attrNameMap[k];
            if (!name) return;
            const sign = v > 0 ? '+' : '';
            const color = v > 0 ? (attrColorMap[k] || 0x2ecc71) : 0xe74c3c;
            const icon = v > 0 ? '▲' : '▼';
            tipsQueue.push({ text: `${icon} ${name} ${sign}${v}`, color });
        });
        if (!tipsPlaying && tipsQueue.length > 0) {
            tipsPlaying = true;
            playNextTip();
        }
    }

    function queueItemTip(text) {
        tipsQueue.push({ text, color: 0xf39c12 });
        if (!tipsPlaying && tipsQueue.length > 0) {
            tipsPlaying = true;
            playNextTip();
        }
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

    // ==================== 全屏背景图系统 ====================
    const thumbTextures = {};

    function preloadThumbs(onComplete) {
        const thumbs = {
            start: 'asset/thumbs/start.jpeg',
            finish_good: 'asset/thumbs/finish_good.jpeg',
            finish_bad: 'asset/thumbs/finish_bad.jpeg',
        };
        const keys = Object.keys(thumbs);
        let loaded = 0;
        const total = keys.length;

        keys.forEach(key => {
            const img = new Image();
            img.onload = function () {
                thumbTextures[key] = PIXI.Texture.from(img);
                loaded++;
                if (loaded >= total && onComplete) onComplete();
            };
            img.onerror = function () {
                loaded++;
                if (loaded >= total && onComplete) onComplete();
            };
            img.src = thumbs[key];
        });
    }

    function createFullscreenSprite(textureKey) {
        const tex = thumbTextures[textureKey];
        if (!tex) return null;
        const sprite = new PIXI.Sprite(tex);
        // Cover模式：撑满整个画布，居中裁切
        const scaleX = W / tex.width;
        const scaleY = H / tex.height;
        const scale = Math.max(scaleX, scaleY);
        sprite.scale.set(scale);
        sprite.anchor.set(0.5);
        sprite.x = W / 2;
        sprite.y = H / 2;
        return sprite;
    }

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
        branchQueue: [],
        branchQueueIndex: 0,
    };

    function getAttr(name) {
        let val = gameState[name] || 0;
        gameState.buffs.forEach(b => {
            if (b.effect && b.effect[name]) val += b.effect[name];
        });
        return Math.max(0, val);
    }

    function modAttr(name, delta) {
        gameState[name] = clamp((gameState[name] || 0) + delta, 0, 10);
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

    function applyEffects(effects, showTips) {
        if (!effects) return;
        Object.entries(effects).forEach(([k, v]) => {
            modAttr(k, v);
        });
        if (showTips !== false) queueAttrTips(effects);
    }

    function checkGameOver() {
        if (gameState.mood <= 1) return 'mood';
        if (gameState.money <= 1) return 'money';
        if (gameState.energy <= 1) return 'energy';
        if (gameState.charisma <= 1) return 'charisma';
        if (gameState.handy <= 1) return 'handy';
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

        const panelX = 20;
        const panelY = 100;
        const panelW = W - 40;
        const panelMaxH = H - 160; // 最大可用高度
        const contentPadding = 16;

        // 构建内容容器（先计算总高度）
        const content = new PIXI.Container();
        let cy = 0;

        // 标题
        const title = createText('🎒 我的背包', { fontSize: 22, fill: 0xffffff, fontWeight: 'bold' });
        title.x = 20;
        title.y = cy;
        content.addChild(title);
        cy += 40;

        // 道具列表
        if (gameState.items.length === 0) {
            const empty = createText('背包空空如也...', { fontSize: 16, fill: 0x999999 });
            empty.x = 20;
            empty.y = cy;
            content.addChild(empty);
            cy += 32;
        } else {
            gameState.items.forEach((item, i) => {
                const itemBg = createRoundedRect(panelW - 40, 42, 8, 0x444444, 0.7);
                itemBg.x = 20;
                itemBg.y = cy;
                content.addChild(itemBg);

                const itemText = createText(`${item.icon} ${item.name}`, { fontSize: 16, fill: 0xffffff, wordWrapWidth: panelW - 80 });
                itemText.x = 32;
                itemText.y = cy + 4;
                content.addChild(itemText);

                const descText = createText(item.desc, { fontSize: 12, fill: 0xaaaaaa, wordWrapWidth: panelW - 80 });
                descText.x = 32;
                descText.y = cy + 24;
                content.addChild(descText);

                cy += 50;
            });
        }

        // 分割线
        cy += 8;
        const divider = new PIXI.Graphics();
        divider.beginFill(0x555555, 0.5);
        divider.drawRect(20, cy, panelW - 40, 1);
        divider.endFill();
        content.addChild(divider);
        cy += 12;

        // Buff区域
        const buffTitle = createText('✨ 状态效果', { fontSize: 18, fill: 0xffffff, fontWeight: 'bold' });
        buffTitle.x = 20;
        buffTitle.y = cy;
        content.addChild(buffTitle);
        cy += 30;

        if (gameState.buffs.length === 0) {
            const noBuff = createText('暂无状态效果', { fontSize: 14, fill: 0x999999 });
            noBuff.x = 20;
            noBuff.y = cy;
            content.addChild(noBuff);
            cy += 28;
        } else {
            gameState.buffs.forEach((buff, i) => {
                const dur = buff.duration === -1 ? '永久' : `${buff.duration}轮`;
                const buffText = createText(`${buff.name} [${dur}]`, { fontSize: 14, fill: 0xf39c12, wordWrapWidth: panelW - 80 });
                buffText.x = 32;
                buffText.y = cy;
                content.addChild(buffText);

                const buffDesc = createText(buff.desc, { fontSize: 11, fill: 0x888888, wordWrapWidth: panelW - 80 });
                buffDesc.x = 32;
                buffDesc.y = cy + 18;
                content.addChild(buffDesc);

                cy += 40;
            });
        }

        const contentTotalH = cy + contentPadding;
        const panelH = Math.min(contentTotalH + contentPadding * 2 + 40, panelMaxH);
        const scrollable = contentTotalH > panelH - 40;

        // 面板背景
        const panelBg = createRoundedRect(panelW, panelH, 16, 0x2d3436, 0.95);
        panelBg.x = panelX;
        panelBg.y = panelY;
        panel.addChild(panelBg);

        // 内容区域（可滚动）
        content.x = panelX;
        content.y = panelY + contentPadding;
        panel.addChild(content);

        // 如果内容超出面板，用 mask 裁剪 + 拖拽滚动
        if (scrollable) {
            const clipMask = new PIXI.Graphics();
            clipMask.beginFill(0xffffff);
            clipMask.drawRoundedRect(panelX, panelY + contentPadding, panelW, panelH - contentPadding * 2 - 36, 12);
            clipMask.endFill();
            panel.addChild(clipMask);
            content.mask = clipMask;

            const minY = panelY + contentPadding - (contentTotalH - (panelH - contentPadding * 2 - 36));
            const maxY = panelY + contentPadding;

            // 滚动条指示
            const scrollBarH = Math.max(30, (panelH - 80) * ((panelH - 80) / contentTotalH));
            const scrollTrackH = panelH - 80;
            const scrollBar = new PIXI.Graphics();
            scrollBar.beginFill(0xffffff, 0.3);
            scrollBar.drawRoundedRect(0, 0, 4, scrollBarH, 2);
            scrollBar.endFill();
            scrollBar.x = panelX + panelW - 10;
            scrollBar.y = panelY + 40;
            panel.addChild(scrollBar);

            function updateScrollBar() {
                const progress = (maxY - content.y) / (maxY - minY);
                scrollBar.y = panelY + 40 + progress * (scrollTrackH - scrollBarH);
            }

            // 触摸/鼠标拖拽滚动
            let dragging = false;
            let dragStartY = 0;
            let contentStartY = 0;

            panelBg.eventMode = 'static';
            panelBg.on('pointerdown', (e) => {
                dragging = true;
                dragStartY = e.global.y;
                contentStartY = content.y;
            });
            panelBg.on('pointermove', (e) => {
                if (!dragging) return;
                const dy = e.global.y - dragStartY;
                content.y = clamp(contentStartY + dy, minY, maxY);
                updateScrollBar();
            });
            panelBg.on('pointerup', () => { dragging = false; });
            panelBg.on('pointerupoutside', () => { dragging = false; });

            // 滚动提示
            const scrollHint = createText('↕ 上下滑动查看更多', { fontSize: 11, fill: 0x666666 });
            scrollHint.x = panelX + panelW / 2 - scrollHint.width / 2;
            scrollHint.y = panelY + panelH - 28;
            panel.addChild(scrollHint);
        }

        // 关闭按钮（固定在面板右上角）
        const closeBtn = createText('✕ 关闭', { fontSize: 16, fill: 0xff6b6b });
        closeBtn.x = panelX + panelW - 70;
        closeBtn.y = panelY + 8;
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

        // 暗色背景（拦截点击穿透）
        const mask = createRoundedRect(W, H, 0, 0x000000, 0.75);
        mask.eventMode = 'static';
        mask.cursor = 'default';
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
                    queueAttrTips({ [attrName]: 1, mood: 1 });
                } else if (result === 'critical_fail') {
                    modAttr('mood', -2);
                    queueAttrTips({ mood: -2 });
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

    // ==================== 弹幕吐槽系统 ====================
    let danmakuTicker = null; // 弹幕动画ticker引用

    function playDanmaku(eventId) {
        // 清除之前的弹幕ticker
        if (danmakuTicker) {
            app.ticker.remove(danmakuTicker);
            danmakuTicker = null;
        }
        // 移除旧弹幕容器
        const old = layers.overlay.getChildByName('danmakuLayer');
        if (old) layers.overlay.removeChild(old);

        DANMAKU_API.fetchDanmaku(eventId).then(items => {
            if (!items || items.length === 0) return;

            const dmLayer = new PIXI.Container();
            dmLayer.name = 'danmakuLayer';
            dmLayer.eventMode = 'none'; // 不拦截点击
            layers.overlay.addChild(dmLayer);

            const bullets = [];
            const colors = [0xffffff, 0xffd166, 0x06d6a0, 0xef476f, 0x118ab2];

            items.forEach((item, i) => {
                const color = colors[i % colors.length];
                const txt = createText(item.text, {
                    fontSize: 16,
                    fill: color,
                    fontWeight: 'bold',
                    stroke: 0x000000,
                    strokeThickness: 3,
                    wordWrap: false,
                });
                // 初始在右侧屏幕外，Y轴错开
                txt.x = W + 20 + i * 200;
                txt.y = 110 + i * 36;
                txt.alpha = 0.85;
                dmLayer.addChild(txt);
                bullets.push({ txt, speed: 1.2 + Math.random() * 0.8 });
            });

            danmakuTicker = () => {
                if (!dmLayer.parent) {
                    app.ticker.remove(danmakuTicker);
                    danmakuTicker = null;
                    return;
                }
                bullets.forEach(b => {
                    b.txt.x -= b.speed;
                    // 飞出左边后回到右边循环
                    if (b.txt.x + b.txt.width < -20) {
                        b.txt.x = W + 20 + Math.random() * 100;
                    }
                });
            };
            app.ticker.add(danmakuTicker);
        });
    }

    function showDanmakuInput(eventId) {
        // 创建HTML输入框（PIXI中无法直接输入文字）
        const existing = document.getElementById('danmaku-input-overlay');
        if (existing) existing.remove();

        const overlay = document.createElement('div');
        overlay.id = 'danmaku-input-overlay';
        overlay.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.6); display: flex; align-items: center;
            justify-content: center; z-index: 9999;
        `;

        const dialog = document.createElement('div');
        dialog.style.cssText = `
            background: #1a1a2e; border: 2px solid #ffd166; border-radius: 16px;
            padding: 24px; width: 340px; max-width: 90vw; text-align: center;
            box-shadow: 0 8px 32px rgba(0,0,0,0.5);
        `;

        const title = document.createElement('div');
        title.textContent = '💬 发一条弹幕吐槽';
        title.style.cssText = 'color: #ffd166; font-size: 18px; font-weight: bold; margin-bottom: 16px;';
        dialog.appendChild(title);

        const input = document.createElement('input');
        input.type = 'text';
        input.maxLength = 30;
        input.placeholder = '最多30字，说点什么吧...';
        input.style.cssText = `
            width: 100%; box-sizing: border-box; padding: 12px 16px;
            border: 1px solid #444; border-radius: 10px; background: #0d1b2a;
            color: #fff; font-size: 16px; outline: none; margin-bottom: 8px;
        `;
        dialog.appendChild(input);

        const counter = document.createElement('div');
        counter.textContent = '0/30';
        counter.style.cssText = 'color: #888; font-size: 12px; text-align: right; margin-bottom: 16px;';
        dialog.appendChild(counter);

        input.addEventListener('input', () => {
            counter.textContent = `${input.value.length}/30`;
            counter.style.color = input.value.length >= 28 ? '#e74c3c' : '#888';
        });

        const btnRow = document.createElement('div');
        btnRow.style.cssText = 'display: flex; gap: 12px; justify-content: center;';

        const cancelBtn = document.createElement('button');
        cancelBtn.textContent = '取消';
        cancelBtn.style.cssText = `
            padding: 10px 28px; border: 1px solid #555; border-radius: 10px;
            background: transparent; color: #aaa; font-size: 15px; cursor: pointer;
        `;
        cancelBtn.onclick = () => overlay.remove();
        btnRow.appendChild(cancelBtn);

        const submitBtn = document.createElement('button');
        submitBtn.textContent = '发射 🚀';
        submitBtn.style.cssText = `
            padding: 10px 28px; border: none; border-radius: 10px;
            background: linear-gradient(135deg, #ffd166, #ef476f); color: #fff;
            font-size: 15px; font-weight: bold; cursor: pointer;
        `;
        submitBtn.onclick = async () => {
            const text = input.value.trim();
            if (!text) return;
            submitBtn.disabled = true;
            submitBtn.textContent = '发送中...';
            const ok = await DANMAKU_API.submitDanmaku(eventId, text);
            overlay.remove();
            if (ok) {
                // 发送成功后刷新弹幕
                playDanmaku(eventId);
            }
        };
        btnRow.appendChild(submitBtn);
        dialog.appendChild(btnRow);

        // 按回车提交
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') submitBtn.click();
        });

        overlay.appendChild(dialog);
        // 点击遮罩关闭（延迟绑定，防止手机端触摸事件穿透立即关闭）
        document.body.appendChild(overlay);
        setTimeout(() => {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) overlay.remove();
            });
            input.focus();
        }, 300);
    }

    // ==================== 事件系统 ====================

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
        if (event.effects) applyEffects(event.effects, true);
        if (event.gainItem) {
            addItem(event.gainItem);
            const itemInfo = GAME_DATA.items[event.gainItem];
            if (itemInfo) queueItemTip(`获得 ${itemInfo.icon}${itemInfo.name}`);
        }
        if (event.loseItem) {
            const itemInfo = GAME_DATA.items[event.loseItem];
            removeItem(event.loseItem);
            if (itemInfo) queueItemTip(`失去 ${itemInfo.icon}${itemInfo.name}`);
        }
        if (event.addBuff) {
            addBuff(event.addBuff);
            queueItemTip(`获得状态: ${event.addBuff.name}`);
        }

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
        const voteLabels = []; // 存放每个按钮的百分比文本引用

        // 判断某个选项是否已被完整体验过（所有可能的目标事件都已访问）
        function isOptionExhausted(opt) {
            const targets = [];
            if (opt.next) targets.push(opt.next);
            if (opt.success) targets.push(opt.success);
            if (opt.fail) targets.push(opt.fail);
            if (targets.length === 0) return false;
            return targets.every(t => gameState.history.includes(t));
        }

        // 过滤出可用选项（needItem检查）
        const availableOptions = event.options.filter(opt => !opt.needItem || hasItem(opt.needItem));
        // 计算哪些选项已体验过
        const exhaustedFlags = availableOptions.map(opt => isOptionExhausted(opt));
        // 如果全部都体验过了，就全部解锁（避免死锁）
        const allExhausted = exhaustedFlags.every(f => f);

        let renderedIndex = 0;
        event.options.forEach((opt, i) => {
            // 检查是否需要道具
            if (opt.needItem && !hasItem(opt.needItem)) return;

            const avIdx = availableOptions.indexOf(opt);
            const isExhausted = !allExhausted && exhaustedFlags[avIdx];

            const btnGap = 60;
            const btnY = optionsStartY + renderedIndex * btnGap;
            renderedIndex++;
            const btn = new PIXI.Container();
            btn.y = btnY;
            btn.x = 24;

            const btnW = W - 48;
            const btnH = 50;

            const isCheck = !!opt.check;
            const btnColor = isCheck ? 0x6c5ce7 : 0x2d3436;
            const btnBg = createRoundedRect(btnW, btnH, 12, btnColor, 0.85);
            btn.addChild(btnBg);

            // 投票百分比进度条（底层）
            const voteBar = new PIXI.Graphics();
            voteBar.alpha = 0;
            btn.addChild(voteBar);

            // 高亮边框
            const border = new PIXI.Graphics();
            border.lineStyle(2, isCheck ? 0xa29bfe : 0x636e72, 0.6);
            border.drawRoundedRect(0, 0, btnW, btnH, 12);
            btn.addChild(border);

            const btnLabel = createText(opt.text, {
                fontSize: 15,
                fill: 0xffffff,
                wordWrapWidth: btnW - 120,
            });
            btnLabel.x = 16;
            btnLabel.y = btnH / 2 - btnLabel.height / 2;
            btn.addChild(btnLabel);

            // 投票百分比文本（紧跟选项文本后面）
            const voteText = createText('', {
                fontSize: 11,
                fill: 0xaaaaaa,
            });
            voteText.x = btnLabel.x + btnLabel.width + 8;
            voteText.y = btnH / 2 - voteText.height / 2 + 1;
            voteText.alpha = 0;
            btn.addChild(voteText);

            voteLabels.push({ index: i, voteText, voteBar, btnW, btnH, btnColor: isCheck ? 0x6c5ce7 : 0x2d3436 });

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

            // 已体验过的选项：置灰 + 标记
            if (isExhausted) {
                btn.alpha = 0.4;
                btn.eventMode = 'none';
                const doneLabel = createText('[已体验]', {
                    fontSize: 11,
                    fill: 0x888888,
                });
                doneLabel.x = btnW - doneLabel.width - 12;
                doneLabel.y = btnH / 2 - doneLabel.height / 2;
                btn.addChild(doneLabel);
            } else {
                btn.eventMode = 'static';
                btn.cursor = 'pointer';

                btn.on('pointerover', () => { btnBg.tint = 0xcccccc; });
                btn.on('pointerout', () => { btnBg.tint = 0xffffff; });

                btn.on('pointertap', () => {
                    if (isTransitioning) return;
                    SFX.click();
                    VOTE_API.submitVote(eventId, i);
                    handleOptionClick(opt);
                });
            }

            optionsContainer.addChild(btn);
        });

        newContent.addChild(optionsContainer);

        // 异步拉取投票数据并更新百分比显示
        VOTE_API.fetchVotes(eventId).then(data => {
            if (!data || !optionsContainer.parent) return;
            const { votes: eventVotes, total } = data;
            if (!total) return;

            voteLabels.forEach(({ index, voteText, voteBar, btnW, btnH, btnColor }) => {
                const count = (eventVotes && eventVotes[String(index)]) || 0;
                const pct = Math.round((count / total) * 100);
                voteText.text = `${pct}% 选择`;
                voteText.alpha = 1;

                // 绘制半透明进度条
                const fillW = Math.max(2, (pct / 100) * btnW);
                voteBar.clear();
                voteBar.beginFill(0xffffff, 0.08);
                voteBar.drawRoundedRect(0, 0, fillW, btnH, 12);
                voteBar.endFill();
                voteBar.alpha = 1;
            });
        });

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

        // 弹幕吐槽按钮
        const dmBtn = new PIXI.Container();
        dmBtn.x = W - 130;
        dmBtn.y = 62;

        const dmBg = createRoundedRect(56, 40, 20, 0x000000, 0.5);
        dmBtn.addChild(dmBg);

        const dmIcon = createText('💬', { fontSize: 22 });
        dmIcon.x = 14;
        dmIcon.y = 6;
        dmBtn.addChild(dmIcon);

        dmBtn.eventMode = 'static';
        dmBtn.cursor = 'pointer';
        dmBtn.on('pointertap', () => {
            showDanmakuInput(eventId);
        });
        newContent.addChild(dmBtn);

        // 异步加载并播放弹幕
        playDanmaku(eventId);

        // 切换动画
        layers.scene.removeChildren();
        layers.scene.addChild(newContent);
        animateAlpha(newContent, 0, 1, 350, () => {
            isTransitioning = false;
        });
    }

    // 分支剧情队列：三个分支按随机顺序依次执行
    const BRANCH_IDS = [3040, 3043, 3047];
    function shuffleBranchQueue() {
        const arr = BRANCH_IDS.slice();
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        gameState.branchQueue = arr;
        gameState.branchQueueIndex = 0;
    }
    function getNextInBranchSequence(preferredNext) {
        if (gameState.branchQueue && gameState.branchQueueIndex < gameState.branchQueue.length) {
            return gameState.branchQueue[gameState.branchQueueIndex++];
        }
        if (gameState.branchQueue) {
            gameState.branchQueue = [];
            gameState.branchQueueIndex = 0;
        }
        return preferredNext;
    }

    function handleOptionClick(opt) {
        if (opt.effects) applyEffects(opt.effects, true);
        if (opt.gainItem) {
            addItem(opt.gainItem);
            const itemInfo = GAME_DATA.items[opt.gainItem];
            if (itemInfo) queueItemTip(`获得 ${itemInfo.icon}${itemInfo.name}`);
        }
        if (opt.loseItem) {
            const itemInfo = GAME_DATA.items[opt.loseItem];
            removeItem(opt.loseItem);
            if (itemInfo) queueItemTip(`失去 ${itemInfo.icon}${itemInfo.name}`);
        }

        // 分支剧情序列：从 3035 点击「开始」后，按随机顺序依次执行三个分支
        if (opt.next === 'branch_sequence_start') {
            shuffleBranchQueue();
            showEvent(gameState.branchQueue[0]);
            return;
        }

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
                let nextId = success ? (opt.success || opt.next) : (opt.fail || opt.next);
                if (nextId === 3015 || nextId === 1003) nextId = getNextInBranchSequence(nextId);
                if (nextId) {
                    // 分支队列未跑完时，不触发 Boss，先跑完三个分支
                    if (BRANCH_IDS.includes(nextId)) {
                        showEvent(nextId);
                        return;
                    }
                    const nextEvent = GAME_DATA.events[nextId];
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
                    showEvent(nextId);
                }
            });
        } else if (opt.next) {
            // 检查是否该触发Boss
            let nextId = (opt.next === 3015 || opt.next === 1003) ? getNextInBranchSequence(opt.next) : opt.next;
            // 分支队列未跑完时，不触发 Boss，先跑完三个分支
            if (BRANCH_IDS.includes(nextId)) {
                showEvent(nextId);
                return;
            }
            const nextEvent = GAME_DATA.events[nextId];
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
            showEvent(nextId);
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
        if (danmakuTicker) { app.ticker.remove(danmakuTicker); danmakuTicker = null; }
        const dmOverlay = document.getElementById('danmaku-input-overlay');
        if (dmOverlay) dmOverlay.remove();

        const container = new PIXI.Container();

        // 失败背景图
        const bgSprite = createFullscreenSprite('finish_bad');
        if (bgSprite) {
            container.addChild(bgSprite);
            const dimOverlay = new PIXI.Graphics();
            dimOverlay.beginFill(0x000000, 0.6);
            dimOverlay.drawRect(0, 0, W, H);
            dimOverlay.endFill();
            container.addChild(dimOverlay);
        } else {
            const bg = createRoundedRect(W, H, 0, 0x0c0c1d, 1);
            container.addChild(bg);
        }

        const gameOverIcons = { mood: '😭', money: '💸', energy: '😫', charisma: '🤐', handy: '🤕' };
        const icon = createText(gameOverIcons[reason] || '💀', { fontSize: 80 });
        icon.anchor.set(0.5);
        icon.x = W / 2;
        icon.y = 250;
        container.addChild(icon);

        const title = createText('游戏结束', { fontSize: 36, fill: 0xe74c3c, fontWeight: 'bold' });
        title.anchor.set(0.5);
        title.x = W / 2;
        title.y = 340;
        container.addChild(title);

        const gameOverMsgs = {
            mood: '你的心态彻底崩了...\n租房的压力终于把你压垮了。\n也许下次会做出更好的选择。',
            money: '你的钱花光了...\n在这个昂贵的城市里，没钱寸步难行。\n下次要精打细算啊。',
            energy: '你精力耗尽，累倒在出租屋里...\n魔都的节奏太快了。\n下次记得劳逸结合。',
            charisma: '你变得不敢开口说话了...\n一次次碰壁让你丧失了交流的勇气。\n下次试试不同的沟通方式吧。',
            handy: '你连灯泡都拧不动了...\n生活技能归零，在魔都寸步难行。\n下次多动手试试吧。'
        };
        const msg = gameOverMsgs[reason] || '你在魔都的冒险结束了...';

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
        if (danmakuTicker) { app.ticker.remove(danmakuTicker); danmakuTicker = null; }
        const dmOverlay = document.getElementById('danmaku-input-overlay');
        if (dmOverlay) dmOverlay.remove();

        const container = new PIXI.Container();

        const score = calcScore();
        const rank = score >= 80 ? 'S' : score >= 60 ? 'A' : score >= 40 ? 'B' : score >= 20 ? 'C' : 'D';
        const rankColors = { S: 0xf1c40f, A: 0x2ecc71, B: 0x3498db, C: 0xe67e22, D: 0xe74c3c };

        // 根据评级选择背景图：S/A/B用胜利图，C/D用失败图
        const isGoodEnding = (rank === 'S' || rank === 'A' || rank === 'B');
        const bgSprite = createFullscreenSprite(isGoodEnding ? 'finish_good' : 'finish_bad');
        if (bgSprite) {
            container.addChild(bgSprite);
            const dimOverlay = new PIXI.Graphics();
            dimOverlay.beginFill(0x000000, isGoodEnding ? 0.45 : 0.55);
            dimOverlay.drawRect(0, 0, W, H);
            dimOverlay.endFill();
            container.addChild(dimOverlay);
        } else {
            const bg = createRoundedRect(W, H, 0, 0x1a1a2e, 1);
            container.addChild(bg);
        }

        const titleEmoji = createText('🏆', { fontSize: 72 });
        titleEmoji.anchor.set(0.5);
        titleEmoji.x = W / 2;
        titleEmoji.y = 150;
        container.addChild(titleEmoji);

        const title = createText('魔都租房大冒险\n— 冒险结束 —', {
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

        // 封面背景图
        const bgSprite = createFullscreenSprite('start');
        if (bgSprite) {
            layers.bg.addChild(bgSprite);
            // 加轻微暗色遮罩（背景图已有标题，仅底部按钮区域略暗）
            const dimOverlay = new PIXI.Graphics();
            dimOverlay.beginFill(0x000000, 0.15);
            dimOverlay.drawRect(0, 0, W, H);
            dimOverlay.endFill();
            layers.bg.addChild(dimOverlay);
        } else {
            // 无图片时的fallback背景
            const bg = new PIXI.Graphics();
            bg.beginFill(0x0d1b2a);
            bg.drawRect(0, 0, W, H);
            bg.endFill();
            bg.beginFill(0x1b263b, 0.95);
            bg.drawRect(0, H * 0.4, W, H * 0.6);
            bg.endFill();
            bg.beginFill(0xe63946, 0.15);
            bg.drawRect(0, H - 120, W, 120);
            bg.endFill();
            layers.bg.addChild(bg);
        }

        // 魔都霓虹感粒子（暖黄/金/红）
        const colors = [0xffd166, 0xe63946, 0xffaa00, 0xffffff];
        const particles = new PIXI.Container();
        for (let i = 0; i < 40; i++) {
            const p = new PIXI.Graphics();
            const c = colors[Math.floor(Math.random() * colors.length)];
            p.beginFill(c, 0.15 + Math.random() * 0.25);
            p.drawCircle(0, 0, 1.5 + Math.random() * 3);
            p.endFill();
            p.x = Math.random() * W;
            p.y = Math.random() * H;
            p._speed = 0.4 + Math.random() * 0.8;
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

        // 开始按钮（标题文字已在背景图上）
        const startBtn = new PIXI.Container();
        startBtn.x = W / 2 - 120;
        startBtn.y = 590;

        const startBg = createRoundedRect(240, 64, 32, 0xe63946, 0.95);
        startBtn.addChild(startBg);

        const startText = createText('🎲 闯荡魔都！', { fontSize: 24, fill: 0xffffff, fontWeight: 'bold' });
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

        // Debug: 快速跳转（仅localhost显示）
        if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
        const debugBtnW = 140;
        const debugBtnH = 32;
        const debugRadius = 12;
        const debugFont = 12;

        // 分支剧情按钮
        const debugBranchBtn = new PIXI.Container();
        debugBranchBtn.x = W / 2 - debugBtnW / 2;
        debugBranchBtn.y = 700;
        const debugBranchBg = createRoundedRect(debugBtnW, debugBtnH, debugRadius, 0x2ecc71, 0.6);
        debugBranchBtn.addChild(debugBranchBg);
        const debugBranchText = createText('🐛 分支剧情', { fontSize: debugFont, fill: 0xffffff });
        debugBranchText.x = debugBtnW / 2 - debugBranchText.width / 2;
        debugBranchText.y = debugBtnH / 2 - debugBranchText.height / 2;
        debugBranchBtn.addChild(debugBranchText);
        debugBranchBtn.eventMode = 'static';
        debugBranchBtn.cursor = 'pointer';
        debugBranchBtn.on('pointertap', () => {
            SFX.click();
            animateAlpha(container, 1, 0, 300, () => {
                layers.scene.removeChildren();
                layers.bg.removeChildren();
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
                gameState.branchQueue = [];
                gameState.branchQueueIndex = 0;
                isTransitioning = false;
                currentEventId = null;
                showEvent(3035);
            });
        });
        container.addChild(debugBranchBtn);

        // 中介Boss按钮
        const debugAgentBtn = new PIXI.Container();
        debugAgentBtn.x = W / 2 - debugBtnW - 5;
        debugAgentBtn.y = 738;
        const debugAgentBg = createRoundedRect(debugBtnW, debugBtnH, debugRadius, 0x6c5ce7, 0.6);
        debugAgentBtn.addChild(debugAgentBg);
        const debugAgentText = createText('🐛 中介Boss', { fontSize: debugFont, fill: 0xffffff });
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
        debugLandlordBtn.y = 738;
        const debugLandlordBg = createRoundedRect(debugBtnW, debugBtnH, debugRadius, 0xe74c3c, 0.6);
        debugLandlordBtn.addChild(debugLandlordBg);
        const debugLandlordText = createText('🐛 房东Boss', { fontSize: debugFont, fill: 0xffffff });
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
        const ver = createText('v0.1.0 原型版', { fontSize: 12, fill: 0x8a9aad });
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
        gameState.branchQueue = [];
        gameState.branchQueueIndex = 0;

        layers.bg.removeChildren();
        layers.scene.removeChildren();
        layers.ui.removeChildren();
        layers.overlay.removeChildren();
        isTransitioning = false;
        currentEventId = null;

        // 清理弹幕
        if (danmakuTicker) { app.ticker.remove(danmakuTicker); danmakuTicker = null; }
        const dmOverlay = document.getElementById('danmaku-input-overlay');
        if (dmOverlay) dmOverlay.remove();

        showTitleScreen();
    }

    // ==================== 启动 ====================
    // 预加载背景图和角色立绘后再显示标题画面
    preloadThumbs(() => {
        preloadPortraits(() => {
            showTitleScreen();
        });
    });

})();
