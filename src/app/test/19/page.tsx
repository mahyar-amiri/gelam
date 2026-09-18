"use client";

import React, {
  useState,
  useRef,
  useEffect,
  useMemo,
  Suspense,
  Component,
  type ReactNode,
} from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  useGLTF,
  Text,
  Environment,
  ScrollControls,
  Html,
  useScroll,
  useProgress,
  useCursor,
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

const SCROLL_UNLOCK_DISTANCE = 400;

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
      return null;
    }
    return this.props.children;
  }
}

// --- Center Loading Screen Component ---
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
            <div className="flex items-baseline font-mono font-bold tracking-tight text-white">
              <span className="text-6xl md:text-7xl">{Math.floor(progress)}</span>
              <span className="text-2xl md:text-3xl text-blue-500 ml-1.5">%</span>
            </div>

            <div className="w-56 h-1.5 bg-white/10 rounded-full overflow-hidden backdrop-blur-sm">
              <div
                className="h-full bg-blue-500 rounded-full transition-all duration-200 ease-out shadow-[0_0_14px_rgba(59,130,246,0.9)]"
                style={{ width: `${progress}%` }}
              />
            </div>

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
  openProgressRef,
  opacityRef,
  isUnlocked = false,
  open = false,
  onClick,
  canClick = false,
  onHoverChange,
  lidText,
  ...props
}: {
  openProgressRef?: React.RefObject<number | null>;
  opacityRef?: React.RefObject<number | null>;
  isUnlocked?: boolean;
  open?: boolean;
  onClick?: (e: any) => void;
  canClick?: boolean;
  onHoverChange?: (hovered: boolean) => void;
  lidText?: string;
  [key: string]: any;
}) {
  const { nodes, materials } = useGLTF("/wooden_box.glb") as any;
  const [isHovered, setIsHovered] = useState(false);

  // Directly controls cursor pointer when model is hovered and clickable
  useCursor(isHovered && canClick);

  const lidRef = useRef<THREE.Group>(null);
  const lockRightRef = useRef<THREE.Group>(null);
  const lockLeftRef = useRef<THREE.Group>(null);

  const boxMaterial = useMemo(() => {
    if (!materials || !materials.PDC_tex) return null;
    const mat = materials.PDC_tex.clone();
    mat.transparent = true;
    mat.opacity = 0;
    mat.depthWrite = true;
    return mat;
  }, [materials]);

  useEffect(() => {
    return () => {
      boxMaterial?.dispose();
    };
  }, [boxMaterial]);

  useFrame((_, delta) => {
    if (boxMaterial) {
      const currentOpacity = opacityRef ? (opacityRef.current ?? 1) : 1;
      boxMaterial.opacity = currentOpacity;
    }

    const progress = openProgressRef ? (openProgressRef.current ?? 0) : open ? 1 : 0;

    if (lidRef.current) {
      const targetHinge = -progress * (Math.PI / 1.5);
      lidRef.current.rotation.x = THREE.MathUtils.damp(
        lidRef.current.rotation.x,
        targetHinge,
        8,
        delta
      );
    }

    const targetLock = progress > 0.02 || (isHovered && canClick) ? -Math.PI / 2 : 0;
    if (lockRightRef.current) {
      lockRightRef.current.rotation.x = THREE.MathUtils.damp(
        lockRightRef.current.rotation.x,
        targetLock,
        12,
        delta
      );
    }

    if (lockLeftRef.current) {
      lockLeftRef.current.rotation.x = THREE.MathUtils.damp(
        lockLeftRef.current.rotation.x,
        targetLock,
        12,
        delta
      );
    }
  });

  const activeMaterial = boxMaterial || materials.PDC_tex;

  return (
    <group {...props} dispose={null}>
      <group
        onClick={(e) => {
          if (canClick && onClick) {
            onClick(e);
          }
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setIsHovered(true);
          onHoverChange?.(true);
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          setIsHovered(false);
          onHoverChange?.(false);
        }}
      >
        {/* LID */}
        <group ref={lidRef} position={[0, 1.75, -1.42]}>
          <group name="BoxLid" position={[0, -1.75, 1.42]}>
            <Text
              font="/hpf.ttf"
              position={[0, 1.95, 0]}
              rotation={[-Math.PI / 2, 0, 0]}
              fontSize={0.3}
              maxWidth={2.2}
              lineHeight={1.2}
              letterSpacing={0.06}
              textAlign="center"
              anchorX="center"
              anchorY="middle"
              color="#ffffff"
              renderOrder={10}
            >
              {/* {lidText ?? (isUnlocked ? "UNLOCKED\nEXPLORE" : "HPF // ARCHIVE")} */}
              {"Harry Potter\nMagic Elder Wand"}
            </Text>

            <mesh
              name="AboveSurface"
              castShadow
              receiveShadow
              geometry={nodes.polySurface12_PDC_tex_0.geometry}
              material={activeMaterial}
            />
            <mesh
              name="RightTopWood"
              castShadow
              receiveShadow
              geometry={nodes.polySurface19_PDC_tex_0.geometry}
              material={activeMaterial}
            />
            <mesh
              name="LeftTopWood"
              castShadow
              receiveShadow
              geometry={nodes.polySurface30_PDC_tex_0.geometry}
              material={activeMaterial}
            />

            <group name="RightLockHandle">
              <group name="RightLockHandle">
                <mesh
                  castShadow
                  receiveShadow
                  geometry={nodes.polySurface26_PDC_tex_0.geometry}
                  material={activeMaterial}
                />
                <group ref={lockRightRef} position={[0.9, 1.8, 2.1]}>
                  <mesh
                    position={[-0.9, -1.8, -2.1]}
                    castShadow
                    receiveShadow
                    geometry={nodes.polySurface24_PDC_tex_0.geometry}
                    material={activeMaterial}
                  />
                </group>
                <mesh
                  castShadow
                  receiveShadow
                  geometry={nodes.pPlane1_PDC_tex_0.geometry}
                  material={activeMaterial}
                />
                <mesh
                  castShadow
                  receiveShadow
                  geometry={nodes.polySurface22_PDC_tex_0.geometry}
                  material={activeMaterial}
                />
              </group>
            </group>

            <group name="LeftLockHandle">
              <mesh
                castShadow
                receiveShadow
                geometry={nodes.pPlane6_PDC_tex_0.geometry}
                material={activeMaterial}
              />
              <mesh
                castShadow
                receiveShadow
                geometry={nodes.polySurface33_PDC_tex_0.geometry}
                material={activeMaterial}
              />
              <mesh
                castShadow
                receiveShadow
                geometry={nodes.polySurface31_PDC_tex_0.geometry}
                material={activeMaterial}
              />
              <group ref={lockLeftRef} position={[0.9, 1.8, 2.1]}>
                <mesh
                  position={[-0.9, -1.8, -2.1]}
                  castShadow
                  receiveShadow
                  geometry={nodes.polySurface28_PDC_tex_0.geometry}
                  material={activeMaterial}
                />
              </group>
            </group>
          </group>
        </group>

        <mesh
          name="FrontSurface"
          castShadow
          receiveShadow
          geometry={nodes.polySurface14_PDC_tex_0.geometry}
          material={activeMaterial}
        />
        <mesh
          name="BackSurface"
          castShadow
          receiveShadow
          geometry={nodes.polySurface3_PDC_tex_0.geometry}
          material={activeMaterial}
        />
        <mesh
          name="BottomSurface"
          castShadow
          receiveShadow
          geometry={nodes.polySurface8_PDC_tex_0.geometry}
          material={activeMaterial}
        />
        <mesh
          name="SideSurface"
          castShadow
          receiveShadow
          geometry={nodes.polySurface4_PDC_tex_0.geometry}
          material={activeMaterial}
        />

        <group name="Right">
          <group name="RightWood">
            <mesh
              name="RightNearWood"
              castShadow
              receiveShadow
              geometry={nodes.polySurface6_PDC_tex_0.geometry}
              material={activeMaterial}
            />
            <mesh
              name="RightFarWood"
              castShadow
              receiveShadow
              geometry={nodes.polySurface18_PDC_tex_0.geometry}
              material={activeMaterial}
            />
          </group>

          <group name="RightHandle">
            <mesh
              name="RightHandleCable"
              castShadow
              receiveShadow
              geometry={nodes.pPlane4_PDC_tex_0.geometry}
              material={activeMaterial}
            />
            <mesh
              name="RightHandleIron"
              castShadow
              receiveShadow
              geometry={nodes.pCylinder1_PDC_tex_0.geometry}
              material={activeMaterial}
            />
            <mesh
              name="RightIronCover"
              castShadow
              receiveShadow
              geometry={nodes.polySurface27_PDC_tex_0.geometry}
              material={activeMaterial}
            />
          </group>
        </group>

        <group name="Left">
          <group name="LeftWood">
            <mesh
              name="LeftNearWood"
              castShadow
              receiveShadow
              geometry={nodes.polySurface34_PDC_tex_0.geometry}
              material={activeMaterial}
            />
            <mesh
              name="LeftFarWood"
              castShadow
              receiveShadow
              geometry={nodes.polySurface32_PDC_tex_0.geometry}
              material={activeMaterial}
            />
          </group>

          <group name="LeftHandle">
            <mesh
              name="LeftHandleCable"
              castShadow
              receiveShadow
              geometry={nodes.pPlane5_PDC_tex_0.geometry}
              material={activeMaterial}
            />
            <mesh
              name="LeftHandleIron"
              castShadow
              receiveShadow
              geometry={nodes.pCylinder2_PDC_tex_0.geometry}
              material={activeMaterial}
            />
            <mesh
              name="LeftIronCover"
              castShadow
              receiveShadow
              geometry={nodes.polySurface29_PDC_tex_0.geometry}
              material={activeMaterial}
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
  lidText?: string;
}

export const InteractiveBox: React.FC<InteractiveBoxProps> = ({
  inspectBadgeRef,
  lockedBadgeRef,
  unlockedBadgeRef,
  lidText,
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const boxContainerRef = useRef<THREE.Group>(null);

  const [isUnlocked, setIsUnlocked] = useState(false);
  const [canClick, setCanClick] = useState(false);

  const canClickRef = useRef(false);
  const isUnlockedRef = useRef(false);
  const openProgressRef = useRef(0);
  const opacityRef = useRef(0);
  const hoveredRef = useRef(false);
  const clickPunchRef = useRef(0);
  const phaseRef = useRef<Phase>("inspect");

  const { camera } = useThree();
  const scrollData = useScroll();

  useEffect(() => {
    camera.position.set(0, 0, 5);
    camera.lookAt(0, 0, 0);
  }, [camera]);

  useFrame((_, delta) => {
    const lockScrollPx = scrollData.el.clientHeight;
    let currentScroll = scrollData.el.scrollTop;

    // Hard scroll stop at screen 1 until unlocked
    if (!isUnlockedRef.current && currentScroll >= lockScrollPx) {
      scrollData.el.scrollTop = lockScrollPx;
      currentScroll = lockScrollPx;
    }

    const scrollProgress = THREE.MathUtils.clamp(currentScroll / lockScrollPx, 0, 1);
    const extraScroll = Math.max(0, currentScroll - lockScrollPx);

    opacityRef.current = THREE.MathUtils.clamp(scrollProgress / 0.25, 0, 1);

    const openProgress = isUnlockedRef.current
      ? THREE.MathUtils.clamp(extraScroll / SCROLL_UNLOCK_DISTANCE, 0, 1)
      : 0;
    openProgressRef.current = openProgress;

    // Phase management
    let currentPhase: Phase = "inspect";
    if (!isUnlockedRef.current) {
      currentPhase = scrollProgress >= 0.95 ? "locked" : "inspect";
    } else {
      if (scrollProgress < 0.95) {
        currentPhase = "inspect";
      } else if (extraScroll < 200) {
        currentPhase = "unlocked";
      } else {
        currentPhase = "scrolled";
      }
    }

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

    // Sync reactive canClick state
    const isClickable = currentPhase === "locked" && !isUnlockedRef.current;
    if (canClickRef.current !== isClickable) {
      canClickRef.current = isClickable;
      setCanClick(isClickable);
    }

    // Scroll animation
    if (groupRef.current) {
      const targetRotX = THREE.MathUtils.lerp(Math.PI / 2, 0.38, scrollProgress);
      const targetRotY = THREE.MathUtils.lerp(0, 0.65, scrollProgress);

      groupRef.current.rotation.x = THREE.MathUtils.damp(groupRef.current.rotation.x, targetRotX, 6, delta);
      groupRef.current.rotation.y = THREE.MathUtils.damp(groupRef.current.rotation.y, targetRotY, 6, delta);

      const targetPosZ = THREE.MathUtils.lerp(1.2, -1.0, scrollProgress);
      const targetPosY = THREE.MathUtils.lerp(0.2, -extraScroll * 0.003, 0.1);

      groupRef.current.position.z = THREE.MathUtils.damp(groupRef.current.position.z, targetPosZ, 6, delta);
      groupRef.current.position.y = THREE.MathUtils.damp(groupRef.current.position.y, targetPosY, 5, delta);
    }

    // Click Punch / Hover Scale
    if (boxContainerRef.current) {
      const baseScale = 0.65;
      if (clickPunchRef.current > 0) {
        clickPunchRef.current = Math.max(0, clickPunchRef.current - delta * 2.5);
        const punchScale = (1 + Math.sin(clickPunchRef.current * Math.PI) * 0.18) * baseScale;
        boxContainerRef.current.scale.setScalar(punchScale);
      } else {
        const isHovered = hoveredRef.current && isClickable;
        const hoverScale = (isHovered ? 1.01 : 1.0) * baseScale;
        boxContainerRef.current.scale.lerp(new THREE.Vector3(hoverScale, hoverScale, hoverScale), 0.1);
      }
    }
  });

  const handleClick = () => {
    if (canClickRef.current) {
      clickPunchRef.current = 1;
      isUnlockedRef.current = true;
      setIsUnlocked(true);
      canClickRef.current = false;
      setCanClick(false);
      hoveredRef.current = false;

      const startScroll = scrollData.el.scrollTop;
      const targetScroll = startScroll + SCROLL_UNLOCK_DISTANCE;
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
        <group ref={boxContainerRef} scale={0.65} position={[0, -0.2, 0]}>
          <Box
            openProgressRef={openProgressRef}
            opacityRef={opacityRef}
            isUnlocked={isUnlocked}
            canClick={canClick}
            lidText={lidText}
            onClick={handleClick}
            onHoverChange={(hovered) => {
              hoveredRef.current = hovered;
            }}
          />
        </group>
      </group>

      <Html
        portal={{ current: scrollData.el }}
        fullscreen
        className="w-full"
        wrapperClass="!w-full !left-0 !top-0"
        style={{ pointerEvents: "none", width: "100%" }}
      >
        <div className="h-screen w-full xbg-red-500/5" />

        <div className="w-full pointer-events-auto xbg-green-500/5">
          <div className="h-screen w-full xbg-yellow-500/5" />
          <main
            className={`relative z-10 max-w-5xl mx-auto px-6 py-20 flex flex-col gap-28 transition-opacity duration-700
              ${isUnlocked ? "opacity-100" : "opacity-0 pointer-events-none"}
            `}
          >
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

            <footer className="text-center py-10 border-t border-white/8 text-slate-500 text-sm">
              Built with React, Three.js, React Three Fiber & Drei.
            </footer>
          </main>
        </div>
      </Html>
    </>
  );
};

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
          camera={{ position: [0, 0, 5], fov: 50 }}
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