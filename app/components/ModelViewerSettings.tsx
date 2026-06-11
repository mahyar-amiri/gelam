"use client";

import { Suspense, useRef, useState, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, useGLTF, OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import {
  Transform,
  AutoRotate,
  AmbientLight,
  DirectionalLight,
  PointLight,
  SpotLight,
  EnvConfig,
  CameraConfig,
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
import {
  Divider,
  TransformSection,
  CameraSection,
  AmbientSection,
  DirLightSection,
  PointLightSection,
  SpotLightSection,
  EnvSection,
  RenderSection,
  MaterialSection,
} from "@/components/Controller";

// const MODEL_NAME = "/the_elder_wand.glb";
const MODEL_NAME = "/wooden_box.glb";

// Camera controller (imperative, inside Canvas)
function CameraController({ config }: { config: CameraConfig }) {
  const { camera } = useThree();

  useEffect(() => {
    const cam = camera as THREE.PerspectiveCamera;
    cam.fov = config.fov;
    cam.near = config.near;
    cam.far = config.far;
    cam.updateProjectionMatrix();
  }, [camera, config.fov, config.near, config.far]);

  useEffect(() => {
    if (!config.orbitEnabled) {
      camera.position.set(config.posX, config.posY, config.posZ);
      camera.lookAt(config.targetX, config.targetY, config.targetZ);
    }
  }, [
    camera,
    config.orbitEnabled,
    config.posX,
    config.posY,
    config.posZ,
    config.targetX,
    config.targetY,
    config.targetZ,
  ]);

  return null;
}

// Render settings (inside Canvas)
function RenderSettings({ config }: { config: RenderConfig }) {
  const { gl, scene } = useThree();

  useEffect(() => {
    const map: Record<string, THREE.ToneMapping> = {
      None: THREE.NoToneMapping,
      Linear: THREE.LinearToneMapping,
      Reinhard: THREE.ReinhardToneMapping,
      Cineon: THREE.CineonToneMapping,
      ACESFilmic: THREE.ACESFilmicToneMapping,
      AgX: (THREE as any).AgXToneMapping ?? THREE.ACESFilmicToneMapping,
      Neutral: (THREE as any).NeutralToneMapping ?? THREE.ACESFilmicToneMapping,
    };
    gl.toneMapping = map[config.toneMapping] ?? THREE.ACESFilmicToneMapping;
    gl.toneMappingExposure = config.toneMappingExposure;
  }, [gl, config.toneMapping, config.toneMappingExposure]);

  useEffect(() => {
    if (!config.useEnvBackground) {
      scene.background = new THREE.Color(config.backgroundColor);
    } else {
      scene.background = null;
    }
  }, [scene, config.useEnvBackground, config.backgroundColor]);

  useEffect(() => {
    if (config.fogEnabled) {
      scene.fog = new THREE.Fog(config.fogColor, config.fogNear, config.fogFar);
    } else {
      scene.fog = null;
    }
  }, [
    scene,
    config.fogEnabled,
    config.fogColor,
    config.fogNear,
    config.fogFar,
  ]);

  return null;
}

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

// Scene Lights
function SceneLights({
  ambient,
  dir1,
  dir2,
  point,
  spot,
  renderConfig,
}: {
  ambient: AmbientLight;
  dir1: DirectionalLight;
  dir2: DirectionalLight;
  point: PointLight;
  spot: SpotLight;
  renderConfig: RenderConfig;
}) {
  return (
    <>
      <ambientLight intensity={ambient.intensity} color={ambient.color} />

      {dir1.enabled && (
        <directionalLight
          position={[dir1.posX, dir1.posY, dir1.posZ]}
          intensity={dir1.intensity}
          color={dir1.color}
          castShadow={renderConfig.shadowsEnabled && dir1.castShadow}
        />
      )}
      {dir2.enabled && (
        <directionalLight
          position={[dir2.posX, dir2.posY, dir2.posZ]}
          intensity={dir2.intensity}
          color={dir2.color}
          castShadow={renderConfig.shadowsEnabled && dir2.castShadow}
        />
      )}
      {point.enabled && (
        <pointLight
          position={[point.posX, point.posY, point.posZ]}
          intensity={point.intensity}
          color={point.color}
          distance={point.distance}
          decay={point.decay}
        />
      )}
      {spot.enabled && (
        <spotLight
          position={[spot.posX, spot.posY, spot.posZ]}
          intensity={spot.intensity}
          color={spot.color}
          angle={spot.angle}
          penumbra={spot.penumbra}
          castShadow={renderConfig.shadowsEnabled}
        />
      )}
    </>
  );
}

useGLTF.preload(MODEL_NAME);

// Main Component
export default function ModelViewerSettings() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // State for all scene parameters
  const [transform, setTransform] = useState<Transform>(D_TRANSFORM);
  const [autoRotate, setAutoRotate] = useState<AutoRotate>(D_AUTO_ROTATE);
  const [ambient, setAmbient] = useState<AmbientLight>(D_AMBIENT);
  const [dir1, setDir1] = useState<DirectionalLight>(D_DIR1);
  const [dir2, setDir2] = useState<DirectionalLight>(D_DIR2);
  const [point, setPoint] = useState<PointLight>(D_POINT);
  const [spot, setSpot] = useState<SpotLight>(D_SPOT);
  const [env, setEnv] = useState<EnvConfig>(D_ENV);
  const [camera, setCamera] = useState<CameraConfig>(D_CAMERA);
  const [renderConfig, setRenderConfig] = useState<RenderConfig>(D_RENDER);
  const [material, setMaterial] = useState<MaterialOverride>(D_MATERIAL);

  function resetAll() {
    setTransform(D_TRANSFORM);
    setAutoRotate(D_AUTO_ROTATE);
    setAmbient(D_AMBIENT);
    setDir1(D_DIR1);
    setDir2(D_DIR2);
    setPoint(D_POINT);
    setSpot(D_SPOT);
    setEnv(D_ENV);
    setCamera(D_CAMERA);
    setRenderConfig(D_RENDER);
    setMaterial(D_MATERIAL);
  }

  return (
    <div className="fixed inset-0 flex bg-zinc-950 overflow-hidden">
      <div className="flex-1 relative">
        {/* Canvas */}
        <div className="absolute inset-0">
          <Canvas
            style={{ position: "relative" }}
            camera={{
              position: [D_CAMERA.posX, D_CAMERA.posY, D_CAMERA.posZ],
              fov: D_CAMERA.fov,
              near: D_CAMERA.near,
              far: D_CAMERA.far,
            }}
            gl={{ logarithmicDepthBuffer: true }}
            shadows={renderConfig.shadowsEnabled}
          >
            <CameraController config={camera} />
            <RenderSettings config={renderConfig} />
            <SceneLights
              ambient={ambient}
              dir1={dir1}
              dir2={dir2}
              point={point}
              spot={spot}
              renderConfig={renderConfig}
            />
            <Suspense fallback={null}>
              <Model
                transform={transform}
                autoRotate={autoRotate}
                renderConfig={renderConfig}
                materialConfig={material}
              />
              <Environment
                preset={env.preset as any}
                background={env.showBackground && renderConfig.useEnvBackground}
                backgroundBlurriness={env.backgroundBlur}
                environmentIntensity={env.envIntensity}
              />
            </Suspense>
            {camera.orbitEnabled && (
              <OrbitControls
                makeDefault
                minDistance={camera.minDistance}
                maxDistance={camera.maxDistance}
                minPolarAngle={THREE.MathUtils.degToRad(camera.minPolarAngle)}
                maxPolarAngle={THREE.MathUtils.degToRad(camera.maxPolarAngle)}
                enablePan={camera.enablePan}
                enableZoom={camera.enableZoom}
                autoRotate={camera.autoRotateOrbit}
                autoRotateSpeed={camera.autoRotateOrbitSpeed}
                dampingFactor={camera.dampingFactor}
                enableDamping
              />
            )}
          </Canvas>
        </div>

        {/* Sidebar toggle */}
        <button
          onClick={() => setSidebarOpen((s) => !s)}
          className="absolute top-4 right-4 z-20 flex items-center p-2 rounded-full bg-zinc-900/80 backdrop-blur border border-zinc-700 text-zinc-300 hover:text-amber-400 hover:border-amber-500/40 text-[11px] uppercase tracking-widest transition-colors duration-150 cursor-pointer"
        >
          <svg
            className={`size-3.5 transition-transform duration-300 ${sidebarOpen ? "rotate-0" : "rotate-180"}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
          {/* {sidebarOpen ? "Hide" : "Controls"} */}
        </button>
      </div>

      {/* Sidebar */}
      <div
        className={`relative shrink-0 overflow-hidden transition-all duration-300 ease-in-out
          ${sidebarOpen ? "w-60 pointer-events-auto" : "w-0 pointer-events-none"}
        `}
      >
        <div
          className="size-full flex flex-col bg-zinc-900 border-l border-zinc-800 scrollbar-thin"
          style={{
            scrollbarColor: "#3f3f46 transparent",
          }}
        >
          {/* Header */}
          <div className="px-4 py-3 border-b border-zinc-800 shrink-0 flex items-center justify-between">
            <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-semibold">
              Scene Controls
            </p>
            <button
              onClick={resetAll}
              className="text-[10px] uppercase tracking-wider text-zinc-600 hover:text-amber-400 transition-colors cursor-pointer"
            >
              Reset all
            </button>
          </div>

          {/* Scrollable body */}
          <div
            className="flex-1 overflow-y-auto py-1"
            style={{
              scrollbarWidth: "thin",
              scrollbarColor: "#3f3f46 transparent",
            }}
          >
            <TransformSection
              transform={transform}
              setTransform={setTransform}
              autoRotate={autoRotate}
              setAutoRotate={setAutoRotate}
            />
            <Divider />
            <CameraSection camera={camera} setCamera={setCamera} />
            <Divider />
            <AmbientSection light={ambient} setLight={setAmbient} />
            <Divider />
            <DirLightSection
              label="Dir Light 1"
              light={dir1}
              setLight={setDir1}
              defaults={D_DIR1}
            />
            <Divider />
            <DirLightSection
              label="Dir Light 2"
              light={dir2}
              setLight={setDir2}
              defaults={D_DIR2}
            />
            <Divider />
            <PointLightSection light={point} setLight={setPoint} />
            <Divider />
            <SpotLightSection light={spot} setLight={setSpot} />
            <Divider />
            <EnvSection env={env} setEnv={setEnv} />
            <Divider />
            <RenderSection config={renderConfig} setConfig={setRenderConfig} />
            <Divider />
            <MaterialSection config={material} setConfig={setMaterial} />
            <div className="h-6" />
          </div>
        </div>
      </div>
    </div>
  );
}
