// "use client";

// import { Canvas, useFrame } from "@react-three/fiber";
// import { OrbitControls, Text } from "@react-three/drei";
// import * as THREE from "three";
// import { useRef, useState } from "react";

// // ─────────────────────────────────────────────
// // Configuration
// // ─────────────────────────────────────────────

// const TEXT = "Hello World";
// const TEXT_SIZE = 0.38;

// // Put your custom font in:
// // public/fonts/CustomFont.ttf
// // const FONT_URL = "/fonts/CustomFont.ttf";

// const CUBE_SIZE = 2.5;
// const FADE_DURATION = 300;

// // ─────────────────────────────────────────────
// // Cube
// // ─────────────────────────────────────────────

// interface CubeProps {
//   onClick: () => void;
// }

// function Cube({ onClick }: CubeProps) {
//   const boxMaterial = useRef<THREE.MeshStandardMaterial>(null);
//   const textMaterial = useRef<THREE.MeshBasicMaterial>(null);

//   const fadeStart = useRef<number | null>(null);

//   useFrame(() => {
//     if (fadeStart.current === null) {
//       return;
//     }

//     const elapsed = performance.now() - fadeStart.current;
//     const progress = Math.min(elapsed / FADE_DURATION, 1);

//     // Smooth ease-in-out fade
//     const easedProgress =
//       progress < 0.5
//         ? 2 * progress * progress
//         : 1 - Math.pow(-2 * progress + 2, 2) / 2;

//     const opacity = 1 - easedProgress;

//     if (boxMaterial.current) {
//       boxMaterial.current.opacity = opacity;
//     }

//     if (textMaterial.current) {
//       textMaterial.current.opacity = opacity;
//     }

//     if (progress >= 1) {
//       fadeStart.current = null;
//     }
//   });

//   const handleClick = () => {
//     // Start the 3-second fade animation.
//     if (fadeStart.current === null) {
//       fadeStart.current = performance.now();
//     }

//     onClick();
//   };

//   return (
//     <group
//       onClick={(event) => {
//         event.stopPropagation();
//         handleClick();
//       }}
//     >
//       {/* Cube */}
//       <mesh castShadow receiveShadow>
//         <boxGeometry
//           args={[CUBE_SIZE, CUBE_SIZE, CUBE_SIZE]}
//         />

//         <meshStandardMaterial
//           ref={boxMaterial}
//           color="#8b5a2b"
//           roughness={0.42}
//           metalness={0.05}
//           transparent
//           opacity={1}
//         />
//       </mesh>

//       {/* Text on the front (+Z) surface */}
//       <Text
//         position={[0, 0, CUBE_SIZE / 2 + 0.012]}
//         // font={FONT_URL}
//         fontSize={TEXT_SIZE}
//         anchorX="center"
//         anchorY="middle"
//         textAlign="center"
//         color="#ffffff"
//         outlineWidth={0.008}
//         outlineColor="#000000"
//       >
//         {TEXT}
//         <meshBasicMaterial
//           ref={textMaterial}
//           transparent
//           opacity={1}
//           depthWrite={false}
//         />
//       </Text>
//     </group>
//   );
// }

// // ─────────────────────────────────────────────
// // Scene
// // ─────────────────────────────────────────────

// function Scene() {
//   const [clicked, setClicked] = useState(false);

//   return (
//     <>
//       <ambientLight intensity={1.4} />

//       <directionalLight
//         position={[4, 6, 5]}
//         intensity={3}
//         castShadow
//       />

//       <directionalLight
//         position={[-4, 2, -3]}
//         intensity={1}
//       />

//       <Cube
//         onClick={() => {
//           setClicked(true);
//         }}
//       />

//       <OrbitControls
//         enablePan={false}
//         minDistance={4}
//         maxDistance={8}
//         enableDamping
//       />
//     </>
//   );
// }

// // ─────────────────────────────────────────────
// // App
// // ─────────────────────────────────────────────

// export default function App() {
//   return (
//     <main className="relative h-screen w-screen overflow-hidden bg-neutral-950">
//       {/* 3D Canvas */}
//       <Canvas
//         shadows
//         camera={{
//           position: [4, 3, 5],
//           fov: 45,
//         }}
//         gl={{
//           antialias: true,
//           alpha: true,
//         }}
//       >
//         <Scene />
//       </Canvas>

//       {/* UI */}
//       <div className="pointer-events-none absolute inset-x-0 top-0 flex justify-center pt-8">
//         <div className="rounded-full border border-white/10 bg-black/40 px-5 py-2.5 text-sm text-white/70 backdrop-blur-md">
//           Click the cube
//         </div>
//       </div>

//       {/* Description */}
//       <div className="pointer-events-none absolute inset-x-0 bottom-8 flex justify-center">
//         <div className="text-center">
//           <p className="text-xs uppercase tracking-[0.3em] text-white/30">
//             Three.js × React
//           </p>

//           <p className="mt-2 text-sm text-white/50">
//             The cube fades out over 3 seconds
//           </p>
//         </div>
//       </div>
//     </main>
//   );
// }

"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Text } from "@react-three/drei";
import * as THREE from "three";
import { useEffect, useRef } from "react";

// ───────────────────────────────────────────── // Configuration // ─────────────────────────────────────────────
const TEXT = "Hello World";
const TEXT_SIZE = 0.38;
const FONT_URL = "/hpf.ttf";
const CUBE_SIZE = 2.5;

// Initial appearance
const INITIAL_DELAY = 5000;

// Click behavior
const FADE_OUT_DURATION = 500;
const HIDDEN_DURATION = 3000;
const FADE_IN_DURATION = 500;
// ───────────────────────────────────────────── // Animation // ─────────────────────────────────────────────
type AnimationState =
  | "waiting"
  | "fading-in"
  | "visible"
  | "fading-out"
  | "hidden";
function easeInOut(t: number) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}
// ───────────────────────────────────────────── // Cube // ─────────────────────────────────────────────
function Cube() {
  const boxMaterial = useRef<THREE.MeshStandardMaterial>(null);
  const animationState = useRef<AnimationState>("waiting");
  const animationStart = useRef<number>(0);
  // Start with the cube completely invisible.
  useEffect(() => {
    const timer = window.setTimeout(() => {
      animationState.current = "fading-in";
      animationStart.current = performance.now();
    }, INITIAL_DELAY);
    return () => {
      window.clearTimeout(timer);
    };
  }, []);
  useFrame(() => {
    if (!boxMaterial.current) return;
    const now = performance.now();
    switch (
      animationState.current // ─────────────────────────────────────── // Initial 5-second wait // ───────────────────────────────────────
    ) {
      case "waiting": {
        boxMaterial.current.opacity = 0;
        break;
      } // ─────────────────────────────────────── // Box appears // ───────────────────────────────────────
      case "fading-in": {
        const elapsed = now - animationStart.current;
        const progress = Math.min(elapsed / FADE_IN_DURATION, 1);
        const opacity = easeInOut(progress);
        boxMaterial.current.opacity = opacity;
        if (progress >= 1) {
          boxMaterial.current.opacity = 1;
          animationState.current = "visible";
        }
        break;
      } // ─────────────────────────────────────── // Fully visible // ───────────────────────────────────────
      case "visible": {
        boxMaterial.current.opacity = 1;
        break;
      } // ─────────────────────────────────────── // Click → fade out in 500ms // ───────────────────────────────────────
      case "fading-out": {
        const elapsed = now - animationStart.current;
        const progress = Math.min(elapsed / FADE_OUT_DURATION, 1);
        const opacity = 1 - easeInOut(progress);
        boxMaterial.current.opacity = opacity;
        if (progress >= 1) {
          boxMaterial.current.opacity = 0;
          // Start the 3-second invisible period.
          animationState.current = "hidden";
          animationStart.current = now;
        }
        break;
      } // ─────────────────────────────────────── // Box stays invisible for 3 seconds // ───────────────────────────────────────
      case "hidden": {
        boxMaterial.current.opacity = 0;
        const elapsed = now - animationStart.current;
        if (elapsed >= HIDDEN_DURATION) {
          animationState.current = "fading-in";
          animationStart.current = now;
        }
        break;
      }
    }
  });
  const handleClick = () => {
    // Only respond when the box is fully visible.
    if (animationState.current !== "visible") {
      return;
    }
    animationState.current = "fading-out";
    animationStart.current = performance.now();
  };
  return (
    <mesh
      castShadow
      receiveShadow
      onClick={(event) => {
        event.stopPropagation();
        handleClick();
      }}
    >
      <boxGeometry args={[CUBE_SIZE, CUBE_SIZE, CUBE_SIZE]} />
      <meshStandardMaterial
        ref={boxMaterial}
        color="#8b5a2b"
        roughness={0.42}
        metalness={0.05}
        transparent
        opacity={0}
      />
    </mesh>
  );
} // ───────────────────────────────────────────── // Text // ─────────────────────────────────────────────
function HelloWorldText() {
  return (
    <Text
      position={[0, 0, CUBE_SIZE / 2 + 0.012]}
      font={FONT_URL}
      fontSize={TEXT_SIZE}
      anchorX="center"
      anchorY="middle"
      textAlign="center"
      color="#ffffff"
    //   outlineWidth={0.008}
    //   outlineColor="#000000"
    >
      {TEXT}
    </Text>
  );
} // ───────────────────────────────────────────── // Scene // ─────────────────────────────────────────────
function Scene() {
  return (
    <>
      <ambientLight intensity={1.4} />
      <directionalLight position={[4, 6, 5]} intensity={3} castShadow />
      <directionalLight position={[-4, 2, -3]} intensity={1} />
      {/* Cube appears after 5 seconds */} <Cube />
      {/* Text is ALWAYS visible */} <HelloWorldText />
      {/* <OrbitControls
        enablePan={false}
        enableDamping
        minDistance={4}
        maxDistance={8}
      /> */}
    </>
  );
} // ───────────────────────────────────────────── // App // ─────────────────────────────────────────────
export default function App() {
  return (
    <main className="relative h-screen w-screen overflow-hidden bg-neutral-950">
      <Canvas
        shadows
        camera={{ position: [4, 3, 5], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
      >
        <Scene />
      </Canvas>
      {/* Top instruction */}
      <div className="pointer-events-none absolute inset-x-0 top-0 flex justify-center pt-8">
        <div className="rounded-full border border-white/10 bg-black/40 px-5 py-2.5 text-sm text-white/70 backdrop-blur-md">
          Click the box
        </div>
      </div>
      {/* Bottom description */}
      <div className="pointer-events-none absolute inset-x-0 bottom-8 flex justify-center">
        <div className="text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-white/30">
            Three.js × React
          </p>
          <p className="mt-2 text-sm text-white/50">
            The box appears after 5 seconds
          </p>
        </div>
      </div>
    </main>
  );
}
