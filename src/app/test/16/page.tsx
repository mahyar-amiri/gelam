'use client';

import React, { useState, useRef, useMemo, useEffect, useCallback } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import { Scroll, FileText, RotateCcw } from 'lucide-react';

// ============================================================================
// Paper Settings & Image Configurations
// ============================================================================
const PAPER_WIDTH = 2.1;          // A4 aspect width (210mm)
const PAPER_HEIGHT = 2.97;        // A4 aspect height (297mm)
const PAPER_THICKNESS = 0.01;     // Thickness in 3D units (clearly visible edge rims)
const FRONT_IMAGE_URL = '/letter-front.jpg';   // Front face image
const BACK_IMAGE_URL = '/letter-back.jpg';    // Back face image

// Geometry subdivisions for smooth curving
const SEGMENTS_X = 48;
const SEGMENTS_Y = 140;

// ============================================================================
// SSR-Safe Texture Generators
// ============================================================================
function createPlaceholderTexture(): THREE.DataTexture {
    // 1x1 warm parchment pixel to prevent Next.js SSR crashes
    const data = new Uint8Array([245, 238, 222, 255]);
    const texture = new THREE.DataTexture(data, 1, 1, THREE.RGBAFormat);
    texture.needsUpdate = true;
    return texture;
}

function createClientFallbackTexture(label: string): THREE.CanvasTexture | null {
    if (typeof window === 'undefined') return null;

    const canvas = document.createElement('canvas');
    canvas.width = 1240;
    canvas.height = 1754; // A4 ratio @ 150 DPI
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Parchment paper background
    const bg = ctx.createRadialGradient(620, 877, 80, 620, 877, 950);
    bg.addColorStop(0, '#fbf6ea');
    bg.addColorStop(0.7, '#f3e5c8');
    bg.addColorStop(1, '#ddca9c');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Subtle paper grain noise
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < imgData.data.length; i += 4) {
        const grain = (Math.random() - 0.5) * 12;
        imgData.data[i] = Math.min(255, Math.max(0, imgData.data[i] + grain));
        imgData.data[i + 1] = Math.min(255, Math.max(0, imgData.data[i + 1] + grain));
        imgData.data[i + 2] = Math.min(255, Math.max(0, imgData.data[i + 2] + grain));
    }
    ctx.putImageData(imgData, 0, 0);

    // Ornate double border
    ctx.strokeStyle = '#6e5134';
    ctx.lineWidth = 4;
    ctx.strokeRect(60, 60, canvas.width - 120, canvas.height - 120);
    ctx.lineWidth = 1.5;
    ctx.strokeRect(74, 74, canvas.width - 148, canvas.height - 148);

    // Title
    ctx.fillStyle = '#26190e';
    ctx.font = 'bold 42px "Georgia", serif';
    ctx.textAlign = 'center';
    ctx.fillText('A4 CORRESPONDENCE', 620, 200);

    ctx.font = 'italic 20px "Georgia", serif';
    ctx.fillStyle = '#614833';
    ctx.fillText(`Mapped Image: ${label}`, 620, 245);

    ctx.strokeStyle = '#8a653d';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(360, 275);
    ctx.lineTo(880, 275);
    ctx.stroke();

    // Letter content
    ctx.textAlign = 'left';
    ctx.font = '27px "Georgia", serif';
    ctx.fillStyle = '#1e160e';

    const lines = [
        'Document Specification:',
        '',
        `• Paper Dimensions: ${PAPER_WIDTH} W × ${PAPER_HEIGHT} H`,
        `• Physical Thickness: ${PAPER_THICKNESS} units (Solid volumetric mesh)`,
        '• Front and reverse surfaces independently rendered',
        '• Smooth Archimedean spiral curling with exact raycasting',
        '',
        'Click directly on this sheet to toggle rolling or unrolling.',
    ];

    let y = 380;
    lines.forEach((line) => {
        ctx.fillText(line, 130, y);
        y += 50;
    });

    // Wax Seal
    const sx = 920;
    const sy = 1430;
    const seal = ctx.createRadialGradient(sx - 12, sy - 12, 10, sx, sy, 80);
    seal.addColorStop(0, '#c72424');
    seal.addColorStop(0.7, '#851212');
    seal.addColorStop(1, '#4d0808');
    ctx.fillStyle = seal;
    ctx.beginPath();
    ctx.arc(sx, sy, 70, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#360505';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.fillStyle = '#fce5cd';
    ctx.font = 'bold 44px serif';
    ctx.textAlign = 'center';
    ctx.fillText('𐤈', sx, sy + 15);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
}

// ============================================================================
// 3D Volumetric Rolling Paper Mesh
// ============================================================================
interface PaperMeshProps {
    rolled: boolean;
    onToggle: () => void;
    manualProgress: number;
    useManual: boolean;
    frontTexture: THREE.Texture;
    backTexture: THREE.Texture;
}

const RollingPaper: React.FC<PaperMeshProps> = ({
    rolled,
    onToggle,
    manualProgress,
    useManual,
    frontTexture,
    backTexture,
}) => {
    const currentProgress = useRef(0);
    const pointerDownPos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

    // Create a 3D Box geometry segmented along the height to deform as a solid thick sheet
    const { geometry, originalPositions } = useMemo(() => {
        const geo = new THREE.BoxGeometry(
            PAPER_WIDTH,
            PAPER_HEIGHT,
            PAPER_THICKNESS,
            SEGMENTS_X,
            SEGMENTS_Y,
            1
        );
        const orig = new Float32Array(geo.attributes.position.array);
        return { geometry: geo, originalPositions: orig };
    }, []);

    // Multi-material setup: 4 side rims, front face (+Z), and back face (-Z)
    const materials = useMemo(() => {
        const edgeMaterial = new THREE.MeshStandardMaterial({
            color: '#eae0cb',
            roughness: 0.9,
            metalness: 0.02,
        });

        const frontMaterial = new THREE.MeshStandardMaterial({
            map: frontTexture,
            roughness: 0.72,
            metalness: 0.02,
        });

        const backMaterial = new THREE.MeshStandardMaterial({
            map: backTexture,
            roughness: 0.72,
            metalness: 0.02,
        });

        // BoxGeometry material indexes: 0:+X, 1:-X, 2:+Y, 3:-Y, 4:+Z, 5:-Z
        return [
            edgeMaterial,  // Right rim
            edgeMaterial,  // Left rim
            edgeMaterial,  // Top rim
            edgeMaterial,  // Bottom rim
            frontMaterial, // Front face (+Z)
            backMaterial,  // Back face (-Z)
        ];
    }, [frontTexture, backTexture]);

    // Analytical Logarithmic Spiral Deformation that curls all 3D vertices with real thickness + organic waviness
    const deformVolumetricPaper = useCallback(
        (progress: number) => {
            const posAttr = geometry.attributes.position;
            const pos = posAttr.array as Float32Array;
            const count = posAttr.count;

            const R0 = 0.17;             // Outer curl radius
            const Rmin = 0.08;           // Core radius
            const kPrime = (R0 - Rmin) / PAPER_HEIGHT;
            const L = progress * PAPER_HEIGHT;
            const yJunction = L - PAPER_HEIGHT * 0.5;

            const yOffset = -progress * (PAPER_HEIGHT * 0.5 - 0.11);
            const zOffset = -progress * 0.08;

            for (let i = 0; i < count; i++) {
                const origX = originalPositions[i * 3 + 0];
                const origY = originalPositions[i * 3 + 1];
                const origZ = originalPositions[i * 3 + 2];

                // Normalized coordinates (-1 to 1)
                const normX = origX / (PAPER_WIDTH * 0.5);
                const normY = origY / (PAPER_HEIGHT * 0.5);

                // Arc length coordinate s: 0 at bottom, PAPER_HEIGHT at top
                const s = origY + PAPER_HEIGHT * 0.5;

                let newY = origY;
                let newZ = origZ;

                if (progress > 0.0001 && s < L) {
                    // Inside the rolled cylinder
                    const deltaS = L - s;
                    const rCurrent = Math.max(0.035, R0 - kPrime * deltaS);
                    const theta = (1 / kPrime) * Math.log(R0 / rCurrent);

                    const cy = yJunction - rCurrent * Math.sin(theta);
                    const cz = R0 - rCurrent * Math.cos(theta);

                    const ny = Math.sin(theta);
                    const nz = Math.cos(theta);

                    newY = cy + origZ * ny;
                    newZ = cz + origZ * nz;
                } else {
                    // Cockling wave: stronger near outer edges, subtle through center
                    const edgeFactor = 0.45 + 0.55 * Math.pow(Math.abs(normX), 1.8);

                    const wave = (
                        Math.sin(origY * 3.4 + origX * 1.5) * 0.03 +
                        Math.sin(origX * 4.6 - origY * 2.0) * 0.018 +
                        Math.cos(origY * 7.2 + origX * 2.8) * 0.008 +
                        // Natural corner dog-ear lift
                        Math.pow(normX * normY, 2) * 0.02
                    ) * edgeFactor;

                    // When progress > 0, blend out the wave near the roll junction.
                    // When fully unrolled (progress <= 0.001), apply 100% across the whole sheet.
                    const transitionBlend = progress > 0.001
                        ? Math.min(1, Math.max(0, s - L) / 0.35)
                        : 1.0;

                    newZ = origZ + wave * transitionBlend;
                }

                pos[i * 3 + 0] = origX;
                pos[i * 3 + 1] = newY + yOffset;
                pos[i * 3 + 2] = newZ + zOffset;
            }

            posAttr.needsUpdate = true;
            geometry.computeVertexNormals();
            geometry.computeBoundingBox();
            geometry.computeBoundingSphere();
        },
        [geometry, originalPositions]
    );

    // Force the initial deformation on mount so waves appear immediately
    useEffect(() => {
        deformVolumetricPaper(0);
    }, [deformVolumetricPaper]);


    // Smooth animation frame loop
    useFrame((_, delta) => {
        const target = useManual ? manualProgress : rolled ? 1.0 : 0.0;
        const diff = target - currentProgress.current;

        if (Math.abs(diff) > 0.0005) {
            currentProgress.current = THREE.MathUtils.damp(
                currentProgress.current,
                target,
                7.5,
                delta
            );
            deformVolumetricPaper(currentProgress.current);
        } else if (currentProgress.current !== target) {
            currentProgress.current = target;
            deformVolumetricPaper(target);
        }
    });

    return (
        <mesh
            geometry={geometry}
            material={materials}
            castShadow
            receiveShadow
            onPointerDown={(e) => {
                pointerDownPos.current = { x: e.clientX, y: e.clientY };
            }}
            onPointerUp={(e) => {
                // Prevent triggering toggle if user was rotating the orbit camera
                const dist = Math.hypot(
                    e.clientX - pointerDownPos.current.x,
                    e.clientY - pointerDownPos.current.y
                );
                if (dist < 6) {
                    e.stopPropagation();
                    onToggle();
                }
            }}
            onPointerOver={(e) => {
                e.stopPropagation();
                document.body.style.cursor = 'pointer';
            }}
            onPointerOut={() => {
                document.body.style.cursor = 'auto';
            }}
        />
    );
};

// ============================================================================
// Main Page Export
// ============================================================================
export default function Page() {
    const [rolled, setRolled] = useState(false);
    const [manualProgress, setManualProgress] = useState(0);
    const [useManual, setUseManual] = useState(false);

    // SSR-safe initial 1x1 textures
    const [frontTexture, setFrontTexture] = useState<THREE.Texture>(() =>
        createPlaceholderTexture()
    );
    const [backTexture, setBackTexture] = useState<THREE.Texture>(() =>
        createPlaceholderTexture()
    );

    // Client-side image loader
    useEffect(() => {
        const loader = new THREE.TextureLoader();

        const loadTex = (url: string, onDone: (t: THREE.Texture) => void) => {
            loader.load(
                url,
                (tex) => {
                    tex.colorSpace = THREE.SRGBColorSpace;
                    tex.wrapS = THREE.ClampToEdgeWrapping;
                    tex.wrapT = THREE.ClampToEdgeWrapping;
                    onDone(tex);
                },
                undefined,
                () => {
                    // If public image is not yet placed, fall back to generated parchment
                    const fallback = createClientFallbackTexture(url);
                    if (fallback) onDone(fallback);
                }
            );
        };

        loadTex(FRONT_IMAGE_URL, setFrontTexture);
        loadTex(BACK_IMAGE_URL, setBackTexture);
    }, []);

    const handleToggle = useCallback(() => {
        setUseManual(false);
        setRolled((prev) => !prev);
    }, []);

    return (
        <div
            style={{
                width: '100vw',
                height: '100vh',
                position: 'relative',
                overflow: 'hidden',
                backgroundColor: '#161412',
                userSelect: 'none',
                fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            }}
        >
            {/* 3D Canvas Viewport */}
            <Canvas
                camera={{ position: [0, 0, 4.3], fov: 45 }}
                shadows
                style={{ width: '100%', height: '100%' }}
            >
                <ambientLight intensity={0.7} />
                <directionalLight
                    position={[4, 7, 5]}
                    intensity={1.35}
                    castShadow
                    shadow-mapSize={[2048, 2048]}
                    shadow-bias={-0.0001}
                />
                <directionalLight position={[-4, 2, -3]} intensity={0.4} color="#f5e1c9" />
                <directionalLight position={[0, -4, 2]} intensity={0.2} color="#ffffff" />

                <RollingPaper
                    rolled={rolled}
                    onToggle={handleToggle}
                    manualProgress={manualProgress}
                    useManual={useManual}
                    frontTexture={frontTexture}
                    backTexture={backTexture}
                />

                <ContactShadows
                    position={[0, -1.82, 0]}
                    opacity={0.6}
                    scale={6.5}
                    blur={2.4}
                    far={3.5}
                />

                <OrbitControls
                    enableDamping
                    dampingFactor={0.05}
                    minDistance={1.8}
                    maxDistance={7.5}
                    maxPolarAngle={Math.PI * 0.85}
                />
            </Canvas>

            {/* Bottom Control Dock */}
            <div
                style={{
                    position: 'absolute',
                    bottom: '2rem',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '90%',
                    maxWidth: '400px',
                    zIndex: 10,
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.75rem',
                        padding: '1rem',
                        borderRadius: '1.25rem',
                        background: 'rgba(28, 25, 23, 0.8)',
                        backdropFilter: 'blur(16px)',
                        border: '1px solid rgba(87, 83, 78, 0.5)',
                        boxShadow: '0 20px 35px rgba(0, 0, 0, 0.6)',
                    }}
                >
                    <div style={{ display: 'flex', gap: '0.6rem' }}>
                        <button
                            onClick={handleToggle}
                            style={{
                                flex: 1,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem',
                                padding: '0.75rem 1rem',
                                borderRadius: '0.85rem',
                                background: 'linear-gradient(135deg, #d97706, #b45309)',
                                color: '#1c1917',
                                fontWeight: 600,
                                fontSize: '0.875rem',
                                border: 'none',
                                cursor: 'pointer',
                                boxShadow: '0 4px 14px rgba(180, 83, 9, 0.35)',
                            }}
                        >
                            {rolled ? (
                                <>
                                    <FileText size={18} />
                                    <span>Unroll Paper</span>
                                </>
                            ) : (
                                <>
                                    <Scroll size={18} />
                                    <span>Roll Up Paper</span>
                                </>
                            )}
                        </button>

                        <button
                            onClick={() => {
                                setRolled(false);
                                setUseManual(false);
                                setManualProgress(0);
                            }}
                            title="Reset Flat"
                            style={{
                                padding: '0.75rem',
                                borderRadius: '0.85rem',
                                background: 'rgba(41, 37, 36, 0.8)',
                                border: '1px solid rgba(87, 83, 78, 0.5)',
                                color: '#d6d3d1',
                                cursor: 'pointer',
                            }}
                        >
                            <RotateCcw size={18} />
                        </button>
                    </div>

                    {/* Progress Slider */}
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            paddingTop: '0.5rem',
                            borderTop: '1px solid rgba(68, 64, 60, 0.5)',
                        }}
                    >
                        <span
                            style={{
                                fontSize: '0.75rem',
                                fontFamily: 'monospace',
                                color: '#a8a29e',
                                width: '3rem',
                            }}
                        >
                            {useManual
                                ? `${Math.round(manualProgress * 100)}%`
                                : rolled
                                    ? '100%'
                                    : '0%'}
                        </span>
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.005"
                            value={useManual ? manualProgress : rolled ? 1 : 0}
                            onChange={(e) => {
                                setUseManual(true);
                                const val = parseFloat(e.target.value);
                                setManualProgress(val);
                                setRolled(val > 0.5);
                            }}
                            style={{ flex: 1, cursor: 'pointer', accentColor: '#f59e0b' }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}