"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import {
  useGLTF,
  PresentationControls,
  Environment,
  Html,
} from "@react-three/drei";

export default function App() {
  return (
    <main
      style={{
        height: "100vh",
        width: "100vw",
        // background: open ? "#d25578" : "#f0f0f0",
        transition: "background 0.5s ease-in-out",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* <Suspense fallback={null}> */}
        <Canvas
          //   shadows
          style={{ touchAction: "none" }}
          camera={{ position: [0, 0, 10], fov: 25 }}
        >
          <ambientLight intensity={0.5} />
          <spotLight
            position={[10, 10, 10]}
            angle={0.15}
            penumbra={1}
            // shadow-mapSize={2048}
            // castShadow
          />
          <PresentationControls
            global
            damping={0.08} // Replaces config. Lower = faster/slippier, Higher = slower/heavier
            snap // Replaces the snap object. Simply set to true to snap back to center
            rotation={[0, 0.3, 0]}
            polar={[-Math.PI / 3, Math.PI / 3]}
            azimuth={[-Math.PI / 1.4, Math.PI / 2]}
          >
            <Watch
              rotation={[-Math.PI / 2, 0, 0]}
              position={[0, 0.25, 0]}
              scale={0.003}
            />
          </PresentationControls>
          {/* <ContactShadows
            position={[0, -1.4, 0]}
            opacity={0.75}
            scale={10}
            blur={3}
            far={4}
          /> */}
          <Environment preset="city" />
        </Canvas>
      {/* </Suspense> */}
    </main>
  );
}

function Watch({ ...props }) {
  const { nodes, materials } = useGLTF("/watch-v1.glb");
  return (
    <group {...props} dispose={null}>
      <mesh
        geometry={nodes.Object005_glass_0.geometry}
        material={materials.glass}
      >
        <Html
          scale={100}
          rotation={[Math.PI / 2, 0, 0]}
          position={[180, -350, 50]}
          transform
          occlude
        >
          <div className="flex justify-center items-center cursor-pointer outline-none border-none bg-gray-800 text-white py-1 px-3 rounded-full text-center select-none">
            6.550 $ <span style={{ fontSize: "1.5em" }}>🥲</span>
          </div>
        </Html>
      </mesh>
      <mesh
        // castShadow
        // receiveShadow
        geometry={nodes.Object006_watch_0.geometry}
        material={materials.watch}
      />
    </group>
  );
}
