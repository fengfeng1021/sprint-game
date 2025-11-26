// src/ballgame/Scene3D.jsx
import React, { useRef, useEffect, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { PerspectiveCamera, Environment } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette, Noise } from '@react-three/postprocessing';
import * as THREE from 'three';
import gsap from 'gsap';

const QuantumBall = ({ data, index, total, gameState, finalPositions }) => {
    const meshRef = useRef();
    
    // 判断该球是否在最终结果中
    const isSelected = useMemo(() => {
        return finalPositions && finalPositions.some(b => b.uid === data.uid);
    }, [finalPositions, data.uid]);

    const initialPos = useMemo(() => {
        const phi = Math.acos(-1 + (2 * index) / total);
        const theta = Math.sqrt(total * Math.PI) * phi;
        const r = 5; 
        return new THREE.Vector3(
            r * Math.cos(theta) * Math.sin(phi),
            r * Math.sin(theta) * Math.sin(phi),
            r * Math.cos(phi)
        );
    }, [index, total]);


    // 随机旋转轴，用于 SCRAMBLE 状态
    const randomAxis = useMemo(() => {
        return new THREE.Vector3(Math.random()-0.5, Math.random()-0.5, Math.random()-0.5).normalize();
    }, []);

    useFrame((state, delta) => {
        if (!meshRef.current) return;
        const mesh = meshRef.current;

        if (gameState === 'IDLE') {
            // 待机：缓慢呼吸
            mesh.position.y += Math.sin(state.clock.elapsedTime * 2 + index) * 0.002;
            mesh.rotation.x += 0.005;
        } 
        else if (gameState === 'SCRAMBLE') {
            // 混乱：高速公转
            const speed = 5;
            mesh.position.applyAxisAngle(randomAxis, speed * delta);
        }
        else if (gameState === 'SYNCING') {
            // 同步：剧烈震动（充能感）
            mesh.position.x += (Math.random() - 0.5) * 0.2;
            mesh.position.y += (Math.random() - 0.5) * 0.2;
            mesh.position.z += (Math.random() - 0.5) * 0.2;
        }
    });

    // 监听游戏状态变化并执行 GSAP 动画
    useEffect(() => {
        if (!meshRef.current) return;
        const mesh = meshRef.current;

        if (gameState === 'IDLE' || gameState === 'SCRAMBLE') {
            // [关键修复] 连抽时直接进入 SCRAMBLE，必须在此处也重置透明度和发光度，否则球是隐形的
            gsap.to(mesh.material, { opacity: 1, emissiveIntensity: 1, duration: 0.5 });
            
            if (gameState === 'IDLE') {
                // 只有 IDLE 需要复位位置，SCRAMBLE 会由 useFrame 接管位置
                gsap.to(mesh.position, {
                    x: initialPos.x, y: initialPos.y, z: initialPos.z,
                    duration: 1.5, ease: "power2.inOut"
                });
            }
        } 
        else if (gameState === 'CHARGING') {
            // 充能震动
            gsap.to(mesh.position, {
                x: "+=0.1", y: "+=0.1", z: "+=0.1",
                duration: 0.1, yoyo: true, repeat: -1
            });
        }
        else if (gameState === 'EXTRACTION') {
            // 1. 爆发
            gsap.to(mesh.position, {
                x: mesh.position.x * 2, y: mesh.position.y * 2, z: mesh.position.z * 2,
                duration: 0.4, ease: "back.out(1.7)"
            });
            
            // 2. 漩涡中心 (这里简化为聚集到中心)
            gsap.to(mesh.position, {
                x: 0, y: 0, z: 0,
                duration: 0.5, delay: 0.5, ease: "power4.in"
            });
        }
        else if (gameState === 'REVEAL') {
            // 判断这个球是否在最终结果中
            const resultIndex = finalPositions.findIndex(b => b.uid === data.uid);
            
            if (resultIndex !== -1) {
                // 這裡的球是被選中的
                // 計算 1x9 線性位置 (從左到右排列)
                // 索引 0-8，減去 4 讓中心點為 0 (-4 到 +4)
                const targetX = (resultIndex - 4) * 1.4; 
                const targetY = 0; // 保持在垂直中心
                const targetZ = 6; // 推向鏡頭

                gsap.to(mesh.position, {
                    x: targetX, y: targetY, z: targetZ,
                    duration: 0.8, ease: "elastic.out(1, 0.5)", delay: index * 0.02
                });
                
                // 翻转特效
                gsap.to(mesh.rotation, {
                    y: Math.PI * 4, duration: 1.5, ease: "power2.out"
                });
                
                // 高亮
                gsap.to(mesh.material, {
                    emissiveIntensity: 8, duration: 0.5, yoyo: true, repeat: 1
                });

            } else {
                // 未选中的球退后并消失
                gsap.to(mesh.position, {
                    z: -20, duration: 1, ease: "power2.in"
                });
                gsap.to(mesh.material, {
                    opacity: 0, duration: 0.5, delay: 0.2
                });
            }
        }

    }, [gameState, initialPos, finalPositions, data.uid, index]);

    // 判断是否是中奖展示状态
    const isRevealing = gameState === 'REVEAL' || gameState === 'RESULT';
    // 如果是展示阶段且被选中，层级设为最高(100)，且关闭深度测试(depthTest=false)使其无视遮挡
    const renderOrder = (isRevealing && isSelected) ? 100 : 1;

    return (
        <mesh ref={meshRef} position={initialPos} renderOrder={renderOrder}>
            <sphereGeometry args={[0.6, 32, 32]} />
            <meshStandardMaterial 
                color={data.hex} 
                emissive={data.emissive}
                emissiveIntensity={1.5}
                roughness={0.2}
                metalness={0.9}
                transparent
                opacity={1}
                depthTest={!(isRevealing && isSelected)} // 选中球关闭深度测试，永远显示在最前
                depthWrite={true}
            />
        </mesh>
    );
};

const ForceField = ({ gameState }) => {
    const ref = useRef();
    
    useFrame((state, delta) => {
        if (ref.current) {
            // 根据状态改变旋转速度
            const speed = gameState === 'SCRAMBLE' ? 2 : (gameState === 'SYNCING' ? 5 : 0.1);
            ref.current.rotation.y += speed * delta;
            ref.current.rotation.z += speed * 0.5 * delta;
        }
    });

    useEffect(() => {
        if(ref.current) {
            const color = gameState === 'SYNCING' ? '#ff0055' : (gameState === 'SCRAMBLE' ? '#ffff00' : '#00aaff');
            const scale = gameState === 'SYNCING' ? 0.8 : 1; // 充能时收缩
            
            gsap.to(ref.current.material.color, { r: new THREE.Color(color).r, g: new THREE.Color(color).g, b: new THREE.Color(color).b, duration: 0.3 });
            gsap.to(ref.current.scale, { x: scale*8, y: scale*8, z: scale*8, duration: 0.3 });
        }
    }, [gameState]);

    return (
        <mesh ref={ref} scale={[8, 8, 8]} renderOrder={0}>
            <icosahedronGeometry args={[1, 4]} />
            <meshBasicMaterial wireframe color="#00aaff" transparent opacity={0.1} depthWrite={false} />
        </mesh>
    );
};

export default function BallGameScene({ deck, gameState, finalResult }) {
    // 简单的响应式判断
    const isMobile = window.innerWidth < 768;
    const camPos = [0, 0, isMobile ? 32 : 18];

    return (
        <Canvas dpr={[1, 2]} gl={{ antialias: false, toneMapping: THREE.ACESFilmicToneMapping }}>
            <PerspectiveCamera makeDefault position={camPos} fov={50} />
            <color attach="background" args={['#020203']} />
            
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={2} color="#ffffff" />
            <pointLight position={[-10, -10, -5]} intensity={2} color="#00ffff" />
            
            <group>
                <ForceField gameState={gameState} />
                {deck.map((ball, i) => (
                    <QuantumBall 
                        key={ball.uid} 
                        data={ball} 
                        index={i} 
                        total={deck.length} 
                        gameState={gameState}
                        finalPositions={finalResult ? finalResult.balls : []}
                    />
                ))}
            </group>

            {/* 后处理特效 */}
            <EffectComposer disableNormalPass>
                <Bloom luminanceThreshold={1} mipmapBlur intensity={1.5} radius={0.6} />
                <Noise opacity={0.05} />
                <Vignette eskil={false} offset={0.1} darkness={1.1} />
            </EffectComposer>
            
            {/* 稍微动一点的环境 */}
            <Environment preset="city" />
        </Canvas>
    );
}