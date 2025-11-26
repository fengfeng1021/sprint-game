import React, { useState, useEffect } from 'react';
import { User, Lock, LogIn, Loader2 } from 'lucide-react';

// Firebase SDK
import { initializeApp } from "firebase/app";
import { getAuth, signInAnonymously, onAuthStateChanged } from "firebase/auth";
import { getFirestore, collection, doc, getDoc, setDoc, onSnapshot, updateDoc } from "firebase/firestore";

// 引入游戏子组件
import GamePlatformLobby from './Lobby';
import SethCasinoGame from './SethGame';
// [关键修复] 修正引用路径
import QuantumReactor from './ballgame/QuantumReactor';

// --- 1. Firebase 配置 ---
const firebaseConfig = {
    apiKey: "AIzaSyD5a41T_dk-k8iEIxaoAQcET5noB6Zy0ko",
    authDomain: "aiapp-93616.firebaseapp.com",
    projectId: "aiapp-93616",
    storageBucket: "aiapp-93616.firebasestorage.app",
    messagingSenderId: "144618205398",
    appId: "1:144618205398:web:f27098e35e4f5424279977",
    measurementId: "G-67RXLTP8QN"
};

const APP_ID = 'seth-casino-v1';
const COL_USERS = 'users';
const COL_CONFIG = 'config';
const DEFAULT_USERS = [
    { id: 'admin', name: '系统管理员', password: 'admin', role: 'admin', balance: 0 },
    { id: 'player1', name: '测试玩家一号', password: '1234', role: 'player', balance: 50000 },
];

// 初始化 Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// --- 2. 登入画面组件 ---
function LoginScreen({ onLogin, loading }) {
    const [id, setId] = useState('');
    const [pass, setPass] = useState('');

    return (
        <div className="fixed inset-0 w-full h-full bg-[#0f0500] flex items-center justify-center p-4 font-noto">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#2d1b0e_0%,_#0f0500_100%)] z-0 opacity-50"></div>
            <div className="w-full max-w-md bg-[#1c1917] border border-[#fbbf24]/30 p-8 rounded-2xl shadow-2xl relative z-10 animate-in fade-in zoom-in duration-300">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-cinzel font-bold text-[#fbbf24] tracking-widest mb-2">SETH PLATFORM</h1>
                    <p className="text-gray-500 text-sm tracking-wide uppercase">Cloud Gaming System</p>
                </div>
                <div className="space-y-6">
                    <div>
                        <label className="block text-xs text-gray-400 uppercase mb-2 font-bold">User ID</label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                            <input type="text" value={id} onChange={e => setId(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-lg py-3 pl-10 pr-4 text-white focus:border-[#fbbf24] outline-none transition-colors" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs text-gray-400 uppercase mb-2 font-bold">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                            <input type="password" value={pass} onChange={e => setPass(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-lg py-3 pl-10 pr-4 text-white focus:border-[#fbbf24] outline-none transition-colors" />
                        </div>
                    </div>
                    <button onClick={() => onLogin(id, pass)} disabled={loading} className="w-full bg-gradient-to-r from-[#b45309] to-[#fbbf24] text-black font-bold py-3 rounded-lg hover:brightness-110 transition-all flex items-center justify-center gap-2 shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed">
                        {loading ? <Loader2 className="animate-spin" /> : <><LogIn size={18} /> LOGIN</>}
                    </button>
                </div>
            </div>
        </div>
    );
}

// --- 3. 主程序组件 ---
export default function App() {
    const [userAuth, setUserAuth] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentView, setCurrentView] = useState('login'); 

    // A. 匿名登入 Firebase Auth
    useEffect(() => {
        signInAnonymously(auth);
        const unsubscribe = onAuthStateChanged(auth, (u) => setUserAuth(u));
        return () => unsubscribe();
    }, []);

    // B. 监听 Firestore 用户资料
    useEffect(() => {
        if (!userAuth) return;
        const usersRef = collection(db, 'apps', APP_ID, COL_USERS);
        const unsubscribe = onSnapshot(usersRef, (snap) => {
            const list = [];
            snap.forEach(d => list.push(d.data()));
            if (list.length === 0) {
                DEFAULT_USERS.forEach(u => setDoc(doc(db, 'apps', APP_ID, COL_USERS, u.id), u));
            }
            if (currentUser) {
                const freshData = list.find(u => u.id === currentUser.id);
                if (freshData) {
                    setCurrentUser(prev => ({ ...prev, ...freshData }));
                }
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, [userAuth, currentUser?.id]); 

    // 处理登入
    const handleLogin = async (id, pass) => {
        setLoading(true);
        try {
            const userRef = doc(db, 'apps', APP_ID, COL_USERS, id);
            const snap = await getDoc(userRef);
            if (snap.exists() && snap.data().password === pass) {
                setCurrentUser(snap.data());
                setCurrentView('lobby'); 
            } else {
                alert("账号或密码错误");
            }
        } catch (e) { 
            console.error(e); 
            alert("登入错误 (请检查 Firebase 设定): " + e.message); 
        }
        setLoading(false);
    };

    // 处理登出
    const handleLogout = () => {
        setCurrentUser(null);
        setCurrentView('login');
    };

    // 视图渲染路由
    const renderContent = () => {
        if (!currentUser) {
            return <LoginScreen onLogin={handleLogin} loading={loading} />;
        }
        switch (currentView) {
            case 'lobby':
                return (
                    <GamePlatformLobby 
                        user={currentUser} 
                        onSelectGame={(id) => setCurrentView(`game-${id}`)} 
                        onLogout={handleLogout} 
                    />
                );
            case 'game-seth':
                return (
                    <SethCasinoGame 
                        user={currentUser} 
                        onBack={() => setCurrentView('lobby')} 
                        db={db} 
                        APP_ID={APP_ID} 
                        COL_CONFIG={COL_CONFIG} 
                        COL_USERS={COL_USERS} 
                    />
                );
            // [新增] QuantumReactor (BallGame) 的路由
            case 'game-ball':
                return (
                    <QuantumReactor 
                        user={currentUser} 
                        onBack={() => setCurrentView('lobby')} 
                        onUpdateBalance={(newBal) => {
                            // 更新本地状态以获得即时反馈
                            setCurrentUser(prev => ({ ...prev, balance: newBal }));
                            // 异步更新 Firebase
                            const userRef = doc(db, 'apps', APP_ID, COL_USERS, currentUser.id);
                            updateDoc(userRef, { balance: newBal }).catch(console.error);
                        }}
                    />
                );
            default:
                return <div className="text-white p-10">Error: Unknown View {currentView}</div>;
        }
    };

    return (
        <div className="w-full h-screen bg-black text-white font-noto overflow-hidden">
            {renderContent()}
        </div>
    );
}