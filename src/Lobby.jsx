import React from 'react';
import { LogOut, Coins, Flame, Play, Lock, Zap } from 'lucide-react';

export default function GamePlatformLobby({ user, onSelectGame, onLogout }) {
    return (
        <div className="min-h-screen bg-[#0f0500] text-white font-noto flex flex-col items-center p-4 md:p-8 animate-in fade-in">
            
            <div className="w-full max-w-6xl flex justify-between items-center mb-12 border-b border-[#fbbf24]/30 pb-6">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#fbbf24] to-[#b45309] flex items-center justify-center text-black font-bold text-xl shadow-lg border border-white/20">
                        {user.name ? user.name[0].toUpperCase() : 'U'}
                    </div>
                    <div>
                        <div className="text-xl font-bold text-white">{user.name}</div>
                        <div className="text-sm text-[#fbbf24] font-mono flex items-center gap-1">
                            <Coins size={14}/> ${Math.floor(user.balance).toLocaleString()}
                        </div>
                    </div>
                </div>
                <button onClick={onLogout} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors bg-white/5 px-4 py-2 rounded-full hover:bg-white/10 border border-white/5">
                    <LogOut size={18} /> <span className="hidden md:inline">登出平台</span>
                </button>
            </div>

            <div className="text-center mb-12">
                <div className="text-[#fbbf24] text-xs font-bold tracking-[0.5em] mb-2 uppercase">Welcome to Seth Games</div>
                <h1 className="text-4xl md:text-6xl font-cinzel font-bold text-transparent bg-clip-text bg-gradient-to-b from-[#fff7ed] via-[#fbbf24] to-[#b45309] tracking-widest drop-shadow-lg">
                    GAME LOBBY
                </h1>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-6xl px-4">
                
                {/* 游戏卡片 1: 赛特传说 */}
                <button 
                    onClick={() => onSelectGame('seth')}
                    className="group relative aspect-[3/4] rounded-2xl overflow-hidden border-2 border-[#fbbf24]/30 hover:border-[#fbbf24] transition-all duration-500 hover:scale-105 hover:shadow-[0_0_50px_rgba(251,191,36,0.4)] bg-[#1c1917] text-left"
                >
                    <img 
    src="/images/golden-seth.jpg" // <-- 將 `./` 替換為 `/`
    className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity duration-500 scale-105 group-hover:scale-110" 
/>
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent"></div>
                    
                    <div className="absolute bottom-0 left-0 w-full p-8">
                        <div className="text-[#fbbf24] text-[10px] font-bold tracking-[0.2em] mb-2 flex items-center gap-2 bg-black/50 w-fit px-2 py-1 rounded backdrop-blur">
                            <Flame size={12} className="text-rose-500" /> POPULAR
                        </div>
                        <div className="text-3xl font-cinzel font-bold text-white mb-2 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">SETH CASINO</div>
                        <p className="text-xs text-gray-300 line-clamp-2 mb-6 opacity-80">
                            探索古埃及神的宝藏，触发无限消除与千倍奖励！
                        </p>
                        <div className="inline-flex items-center gap-2 bg-[#fbbf24] text-black px-6 py-3 rounded-lg text-sm font-bold group-hover:bg-white group-hover:scale-105 transition-all shadow-lg">
                            <Play size={16} fill="black" /> 开始游戏
                        </div>
                    </div>
                </button>

                {/* 游戏卡片 2: 量子反应堆 */}
                <button 
                    onClick={() => onSelectGame('ball')}
                    className="group relative aspect-[3/4] rounded-2xl overflow-hidden border-2 border-cyan-500/30 hover:border-cyan-400 transition-all duration-500 hover:scale-105 hover:shadow-[0_0_50px_rgba(0,255,255,0.2)] bg-[#050a10] text-left"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-black via-[#001a20] to-[#003340]">
                        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'linear-gradient(0deg, transparent 24%, rgba(0, 255, 255, .3) 25%, rgba(0, 255, 255, .3) 26%, transparent 27%, transparent 74%, rgba(0, 255, 255, .3) 75%, rgba(0, 255, 255, .3) 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, rgba(0, 255, 255, .3) 25%, rgba(0, 255, 255, .3) 26%, transparent 27%, transparent 74%, rgba(0, 255, 255, .3) 75%, rgba(0, 255, 255, .3) 76%, transparent 77%, transparent)', backgroundSize: '50px 50px' }}></div>
                    </div>
                    
                    <div className="absolute bottom-0 left-0 w-full p-8">
                        <div className="text-cyan-400 text-[10px] font-bold tracking-[0.2em] mb-2 flex items-center gap-2 bg-cyan-900/30 w-fit px-2 py-1 rounded backdrop-blur border border-cyan-500/30">
                            <Zap size={12} /> NEW ARRIVAL
                        </div>
                        <div className="text-3xl font-cinzel font-bold text-white mb-2 drop-shadow-[0_0_10px_rgba(0,255,255,0.5)]">QUANTUM REACTOR</div>
                        <p className="text-xs text-gray-400 line-clamp-2 mb-6 opacity-80">
                            抽取能量球体，匹配颜色序列。高科技全息视觉体验。
                        </p>
                        <div className="inline-flex items-center gap-2 bg-cyan-500 text-black px-6 py-3 rounded-lg text-sm font-bold group-hover:bg-white group-hover:scale-105 transition-all shadow-[0_0_20px_rgba(0,255,255,0.4)]">
                            <Play size={16} fill="black" /> 启动系统
                        </div>
                    </div>
                </button>

                {/* 游戏卡片 3: 敬请期待 */}
                <div className="group relative aspect-[3/4] rounded-2xl overflow-hidden border-2 border-white/5 bg-white/5 flex flex-col items-center justify-center text-gray-500 cursor-not-allowed">
                    <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[length:20px_20px] opacity-20"></div>
                    <Lock size={48} className="mb-4 opacity-50" />
                    <span className="font-cinzel font-bold tracking-widest text-xl">COMING SOON</span>
                    <div className="mt-2 text-xs uppercase tracking-wider opacity-50">Poker / Baccarat</div>
                </div>

            </div>
        </div>
    );
}