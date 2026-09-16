// // // "use client";

// // // import React, { useState, useRef, useEffect, Suspense, Component, type ReactNode } from "react";
// // // import { Canvas, useFrame, useThree } from "@react-three/fiber";
// // // import {
// // //     Text,
// // //     RoundedBox,
// // //     Edges,
// // //     Environment,
// // //     ScrollControls,
// // //     Html,
// // //     useScroll,
// // //     useProgress,
// // // } from "@react-three/drei";
// // // import * as THREE from "three";
// // // import {
// // //     Lock,
// // //     Unlock,
// // //     MousePointerClick,
// // //     ChevronDown,
// // //     Sparkles,
// // //     Layers,
// // //     Cpu,
// // //     RefreshCw,
// // //     AlertCircle,
// // // } from "lucide-react";

// // // type Phase = "inspect" | "locked" | "unlocked" | "scrolled";

// // // // --- Scene Error Boundary ---
// // // interface ErrorBoundaryProps {
// // //     children: ReactNode;
// // //     resetKey: number;
// // //     onError: (error: Error) => void;
// // // }

// // // interface ErrorBoundaryState {
// // //     hasError: boolean;
// // // }

// // // class SceneErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
// // //     constructor(props: ErrorBoundaryProps) {
// // //         super(props);
// // //         this.state = { hasError: false };
// // //     }

// // //     static getDerivedStateFromError(): ErrorBoundaryState {
// // //         return { hasError: true };
// // //     }

// // //     componentDidCatch(error: Error) {
// // //         this.props.onError(error);
// // //     }

// // //     componentDidUpdate(prevProps: ErrorBoundaryProps) {
// // //         if (prevProps.resetKey !== this.props.resetKey && this.state.hasError) {
// // //             this.setState({ hasError: false });
// // //         }
// // //     }

// // //     render() {
// // //         if (this.state.hasError) {
// // //             return null; // Suppress canvas crash; outer CenterLoader displays the error state
// // //         }
// // //         return this.props.children;
// // //     }
// // // }

// // // // --- Center Loading Screen Component with Retry Support ---
// // // interface CenterLoaderProps {
// // //     errorMessage: string | null;
// // //     onRetry: () => void;
// // // }

// // // function CenterLoader({ errorMessage, onRetry }: CenterLoaderProps) {
// // //     const { active, progress, errors } = useProgress();
// // //     const [visible, setVisible] = useState(true);

// // //     const hasFailed = Boolean(errorMessage || errors.length > 0);

// // //     useEffect(() => {
// // //         if (!hasFailed && !active && progress === 100) {
// // //             const timer = setTimeout(() => setVisible(false), 600);
// // //             return () => clearTimeout(timer);
// // //         } else if (active || hasFailed) {
// // //             setVisible(true);
// // //         }
// // //     }, [active, progress, hasFailed]);

// // //     if (!visible) return null;

// // //     const isDone = !hasFailed && !active && progress === 100;

// // //     return (
// // //         <div
// // //             className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-black transition-opacity duration-500
// // //                 ${isDone ? "opacity-0 pointer-events-none" : "opacity-100"}
// // //             `}
// // //         >
// // //             <div className="flex flex-col items-center gap-5 max-w-sm px-6 text-center">
// // //                 {hasFailed ? (
// // //                     <>
// // //                         {/* Error Warning Badge */}
// // //                         <div className="size-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 mb-1 shadow-[0_0_25px_rgba(239,68,68,0.2)]">
// // //                             <AlertCircle className="size-8" />
// // //                         </div>

// // //                         <div className="space-y-1.5">
// // //                             <h3 className="text-xl font-bold text-white tracking-tight">
// // //                                 Failed to Load 3D Assets
// // //                             </h3>
// // //                             <p className="text-xs text-slate-400 leading-relaxed">
// // //                                 {errorMessage || "An asset failed to download. Please check your network connection and try again."}
// // //                             </p>
// // //                         </div>

// // //                         {/* Retry Action */}
// // //                         <button
// // //                             onClick={onRetry}
// // //                             className="mt-2 inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-medium text-sm transition-all duration-150 shadow-[0_0_20px_rgba(37,99,235,0.4)] cursor-pointer"
// // //                         >
// // //                             <RefreshCw className="size-4" />
// // //                             <span>Try Again</span>
// // //                         </button>
// // //                     </>
// // //                 ) : (
// // //                     <>
// // //                         {/* Large Center Percentage */}
// // //                         <div className="flex items-baseline font-mono font-bold tracking-tight text-white">
// // //                             <span className="text-6xl md:text-7xl">
// // //                                 {Math.floor(progress)}
// // //                             </span>
// // //                             <span className="text-2xl md:text-3xl text-blue-500 ml-1.5">%</span>
// // //                         </div>

// // //                         {/* Progress Bar */}
// // //                         <div className="w-56 h-1.5 bg-white/10 rounded-full overflow-hidden backdrop-blur-sm">
// // //                             <div
// // //                                 className="h-full bg-blue-500 rounded-full transition-all duration-200 ease-out shadow-[0_0_14px_rgba(59,130,246,0.9)]"
// // //                                 style={{ width: `${progress}%` }}
// // //                             />
// // //                         </div>

// // //                         {/* Subtitle Status */}
// // //                         <span className="text-xs uppercase tracking-[0.25em] text-slate-400 font-medium animate-pulse">
// // //                             {isDone ? "Ready" : "Loading Assets & Scene"}
// // //                         </span>
// // //                     </>
// // //                 )}
// // //             </div>
// // //         </div>
// // //     );
// // // }

// // // interface InteractiveCubeProps {
// // //     inspectBadgeRef: React.RefObject<HTMLDivElement | null>;
// // //     lockedBadgeRef: React.RefObject<HTMLDivElement | null>;
// // //     unlockedBadgeRef: React.RefObject<HTMLDivElement | null>;
// // // }

// // // export const InteractiveCube: React.FC<InteractiveCubeProps> = ({
// // //     inspectBadgeRef,
// // //     lockedBadgeRef,
// // //     unlockedBadgeRef,
// // // }) => {
// // //     const meshRef = useRef<THREE.Mesh>(null);
// // //     const groupRef = useRef<THREE.Group>(null);
// // //     const materialRef = useRef<THREE.MeshPhysicalMaterial>(null);
// // //     const edgeMaterialRef = useRef<THREE.LineBasicMaterial>(null);
// // //     const topTextRef = useRef<any>(null);
// // //     const rightTextRef = useRef<any>(null);

// // //     const [isUnlocked, setIsUnlocked] = useState(false);
// // //     const hoveredRef = useRef(false);
// // //     const clickPunchRef = useRef(0);
// // //     const phaseRef = useRef<Phase>("inspect");

// // //     const { camera } = useThree();
// // //     const scrollData = useScroll();

// // //     const customFontUrl = "/hpf.ttf";

// // //     useEffect(() => {
// // //         return () => {
// // //             document.body.style.cursor = "auto";
// // //         };
// // //     }, []);

// // //     useFrame((state, delta) => {
// // //         const lockScrollPx = scrollData.el.clientHeight;
// // //         let currentScroll = scrollData.el.scrollTop;

// // //         // Enforce hard scroll lock at 1st viewport until unlocked
// // //         if (!isUnlocked && currentScroll >= lockScrollPx) {
// // //             scrollData.el.scrollTop = lockScrollPx;
// // //             currentScroll = lockScrollPx;
// // //         }

// // //         const scrollProgress = THREE.MathUtils.clamp(currentScroll / lockScrollPx, 0, 1);
// // //         const extraScroll = Math.max(0, currentScroll - lockScrollPx);

// // //         // Direct material and text opacity mutations (no React re-renders)
// // //         const targetOpacity = THREE.MathUtils.clamp(scrollProgress / 0.25, 0, 1);
// // //         if (materialRef.current) materialRef.current.opacity = targetOpacity;
// // //         if (edgeMaterialRef.current) edgeMaterialRef.current.opacity = targetOpacity;
// // //         if (topTextRef.current) topTextRef.current.fillOpacity = targetOpacity;
// // //         if (rightTextRef.current) rightTextRef.current.fillOpacity = targetOpacity;

// // //         // Determine active lock/UI phase
// // //         let currentPhase: Phase = "inspect";
// // //         if (!isUnlocked) {
// // //             currentPhase = scrollProgress >= 0.95 ? "locked" : "inspect";
// // //         } else {
// // //             currentPhase = extraScroll < 200 ? "unlocked" : "scrolled";
// // //         }

// // //         // Direct DOM toggling for badge overlays
// // //         if (phaseRef.current !== currentPhase) {
// // //             phaseRef.current = currentPhase;
// // //             if (inspectBadgeRef.current) {
// // //                 inspectBadgeRef.current.style.display = currentPhase === "inspect" ? "flex" : "none";
// // //             }
// // //             if (lockedBadgeRef.current) {
// // //                 lockedBadgeRef.current.style.display = currentPhase === "locked" ? "flex" : "none";
// // //             }
// // //             if (unlockedBadgeRef.current) {
// // //                 unlockedBadgeRef.current.style.display = currentPhase === "unlocked" ? "flex" : "none";
// // //             }
// // //         }

// // //         const isClickable = phaseRef.current === "locked" && !isUnlocked;
// // //         if (!isClickable && hoveredRef.current) {
// // //             hoveredRef.current = false;
// // //             document.body.style.cursor = "auto";
// // //         }

// // //         // 1. Camera Dolly: Pull back from z=3 to z=6
// // //         const targetCameraZ = THREE.MathUtils.lerp(3, 6, scrollProgress);
// // //         camera.position.z = THREE.MathUtils.damp(camera.position.z, targetCameraZ, 6, delta);

// // //         // 2. Cube Orientation & Parallax
// // //         if (groupRef.current) {
// // //             const targetRotX = THREE.MathUtils.lerp(0, 0.35, scrollProgress);
// // //             const targetRotY = THREE.MathUtils.lerp(0, 0.65, scrollProgress);

// // //             groupRef.current.rotation.x = THREE.MathUtils.damp(
// // //                 groupRef.current.rotation.x,
// // //                 targetRotX,
// // //                 6,
// // //                 delta
// // //             );
// // //             groupRef.current.rotation.y = THREE.MathUtils.damp(
// // //                 groupRef.current.rotation.y,
// // //                 targetRotY,
// // //                 6,
// // //                 delta
// // //             );

// // //             const targetPosY = THREE.MathUtils.lerp(0, -extraScroll * 0.003, 0.1);
// // //             groupRef.current.position.y = THREE.MathUtils.damp(
// // //                 groupRef.current.position.y,
// // //                 targetPosY,
// // //                 5,
// // //                 delta
// // //             );
// // //         }

// // //         // 3. Click Bounce & Hover Scaling
// // //         if (meshRef.current) {
// // //             if (clickPunchRef.current > 0) {
// // //                 clickPunchRef.current = Math.max(0, clickPunchRef.current - delta * 2.5);
// // //                 const punchScale = 1 + Math.sin(clickPunchRef.current * Math.PI) * 0.2;
// // //                 meshRef.current.scale.setScalar(punchScale);
// // //             } else {
// // //                 const isHovered = hoveredRef.current && isClickable;
// // //                 const hoverScale = isHovered ? 1.05 : 1.0;
// // //                 meshRef.current.scale.lerp(new THREE.Vector3(hoverScale, hoverScale, hoverScale), 0.1);
// // //             }
// // //         }
// // //     });

// // //     const handleClick = () => {
// // //         if (phaseRef.current === "locked" && !isUnlocked) {
// // //             clickPunchRef.current = 1;
// // //             setIsUnlocked(true);
// // //             document.body.style.cursor = "auto";
// // //             if (edgeMaterialRef.current) {
// // //                 edgeMaterialRef.current.color.set("#10b981");
// // //             }
// // //         }
// // //     };

// // //     return (
// // //         <>
// // //             <group ref={groupRef}>
// // //                 <RoundedBox
// // //                     ref={meshRef}
// // //                     args={[2.2, 2.2, 2.2]}
// // //                     radius={0.08}
// // //                     smoothness={4}
// // //                     onClick={handleClick}
// // //                     onPointerOver={(e) => {
// // //                         e.stopPropagation();
// // //                         if (phaseRef.current === "locked" && !isUnlocked) {
// // //                             hoveredRef.current = true;
// // //                             document.body.style.cursor = "pointer";
// // //                             if (materialRef.current) materialRef.current.color.set("#1e2029");
// // //                             if (edgeMaterialRef.current) edgeMaterialRef.current.color.set("#60a5fa");
// // //                         }
// // //                     }}
// // //                     onPointerOut={() => {
// // //                         hoveredRef.current = false;
// // //                         document.body.style.cursor = "auto";
// // //                         if (materialRef.current) materialRef.current.color.set("#0d0e12");
// // //                         if (edgeMaterialRef.current) {
// // //                             edgeMaterialRef.current.color.set(isUnlocked ? "#10b981" : "#3b82f6");
// // //                         }
// // //                     }}
// // //                 >
// // //                     {/* Obsidian Body */}
// // //                     <meshPhysicalMaterial
// // //                         ref={materialRef}
// // //                         transparent
// // //                         opacity={0}
// // //                         color="#0d0e12"
// // //                         metalness={0.85}
// // //                         roughness={0.2}
// // //                         clearcoat={0.6}
// // //                         clearcoatRoughness={0.2}
// // //                         reflectivity={0.9}
// // //                     />

// // //                     {/* Glowing Wireframe */}
// // //                     <Edges threshold={15}>
// // //                         <lineBasicMaterial
// // //                             ref={edgeMaterialRef}
// // //                             transparent
// // //                             opacity={0}
// // //                             color={isUnlocked ? "#10b981" : "#3b82f6"}
// // //                         />
// // //                     </Edges>

// // //                     {/* Front Face Text */}
// // //                     <Text
// // //                         font={customFontUrl}
// // //                         position={[0, 0, 1.11]}
// // //                         fontSize={0.34}
// // //                         maxWidth={1.9}
// // //                         lineHeight={1.2}
// // //                         letterSpacing={0.06}
// // //                         textAlign="center"
// // //                         anchorX="center"
// // //                         anchorY="middle"
// // //                         color="#ffffff"
// // //                         fillOpacity={1}
// // //                     >
// // //                         {isUnlocked ? "UNLOCKED\nEXPLORE" : "CLICK TO\nUNLOCK"}
// // //                     </Text>

// // //                     {/* Top Face Accent */}
// // //                     <Text
// // //                         ref={topTextRef}
// // //                         font={customFontUrl}
// // //                         position={[0, 1.11, 0]}
// // //                         rotation={[-Math.PI / 2, 0, 0]}
// // //                         fontSize={0.2}
// // //                         color="#60a5fa"
// // //                         fillOpacity={0}
// // //                         anchorX="center"
// // //                         anchorY="middle"
// // //                     >
// // //                         SYS // R3F
// // //                     </Text>

// // //                     {/* Right Face Accent */}
// // //                     <Text
// // //                         ref={rightTextRef}
// // //                         font={customFontUrl}
// // //                         position={[1.11, 0, 0]}
// // //                         rotation={[0, Math.PI / 2, 0]}
// // //                         fontSize={0.2}
// // //                         color="#93c5fd"
// // //                         fillOpacity={0}
// // //                         anchorX="center"
// // //                         anchorY="middle"
// // //                     >
// // //                         THREE.JS
// // //                     </Text>
// // //                 </RoundedBox>
// // //             </group>

// // //             {/* Content Portaled into Drei's Native Scroll Element */}
// // //             <Html
// // //                 portal={{ current: scrollData.el }}
// // //                 fullscreen
// // //                 className="w-full"
// // //                 wrapperClass="!w-full !left-0 !top-0"
// // //                 style={{ pointerEvents: "none", width: "100%" }}
// // //             >
// // //                 {/* 100vh spacer for Phase 1 inspection */}
// // //                 <div className="h-screen w-full bg-red-500/5" />

// // //                 {/* Main content revealed upon unlocking */}
// // //                 <div className="w-full pointer-events-auto bg-green-500/5">
// // //                     <main
// // //                         className={`relative z-10 max-w-5xl mx-auto px-6 py-20 flex flex-col gap-28 transition-opacity duration-700
// // //                             ${isUnlocked ? "opacity-100" : "opacity-0 pointer-events-none"}
// // //                         `}
// // //                     >
// // //                         {/* Section 1: Overview Cards */}
// // //                         <section>
// // //                             <div className="text-center mb-12">
// // //                                 <span className="text-blue-400 text-sm tracking-[2px] font-semibold uppercase">
// // //                                     WebGL Architecture
// // //                                 </span>
// // //                                 <h2 className="text-4xl md:text-5xl font-bold mt-3 tracking-tight text-white">
// // //                                     Seamless 3D Spatial Interactions
// // //                                 </h2>
// // //                             </div>

// // //                             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
// // //                                 {[
// // //                                     {
// // //                                         icon: <Layers className="size-7 text-blue-400" />,
// // //                                         title: "React Three Fiber",
// // //                                         desc: "Declarative Three.js components fully tied into React component lifecycle and state.",
// // //                                     },
// // //                                     {
// // //                                         icon: <Sparkles className="size-7 text-emerald-400" />,
// // //                                         title: "Troika Custom Typography",
// // //                                         desc: "Signed-distance-field vector text rendered in 3D with direct custom WOFF/TTF font loading.",
// // //                                     },
// // //                                     {
// // //                                         icon: <Cpu className="size-7 text-pink-400" />,
// // //                                         title: "Controlled Scroll Locks",
// // //                                         desc: "Deterministic checkpoint locking allowing interactive 3D inspection before page progression.",
// // //                                     },
// // //                                 ].map((card, i) => (
// // //                                     <div
// // //                                         key={i}
// // //                                         className="bg-white/3 border border-white/8 rounded-2xl p-8 backdrop-blur-md transition-all duration-200 hover:-translate-y-1 hover:border-white/20 hover:bg-white/5"
// // //                                     >
// // //                                         <div className="mb-4">{card.icon}</div>
// // //                                         <h3 className="text-xl font-semibold mb-2 text-white">{card.title}</h3>
// // //                                         <p className="text-slate-400 text-sm leading-relaxed">{card.desc}</p>
// // //                                     </div>
// // //                                 ))}
// // //                             </div>
// // //                         </section>

// // //                         {/* Section 2: Technical Specs */}
// // //                         <section className="bg-white/2 border border-white/6 rounded-3xl p-8 md:p-12 backdrop-blur-md">
// // //                             <h3 className="text-2xl md:text-3xl font-bold mb-8 text-white">
// // //                                 Runtime Performance & Specs
// // //                             </h3>
// // //                             <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
// // //                                 <div>
// // //                                     <div className="text-4xl font-bold text-blue-400">60 FPS</div>
// // //                                     <div className="text-slate-400 text-sm mt-1">Lerped Frame Rates</div>
// // //                                 </div>
// // //                                 <div>
// // //                                     <div className="text-4xl font-bold text-emerald-400">0ms</div>
// // //                                     <div className="text-slate-400 text-sm mt-1">Scroll Jitter Overshoot</div>
// // //                                 </div>
// // //                                 <div>
// // //                                     <div className="text-4xl font-bold text-purple-400">100%</div>
// // //                                     <div className="text-slate-400 text-sm mt-1">TypeScript Type Safety</div>
// // //                                 </div>
// // //                             </div>
// // //                         </section>

// // //                         {/* Section 3: Footer */}
// // //                         <footer className="text-center py-10 border-t border-white/8 text-slate-500 text-sm">
// // //                             Built with React, Three.js, React Three Fiber & Drei.
// // //                         </footer>
// // //                     </main>
// // //                 </div>
// // //             </Html>
// // //         </>
// // //     );
// // // };

// // // export default function Page() {
// // //     const [retryKey, setRetryKey] = useState(0);
// // //     const [errorMessage, setErrorMessage] = useState<string | null>(null);

// // //     const inspectBadgeRef = useRef<HTMLDivElement>(null);
// // //     const lockedBadgeRef = useRef<HTMLDivElement>(null);
// // //     const unlockedBadgeRef = useRef<HTMLDivElement>(null);

// // //     const handleRetry = () => {
// // //         // 1. Wipe cached Three.js assets so files are requested freshly
// // //         THREE.Cache.clear();
// // //         // 2. Clear error state
// // //         setErrorMessage(null);
// // //         // 3. Increment key to completely remount the Canvas and Suspense tree
// // //         setRetryKey((prev) => prev + 1);
// // //     };

// // //     return (
// // //         <div className="relative w-screen h-screen bg-[#070709] text-white font-['Space_Grotesk',sans-serif] overflow-hidden">
// // //             {/* Center Loading & Error Screen */}
// // //             <CenterLoader errorMessage={errorMessage} onRetry={handleRetry} />

// // //             {/* 3D Canvas Layer wrapped in Error Boundary */}
// // //             <SceneErrorBoundary
// // //                 resetKey={retryKey}
// // //                 onError={(error) => setErrorMessage(error.message || "Failed to load 3D assets")}
// // //             >
// // //                 <Canvas
// // //                     key={retryKey}
// // //                     camera={{ position: [0, 0, 3], fov: 50 }}
// // //                     className="size-full"
// // //                 >
// // //                     <color attach="background" args={["#070709"]} />
// // //                     <ambientLight intensity={1.5} />
// // //                     <directionalLight position={[10, 10, 5]} intensity={1.5} color="#ffffff" />
// // //                     <pointLight position={[-5, -5, -5]} intensity={0.8} color="#3b82f6" />
// // //                     <pointLight position={[0, 4, 3]} intensity={1.2} color="#60a5fa" />
// // //                     <Environment preset="city" />

// // //                     <ScrollControls pages={5} damping={0.2}>
// // //                         <Suspense fallback={null}>
// // //                             <InteractiveCube
// // //                                 inspectBadgeRef={inspectBadgeRef}
// // //                                 lockedBadgeRef={lockedBadgeRef}
// // //                                 unlockedBadgeRef={unlockedBadgeRef}
// // //                             />
// // //                         </Suspense>
// // //                     </ScrollControls>
// // //                 </Canvas>
// // //             </SceneErrorBoundary>

// // //             {/* Instruction Badges */}
// // //             <div className="fixed bottom-9 left-1/2 -translate-x-1/2 z-20 pointer-events-none flex flex-col items-center gap-2">
// // //                 <div
// // //                     ref={inspectBadgeRef}
// // //                     className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/8 backdrop-blur-md border border-white/10 text-sm text-slate-400 shadow-lg"
// // //                 >
// // //                     <ChevronDown className="size-4" />
// // //                     <span>Scroll down to inspect</span>
// // //                 </div>

// // //                 <div
// // //                     ref={lockedBadgeRef}
// // //                     style={{ display: "none" }}
// // //                     className="items-center gap-2 px-5 py-2.5 rounded-full bg-red-500/15 backdrop-blur-md border border-red-500/40 text-red-400 text-sm font-medium shadow-[0_0_20px_rgba(239,68,68,0.25)] animate-pulse"
// // //                 >
// // //                     <Lock className="size-4" />
// // //                     <span>Scroll Locked. Click the cube to continue</span>
// // //                     <MousePointerClick className="size-4" />
// // //                 </div>

// // //                 <div
// // //                     ref={unlockedBadgeRef}
// // //                     style={{ display: "none" }}
// // //                     className="items-center gap-2 px-5 py-2.5 rounded-full bg-emerald-500/15 backdrop-blur-md border border-emerald-500/40 text-emerald-400 text-sm font-medium shadow-[0_0_20px_rgba(16,185,129,0.25)]"
// // //                 >
// // //                     <Unlock className="size-4" />
// // //                     <span>Scroll Unlocked — Scroll down to explore</span>
// // //                     <ChevronDown className="size-4" />
// // //                 </div>
// // //             </div>
// // //         </div>
// // //     );
// // // }


// // "use client";

// // import React, { useState, useRef, useEffect, Suspense, Component, type ReactNode } from "react";
// // import { Canvas, useFrame, useThree } from "@react-three/fiber";
// // import {
// //     Text,
// //     RoundedBox,
// //     Edges,
// //     Environment,
// //     ScrollControls,
// //     Html,
// //     useScroll,
// //     useProgress,
// // } from "@react-three/drei";
// // import * as THREE from "three";
// // import {
// //     Lock,
// //     Unlock,
// //     MousePointerClick,
// //     ChevronDown,
// //     Sparkles,
// //     Layers,
// //     Cpu,
// //     RefreshCw,
// //     AlertCircle,
// // } from "lucide-react";

// // type Phase = "inspect" | "locked" | "unlocked" | "scrolled";

// // // --- Scene Error Boundary ---
// // interface ErrorBoundaryProps {
// //     children: ReactNode;
// //     resetKey: number;
// //     onError: (error: Error) => void;
// // }

// // interface ErrorBoundaryState {
// //     hasError: boolean;
// // }

// // class SceneErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
// //     constructor(props: ErrorBoundaryProps) {
// //         super(props);
// //         this.state = { hasError: false };
// //     }

// //     static getDerivedStateFromError(): ErrorBoundaryState {
// //         return { hasError: true };
// //     }

// //     componentDidCatch(error: Error) {
// //         this.props.onError(error);
// //     }

// //     componentDidUpdate(prevProps: ErrorBoundaryProps) {
// //         if (prevProps.resetKey !== this.props.resetKey && this.state.hasError) {
// //             this.setState({ hasError: false });
// //         }
// //     }

// //     render() {
// //         if (this.state.hasError) {
// //             return null; // Suppress canvas crash; outer CenterLoader displays the error state
// //         }
// //         return this.props.children;
// //     }
// // }

// // // --- Center Loading Screen Component with Retry Support ---
// // interface CenterLoaderProps {
// //     errorMessage: string | null;
// //     onRetry: () => void;
// // }

// // function CenterLoader({ errorMessage, onRetry }: CenterLoaderProps) {
// //     const { active, progress, errors } = useProgress();
// //     const [visible, setVisible] = useState(true);

// //     const hasFailed = Boolean(errorMessage || errors.length > 0);

// //     useEffect(() => {
// //         if (!hasFailed && !active && progress === 100) {
// //             const timer = setTimeout(() => setVisible(false), 600);
// //             return () => clearTimeout(timer);
// //         } else if (active || hasFailed) {
// //             setVisible(true);
// //         }
// //     }, [active, progress, hasFailed]);

// //     if (!visible) return null;

// //     const isDone = !hasFailed && !active && progress === 100;

// //     return (
// //         <div
// //             className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-black transition-opacity duration-500
// //                 ${isDone ? "opacity-0 pointer-events-none" : "opacity-100"}
// //             `}
// //         >
// //             <div className="flex flex-col items-center gap-5 max-w-sm px-6 text-center">
// //                 {hasFailed ? (
// //                     <>
// //                         {/* Error Warning Badge */}
// //                         <div className="size-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 mb-1 shadow-[0_0_25px_rgba(239,68,68,0.2)]">
// //                             <AlertCircle className="size-8" />
// //                         </div>

// //                         <div className="space-y-1.5">
// //                             <h3 className="text-xl font-bold text-white tracking-tight">
// //                                 Failed to Load 3D Assets
// //                             </h3>
// //                             <p className="text-xs text-slate-400 leading-relaxed">
// //                                 {errorMessage || "An asset failed to download. Please check your network connection and try again."}
// //                             </p>
// //                         </div>

// //                         {/* Retry Action */}
// //                         <button
// //                             onClick={onRetry}
// //                             className="mt-2 inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-medium text-sm transition-all duration-150 shadow-[0_0_20px_rgba(37,99,235,0.4)] cursor-pointer"
// //                         >
// //                             <RefreshCw className="size-4" />
// //                             <span>Try Again</span>
// //                         </button>
// //                     </>
// //                 ) : (
// //                     <>
// //                         {/* Large Center Percentage */}
// //                         <div className="flex items-baseline font-mono font-bold tracking-tight text-white">
// //                             <span className="text-6xl md:text-7xl">
// //                                 {Math.floor(progress)}
// //                             </span>
// //                             <span className="text-2xl md:text-3xl text-blue-500 ml-1.5">%</span>
// //                         </div>

// //                         {/* Progress Bar */}
// //                         <div className="w-56 h-1.5 bg-white/10 rounded-full overflow-hidden backdrop-blur-sm">
// //                             <div
// //                                 className="h-full bg-blue-500 rounded-full transition-all duration-200 ease-out shadow-[0_0_14px_rgba(59,130,246,0.9)]"
// //                                 style={{ width: `${progress}%` }}
// //                             />
// //                         </div>

// //                         {/* Subtitle Status */}
// //                         <span className="text-xs uppercase tracking-[0.25em] text-slate-400 font-medium animate-pulse">
// //                             {isDone ? "Ready" : "Loading Assets & Scene"}
// //                         </span>
// //                     </>
// //                 )}
// //             </div>
// //         </div>
// //     );
// // }

// // interface InteractiveCubeProps {
// //     inspectBadgeRef: React.RefObject<HTMLDivElement | null>;
// //     lockedBadgeRef: React.RefObject<HTMLDivElement | null>;
// //     unlockedBadgeRef: React.RefObject<HTMLDivElement | null>;
// // }

// // export const InteractiveCube: React.FC<InteractiveCubeProps> = ({
// //     inspectBadgeRef,
// //     lockedBadgeRef,
// //     unlockedBadgeRef,
// // }) => {
// //     const meshRef = useRef<THREE.Mesh>(null);
// //     const groupRef = useRef<THREE.Group>(null);
// //     const materialRef = useRef<THREE.MeshPhysicalMaterial>(null);
// //     const edgeMaterialRef = useRef<THREE.LineBasicMaterial>(null);
// //     const topTextRef = useRef<any>(null);
// //     const rightTextRef = useRef<any>(null);

// //     const [isUnlocked, setIsUnlocked] = useState(false);
// //     const isUnlockedRef = useRef(false);
// //     const hoveredRef = useRef(false);
// //     const clickPunchRef = useRef(0);
// //     const phaseRef = useRef<Phase>("inspect");

// //     const { camera } = useThree();
// //     const scrollData = useScroll();

// //     const customFontUrl = "/hpf.ttf";

// //     useEffect(() => {
// //         return () => {
// //             document.body.style.cursor = "auto";
// //         };
// //     }, []);

// //     useFrame((state, delta) => {
// //         const lockScrollPx = scrollData.el.clientHeight;
// //         let currentScroll = scrollData.el.scrollTop;

// //         // Enforce hard scroll lock at 1st viewport until unlocked
// //         if (!isUnlockedRef.current && currentScroll >= lockScrollPx) {
// //             scrollData.el.scrollTop = lockScrollPx;
// //             currentScroll = lockScrollPx;
// //         }

// //         const scrollProgress = THREE.MathUtils.clamp(currentScroll / lockScrollPx, 0, 1);
// //         const extraScroll = Math.max(0, currentScroll - lockScrollPx);

// //         // Direct material and text opacity mutations
// //         const targetOpacity = THREE.MathUtils.clamp(scrollProgress / 0.25, 0, 1);
// //         if (materialRef.current) materialRef.current.opacity = targetOpacity;
// //         if (edgeMaterialRef.current) edgeMaterialRef.current.opacity = targetOpacity;
// //         if (topTextRef.current) topTextRef.current.fillOpacity = targetOpacity;
// //         if (rightTextRef.current) rightTextRef.current.fillOpacity = targetOpacity;

// //         // Determine active lock/UI phase
// //         let currentPhase: Phase = "inspect";
// //         if (!isUnlockedRef.current) {
// //             currentPhase = scrollProgress >= 0.95 ? "locked" : "inspect";
// //         } else {
// //             currentPhase = extraScroll < 200 ? "unlocked" : "scrolled";
// //         }

// //         // Direct DOM toggling for badge overlays
// //         if (phaseRef.current !== currentPhase) {
// //             phaseRef.current = currentPhase;
// //             if (inspectBadgeRef.current) {
// //                 inspectBadgeRef.current.style.display = currentPhase === "inspect" ? "flex" : "none";
// //             }
// //             if (lockedBadgeRef.current) {
// //                 lockedBadgeRef.current.style.display = currentPhase === "locked" ? "flex" : "none";
// //             }
// //             if (unlockedBadgeRef.current) {
// //                 unlockedBadgeRef.current.style.display = currentPhase === "unlocked" ? "flex" : "none";
// //             }
// //         }

// //         const isClickable = phaseRef.current === "locked" && !isUnlockedRef.current;
// //         if (!isClickable && hoveredRef.current) {
// //             hoveredRef.current = false;
// //             document.body.style.cursor = "auto";
// //         }

// //         // 1. Camera Dolly: Pull back from z=3 to z=6
// //         const targetCameraZ = THREE.MathUtils.lerp(3, 6, scrollProgress);
// //         camera.position.z = THREE.MathUtils.damp(camera.position.z, targetCameraZ, 6, delta);

// //         // 2. Cube Orientation & Parallax
// //         if (groupRef.current) {
// //             const targetRotX = THREE.MathUtils.lerp(0, 0.35, scrollProgress);
// //             const targetRotY = THREE.MathUtils.lerp(0, 0.65, scrollProgress);

// //             groupRef.current.rotation.x = THREE.MathUtils.damp(
// //                 groupRef.current.rotation.x,
// //                 targetRotX,
// //                 6,
// //                 delta
// //             );
// //             groupRef.current.rotation.y = THREE.MathUtils.damp(
// //                 groupRef.current.rotation.y,
// //                 targetRotY,
// //                 6,
// //                 delta
// //             );

// //             const targetPosY = THREE.MathUtils.lerp(0, -extraScroll * 0.003, 0.1);
// //             groupRef.current.position.y = THREE.MathUtils.damp(
// //                 groupRef.current.position.y,
// //                 targetPosY,
// //                 5,
// //                 delta
// //             );
// //         }

// //         // 3. Click Bounce & Hover Scaling
// //         if (meshRef.current) {
// //             if (clickPunchRef.current > 0) {
// //                 clickPunchRef.current = Math.max(0, clickPunchRef.current - delta * 2.5);
// //                 const punchScale = 1 + Math.sin(clickPunchRef.current * Math.PI) * 0.2;
// //                 meshRef.current.scale.setScalar(punchScale);
// //             } else {
// //                 const isHovered = hoveredRef.current && isClickable;
// //                 const hoverScale = isHovered ? 1.05 : 1.0;
// //                 meshRef.current.scale.lerp(new THREE.Vector3(hoverScale, hoverScale, hoverScale), 0.1);
// //             }
// //         }
// //     });

// //     const handleClick = () => {
// //         if (phaseRef.current === "locked" && !isUnlockedRef.current) {
// //             clickPunchRef.current = 1;
// //             isUnlockedRef.current = true;
// //             setIsUnlocked(true);
// //             document.body.style.cursor = "auto";
// //             if (edgeMaterialRef.current) {
// //                 edgeMaterialRef.current.color.set("#10b981");
// //             }

// //             // Smoothly scroll down ~400px over 2 seconds
// //             const startScroll = scrollData.el.scrollTop;
// //             const scrollDistance = Math.min(scrollData.el.clientHeight * 0.45, 450);
// //             const targetScroll = startScroll + scrollDistance;
// //             const duration = 1000;
// //             const startTime = performance.now();

// //             const easeInOutCubic = (t: number) =>
// //                 t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

// //             const animateScroll = (currentTime: number) => {
// //                 const elapsed = currentTime - startTime;
// //                 const progress = Math.min(elapsed / duration, 1);
// //                 scrollData.el.scrollTop = startScroll + (targetScroll - startScroll) * easeInOutCubic(progress);

// //                 if (progress < 1) {
// //                     requestAnimationFrame(animateScroll);
// //                 }
// //             };

// //             requestAnimationFrame(animateScroll);
// //         }
// //     };

// //     return (
// //         <>
// //             <group ref={groupRef}>
// //                 <RoundedBox
// //                     ref={meshRef}
// //                     args={[2.2, 2.2, 2.2]}
// //                     radius={0.08}
// //                     smoothness={4}
// //                     onClick={handleClick}
// //                     onPointerOver={(e) => {
// //                         e.stopPropagation();
// //                         if (phaseRef.current === "locked" && !isUnlockedRef.current) {
// //                             hoveredRef.current = true;
// //                             document.body.style.cursor = "pointer";
// //                             if (materialRef.current) materialRef.current.color.set("#1e2029");
// //                             if (edgeMaterialRef.current) edgeMaterialRef.current.color.set("#60a5fa");
// //                         }
// //                     }}
// //                     onPointerOut={() => {
// //                         hoveredRef.current = false;
// //                         document.body.style.cursor = "auto";
// //                         if (materialRef.current) materialRef.current.color.set("#0d0e12");
// //                         if (edgeMaterialRef.current) {
// //                             edgeMaterialRef.current.color.set(isUnlockedRef.current ? "#10b981" : "#3b82f6");
// //                         }
// //                     }}
// //                 >
// //                     {/* Obsidian Body */}
// //                     <meshPhysicalMaterial
// //                         ref={materialRef}
// //                         transparent
// //                         opacity={0}
// //                         color="#0d0e12"
// //                         metalness={0.85}
// //                         roughness={0.2}
// //                         clearcoat={0.6}
// //                         clearcoatRoughness={0.2}
// //                         reflectivity={0.9}
// //                     />

// //                     {/* Glowing Wireframe */}
// //                     <Edges threshold={15}>
// //                         <lineBasicMaterial
// //                             ref={edgeMaterialRef}
// //                             transparent
// //                             opacity={0}
// //                             color={isUnlocked ? "#10b981" : "#3b82f6"}
// //                         />
// //                     </Edges>

// //                     {/* Front Face Text */}
// //                     <Text
// //                         font={customFontUrl}
// //                         position={[0, 0, 1.11]}
// //                         fontSize={0.34}
// //                         maxWidth={1.9}
// //                         lineHeight={1.2}
// //                         letterSpacing={0.06}
// //                         textAlign="center"
// //                         anchorX="center"
// //                         anchorY="middle"
// //                         color="#ffffff"
// //                         fillOpacity={1}
// //                     >
// //                         {isUnlocked ? "UNLOCKED\nEXPLORE" : "CLICK TO\nUNLOCK"}
// //                     </Text>

// //                     {/* Top Face Accent */}
// //                     <Text
// //                         ref={topTextRef}
// //                         font={customFontUrl}
// //                         position={[0, 1.11, 0]}
// //                         rotation={[-Math.PI / 2, 0, 0]}
// //                         fontSize={0.2}
// //                         color="#60a5fa"
// //                         fillOpacity={0}
// //                         anchorX="center"
// //                         anchorY="middle"
// //                     >
// //                         SYS // R3F
// //                     </Text>

// //                     {/* Right Face Accent */}
// //                     <Text
// //                         ref={rightTextRef}
// //                         font={customFontUrl}
// //                         position={[1.11, 0, 0]}
// //                         rotation={[0, Math.PI / 2, 0]}
// //                         fontSize={0.2}
// //                         color="#93c5fd"
// //                         fillOpacity={0}
// //                         anchorX="center"
// //                         anchorY="middle"
// //                     >
// //                         THREE.JS
// //                     </Text>
// //                 </RoundedBox>
// //             </group>

// //             {/* Content Portaled into Drei's Native Scroll Element */}
// //             <Html
// //                 portal={{ current: scrollData.el }}
// //                 fullscreen
// //                 className="w-full"
// //                 wrapperClass="!w-full !left-0 !top-0"
// //                 style={{ pointerEvents: "none", width: "100%" }}
// //             >
// //                 {/* 100vh spacer for Phase 1 inspection */}
// //                 <div className="h-screen w-full bg-red-500/5" />

// //                 {/* Main content revealed naturally via smooth scroll */}
// //                 <div className="w-full pointer-events-auto bg-green-500/5">
// //                     <div className="h-screen w-full bg-yellow-500/5" />
// //                     <main className={`relative z-10 max-w-5xl mx-auto px-6 py-20 flex flex-col gap-28 transition-opacity duration-700
// //                             ${isUnlocked ? "opacity-100" : "opacity-0 pointer-events-none"}
// //                           `}
// //                     >
// //                         {/* Section 1: Overview Cards */}
// //                         <section>
// //                             <div className="text-center mb-12">
// //                                 <span className="text-blue-400 text-sm tracking-[2px] font-semibold uppercase">
// //                                     WebGL Architecture
// //                                 </span>
// //                                 <h2 className="text-4xl md:text-5xl font-bold mt-3 tracking-tight text-white">
// //                                     Seamless 3D Spatial Interactions
// //                                 </h2>
// //                             </div>

// //                             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
// //                                 {[
// //                                     {
// //                                         icon: <Layers className="size-7 text-blue-400" />,
// //                                         title: "React Three Fiber",
// //                                         desc: "Declarative Three.js components fully tied into React component lifecycle and state.",
// //                                     },
// //                                     {
// //                                         icon: <Sparkles className="size-7 text-emerald-400" />,
// //                                         title: "Troika Custom Typography",
// //                                         desc: "Signed-distance-field vector text rendered in 3D with direct custom WOFF/TTF font loading.",
// //                                     },
// //                                     {
// //                                         icon: <Cpu className="size-7 text-pink-400" />,
// //                                         title: "Controlled Scroll Locks",
// //                                         desc: "Deterministic checkpoint locking allowing interactive 3D inspection before page progression.",
// //                                     },
// //                                 ].map((card, i) => (
// //                                     <div
// //                                         key={i}
// //                                         className="bg-white/3 border border-white/8 rounded-2xl p-8 backdrop-blur-md transition-all duration-200 hover:-translate-y-1 hover:border-white/20 hover:bg-white/5"
// //                                     >
// //                                         <div className="mb-4">{card.icon}</div>
// //                                         <h3 className="text-xl font-semibold mb-2 text-white">{card.title}</h3>
// //                                         <p className="text-slate-400 text-sm leading-relaxed">{card.desc}</p>
// //                                     </div>
// //                                 ))}
// //                             </div>
// //                         </section>

// //                         {/* Section 2: Technical Specs */}
// //                         <section className="bg-white/2 border border-white/6 rounded-3xl p-8 md:p-12 backdrop-blur-md">
// //                             <h3 className="text-2xl md:text-3xl font-bold mb-8 text-white">
// //                                 Runtime Performance & Specs
// //                             </h3>
// //                             <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
// //                                 <div>
// //                                     <div className="text-4xl font-bold text-blue-400">60 FPS</div>
// //                                     <div className="text-slate-400 text-sm mt-1">Lerped Frame Rates</div>
// //                                 </div>
// //                                 <div>
// //                                     <div className="text-4xl font-bold text-emerald-400">0ms</div>
// //                                     <div className="text-slate-400 text-sm mt-1">Scroll Jitter Overshoot</div>
// //                                 </div>
// //                                 <div>
// //                                     <div className="text-4xl font-bold text-purple-400">100%</div>
// //                                     <div className="text-slate-400 text-sm mt-1">TypeScript Type Safety</div>
// //                                 </div>
// //                             </div>
// //                         </section>

// //                         {/* Section 3: Footer */}
// //                         <footer className="text-center py-10 border-t border-white/8 text-slate-500 text-sm">
// //                             Built with React, Three.js, React Three Fiber & Drei.
// //                         </footer>
// //                     </main>
// //                 </div>
// //             </Html>
// //         </>
// //     );
// // };

// // export default function Page() {
// //     const [retryKey, setRetryKey] = useState(0);
// //     const [errorMessage, setErrorMessage] = useState<string | null>(null);

// //     const inspectBadgeRef = useRef<HTMLDivElement>(null);
// //     const lockedBadgeRef = useRef<HTMLDivElement>(null);
// //     const unlockedBadgeRef = useRef<HTMLDivElement>(null);

// //     const handleRetry = () => {
// //         THREE.Cache.clear();
// //         setErrorMessage(null);
// //         setRetryKey((prev) => prev + 1);
// //     };

// //     return (
// //         <div className="relative w-screen h-screen bg-[#070709] text-white font-['Space_Grotesk',sans-serif] overflow-hidden">
// //             <CenterLoader errorMessage={errorMessage} onRetry={handleRetry} />

// //             <SceneErrorBoundary
// //                 resetKey={retryKey}
// //                 onError={(error) => setErrorMessage(error.message || "Failed to load 3D assets")}
// //             >
// //                 <Canvas
// //                     key={retryKey}
// //                     camera={{ position: [0, 0, 3], fov: 50 }}
// //                     className="size-full"
// //                 >
// //                     <color attach="background" args={["#070709"]} />
// //                     <ambientLight intensity={1.5} />
// //                     <directionalLight position={[10, 10, 5]} intensity={1.5} color="#ffffff" />
// //                     <pointLight position={[-5, -5, -5]} intensity={0.8} color="#3b82f6" />
// //                     <pointLight position={[0, 4, 3]} intensity={1.2} color="#60a5fa" />
// //                     <Environment preset="city" />

// //                     <ScrollControls pages={5} damping={0.2}>
// //                         <Suspense fallback={null}>
// //                             <InteractiveCube
// //                                 inspectBadgeRef={inspectBadgeRef}
// //                                 lockedBadgeRef={lockedBadgeRef}
// //                                 unlockedBadgeRef={unlockedBadgeRef}
// //                             />
// //                         </Suspense>
// //                     </ScrollControls>
// //                 </Canvas>
// //             </SceneErrorBoundary>

// //             {/* Instruction Badges */}
// //             <div className="fixed bottom-9 left-1/2 -translate-x-1/2 z-20 pointer-events-none flex flex-col items-center gap-2">
// //                 <div
// //                     ref={inspectBadgeRef}
// //                     className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/8 backdrop-blur-md border border-white/10 text-sm text-slate-400 shadow-lg"
// //                 >
// //                     <ChevronDown className="size-4" />
// //                     <span>Scroll down to inspect</span>
// //                 </div>

// //                 <div
// //                     ref={lockedBadgeRef}
// //                     style={{ display: "none" }}
// //                     className="items-center gap-2 px-5 py-2.5 rounded-full bg-red-500/15 backdrop-blur-md border border-red-500/40 text-red-400 text-sm font-medium shadow-[0_0_20px_rgba(239,68,68,0.25)] animate-pulse"
// //                 >
// //                     <Lock className="size-4" />
// //                     <span>Scroll Locked. Click the cube to continue</span>
// //                     <MousePointerClick className="size-4" />
// //                 </div>

// //                 <div
// //                     ref={unlockedBadgeRef}
// //                     style={{ display: "none" }}
// //                     className="items-center gap-2 px-5 py-2.5 rounded-full bg-emerald-500/15 backdrop-blur-md border border-emerald-500/40 text-emerald-400 text-sm font-medium shadow-[0_0_20px_rgba(16,185,129,0.25)]"
// //                 >
// //                     <Unlock className="size-4" />
// //                     <span>Scroll Unlocked — Scroll down to explore</span>
// //                     <ChevronDown className="size-4" />
// //                 </div>
// //             </div>
// //         </div>
// //     );
// // }


// "use client";

// import React, { useState, useRef, useEffect, Suspense, Component, type ReactNode } from "react";
// import { Canvas, useFrame, useThree } from "@react-three/fiber";
// import {
//   useGLTF,
//   Environment,
//   ScrollControls,
//   Html,
//   useScroll,
//   useProgress,
// } from "@react-three/drei";
// import * as THREE from "three";
// import {
//   Lock,
//   Unlock,
//   MousePointerClick,
//   ChevronDown,
//   Sparkles,
//   Layers,
//   Cpu,
//   RefreshCw,
//   AlertCircle,
// } from "lucide-react";

// type Phase = "inspect" | "locked" | "unlocked" | "scrolled";

// // --- Scene Error Boundary ---
// interface ErrorBoundaryProps {
//   children: ReactNode;
//   resetKey: number;
//   onError: (error: Error) => void;
// }

// interface ErrorBoundaryState {
//   hasError: boolean;
// }

// class SceneErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
//   constructor(props: ErrorBoundaryProps) {
//     super(props);
//     this.state = { hasError: false };
//   }

//   static getDerivedStateFromError(): ErrorBoundaryState {
//     return { hasError: true };
//   }

//   componentDidCatch(error: Error) {
//     this.props.onError(error);
//   }

//   componentDidUpdate(prevProps: ErrorBoundaryProps) {
//     if (prevProps.resetKey !== this.props.resetKey && this.state.hasError) {
//       this.setState({ hasError: false });
//     }
//   }

//   render() {
//     if (this.state.hasError) {
//       return null; // Suppress canvas crash; outer CenterLoader displays the error state
//     }
//     return this.props.children;
//   }
// }

// // --- Center Loading Screen Component with Retry Support ---
// interface CenterLoaderProps {
//   errorMessage: string | null;
//   onRetry: () => void;
// }

// function CenterLoader({ errorMessage, onRetry }: CenterLoaderProps) {
//   const { active, progress, errors } = useProgress();
//   const [visible, setVisible] = useState(true);

//   const hasFailed = Boolean(errorMessage || errors.length > 0);

//   useEffect(() => {
//     if (!hasFailed && !active && progress === 100) {
//       const timer = setTimeout(() => setVisible(false), 600);
//       return () => clearTimeout(timer);
//     } else if (active || hasFailed) {
//       setVisible(true);
//     }
//   }, [active, progress, hasFailed]);

//   if (!visible) return null;

//   const isDone = !hasFailed && !active && progress === 100;

//   return (
//     <div
//       className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-black transition-opacity duration-500
//                 ${isDone ? "opacity-0 pointer-events-none" : "opacity-100"}
//             `}
//     >
//       <div className="flex flex-col items-center gap-5 max-w-sm px-6 text-center">
//         {hasFailed ? (
//           <>
//             {/* Error Warning Badge */}
//             <div className="size-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 mb-1 shadow-[0_0_25px_rgba(239,68,68,0.2)]">
//               <AlertCircle className="size-8" />
//             </div>

//             <div className="space-y-1.5">
//               <h3 className="text-xl font-bold text-white tracking-tight">
//                 Failed to Load 3D Assets
//               </h3>
//               <p className="text-xs text-slate-400 leading-relaxed">
//                 {errorMessage || "An asset failed to download. Please check your network connection and try again."}
//               </p>
//             </div>

//             {/* Retry Action */}
//             <button
//               onClick={onRetry}
//               className="mt-2 inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-medium text-sm transition-all duration-150 shadow-[0_0_20px_rgba(37,99,235,0.4)] cursor-pointer"
//             >
//               <RefreshCw className="size-4" />
//               <span>Try Again</span>
//             </button>
//           </>
//         ) : (
//           <>
//             {/* Large Center Percentage */}
//             <div className="flex items-baseline font-mono font-bold tracking-tight text-white">
//               <span className="text-6xl md:text-7xl">
//                 {Math.floor(progress)}
//               </span>
//               <span className="text-2xl md:text-3xl text-blue-500 ml-1.5">%</span>
//             </div>

//             {/* Progress Bar */}
//             <div className="w-56 h-1.5 bg-white/10 rounded-full overflow-hidden backdrop-blur-sm">
//               <div
//                 className="h-full bg-blue-500 rounded-full transition-all duration-200 ease-out shadow-[0_0_14px_rgba(59,130,246,0.9)]"
//                 style={{ width: `${progress}%` }}
//               />
//             </div>

//             {/* Subtitle Status */}
//             <span className="text-xs uppercase tracking-[0.25em] text-slate-400 font-medium animate-pulse">
//               {isDone ? "Ready" : "Loading Assets & Scene"}
//             </span>
//           </>
//         )}
//       </div>
//     </div>
//   );
// }

// // Identifier placeholder component used by Box model
// function Identifier({ visible = false }: { visible?: boolean }) {
//   return <group visible={visible} />;
// }

// // --- Wooden Box GLTF Component ---
// export function Box({
//   open,
//   hovered = false,
//   ...props
// }: {
//   open: boolean;
//   hovered?: boolean;
//   [key: string]: any;
// }) {
//   const { nodes, materials } = useGLTF("/wooden_box.glb") as any;
//   const lidRef = useRef<THREE.Group>(null);
//   const rightLockRef = useRef<THREE.Group>(null);
//   const leftLockRef = useRef<THREE.Group>(null);

//   useFrame((_, delta) => {
//     if (lidRef.current) {
//       // Hinge animation
//       const targetHinge = open ? -Math.PI / 1.5 : 0;
//       lidRef.current.rotation.x = THREE.MathUtils.damp(
//         lidRef.current.rotation.x,
//         targetHinge,
//         4,
//         delta
//       );
//     }

//     // Locks open animation: rotate x 90-deg (Math.PI / 2) on hover or when lid opens
//     const targetLockRot = (hovered || open) ? -Math.PI / 2 : 0;
//     if (rightLockRef.current) {
//       rightLockRef.current.rotation.x = THREE.MathUtils.damp(
//         rightLockRef.current.rotation.x,
//         targetLockRot,
//         10,
//         delta
//       );
//     }
//     if (leftLockRef.current) {
//       leftLockRef.current.rotation.x = THREE.MathUtils.damp(
//         leftLockRef.current.rotation.x,
//         targetLockRot,
//         10,
//         delta
//       );
//     }
//   });

//   return (
//     <group {...props} dispose={null}>
//       <group>
//         {/* LID */}
//         <group ref={lidRef} position={[0, 1.75, -1.42]}>
//           <Identifier visible={false} />
//           <group name="BoxLid" position={[0, -1.75, 1.42]}>
//             <mesh
//               name="AboveSurface"
//               castShadow
//               receiveShadow
//               geometry={nodes.polySurface12_PDC_tex_0.geometry}
//               material={materials.PDC_tex}
//             />
//             <mesh
//               name="RightTopWood"
//               castShadow
//               receiveShadow
//               geometry={nodes.polySurface19_PDC_tex_0.geometry}
//               material={materials.PDC_tex}
//             />
//             <mesh
//               name="LeftTopWood"
//               castShadow
//               receiveShadow
//               geometry={nodes.polySurface30_PDC_tex_0.geometry}
//               material={materials.PDC_tex}
//             />
//             {/* Right Lock */}
//             <group ref={rightLockRef} name="RightLock">
//               <mesh
//                 castShadow
//                 receiveShadow
//                 geometry={nodes.polySurface26_PDC_tex_0.geometry}
//                 material={materials.PDC_tex}
//               />
//               <mesh
//                 castShadow
//                 receiveShadow
//                 geometry={nodes.polySurface24_PDC_tex_0.geometry}
//                 material={materials.PDC_tex}
//               />
//               <mesh
//                 castShadow
//                 receiveShadow
//                 geometry={nodes.pPlane1_PDC_tex_0.geometry}
//                 material={materials.PDC_tex}
//               />
//               <mesh
//                 castShadow
//                 receiveShadow
//                 geometry={nodes.polySurface22_PDC_tex_0.geometry}
//                 material={materials.PDC_tex}
//               />
//             </group>
//             {/* Left Lock Handle */}
//             <group ref={leftLockRef} name="LeftLockHandle">
//               <mesh
//                 castShadow
//                 receiveShadow
//                 geometry={nodes.pPlane6_PDC_tex_0.geometry}
//                 material={materials.PDC_tex}
//               />
//               <mesh
//                 castShadow
//                 receiveShadow
//                 geometry={nodes.polySurface33_PDC_tex_0.geometry}
//                 material={materials.PDC_tex}
//               />
//               <mesh
//                 castShadow
//                 receiveShadow
//                 geometry={nodes.polySurface31_PDC_tex_0.geometry}
//                 material={materials.PDC_tex}
//               />
//               <mesh
//                 castShadow
//                 receiveShadow
//                 geometry={nodes.polySurface28_PDC_tex_0.geometry}
//                 material={materials.PDC_tex}
//               />
//             </group>
//           </group>
//         </group>

//         <group position={[0, 2, 0]}>
//           <mesh scale={0.1} visible={true}>
//             <sphereGeometry args={[0.3, 16, 16]} />
//             <meshStandardMaterial color="red" />
//           </mesh>
//           {/* <directionalLight name="DirectionalLight" intensity={10} /> */}
//         </group>

//         <mesh
//           name="FrontSurface"
//           castShadow
//           receiveShadow
//           geometry={nodes.polySurface14_PDC_tex_0.geometry}
//           material={materials.PDC_tex}
//         />
//         <mesh
//           name="BackSurface"
//           castShadow
//           receiveShadow
//           geometry={nodes.polySurface3_PDC_tex_0.geometry}
//           material={materials.PDC_tex}
//         />
//         <mesh
//           name="BottomSurface"
//           castShadow
//           receiveShadow
//           geometry={nodes.polySurface8_PDC_tex_0.geometry}
//           material={materials.PDC_tex}
//         />
//         {/* <mesh
//                     name="SideSurface"
//                     castShadow
//                     receiveShadow
//                     geometry={nodes.polySurface4_PDC_tex_0.geometry}
//                     material={materials.PDC_tex}
//                 /> */}

//         <group name="Right">
//           {/* RightWood */}
//           <group name="RightWood">
//             <mesh
//               name="RightNearWood"
//               castShadow
//               receiveShadow
//               geometry={nodes.polySurface6_PDC_tex_0.geometry}
//               material={materials.PDC_tex}
//             />
//             <mesh
//               name="RightFarWood"
//               castShadow
//               receiveShadow
//               geometry={nodes.polySurface18_PDC_tex_0.geometry}
//               material={materials.PDC_tex}
//             />
//           </group>

//           {/* Right Handle */}
//           <group name="RightHandle">
//             <mesh
//               name="RightHandleCable"
//               castShadow
//               receiveShadow
//               geometry={nodes.pPlane4_PDC_tex_0.geometry}
//               material={materials.PDC_tex}
//             />
//             <mesh
//               name="RightHandleIron"
//               castShadow
//               receiveShadow
//               geometry={nodes.pCylinder1_PDC_tex_0.geometry}
//               material={materials.PDC_tex}
//             />
//             <mesh
//               name="RightIronCover"
//               castShadow
//               receiveShadow
//               geometry={nodes.polySurface27_PDC_tex_0.geometry}
//               material={materials.PDC_tex}
//             />
//           </group>
//         </group>

//         <group name="Left">
//           {/* Left Wood */}
//           <group name="LeftWood">
//             <mesh
//               name="LeftNearWood"
//               castShadow
//               receiveShadow
//               geometry={nodes.polySurface34_PDC_tex_0.geometry}
//               material={materials.PDC_tex}
//             />
//             <mesh
//               name="LeftFarWood"
//               castShadow
//               receiveShadow
//               geometry={nodes.polySurface32_PDC_tex_0.geometry}
//               material={materials.PDC_tex}
//             />
//           </group>

//           {/* Left Handle */}
//           <group name="LeftHandle">
//             <mesh
//               name="LeftHandleCable"
//               castShadow
//               receiveShadow
//               geometry={nodes.pPlane5_PDC_tex_0.geometry}
//               material={materials.PDC_tex}
//             />
//             <mesh
//               name="LeftHandleIron"
//               castShadow
//               receiveShadow
//               geometry={nodes.pCylinder2_PDC_tex_0.geometry}
//               material={materials.PDC_tex}
//             />
//             <mesh
//               name="LeftIronCover"
//               castShadow
//               receiveShadow
//               geometry={nodes.polySurface29_PDC_tex_0.geometry}
//               material={materials.PDC_tex}
//             />
//           </group>
//         </group>
//       </group>
//     </group>
//   );
// }

// useGLTF.preload("/wooden_box.glb");

// interface InteractiveBoxProps {
//   inspectBadgeRef: React.RefObject<HTMLDivElement | null>;
//   lockedBadgeRef: React.RefObject<HTMLDivElement | null>;
//   unlockedBadgeRef: React.RefObject<HTMLDivElement | null>;
// }

// export const InteractiveBox: React.FC<InteractiveBoxProps> = ({
//   inspectBadgeRef,
//   lockedBadgeRef,
//   unlockedBadgeRef,
// }) => {
//   const groupRef = useRef<THREE.Group>(null);
//   const boxWrapRef = useRef<THREE.Group>(null);

//   const [isUnlocked, setIsUnlocked] = useState(false);
//   const isUnlockedRef = useRef(false);
//   const [isOpen, setIsOpen] = useState(false);
//   const [isHovered, setIsHovered] = useState(false);
//   const hoveredRef = useRef(false);
//   const clickPunchRef = useRef(0);
//   const phaseRef = useRef<Phase>("inspect");

//   const { camera } = useThree();
//   const scrollData = useScroll();

//   useEffect(() => {
//     return () => {
//       document.body.style.cursor = "auto";
//     };
//   }, []);

//   useFrame((state, delta) => {
//     const lockScrollPx = scrollData.el.clientHeight;
//     let currentScroll = scrollData.el.scrollTop;

//     // Enforce hard scroll lock at 1st viewport until unlocked
//     if (!isUnlockedRef.current && currentScroll >= lockScrollPx) {
//       scrollData.el.scrollTop = lockScrollPx;
//       currentScroll = lockScrollPx;
//     }

//     const scrollProgress = THREE.MathUtils.clamp(currentScroll / lockScrollPx, 0, 1);
//     const extraScroll = Math.max(0, currentScroll - lockScrollPx);

//     // Determine active lock/UI phase
//     let currentPhase: Phase = "inspect";
//     if (!isUnlockedRef.current) {
//       currentPhase = scrollProgress >= 0.95 ? "locked" : "inspect";
//     } else {
//       currentPhase = extraScroll < 200 ? "unlocked" : "scrolled";
//     }

//     // Direct DOM toggling for badge overlays
//     if (phaseRef.current !== currentPhase) {
//       phaseRef.current = currentPhase;
//       if (inspectBadgeRef.current) {
//         inspectBadgeRef.current.style.display = currentPhase === "inspect" ? "flex" : "none";
//       }
//       if (lockedBadgeRef.current) {
//         lockedBadgeRef.current.style.display = currentPhase === "locked" ? "flex" : "none";
//       }
//       if (unlockedBadgeRef.current) {
//         unlockedBadgeRef.current.style.display = currentPhase === "unlocked" ? "flex" : "none";
//       }
//     }

//     const isClickable = phaseRef.current === "locked" && !isUnlockedRef.current;
//     if (!isClickable && hoveredRef.current) {
//       hoveredRef.current = false;
//       document.body.style.cursor = "auto";
//     }

//     // 1. Camera Dolly: Pull back from z=3 to z=6
//     const targetCameraZ = THREE.MathUtils.lerp(3, 6, scrollProgress);
//     camera.position.z = THREE.MathUtils.damp(camera.position.z, targetCameraZ, 6, delta);

//     // 2. Cube Orientation & Parallax
//     if (groupRef.current) {
//       const targetRotX = THREE.MathUtils.lerp(0, 0.35, scrollProgress);
//       const targetRotY = THREE.MathUtils.lerp(0, 0.65, scrollProgress);

//       groupRef.current.rotation.x = THREE.MathUtils.damp(
//         groupRef.current.rotation.x,
//         targetRotX,
//         6,
//         delta
//       );
//       groupRef.current.rotation.y = THREE.MathUtils.damp(
//         groupRef.current.rotation.y,
//         targetRotY,
//         6,
//         delta
//       );

//       const targetPosY = THREE.MathUtils.lerp(0, -extraScroll * 0.003, 0.1);
//       groupRef.current.position.y = THREE.MathUtils.damp(
//         groupRef.current.position.y,
//         targetPosY,
//         5,
//         delta
//       );
//     }

//     // 3. Click Bounce & Hover Scaling
//     if (boxWrapRef.current) {
//       if (clickPunchRef.current > 0) {
//         clickPunchRef.current = Math.max(0, clickPunchRef.current - delta * 2.5);
//         const punchScale = 1 + Math.sin(clickPunchRef.current * Math.PI) * 0.15;
//         boxWrapRef.current.scale.setScalar(punchScale * 0.85);
//       } else {
//         const isHoveredActive = hoveredRef.current;
//         const hoverScale = isHoveredActive ? 0.88 : 0.85;
//         boxWrapRef.current.scale.lerp(new THREE.Vector3(hoverScale, hoverScale, hoverScale), 0.1);
//       }
//     }
//   });

//   const handleClick = (e: any) => {
//     e.stopPropagation();

//     // Lid opens upon clicking the box
//     setIsOpen(true);

//     if (phaseRef.current === "locked" && !isUnlockedRef.current) {
//       clickPunchRef.current = 1;
//       isUnlockedRef.current = true;
//       setIsUnlocked(true);
//       document.body.style.cursor = "auto";

//       // Smoothly scroll down ~400px over 2 seconds
//       const startScroll = scrollData.el.scrollTop;
//       const scrollDistance = Math.min(scrollData.el.clientHeight * 0.45, 450);
//       const targetScroll = startScroll + scrollDistance;
//       const duration = 1000;
//       const startTime = performance.now();

//       const easeInOutCubic = (t: number) =>
//         t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

//       const animateScroll = (currentTime: number) => {
//         const elapsed = currentTime - startTime;
//         const progress = Math.min(elapsed / duration, 1);
//         scrollData.el.scrollTop = startScroll + (targetScroll - startScroll) * easeInOutCubic(progress);

//         if (progress < 1) {
//           requestAnimationFrame(animateScroll);
//         }
//       };

//       requestAnimationFrame(animateScroll);
//     }
//   };

//   return (
//     <>
//       <group ref={groupRef}>
//         <group
//           ref={boxWrapRef}
//           scale={0.85}
//           position={[0, -0.6, 0]}
//           onClick={handleClick}
//           onPointerOver={(e) => {
//             e.stopPropagation();
//             hoveredRef.current = true;
//             setIsHovered(true);
//             if (phaseRef.current === "locked" && !isUnlockedRef.current) {
//               document.body.style.cursor = "pointer";
//             }
//           }}
//           onPointerOut={() => {
//             hoveredRef.current = false;
//             setIsHovered(false);
//             document.body.style.cursor = "auto";
//           }}
//         >
//           <Box open={isOpen} hovered={isHovered} />
//         </group>
//       </group>

//       {/* Content Portaled into Drei's Native Scroll Element */}
//       <Html
//         portal={{ current: scrollData.el }}
//         fullscreen
//         className="w-full"
//         wrapperClass="!w-full !left-0 !top-0"
//         style={{ pointerEvents: "none", width: "100%" }}
//       >
//         {/* 100vh spacer for Phase 1 inspection */}
//         <div className="h-screen w-full bg-red-500/5" />

//         {/* Main content revealed naturally via smooth scroll */}
//         <div className="w-full pointer-events-auto bg-green-500/5">
//           <div className="h-screen w-full bg-yellow-500/5" />
//           <main
//             className={`relative z-10 max-w-5xl mx-auto px-6 py-20 flex flex-col gap-28 transition-opacity duration-700
//                             ${isUnlocked ? "opacity-100" : "opacity-0 pointer-events-none"}
//                         `}
//           >
//             {/* Section 1: Overview Cards */}
//             <section>
//               <div className="text-center mb-12">
//                 <span className="text-blue-400 text-sm tracking-[2px] font-semibold uppercase">
//                   WebGL Architecture
//                 </span>
//                 <h2 className="text-4xl md:text-5xl font-bold mt-3 tracking-tight text-white">
//                   Seamless 3D Spatial Interactions
//                 </h2>
//               </div>

//               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//                 {[
//                   {
//                     icon: <Layers className="size-7 text-blue-400" />,
//                     title: "React Three Fiber",
//                     desc: "Declarative Three.js components fully tied into React component lifecycle and state.",
//                   },
//                   {
//                     icon: <Sparkles className="size-7 text-emerald-400" />,
//                     title: "Troika Custom Typography",
//                     desc: "Signed-distance-field vector text rendered in 3D with direct custom WOFF/TTF font loading.",
//                   },
//                   {
//                     icon: <Cpu className="size-7 text-pink-400" />,
//                     title: "Controlled Scroll Locks",
//                     desc: "Deterministic checkpoint locking allowing interactive 3D inspection before page progression.",
//                   },
//                 ].map((card, i) => (
//                   <div
//                     key={i}
//                     className="bg-white/3 border border-white/8 rounded-2xl p-8 backdrop-blur-md transition-all duration-200 hover:-translate-y-1 hover:border-white/20 hover:bg-white/5"
//                   >
//                     <div className="mb-4">{card.icon}</div>
//                     <h3 className="text-xl font-semibold mb-2 text-white">{card.title}</h3>
//                     <p className="text-slate-400 text-sm leading-relaxed">{card.desc}</p>
//                   </div>
//                 ))}
//               </div>
//             </section>

//             {/* Section 2: Technical Specs */}
//             <section className="bg-white/2 border border-white/6 rounded-3xl p-8 md:p-12 backdrop-blur-md">
//               <h3 className="text-2xl md:text-3xl font-bold mb-8 text-white">
//                 Runtime Performance & Specs
//               </h3>
//               <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
//                 <div>
//                   <div className="text-4xl font-bold text-blue-400">60 FPS</div>
//                   <div className="text-slate-400 text-sm mt-1">Lerped Frame Rates</div>
//                 </div>
//                 <div>
//                   <div className="text-4xl font-bold text-emerald-400">0ms</div>
//                   <div className="text-slate-400 text-sm mt-1">Scroll Jitter Overshoot</div>
//                 </div>
//                 <div>
//                   <div className="text-4xl font-bold text-purple-400">100%</div>
//                   <div className="text-slate-400 text-sm mt-1">TypeScript Type Safety</div>
//                 </div>
//               </div>
//             </section>

//             {/* Section 3: Footer */}
//             <footer className="text-center py-10 border-t border-white/8 text-slate-500 text-sm">
//               Built with React, Three.js, React Three Fiber & Drei.
//             </footer>
//           </main>
//         </div>
//       </Html>
//     </>
//   );
// };

// // Export alias for backward compatibility
// export const InteractiveCube = InteractiveBox;

// export default function Page() {
//   const [retryKey, setRetryKey] = useState(0);
//   const [errorMessage, setErrorMessage] = useState<string | null>(null);

//   const inspectBadgeRef = useRef<HTMLDivElement>(null);
//   const lockedBadgeRef = useRef<HTMLDivElement>(null);
//   const unlockedBadgeRef = useRef<HTMLDivElement>(null);

//   const handleRetry = () => {
//     THREE.Cache.clear();
//     setErrorMessage(null);
//     setRetryKey((prev) => prev + 1);
//   };

//   return (
//     <div className="relative w-screen h-screen bg-[#070709] text-white font-['Space_Grotesk',sans-serif] overflow-hidden">
//       <CenterLoader errorMessage={errorMessage} onRetry={handleRetry} />

//       <SceneErrorBoundary
//         resetKey={retryKey}
//         onError={(error) => setErrorMessage(error.message || "Failed to load 3D assets")}
//       >
//         <Canvas
//           key={retryKey}
//           camera={{ position: [0, 0, 3], fov: 50 }}
//           className="size-full"
//         >
//           <color attach="background" args={["#070709"]} />
//           <ambientLight intensity={1.5} />
//           <directionalLight position={[10, 10, 5]} intensity={1.5} color="#ffffff" />
//           <pointLight position={[-5, -5, -5]} intensity={0.8} color="#3b82f6" />
//           <pointLight position={[0, 4, 3]} intensity={1.2} color="#60a5fa" />
//           <Environment preset="city" />

//           <ScrollControls pages={5} damping={0.2}>
//             <Suspense fallback={null}>
//               <InteractiveBox
//                 inspectBadgeRef={inspectBadgeRef}
//                 lockedBadgeRef={lockedBadgeRef}
//                 unlockedBadgeRef={unlockedBadgeRef}
//               />
//             </Suspense>
//           </ScrollControls>
//         </Canvas>
//       </SceneErrorBoundary>

//       {/* Instruction Badges */}
//       <div className="fixed bottom-9 left-1/2 -translate-x-1/2 z-20 pointer-events-none flex flex-col items-center gap-2">
//         <div
//           ref={inspectBadgeRef}
//           className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/8 backdrop-blur-md border border-white/10 text-sm text-slate-400 shadow-lg"
//         >
//           <ChevronDown className="size-4" />
//           <span>Scroll down to inspect</span>
//         </div>

//         <div
//           ref={lockedBadgeRef}
//           style={{ display: "none" }}
//           className="items-center gap-2 px-5 py-2.5 rounded-full bg-red-500/15 backdrop-blur-md border border-red-500/40 text-red-400 text-sm font-medium shadow-[0_0_20px_rgba(239,68,68,0.25)] animate-pulse"
//         >
//           <Lock className="size-4" />
//           <span>Scroll Locked. Click the box to continue</span>
//           <MousePointerClick className="size-4" />
//         </div>

//         <div
//           ref={unlockedBadgeRef}
//           style={{ display: "none" }}
//           className="items-center gap-2 px-5 py-2.5 rounded-full bg-emerald-500/15 backdrop-blur-md border border-emerald-500/40 text-emerald-400 text-sm font-medium shadow-[0_0_20px_rgba(16,185,129,0.25)]"
//         >
//           <Unlock className="size-4" />
//           <span>Scroll Unlocked — Scroll down to explore</span>
//           <ChevronDown className="size-4" />
//         </div>
//       </div>
//     </div>
//   );
// }




"use client";

import React, { useState, useRef, useEffect, Suspense, Component, type ReactNode } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  useGLTF,
  Environment,
  ScrollControls,
  Html,
  useScroll,
  useProgress,
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
  RefreshCw,
  AlertCircle,
} from "lucide-react";

type Phase = "inspect" | "locked" | "unlocked" | "scrolled";

// --- Scene Error Boundary ---
interface ErrorBoundaryProps {
  children: ReactNode;
  resetKey: number;
  onError: (error: Error) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class SceneErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    this.props.onError(error);
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    if (prevProps.resetKey !== this.props.resetKey && this.state.hasError) {
      this.setState({ hasError: false });
    }
  }

  render() {
    if (this.state.hasError) {
      return null; // Suppress canvas crash; outer CenterLoader displays the error state
    }
    return this.props.children;
  }
}

// --- Center Loading Screen Component with Retry Support ---
interface CenterLoaderProps {
  errorMessage: string | null;
  onRetry: () => void;
}

function CenterLoader({ errorMessage, onRetry }: CenterLoaderProps) {
  const { active, progress, errors } = useProgress();
  const [visible, setVisible] = useState(true);

  const hasFailed = Boolean(errorMessage || errors.length > 0);

  useEffect(() => {
    if (!hasFailed && !active && progress === 100) {
      const timer = setTimeout(() => setVisible(false), 600);
      return () => clearTimeout(timer);
    } else if (active || hasFailed) {
      setVisible(true);
    }
  }, [active, progress, hasFailed]);

  if (!visible) return null;

  const isDone = !hasFailed && !active && progress === 100;

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-black transition-opacity duration-500
                ${isDone ? "opacity-0 pointer-events-none" : "opacity-100"}
            `}
    >
      <div className="flex flex-col items-center gap-5 max-w-sm px-6 text-center">
        {hasFailed ? (
          <>
            {/* Error Warning Badge */}
            <div className="size-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 mb-1 shadow-[0_0_25px_rgba(239,68,68,0.2)]">
              <AlertCircle className="size-8" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-xl font-bold text-white tracking-tight">
                Failed to Load 3D Assets
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                {errorMessage || "An asset failed to download. Please check your network connection and try again."}
              </p>
            </div>

            {/* Retry Action */}
            <button
              onClick={onRetry}
              className="mt-2 inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-medium text-sm transition-all duration-150 shadow-[0_0_20px_rgba(37,99,235,0.4)] cursor-pointer"
            >
              <RefreshCw className="size-4" />
              <span>Try Again</span>
            </button>
          </>
        ) : (
          <>
            {/* Large Center Percentage */}
            <div className="flex items-baseline font-mono font-bold tracking-tight text-white">
              <span className="text-6xl md:text-7xl">
                {Math.floor(progress)}
              </span>
              <span className="text-2xl md:text-3xl text-blue-500 ml-1.5">%</span>
            </div>

            {/* Progress Bar */}
            <div className="w-56 h-1.5 bg-white/10 rounded-full overflow-hidden backdrop-blur-sm">
              <div
                className="h-full bg-blue-500 rounded-full transition-all duration-200 ease-out shadow-[0_0_14px_rgba(59,130,246,0.9)]"
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* Subtitle Status */}
            <span className="text-xs uppercase tracking-[0.25em] text-slate-400 font-medium animate-pulse">
              {isDone ? "Ready" : "Loading Assets & Scene"}
            </span>
          </>
        )}
      </div>
    </div>
  );
}

// --- Interactive Wooden Box Component ---
export function Box({
  open,
  onClick,
  canInteract,
  ...props
}: {
  open: boolean;
  onClick?: (e: any) => void;
  canInteract?: () => boolean;
  [key: string]: any;
}) {
  const { nodes, materials } = useGLTF("/wooden_box.glb") as any;
  const [isHovered, setIsHovered] = useState(false);

  const lidRef = useRef<THREE.Group>(null);
  const lockRightRef = useRef<THREE.Group>(null);
  const lockLeftRef = useRef<THREE.Group>(null);

  useFrame(() => {
    // Reset hover state if user scrolls away from the locked phase
    const interactive = canInteract ? canInteract() : true;
    if (!interactive && isHovered) {
      setIsHovered(false);
    }

    if (lidRef.current) {
      // Hinge animation: smoothly swing lid open when open state is active
      const targetHinge = open ? -Math.PI / 1.5 : 0;
      lidRef.current.rotation.x = THREE.MathUtils.lerp(
        lidRef.current.rotation.x,
        targetHinge,
        0.04,
      );
    }

    // Lock animation: rotate x 90 degrees (-Math.PI / 2) when hovered or open
    const targetLock = open || (isHovered && interactive) ? -Math.PI / 2 : 0;
    if (lockRightRef.current) {
      lockRightRef.current.rotation.x = THREE.MathUtils.lerp(
        lockRightRef.current.rotation.x,
        targetLock,
        0.1,
      );
    }

    if (lockLeftRef.current) {
      lockLeftRef.current.rotation.x = THREE.MathUtils.lerp(
        lockLeftRef.current.rotation.x,
        targetLock,
        0.1,
      );
    }
  });

  return (
    <group {...props} dispose={null}>
      <group
        onClick={onClick}
        onPointerOver={(e) => {
          e.stopPropagation();
          if (canInteract && !canInteract()) return;
          setIsHovered(true);
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          setIsHovered(false);
        }}
      >
        {/* LID */}
        <group ref={lidRef} position={[0, 1.75, -1.42]}>
          {/* <Identifier /> */}
          <group name="BoxLid" position={[0, -1.75, 1.42]}>
            <mesh
              name="AboveSurface"
              castShadow
              receiveShadow
              geometry={nodes.polySurface12_PDC_tex_0.geometry}
              material={materials.PDC_tex}
            />
            <mesh
              name="RightTopWood"
              castShadow
              receiveShadow
              geometry={nodes.polySurface19_PDC_tex_0.geometry}
              material={materials.PDC_tex}
            />
            <mesh
              name="LeftTopWood"
              castShadow
              receiveShadow
              geometry={nodes.polySurface30_PDC_tex_0.geometry}
              material={materials.PDC_tex}
            />

            {/* Right Lock Handle*/}
            <group name="RightLockHandle">
              <group name="RightLockHandle">
                <mesh
                  castShadow
                  receiveShadow
                  geometry={nodes.polySurface26_PDC_tex_0.geometry}
                  material={materials.PDC_tex}
                />
                <group ref={lockRightRef} position={[0.9, 1.8, 2.1]}>
                  <mesh
                    position={[-0.9, -1.8, -2.1]}
                    castShadow
                    receiveShadow
                    geometry={nodes.polySurface24_PDC_tex_0.geometry}
                    material={materials.PDC_tex}
                  />
                </group>
                <mesh
                  castShadow
                  receiveShadow
                  geometry={nodes.pPlane1_PDC_tex_0.geometry}
                  material={materials.PDC_tex}
                />
                <mesh
                  castShadow
                  receiveShadow
                  geometry={nodes.polySurface22_PDC_tex_0.geometry}
                  material={materials.PDC_tex}
                />
              </group>
            </group>
            {/* Left Lock Handle */}
            <group name="LeftLockHandle">
              <mesh
                castShadow
                receiveShadow
                geometry={nodes.pPlane6_PDC_tex_0.geometry}
                material={materials.PDC_tex}
              />
              <mesh
                castShadow
                receiveShadow
                geometry={nodes.polySurface33_PDC_tex_0.geometry}
                material={materials.PDC_tex}
              />
              <mesh
                castShadow
                receiveShadow
                geometry={nodes.polySurface31_PDC_tex_0.geometry}
                material={materials.PDC_tex}
              />
              <group ref={lockLeftRef} position={[0.9, 1.8, 2.1]}>
                <mesh
                  position={[-0.9, -1.8, -2.1]}
                  castShadow
                  receiveShadow
                  geometry={nodes.polySurface28_PDC_tex_0.geometry}
                  material={materials.PDC_tex}
                />
              </group>
            </group>
          </group>
        </group>

        <group position={[0, 2, 0]} visible={false}>
          <mesh scale={0.1} visible={true}>
            <sphereGeometry args={[0.3, 16, 16]} />
            <meshStandardMaterial color="red" />
          </mesh>
          <directionalLight name="DirectionalLight" intensity={10} />
        </group>

        <mesh
          name="FrontSurface"
          castShadow
          receiveShadow
          geometry={nodes.polySurface14_PDC_tex_0.geometry}
          material={materials.PDC_tex}
        />
        <mesh
          name="BackSurface"
          castShadow
          receiveShadow
          geometry={nodes.polySurface3_PDC_tex_0.geometry}
          material={materials.PDC_tex}
        />
        <mesh
          name="BottomSurface"
          castShadow
          receiveShadow
          geometry={nodes.polySurface8_PDC_tex_0.geometry}
          material={materials.PDC_tex}
        />
        <mesh
          name="SideSurface"
          castShadow
          receiveShadow
          geometry={nodes.polySurface4_PDC_tex_0.geometry}
          material={materials.PDC_tex}
        />

        <group name="Right">
          {/* RightWood */}
          <group name="RightWood">
            <mesh
              name="RightNearWood"
              castShadow
              receiveShadow
              geometry={nodes.polySurface6_PDC_tex_0.geometry}
              material={materials.PDC_tex}
            />
            <mesh
              name="RightFarWood"
              castShadow
              receiveShadow
              geometry={nodes.polySurface18_PDC_tex_0.geometry}
              material={materials.PDC_tex}
            />
          </group>

          {/* Right Handle */}
          <group name="RightHandle">
            <mesh
              name="RightHandleCable"
              castShadow
              receiveShadow
              geometry={nodes.pPlane4_PDC_tex_0.geometry}
              material={materials.PDC_tex}
            />
            <mesh
              name="RightHandleIron"
              castShadow
              receiveShadow
              geometry={nodes.pCylinder1_PDC_tex_0.geometry}
              material={materials.PDC_tex}
            />
            <mesh
              name="RightIronCover"
              castShadow
              receiveShadow
              geometry={nodes.polySurface27_PDC_tex_0.geometry}
              material={materials.PDC_tex}
            />
          </group>
        </group>

        <group name="Left">
          {/* Left Wood */}
          <group name="LeftWood">
            <mesh
              name="LeftNearWood"
              castShadow
              receiveShadow
              geometry={nodes.polySurface34_PDC_tex_0.geometry}
              material={materials.PDC_tex}
            />
            <mesh
              name="LeftFarWood"
              castShadow
              receiveShadow
              geometry={nodes.polySurface32_PDC_tex_0.geometry}
              material={materials.PDC_tex}
            />
          </group>

          {/* Left Handle */}
          <group name="LeftHandle">
            <mesh
              name="LeftHandleCable"
              castShadow
              receiveShadow
              geometry={nodes.pPlane5_PDC_tex_0.geometry}
              material={materials.PDC_tex}
            />
            <mesh
              name="LeftHandleIron"
              castShadow
              receiveShadow
              geometry={nodes.pCylinder2_PDC_tex_0.geometry}
              material={materials.PDC_tex}
            />
            <mesh
              name="LeftIronCover"
              castShadow
              receiveShadow
              geometry={nodes.polySurface29_PDC_tex_0.geometry}
              material={materials.PDC_tex}
            />
          </group>
        </group>
      </group>
    </group>
  );
}

useGLTF.preload("/wooden_box.glb");

interface InteractiveBoxProps {
  inspectBadgeRef: React.RefObject<HTMLDivElement | null>;
  lockedBadgeRef: React.RefObject<HTMLDivElement | null>;
  unlockedBadgeRef: React.RefObject<HTMLDivElement | null>;
}

export const InteractiveBox: React.FC<InteractiveBoxProps> = ({
  inspectBadgeRef,
  lockedBadgeRef,
  unlockedBadgeRef,
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const boxContainerRef = useRef<THREE.Group>(null);

  const [isUnlocked, setIsUnlocked] = useState(false);
  const isUnlockedRef = useRef(false);
  const hoveredRef = useRef(false);
  const clickPunchRef = useRef(0);
  const phaseRef = useRef<Phase>("inspect");

  const { camera } = useThree();
  const scrollData = useScroll();

  useEffect(() => {
    return () => {
      document.body.style.cursor = "auto";
    };
  }, []);

  useFrame((state, delta) => {
    const lockScrollPx = scrollData.el.clientHeight;
    let currentScroll = scrollData.el.scrollTop;

    // Enforce hard scroll lock at 1st viewport until unlocked
    if (!isUnlockedRef.current && currentScroll >= lockScrollPx) {
      scrollData.el.scrollTop = lockScrollPx;
      currentScroll = lockScrollPx;
    }

    const scrollProgress = THREE.MathUtils.clamp(currentScroll / lockScrollPx, 0, 1);
    const extraScroll = Math.max(0, currentScroll - lockScrollPx);

    // Determine active lock/UI phase
    let currentPhase: Phase = "inspect";
    if (!isUnlockedRef.current) {
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

    const isClickable = phaseRef.current === "locked" && !isUnlockedRef.current;
    if (!isClickable && hoveredRef.current) {
      hoveredRef.current = false;
      document.body.style.cursor = "auto";
    }

    // 1. Camera Dolly: Pull back from z=3 to z=6
    const targetCameraZ = THREE.MathUtils.lerp(3, 6, scrollProgress);
    camera.position.z = THREE.MathUtils.damp(camera.position.z, targetCameraZ, 6, delta);

    // 2. Box Orientation & Parallax
    if (groupRef.current) {
      const targetRotX = THREE.MathUtils.lerp(0.15, 0.4, scrollProgress);
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
    if (boxContainerRef.current) {
      const baseScale = 0.65;
      if (clickPunchRef.current > 0) {
        clickPunchRef.current = Math.max(0, clickPunchRef.current - delta * 2.5);
        const punchScale = (1 + Math.sin(clickPunchRef.current * Math.PI) * 0.18) * baseScale;
        boxContainerRef.current.scale.setScalar(punchScale);
      } else {
        const isHovered = hoveredRef.current && isClickable;
        const hoverScale = (isHovered ? 1.05 : 1.0) * baseScale;
        boxContainerRef.current.scale.lerp(new THREE.Vector3(hoverScale, hoverScale, hoverScale), 0.1);
      }
    }
  });

  const handleClick = () => {
    // Only allow unlocking when scrolled past 0.95 and not already unlocked
    if (phaseRef.current === "locked" && !isUnlockedRef.current) {
      clickPunchRef.current = 1;
      isUnlockedRef.current = true;
      setIsUnlocked(true);
      document.body.style.cursor = "auto";

      // Smoothly scroll down ~400px over 1 second when unlocked
      const startScroll = scrollData.el.scrollTop;
      const scrollDistance = Math.min(scrollData.el.clientHeight * 0.45, 450);
      const targetScroll = startScroll + scrollDistance;
      const duration = 1000;
      const startTime = performance.now();

      const easeInOutCubic = (t: number) =>
        t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

      const animateScroll = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        scrollData.el.scrollTop = startScroll + (targetScroll - startScroll) * easeInOutCubic(progress);

        if (progress < 1) {
          requestAnimationFrame(animateScroll);
        }
      };

      requestAnimationFrame(animateScroll);
    }
  };

  return (
    <>
      <group ref={groupRef}>
        <group
          ref={boxContainerRef}
          scale={0.65}
          position={[0, -0.2, 0]}
          onPointerOver={(e) => {
            e.stopPropagation();
            if (phaseRef.current === "locked" && !isUnlockedRef.current) {
              hoveredRef.current = true;
              document.body.style.cursor = "pointer";
            }
          }}
          onPointerOut={() => {
            hoveredRef.current = false;
            document.body.style.cursor = "auto";
          }}
        >
          <Box
            open={isUnlocked}
            onClick={handleClick}
            canInteract={() => phaseRef.current === "locked" && !isUnlockedRef.current}
          />
        </group>
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

        {/* Main content revealed naturally via smooth scroll */}
        <div className="w-full pointer-events-auto bg-green-500/5">
          <div className="h-screen w-full bg-yellow-500/5" />
          <main className={`relative z-10 max-w-5xl mx-auto px-6 py-20 flex flex-col gap-28 transition-opacity duration-700
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

// Aliased export for compatibility
export const InteractiveCube = InteractiveBox;

export default function Page() {
  const [retryKey, setRetryKey] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const inspectBadgeRef = useRef<HTMLDivElement>(null);
  const lockedBadgeRef = useRef<HTMLDivElement>(null);
  const unlockedBadgeRef = useRef<HTMLDivElement>(null);

  const handleRetry = () => {
    THREE.Cache.clear();
    setErrorMessage(null);
    setRetryKey((prev) => prev + 1);
  };

  return (
    <div className="relative w-screen h-screen bg-[#070709] text-white font-['Space_Grotesk',sans-serif] overflow-hidden">
      <CenterLoader errorMessage={errorMessage} onRetry={handleRetry} />

      <SceneErrorBoundary
        resetKey={retryKey}
        onError={(error) => setErrorMessage(error.message || "Failed to load 3D assets")}
      >
        <Canvas
          key={retryKey}
          camera={{ position: [0, 0, 3], fov: 50 }}
          className="size-full"
        >
          <color attach="background" args={["#070709"]} />
          <ambientLight intensity={1.5} />
          <directionalLight position={[10, 10, 5]} intensity={1.5} color="#ffffff" />
          <pointLight position={[-5, -5, -5]} intensity={0.8} color="#3b82f6" />
          <pointLight position={[0, 4, 3]} intensity={1.2} color="#60a5fa" />
          <Environment preset="city" />

          <ScrollControls pages={5} damping={0.2}>
            <Suspense fallback={null}>
              <InteractiveBox
                inspectBadgeRef={inspectBadgeRef}
                lockedBadgeRef={lockedBadgeRef}
                unlockedBadgeRef={unlockedBadgeRef}
              />
            </Suspense>
          </ScrollControls>
        </Canvas>
      </SceneErrorBoundary>

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
          <span>Scroll Locked. Click the box to continue</span>
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