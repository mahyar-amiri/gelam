"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { Center, Environment, OrbitControls, useGLTF } from "@react-three/drei";

function Model() {
  const { scene } = useGLTF("/the_elder_wand.glb");
  return <primitive object={scene} />;
}

useGLTF.preload("/the_elder_wand.glb");

export default function ModelViewer() {
  return (
    <div className="h-130 w-full overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-2xl">
      <Canvas camera={{ position: [0, 1.2, 3.5], fov: 45 }}>
        <color attach="background" args={["#09090b"]} />
        <ambientLight intensity={0.8} />
        <directionalLight position={[4, 6, 4]} intensity={2} />
        <Suspense fallback={null}>
          <Center>
            <Model />
          </Center>
          <Environment preset="city" />
        </Suspense>
        <OrbitControls minDistance={0.2} maxDistance={8} />
      </Canvas>
    </div>
  );
}
