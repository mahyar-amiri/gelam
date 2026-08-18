"use client";

import React, { useRef, useState } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { OrbitControls, useTexture } from "@react-three/drei";
import * as THREE from "three";

// 1. Custom Shader Material for the Roll Effect
const PaperRollMaterial = {
  uniforms: {
    uTexture: { value: null },
    uProgress: { value: 0.0 }, // 0 = flat, 1 = rolled up
    uRadius: { value: 0.15 }, // tightness of the roll
  },
  vertexShader: `
    uniform float uProgress;
    uniform float uRadius;
    varying vec2 vUv;

    void main() {
      vUv = uv;
      vec3 pos = position;

      if (uProgress > 0.0) {
        // Calculate how much of the paper is rolled up based on progress
        // Assuming paper width spans from -0.5 to 0.5 on the X axis
        float width = 1.0;
        float rollEdge = -0.5 + (width * uProgress);

        if (pos.x < rollEdge) {
          // Calculate the angle and wrap the vertex into a cylinder
          float distFromEdge = rollEdge - pos.x;
          float angle = distFromEdge / uRadius;

          pos.x = rollEdge - uRadius * sin(angle);
          pos.z = uRadius * (1.0 - cos(angle));
        }
      }

      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D uTexture;
    varying vec2 vUv;

    void main() {
      vec4 color = texture2D(uTexture, vUv);
      gl_FragColor = color;
    }
  `,
};

// 2. The Interactive Paper Mesh Component
function RollablePaper({ textureUrl }) {
  const meshRef = useRef();
  const materialRef = useRef();
  const [isRolled, setIsRolled] = useState(false);

  // Load your image texture
  const texture = useTexture(textureUrl);

  // Smoothly animate the roll progress using useFrame
  useFrame((state, delta) => {
    if (!materialRef.current) return;

    const targetProgress = isRolled ? 1.0 : 0.0;
    // Lerp towards the target progress for smooth animation
    materialRef.current.uniforms.uProgress.value = THREE.MathUtils.lerp(
      materialRef.current.uniforms.uProgress.value,
      targetProgress,
      delta * 5, // speed of the roll
    );
  });

  return (
    <mesh
      ref={meshRef}
      onClick={(e) => {
        e.stopPropagation();
        setIsRolled(!isRolled);
      }}
    >
      {/* High segment count is CRITICAL for smooth bending physics */}
      <planeGeometry args={[2, 3, 64, 64]} />
      <shaderMaterial
        ref={materialRef}
        args={[PaperRollMaterial]}
        uniforms-uTexture-value={texture}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

// 3. Main Scene Setup
export default function App() {
  return (
    <div style={{ width: "100vw", height: "100vh", background: "#111" }}>
      <Canvas camera={{ position: [0, 0, 4], fov: 50 }}>
        <ambientLight intensity={0.7} />

        {/* Replace with your image path */}
        <RollablePaper textureUrl="https://images.unsplash.com/photo-1586075010923-2dd4570fb338?q=80&w=1000" />

        <OrbitControls enableZoom={true} />
      </Canvas>
    </div>
  );
}
