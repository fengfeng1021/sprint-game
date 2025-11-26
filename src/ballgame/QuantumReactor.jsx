// src/ballgame/QuantumReactor.jsx
import React, { useState, useEffect, useRef } from 'react';
import { LogOut, Zap, RotateCcw, Trophy, Volume2, VolumeX, Info, X } from 'lucide-react';
import BallGameScene from './Scene3D';
import { QuantumReactorLogic, PAYOUT_TABLE, BALL_COLORS } from './GameLogic';

// --- 全息赔率表组件 ---
const PayoutModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;
    return (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in p-4" onClick={onClose}>
            <div className="w-full max-w-md bg-[#0a0a0a] border border-cyan-500/50 rounded-2xl p-6 relative shadow-[0_0_50px_rgba(0,255,255,0.2)]" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-4 text-cyan-500 hover:text-white"><X size={24}/></button>
                <h2 className="text-2xl font-cinzel font-bold text-cyan-400 mb-6 text-center tracking-widest border-b border-cyan-900 pb-4">
                    SYSTEM ODDS
                </h2>
                <div className="space-y-2 font-mono text-sm max-h-[60vh] overflow-y-auto custom-scroll">
                    {Object.entries(PAYOUT_TABLE).sort((a,b) => b[1] - a[1]).map(([pattern, mult]) => (
                        <div key={pattern} className="flex justify-between items-center p-3 bg-cyan-900/20 rounded border border-cyan-900/30 hover:bg-cyan-900/40 transition-colors">
                            <div className="flex gap-2">
                                {pattern.split(':').map((count, i) => (
                                    <div key={i} className="flex items-center gap-1">
                                        <span className={`text-lg font-bold ${i===0?'text-cyan-300':i===1?'text-pink-400':'text-green-400'}`}>{count}</span>
                                    </div>
                                ))}
                                <span className="text-gray-500 text-xs self-center ml-2 opacity-70">BALLS</span>
                            </div>
                            <div className="text-yellow-400 font-bold text-xl">x{mult}</div>
                        </div>
                    ))}
                </div>
                <div className="mt-6 text-center text-xs text-gray-500 uppercase tracking-widest">
                    9 Balls Drawn • 27 Total
                </div>
            </div>
        </div>
    );
};

export default function QuantumReactor({ user, onBack, onUpdateBalance }) {
    // 状态: IDLE -> SCRAMBLE -> SYNCING (User Hold) -> REVEAL -> RESULT
    const [gameState, setGameState] = useState('IDLE');
    const [bet, setBet] = useState(100);
    const [gameResult, setGameResult] = useState(null);
    const [displayWin, setDisplayWin] = useState(0);
    const [showPayout, setShowPayout] = useState(false);
    const [soundEnabled, setSoundEnabled] = useState(true);
    
    const [logic] = useState(() => new QuantumReactorLogic());
    const deck = logic.fullDeck;

    // 音频 Refs
    const audioBgm = useRef(new Audio('./sound/bgm.mp3'));
    const audioScramble = useRef(new Audio('./sound/sprint.mp3'));
    const audioWin = useRef(new Audio('./sound/clear.mp3'));
    
    // 初始化音频
    useEffect(() => {
        audioBgm.current.loop = true;
        audioBgm.current.volume = 0.3;
        audioScramble.current.loop = true;
        audioScramble.current.volume = 0.5;
        
        return () => {
            audioBgm.current.pause();
            audioScramble.current.pause();
            audioWin.current.pause();
        };
    }, []);

    // 切换静音
    useEffect(() => {
        if (soundEnabled) {
            audioBgm.current.play().catch(() => {});
        } else {
            audioBgm.current.pause();
            audioScramble.current.pause();
        }
    }, [soundEnabled]);

    const handleBetChange = (delta) => {
        if (gameState !== 'IDLE' && gameState !== 'RESULT') return;
        setBet(prev => Math.min(1000, Math.max(100, prev + delta)));
    };

    // 阶段 1: 启动反应堆 (进入混乱状态)
    const initSequence = () => {
        if (user.balance < bet) { alert("余额不足 / Insufficient Balance"); return; }
        
        // 扣款
        onUpdateBalance(user.balance - bet);
        setGameResult(null);
        setDisplayWin(0);
        
        setGameState('SCRAMBLE');
        if (soundEnabled) audioScramble.current.play().catch(()=>{});
    };

    // 阶段 2: 玩家按下按钮 (充能)
    const startSync = () => {
        if (gameState !== 'SCRAMBLE') return;
        setGameState('SYNCING');
        // 音效: 加快 Scramble 速度或音调 (这里简化为继续播放)
    };

    // 阶段 3: 玩家松开按钮 (捕获结果 - 核心交互)
    const triggerCapture = async () => {
        if (gameState !== 'SYNCING') return;

        // 停止混乱音效
        audioScramble.current.pause();
        audioScramble.current.currentTime = 0;

        // 1. 生成结果 (此时生成，给玩家"我决定的"感觉)
        const result = logic.draw();
        setGameResult(result);
        setGameState('REVEAL');

        // 2. 播放捕获/胜利音效
        if (soundEnabled) {
            const sfx = result.isWin ? audioWin.current : new Audio('./sound/sprint.mp3'); // 输了播放普通音效
            sfx.play().catch(()=>{});
        }

        // 3. 等待动画
        await new Promise(r => setTimeout(r, 2500));

        // 4. 结算
        if (result.isWin) {
            const winAmount = bet * result.multiplier;
            setDisplayWin(winAmount);
            onUpdateBalance(user.balance - bet + winAmount); // 补回赢分 (简单处理)
        }

        setGameState('RESULT');
    };

    const resetGame = () => {
        setGameState('IDLE');
        setGameResult(null);
        setDisplayWin(0);
    };

    return (
        <div className="relative w-full h-screen bg-black overflow-hidden select-none font-mono">
            
            {/* 3D Scene */}
            <div className="absolute inset-0 z-0">
                <BallGameScene deck={deck} gameState={gameState} finalResult={gameResult} />
            </div>

            {/* UI Layer */}
            <div className="absolute inset-0 z-10 pointer-events-none flex flex-col justify-between p-4 md:p-6">
                
                {/* Top Header */}
                <div className="flex justify-between items-start pointer-events-auto">
                    <div className="bg-black/60 backdrop-blur border-l-4 border-cyan-500 p-3 rounded-r-xl shadow-lg shadow-cyan-500/20">
                        <h1 className="text-cyan-400 font-bold text-xl tracking-widest">QUANTUM REACTOR</h1>
                        <div className="text-[10px] text-cyan-700 uppercase tracking-[0.5em]">Status: {gameState}</div>
                    </div>
                    
                    <div className="flex gap-3">
                        <button onClick={() => setSoundEnabled(!soundEnabled)} className="bg-black/50 border border-white/10 text-cyan-400 p-3 rounded-full hover:bg-white/10 transition-colors">
                            {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
                        </button>
                        <button onClick={onBack} className="bg-red-900/20 border border-red-500/50 text-red-500 p-3 rounded-full hover:bg-red-900/50 transition-colors">
                            <LogOut size={20} />
                        </button>
                    </div>
                </div>

                {/* Center Messages */}
                <div className="absolute top-1/3 left-1/2 -translate-x-1/2 text-center pointer-events-none">
                    {gameState === 'SCRAMBLE' && (
                        <div className="text-cyan-200 text-opacity-80 animate-pulse tracking-[0.2em] text-sm">
                            SYSTEM UNSTABLE... WAITING FOR SYNC
                        </div>
                    )}
                    {gameState === 'SYNCING' && (
                        <div className="text-red-400 font-black text-2xl animate-bounce tracking-widest drop-shadow-[0_0_10px_red]">
                            RELEASE TO CAPTURE!
                        </div>
                    )}
                </div>

                {/* Result Overlay */}
                {gameState === 'RESULT' && gameResult && (
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-auto text-center animate-in zoom-in duration-300 z-20 w-full max-w-md px-4">
                        <div className={`p-6 md:p-8 border-2 bg-black/90 backdrop-blur-xl rounded-2xl shadow-[0_0_100px_rgba(0,0,0,0.9)] ${gameResult.isWin ? 'border-green-500 shadow-[0_0_50px_#00ff88]' : 'border-red-900 shadow-[0_0_30px_#ff0055]'}`}>
                            <div className="text-5xl md:text-7xl font-black mb-2 font-cinzel drop-shadow-lg" style={{ color: gameResult.isWin ? '#00ff88' : '#ff0055' }}>
                                {gameResult.isWin ? `WIN` : 'LOST'}
                            </div>
                            {gameResult.isWin && <div className="text-3xl text-white font-mono mb-4 tracking-widest">${displayWin}</div>}
                            
                            <div className="flex justify-center gap-4 mb-8 py-4 border-y border-white/10">
                                {Object.entries(gameResult.counts).map(([color, count]) => (
                                    <div key={color} className="text-center">
                                        <div className="text-xs text-gray-500 uppercase mb-1">{BALL_COLORS[color.toUpperCase()].name}</div>
                                        <div className="text-2xl font-bold" style={{ color: BALL_COLORS[color.toUpperCase()].hex }}>{count}</div>
                                    </div>
                                ))}
                            </div>

                            <div className="flex items-center justify-center gap-2 text-sm text-gray-400 mb-6">
                                <span>PATTERN:</span>
                                <span className="font-bold text-yellow-400 text-lg">{gameResult.pattern}</span>
                                <span className="bg-white/10 px-2 py-0.5 rounded text-xs">x{gameResult.multiplier}</span>
                            </div>

                            <button 
                                onClick={resetGame}
                                className="w-full py-4 bg-white text-black font-black text-lg rounded-lg hover:scale-105 transition-transform flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.3)]"
                            >
                                <RotateCcw size={20} /> REBOOT SYSTEM
                            </button>
                        </div>
                    </div>
                )}

                {/* Bottom Controls */}
                <div className="flex flex-col md:flex-row justify-between items-end pointer-events-auto gap-4">
                    
                    {/* Left Info */}
                    <div className="hidden md:block bg-black/60 backdrop-blur border border-white/10 p-4 rounded-lg">
                        <div className="text-[10px] text-gray-500 uppercase">Current Balance</div>
                        <div className="text-2xl text-white font-mono font-bold">${Math.floor(user.balance).toLocaleString()}</div>
                    </div>

                    {/* Main Action Area */}
                    <div className="w-full md:w-auto bg-black/80 backdrop-blur border-t-2 border-cyan-500/50 p-6 rounded-t-3xl md:rounded-2xl flex flex-col gap-4 shadow-[0_-10px_50px_rgba(0,255,255,0.15)] relative overflow-hidden">
                        {/* Glass Reflection */}
                        <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/5 to-transparent pointer-events-none"></div>

                        <div className="flex items-center justify-between gap-8">
                            {/* Bet Adjust */}
                            <div className="flex flex-col items-center">
                                <div className="text-cyan-500 text-[10px] font-bold uppercase tracking-widest mb-1">Energy Input</div>
                                <div className="flex items-center bg-black/50 rounded-lg border border-cyan-900">
                                    <button onClick={() => handleBetChange(-10)} disabled={gameState!=='IDLE'&&gameState!=='RESULT'} className="w-10 h-10 hover:bg-cyan-900/50 text-cyan-400 flex items-center justify-center text-xl disabled:opacity-30">-</button>
                                    <div className="w-20 text-center font-mono text-xl text-white font-bold">{bet}</div>
                                    <button onClick={() => handleBetChange(10)} disabled={gameState!=='IDLE'&&gameState!=='RESULT'} className="w-10 h-10 hover:bg-cyan-900/50 text-cyan-400 flex items-center justify-center text-xl disabled:opacity-30">+</button>
                                </div>
                            </div>

                            {/* Odds Button */}
                            <button onClick={() => setShowPayout(true)} className="flex flex-col items-center text-gray-400 hover:text-white transition-colors">
                                <Info size={20} />
                                <span className="text-[9px] mt-1 uppercase">Odds</span>
                            </button>
                        </div>

                        {/* Big Interaction Button */}
                        {/* 逻辑: 
                            IDLE/RESULT -> 点击 "INITIATE" 进入 SCRAMBLE
                            SCRAMBLE -> 显示 "HOLD TO SYNC"
                            SYNCING -> 松开即 "CAPTURE"
                        */}
                        {(gameState === 'IDLE' || gameState === 'RESULT') ? (
                            <button 
                                onClick={initSequence}
                                className="w-full h-16 bg-gradient-to-r from-cyan-600 to-blue-700 text-white font-black text-xl tracking-widest rounded-lg shadow-[0_0_20px_rgba(0,255,255,0.4)] hover:brightness-110 transition-all active:scale-95 flex items-center justify-center gap-2"
                            >
                                <Zap fill="white" /> INITIATE
                            </button>
                        ) : (gameState === 'SCRAMBLE' || gameState === 'SYNCING') ? (
                            <button
                                onMouseDown={startSync}
                                onMouseUp={triggerCapture}
                                onTouchStart={(e) => { e.preventDefault(); startSync(); }}
                                onTouchEnd={(e) => { e.preventDefault(); triggerCapture(); }}
                                className={`w-full h-16 font-black text-xl tracking-widest rounded-lg border-2 transition-all duration-100 flex items-center justify-center gap-2 select-none
                                    ${gameState === 'SYNCING' 
                                        ? 'bg-red-600 border-red-400 text-white scale-95 shadow-[0_0_30px_red]' 
                                        : 'bg-black border-cyan-400 text-cyan-400 animate-pulse shadow-[0_0_15px_cyan]'}
                                `}
                            >
                                {gameState === 'SYNCING' ? 'RELEASE NOW!' : 'HOLD TO SYNC'}
                            </button>
                        ) : (
                            <button disabled className="w-full h-16 bg-gray-800 text-gray-500 font-bold rounded-lg cursor-not-allowed border border-gray-700">
                                PROCESSING...
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <PayoutModal isOpen={showPayout} onClose={() => setShowPayout(false)} />
        </div>
    );
}