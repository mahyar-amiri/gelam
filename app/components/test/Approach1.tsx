// Approach 1: 3D Transmission Plane. This approach uses a 3D plane with MeshTransmissionMaterial placed between the wand and the box in the 3D scene. This creates a realistic frosted glass effect that blurs the objects behind it (the box and the scene background).
"use client";

import { Suspense, useRef, useState, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  useGLTF,
  ScrollControls,
  Scroll,
  useScroll,
  MeshTransmissionMaterial,
  Environment,
  PresentationControls
} from "@react-three/drei";
import * as THREE from "three";

function Wand({ scrollRef }: { scrollRef: { current: any } }) {
  const { scene } = useGLTF("/the_elder_wand.glb");
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    const r1 = scrollRef.current.range(0, 1/4);
    const r2 = scrollRef.current.range(1/4, 1/4);
    const r3 = scrollRef.current.range(2/4, 1/4);
    const r4 = scrollRef.current.range(3/4, 1/4);

    if (groupRef.current) {
      // Step 0: Above box (initial)
      // Step 1: Comes closer (r1)
      // Step 2: Moves right (r2)
      // Step 3: Moves center (r3)
      // Step 4: Goes into box (r4)

      // Initial position
      let posX = 0;
      let posY = 2;
      let posZ = 0;
      let rotX = 0;
      const rotY = 0;
      let rotZ = Math.PI / 4;

      // Section 1: Come closer
      posZ += r1 * 4;

      // Section 2: Move right
      posX += r2 * 3;
      posY += r2 * -0.5; // lower slightly
      rotZ -= r2 * Math.PI / 8; // Adjust angle slightly

      // Section 3: Move center
      posX -= r3 * 3;
      rotX += r3 * Math.PI / 2; // flatten for presentation

      // Section 4: Go into box
      posZ -= r4 * 4;
      posY -= r4 * 1.5;
      rotX -= r4 * Math.PI / 2;

      groupRef.current.position.set(posX, posY, posZ);

      // We only apply rotation if we are not purely in section 3 (where PresentationControls takes over)
      // Since PresentationControls wraps this group, it handles local rotation during that phase.
      // But we can lerp the base rotation.
      groupRef.current.rotation.set(rotX, rotY, rotZ);
    }
  });

  return (
    <group ref={groupRef}>
       {/* Use presentation controls but only enable them when in section 3 */}
      <PresentationControls
        global={false}
        cursor={true}
        snap={true}
        speed={1}
        zoom={1}
        rotation={[0, 0, 0]}
        polar={[-Math.PI / 4, Math.PI / 4]}
        azimuth={[-Math.PI / 4, Math.PI / 4]}
      >
        <primitive object={scene.clone()} scale={1.5} />
      </PresentationControls>
    </group>
  );
}

function Box() {
  const { scene } = useGLTF("/wooden_box.glb");
  return (
    <group position={[0, -1, -2]} scale={1.5}>
      <primitive object={scene.clone()} />
    </group>
  );
}

function BlurPlane({ scrollRef }: { scrollRef: { current: any } }) {
  const materialRef = useRef<any>(null);
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    const r1 = scrollRef.current.range(0, 1/4); // Blur in
    const r4 = scrollRef.current.range(3/4, 1/4); // Blur out

    // Total blur intensity
    const blurAmount = r1 - r4;

    if (materialRef.current) {
      materialRef.current.transmission = blurAmount * 0.9;
      materialRef.current.roughness = blurAmount * 0.6;
    }

    // Hide entirely if no blur needed to save performance
    if (meshRef.current) {
      meshRef.current.visible = blurAmount > 0.01;
    }
  });

  return (
    <mesh ref={meshRef} position={[0, 0, -1]}>
      <planeGeometry args={[50, 50]} />
      <MeshTransmissionMaterial
        ref={materialRef}
        background={new THREE.Color('#000000')}
        transmission={0}
        thickness={1}
        roughness={0}
        ior={1.5}
        transparent={true}
        opacity={1}
      />
    </mesh>
  );
}

function Background() {
  const texture = new THREE.TextureLoader().load('/background.jpg');
  return (
    <mesh position={[0, 0, -10]}>
      <planeGeometry args={[100, 100]} />
      <meshBasicMaterial map={texture} />
    </mesh>
  );
}

function Scene() {
  const scrollData = useScroll();
  // Using an object ref to hold current scrollData and pass it down since useScroll must be inside <ScrollControls>
  const scrollRef = useRef(scrollData);
  // Instead of assigning during render, we use a simple object passed to children since useScroll() returns an object with methods.
  // Actually, we can just pass scrollData directly.

  // Update ref in effect instead of render
  useEffect(() => {
    scrollRef.current = scrollData;
  }, [scrollData]);

  return (
    <>
      <ambientLight intensity={1} />
      <directionalLight position={[5, 5, 5]} intensity={2} />
      <Environment preset="city" />

      <Background />
      <Box />
      <BlurPlane scrollRef={scrollRef} />
      <Wand scrollRef={scrollRef} />
    </>
  );
}

export default function TestPage() {
  return (
    <main className="h-screen w-screen bg-black overflow-hidden relative">
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
        <ScrollControls pages={5} damping={0.1}>
          <Suspense fallback={null}>
            <Scene />
          </Suspense>
          <Scroll html style={{ width: '100%' }}>
            {/* Page 1 */}
            <div className="h-screen w-full flex items-center justify-center pointer-events-none">
              <h1 className="text-white text-4xl font-bold">Scroll Down</h1>
            </div>
            {/* Page 2 */}
            <div className="h-screen w-full flex items-center justify-center pointer-events-none">
            </div>
            {/* Page 3 */}
            <div className="h-screen w-full flex items-center pointer-events-none">
              <div className="ml-[10%] max-w-md">
                <h2 className="text-white text-5xl font-bold mb-4">The Elder Wand</h2>
                <p className="text-white/80 text-xl leading-relaxed">
                  One of the Deathly Hallows. Made of elder wood with a Thestral tail-hair core.
                  It is the most powerful wand in existence.
                </p>
              </div>
            </div>
            {/* Page 4 */}
            <div className="h-screen w-full flex items-end justify-center pb-20 pointer-events-none">
              <p className="text-white/60 tracking-widest uppercase text-sm">Drag to inspect</p>
            </div>
            {/* Page 5 */}
            <div className="h-screen w-full flex items-center justify-center pointer-events-none">
            </div>
          </Scroll>
        </ScrollControls>
      </Canvas>
    </main>
  );
}
