"use client";

import React, { useEffect, useMemo, useRef, useState, Suspense } from "react";
import { Canvas, useFrame, useThree, useLoader } from "@react-three/fiber";
import { Line, Sphere, useGLTF, OrbitControls } from "@react-three/drei";
import * as THREE from "three";

const ENERGY_TEARDROP_URL = "/ind.png";
const WAND_MODEL_URL = "/the_elder_wand.glb";

const RADIUS = 2.2;
const CENTER_Y = 0.35;
const GAP_FROM_TOP = 0.6;
const ARROW_BOTTOM_Y = -2.4;
const CORNER_RADIUS = 0.55;

function generatePathPoints(samplesCount: number) {
  const r = Math.min(CORNER_RADIUS, RADIUS * 0.45);
  const yf = CENTER_Y + Math.sqrt(RADIUS * (RADIUS - 2 * r));
  const filletCenterX = -r;
  const filletCenterY = yf;
  const tangentAngle = Math.atan2(yf - CENTER_Y, -r);

  const gapAngle = GAP_FROM_TOP / RADIUS;
  const startAngle = Math.PI / 2 - gapAngle;
  const mainSweepAngle = tangentAngle - Math.PI * 2 - startAngle;
  const arcLength = RADIUS * Math.abs(mainSweepAngle);
  const filletLength = r * tangentAngle;
  const lineLength = Math.max(0, filletCenterY - ARROW_BOTTOM_Y);

  const totalLength = arcLength + filletLength + lineLength;
  const arcSamples = Math.round(samplesCount * (arcLength / totalLength));
  const filletSamples = Math.max(10, Math.round(samplesCount * (filletLength / totalLength)));
  const lineSamples = Math.max(1, samplesCount - arcSamples - filletSamples);

  const points: THREE.Vector3[] = [];

  for (let i = 0; i <= arcSamples; i++) {
    const fraction = i / arcSamples;
    const angle = startAngle + fraction * mainSweepAngle;
    points.push(
      new THREE.Vector3(
        RADIUS * Math.cos(angle),
        CENTER_Y + RADIUS * Math.sin(angle),
        0
      )
    );
  }

  for (let i = 1; i <= filletSamples; i++) {
    const fraction = i / filletSamples;
    const phi = (1 - fraction) * tangentAngle;
    points.push(
      new THREE.Vector3(
        filletCenterX + r * Math.cos(phi),
        filletCenterY + r * Math.sin(phi),
        0
      )
    );
  }

  for (let i = 1; i <= lineSamples; i++) {
    const fraction = i / lineSamples;
    const y = THREE.MathUtils.lerp(filletCenterY, ARROW_BOTTOM_Y, fraction);
    points.push(new THREE.Vector3(0, y, 0));
  }

  return points;
}

const vec = new THREE.Vector3();

function MouseCameraMovement() {
  return useFrame(({ camera, pointer }) => {
    vec.set(-pointer.x, 1 - pointer.y, camera.position.z);
    camera.position.lerp(vec, 0.025);
    camera.lookAt(0, 0, 0);
  });
}

// Wand Component
interface WandProps {
  modelUrl: string;
  basePosition?: [number, number, number];
  indicatorPosRef: React.MutableRefObject<THREE.Vector3>;
  tipAxis?: [number, number, number];      // Local axis along which the wand points (default +Y)
  pivotOffset?: [number, number, number];  // Shift mesh so rotation pivots on the grip
  scale?: number;
}

function Wand({
  modelUrl,
  basePosition = [1.8, -2.4, 0.8],
  indicatorPosRef,
  tipAxis = [0, 1, 0],
  pivotOffset = [0, -0.6, 0],
  scale = 0.6,
}: WandProps) {
  const { scene } = useGLTF(modelUrl);
  const clonedScene = useMemo(() => scene.clone(true), [scene]);
  const wandPivotRef = useRef<THREE.Group>(null);

  const localTip = useMemo(() => new THREE.Vector3(...tipAxis).normalize(), [tipAxis]);
  const targetDir = useMemo(() => new THREE.Vector3(), []);
  const targetQuat = useMemo(() => new THREE.Quaternion(), []);
  const worldPos = useMemo(() => new THREE.Vector3(), []);

  useFrame((_, delta) => {
    if (!wandPivotRef.current) return;

    wandPivotRef.current.getWorldPosition(worldPos);
    // Aim vector from wand base to active indicator position
    targetDir.subVectors(indicatorPosRef.current, worldPos).normalize();

    // Compute rotation aligning local tip vector to aim vector
    targetQuat.setFromUnitVectors(localTip, targetDir);

    // Smooth rotation interpolation
    wandPivotRef.current.quaternion.slerp(targetQuat, 1 - Math.exp(-25 * delta));
  });

  return (
    <group ref={wandPivotRef} position={basePosition}>
      {/* Pivot adjustment container */}
      <group position={pivotOffset} scale={scale}>
        <primitive object={clonedScene} />
      </group>
    </group>
  );
}

useGLTF.preload(WAND_MODEL_URL);

type CursorState = "default" | "grab" | "grabbing";

interface SliderItemProps {
  setCanvasCursor: (cursor: CursorState) => void;
  imageUrl: string;
  points: THREE.Vector3[];
  colors: THREE.Color[];
  onProgress: (progress: number) => void;
  onComplete: () => void;
  isGreenLight: boolean;
  indicatorPosRef: React.MutableRefObject<THREE.Vector3>;
}

const SliderItem: React.FC<SliderItemProps> = ({
  setCanvasCursor,
  imageUrl,
  points,
  colors,
  onProgress,
  onComplete,
  isGreenLight,
  indicatorPosRef,
}) => {
  const energyTexture = useLoader(THREE.TextureLoader, imageUrl);

  const { leftWavePoints, rightWavePoints, waveColors } = useMemo(() => {
    const left: THREE.Vector3[] = [];
    const right: THREE.Vector3[] = [];
    const n = points.length;
    const tangent = new THREE.Vector3();
    const normal = new THREE.Vector3();

    for (let i = 0; i < n; i++) {
      const prev = points[Math.max(0, i - 1)];
      const next = points[Math.min(n - 1, i + 1)];
      tangent.subVectors(next, prev).normalize();
      normal.set(-tangent.y, tangent.x, 0);

      const envelope = Math.sin((i / (n - 1)) * Math.PI);
      const waveLeft = 0.02 + 0.1 * Math.sin(i * 0.26);
      const waveRight = 0.02 + 0.1 * Math.cos(i * 0.16 + 1.2);
      const zWave = 0.08 * Math.sin(i * 0.35);

      left.push(
        points[i]
          .clone()
          .addScaledVector(normal, waveLeft * envelope)
          .add(new THREE.Vector3(0, 0, zWave * envelope))
      );

      right.push(
        points[i]
          .clone()
          .addScaledVector(normal, -waveRight * envelope)
          .add(new THREE.Vector3(0, 0, -zWave * envelope))
      );
    }

    const waveCols = colors.map((col) =>
      col.clone().lerp(new THREE.Color("#ffffff"), 0.2)
    );

    return {
      leftWavePoints: left,
      rightWavePoints: right,
      waveColors: waveCols,
    };
  }, [points, colors]);

  const targetT = useRef(0);
  const currentT = useRef(0);
  const lastProgressRef = useRef(0);
  const opacityRef = useRef(1);

  const rootGroupRef = useRef<THREE.Group>(null);
  const leftLineRef = useRef<any>(null);
  const rightLineRef = useRef<any>(null);
  const dotMatRef = useRef<THREE.MeshBasicMaterial>(null);
  const teardropMatRef = useRef<THREE.MeshStandardMaterial>(null);
  const localLightRef = useRef<THREE.PointLight>(null);
  const ballGroupRef = useRef<THREE.Group>(null);

  const tempPos = useMemo(() => new THREE.Vector3(), []);
  const tempPrevPos = useMemo(() => new THREE.Vector3(), []);
  const tempNextPos = useMemo(() => new THREE.Vector3(), []);
  const tempTangent = useMemo(() => new THREE.Vector3(), []);

  const [isDragging, setIsDragging] = useState(false);

  const { camera, gl, raycaster } = useThree();
  const dragPlane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 0, 1), 0), []);
  const hitPoint = useMemo(() => new THREE.Vector3(), []);
  const ndcPointer = useMemo(() => new THREE.Vector2(), []);

  const evaluatePath = (t: number, out: THREE.Vector3) => {
    const clampedT = THREE.MathUtils.clamp(t, 0, 1);
    const floatIdx = clampedT * (points.length - 1);
    const baseIdx = Math.floor(floatIdx);
    const alpha = floatIdx - baseIdx;

    if (baseIdx >= points.length - 1) {
      out.copy(points[points.length - 1]);
    } else {
      out.lerpVectors(points[baseIdx], points[baseIdx + 1], alpha);
    }
    return out;
  };

  useEffect(() => {
    if (isGreenLight) {
      setIsDragging(false);
      setCanvasCursor("default");
    }
  }, [isGreenLight, setCanvasCursor]);

  useEffect(() => {
    if (!isDragging || isGreenLight) return;

    const handlePointerMove = (e: PointerEvent) => {
      const rect = gl.domElement.getBoundingClientRect();
      ndcPointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      ndcPointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(ndcPointer, camera);
      const hit = raycaster.ray.intersectPlane(dragPlane, hitPoint);

      if (hit) {
        const total = points.length - 1;
        const currentIdx = Math.round(targetT.current * total);
        const searchWindow = 50;
        const minIdx = Math.max(0, currentIdx - searchWindow);
        const maxIdx = Math.min(total, currentIdx + searchWindow);

        let bestIdx = currentIdx;
        let minDistanceSq = Infinity;

        for (let i = minIdx; i <= maxIdx; i++) {
          const dSq = hitPoint.distanceToSquared(points[i]);
          if (dSq < minDistanceSq) {
            minDistanceSq = dSq;
            bestIdx = i;
          }
        }

        targetT.current = bestIdx / total;
      }
    };

    const handlePointerUp = () => {
      setIsDragging(false);
      setCanvasCursor(gl.domElement.matches(":hover") ? "grab" : "default");
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: false });
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointercancel", handlePointerUp);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerUp);
    };
  }, [isDragging, isGreenLight, points, gl, camera, raycaster, dragPlane, hitPoint, ndcPointer, setCanvasCursor]);

  useFrame((_, delta) => {
    if (!ballGroupRef.current) return;

    const targetOpacity = isGreenLight ? 0 : 1;
    opacityRef.current = THREE.MathUtils.damp(
      opacityRef.current,
      targetOpacity,
      7,
      delta
    );

    const currentOpacity = opacityRef.current;

    if (rootGroupRef.current) {
      rootGroupRef.current.visible = currentOpacity > 0.005;
    }
    if (leftLineRef.current?.material) {
      leftLineRef.current.material.opacity = currentOpacity;
    }
    if (rightLineRef.current?.material) {
      rightLineRef.current.material.opacity = currentOpacity;
    }
    if (dotMatRef.current) {
      dotMatRef.current.opacity = currentOpacity;
    }
    if (teardropMatRef.current) {
      teardropMatRef.current.opacity = currentOpacity;
    }
    if (localLightRef.current) {
      localLightRef.current.intensity = (isDragging ? 2.5 : 1.5) * currentOpacity;
    }

    if (isGreenLight) {
      if (currentOpacity < 0.08) {
        targetT.current = 0;
        currentT.current = 0;
      }
    } else {
      currentT.current = THREE.MathUtils.damp(
        currentT.current,
        targetT.current,
        16,
        delta
      );

      const p = Math.min(100, Math.max(0, Math.round(currentT.current * 100)));
      if (p !== lastProgressRef.current) {
        lastProgressRef.current = p;
        onProgress(p);
      }

      if (currentT.current >= 0.975) {
        onComplete();
      }
    }

    evaluatePath(currentT.current, tempPos);
    ballGroupRef.current.position.copy(tempPos);

    // Broadcast current position to wand
    indicatorPosRef.current.copy(tempPos);

    const eps = 0.005;
    evaluatePath(Math.min(1, currentT.current + eps), tempNextPos);
    evaluatePath(Math.max(0, currentT.current - eps), tempPrevPos);
    tempTangent.subVectors(tempNextPos, tempPrevPos).normalize();

    const tangentAngle = Math.atan2(tempTangent.y, tempTangent.x);
    ballGroupRef.current.rotation.z = tangentAngle - Math.PI / 2;
  });

  const startDotPos = points[0];

  return (
    <group ref={rootGroupRef}>
      {/* Core Path Line */}
      {/* <Line
        points={points}
        vertexColors={colors}
        lineWidth={4.5}
      /> */}

      {/* Surrounding Wavy Lines */}
      <Line
        ref={leftLineRef}
        points={leftWavePoints}
        vertexColors={waveColors}
        lineWidth={1.5}
        transparent
      />
      <Line
        ref={rightLineRef}
        points={rightWavePoints}
        vertexColors={waveColors}
        lineWidth={1.5}
        transparent
      />

      {/* Start Dot */}
      {/* <Sphere args={[0.08, 16, 16]} position={startDotPos}>
         <meshBasicMaterial ref={dotMatRef} color="#38bdf8" transparent />
       </Sphere> */}

      {/* Glowing Energy Teardrop Slider Item */}
      <group ref={ballGroupRef} position={startDotPos}>
        <pointLight
          ref={localLightRef}
          color="#38bdf8"
          intensity={1.5}
          distance={3}
        />

        <mesh position={[0, 0, 0]}>
          <planeGeometry args={[0.7, 0.7]} />
          <meshStandardMaterial
            ref={teardropMatRef}
            map={energyTexture}
            emissiveMap={energyTexture}
            emissive="#0284c7"
            emissiveIntensity={isDragging ? 2.5 : 1.6}
            transparent
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            roughness={0.1}
            metalness={0.9}
          />
        </mesh>

        <Sphere
          args={[0.4, 16, 16]}
          onPointerOver={(e) => {
            if (isGreenLight || opacityRef.current < 0.5) return;
            e.stopPropagation();
            setCanvasCursor(isDragging ? "grabbing" : "grab");
          }}
          onPointerOut={(e) => {
            e.stopPropagation();
            if (!isDragging) setCanvasCursor("default");
          }}
          onPointerDown={(e) => {
            if (isGreenLight || opacityRef.current < 0.5) return;
            e.stopPropagation();
            setCanvasCursor("grabbing");
            setIsDragging(true);
          }}
        >
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </Sphere>
      </group>
    </group>
  );
};

export const SmoothGlyphicSlider: React.FC<{
  setCanvasCursor: (cursor: CursorState) => void;
  imageUrl: string;
  onProgress: (progress: number) => void;
  onComplete: () => void;
  isGreenLight: boolean;
  indicatorPosRef: React.MutableRefObject<THREE.Vector3>;
}> = ({ setCanvasCursor, imageUrl, onProgress, onComplete, isGreenLight, indicatorPosRef }) => {
  const samplesCount = 400;
  const points = useMemo(() => generatePathPoints(samplesCount), []);

  const colors = useMemo(() => {
    const startCol = new THREE.Color("#38bdf8");
    const midCol = new THREE.Color("#2563eb");
    const endCol = new THREE.Color("#f97316");
    const midPos = 0.6;

    return points.map((_, i) => {
      const t = i / (points.length - 1);
      if (t < midPos) {
        return startCol.clone().lerp(midCol, t / midPos);
      }
      return midCol.clone().lerp(endCol, (t - midPos) / (1 - midPos));
    });
  }, [points]);

  return (
    <Suspense fallback={null}>
      <SliderItem
        setCanvasCursor={setCanvasCursor}
        imageUrl={imageUrl}
        points={points}
        colors={colors}
        onProgress={onProgress}
        onComplete={onComplete}
        isGreenLight={isGreenLight}
        indicatorPosRef={indicatorPosRef}
      />
    </Suspense>
  );
};

export default function App() {
  const [cursor, setCursor] = useState<CursorState>("default");
  const [progress, setProgress] = useState(0);
  const [isGreenLight, setIsGreenLight] = useState(false);

  // High-frequency position reference shared between slider & wand
  const indicatorPosRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 0, 0));

  const handleComplete = () => {
    if (isGreenLight) return;
    setIsGreenLight(true);

    setTimeout(() => {
      setIsGreenLight(false);
      setProgress(0);
    }, 3000);
  };

  return (
    <div className="relative w-screen h-screen bg-gray-950 touch-none select-none overflow-hidden">
      <Canvas camera={{ position: [0, 0, 7.5], fov: 48 }} style={{ cursor }}>
        {/* Lights adapt to celebratory green burst */}
        <ambientLight
          intensity={isGreenLight ? 20 : 20}
          color={isGreenLight ? "#4ade80" : "#ffffff"}
        />

        <MouseCameraMovement />

        <SmoothGlyphicSlider
          setCanvasCursor={setCursor}
          imageUrl={ENERGY_TEARDROP_URL}
          onProgress={setProgress}
          onComplete={handleComplete}
          isGreenLight={isGreenLight}
          indicatorPosRef={indicatorPosRef}
        />
        {/* <OrbitControls /> */}

        {/* Wand placed at anchored base position */}
        {/* <Sphere
          args={[0.2, 16, 16]}
          position={[1.4, 0.4, 5]}
        >
          <meshBasicMaterial />
        </Sphere> */}
        <Suspense fallback={null}>
          <Wand
            modelUrl={WAND_MODEL_URL}
            basePosition={[1.4, -0.2, 5]}
            indicatorPosRef={indicatorPosRef}
            tipAxis={[1, 0, 0]}
            pivotOffset={[0.5, 0, 0]}
            scale={10}
          />
        </Suspense>
      </Canvas>

      <div
        className={`pointer-events-none fixed inset-0 animate-pulse transition-opacity duration-700 z-10
          ${isGreenLight
            ? "opacity-100 shadow-[inset_0_0_140px_rgba(34,197,94,0.4)]"
            : "opacity-0"
          }
        `}
      />
    </div>
  );
}