// src/ballgame/GameLogic.js

// [修改] 添加 export 关键字
export const PAYOUT_TABLE = {
    "9:0:0": 16,   // 纯色
    "8:1:0": 10,
    "7:1:1": 8,
    "7:2:0": 3,
    "6:3:0": 3,
    "6:2:1": 3,
    "5:3:1": 1.5,
    "5:4:0": 1.5,
    "5:2:2": 1,
    "4:4:1": 1,
    "3:3:3": 1,    // 平衡
};

export const BALL_COLORS = {
    BLUE: { id: 'blue', hex: '#00FFFF', emissive: '#0088AA', name: 'CYAN' },
    RED: { id: 'red', hex: '#FF0055', emissive: '#AA0022', name: 'CRIMSON' },
    GREEN: { id: 'green', hex: '#00FF88', emissive: '#00AA44', name: 'NEON' }
};

export class QuantumReactorLogic {
    constructor() {
        this.fullDeck = [];
        const types = [BALL_COLORS.BLUE, BALL_COLORS.RED, BALL_COLORS.GREEN];
        types.forEach(type => {
            for (let i = 0; i < 9; i++) {
                this.fullDeck.push({ ...type, uid: Math.random().toString(36).substr(2, 9) });
            }
        });
    }

    draw() {
        const deck = [...this.fullDeck];
        for (let i = deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [deck[i], deck[j]] = [deck[j], deck[i]];
        }
        const result = deck.slice(0, 9);
        return this.analyzeResult(result);
    }

    analyzeResult(drawnBalls) {
        const counts = { blue: 0, red: 0, green: 0 };
        drawnBalls.forEach(b => counts[b.id]++);

        const pattern = Object.values(counts)
            .sort((a, b) => b - a)
            .join(':');

        const multiplier = PAYOUT_TABLE[pattern] || 0;

        return {
            balls: drawnBalls,
            counts: counts,
            pattern: pattern,
            multiplier: multiplier,
            isWin: multiplier > 0
        };
    }
}