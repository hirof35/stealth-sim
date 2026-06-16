// --- 1. 設定とマップデータ ---
const MAP = [
    ["#", "#", "#", "#", "#", "#", "#", "#", "#", "#", "#", "#", "#", "#", "#"],
    ["#", " ", " ", " ", " ", " ", "#", " ", " ", " ", " ", " ", " ", " ", "#"],
    ["#", " ", " ", " ", " ", " ", "#", " ", " ", " ", " ", " ", " ", " ", "#"],
    ["#", " ", " ", " ", " ", " ", "#", " ", " ", " ", " ", " ", " ", " ", "#"],
    ["#", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", "#"],
    ["#", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", "#"],
    ["#", "#", "#", "#", "#", " ", " ", " ", " ", "#", "#", "#", "#", "#", "#"],
    ["#", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", "#"],
    ["#", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", "#"],
    ["#", "#", "#", "#", "#", "#", "#", "#", "#", "#", "#", "#", "#", "#", "#"],
];

const enemy = {
    x: 2, y: 2, angle: 0, viewDistance: 6, viewAngle: Math.PI / 2,
    state: "PATROL", lastKnownPos: null, searchTimer: 0
};

const player = { x: 12, y: 2 };
let tick = 0;

function checkLineOfSight(e, p, map) {
    const dx = p.x - e.x; const dy = p.y - e.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance > e.viewDistance) return false;
    const toPlayerNormal = { x: dx / distance, y: dy / distance };
    const enemyForward = { x: Math.cos(e.angle), y: Math.sin(e.angle) };
    const dotProduct = (enemyForward.x * toPlayerNormal.x) + (enemyForward.y * toPlayerNormal.y);
    const viewAngleCos = Math.cos(e.viewAngle / 2);
    if (dotProduct < viewAngleCos) return false;
    const steps = Math.ceil(distance);
    for (let i = 1; i < steps; i++) {
        const checkX = Math.round(e.x + (dx / distance) * i);
        const checkY = Math.round(e.y + (dy / distance) * i);
        if (map[checkY] && map[checkY][checkX] === "#") return false;
    }
    return true;
}

function updateAI() {
    const canSee = checkLineOfSight(enemy, player, MAP);
    if (canSee) {
        enemy.state = "CHASE"; enemy.lastKnownPos = { x: player.x, y: player.y }; enemy.searchTimer = 4;
    } else {
        if (enemy.state === "CHASE") enemy.state = "SEARCH";
        if (enemy.state === "SEARCH") {
            enemy.searchTimer--;
            if (enemy.searchTimer <= 0) { enemy.state = "PATROL"; enemy.lastKnownPos = null; }
        }
    }
}

function movePlayer() {
    tick++;
    if (tick < 6) player.x--;
    else if (tick < 9) player.y++;
    else if (tick < 13) player.x++;
}

function drawMap() {
    console.clear();
    console.log(`=== ステルスAI シミュレーション (Tick: ${tick}) ===`);
    console.log(`敵の状態: [${enemy.state}] ${enemy.state === 'SEARCH' ? `(捜索残り: ${enemy.searchTimer})` : ''}`);
    console.log(`プレイヤーが見えているか: ${checkLineOfSight(enemy, player, MAP) ? "○ 見えている！" : "× 見えない"}`);
    console.log("-----------------------------------------------");
    for (let y = 0; y < MAP.length; y++) {
        let line = "";
        for (let x = 0; x < MAP[y].length; x++) {
            if (x === enemy.x && y === enemy.y) line += "Ｅ";
            else if (x === player.x && y === player.y) line += "Ｐ";
            else if (enemy.lastKnownPos && x === enemy.lastKnownPos.x && y === enemy.lastKnownPos.y && enemy.state === "SEARCH") line += "？";
            else if (MAP[y][x] === "#") line += "■";
            else line += "．";
        }
        console.log(line);
    }
}

const interval = setInterval(() => {
    movePlayer(); updateAI(); drawMap();
    if (tick >= 15) { clearInterval(interval); console.log("\nシミュレーション終了。"); }
}, 1000);