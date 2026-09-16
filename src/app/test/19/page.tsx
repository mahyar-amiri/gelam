"use client";

import React, { useState, useRef, useEffect, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
    Text,
    RoundedBox,
    Edges,
    Environment,
    ScrollControls,
    Html,
    useScroll,
} from "@react-three/drei";
import * as THREE from "three";
import {
    Lock,
    Unlock,
    MousePointerClick,
    ChevronDown,
    Sparkles,
    Layers,
    Cpu,
} from "lucide-react";

type Phase = "inspect" | "locked" | "unlocked" | "scrolled";

interface InteractiveCubeProps {
    inspectBadgeRef: React.RefObject<HTMLDivElement | null>;
    lockedBadgeRef: React.RefObject<HTMLDivElement | null>;
    unlockedBadgeRef: React.RefObject<HTMLDivElement | null>;
}

export const InteractiveCube: React.FC<InteractiveCubeProps> = ({
    inspectBadgeRef,
    lockedBadgeRef,
    unlockedBadgeRef,
}) => {
    const meshRef = useRef<THREE.Mesh>(null);
    const groupRef = useRef<THREE.Group>(null);
    const materialRef = useRef<THREE.MeshPhysicalMaterial>(null);
    const edgeMaterialRef = useRef<THREE.LineBasicMaterial>(null);
    const topTextRef = useRef<any>(null);
    const rightTextRef = useRef<any>(null);

    const [isUnlocked, setIsUnlocked] = useState(false);
    const hoveredRef = useRef(false);
    const clickPunchRef = useRef(0);
    const phaseRef = useRef<Phase>("inspect");

    const { camera } = useThree();
    const scrollData = useScroll();

    const customFontUrl = "/hpf.ttf";

    useEffect(() => {
        return () => {
            document.body.style.cursor = "auto";
        };
    }, []);

    useFrame((state, delta) => {
        const lockScrollPx = scrollData.el.clientHeight;
        let currentScroll = scrollData.el.scrollTop;

        // Enforce hard scroll lock at 1st viewport until unlocked
        if (!isUnlocked && currentScroll >= lockScrollPx) {
            scrollData.el.scrollTop = lockScrollPx;
            currentScroll = lockScrollPx;
        }

        const scrollProgress = THREE.MathUtils.clamp(currentScroll / lockScrollPx, 0, 1);
        const extraScroll = Math.max(0, currentScroll - lockScrollPx);

        // Direct material and text opacity mutations (no React re-renders)
        const targetOpacity = THREE.MathUtils.clamp(scrollProgress / 0.25, 0, 1);
        if (materialRef.current) materialRef.current.opacity = targetOpacity;
        if (edgeMaterialRef.current) edgeMaterialRef.current.opacity = targetOpacity;
        if (topTextRef.current) topTextRef.current.fillOpacity = targetOpacity;
        if (rightTextRef.current) rightTextRef.current.fillOpacity = targetOpacity;

        // Determine active lock/UI phase
        let currentPhase: Phase = "inspect";
        if (!isUnlocked) {
            currentPhase = scrollProgress >= 0.95 ? "locked" : "inspect";
        } else {
            currentPhase = extraScroll < 200 ? "unlocked" : "scrolled";
        }

        // Direct DOM toggling for badge overlays
        if (phaseRef.current !== currentPhase) {
            phaseRef.current = currentPhase;
            if (inspectBadgeRef.current) {
                inspectBadgeRef.current.style.display = currentPhase === "inspect" ? "flex" : "none";
            }
            if (lockedBadgeRef.current) {
                lockedBadgeRef.current.style.display = currentPhase === "locked" ? "flex" : "none";
            }
            if (unlockedBadgeRef.current) {
                unlockedBadgeRef.current.style.display = currentPhase === "unlocked" ? "flex" : "none";
            }
        }

        const isClickable = phaseRef.current === "locked" && !isUnlocked;
        if (!isClickable && hoveredRef.current) {
            hoveredRef.current = false;
            document.body.style.cursor = "auto";
        }

        // 1. Camera Dolly: Pull back from z=3 to z=6
        const targetCameraZ = THREE.MathUtils.lerp(3, 6, scrollProgress);
        camera.position.z = THREE.MathUtils.damp(camera.position.z, targetCameraZ, 6, delta);

        // 2. Cube Orientation & Parallax
        if (groupRef.current) {
            const targetRotX = THREE.MathUtils.lerp(0, 0.35, scrollProgress);
            const targetRotY = THREE.MathUtils.lerp(0, 0.65, scrollProgress);

            groupRef.current.rotation.x = THREE.MathUtils.damp(
                groupRef.current.rotation.x,
                targetRotX,
                6,
                delta
            );
            groupRef.current.rotation.y = THREE.MathUtils.damp(
                groupRef.current.rotation.y,
                targetRotY,
                6,
                delta
            );

            const targetPosY = THREE.MathUtils.lerp(0, -extraScroll * 0.003, 0.1);
            groupRef.current.position.y = THREE.MathUtils.damp(
                groupRef.current.position.y,
                targetPosY,
                5,
                delta
            );
        }

        // 3. Click Bounce & Hover Scaling
        if (meshRef.current) {
            if (clickPunchRef.current > 0) {
                clickPunchRef.current = Math.max(0, clickPunchRef.current - delta * 2.5);
                const punchScale = 1 + Math.sin(clickPunchRef.current * Math.PI) * 0.2;
                meshRef.current.scale.setScalar(punchScale);
            } else {
                const isHovered = hoveredRef.current && isClickable;
                const hoverScale = isHovered ? 1.05 : 1.0;
                meshRef.current.scale.lerp(new THREE.Vector3(hoverScale, hoverScale, hoverScale), 0.1);
            }
        }
    });

    const handleClick = () => {
        if (phaseRef.current === "locked" && !isUnlocked) {
            clickPunchRef.current = 1;
            setIsUnlocked(true);
            document.body.style.cursor = "auto";
            if (edgeMaterialRef.current) {
                edgeMaterialRef.current.color.set("#10b981");
            }
        }
    };

    return (
        <>
            <group ref={groupRef}>
                <RoundedBox
                    ref={meshRef}
                    args={[2.2, 2.2, 2.2]}
                    radius={0.08}
                    smoothness={4}
                    onClick={handleClick}
                    onPointerOver={(e) => {
                        e.stopPropagation();
                        if (phaseRef.current === "locked" && !isUnlocked) {
                            hoveredRef.current = true;
                            document.body.style.cursor = "pointer";
                            if (materialRef.current) materialRef.current.color.set("#1e2029");
                            if (edgeMaterialRef.current) edgeMaterialRef.current.color.set("#60a5fa");
                        }
                    }}
                    onPointerOut={() => {
                        hoveredRef.current = false;
                        document.body.style.cursor = "auto";
                        if (materialRef.current) materialRef.current.color.set("#0d0e12");
                        if (edgeMaterialRef.current) {
                            edgeMaterialRef.current.color.set(isUnlocked ? "#10b981" : "#3b82f6");
                        }
                    }}
                >
                    {/* Obsidian Body */}
                    <meshPhysicalMaterial
                        ref={materialRef}
                        transparent
                        opacity={0}
                        color="#0d0e12"
                        metalness={0.85}
                        roughness={0.2}
                        clearcoat={0.6}
                        clearcoatRoughness={0.2}
                        reflectivity={0.9}
                    />

                    {/* Glowing Wireframe */}
                    <Edges threshold={15}>
                        <lineBasicMaterial
                            ref={edgeMaterialRef}
                            transparent
                            opacity={0}
                            color={isUnlocked ? "#10b981" : "#3b82f6"}
                        />
                    </Edges>

                    {/* Front Face Text */}
                    <Text
                        font={customFontUrl}
                        position={[0, 0, 1.11]}
                        fontSize={0.34}
                        maxWidth={1.9}
                        lineHeight={1.2}
                        letterSpacing={0.06}
                        textAlign="center"
                        anchorX="center"
                        anchorY="middle"
                        color="#ffffff"
                        fillOpacity={1}
                    >
                        {isUnlocked ? "UNLOCKED\nEXPLORE" : "CLICK TO\nUNLOCK"}
                    </Text>

                    {/* Top Face Accent */}
                    <Text
                        ref={topTextRef}
                        font={customFontUrl}
                        position={[0, 1.11, 0]}
                        rotation={[-Math.PI / 2, 0, 0]}
                        fontSize={0.2}
                        color="#60a5fa"
                        fillOpacity={0}
                        anchorX="center"
                        anchorY="middle"
                    >
                        SYS // R3F
                    </Text>

                    {/* Right Face Accent */}
                    <Text
                        ref={rightTextRef}
                        font={customFontUrl}
                        position={[1.11, 0, 0]}
                        rotation={[0, Math.PI / 2, 0]}
                        fontSize={0.2}
                        color="#93c5fd"
                        fillOpacity={0}
                        anchorX="center"
                        anchorY="middle"
                    >
                        THREE.JS
                    </Text>
                </RoundedBox>
            </group>

            {/* Content Portaled into Drei's Native Scroll Element */}
            <Html
                portal={{ current: scrollData.el }}
                fullscreen
                className="w-full"
                wrapperClass="!w-full !left-0 !top-0"
                style={{ pointerEvents: "none", width: "100%" }}
            >
                {/* 100vh spacer for Phase 1 inspection */}
                <div className="h-screen w-full bg-red-500/5" />

                {/* Main content revealed upon unlocking */}
                <div className="w-full pointer-events-auto bg-green-500/5">
                    <main
                        className={`relative z-10 max-w-5xl mx-auto px-6 py-20 flex flex-col gap-28 transition-opacity duration-700
                            ${isUnlocked ? "opacity-100" : "opacity-0 pointer-events-none"}
                        `}
                    >
                        {/* Section 1: Overview Cards */}
                        <section>
                            <div className="text-center mb-12">
                                <span className="text-blue-400 text-sm tracking-[2px] font-semibold uppercase">
                                    WebGL Architecture
                                </span>
                                <h2 className="text-4xl md:text-5xl font-bold mt-3 tracking-tight text-white">
                                    Seamless 3D Spatial Interactions
                                </h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {[
                                    {
                                        icon: <Layers className="size-7 text-blue-400" />,
                                        title: "React Three Fiber",
                                        desc: "Declarative Three.js components fully tied into React component lifecycle and state.",
                                    },
                                    {
                                        icon: <Sparkles className="size-7 text-emerald-400" />,
                                        title: "Troika Custom Typography",
                                        desc: "Signed-distance-field vector text rendered in 3D with direct custom WOFF/TTF font loading.",
                                    },
                                    {
                                        icon: <Cpu className="size-7 text-pink-400" />,
                                        title: "Controlled Scroll Locks",
                                        desc: "Deterministic checkpoint locking allowing interactive 3D inspection before page progression.",
                                    },
                                ].map((card, i) => (
                                    <div
                                        key={i}
                                        className="bg-white/3 border border-white/8 rounded-2xl p-8 backdrop-blur-md transition-all duration-200 hover:-translate-y-1 hover:border-white/20 hover:bg-white/5"
                                    >
                                        <div className="mb-4">{card.icon}</div>
                                        <h3 className="text-xl font-semibold mb-2 text-white">{card.title}</h3>
                                        <p className="text-slate-400 text-sm leading-relaxed">{card.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Section 2: Technical Specs */}
                        <section className="bg-white/2 border border-white/6 rounded-3xl p-8 md:p-12 backdrop-blur-md">
                            <h3 className="text-2xl md:text-3xl font-bold mb-8 text-white">
                                Runtime Performance & Specs
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                                <div>
                                    <div className="text-4xl font-bold text-blue-400">60 FPS</div>
                                    <div className="text-slate-400 text-sm mt-1">Lerped Frame Rates</div>
                                </div>
                                <div>
                                    <div className="text-4xl font-bold text-emerald-400">0ms</div>
                                    <div className="text-slate-400 text-sm mt-1">Scroll Jitter Overshoot</div>
                                </div>
                                <div>
                                    <div className="text-4xl font-bold text-purple-400">100%</div>
                                    <div className="text-slate-400 text-sm mt-1">TypeScript Type Safety</div>
                                </div>
                            </div>
                        </section>

                        {/* Section 3: Footer */}
                        <footer className="text-center py-10 border-t border-white/8 text-slate-500 text-sm">
                            Built with React, Three.js, React Three Fiber & Drei.
                        </footer>
                    </main>
                </div>
            </Html>
        </>
    );
};

export default function Page() {
    const inspectBadgeRef = useRef<HTMLDivElement>(null);
    const lockedBadgeRef = useRef<HTMLDivElement>(null);
    const unlockedBadgeRef = useRef<HTMLDivElement>(null);

    return (
        <div className="relative w-screen h-screen bg-[#070709] text-white font-['Space_Grotesk',sans-serif] overflow-hidden">
            {/* 3D Canvas Layer */}
            <Canvas camera={{ position: [0, 0, 3], fov: 50 }} className="size-full">
                <color attach="background" args={["#070709"]} />
                <ambientLight intensity={1.5} />
                <directionalLight position={[10, 10, 5]} intensity={1.5} color="#ffffff" />
                <pointLight position={[-5, -5, -5]} intensity={0.8} color="#3b82f6" />
                <pointLight position={[0, 4, 3]} intensity={1.2} color="#60a5fa" />
                <Environment preset="city" />

                <ScrollControls pages={5} damping={0.2}>
                    <Suspense fallback={null}>
                        <InteractiveCube
                            inspectBadgeRef={inspectBadgeRef}
                            lockedBadgeRef={lockedBadgeRef}
                            unlockedBadgeRef={unlockedBadgeRef}
                        />
                    </Suspense>
                </ScrollControls>
            </Canvas>

            {/* Instruction Badges */}
            <div className="fixed bottom-9 left-1/2 -translate-x-1/2 z-20 pointer-events-none flex flex-col items-center gap-2">
                <div
                    ref={inspectBadgeRef}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/8 backdrop-blur-md border border-white/10 text-sm text-slate-400 shadow-lg"
                >
                    <ChevronDown className="size-4" />
                    <span>Scroll down to inspect</span>
                </div>

                <div
                    ref={lockedBadgeRef}
                    style={{ display: "none" }}
                    className="items-center gap-2 px-5 py-2.5 rounded-full bg-red-500/15 backdrop-blur-md border border-red-500/40 text-red-400 text-sm font-medium shadow-[0_0_20px_rgba(239,68,68,0.25)] animate-pulse"
                >
                    <Lock className="size-4" />
                    <span>Scroll Locked. Click the cube to continue</span>
                    <MousePointerClick className="size-4" />
                </div>

                <div
                    ref={unlockedBadgeRef}
                    style={{ display: "none" }}
                    className="items-center gap-2 px-5 py-2.5 rounded-full bg-emerald-500/15 backdrop-blur-md border border-emerald-500/40 text-emerald-400 text-sm font-medium shadow-[0_0_20px_rgba(16,185,129,0.25)]"
                >
                    <Unlock className="size-4" />
                    <span>Scroll Unlocked — Scroll down to explore</span>
                    <ChevronDown className="size-4" />
                </div>
            </div>
        </div>
    );
}