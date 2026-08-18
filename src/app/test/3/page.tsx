// Opening Box Example
"use client";

import { Suspense, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  useGLTF,
  Environment,
  ContactShadows,
  useCursor,
  PresentationControls,
  OrbitControls,
  Edges,
} from "@react-three/drei";
import * as THREE from "three";

// Type definitions for the GLTF model based on your node structure
type GLTFResult = {
  nodes: {
    Cube008: THREE.Mesh;
    Cube008_1: THREE.Mesh;
    Cube008_2: THREE.Mesh;
    keyboard: THREE.Mesh;
    Cube002: THREE.Mesh;
    Cube002_1: THREE.Mesh;
    touchbar: THREE.Mesh;
  };
  materials: {
    aluminium: THREE.Material;
    "matte.001": THREE.Material;
    "screen.001": THREE.Material;
    keys: THREE.Material;
    trackpad: THREE.Material;
    touchbar: THREE.Material;
  };
};

function Model({ open, ...props }: { open: boolean }) {
  const group = useRef<THREE.Group>(null);
  const hingeRef = useRef<THREE.Group>(null);

  // Ensure the model is in your Next.js `public` folder
  const { nodes, materials } = useGLTF(
    "/mac-draco.glb",
  ) as unknown as GLTFResult;

  const [hovered, setHovered] = useState(false);
  useCursor(hovered, "pointer", "auto");

  // Handle both the floating animation AND the hinge/lid opening natively
  useFrame((state) => {
    const t = state.clock.getElapsedTime();

    // if (group.current) {
    //   // Float animation
    //   group.current.rotation.x = THREE.MathUtils.lerp(
    //     group.current.rotation.x,
    //     open ? Math.cos(t / 10) / 10 + 0.25 : 0,
    //     0.1,
    //   );
    //   group.current.rotation.y = THREE.MathUtils.lerp(
    //     group.current.rotation.y,
    //     open ? Math.sin(t / 10) / 4 : 0,
    //     0.1,
    //   );
    //   group.current.rotation.z = THREE.MathUtils.lerp(
    //     group.current.rotation.z,
    //     open ? Math.sin(t / 10) / 10 : 0,
    //     0.1,
    //   );
    //   group.current.position.y = THREE.MathUtils.lerp(
    //     group.current.position.y,
    //     open ? (-2 + Math.sin(t)) / 3 : -4.3,
    //     0.1,
    //   );
    // }

    if (hingeRef.current) {
      // Hinge animation
      const targetHinge = open ? -0.425 : 1.575;
      hingeRef.current.rotation.x = THREE.MathUtils.lerp(
        hingeRef.current.rotation.x,
        targetHinge,
        0.1,
      );
    }
  });

  return (
    <group
      ref={group}
      {...props}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
      }}
      onPointerOut={() => setHovered(false)}
      dispose={null}
    >
      <group ref={hingeRef} position={[0, -0.04, 0.41]}>
        <group position={[0, 2.96, -0.13]} rotation={[Math.PI / 2, 0, 0]}>
          <mesh
            material={materials.aluminium}
            geometry={nodes.Cube008.geometry}
          />
          <mesh
            material={materials["matte.001"]}
            geometry={nodes.Cube008_1.geometry}
          />
          <mesh
            material={materials["screen.001"]}
            geometry={nodes.Cube008_2.geometry}
          />
        </group>
      </group>
      <group position={[0, -0.1, 3.39]}>
        <mesh
          material={materials.aluminium}
          geometry={nodes.Cube002.geometry}
        />
        <mesh
          material={materials.trackpad}
          geometry={nodes.Cube002_1.geometry}
        />
        <mesh
          material={materials.keys}
          geometry={nodes.keyboard.geometry}
          position={[1.79, 0.1, 0.1]}
        />
        <mesh
          material={materials.touchbar}
          geometry={nodes.touchbar.geometry}
          position={[0, 0.1, -2.2]}
        />
      </group>
    </group>
  );
}

export function Identifier({ ...props }) {
  return (
    // Spreading {...props} allows you to pass position, rotation, etc.
    // directly to this component later if you want to!
    <group name="identifier" {...props}>
      <mesh>
        <boxGeometry args={[0.2, 0.2, 0.2]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        <Edges scale={1} threshold={15} color="white" />
      </mesh>
      <mesh scale={0.1}>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshStandardMaterial color="royalblue" />
      </mesh>
    </group>
  );
}
export function Box({ open, ...props }: { open: boolean }) {
  const { nodes, materials } = useGLTF("/wooden_box.glb");
  const lidRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (lidRef.current) {
      // Hinge animation
      const targetHinge = open ? -Math.PI / 1.5 : 0;
      lidRef.current.rotation.x = THREE.MathUtils.lerp(
        lidRef.current.rotation.x,
        targetHinge,
        0.01,
      );
    }
  });

  return (
    <group {...props} dispose={null}>
      <group>
        {/* LID */}
        <group ref={lidRef} position={[0, 1.75, -1.42]}>
          <Identifier visible={false} />
          <group name="BoxLid" position={[0, -1.75, 1.42]}>
            <mesh
              name="AboveSurface"
              castShadow
              receiveShadow
              geometry={nodes.polySurface12_PDC_tex_0.geometry}
              material={materials.PDC_tex}
            />
            <mesh
              name="RightTopWood"
              castShadow
              receiveShadow
              geometry={nodes.polySurface19_PDC_tex_0.geometry}
              material={materials.PDC_tex}
            />
            <mesh
              name="LeftTopWood"
              castShadow
              receiveShadow
              geometry={nodes.polySurface30_PDC_tex_0.geometry}
              material={materials.PDC_tex}
            />
            {/* Right Lock */}
            <group name="RightLock">
              <mesh
                castShadow
                receiveShadow
                geometry={nodes.polySurface26_PDC_tex_0.geometry}
                material={materials.PDC_tex}
              />
              <mesh
                castShadow
                receiveShadow
                geometry={nodes.polySurface24_PDC_tex_0.geometry}
                material={materials.PDC_tex}
              />
              <mesh
                castShadow
                receiveShadow
                geometry={nodes.pPlane1_PDC_tex_0.geometry}
                material={materials.PDC_tex}
              />
              <mesh
                castShadow
                receiveShadow
                geometry={nodes.polySurface22_PDC_tex_0.geometry}
                material={materials.PDC_tex}
              />
            </group>
            {/* Left Lock Handle */}
            <group name="LeftLockHandle">
              <mesh
                castShadow
                receiveShadow
                geometry={nodes.pPlane6_PDC_tex_0.geometry}
                material={materials.PDC_tex}
              />
              <mesh
                castShadow
                receiveShadow
                geometry={nodes.polySurface33_PDC_tex_0.geometry}
                material={materials.PDC_tex}
              />
              <mesh
                castShadow
                receiveShadow
                geometry={nodes.polySurface31_PDC_tex_0.geometry}
                material={materials.PDC_tex}
              />
              <mesh
                castShadow
                receiveShadow
                geometry={nodes.polySurface28_PDC_tex_0.geometry}
                material={materials.PDC_tex}
              />
            </group>
          </group>
        </group>

        <group position={[0, 2, 0]}>
          <mesh scale={0.1} visible={false}>
            <sphereGeometry args={[0.3, 16, 16]} />
            <meshStandardMaterial color="red" />
          </mesh>
          {/* <directionalLight name="DirectionalLight" intensity={10} /> */}
        </group>

        <mesh
          name="FrontSurface"
          castShadow
          receiveShadow
          geometry={nodes.polySurface14_PDC_tex_0.geometry}
          material={materials.PDC_tex}
        />
        <mesh
          name="BackSurface"
          castShadow
          receiveShadow
          geometry={nodes.polySurface3_PDC_tex_0.geometry}
          material={materials.PDC_tex}
        />
        <mesh
          name="BottomSurface"
          castShadow
          receiveShadow
          geometry={nodes.polySurface8_PDC_tex_0.geometry}
          material={materials.PDC_tex}
        />
        {/* <mesh
          name="SideSurface"
          castShadow
          receiveShadow
          geometry={nodes.polySurface4_PDC_tex_0.geometry}
          material={materials.PDC_tex}
        /> */}

        <group name="Right">
          {/* RightWood */}
          <group name="RightWood">
            <mesh
              name="RightNearWood"
              castShadow
              receiveShadow
              geometry={nodes.polySurface6_PDC_tex_0.geometry}
              material={materials.PDC_tex}
            />
            <mesh
              name="RightFarWood"
              castShadow
              receiveShadow
              geometry={nodes.polySurface18_PDC_tex_0.geometry}
              material={materials.PDC_tex}
            />
          </group>

          {/* Right Handle */}
          <group name="RightHandle">
            <mesh
              name="RightHandleCable"
              castShadow
              receiveShadow
              geometry={nodes.pPlane4_PDC_tex_0.geometry}
              material={materials.PDC_tex}
            />
            <mesh
              name="RightHandleIron"
              castShadow
              receiveShadow
              geometry={nodes.pCylinder1_PDC_tex_0.geometry}
              material={materials.PDC_tex}
            />
            <mesh
              name="RightIronCover"
              castShadow
              receiveShadow
              geometry={nodes.polySurface27_PDC_tex_0.geometry}
              material={materials.PDC_tex}
            />
          </group>
        </group>

        <group name="Left">
          {/* Left Wood */}
          <group name="LeftWood">
            <mesh
              name="LeftNearWood"
              castShadow
              receiveShadow
              geometry={nodes.polySurface34_PDC_tex_0.geometry}
              material={materials.PDC_tex}
            />
            <mesh
              name="LeftFarWood"
              castShadow
              receiveShadow
              geometry={nodes.polySurface32_PDC_tex_0.geometry}
              material={materials.PDC_tex}
            />
          </group>

          {/* Left Handle */}
          <group name="LeftHandle">
            <mesh
              name="LeftHandleCable"
              castShadow
              receiveShadow
              geometry={nodes.pPlane5_PDC_tex_0.geometry}
              material={materials.PDC_tex}
            />
            <mesh
              name="LeftHandleIron"
              castShadow
              receiveShadow
              geometry={nodes.pCylinder2_PDC_tex_0.geometry}
              material={materials.PDC_tex}
            />
            <mesh
              name="LeftIronCover"
              castShadow
              receiveShadow
              geometry={nodes.polySurface29_PDC_tex_0.geometry}
              material={materials.PDC_tex}
            />
          </group>
        </group>
      </group>
    </group>
  );
}

useGLTF.preload("/wooden_box.glb");

// Preload the model
useGLTF.preload("/mac-draco.glb");

// Helper component to animate the light color
function AnimatedLight({ open }: { open: boolean }) {
  const lightRef = useRef<THREE.PointLight>(null);
  const colorClosed = new THREE.Color("#f0f0f0");
  const colorOpen = new THREE.Color("#d25578");

  useFrame(() => {
    if (lightRef.current) {
      lightRef.current.color.lerp(open ? colorOpen : colorClosed, 0.1);
    }
  });

  return <pointLight ref={lightRef} position={[10, 10, 10]} intensity={1.5} />;
}

export default function App() {
  const [open, setOpen] = useState(false);

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
      <h1
        style={{
          position: "absolute",
          top: "30%",
          left: "50%",
          transform: open
            ? "translate3d(-50%, -50px, 0)"
            : "translate3d(-50%, -100px, 0)",
          opacity: open ? 0 : 1,
          transition: "all 0.5s ease-in-out",
          pointerEvents: "none",
          zIndex: 10,
        }}
      >
        click
      </h1>
      <Canvas dpr={[1, 2]} camera={{ position: [0, 0, -30], fov: 30 }}>
        <AnimatedLight open={open} />
        <Suspense fallback={null}>
          <group
            rotation={[0, Math.PI, 0]}
            onClick={(e) => {
              e.stopPropagation();
              setOpen(!open);
            }}
          >
            {/* <Model open={open} /> */}
            <Box open={open} />
          </group>
          <Environment preset="city" />
        </Suspense>
        <ContactShadows
          position={[0, -4.5, 0]}
          opacity={0.4}
          scale={20}
          blur={1.75}
          far={4.5}
        />
        <OrbitControls />
      </Canvas>
    </main>
  );
}
