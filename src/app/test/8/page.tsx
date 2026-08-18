"use client";

import { useRef, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  Text,
  Environment,
  useGLTF,
  useCursor,
  OrbitControls,
} from "@react-three/drei";
import * as THREE from "three";

type CupProps = {
  id: number;
  targetX: number;
  isUp: boolean;
  interactive: boolean;
  onClick: () => void;
} & JSX.IntrinsicElements["group"];

const vec = new THREE.Vector3();

export function Table({ ...props }) {
  const { nodes, materials } = useGLTF("/table.glb");
  return (
    <group {...props} dispose={null} position={[0.5, -4.5, 0]}>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Object_2.geometry}
        material={materials.standardSurface1SG}
        rotation={[-Math.PI / 2, 0, 0]}
      />
    </group>
  );
}
useGLTF.preload("/table.glb");

export function Cup({
  id,
  targetX,
  isUp,
  interactive,
  onClick,
  ...props
}: CupProps) {
  const ref = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const { nodes, materials } = useGLTF("/cup.glb");

  // Track start and end positions for the arc calculation
  const [swapStart, setSwapStart] = useState(targetX);
  const [swapEnd, setSwapEnd] = useState(targetX);

  useEffect(() => {
    // When targetX changes, mark the current position as start, and new targetX as end
    if (ref.current) {
      setSwapStart(ref.current.position.x);
    }
    setSwapEnd(targetX);
  }, [targetX]);

  // Only allow hover effects if the cup is interactive AND it's currently face down
  const isHovered = hovered && interactive && !isUp;

  useCursor(isHovered, "pointer", "auto");

  useFrame(() => {
    if (!ref.current) return;

    // 1. Animate X position (Increased speed slightly to 0.1 for a snappier swap)
    ref.current.position.x = THREE.MathUtils.lerp(
      ref.current.position.x,
      swapEnd,
      0.1,
    );

    // 2. Calculate Z position for the circular arc
    const totalDistance = swapEnd - swapStart;
    let targetZ = 0;

    if (Math.abs(totalDistance) > 0.01) {
      // Calculate how far along we are in the swap (0.0 to 1.0)
      let progress = (ref.current.position.x - swapStart) / totalDistance;
      progress = Math.max(0, Math.min(1, progress)); // Clamp to ensure valid sine wave

      // Math.sin of (progress * PI) gives a curve starting at 0, peaking at 1 in the middle, ending at 0
      // Math.sign ensures cups moving left go one way, and moving right go the other (avoiding collisions)
      const direction = Math.sign(totalDistance);
      const arcDepth = 1.0; // Modify this to make the circular swap wider or narrower

      targetZ = Math.sin(progress * Math.PI) * arcDepth * direction;
    }

    // Animate Z position
    ref.current.position.z = THREE.MathUtils.lerp(
      ref.current.position.z,
      targetZ,
      0.2, // Faster lerp here so Z tightly follows the X progression
    );

    // 3. Existing Y and Rotation logic
    const targetY = isUp ? 1.5 : isHovered ? 0.2 : 0;
    const targetRotX = isUp ? 0 : isHovered ? Math.PI / 2 - 0.1 : Math.PI / 2;

    ref.current.position.y = THREE.MathUtils.lerp(
      ref.current.position.y,
      targetY,
      0.05,
    );
    ref.current.rotation.x = THREE.MathUtils.lerp(
      ref.current.rotation.x,
      targetRotX,
      0.05,
    );
  });

  return (
    <group
      {...props}
      ref={ref}
      onPointerDown={(e) => {
        e.stopPropagation();
        if (interactive) onClick();
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        setHovered(false);
      }}
      rotation={[Math.PI / 2, 0, 0]}
      dispose={null}
    >
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Object_2.geometry}
        material={materials.material}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Object_3.geometry}
        material={materials.cup_inside}
      />
    </group>
  );
}
useGLTF.preload("/cup.glb");

function Ball({ targetX, isVisible, interactive, onClick, ...props }: any) {
  const ref = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  // Create a local state to manage the delayed visibility
  const [delayedVisible, setDelayedVisible] = useState(isVisible);

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    if (!isVisible) {
      // If the ball is told to hide, wait 300ms first
      timeout = setTimeout(() => {
        setDelayedVisible(false);
      }, 300);
    } else {
      // If the ball is told to show, show it immediately
      setDelayedVisible(true);
    }

    // Cleanup function in case the component unmounts or state changes rapidly
    return () => clearTimeout(timeout);
  }, [isVisible]);

  const isHovered = hovered && interactive;
  useCursor(isHovered, "pointer", "auto");

  return (
    <mesh
      {...props}
      ref={ref}
      visible={delayedVisible} // Use the delayed state here instead of the raw prop!
      position={[targetX, -0.35, 0]}
      onPointerDown={(e) => {
        e.stopPropagation();
        if (interactive) onClick();
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        setHovered(false);
      }}
      scale={0.25}
    >
      <icosahedronGeometry />
      <meshPhysicalMaterial
        roughness={0.5}
        metalness={0.5}
        thickness={10}
        ior={5}
        transmission={1}
        color={"#00F"}
      />
    </mesh>
  );
}

function Rig() {
  return useFrame(({ camera, pointer }) => {
    vec.set(-pointer.x, 1 - pointer.y, camera.position.z);
    camera.position.lerp(vec, 0.025);
    camera.lookAt(0, 0, 0);
  });
}

function GameContent() {
  // --- Game State ---
  const [gameState, setGameState] = useState<
    "idle" | "shuffling" | "guessing" | "revealed"
  >("idle");
  const [order, setOrder] = useState([0, 1, 2]); // Maps cup ID to position slot (0, 1, or 2)
  const [revealed, setRevealed] = useState([true, true, true]); // Maps cup ID to whether it is lifted
  const [score, setScore] = useState(0);

  const swapCount = 5;
  const ballCup = 1; // The ball permanently belongs to cup ID 1

  // Maps slot index (0, 1, 2) to world X coordinates (-1.7, 0, 1.7)
  const getX = (slot: number) => (slot - 1) * 1.7;

  const startGame = () => {
    if (gameState !== "idle" && gameState !== "revealed") return;

    setGameState("shuffling");
    setRevealed([false, false, false]);

    setTimeout(async () => {
      let tempOrder = [...order];

      for (let i = 0; i < swapCount; i++) {
        let slotA = Math.floor(Math.random() * 3);
        let slotB = Math.floor(Math.random() * 3);
        while (slotA === slotB) {
          slotB = Math.floor(Math.random() * 3);
        }

        let cupA = tempOrder.findIndex((s) => s === slotA);
        let cupB = tempOrder.findIndex((s) => s === slotB);

        tempOrder[cupA] = slotB;
        tempOrder[cupB] = slotA;
        setOrder([...tempOrder]);

        await new Promise((r) => setTimeout(r, 500));
      }

      setGameState("guessing");
    }, 600);
  };

  const guessCup = (id: number) => {
    if (gameState !== "guessing") return;

    let newRevealed = [false, false, false];

    if (id === ballCup) {
      newRevealed[id] = true;
      setScore((prev) => {
        const newScore = prev + 1;
        console.log(`Correct! Score: ${newScore}`);
        return newScore;
      });
    } else {
      newRevealed[id] = true;
      newRevealed[ballCup] = true;
      console.log(`Wrong! Score: ${score}`);
    }

    setRevealed(newRevealed);
    setGameState("revealed");
  };

  return (
    <group position={[0, -0.275, 0]}>
      {[0, 1, 2].map((id) => (
        <Cup
          key={id}
          id={id}
          scale={2}
          targetX={getX(order[id])}
          isUp={revealed[id]}
          interactive={gameState === "guessing"}
          onClick={() => guessCup(id)}
        />
      ))}
      <Ball
        targetX={getX(order[ballCup])}
        isVisible={revealed[ballCup]}
        interactive={gameState === "idle" || gameState === "revealed"}
        onClick={startGame}
      />
      <Text
        position={[0, -0.99, -0.2]} // Placed slightly below cups, closer to camera
        rotation={[-Math.PI / 2, 0, 0]} // Rotated flat onto the table
        fontSize={4}
        color="black"
        fillOpacity={0.5}
        anchorX="center"
        anchorY="middle"
      >
        {score}
      </Text>
    </group>
  );
}

export default function TestPage() {
  return (
    <main className="h-screen w-screen overflow-hidden relative select-none">
      <Canvas camera={{ position: [0, 1, 5] }}>
        <Environment preset="forest" background />
        <Table />
        <GameContent />
        <Rig />
        {/* <OrbitControls /> */}
      </Canvas>
    </main>
  );
}
