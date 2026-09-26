// TODO: Use model's scale based-on the width of the window to make it responsive

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


export const MODEL_PATHS = {
  gelamBox: "/gelam-box-t.glb",
  // Add additional models here
} as const;

export type ModelKey = keyof typeof MODEL_PATHS;

Object.values(MODEL_PATHS).forEach((path) => {
  useGLTF.preload(path);
});

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

class SceneErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
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
                {errorMessage ||
                  "An asset failed to download. Please check your network connection and try again."}
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
              <span className="text-6xl md:text-7xl">
                {Math.floor(progress)}
              </span>
              <span className="text-2xl md:text-3xl text-blue-500 ml-1.5">
                %
              </span>
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

// --- Interactive Gelam Box Component ---
export function Box({
  modelPath = MODEL_PATHS.gelamBox,
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
  modelPath?: string;
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
  const { nodes, materials } = useGLTF(modelPath) as any;
  const [isHovered, setIsHovered] = useState(false);

  // Directly controls cursor pointer when model is hovered and clickable
  useCursor(isHovered && canClick);

  const lidRef = useRef<THREE.Group>(null);
  const lockRightRef = useRef<THREE.Group>(null);
  const lockLeftRef = useRef<THREE.Group>(null);

  const whiteColor = useMemo(() => new THREE.Color("#ffffff"), []);
  const blackColor = useMemo(() => new THREE.Color("#000000"), []);

  // Clone materials to support dynamic opacity fade-in
  const clonedMaterials = useMemo(() => {
    if (!materials) return null;
    const cloned: Record<string, THREE.Material> = {};
    Object.entries(materials).forEach(([key, mat]: [string, any]) => {
      if (mat instanceof THREE.Material) {
        const clonedMat = mat.clone();
        // clonedMat.transparent = true;
        clonedMat.needsUpdate = true;
        // TODO: Investigate why depthWrite is needed for the fade-in to work correctly
        clonedMat.depthWrite = true;
        // clonedMat.depthWrite = false;

        if (key === "Plaque_Text_Mat") {
          clonedMat.opacity = 1;
          if ("color" in clonedMat) {
            (clonedMat as THREE.MeshStandardMaterial).color.set("#ffffff");
          }
        } else {
          clonedMat.opacity = 0;
        }

        cloned[key] = clonedMat;
      }
    });
    return cloned;
  }, [materials]);

  // useEffect(() => {
  //   return () => {
  //     if (clonedMaterials) {
  //       Object.values(clonedMaterials).forEach((mat) => mat.dispose());
  //     }
  //   };
  // }, [clonedMaterials]);

  useFrame((_, delta) => {
    const currentOpacity = opacityRef ? (opacityRef.current ?? 1) : 1;

    if (clonedMaterials) {
      // Only fade other box parts; keep Plaque_Text_Mat fully opaque
      Object.entries(clonedMaterials).forEach(([key, mat]) => {
        if (key !== "Plaque_Text_Mat") {
          mat.opacity = currentOpacity;
        }
      });

      // Plaque_Author & Plaque_Text color transition (white -> black)
      if ("Plaque_Text_Mat" in clonedMaterials) {
        const textMat =
          clonedMaterials.Plaque_Text_Mat as THREE.MeshStandardMaterial;
        textMat.color.lerpColors(whiteColor, blackColor, currentOpacity);
      }
    }

    const progress = openProgressRef
      ? (openProgressRef.current ?? 0)
      : open
        ? 1
        : 0;

    // Lid animation: rotate down when open, rotate up when closed
    if (lidRef.current) {
      const targetHinge = -progress * (Math.PI / 1.5);
      lidRef.current.rotation.x = THREE.MathUtils.damp(
        lidRef.current.rotation.x,
        targetHinge,
        8,
        delta,
      );
    }

    // Lock animation: rotate up when open or hovered, rotate up when closed and not hovered
    const targetLock =
      progress > 0.02 || (isHovered && canClick) ? -Math.PI / 2 : 0;

    if (lockRightRef.current) {
      lockRightRef.current.rotation.x = THREE.MathUtils.damp(
        lockRightRef.current.rotation.x,
        targetLock,
        12,
        delta,
      );
    }

    if (lockLeftRef.current) {
      lockLeftRef.current.rotation.x = THREE.MathUtils.damp(
        lockLeftRef.current.rotation.x,
        targetLock,
        12,
        delta,
      );
    }
  });

  const activeMaterials = clonedMaterials || materials;

  return (
    <group {...props} name="Chest_Root" dispose={null}>
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
        {/* CHEST BODY */}
        <group name="Box_Body" position={[-2.275, 0, 0.55]}>
          <mesh
            name="Cube_Mat_body_bottom"
            castShadow
            receiveShadow
            geometry={nodes.Cube.geometry}
            material={activeMaterials.Mat_body_bottom}
          />
          <mesh
            name="Cube_Mat_body_front"
            castShadow
            receiveShadow
            geometry={nodes.Cube_1.geometry}
            material={activeMaterials.Mat_body_front}
          />
          <mesh
            name="Cube_Mat_body_back"
            castShadow
            receiveShadow
            geometry={nodes.Cube_2.geometry}
            material={activeMaterials.Mat_body_back}
          />
          <mesh
            name="Cube_Mat_body_left"
            castShadow
            receiveShadow
            geometry={nodes.Cube_3.geometry}
            material={activeMaterials.Mat_body_left}
          />
          <mesh
            name="Cube_Mat_body_right"
            castShadow
            receiveShadow
            geometry={nodes.Cube_4.geometry}
            material={activeMaterials.Mat_body_right}
          />
          <mesh
            name="Cube_Mat_body_rim"
            castShadow
            receiveShadow
            geometry={nodes.Cube_5.geometry}
            material={activeMaterials.Mat_body_rim}
          />
          <mesh
            name="Cube_Mat_body_edge"
            castShadow
            receiveShadow
            geometry={nodes.Cube_6.geometry}
            material={activeMaterials.Mat_body_edge}
          />
          <group name="Hinge_Left_Bottom_Root" position={[0.575, 0.45, -1.112]}>
            <mesh
              name="Hinge_Left_Knuckle_2"
              castShadow
              receiveShadow
              geometry={nodes.Hinge_Left_Knuckle_2.geometry}
              material={activeMaterials.Hinge_Mat}
              position={[-0.038, 0, 0]}
              rotation={[0, 0, -Math.PI / 2]}
            />
            <mesh
              name="Hinge_Left_Knuckle_4"
              castShadow
              receiveShadow
              geometry={nodes.Hinge_Left_Knuckle_4.geometry}
              material={activeMaterials.Hinge_Mat}
              position={[0.113, 0, 0]}
              rotation={[0, 0, -Math.PI / 2]}
            />
            <mesh
              name="Hinge_Left_Leaf_Bottom"
              castShadow
              receiveShadow
              geometry={nodes.Hinge_Left_Leaf_Bottom.geometry}
              material={activeMaterials.Hinge_Mat}
              position={[0, 0, 0.012]}
            />
            <mesh
              name="Hinge_Left_Screw_Bottom_Left"
              castShadow
              receiveShadow
              geometry={nodes.Hinge_Left_Screw_Bottom_Left.geometry}
              material={activeMaterials.Screws_Mat}
              position={[-0.108, -0.067, -0.004]}
              rotation={[Math.PI / 2, 0, 0]}
            />
            <mesh
              name="Hinge_Left_Screw_Bottom_Right"
              castShadow
              receiveShadow
              geometry={nodes.Hinge_Left_Screw_Bottom_Right.geometry}
              material={activeMaterials.Screws_Mat}
              position={[0.108, -0.067, -0.004]}
              rotation={[Math.PI / 2, 0, 0]}
            />
          </group>
          <group
            name="Hinge_Right_Bottom_Root"
            position={[3.975, 0.45, -1.112]}
          >
            <mesh
              name="Hinge_Right_Knuckle_2"
              castShadow
              receiveShadow
              geometry={nodes.Hinge_Right_Knuckle_2.geometry}
              material={activeMaterials.Hinge_Mat}
              position={[-0.038, 0, 0]}
              rotation={[0, 0, -Math.PI / 2]}
            />
            <mesh
              name="Hinge_Right_Knuckle_4"
              castShadow
              receiveShadow
              geometry={nodes.Hinge_Right_Knuckle_4.geometry}
              material={activeMaterials.Hinge_Mat}
              position={[0.113, 0, 0]}
              rotation={[0, 0, -Math.PI / 2]}
            />
            <mesh
              name="Hinge_Right_Leaf_Bottom"
              castShadow
              receiveShadow
              geometry={nodes.Hinge_Right_Leaf_Bottom.geometry}
              material={activeMaterials.Hinge_Mat}
              position={[0, 0, 0.012]}
            />
            <mesh
              name="Hinge_Right_Screw_Bottom_Left"
              castShadow
              receiveShadow
              geometry={nodes.Hinge_Right_Screw_Bottom_Left.geometry}
              material={activeMaterials.Screws_Mat}
              position={[-0.108, -0.067, -0.004]}
              rotation={[Math.PI / 2, 0, 0]}
            />
            <mesh
              name="Hinge_Right_Screw_Bottom_Right"
              castShadow
              receiveShadow
              geometry={nodes.Hinge_Right_Screw_Bottom_Right.geometry}
              material={activeMaterials.Screws_Mat}
              position={[0.108, -0.067, -0.004]}
              rotation={[Math.PI / 2, 0, 0]}
            />
          </group>
          <mesh
            name="Interior_Liner"
            castShadow
            receiveShadow
            geometry={nodes.Interior_Liner.geometry}
            material={activeMaterials.Inner_Leather_Mat}
            position={[2.275, 0.1, -0.55]}
          >
            <mesh
              name="Cradle_Left"
              castShadow
              receiveShadow
              geometry={nodes.Cradle_Left.geometry}
              material={activeMaterials.Cradle_Mat}
              position={[-1.35, 0.018, 0]}
            >
              <mesh
                name="Cradle_Left_Tack_Left_Front"
                castShadow
                receiveShadow
                geometry={nodes.Cradle_Left_Tack_Left_Front.geometry}
                material={activeMaterials.Hammered_Tacks_Mat}
                position={[-0.085, 0.018, 0.115]}
              />
              <mesh
                name="Cradle_Left_Tack_Left_Rear"
                castShadow
                receiveShadow
                geometry={nodes.Cradle_Left_Tack_Left_Rear.geometry}
                material={activeMaterials.Hammered_Tacks_Mat}
                position={[-0.085, 0.018, -0.115]}
              />
              <mesh
                name="Cradle_Left_Tack_Right_Front"
                castShadow
                receiveShadow
                geometry={nodes.Cradle_Left_Tack_Right_Front.geometry}
                material={activeMaterials.Hammered_Tacks_Mat}
                position={[0.085, 0.018, 0.115]}
              />
              <mesh
                name="Cradle_Left_Tack_Right_Rear"
                castShadow
                receiveShadow
                geometry={nodes.Cradle_Left_Tack_Right_Rear.geometry}
                material={activeMaterials.Hammered_Tacks_Mat}
                position={[0.085, 0.018, -0.115]}
              />
            </mesh>
            <mesh
              name="Cradle_Right"
              castShadow
              receiveShadow
              geometry={nodes.Cradle_Right.geometry}
              material={activeMaterials.Cradle_Mat}
              position={[1.35, 0.018, 0]}
            >
              <mesh
                name="Cradle_Right_Tack_Left_Front"
                castShadow
                receiveShadow
                geometry={nodes.Cradle_Right_Tack_Left_Front.geometry}
                material={activeMaterials.Hammered_Tacks_Mat}
                position={[-0.085, 0.018, 0.115]}
              />
              <mesh
                name="Cradle_Right_Tack_Left_Rear"
                castShadow
                receiveShadow
                geometry={nodes.Cradle_Right_Tack_Left_Rear.geometry}
                material={activeMaterials.Hammered_Tacks_Mat}
                position={[-0.085, 0.018, -0.115]}
              />
              <mesh
                name="Cradle_Right_Tack_Right_Front"
                castShadow
                receiveShadow
                geometry={nodes.Cradle_Right_Tack_Right_Front.geometry}
                material={activeMaterials.Hammered_Tacks_Mat}
                position={[0.085, 0.018, 0.115]}
              />
              <mesh
                name="Cradle_Right_Tack_Right_Rear"
                castShadow
                receiveShadow
                geometry={nodes.Cradle_Right_Tack_Right_Rear.geometry}
                material={activeMaterials.Hammered_Tacks_Mat}
                position={[0.085, 0.018, -0.115]}
              />
            </mesh>
            <group name="Interior_Catch_Center" position={[0, 0.018, 0]}>
              <mesh
                name="Interior_Catch_Center_Face"
                castShadow
                receiveShadow
                geometry={nodes.Magnetic_Catch_Disc_Mesh.geometry}
                material={activeMaterials.Magnetic_Catch_Mat}
              />
              <mesh
                name="Interior_Catch_Center_Edge"
                castShadow
                receiveShadow
                geometry={nodes.Magnetic_Catch_Disc_Mesh_1.geometry}
                material={activeMaterials.Magnetic_Catch_Edge_Mat}
              />
            </group>
            <group name="Interior_Catch_Left" position={[-0.72, 0.018, 0]}>
              <mesh
                name="Interior_Catch_Left_Face"
                castShadow
                receiveShadow
                geometry={nodes.Magnetic_Catch_Disc_Mesh.geometry}
                material={activeMaterials.Magnetic_Catch_Mat}
              />
              <mesh
                name="Interior_Catch_Left_Edge"
                castShadow
                receiveShadow
                geometry={nodes.Magnetic_Catch_Disc_Mesh_1.geometry}
                material={activeMaterials.Magnetic_Catch_Edge_Mat}
              />
            </group>
            <group name="Interior_Catch_Right" position={[0.72, 0.018, 0]}>
              <mesh
                name="Interior_Catch_Right_Face"
                castShadow
                receiveShadow
                geometry={nodes.Magnetic_Catch_Disc_Mesh.geometry}
                material={activeMaterials.Magnetic_Catch_Mat}
              />
              <mesh
                name="Interior_Catch_Right_Edge"
                castShadow
                receiveShadow
                geometry={nodes.Magnetic_Catch_Disc_Mesh_1.geometry}
                material={activeMaterials.Magnetic_Catch_Edge_Mat}
              />
            </group>
            <mesh
              name="Interior_Tack_Corner_Left_Front"
              castShadow
              receiveShadow
              geometry={nodes.Interior_Tack_Corner_Left_Front.geometry}
              material={activeMaterials.Hammered_Tacks_Mat}
              position={[-1.915, 0.018, 0.35]}
            />
            <mesh
              name="Interior_Tack_Corner_Left_Rear"
              castShadow
              receiveShadow
              geometry={nodes.Interior_Tack_Corner_Left_Rear.geometry}
              material={activeMaterials.Hammered_Tacks_Mat}
              position={[-1.915, 0.018, -0.35]}
            />
            <mesh
              name="Interior_Tack_Corner_Right_Front"
              castShadow
              receiveShadow
              geometry={nodes.Interior_Tack_Corner_Right_Front.geometry}
              material={activeMaterials.Hammered_Tacks_Mat}
              position={[1.915, 0.018, 0.35]}
            />
            <mesh
              name="Interior_Tack_Corner_Right_Rear"
              castShadow
              receiveShadow
              geometry={nodes.Interior_Tack_Corner_Right_Rear.geometry}
              material={activeMaterials.Hammered_Tacks_Mat}
              position={[1.915, 0.018, -0.35]}
            />
            <mesh
              name="Interior_Tack_Cradle_Left_Front"
              castShadow
              receiveShadow
              geometry={nodes.Interior_Tack_Cradle_Left_Front.geometry}
              material={activeMaterials.Hammered_Tacks_Mat}
              position={[-1.35, 0.018, 0.35]}
            />
            <mesh
              name="Interior_Tack_Cradle_Left_Rear"
              castShadow
              receiveShadow
              geometry={nodes.Interior_Tack_Cradle_Left_Rear.geometry}
              material={activeMaterials.Hammered_Tacks_Mat}
              position={[-1.35, 0.018, -0.35]}
            />
            <mesh
              name="Interior_Tack_Cradle_Right_Front"
              castShadow
              receiveShadow
              geometry={nodes.Interior_Tack_Cradle_Right_Front.geometry}
              material={activeMaterials.Hammered_Tacks_Mat}
              position={[1.35, 0.018, 0.35]}
            />
            <mesh
              name="Interior_Tack_Cradle_Right_Rear"
              castShadow
              receiveShadow
              geometry={nodes.Interior_Tack_Cradle_Right_Rear.geometry}
              material={activeMaterials.Hammered_Tacks_Mat}
              position={[1.35, 0.018, -0.35]}
            />
            <mesh
              name="Interior_Tack_Mid_Left_Front"
              castShadow
              receiveShadow
              geometry={nodes.Interior_Tack_Mid_Left_Front.geometry}
              material={activeMaterials.Hammered_Tacks_Mat}
              position={[-0.36, 0.018, 0.35]}
            />
            <mesh
              name="Interior_Tack_Mid_Left_Rear"
              castShadow
              receiveShadow
              geometry={nodes.Interior_Tack_Mid_Left_Rear.geometry}
              material={activeMaterials.Hammered_Tacks_Mat}
              position={[-0.36, 0.018, -0.35]}
            />
            <mesh
              name="Interior_Tack_Mid_Right_Front"
              castShadow
              receiveShadow
              geometry={nodes.Interior_Tack_Mid_Right_Front.geometry}
              material={activeMaterials.Hammered_Tacks_Mat}
              position={[0.36, 0.018, 0.35]}
            />
            <mesh
              name="Interior_Tack_Mid_Right_Rear"
              castShadow
              receiveShadow
              geometry={nodes.Interior_Tack_Mid_Right_Rear.geometry}
              material={activeMaterials.Hammered_Tacks_Mat}
              position={[0.36, 0.018, -0.35]}
            />
          </mesh>
          <group name="Lock_Left_Bottom_Root" position={[0.487, 0.45, 0]}>
            <mesh
              name="Lock_Left_Catch_Stud"
              castShadow
              receiveShadow
              geometry={nodes.Lock_Left_Catch_Stud.geometry}
              material={activeMaterials.Lock_Mat}
            />
            <mesh
              name="Lock_Left_Plate_Bottom"
              castShadow
              receiveShadow
              geometry={nodes.Lock_Left_Plate_Bottom.geometry}
              material={activeMaterials.Lock_Mat}
            />
            <mesh
              name="Lock_Left_Screw_Bottom_Left"
              castShadow
              receiveShadow
              geometry={nodes.Lock_Left_Screw_Bottom_Left.geometry}
              material={activeMaterials.Screws_Mat}
              position={[-0.089, -0.037, 0.016]}
              rotation={[-Math.PI / 2, 0, 0]}
            />
            <mesh
              name="Lock_Left_Screw_Bottom_Right"
              castShadow
              receiveShadow
              geometry={nodes.Lock_Left_Screw_Bottom_Right.geometry}
              material={activeMaterials.Screws_Mat}
              position={[0.089, -0.037, 0.016]}
              rotation={[-Math.PI / 2, 0, 0]}
            />
          </group>
          <group name="Lock_Right_Bottom_Root" position={[4.063, 0.45, 0]}>
            <mesh
              name="Lock_Right_Catch_Stud"
              castShadow
              receiveShadow
              geometry={nodes.Lock_Right_Catch_Stud.geometry}
              material={activeMaterials.Lock_Mat}
            />
            <mesh
              name="Lock_Right_Plate_Bottom"
              castShadow
              receiveShadow
              geometry={nodes.Lock_Right_Plate_Bottom.geometry}
              material={activeMaterials.Lock_Mat}
            />
            <mesh
              name="Lock_Right_Screw_Bottom_Left"
              castShadow
              receiveShadow
              geometry={nodes.Lock_Right_Screw_Bottom_Left.geometry}
              material={activeMaterials.Screws_Mat}
              position={[-0.089, -0.037, 0.016]}
              rotation={[-Math.PI / 2, 0, 0]}
            />
            <mesh
              name="Lock_Right_Screw_Bottom_Right"
              castShadow
              receiveShadow
              geometry={nodes.Lock_Right_Screw_Bottom_Right.geometry}
              material={activeMaterials.Screws_Mat}
              position={[0.089, -0.037, 0.016]}
              rotation={[-Math.PI / 2, 0, 0]}
            />
          </group>
        </group>

        {/* CHEST LID */}
        <group ref={lidRef} name="Box_Lid" position={[0, 0.45, -0.562]}>
          <mesh
            name="Cube001_Mat_lid_top"
            castShadow
            receiveShadow
            geometry={nodes.Cube001.geometry}
            material={activeMaterials.Mat_lid_top}
          />
          <mesh
            name="Cube001_Mat_lid_front"
            castShadow
            receiveShadow
            geometry={nodes.Cube001_1.geometry}
            material={activeMaterials.Mat_lid_front}
          />
          <mesh
            name="Cube001_Mat_lid_back"
            castShadow
            receiveShadow
            geometry={nodes.Cube001_2.geometry}
            material={activeMaterials.Mat_lid_back}
          />
          <mesh
            name="Cube001_Mat_lid_left"
            castShadow
            receiveShadow
            geometry={nodes.Cube001_3.geometry}
            material={activeMaterials.Mat_lid_left}
          />
          <mesh
            name="Cube001_Mat_lid_right"
            castShadow
            receiveShadow
            geometry={nodes.Cube001_4.geometry}
            material={activeMaterials.Mat_lid_right}
          />
          <mesh
            name="Cube001_Mat_lid_inner"
            castShadow
            receiveShadow
            geometry={nodes.Cube001_5.geometry}
            material={activeMaterials.Mat_lid_inner}
          />
          <mesh
            name="Cube001_Mat_lid_edge"
            castShadow
            receiveShadow
            geometry={nodes.Cube001_6.geometry}
            material={activeMaterials.Mat_lid_edge}
          />

          <group name="Hinge_Left_Top_Root" position={[-1.7, 0, 0]}>
            <mesh
              name="Hinge_Left_Knuckle_1"
              castShadow
              receiveShadow
              geometry={nodes.Hinge_Left_Knuckle_1.geometry}
              material={activeMaterials.Hinge_Mat}
              position={[-0.113, 0, 0]}
              rotation={[0, 0, -Math.PI / 2]}
            />
            <mesh
              name="Hinge_Left_Knuckle_3"
              castShadow
              receiveShadow
              geometry={nodes.Hinge_Left_Knuckle_3.geometry}
              material={activeMaterials.Hinge_Mat}
              position={[0.038, 0, 0]}
              rotation={[0, 0, -Math.PI / 2]}
            />
            <mesh
              name="Hinge_Left_Leaf_Top"
              castShadow
              receiveShadow
              geometry={nodes.Hinge_Left_Leaf_Top.geometry}
              material={activeMaterials.Hinge_Mat}
              position={[0, 0, 0.012]}
            />
            <mesh
              name="Hinge_Left_Screw_Top_Left"
              castShadow
              receiveShadow
              geometry={nodes.Hinge_Left_Screw_Top_Left.geometry}
              material={activeMaterials.Screws_Mat}
              position={[-0.108, 0.067, -0.004]}
              rotation={[Math.PI / 2, 0, 0]}
            />
            <mesh
              name="Hinge_Left_Screw_Top_Right"
              castShadow
              receiveShadow
              geometry={nodes.Hinge_Left_Screw_Top_Right.geometry}
              material={activeMaterials.Screws_Mat}
              position={[0.108, 0.067, -0.004]}
              rotation={[Math.PI / 2, 0, 0]}
            />
          </group>

          <group name="Hinge_Right_Top_Root" position={[1.7, 0, 0]}>
            <mesh
              name="Hinge_Right_Knuckle_1"
              castShadow
              receiveShadow
              geometry={nodes.Hinge_Right_Knuckle_1.geometry}
              material={activeMaterials.Hinge_Mat}
              position={[-0.113, 0, 0]}
              rotation={[0, 0, -Math.PI / 2]}
            />
            <mesh
              name="Hinge_Right_Knuckle_3"
              castShadow
              receiveShadow
              geometry={nodes.Hinge_Right_Knuckle_3.geometry}
              material={activeMaterials.Hinge_Mat}
              position={[0.038, 0, 0]}
              rotation={[0, 0, -Math.PI / 2]}
            />
            <mesh
              name="Hinge_Right_Leaf_Top"
              castShadow
              receiveShadow
              geometry={nodes.Hinge_Right_Leaf_Top.geometry}
              material={activeMaterials.Hinge_Mat}
              position={[0, 0, 0.012]}
            />
            <mesh
              name="Hinge_Right_Screw_Top_Left"
              castShadow
              receiveShadow
              geometry={nodes.Hinge_Right_Screw_Top_Left.geometry}
              material={activeMaterials.Screws_Mat}
              position={[-0.108, 0.067, -0.004]}
              rotation={[Math.PI / 2, 0, 0]}
            />
            <mesh
              name="Hinge_Right_Screw_Top_Right"
              castShadow
              receiveShadow
              geometry={nodes.Hinge_Right_Screw_Top_Right.geometry}
              material={activeMaterials.Screws_Mat}
              position={[0.108, 0.067, -0.004]}
              rotation={[Math.PI / 2, 0, 0]}
            />
          </group>

          <group
            name="Lid_Magnetic_Catch"
            position={[-1.25, 0.3, 0.562]}
            rotation={[-Math.PI, 0, 0]}
          >
            <mesh
              name="Lid_Magnetic_Catch_Face"
              castShadow
              receiveShadow
              geometry={nodes.Magnetic_Catch_Disc_Mesh.geometry}
              material={activeMaterials.Magnetic_Catch_Mat}
            />
            <mesh
              name="Lid_Magnetic_Catch_Edge"
              castShadow
              receiveShadow
              geometry={nodes.Magnetic_Catch_Disc_Mesh_1.geometry}
              material={activeMaterials.Magnetic_Catch_Edge_Mat}
            />
          </group>

          <mesh
            name="Lid_Strap_1"
            castShadow
            receiveShadow
            geometry={nodes.Lid_Strap_1.geometry}
            material={activeMaterials.Straps_Mat}
            position={[0.2, 0.3, 0.562]}
            rotation={[-Math.PI, 0, 0]}
          >
            <mesh
              name="Lid_Strap_1_Tack_Front"
              castShadow
              receiveShadow
              geometry={nodes.Lid_Strap_1_Tack_Front.geometry}
              material={activeMaterials.Hammered_Tacks_Mat}
              position={[0, 0.018, 0.31]}
            />
            <mesh
              name="Lid_Strap_1_Tack_Rear"
              castShadow
              receiveShadow
              geometry={nodes.Lid_Strap_1_Tack_Rear.geometry}
              material={activeMaterials.Hammered_Tacks_Mat}
              position={[0, 0.018, -0.31]}
            />
          </mesh>

          <mesh
            name="Lid_Strap_2"
            castShadow
            receiveShadow
            geometry={nodes.Lid_Strap_2.geometry}
            material={activeMaterials.Straps_Mat}
            position={[1.4, 0.3, 0.562]}
            rotation={[-Math.PI, 0, 0]}
          >
            <mesh
              name="Lid_Strap_2_Tack_Front"
              castShadow
              receiveShadow
              geometry={nodes.Lid_Strap_2_Tack_Front.geometry}
              material={activeMaterials.Hammered_Tacks_Mat}
              position={[0, 0.018, 0.31]}
            />
            <mesh
              name="Lid_Strap_2_Tack_Rear"
              castShadow
              receiveShadow
              geometry={nodes.Lid_Strap_2_Tack_Rear.geometry}
              material={activeMaterials.Hammered_Tacks_Mat}
              position={[0, 0.018, -0.31]}
            />
          </mesh>

          {/* Left Latch */}
          <group name="Lock_Left_Top_Root" position={[-1.788, 0, 1.112]}>
            <group
              ref={lockLeftRef}
              name="Lock_Left_Arm_Pivot"
              position={[0, 0.063, 0.02]}
            >
              <mesh
                name="Lock_Left_Arm_Pivot_Pin"
                castShadow
                receiveShadow
                geometry={nodes.Lock_Left_Arm_Pivot_Pin.geometry}
                material={activeMaterials.Pins_Mat}
                position={[0, 0, 0.005]}
                rotation={[0, 0, -Math.PI / 2]}
              />
              <mesh
                name="Lock_Left_Swing_Arm"
                castShadow
                receiveShadow
                geometry={nodes.Lock_Left_Swing_Arm.geometry}
                material={activeMaterials.Lock_Mat}
              />
            </group>
            <mesh
              name="Lock_Left_Grip"
              castShadow
              receiveShadow
              geometry={nodes.Lock_Left_Grip.geometry}
              material={activeMaterials.Lock_Mat}
            />
            <mesh
              name="Lock_Left_Plate_Top"
              castShadow
              receiveShadow
              geometry={nodes.Lock_Left_Plate_Top.geometry}
              material={activeMaterials.Lock_Mat}
            />
            <mesh
              name="Lock_Left_Screw_Top_Left"
              castShadow
              receiveShadow
              geometry={nodes.Lock_Left_Screw_Top_Left.geometry}
              material={activeMaterials.Screws_Mat}
              position={[-0.089, 0.045, 0.016]}
              rotation={[-Math.PI / 2, 0, 0]}
            />
            <mesh
              name="Lock_Left_Screw_Top_Right"
              castShadow
              receiveShadow
              geometry={nodes.Lock_Left_Screw_Top_Right.geometry}
              material={activeMaterials.Screws_Mat}
              position={[0.089, 0.045, 0.016]}
              rotation={[-Math.PI / 2, 0, 0]}
            />
          </group>

          {/* Right Latch */}
          <group name="Lock_Right_Top_Root" position={[1.787, 0, 1.112]}>
            <group
              ref={lockRightRef}
              name="Lock_Right_Arm_Pivot"
              position={[0, 0.063, 0.02]}
            >
              <mesh
                name="Lock_Right_Arm_Pivot_Pin"
                castShadow
                receiveShadow
                geometry={nodes.Lock_Right_Arm_Pivot_Pin.geometry}
                material={activeMaterials.Pins_Mat}
                position={[0, 0, 0.005]}
                rotation={[0, 0, -Math.PI / 2]}
              />
              <mesh
                name="Lock_Right_Swing_Arm"
                castShadow
                receiveShadow
                geometry={nodes.Lock_Right_Swing_Arm.geometry}
                material={activeMaterials.Lock_Mat}
              />
            </group>
            <mesh
              name="Lock_Right_Grip"
              castShadow
              receiveShadow
              geometry={nodes.Lock_Right_Grip.geometry}
              material={activeMaterials.Lock_Mat}
            />
            <mesh
              name="Lock_Right_Plate_Top"
              castShadow
              receiveShadow
              geometry={nodes.Lock_Right_Plate_Top.geometry}
              material={activeMaterials.Lock_Mat}
            />
            <mesh
              name="Lock_Right_Screw_Top_Left"
              castShadow
              receiveShadow
              geometry={nodes.Lock_Right_Screw_Top_Left.geometry}
              material={activeMaterials.Screws_Mat}
              position={[-0.089, 0.045, 0.016]}
              rotation={[-Math.PI / 2, 0, 0]}
            />
            <mesh
              name="Lock_Right_Screw_Top_Right"
              castShadow
              receiveShadow
              geometry={nodes.Lock_Right_Screw_Top_Right.geometry}
              material={activeMaterials.Screws_Mat}
              position={[0.089, 0.045, 0.016]}
              rotation={[-Math.PI / 2, 0, 0]}
            />
          </group>

          {/* Top Plaque & Inscribed Text */}
          <group name="Plaque_Root" position={[0, 0.4, 0.562]}>
            <mesh
              name="Top_Leather"
              castShadow
              receiveShadow
              geometry={nodes.Top_Leather.geometry}
              material={activeMaterials.Outer_Leather_Mat}
            />
            <mesh
              name="Top_Plaque"
              castShadow
              receiveShadow
              geometry={nodes.Top_Plaque.geometry}
              material={activeMaterials.Wood_Plaque_Mat}
              position={[0, 0.007, 0]}
            >
              <mesh
                name="Plaque_Author"
                castShadow
                receiveShadow
                geometry={nodes.Plaque_Author.geometry}
                material={activeMaterials.Plaque_Text_Mat}
                position={[0.594, 0.021, 0.09]}
              />
              <mesh
                name="Plaque_Screw_Bottom_Left"
                castShadow
                receiveShadow
                geometry={nodes.Plaque_Screw_Bottom_Left.geometry}
                material={activeMaterials.Screws_Mat}
                position={[-0.726, 0.021, 0.124]}
              />
              <mesh
                name="Plaque_Screw_Bottom_Right"
                castShadow
                receiveShadow
                geometry={nodes.Plaque_Screw_Bottom_Right.geometry}
                material={activeMaterials.Screws_Mat}
                position={[0.726, 0.021, 0.124]}
              />
              <mesh
                name="Plaque_Screw_Top_Left"
                castShadow
                receiveShadow
                geometry={nodes.Plaque_Screw_Top_Left.geometry}
                material={activeMaterials.Screws_Mat}
                position={[-0.726, 0.021, -0.124]}
              />
              <mesh
                name="Plaque_Screw_Top_Right"
                castShadow
                receiveShadow
                geometry={nodes.Plaque_Screw_Top_Right.geometry}
                material={activeMaterials.Screws_Mat}
                position={[0.726, 0.021, -0.124]}
              />
              <mesh
                name="Plaque_Text"
                castShadow
                receiveShadow
                geometry={nodes.Plaque_Text.geometry}
                material={activeMaterials.Plaque_Text_Mat}
                position={[0, 0.021, -0.025]}
              />
            </mesh>
          </group>
        </group>
      </group>
    </group>
  );
}

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
    const lockScrollPx = scrollData.el.clientHeight || 0;
    // Guard against unmeasured DOM layout on early frames
    if (lockScrollPx <= 0) return;

    let currentScroll = scrollData.el.scrollTop;

    // Hard scroll stop at screen 1 until unlocked
    if (!isUnlockedRef.current && currentScroll >= lockScrollPx) {
      scrollData.el.scrollTop = lockScrollPx;
      currentScroll = lockScrollPx;
    }

    const scrollProgress = THREE.MathUtils.clamp(
      currentScroll / lockScrollPx,
      0,
      1,
    );
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
        inspectBadgeRef.current.style.display =
          currentPhase === "inspect" ? "flex" : "none";
      }
      if (lockedBadgeRef.current) {
        lockedBadgeRef.current.style.display =
          currentPhase === "locked" ? "flex" : "none";
      }
      if (unlockedBadgeRef.current) {
        unlockedBadgeRef.current.style.display =
          currentPhase === "unlocked" ? "flex" : "none";
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
      const targetRotX = THREE.MathUtils.lerp(
        Math.PI / 2,
        0.38,
        scrollProgress,
      );
      groupRef.current.rotation.x = THREE.MathUtils.damp(
        groupRef.current.rotation.x,
        targetRotX,
        6,
        delta,
      );

      // const targetRotY = THREE.MathUtils.lerp(0, 0.65, scrollProgress);
      // groupRef.current.rotation.y = THREE.MathUtils.damp(
      //   groupRef.current.rotation.y,
      //   targetRotY,
      //   6,
      //   delta,
      // );

      const targetPosZ = THREE.MathUtils.lerp(2.7, 0.8, scrollProgress);
      groupRef.current.position.z = THREE.MathUtils.damp(
        groupRef.current.position.z,
        targetPosZ,
        6,
        delta,
      );

      const targetPosY = THREE.MathUtils.lerp(0, -0.5, scrollProgress);
      groupRef.current.position.y = THREE.MathUtils.damp(
        groupRef.current.position.y,
        targetPosY,
        6,
        delta,
      );

      // const targetPosY = THREE.MathUtils.lerp(
      //   0.5,
      //   -0.5 - extraScroll * 0.003,
      //   0.1,
      // );
      // groupRef.current.position.y = THREE.MathUtils.damp(
      //   groupRef.current.position.y,
      //   targetPosY,
      //   5,
      //   delta,
      // );
    }

    // Click Punch / Hover Scale
    if (boxContainerRef.current) {
      const baseScale = 1;
      if (clickPunchRef.current > 0) {
        clickPunchRef.current = Math.max(
          0,
          clickPunchRef.current - delta * 2.5,
        );
        const punchScale =
          (1 + Math.sin(clickPunchRef.current * Math.PI) * 0.18) * baseScale;
        // Scale up and down with a sine wave for a punch effect
        boxContainerRef.current.scale.setScalar(punchScale);
      } else {
        const isHovered = hoveredRef.current && isClickable;
        const hoverScale = (isHovered ? 1.01 : 1.0) * baseScale;
        // Scale up slightly when hovered, but only if clickable
        boxContainerRef.current.scale.lerp(
          new THREE.Vector3(hoverScale, hoverScale, hoverScale),
          0.1,
        );
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
        scrollData.el.scrollTop =
          startScroll + (targetScroll - startScroll) * easeInOutCubic(progress);

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
        // position={[0, 0, 2.7]}
        // rotation={[Math.PI / 2, 0, 0]}
        >
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
                    title: "Gelam Crafted Textures",
                    desc: "High-fidelity leather lining, engraved wood plaques, and brass fixtures rendered in real-time.",
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
                    <h3 className="text-xl font-semibold mb-2 text-white">
                      {card.title}
                    </h3>
                    <p className="text-slate-400 text-sm leading-relaxed">
                      {card.desc}
                    </p>
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
                  <div className="text-slate-400 text-sm mt-1">
                    Lerped Frame Rates
                  </div>
                </div>
                <div>
                  <div className="text-4xl font-bold text-emerald-400">0ms</div>
                  <div className="text-slate-400 text-sm mt-1">
                    Scroll Jitter Overshoot
                  </div>
                </div>
                <div>
                  <div className="text-4xl font-bold text-purple-400">100%</div>
                  <div className="text-slate-400 text-sm mt-1">
                    TypeScript Type Safety
                  </div>
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
        onError={(error) =>
          setErrorMessage(error.message || "Failed to load 3D assets")
        }
      >
        <Canvas
          key={retryKey}
          camera={{ position: [0, 0, 5], fov: 50 }}
          className="size-full"
        >
          <color attach="background" args={["#070709"]} />
          <ambientLight intensity={1.5} />
          <directionalLight
            position={[10, 10, 5]}
            intensity={1.5}
            color="#ffffff"
          />
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
