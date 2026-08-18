"use client";

import { useRef, useState, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Center } from "@react-three/drei";
// import { Vector3, MathUtils, Color } from "three";
import * as THREE from "three";

const vec = new THREE.Vector3();
const black = new THREE.Color("black");

function Button({ ...props }) {
  const ref = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const [selected, setSelected] = useState(false);
  const colorTo = useMemo(
    () => new THREE.Color(Math.floor(Math.random() * 16777216)),
    [],
  );

  useFrame(() => {
    if (!ref.current) return;
    ref.current.rotation.x = hovered
      ? THREE.MathUtils.lerp(ref.current.rotation.x, -Math.PI * 2, 0.025)
      : THREE.MathUtils.lerp(ref.current.rotation.x, 0, 0.025);

    ref.current.position.z = selected
      ? THREE.MathUtils.lerp(ref.current.position.z, 0, 0.025)
      : THREE.MathUtils.lerp(ref.current.position.z, -3, 0.025);

    ref.current.material.color.lerp(selected ? colorTo : black, 0.025);
  });

  return (
    <mesh
      {...props}
      ref={ref}
      onPointerDown={() => {
        setSelected(!selected);
      }}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <icosahedronGeometry />
      <meshPhysicalMaterial
        roughness={0}
        metalness={0}
        thickness={3.12}
        ior={1.74}
        transmission={1.0}
      />
    </mesh>
  );
}

function Rig() {
  return useFrame(({ camera, pointer }) => {
    vec.set(-pointer.x * 1, -pointer.y * 1, camera.position.z);
    camera.position.lerp(vec, 0.025);
    camera.lookAt(0, 0, 0);
  });
}

export default function TestPage() {
  return (
    <main className="h-screen w-screen bg-gray-200 overflow-hidden relative select-none">
      <Canvas camera={{ position: [0, 0, 5] }}>
        <Environment preset="forest" background />
        <Center>
          {[...Array(5).keys()].map((x) =>
            [...Array(3).keys()].map((y) => (
              <Button key={x + y * 5} position={[x * 2.5, y * 2.5, 0]} />
            )),
          )}
        </Center>
        <Rig />
      </Canvas>
    </main>
  );
}
