/**
 * 租房大冒险 - 投票统计服务器
 * 轻量级 Node.js 服务器，统计全球玩家选项投票
 * 
 * 启动: node server.js
 * 默认端口: 3000
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'votes.json');
const DANMAKU_FILE = path.join(__dirname, 'danmaku.json');

// MIME 类型映射
const MIME_TYPES = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
};

// 加载投票数据
function loadVotes() {
    try {
        if (fs.existsSync(DATA_FILE)) {
            return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
        }
    } catch (e) {
        console.error('Failed to load votes:', e.message);
    }
    return {};
}

// 加载弹幕数据
function loadDanmaku() {
    try {
        if (fs.existsSync(DANMAKU_FILE)) {
            return JSON.parse(fs.readFileSync(DANMAKU_FILE, 'utf-8'));
        }
    } catch (e) {
        console.error('Failed to load danmaku:', e.message);
    }
    return {};
}

// 保存投票数据（防抖写入）
let saveTimer = null;
let votes = loadVotes();

function saveVotes() {
    if (saveTimer) clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
        try {
            fs.writeFileSync(DATA_FILE, JSON.stringify(votes, null, 2), 'utf-8');
        } catch (e) {
            console.error('Failed to save votes:', e.message);
        }
    }, 1000);
}

// 保存弹幕数据（防抖写入）
let danmakuSaveTimer = null;
let danmaku = loadDanmaku();

function saveDanmaku() {
    if (danmakuSaveTimer) clearTimeout(danmakuSaveTimer);
    danmakuSaveTimer = setTimeout(() => {
        try {
            fs.writeFileSync(DANMAKU_FILE, JSON.stringify(danmaku, null, 2), 'utf-8');
        } catch (e) {
            console.error('Failed to save danmaku:', e.message);
        }
    }, 1000);
}

// 解析请求体
function parseBody(req) {
    return new Promise((resolve, reject) => {
        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', () => {
            try {
                resolve(body ? JSON.parse(body) : {});
            } catch (e) {
                reject(e);
            }
        });
        req.on('error', reject);
    });
}

// CORS 头
function setCORS(res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

// 静态文件服务
function serveStatic(req, res) {
    let filePath = req.url === '/' ? '/index.html' : req.url;
    // 去掉 query string
    filePath = filePath.split('?')[0];
    // 浏览器默认请求 favicon.ico，统一用 favicon.svg 响应
    if (filePath === '/favicon.ico') filePath = '/favicon.svg';
    // 解码中文文件名等 URI 编码字符
    filePath = decodeURIComponent(filePath);
    const fullPath = path.join(__dirname, filePath);

    // 安全检查：防止目录遍历
    if (!fullPath.startsWith(__dirname)) {
        res.writeHead(403);
        res.end('Forbidden');
        return;
    }

    const ext = path.extname(fullPath).toLowerCase();
    const mime = MIME_TYPES[ext] || 'application/octet-stream';

    fs.readFile(fullPath, (err, data) => {
        if (err) {
            if (err.code === 'ENOENT') {
                res.writeHead(404);
                res.end('Not Found');
            } else {
                res.writeHead(500);
                res.end('Internal Server Error');
            }
            return;
        }
        res.writeHead(200, { 'Content-Type': mime });
        res.end(data);
    });
}

// API 路由
const server = http.createServer(async (req, res) => {
    setCORS(res);

    // 处理 CORS 预检
    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    const url = new URL(req.url, `http://${req.headers.host}`);

    // GET /api/votes?eventId=1001 — 获取某事件的投票统计
    if (url.pathname === '/api/votes' && req.method === 'GET') {
        const eventId = url.searchParams.get('eventId');
        if (!eventId) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Missing eventId' }));
            return;
        }

        const eventVotes = votes[eventId] || {};
        // 计算总票数
        let total = 0;
        Object.values(eventVotes).forEach(v => { total += v; });

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ eventId, votes: eventVotes, total }));
        return;
    }

    // POST /api/vote — 提交投票 { eventId, optionIndex }
    if (url.pathname === '/api/vote' && req.method === 'POST') {
        try {
            const body = await parseBody(req);
            const { eventId, optionIndex } = body;

            if (eventId === undefined || optionIndex === undefined) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Missing eventId or optionIndex' }));
                return;
            }

            const eid = String(eventId);
            const oidx = String(optionIndex);

            if (!votes[eid]) votes[eid] = {};
            votes[eid][oidx] = (votes[eid][oidx] || 0) + 1;

            saveVotes();

            // 返回更新后的统计
            let total = 0;
            Object.values(votes[eid]).forEach(v => { total += v; });

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ eventId: eid, votes: votes[eid], total }));
        } catch (e) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Invalid request body' }));
        }
        return;
    }

    // GET /api/danmaku?eventId=1001 — 获取某事件的弹幕（随机3条）
    if (url.pathname === '/api/danmaku' && req.method === 'GET') {
        const eventId = url.searchParams.get('eventId');
        if (!eventId) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Missing eventId' }));
            return;
        }

        const list = danmaku[String(eventId)] || [];
        // 随机选3条
        const shuffled = list.slice().sort(() => Math.random() - 0.5);
        const picked = shuffled.slice(0, 3);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ eventId, danmaku: picked }));
        return;
    }

    // POST /api/danmaku — 提交弹幕 { eventId, text }
    if (url.pathname === '/api/danmaku' && req.method === 'POST') {
        try {
            const body = await parseBody(req);
            const { eventId, text } = body;

            if (!eventId || !text) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Missing eventId or text' }));
                return;
            }

            // 限制长度30字
            const trimmed = String(text).trim().slice(0, 30);
            if (!trimmed) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Empty text' }));
                return;
            }

            const eid = String(eventId);
            if (!danmaku[eid]) danmaku[eid] = [];
            // 每个事件最多保存50条，超出移除最早的
            if (danmaku[eid].length >= 50) danmaku[eid].shift();
            danmaku[eid].push({ text: trimmed, time: Date.now() });

            saveDanmaku();

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ ok: true }));
        } catch (e) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Invalid request body' }));
        }
        return;
    }

    // 其他请求 → 静态文件服务
    serveStatic(req, res);
});

server.listen(PORT, () => {
    console.log(`🏠 租房大冒险服务器已启动: http://localhost:${PORT}`);
    console.log(`📊 投票API: GET /api/votes?eventId=xxx | POST /api/vote`);
    console.log(`💬 弹幕API: GET /api/danmaku?eventId=xxx | POST /api/danmaku`);
});
