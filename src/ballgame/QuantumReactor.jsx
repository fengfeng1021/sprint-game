// src/ballgame/QuantumReactor.jsx
import React, { useState, useEffect, useRef } from 'react';
import { LogOut, Zap, RotateCcw, Volume2, VolumeX, Activity, Info, X, Play, Loader2 } from 'lucide-react';
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

// --- RTP 模拟器组件 ---
const BallSimulatorModal = ({ isOpen, onClose }) => {
    const [simCount, setSimCount] = useState(1000);
    const [isRunning, setIsRunning] = useState(false);
    const [progress, setProgress] = useState(0);
    const [stats, setStats] = useState(null);

    const runSim = async () => {
        setIsRunning(true); setProgress(0); setStats(null);
        const logic = new QuantumReactorLogic(); // 新实例用于模拟
        const bet = 100;
        
        const tempStats = {
            runs: 0, totalBet: 0, totalWin: 0, maxWin: 0, maxMult: 0,
            winCounts: { "Zero": 0, "1-5x": 0, "5-10x": 0, "10x+": 0 }
        };

        setTimeout(() => {
            const totalRuns = simCount;
            const batchSize = 100;
            let currentRun = 0;

            const processBatch = () => {
                const end = Math.min(currentRun + batchSize, totalRuns);
                while(currentRun < end) {
                    currentRun++;
                    tempStats.runs++;
                    tempStats.totalBet += bet;
                    
                    const result = logic.draw();
                    const win = bet * result.multiplier;
                    
                    tempStats.totalWin += win;
                    if (win > tempStats.maxWin) tempStats.maxWin = win;
                    if (result.multiplier > tempStats.maxMult) tempStats.maxMult = result.multiplier;

                    if (result.multiplier === 0) tempStats.winCounts["Zero"]++;
                    else if (result.multiplier <= 5) tempStats.winCounts["1-5x"]++;
                    else if (result.multiplier <= 10) tempStats.winCounts["5-10x"]++;
                    else tempStats.winCounts["10x+"]++;
                }

                setProgress(Math.round((currentRun / totalRuns) * 100));

                if (currentRun < totalRuns) {
                    setTimeout(processBatch, 0);
                } else {
                    setStats(tempStats);
                    setIsRunning(false);
                }
            };
            processBatch();
        }, 50);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur flex items-center justify-center p-4 font-mono">
            <div className="bg-[#1c1917] border border-cyan-500 w-full max-w-2xl rounded-xl p-6 relative shadow-2xl">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white"><X size={24}/></button>
                <h2 className="text-xl font-bold text-cyan-400 mb-4 flex items-center gap-2"><Activity/> 反应堆模拟器 (Simulator)</h2>
                
                <div className="flex gap-4 mb-6">
                    <div className="flex gap-2 flex-grow">
                        <button onClick={() => setSimCount(1000)} className={`px-4 py-2 rounded border ${simCount===1000?'bg-cyan-900 border-cyan-500 text-white':'border-white/10 text-gray-400'}`}>1,000 次</button>
                        <button onClick={() => setSimCount(10000)} className={`px-4 py-2 rounded border ${simCount===10000?'bg-cyan-900 border-cyan-500 text-white':'border-white/10 text-gray-400'}`}>10,000 次</button>
                    </div>
                    <button onClick={runSim} disabled={isRunning} className="px-6 py-2 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded flex items-center gap-2 disabled:opacity-50">
                        {isRunning ? <Loader2 className="animate-spin"/> : <Play size={16}/>} 开始
                    </button>
                </div>

                {isRunning && <div className="w-full h-2 bg-gray-800 rounded mb-6"><div className="h-full bg-cyan-500 transition-all duration-75" style={{width: `${progress}%`}}></div></div>}

                {stats && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-in fade-in">
                        <div className="bg-black/40 p-3 rounded border border-white/10 text-center">
                            <div className="text-[10px] text-gray-500 uppercase">RTP (返还率)</div>
                            <div className={`text-2xl font-bold ${stats.totalWin/stats.totalBet > 1 ? 'text-red-500' : 'text-emerald-400'}`}>
                                {((stats.totalWin / stats.totalBet) * 100).toFixed(2)}%
                            </div>
                        </div>
                        <div className="bg-black/40 p-3 rounded border border-white/10 text-center">
                            <div className="text-[10px] text-gray-500 uppercase">最大赢分</div>
                            <div className="text-2xl font-bold text-[#fbbf24]">${stats.maxWin}</div>
                        </div>
                        <div className="bg-black/40 p-3 rounded border border-white/10 text-center">
                            <div className="text-[10px] text-gray-500 uppercase">最大倍数</div>
                            <div className="text-2xl font-bold text-purple-400">x{stats.maxMult}</div>
                        </div>
                        <div className="bg-black/40 p-3 rounded border border-white/10 text-center">
                            <div className="text-[10px] text-gray-500 uppercase">中奖率</div>
                            <div className="text-2xl font-bold text-white">{(((stats.runs - stats.winCounts.Zero)/stats.runs)*100).toFixed(1)}%</div>
                        </div>
                        
                        <div className="col-span-2 md:col-span-4 bg-black/40 p-3 rounded border border-white/10 mt-2">
                            <div className="text-xs text-gray-500 mb-2">分布详情</div>
                            <div className="flex justify-between text-xs">
                                <span className="text-gray-400">未中奖: {stats.winCounts["Zero"]}</span>
                                <span className="text-green-400">低倍(1-5x): {stats.winCounts["1-5x"]}</span>
                                <span className="text-blue-400">中倍(5-10x): {stats.winCounts["5-10x"]}</span>
                                <span className="text-yellow-400">高倍(10x+): {stats.winCounts["10x+"]}</span>
                            </div>
                        </div>
                    </div>
                )}
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
    const [showPayout, setShowPayout] = useState(false); // 手机端赔率表开关
    const [showSim, setShowSim] = useState(false); // 模拟器开关
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
            const sfx = result.isWin ? audioWin.current : new Audio('/sound/sprint.mp3'); // 输了播放普通音效
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
                <div className="flex justify-between items-start pointer-events-auto gap-2">
                    <div className="bg-black/60 backdrop-blur border-l-4 border-cyan-500 p-2 md:p-3 rounded-r-xl shadow-lg shadow-cyan-500/20">
                        <h1 className="text-cyan-400 font-bold text-lg md:text-xl tracking-widest">量子反應堆</h1>
                        <div className="text-[8px] md:text-[10px] text-cyan-700 uppercase tracking-[0.3em] md:tracking-[0.5em]">STATUS: {gameState}</div>
                    </div>
                    
                    <div className="flex gap-2 md:gap-3">
                        {/* 管理员模拟器按钮 */}
                        {user.role === 'admin' && (
                            <button onClick={() => setShowSim(true)} className="bg-purple-900/50 border border-purple-500 text-purple-300 p-2 md:p-3 rounded-full hover:bg-purple-900 transition-colors">
                                <Activity size={20} />
                            </button>
                        )}
                        
                        {/* 手机端赔率表按钮 (桌机隐藏) */}
                        <button onClick={() => setShowPayout(true)} className="md:hidden bg-blue-900/30 border border-blue-500/50 text-blue-400 p-2 rounded-full hover:bg-blue-900/50">
                            <Info size={20} />
                        </button>

                        <button onClick={() => setSoundEnabled(!soundEnabled)} className="bg-black/50 border border-white/10 text-cyan-400 p-2 md:p-3 rounded-full hover:bg-white/10 transition-colors">
                            {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
                        </button>
                        <button onClick={onBack} className="bg-red-900/20 border border-red-500/50 text-red-500 p-2 md:p-3 rounded-full hover:bg-red-900/50 transition-colors">
                            <LogOut size={20} />
                        </button>
                    </div>
                </div>

                {/* Center Messages */}
                <div className="absolute top-1/3 left-1/2 -translate-x-1/2 text-center pointer-events-none">
                    {gameState === 'SCRAMBLE' && (
                        <div className="text-cyan-200 text-opacity-80 animate-pulse tracking-[0.2em] text-sm">
                            系統不穩定... 等待同步
                        </div>
                    )}
                    {gameState === 'SYNCING' && (
                        <div className="text-red-400 font-black text-2xl animate-bounce tracking-widest drop-shadow-[0_0_10px_red]">
                            鬆開按鈕進行捕獲!
                        </div>
                    )}
                </div>

                {/* Result Overlay - 修改位置到底部，避免擋住中間的球 */}
                {gameState === 'RESULT' && gameResult && (
                    <div className="absolute bottom-32 left-1/2 -translate-x-1/2 pointer-events-auto text-center animate-in slide-in-from-bottom-10 duration-300 z-20 w-full max-w-md px-4">
                        <div className={`p-4 md:p-6 border-2 bg-black/80 backdrop-blur-md rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.8)] ${gameResult.isWin ? 'border-green-500 shadow-[0_0_30px_#00ff88]' : 'border-red-900 shadow-[0_0_20px_#ff0055]'}`}>
                            <div className="text-4xl md:text-6xl font-black mb-1 font-cinzel drop-shadow-lg" style={{ color: gameResult.isWin ? '#00ff88' : '#ff0055' }}>
                                {gameResult.isWin ? `獲勝` : '未中獎'}
                            </div>
                            {gameResult.isWin && <div className="text-2xl text-white font-mono mb-2 tracking-widest">${displayWin}</div>}
                            
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
                                className="w-full py-3 bg-white text-black font-black text-lg rounded-lg hover:scale-105 transition-transform flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.3)]"
                            >
                                <RotateCcw size={20} /> 重啟系統
                            </button>
                        </div>
                    </div>
                )}

                {/* Bottom Controls */}
                <div className="flex flex-col md:flex-row justify-between items-end pointer-events-auto gap-4">
                    
                    {/* Left Info */}
                    <div className="hidden md:block bg-black/60 backdrop-blur border border-white/10 p-4 rounded-lg">
                        <div className="text-[10px] text-gray-500 uppercase">當前餘額</div>
                        <div className="text-2xl text-white font-mono font-bold">${Math.floor(user.balance).toLocaleString()}</div>
                    </div>

                    {/* Main Action Area */}
                    <div className="w-full md:w-auto bg-black/80 backdrop-blur border-t-2 border-cyan-500/50 p-4 md:p-6 rounded-t-3xl md:rounded-2xl flex flex-col gap-4 shadow-[0_-10px_50px_rgba(0,255,255,0.15)] relative overflow-hidden">
                        
                        {/* 手机端: 将余额显示在这里，因为左侧栏被隐藏了 */}
                        <div className="md:hidden flex justify-between items-center border-b border-white/10 pb-2 mb-2">
                            <span className="text-xs text-gray-500 font-bold uppercase">BALANCE</span>
                            <span className="text-lg font-mono text-white font-bold">${Math.floor(user.balance).toLocaleString()}</span>
                        </div>

                        <div className="flex items-center justify-between gap-4 md:gap-8">
                            {/* Bet Adjust */}
                            <div className="flex flex-col items-center flex-grow md:flex-grow-0">
                                <div className="text-cyan-500 text-[10px] font-bold uppercase tracking-widest mb-1">能量投入</div>
                                <div className="flex items-center bg-black/50 rounded-lg border border-cyan-900 w-full justify-between md:justify-start">
                                    <button onClick={() => handleBetChange(-10)} disabled={gameState!=='IDLE'&&gameState!=='RESULT'} className="w-12 md:w-10 h-10 hover:bg-cyan-900/50 text-cyan-400 flex items-center justify-center text-xl disabled:opacity-30">-</button>
                                    <div className="w-16 md:w-20 text-center font-mono text-xl text-white font-bold">{bet}</div>
                                    <button onClick={() => handleBetChange(10)} disabled={gameState!=='IDLE'&&gameState!=='RESULT'} className="w-12 md:w-10 h-10 hover:bg-cyan-900/50 text-cyan-400 flex items-center justify-center text-xl disabled:opacity-30">+</button>
                                </div>
                            </div>
                        </div>

                        {/* Big Interaction Button */}
                        {(gameState === 'IDLE' || gameState === 'RESULT') ? (
                            <button 
                                onClick={initSequence}
                                className="w-full h-16 bg-gradient-to-r from-cyan-600 to-blue-700 text-white font-black text-xl tracking-widest rounded-lg shadow-[0_0_20px_rgba(0,255,255,0.4)] hover:brightness-110 transition-all active:scale-95 flex items-center justify-center gap-2"
                            >
                                <Zap fill="white" /> 啟動系統
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
                                {gameState === 'SYNCING' ? '鬆開按鈕!' : '按住充能'}
                            </button>
                        ) : (
                            <button disabled className="w-full h-16 bg-gray-800 text-gray-500 font-bold rounded-lg cursor-not-allowed border border-gray-700">
                                處理中...
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* 常駐右側賠率表 */}
{/* 模态框层 */}
            <PayoutModal isOpen={showPayout} onClose={() => setShowPayout(false)} />
            <BallSimulatorModal isOpen={showSim} onClose={() => setShowSim(false)} />

            {/* 常驻右侧赔率表 (仅桌面端) */}
            <div className="hidden md:block absolute top-20 right-4 bottom-32 w-56 bg-black/40 backdrop-blur border border-cyan-900/50 rounded-xl p-4 overflow-y-auto custom-scroll select-none pointer-events-none">                <h2 className="text-lg font-cinzel font-bold text-cyan-400 mb-3 text-center tracking-widest border-b border-cyan-900 pb-2">
                    系統賠率
                </h2>
                <div className="space-y-1.5 font-mono text-xs">
                    {Object.entries(PAYOUT_TABLE).sort((a,b) => b[1] - a[1]).map(([pattern, mult]) => (
                        <div key={pattern} className="flex justify-between items-center p-2 bg-cyan-900/20 rounded border border-cyan-900/30">
                            <div className="flex gap-1">
                                {pattern.split(':').map((count, i) => (
                                    <span key={i} className={`font-bold ${i===0?'text-cyan-300':i===1?'text-pink-400':'text-green-400'}`}>{count}</span>
                                ))}
                            </div>
                            <div className="text-yellow-400 font-bold">x{mult}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}