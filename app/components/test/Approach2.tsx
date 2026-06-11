// Approach 2: CSS Blur & Material Fading. This approach applies a CSS backdrop-filter to an HTML element overlay to blur the background image, and directly manipulates the opacity of the box model's materials over time to simulate it fading away behind the blur, offering a potentially more performant solution.
"use client";

import { Suspense, useRef, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  useGLTF,
  ScrollControls,
  Scroll,
  useScroll,
  Environment,
  PresentationControls
} from "@react-three/drei";
import * as THREE from "three";

function Wand({ scrollRef }: { scrollRef: { current: any } }) {
  const { scene } = useGLTF("/the_elder_wand.glb");
  const groupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    const r1 = scrollRef.current.range(0, 1/4);
    const r2 = scrollRef.current.range(1/4, 1/4);
    const r3 = scrollRef.current.range(2/4, 1/4);
    const r4 = scrollRef.current.range(3/4, 1/4);

    if (groupRef.current) {
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
      posY += r2 * -0.5;
      rotZ -= r2 * Math.PI / 8;

      // Section 3: Move center
      posX -= r3 * 3;
      rotX += r3 * Math.PI / 2;

      // Section 4: Go into box
      posZ -= r4 * 4;
      posY -= r4 * 1.5;
      rotX -= r4 * Math.PI / 2;

      groupRef.current.position.set(posX, posY, posZ);
      groupRef.current.rotation.set(rotX, rotY, rotZ);
    }
  });

  return (
    <group ref={groupRef}>
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

function Box({ scrollRef }: { scrollRef: { current: any } }) {
  const { scene } = useGLTF("/wooden_box.glb");

  // Create a clone to safely modify materials
  const clonedScene = scene.clone();

  useEffect(() => {
    clonedScene.traverse((child: any) => {
      if (child.isMesh && child.material) {
        child.material = child.material.clone();
        child.material.transparent = true;
      }
    });
  }, [clonedScene]);

  useFrame(() => {
    const r1 = scrollRef.current.range(0, 1/4); // Blur in
    const r4 = scrollRef.current.range(3/4, 1/4); // Blur out

    // Total fade intensity
    const fadeAmount = r1 - r4;

    clonedScene.traverse((child: any) => {
      if (child.isMesh && child.material) {
        // Fade out the box as it blurs out
        child.material.opacity = 1 - (fadeAmount * 0.9);
      }
    });
  });

  return (
    <group position={[0, -1, -2]} scale={1.5}>
      <primitive object={clonedScene} />
    </group>
  );
}

function CSSBlurOverlay() {
  const scrollData = useScroll();
  const blurRef = useRef<HTMLDivElement>(null);

  useFrame(() => {
    if (!blurRef.current) return;
    const r1 = scrollData.range(0, 1/4);
    const r4 = scrollData.range(3/4, 1/4);

    // Total blur intensity
    const blurAmount = r1 - r4;
    const blurPixels = blurAmount * 20; // up to 20px blur

    blurRef.current.style.backdropFilter = `blur(${blurPixels}px)`;
    (blurRef.current.style as any).WebkitBackdropFilter = `blur(${blurPixels}px)`; // for Safari
  });

  return (
    <div
      ref={blurRef}
      className="absolute inset-0 pointer-events-none"
      style={{ zIndex: -1 }} // Behind the 3D canvas but in front of the background
    />
  );
}

function Scene() {
  const scrollData = useScroll();
  const scrollRef = useRef(scrollData);

  useEffect(() => {
    scrollRef.current = scrollData;
  }, [scrollData]);

  return (
    <>
      <ambientLight intensity={1} />
      <directionalLight position={[5, 5, 5]} intensity={2} />
      <Environment preset="city" />

      {/* The background is handled via CSS on the main container now,
          so we don't render it in 3D to allow CSS blurring of the background.
          However, since we are rendering the Wand and Box in the SAME canvas,
          CSS backdrop-filter on a separate div behind the canvas will blur the
          CSS background, but NOT the 3D Box. The Box is faded manually.
      */}
      <Box scrollRef={scrollRef} />
      <Wand scrollRef={scrollRef} />

      {/* We can use Scroll html to inject our CSS Blur overlay behind the canvas.
          Actually, Scroll html is in front of the canvas by default.
          To blur the background image (which we can place on the main div), we just
          need a div between the background and the canvas. But since Canvas sits on top,
          we can put it directly in the React DOM. We'll do this using a component that
          hooks into useScroll inside the Canvas, but renders a portal or modifies a DOM node.
          A simpler way is to just use a Scroll html layer with a negative z-index! */}
      <Scroll html style={{ width: '100%', height: '100%', zIndex: -1 }}>
        <CSSBlurOverlay />
      </Scroll>
    </>
  );
}

export default function TestPage2() {
  return (
    <main
      className="h-screen w-screen overflow-hidden relative"
      style={{
        backgroundImage: "url('/background.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
        {/* We do NOT set a color attach background, to allow the canvas to be transparent and see the CSS background behind it. */}
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
                <h2 className="text-white text-5xl font-bold mb-4 drop-shadow-md">The Elder Wand</h2>
                <p className="text-white/90 text-xl leading-relaxed drop-shadow-md">
                  One of the Deathly Hallows. Made of elder wood with a Thestral tail-hair core.
                  It is the most powerful wand in existence.
                </p>
              </div>
            </div>
            {/* Page 4 */}
            <div className="h-screen w-full flex items-end justify-center pb-20 pointer-events-none">
              <p className="text-white/80 tracking-widest uppercase text-sm drop-shadow-md">Drag to inspect</p>
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
