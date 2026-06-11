"use client";

import { Suspense, useRef, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, useGLTF, OrbitControls } from "@react-three/drei";
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
    scene.traverse((obj: any) => {
      if (obj.isMesh && obj.material) {
        const mats = Array.isArray(obj.material)
          ? obj.material
          : [obj.material];
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
  D_CAMERA.orbitEnabled = false;

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
        <CameraController config={D_CAMERA} />
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
            preset={D_ENV.preset as any}
            background={D_ENV.showBackground && D_RENDER.useEnvBackground}
            backgroundBlurriness={D_ENV.backgroundBlur}
            environmentIntensity={D_ENV.envIntensity}
          />
        </Suspense>
        {D_CAMERA.orbitEnabled && (
          <OrbitControls
            makeDefault
            minDistance={D_CAMERA.minDistance}
            maxDistance={D_CAMERA.maxDistance}
            minPolarAngle={THREE.MathUtils.degToRad(D_CAMERA.minPolarAngle)}
            maxPolarAngle={THREE.MathUtils.degToRad(D_CAMERA.maxPolarAngle)}
            enablePan={D_CAMERA.enablePan}
            enableZoom={D_CAMERA.enableZoom}
            autoRotate={D_CAMERA.autoRotateOrbit}
            autoRotateSpeed={D_CAMERA.autoRotateOrbitSpeed}
            dampingFactor={D_CAMERA.dampingFactor}
            enableDamping
          />
        )}
      </Canvas>
    </div>
  );
}
