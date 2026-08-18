"use client";

import React, { useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Box } from "@react-three/drei";

export default function CinematicScene() {
  const [isCinematic, setIsCinematic] = useState(true);

  useEffect(() => {
    // Function to check scroll position
    const handleScroll = () => {
      // If the user scrolls down more than 50px, hide the bars
      if (window.scrollY > 50) {
        setIsCinematic(false);
      } else {
        // Bring them back if they scroll to the very top
        setIsCinematic(true);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    // The main container needs to be taller than 100vh so we can actually scroll!
    <div
      style={{
        height: "200vh",
        backgroundColor: "#111",
      }}
    >
      {/* This is a sticky wrapper that keeps the 3D scene and bars locked 
        to the screen while the user scrolls down the page. 
      */}
      <div
        style={{
          position: "sticky",
          top: 0,
          height: "100vh",
          overflow: "hidden",
        }}
      >
        {/* --- CINEMATIC BARS --- */}
        {/* Top Bar */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "15%", // Adjust this for a wider/narrower cinematic look
            backgroundColor: "black",
            zIndex: 10,
            transition: "transform 1s cubic-bezier(0.65, 0, 0.35, 1)", // Smooth game-like easing
            transform: isCinematic ? "translateY(0)" : "translateY(-100%)",
          }}
        />

        {/* Bottom Bar */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            width: "100%",
            height: "15%",
            backgroundColor: "black",
            zIndex: 10,
            transition: "transform 1s cubic-bezier(0.65, 0, 0.35, 1)",
            transform: isCinematic ? "translateY(0)" : "translateY(100%)",
          }}
        />

        {/* --- 3D CANVAS --- */}
        <Canvas camera={{ position: [0, 2, 5] }}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={1} />

          {/* A simple spinning box so you can see the 3D scene running behind the bars */}
          <Box args={[1, 1, 1]}>
            <meshStandardMaterial color="hotpink" />
          </Box>

          <OrbitControls />
        </Canvas>
      </div>
    </div>
  );
}
