"use client";

import React, { useState, useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useThree, ThreeEvent } from '@react-three/fiber';
import {
    OrbitControls,
    ContactShadows,
    Float,
    Text,
    useCursor,
} from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import * as THREE from 'three';
import { RotateCcw, Magnet, Sparkles, Move3d } from 'lucide-react';

// --- CONFIGURATION CONSTANTS ---
const BALL_RADIUS = 0.55;
const REST_Y = 0.58;
const DRAG_Y = 1.25;
const SNAP_RADIUS = 1.4;

const SLOT_POSITIONS: [number, number, number][] = [
    [-3.3, 0, 0],
    [-1.1, 0, 0],
    [1.1, 0, 0],
    [3.3, 0, 0],
];

interface BallDefinition {
    id: number;
    name: string;
    color: string;
    emissive: string;
    roughness: number;
    metalness: number;
}

const BALLS_CONFIG: BallDefinition[] = [
    {
        id: 0,
        name: 'Ruby',
        color: '#ff2d55',
        emissive: '#500515',
        roughness: 0.15,
        metalness: 0.2,
    },
    {
        id: 1,
        name: 'Emerald',
        color: '#10b981',
        emissive: '#023824',
        roughness: 0.15,
        metalness: 0.2,
    },
    {
        id: 2,
        name: 'Amber',
        color: '#f59e0b',
        emissive: '#452200',
        roughness: 0.15,
        metalness: 0.2,
    },
    {
        id: 3,
        name: 'Sapphire',
        color: '#3b82f6',
        emissive: '#081f5c',
        roughness: 0.15,
        metalness: 0.2,
    },
];

// --- PLACEHOLDER COMPONENT ---
interface PlaceholderProps {
    index: number;
    position: [number, number, number];
    isMagnetized: boolean;
    activeColor?: string;
}

const Placeholder: React.FC<PlaceholderProps> = ({
    index,
    position,
    isMagnetized,
    activeColor = '#ffffff',
}) => {
    const ringRef = useRef<THREE.Mesh>(null);
    const glowRef = useRef<THREE.PointLight>(null);

    useFrame((_, delta) => {
        if (ringRef.current) {
            const targetScale = isMagnetized ? 1.15 : 1.0;
            ringRef.current.scale.lerp(
                new THREE.Vector3(targetScale, 1, targetScale),
                1 - Math.exp(-14 * delta)
            );
        }
        if (glowRef.current) {
            const targetIntensity = isMagnetized ? 3.5 : 0.4;
            glowRef.current.intensity = THREE.MathUtils.damp(
                glowRef.current.intensity,
                targetIntensity,
                15,
                delta
            );
        }
    });

    return (
        <group position={position}>
            {/* Outer Dock Ring */}
            <mesh receiveShadow position={[0, 0.04, 0]}>
                <cylinderGeometry args={[0.85, 0.95, 0.08, 36]} />
                <meshStandardMaterial color="#1a1c23" metalness={0.8} roughness={0.3} />
            </mesh>

            {/* Recessed Socket Well */}
            <mesh receiveShadow position={[0, 0.07, 0]}>
                <cylinderGeometry args={[0.62, 0.62, 0.04, 32]} />
                <meshStandardMaterial color="#0b0d13" metalness={0.9} roughness={0.7} />
            </mesh>

            {/* Magnetic Energy Ring */}
            <mesh
                ref={ringRef}
                rotation={[-Math.PI / 2, 0, 0]}
                position={[0, 0.09, 0]}
            >
                <ringGeometry args={[0.56, 0.65, 36]} />
                <meshBasicMaterial
                    color={isMagnetized ? activeColor : '#475569'}
                    toneMapped={false}
                />
            </mesh>

            {/* Slot Label */}
            <Text
                position={[0, 0.091, 0.72]}
                rotation={[-Math.PI / 2, 0, 0]}
                fontSize={0.16}
                color={isMagnetized ? '#ffffff' : '#64748b'}
                anchorX="center"
                anchorY="middle"
            >
                {`SLOT 0${index + 1}`}
            </Text>

            {/* Localized Dock Light */}
            <pointLight
                ref={glowRef}
                position={[0, 0.3, 0]}
                color={isMagnetized ? activeColor : '#38bdf8'}
                distance={2.2}
            />
        </group>
    );
};

// --- INTERACTIVE BALL COMPONENT ---
interface BallProps {
    config: BallDefinition;
    slotIndex: number;
    isBeingDragged: boolean;
    dragPos: THREE.Vector3;
    onPointerDown: (
        ballId: number,
        ballPos: THREE.Vector3,
        e: ThreeEvent<PointerEvent>
    ) => void;
}

const Ball: React.FC<BallProps> = ({
    config,
    slotIndex,
    isBeingDragged,
    dragPos,
    onPointerDown,
}) => {
    const meshRef = useRef<THREE.Group>(null);
    const currentPos = useRef(
        new THREE.Vector3(
            SLOT_POSITIONS[slotIndex][0],
            REST_Y,
            SLOT_POSITIONS[slotIndex][2]
        )
    );

    const initialDistance = useRef(0);
    const prevSlotIndex = useRef(slotIndex);
    const [hovered, setHovered] = useState(false);

    useCursor(hovered, 'grab', 'auto');

    // Track slot displacement for parabolic swap arc
    useEffect(() => {
        if (prevSlotIndex.current !== slotIndex) {
            const target = SLOT_POSITIONS[slotIndex];
            const dist = Math.hypot(
                target[0] - currentPos.current.x,
                target[2] - currentPos.current.z
            );
            initialDistance.current = dist > 0.1 ? dist : 0;
            prevSlotIndex.current = slotIndex;
        }
    }, [slotIndex]);

    useFrame((_, delta) => {
        if (!meshRef.current) return;

        if (isBeingDragged) {
            // High-speed damped follow with zero initial offset jump
            currentPos.current.x = THREE.MathUtils.damp(
                currentPos.current.x,
                dragPos.x,
                28,
                delta
            );
            currentPos.current.z = THREE.MathUtils.damp(
                currentPos.current.z,
                dragPos.z,
                28,
                delta
            );
            // Smoothly float up to drag height without snapping
            currentPos.current.y = THREE.MathUtils.damp(
                currentPos.current.y,
                DRAG_Y,
                18,
                delta
            );
        } else {
            const targetSlotPos = SLOT_POSITIONS[slotIndex];
            const targetX = targetSlotPos[0];
            const targetZ = targetSlotPos[2];

            const xzDist = Math.hypot(
                targetX - currentPos.current.x,
                targetZ - currentPos.current.z
            );

            // Smooth parabolic hopping arc when traveling between slots
            let targetY = REST_Y;
            if (initialDistance.current > 0.1) {
                const progress = Math.max(
                    0,
                    Math.min(1, 1 - xzDist / initialDistance.current)
                );
                const arcLift = Math.sin(progress * Math.PI) * 0.85;
                targetY = REST_Y + arcLift;
                if (xzDist < 0.05) {
                    initialDistance.current = 0;
                }
            }

            currentPos.current.x = THREE.MathUtils.damp(
                currentPos.current.x,
                targetX,
                15,
                delta
            );
            currentPos.current.z = THREE.MathUtils.damp(
                currentPos.current.z,
                targetZ,
                15,
                delta
            );
            currentPos.current.y = THREE.MathUtils.damp(
                currentPos.current.y,
                targetY,
                16,
                delta
            );
        }

        meshRef.current.position.copy(currentPos.current);
    });

    return (
        <group
            ref={meshRef}
            onPointerDown={(e) => {
                e.stopPropagation();
                if (meshRef.current) {
                    onPointerDown(config.id, meshRef.current.position, e);
                }
            }}
            onPointerOver={(e) => {
                e.stopPropagation();
                setHovered(true);
            }}
            onPointerOut={() => setHovered(false)}
        >
            <mesh castShadow receiveShadow>
                <sphereGeometry args={[BALL_RADIUS, 64, 64]} />
                <meshPhysicalMaterial
                    color={config.color}
                    emissive={config.emissive}
                    emissiveIntensity={hovered || isBeingDragged ? 0.45 : 0.15}
                    roughness={config.roughness}
                    metalness={config.metalness}
                    clearcoat={1.0}
                    clearcoatRoughness={0.08}
                />
            </mesh>

            {/* Internal Core Specular Ring */}
            <mesh scale={0.7}>
                <sphereGeometry args={[BALL_RADIUS, 16, 16]} />
                <meshBasicMaterial
                    color={config.color}
                    wireframe
                    transparent
                    opacity={0.07}
                />
            </mesh>
        </group>
    );
};

// --- SCENE & INTERACTION CONTROLLER ---
interface SceneProps {
    slotsState: number[];
    setSlotsState: React.Dispatch<React.SetStateAction<number[]>>;
    onSwapEvent: (fromBall: string, toBall: string) => void;
    activeBallName: string | null;
    setActiveBallName: (name: string | null) => void;
}

const SceneController: React.FC<SceneProps> = ({
    slotsState,
    setSlotsState,
    onSwapEvent,
    setActiveBallName,
}) => {
    const { camera, gl } = useThree();
    const controlsRef = useRef<OrbitControlsImpl>(null);

    const [draggedBallId, setDraggedBallId] = useState<number | null>(null);
    const [hoveredSlotIndex, setHoveredSlotIndex] = useState<number | null>(null);

    const dragPlane = useMemo(
        () => new THREE.Plane(new THREE.Vector3(0, 1, 0), -DRAG_Y),
        []
    );

    // Synchronous references avoid 1-frame React delay glitches
    const dragTargetRef = useRef(new THREE.Vector3(0, DRAG_Y, 0));
    const dragOffset = useRef(new THREE.Vector3(0, 0, 0));
    const raycaster = useMemo(() => new THREE.Raycaster(), []);
    const planeHit = useMemo(() => new THREE.Vector3(), []);

    // Frame loop tracks mouse raycast against drag plane
    useFrame(({ pointer }) => {
        if (draggedBallId === null) return;

        raycaster.setFromCamera(pointer, camera);
        const hit = raycaster.ray.intersectPlane(dragPlane, planeHit);

        if (hit) {
            // Offset preserves original grab point
            const rawX = hit.x + dragOffset.current.x;
            const rawZ = hit.z + dragOffset.current.z;

            dragTargetRef.current.x = THREE.MathUtils.clamp(rawX, -5.5, 5.5);
            dragTargetRef.current.z = THREE.MathUtils.clamp(rawZ, -4.5, 4.5);
            dragTargetRef.current.y = DRAG_Y;

            // Magnetic proximity calculation
            let closestSlot = -1;
            let minDistance = Infinity;

            SLOT_POSITIONS.forEach((slotPos, idx) => {
                const dist = Math.hypot(
                    slotPos[0] - dragTargetRef.current.x,
                    slotPos[2] - dragTargetRef.current.z
                );
                if (dist < minDistance) {
                    minDistance = dist;
                    closestSlot = idx;
                }
            });

            if (minDistance < SNAP_RADIUS) {
                setHoveredSlotIndex(closestSlot);
            } else {
                setHoveredSlotIndex(null);
            }
        }
    });

    // GLITCH FIX: Immediately initialize drag offset and target on pointerdown
    const handlePointerDown = (
        ballId: number,
        ballPos: THREE.Vector3,
        e: ThreeEvent<PointerEvent>
    ) => {
        // 1. Immediately disable OrbitControls so it doesn't fight the drag
        if (controlsRef.current) {
            controlsRef.current.enabled = false;
        }

        // 2. Capture pointer to prevent losing drag during fast swipes
        if (e.pointerId !== undefined && gl.domElement.setPointerCapture) {
            try {
                gl.domElement.setPointerCapture(e.pointerId);
            } catch {
                // Fallback
            }
        }

        // 3. Raycast to drag plane synchronously at the moment of click
        const initialHit = new THREE.Vector3();
        e.ray.intersectPlane(dragPlane, initialHit);

        // 4. Calculate exact grab offset (XZ only)
        dragOffset.current.set(
            ballPos.x - initialHit.x,
            0,
            ballPos.z - initialHit.z
        );

        // 5. Pre-fill target with ball's current coordinates (eliminates (0,0,0) jump)
        dragTargetRef.current.set(ballPos.x, DRAG_Y, ballPos.z);

        setDraggedBallId(ballId);
        const ballConfig = BALLS_CONFIG.find((b) => b.id === ballId);
        setActiveBallName(ballConfig ? ballConfig.name : null);
    };

    const handlePointerUp = () => {
        if (draggedBallId === null) return;

        // Re-enable camera OrbitControls
        if (controlsRef.current) {
            controlsRef.current.enabled = true;
        }

        if (hoveredSlotIndex !== null) {
            const sourceSlot = slotsState.indexOf(draggedBallId);
            const targetSlot = hoveredSlotIndex;

            if (sourceSlot !== targetSlot) {
                const displacedBallId = slotsState[targetSlot];

                setSlotsState((prev) => {
                    const next = [...prev];
                    next[targetSlot] = draggedBallId;
                    next[sourceSlot] = displacedBallId;
                    return next;
                });

                const draggedBall = BALLS_CONFIG.find((b) => b.id === draggedBallId);
                const displacedBall = BALLS_CONFIG.find((b) => b.id === displacedBallId);
                if (draggedBall && displacedBall) {
                    onSwapEvent(draggedBall.name, displacedBall.name);
                }
            }
        }

        setDraggedBallId(null);
        setHoveredSlotIndex(null);
        setActiveBallName(null);
    };

    useEffect(() => {
        const onWindowPointerUp = () => {
            if (draggedBallId !== null) {
                handlePointerUp();
            }
        };
        window.addEventListener('pointerup', onWindowPointerUp);
        return () => window.removeEventListener('pointerup', onWindowPointerUp);
    }, [draggedBallId, hoveredSlotIndex, slotsState]);

    const activeDraggedColor =
        draggedBallId !== null
            ? BALLS_CONFIG.find((b) => b.id === draggedBallId)?.color
            : undefined;

    return (
        <>
            <OrbitControls
                ref={controlsRef}
                makeDefault
                enablePan={false}
                minPolarAngle={Math.PI / 6}
                maxPolarAngle={Math.PI / 2.25}
                minDistance={5}
                maxDistance={14}
                dampingFactor={0.06}
            />

            <ambientLight intensity={0.6} />
            <directionalLight
                position={[6, 12, 5]}
                intensity={1.8}
                castShadow
                shadow-mapSize={[2048, 2048]}
                shadow-bias={-0.0001}
            />
            <directionalLight
                position={[-6, 4, -4]}
                intensity={0.5}
                color="#818cf8"
            />

            {/* Docks */}
            {SLOT_POSITIONS.map((pos, idx) => (
                <Placeholder
                    key={idx}
                    index={idx}
                    position={pos}
                    isMagnetized={hoveredSlotIndex === idx}
                    activeColor={activeDraggedColor}
                />
            ))}

            {/* Balls */}
            {BALLS_CONFIG.map((config) => {
                const currentSlot = slotsState.indexOf(config.id);
                const isDragging = draggedBallId === config.id;
                return (
                    <Ball
                        key={config.id}
                        config={config}
                        slotIndex={currentSlot}
                        isBeingDragged={isDragging}
                        dragPos={dragTargetRef.current}
                        onPointerDown={handlePointerDown}
                    />
                );
            })}

            <ContactShadows
                position={[0, 0.01, 0]}
                opacity={0.65}
                scale={16}
                blur={1.8}
                far={4}
            />

            {/* Studio Floor */}
            <mesh
                rotation={[-Math.PI / 2, 0, 0]}
                position={[0, -0.01, 0]}
                receiveShadow
            >
                <planeGeometry args={[50, 50]} />
                <meshStandardMaterial color="#0c0e14" roughness={0.8} metalness={0.2} />
            </mesh>

            {/* Studio Atmosphere */}
            <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
                <points>
                    <bufferGeometry>
                        <bufferAttribute
                            attach="attributes-position"
                            count={40}
                            array={
                                new Float32Array(
                                    Array.from({ length: 120 }, () => (Math.random() - 0.5) * 12)
                                )
                            }
                            itemSize={3}
                        />
                    </bufferGeometry>
                    <pointsMaterial
                        size={0.03}
                        color="#60a5fa"
                        transparent
                        opacity={0.35}
                    />
                </points>
            </Float>
        </>
    );
};

// --- ROOT APP ---
export default function App() {
    const [slotsState, setSlotsState] = useState<number[]>([0, 1, 2, 3]);
    const [activeBallName, setActiveBallName] = useState<string | null>(null);
    const [lastSwapInfo, setLastSwapInfo] = useState<string | null>(null);

    const handleReset = () => {
        setSlotsState([0, 1, 2, 3]);
        setLastSwapInfo('Reset to default order');
    };

    const handleSwapNotification = (from: string, to: string) => {
        setLastSwapInfo(`Swapped ${from} and ${to}!`);
    };

    return (
        <div
            style={{
                width: '100vw',
                height: '100vh',
                position: 'relative',
                overflow: 'hidden',
                backgroundColor: '#090a0f',
                fontFamily: 'system-ui, -apple-system, sans-serif',
            }}
        >
            <Canvas
                shadows
                camera={{ position: [0, 4.8, 7.5], fov: 45 }}
                style={{ width: '100%', height: '100%' }}
            >
                <SceneController
                    slotsState={slotsState}
                    setSlotsState={setSlotsState}
                    onSwapEvent={handleSwapNotification}
                    activeBallName={activeBallName}
                    setActiveBallName={setActiveBallName}
                />
            </Canvas>

            {/* Floating Glass Header */}
            <header
                style={{
                    position: 'absolute',
                    top: 24,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 16,
                    padding: '12px 24px',
                    borderRadius: 9999,
                    backgroundColor: 'rgba(15, 23, 42, 0.75)',
                    backdropFilter: 'blur(16px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
                    color: '#ffffff',
                    zIndex: 10,
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Magnet size={20} color="#38bdf8" />
                    <span style={{ fontWeight: 700, letterSpacing: '0.04em', fontSize: 15 }}>
                        MAGNETIC SWAPPER
                    </span>
                </div>

                <div
                    style={{
                        width: 1,
                        height: 20,
                        backgroundColor: 'rgba(255,255,255,0.15)',
                    }}
                />

                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        fontSize: 13,
                        color: '#94a3b8',
                    }}
                >
                    {activeBallName ? (
                        <span style={{ color: '#38bdf8', fontWeight: 600 }}>
                            Dragging {activeBallName}...
                        </span>
                    ) : lastSwapInfo ? (
                        <span
                            style={{
                                color: '#34d399',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 4,
                            }}
                        >
                            <Sparkles size={14} /> {lastSwapInfo}
                        </span>
                    ) : (
                        <span>Grab a sphere to begin</span>
                    )}
                </div>

                <button
                    onClick={handleReset}
                    title="Reset Arrangement"
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        marginLeft: 8,
                        padding: '6px 14px',
                        borderRadius: 9999,
                        backgroundColor: 'rgba(255, 255, 255, 0.08)',
                        border: '1px solid rgba(255, 255, 255, 0.12)',
                        color: '#e2e8f0',
                        cursor: 'pointer',
                        fontSize: 13,
                        fontWeight: 500,
                        transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={(e) =>
                        (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.18)')
                    }
                    onMouseLeave={(e) =>
                        (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)')
                    }
                >
                    <RotateCcw size={14} /> Reset
                </button>
            </header>

            {/* Footer Info */}
            <footer
                style={{
                    position: 'absolute',
                    bottom: 24,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    display: 'flex',
                    gap: 20,
                    color: '#64748b',
                    fontSize: 13,
                    pointerEvents: 'none',
                    userSelect: 'none',
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Move3d size={16} /> Drag sphere near dock to snap
                </div>
                <span>•</span>
                <div>Drop on an occupied dock to trigger auto-swap</div>
                <span>•</span>
                <div>Left-click canvas to rotate camera</div>
            </footer>
        </div>
    );
}