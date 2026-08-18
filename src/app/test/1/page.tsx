// Scroll Animation Example
"use client";

import { Suspense, useRef, useState, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  useGLTF,
  ScrollControls,
  Scroll,
  useScroll,
  Environment,
  PresentationControls,
} from "@react-three/drei";
import { EffectComposer, DepthOfField } from "@react-three/postprocessing";
import * as THREE from "three";

function Wand({
  wandRef,
  scrollRef,
}: {
  wandRef: React.RefObject<THREE.Group | null>;
  scrollRef: React.MutableRefObject<any>;
}) {
  const { scene } = useGLTF("/the_elder_wand.glb");

  // Refs to manage inner rotation reset without memory leaks
  const innerWandRef = useRef<THREE.Group>(null);
  const identityQuat = useRef(new THREE.Quaternion()).current;
  const targetQuat = useRef(new THREE.Quaternion()).current;

  // State to enable/disable user drag
  const [grabEnabled, setGrabEnabled] = useState(false);
  const grabStateRef = useRef(false); // Prevents stale closure loops in useFrame

  useFrame(() => {
    const r1 = scrollRef.current.range(0, 1 / 4);
    const r2 = scrollRef.current.range(1 / 4, 1 / 4);
    const r3 = scrollRef.current.range(2 / 4, 1 / 4);
    const r4 = scrollRef.current.range(3 / 4, 1 / 4);

    // Enable grabbing only when r3 is active and r4 hasn't started
    const isGrabEnabled = r3 > 0 && r4 === 0;
    if (grabStateRef.current !== isGrabEnabled) {
      grabStateRef.current = isGrabEnabled;
      setGrabEnabled(isGrabEnabled);
    }

    // console.log(`r1 = ${r1}\nr2 = ${r2}\nr3 = ${r3}\nr4 = ${r4}`);

    if (wandRef.current) {
      // Initial position
      let posX = 0;
      let posY = -0.1;
      let posZ = -1;
      let rotX = 0;
      let rotY = 180;
      let rotZ = 0;
      let scale = 0;

      // Section 1:
      // posZ += r1 * 0.7;

      // Section 2:
      scale = r1 == 1 ? 1 : 0;
      rotX = r3;
      rotY = r3;
      rotZ = r3;
      posY += r2 * 0.1;
      posZ += r2 * 0.7;
      rotZ = r2 * 35;

      // posX += r2 * 3;
      // posY += r2 * -0.5; // lower slightly
      // rotZ -= (r2 * Math.PI) / 8; // Adjust angle slightly

      // Section 3:
      // posX -= r3 * 3;
      // rotX += (r3 * Math.PI) / 2; // flatten for presentation

      // Section 4:
      posY -= r4 * 0.1;
      posZ -= r4 * 0.7;
      rotX -= r4 * rotX;
      rotY -= r4 * rotY;
      rotZ -= r4 * rotZ;

      rotX = THREE.MathUtils.degToRad(rotX);
      rotY = THREE.MathUtils.degToRad(rotY);
      rotZ = THREE.MathUtils.degToRad(rotZ);

      wandRef.current.position.set(posX, posY, posZ);
      wandRef.current.rotation.set(rotX, rotY, rotZ);
      wandRef.current.scale.set(scale, scale, scale);
    }

    // Smoothly cancel out the user's manual rotation during r4
    if (innerWandRef.current && innerWandRef.current.parent) {
      const presQuat = innerWandRef.current.parent.quaternion;

      // Calculate the exact opposite of the PresentationControls rotation
      targetQuat.copy(presQuat).invert();

      const blendFactor = Math.max(1 - r2, r4);

      // As r4 goes from 0 to 1, smoothly blend the inner wand from Identity to the Inverse Quat.
      innerWandRef.current.quaternion.slerpQuaternions(
        identityQuat,
        targetQuat,
        blendFactor,
      );
    }
  });

  return (
    <group ref={wandRef}>
      <PresentationControls
        enabled={grabEnabled}
        global={false}
        cursor={true}
        speed={1}
        zoom={1}
        rotation={[0, 0, 0]}
      >
        <group ref={innerWandRef}>
          <primitive object={scene.clone()} />
        </group>
      </PresentationControls>
    </group>
  );
}

function Box({
  boxRef,
  scrollRef,
}: {
  boxRef: React.RefObject<THREE.Group | null>;
  scrollRef: React.MutableRefObject<any>;
}) {
  const { scene } = useGLTF("/wooden_box.glb");

  useFrame(() => {
    const r1 = scrollRef.current.range(0, 1 / 4);
    const r2 = scrollRef.current.range(1 / 4, 1 / 4);
    const r3 = scrollRef.current.range(2 / 4, 1 / 4);
    const r4 = scrollRef.current.range(3 / 4, 1 / 4);

    // console.log(`r1 = ${r1}\nr2 = ${r2}\nr3 = ${r3}\nr4 = ${r4}`);

    if (boxRef.current) {
      // Initial position
      let posX = 0;
      let posY = 0;
      let posZ = -0.48;
      let rotX = 90;
      let rotY = 0;
      let rotZ = 0;
      let scale = 1;

      // Section 1
      posY -= r1 * 0.3;
      posZ -= r1 * 0.7;
      rotX -= r1 * 90;

      // Section 2:
      // posX += r2 * 3;
      // posY += r2 * -0.5; // lower slightly
      // rotZ -= (r2 * Math.PI) / 8; // Adjust angle slightly

      // Section 3:
      // posX -= r3 * 3;
      // rotX += (r3 * Math.PI) / 2; // flatten for presentation

      // Section 4:
      // posY -= r4 * 0.3;
      // posZ -= r4 * 0.7;
      // rotX = r4;

      rotX = THREE.MathUtils.degToRad(rotX);
      rotY = THREE.MathUtils.degToRad(rotY);
      rotZ = THREE.MathUtils.degToRad(rotZ);

      boxRef.current.position.set(posX, posY, posZ);
      boxRef.current.rotation.set(rotX, rotY, rotZ);
      boxRef.current.scale.set(scale, scale, scale);
    }
  });

  return (
    <group ref={boxRef}>
      <primitive object={scene.clone()} />
    </group>
  );
}

function Background() {
  const texture = new THREE.TextureLoader().load("/background.jpg");
  return (
    <mesh position={[0, 0, -100]}>
      <planeGeometry args={[160, 90]} />
      <meshBasicMaterial map={texture} />
    </mesh>
  );
}

function Scene() {
  const scrollData = useScroll();
  const { camera } = useThree();

  // 3. Centralize all refs inside the Scene component
  const scrollRef = useRef(scrollData);
  const dofRef = useRef<any>(null);
  const wandRef = useRef<THREE.Group>(null);
  const boxRef = useRef<THREE.Group>(null);

  const wandWorldPos = new THREE.Vector3();

  useEffect(() => {
    scrollRef.current = scrollData;
  }, [scrollData]);

  useFrame(() => {
    const r1 = scrollRef.current.range(0, 1 / 4); // Blur in
    const r4 = scrollRef.current.range(3 / 4, 1 / 4); // Blur out

    const blurAmount = r1 - r4;
    if (wandRef.current) {
      // Focus on wand
      wandRef.current.getWorldPosition(wandWorldPos);
    }

    const distanceToWand = camera.position.distanceTo(wandWorldPos);

    if (dofRef.current) {
      // dofRef.current.focalLength = THREE.MathUtils.lerp(0.01, 1, blurAmount);
      // dofRef.current.bokehScale = blurAmount * 5;

      // Keep DoF subtle enough that the wand stays sharp
      dofRef.current.focusDistance = distanceToWand / camera.far;
      dofRef.current.focalLength = THREE.MathUtils.lerp(0.01, 1, blurAmount);
      dofRef.current.bokehScale = THREE.MathUtils.lerp(0.1, 10, blurAmount);
    }

    // Example of cross-reference logic:
    // If you ever need to make the depth of field target track the wand's position,
    // you now have access to `wandRef.current.position` right here inside Scene's useFrame!
  });

  return (
    <>
      <ambientLight intensity={1} />
      <directionalLight position={[5, 5, 5]} intensity={2} />
      <Environment preset="city" />

      <Background />

      {/* 4. Pass the refs down to the children */}
      <Box boxRef={boxRef} scrollRef={scrollRef} />
      <Wand wandRef={wandRef} scrollRef={scrollRef} />

      <EffectComposer>
        <DepthOfField
          ref={dofRef}
          focusDistance={0.05}
          // bokehScale={5}
          height={480}
        />
      </EffectComposer>
    </>
  );
}

export default function TestPage() {
  return (
    <main className="h-screen w-screen bg-gray-200 overflow-hidden relative select-none">
      <Canvas camera={{ position: [0, 0, 0], fov: 45, near: 0.001 }}>
        <ScrollControls pages={5} damping={0.1}>
          <Suspense fallback={null}>
            <Scene />
          </Suspense>
          <Scroll html style={{ width: "100%" }}>
            {/* Page 1 */}
            <div className="h-screen w-full flex items-center justify-center pointer-events-none">
              <h1 className="text-white text-4xl font-bold">Scroll Down</h1>
            </div>
            {/* Page 2 */}
            <div className="h-screen w-full flex items-center justify-center pointer-events-none"></div>
            {/* Page 3 */}
            <div className="h-screen w-full flex items-center pointer-events-none">
              <div className="ml-[10%] max-w-md">
                <h2 className="text-white text-5xl font-bold mb-4">
                  The Elder Wand
                </h2>
                <p className="text-white/80 text-xl leading-relaxed">
                  One of the Deathly Hallows. Made of elder wood with a Thestral
                  tail-hair core. It is the most powerful wand in existence.
                </p>
              </div>
            </div>
            {/* Page 4 */}
            <div className="h-screen w-full flex items-end justify-center pb-20 pointer-events-none">
              <p className="text-white/60 tracking-widest uppercase text-sm">
                Drag to inspect
              </p>
            </div>
            {/* Page 5 */}
            <div className="h-screen w-full flex items-center justify-center pointer-events-none"></div>
          </Scroll>
        </ScrollControls>
      </Canvas>
    </main>
  );
}
