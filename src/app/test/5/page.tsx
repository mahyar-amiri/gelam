"use client";

import { useRef } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  useGLTF,
  ScrollControls,
  useScroll,
  Environment,
} from "@react-three/drei";
import { EffectComposer, DepthOfField } from "@react-three/postprocessing";

function Scene() {
  const scroll = useScroll();
  const { camera } = useThree();

  const wandRef = useRef<THREE.Group>(null);
  const boxRef = useRef<THREE.Group>(null);
  const dofRef = useRef<any>(null);

  const { scene: boxScene } = useGLTF("/wooden_box.glb");
  const { scene: wandScene } = useGLTF("/the_elder_wand.glb");

  const wandWorldPos = new THREE.Vector3();

  useFrame(() => {
    const offset = scroll.offset;

    if (wandRef.current) {
      // Move wand toward camera
      wandRef.current.position.z = THREE.MathUtils.lerp(2, 7.8, offset);
      wandRef.current.position.y = THREE.MathUtils.lerp(2, 0, offset);

      // wandRef.current.rotation.y = THREE.MathUtils.lerp(
      //   0,
      //   Math.PI / 10,
      //   offset,
      // );

      // Focus on wand
      wandRef.current.getWorldPosition(wandWorldPos);

      const distanceToWand = camera.position.distanceTo(wandWorldPos);

      if (dofRef.current) {
        dofRef.current.focusDistance = distanceToWand / camera.far;

        // Keep DoF subtle enough that the wand stays sharp
        dofRef.current.focalLength = THREE.MathUtils.lerp(0.01, 1, offset);
      }
    }
  });

  return (
    <>
      {/* Box in background */}
      <group ref={boxRef}>
        <primitive object={boxScene} scale={1.5} />
      </group>

      {/* Wand */}
      <group ref={wandRef}>
        <primitive object={wandScene} scale={1} />
      </group>

      <EffectComposer>
        <DepthOfField
          ref={dofRef}
          focusDistance={0.05}
          bokehScale={2}
          height={480}
        />
      </EffectComposer>
    </>
  );
}

export default function Page() {
  return (
    <main className="w-full h-screen bg-slate-900 overflow-hidden">
      <Canvas
        camera={{
          position: [0, 0, 8],
          fov: 45,
          near: 0.1,
          far: 100,
        }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 10, 10]} intensity={1.5} />

        <Environment preset="warehouse" />

        <ScrollControls pages={3} damping={0.25}>
          <Scene />
        </ScrollControls>
      </Canvas>
    </main>
  );
}

useGLTF.preload("/wooden_box.glb");
useGLTF.preload("/the_elder_wand.glb");
