"use client";

import { Suspense, useRef, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import {
  CameraController,
  RenderSettings,
  SceneLights,
} from "@/utils/controller";
import {
  Transform,
  AutoRotate,
  RenderConfig,
  MaterialOverride,
} from "@/types/controller";
import {
  D_TRANSFORM,
  D_AUTO_ROTATE,
  D_AMBIENT,
  D_DIR1,
  D_DIR2,
  D_POINT,
  D_SPOT,
  D_ENV,
  D_CAMERA,
  D_RENDER,
  D_MATERIAL,
} from "@/consts/controller";

// const MODEL_NAME = "/the_elder_wand.glb";
const MODEL_NAME = "/wooden_box.glb";

// Model
function Model({
  transform,
  autoRotate,
  renderConfig,
  materialConfig,
}: {
  transform: Transform;
  autoRotate: AutoRotate;
  renderConfig: RenderConfig;
  materialConfig: MaterialOverride;
}) {
  const { scene } = useGLTF(MODEL_NAME);
  const groupRef = useRef<THREE.Group>(null);

  // Apply wireframe & material overrides
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    scene.traverse((obj: any) => {
      if (obj.isMesh && obj.material) {
        const mats = Array.isArray(obj.material)
          ? obj.material
          : [obj.material];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        mats.forEach((mat: any) => {
          mat.wireframe = renderConfig.wireframe;
          if (materialConfig.enabled) {
            mat.roughness = materialConfig.roughness;
            mat.metalness = materialConfig.metalness;
            mat.color?.set(materialConfig.color);
            mat.opacity = materialConfig.opacity;
            mat.transparent =
              materialConfig.transparent || materialConfig.opacity < 1;
          }
          mat.needsUpdate = true;
        });
      }
    });
  }, [scene, renderConfig.wireframe, materialConfig]);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    if (autoRotate.enabled) {
      const rad = delta * autoRotate.speed;
      if (autoRotate.axis === "x") groupRef.current.rotation.x += rad;
      if (autoRotate.axis === "y") groupRef.current.rotation.y += rad;
      if (autoRotate.axis === "z") groupRef.current.rotation.z += rad;
    }
  });

  return (
    <group
      ref={groupRef}
      position={[transform.posX, transform.posY, transform.posZ]}
      rotation={[
        THREE.MathUtils.degToRad(transform.rotX),
        THREE.MathUtils.degToRad(transform.rotY),
        THREE.MathUtils.degToRad(transform.rotZ),
      ]}
      scale={transform.scale}
    >
      <primitive object={scene} />
    </group>
  );
}

useGLTF.preload(MODEL_NAME);

export default function ModelViewer() {
  // Set configs

  return (
    <div className="w-screen h-screen overflow-hidden fixed inset-0 a-z-10 bg-zinc-950 bg-[url('/background-blur.jpg')] bg-cover bg-center">
      <Canvas
        camera={{
          position: [D_CAMERA.posX, D_CAMERA.posY, D_CAMERA.posZ],
          fov: D_CAMERA.fov,
          near: D_CAMERA.near,
          far: D_CAMERA.far,
        }}
        gl={{ logarithmicDepthBuffer: true }}
        shadows={D_RENDER.shadowsEnabled}
      >
        <CameraController config={{ ...D_CAMERA, orbitEnabled: false }} />
        <RenderSettings config={D_RENDER} />
        <SceneLights
          ambient={D_AMBIENT}
          dir1={D_DIR1}
          dir2={D_DIR2}
          point={D_POINT}
          spot={D_SPOT}
          renderConfig={D_RENDER}
        />
        <Suspense fallback={null}>
          <Model
            transform={D_TRANSFORM}
            autoRotate={D_AUTO_ROTATE}
            renderConfig={D_RENDER}
            materialConfig={D_MATERIAL}
          />
          <Environment
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            preset={D_ENV.preset as any}
            background={D_ENV.showBackground && D_RENDER.useEnvBackground}
            backgroundBlurriness={D_ENV.backgroundBlur}
            environmentIntensity={D_ENV.envIntensity}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
