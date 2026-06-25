"use client";

import { Suspense, useRef, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  Environment,
  useGLTF,
  OrbitControls,
  useProgress,
} from "@react-three/drei";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { EffectComposer, DepthOfField } from "@react-three/postprocessing";
import * as THREE from "three";
import { useControls, folder, button, Leva } from "leva";
import { ModelUploaderSection } from "@/components/Controller";
import {
  CameraController,
  RenderSettings,
  SceneLights,
  SceneHelpers,
} from "@/utils/controller";
import {
  Transform,
  AutoRotate,
  AmbientLight,
  DirectionalLight,
  PointLight,
  SpotLight,
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
  D_DOF,
  D_RENDER,
  D_MATERIAL,
  ENV_PRESETS,
  TONE_MAPS,
  D_HELPERS,
} from "@/consts/controller";

function LoadingOverlay() {
  const { active, progress } = useProgress();

  if (!active) return null;

  return (
    <div className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none transition-opacity duration-300">
      <div className="flex flex-col items-center justify-center gap-3 bg-zinc-950/80 px-6 py-4 rounded-xl backdrop-blur-md border border-zinc-800 shadow-2xl">
        <div className="w-8 h-8 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
        <div className="text-blue-500 font-mono text-[11px] tracking-widest">
          {progress.toFixed(0)}%
        </div>
      </div>
    </div>
  );
}

function Model({
  url,
  transform,
  autoRotate,
  renderConfig,
  materialConfig,
  onModelClick,
}: {
  url: string;
  transform: Transform;
  autoRotate: AutoRotate;
  renderConfig: RenderConfig;
  materialConfig: MaterialOverride;
  onModelClick: (point: THREE.Vector3) => void;
}) {
  const { scene } = useGLTF(url);
  const groupRef = useRef<THREE.Group>(null);

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
      onPointerDown={(e) => {
        e.stopPropagation();
        onModelClick(e.point);
      }}
    >
      <primitive object={scene} />
    </group>
  );
}

export default function ModelViewerSettings() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeModelUrl, setActiveModelUrl] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("activeModelUrl");
    if (saved && saved !== activeModelUrl) {
      setActiveModelUrl(saved);
    }
  }, [activeModelUrl]);

  useEffect(() => {
    if (activeModelUrl) {
      localStorage.setItem("activeModelUrl", activeModelUrl);
    } else {
      localStorage.removeItem("activeModelUrl");
    }
  }, [activeModelUrl]);

  const [focusTarget, setFocusTarget] = useState<THREE.Vector3 | null>(null);

  const orbitRef = useRef<OrbitControlsImpl>(null);

  const [transform] = useControls(
    "Transform",
    () => ({
      posX: { value: D_TRANSFORM.posX, step: 0.01 },
      posY: { value: D_TRANSFORM.posY, step: 0.01 },
      posZ: { value: D_TRANSFORM.posZ, step: 0.01 },
      rotX: { value: D_TRANSFORM.rotX, step: 0.01 },
      rotY: { value: D_TRANSFORM.rotY, step: 0.01 },
      rotZ: { value: D_TRANSFORM.rotZ, step: 0.01 },
      scale: { value: D_TRANSFORM.scale, step: 0.01 },
      "Auto Rotate": folder(
        {
          autoRotateEnabled: D_AUTO_ROTATE.enabled,
          autoRotateSpeed: {
            value: D_AUTO_ROTATE.speed,
            min: 0.1,
            max: 20,
            step: 0.1,
          },
          autoRotateAxis: {
            options: ["x", "y", "z"],
            value: D_AUTO_ROTATE.axis,
          },
        },
        { collapsed: true },
      ),
    }),
    { collapsed: true },
  );

  const autoRotate = {
    enabled: transform.autoRotateEnabled,
    speed: transform.autoRotateSpeed,
    axis: transform.autoRotateAxis as "x" | "y" | "z",
  };

  const [camera, setCamera] = useControls(
    "Camera",
    () => ({
      fov: { value: D_CAMERA.fov, min: 1, max: 120, step: 1 },
      near: { value: D_CAMERA.near, min: 0.0001, step: 0.001 },
      far: { value: D_CAMERA.far, min: 1, step: 10 },
      orbitEnabled: D_CAMERA.orbitEnabled,
      enablePan: D_CAMERA.enablePan,
      enableZoom: D_CAMERA.enableZoom,
      autoRotateOrbit: D_CAMERA.autoRotateOrbit,
      autoRotateOrbitSpeed: {
        value: D_CAMERA.autoRotateOrbitSpeed,
        min: 0.5,
        max: 20,
        step: 0.5,
      },
      dampingFactor: {
        value: D_CAMERA.dampingFactor,
        min: 0.01,
        max: 0.5,
        step: 0.01,
      },
      minDistance: {
        value: D_CAMERA.minDistance,
        min: 0.001,
        max: 10,
        step: 0.001,
      },
      maxDistance: { value: D_CAMERA.maxDistance, min: 1, max: 200, step: 0.1 },
      minPolarAngle: {
        value: D_CAMERA.minPolarAngle,
        min: 0,
        max: 180,
        step: 0.1,
      },
      maxPolarAngle: {
        value: D_CAMERA.maxPolarAngle,
        min: 0,
        max: 180,
        step: 0.1,
      },
      posX: { value: D_CAMERA.posX, min: -20, max: 20, step: 0.001 },
      posY: { value: D_CAMERA.posY, min: -20, max: 20, step: 0.001 },
      posZ: { value: D_CAMERA.posZ, min: -20, max: 20, step: 0.001 },
      targetX: { value: D_CAMERA.targetX, min: -10, max: 10, step: 0.001 },
      targetY: { value: D_CAMERA.targetY, min: -10, max: 10, step: 0.001 },
      targetZ: { value: D_CAMERA.targetZ, min: -10, max: 10, step: 0.001 },
    }),
    { collapsed: true },
  );

  const [dof] = useControls(
    "Depth of Field",
    () => ({
      enabled: D_DOF.enabled,
      focalLength: {
        value: D_DOF.focalLength,
        min: 0.001,
        max: 0.1,
        step: 0.001,
      },
      bokehScale: { value: D_DOF.bokehScale, min: 0, max: 10, step: 0.1 },
      clearTarget: button(() => setFocusTarget(null)),
    }),
    { collapsed: true },
  );

  const [lights, setLights] = useControls(
    "Lights",
    () => ({
      "Ambient Light": folder(
        {
          ambientIntensity: {
            value: D_AMBIENT.intensity,
            min: 0,
            max: 5,
            step: 0.05,
          },
          ambientColor: D_AMBIENT.color,
        },
        { collapsed: true },
      ),
      "Directional Light 1": folder(
        {
          dir1Enabled: D_DIR1.enabled,
          dir1ShowHelper: D_DIR1.showHelper,
          dir1Intensity: {
            value: D_DIR1.intensity,
            min: 0,
            max: 20,
            step: 0.1,
          },
          dir1Color: D_DIR1.color,
          dir1PosX: { value: D_DIR1.posX, step: 0.001 },
          dir1PosY: { value: D_DIR1.posY, step: 0.001 },
          dir1PosZ: { value: D_DIR1.posZ, step: 0.001 },
          dir1CastShadow: D_DIR1.castShadow,
        },
        { collapsed: true },
      ),
      "Directional Light 2": folder(
        {
          dir2Enabled: D_DIR2.enabled,
          dir2ShowHelper: D_DIR2.showHelper,
          dir2Intensity: {
            value: D_DIR2.intensity,
            min: 0,
            max: 20,
            step: 0.1,
          },
          dir2Color: D_DIR2.color,
          dir2PosX: { value: D_DIR2.posX, step: 0.001 },
          dir2PosY: { value: D_DIR2.posY, step: 0.001 },
          dir2PosZ: { value: D_DIR2.posZ, step: 0.001 },
          dir2CastShadow: D_DIR2.castShadow,
        },
        { collapsed: true },
      ),
      "Point Light": folder(
        {
          pointEnabled: D_POINT.enabled,
          pointShowHelper: D_POINT.showHelper,
          pointIntensity: {
            value: D_POINT.intensity,
            min: 0,
            max: 20,
            step: 0.1,
          },
          pointColor: D_POINT.color,
          pointPosX: { value: D_POINT.posX, step: 0.001 },
          pointPosY: { value: D_POINT.posY, step: 0.001 },
          pointPosZ: { value: D_POINT.posZ, step: 0.001 },
          pointDistance: {
            value: D_POINT.distance,
            min: 0,
            max: 50,
            step: 0.5,
          },
          pointDecay: { value: D_POINT.decay, min: 0, max: 5, step: 0.05 },
        },
        { collapsed: true },
      ),
      "Spot Light": folder(
        {
          spotEnabled: D_SPOT.enabled,
          spotShowHelper: D_SPOT.showHelper,
          spotIntensity: {
            value: D_SPOT.intensity,
            min: 0,
            max: 50,
            step: 0.5,
          },
          spotColor: D_SPOT.color,
          spotPosX: { value: D_SPOT.posX, step: 0.001 },
          spotPosY: { value: D_SPOT.posY, step: 0.001 },
          spotPosZ: { value: D_SPOT.posZ, step: 0.001 },
          spotAngle: {
            value: D_SPOT.angle,
            min: 0,
            max: Math.PI / 2,
            step: 0.01,
          },
          spotPenumbra: { value: D_SPOT.penumbra, min: 0, max: 1, step: 0.01 },
        },
        { collapsed: true },
      ),
    }),
    { collapsed: true },
  );

  const ambient: AmbientLight = {
    intensity: lights.ambientIntensity,
    color: lights.ambientColor,
  };
  const dir1: DirectionalLight = {
    enabled: lights.dir1Enabled,
    showHelper: lights.dir1ShowHelper,
    intensity: lights.dir1Intensity,
    color: lights.dir1Color,
    posX: lights.dir1PosX,
    posY: lights.dir1PosY,
    posZ: lights.dir1PosZ,
    castShadow: lights.dir1CastShadow,
  };
  const dir2: DirectionalLight = {
    enabled: lights.dir2Enabled,
    showHelper: lights.dir2ShowHelper,
    intensity: lights.dir2Intensity,
    color: lights.dir2Color,
    posX: lights.dir2PosX,
    posY: lights.dir2PosY,
    posZ: lights.dir2PosZ,
    castShadow: lights.dir2CastShadow,
  };
  const point: PointLight = {
    enabled: lights.pointEnabled,
    showHelper: lights.pointShowHelper,
    intensity: lights.pointIntensity,
    color: lights.pointColor,
    posX: lights.pointPosX,
    posY: lights.pointPosY,
    posZ: lights.pointPosZ,
    distance: lights.pointDistance,
    decay: lights.pointDecay,
  };
  const spot: SpotLight = {
    enabled: lights.spotEnabled,
    showHelper: lights.spotShowHelper,
    intensity: lights.spotIntensity,
    color: lights.spotColor,
    posX: lights.spotPosX,
    posY: lights.spotPosY,
    posZ: lights.spotPosZ,
    angle: lights.spotAngle,
    penumbra: lights.spotPenumbra,
  };

  const [env] = useControls(
    "Environment",
    () => ({
      preset: { options: ENV_PRESETS, value: D_ENV.preset },
      showBackground: D_ENV.showBackground,
      backgroundBlur: {
        value: D_ENV.backgroundBlur,
        min: 0,
        max: 1,
        step: 0.01,
      },
      envIntensity: { value: D_ENV.envIntensity, min: 0, max: 5, step: 0.05 },
    }),
    { collapsed: true },
  );

  const [renderConfig] = useControls(
    "Render",
    () => ({
      toneMapping: { options: TONE_MAPS, value: D_RENDER.toneMapping },
      toneMappingExposure: {
        value: D_RENDER.toneMappingExposure,
        min: 0,
        max: 5,
        step: 0.05,
      },
      useEnvBackground: D_RENDER.useEnvBackground,
      backgroundColor: D_RENDER.backgroundColor,
      shadowsEnabled: D_RENDER.shadowsEnabled,
      fogEnabled: D_RENDER.fogEnabled,
      fogColor: D_RENDER.fogColor,
      fogNear: { value: D_RENDER.fogNear, min: 0, max: 50, step: 0.5 },
      fogFar: { value: D_RENDER.fogFar, min: 0, max: 200, step: 0.5 },
      wireframe: D_RENDER.wireframe,
    }),
    { collapsed: true },
  );

  const [material] = useControls(
    "Material Override",
    () => ({
      enabled: D_MATERIAL.enabled,
      color: D_MATERIAL.color,
      roughness: { value: D_MATERIAL.roughness, min: 0, max: 1, step: 0.01 },
      metalness: { value: D_MATERIAL.metalness, min: 0, max: 1, step: 0.01 },
      opacity: { value: D_MATERIAL.opacity, min: 0, max: 1, step: 0.01 },
      transparent: D_MATERIAL.transparent,
    }),
    { collapsed: true },
  );

  const [helpers] = useControls(
    "Helpers",
    () => ({
      "Grid Helper": folder(
        {
          gridEnabled: D_HELPERS.grid.enabled,
          gridSize: {
            value: D_HELPERS.grid.size,
            min: 0.1,
            max: 100,
            step: 0.1,
          },
          gridDivisions: {
            value: D_HELPERS.grid.divisions,
            min: 0.1,
            max: 100,
            step: 0.1,
          },
          gridColor1: D_HELPERS.grid.color1,
          gridColor2: D_HELPERS.grid.color2,
        },
        { collapsed: true },
      ),
      "Axes Helper": folder(
        {
          axesEnabled: D_HELPERS.axes.enabled,
          axesSize: {
            value: D_HELPERS.axes.size,
            min: 0.1,
            max: 100,
            step: 0.1,
          },
        },
        { collapsed: true },
      ),
      "Gizmo Helper": folder(
        {
          gizmoEnabled: D_HELPERS.gizmo.enabled,
          gizmoAlignment: {
            options: [
              "top-left",
              "top-right",
              "bottom-left",
              "bottom-right",
              "bottom-center",
              "top-center",
            ],
            value: D_HELPERS.gizmo.alignment,
          },
          gizmoType: {
            options: ["viewport", "viewcube"],
            value: D_HELPERS.gizmo.type,
          },
        },
        { collapsed: true },
      ),
    }),
    { collapsed: true },
  );

  return (
    <div className="fixed inset-0 flex bg-zinc-950 overflow-hidden">
      <div className="flex-1 relative">
        <Leva
          theme={{
            sizes: {
              rootWidth: "480px",
            },
          }}
        />
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
            <CameraController config={camera} orbitControlsRef={orbitRef} />
            <RenderSettings config={renderConfig} />
            <SceneHelpers
              config={{
                grid: {
                  enabled: helpers.gridEnabled,
                  size: helpers.gridSize,
                  divisions: helpers.gridDivisions,
                  color1: helpers.gridColor1,
                  color2: helpers.gridColor2,
                },
                axes: { enabled: helpers.axesEnabled, size: helpers.axesSize },
                gizmo: {
                  enabled: helpers.gizmoEnabled,
                  alignment: helpers.gizmoAlignment,
                  type: helpers.gizmoType as any,
                  margin: D_HELPERS.gizmo.margin,
                },
              }}
            />
            <SceneLights
              ambient={ambient}
              dir1={dir1}
              dir2={dir2}
              point={point}
              spot={spot}
              renderConfig={renderConfig}
              setLights={setLights}
            />
            <Suspense fallback={null}>
              {activeModelUrl && (
                <Model
                  url={activeModelUrl}
                  transform={transform}
                  autoRotate={autoRotate}
                  renderConfig={renderConfig}
                  materialConfig={material}
                  onModelClick={(point) => setFocusTarget(point)}
                />
              )}
              <Environment
                preset={env.preset as any}
                background={env.showBackground && renderConfig.useEnvBackground}
                backgroundBlurriness={env.backgroundBlur}
                environmentIntensity={env.envIntensity}
              />
            </Suspense>
            {dof.enabled && (
              <EffectComposer enableNormalPass={false}>
                <DepthOfField
                  target={focusTarget || undefined}
                  focalLength={dof.focalLength}
                  bokehScale={dof.bokehScale}
                  height={480}
                />
              </EffectComposer>
            )}
            {camera.orbitEnabled && (
              <OrbitControls
                ref={orbitRef}
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
                onChange={(e) => {
                  if (!e) return;
                  const target = e.target;
                  if (target.object) {
                    const pos = target.object.position;
                    const tgt = target.target;

                    if (
                      Math.abs(camera.posX - pos.x) > 0.01 ||
                      Math.abs(camera.posY - pos.y) > 0.01 ||
                      Math.abs(camera.posZ - pos.z) > 0.01 ||
                      Math.abs(camera.targetX - tgt.x) > 0.01 ||
                      Math.abs(camera.targetY - tgt.y) > 0.01 ||
                      Math.abs(camera.targetZ - tgt.z) > 0.01
                    ) {
                      setCamera({
                        posX: pos.x,
                        posY: pos.y,
                        posZ: pos.z,
                        targetX: tgt.x,
                        targetY: tgt.y,
                        targetZ: tgt.z,
                      });
                    }
                  }
                }}
              />
            )}
          </Canvas>
          <LoadingOverlay />
        </div>

        {/* Sidebar toggle */}
        <button
          onClick={() => setSidebarOpen((s) => !s)}
          className="absolute top-4 right-4 z-20 flex items-center p-2 rounded-full bg-zinc-900/80 backdrop-blur border border-zinc-700 text-zinc-300 hover:text-blue-400 hover:border-blue-500/40 text-[11px] uppercase tracking-widest transition-colors duration-150 cursor-pointer"
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
              Model Settings
            </p>
          </div>

          {/* Scrollable body */}
          <div
            className="flex-1 overflow-y-auto py-1"
            style={{
              scrollbarWidth: "thin",
              scrollbarColor: "#3f3f46 transparent",
            }}
          >
            <ModelUploaderSection
              selectedModel={activeModelUrl || ""}
              onSelectModel={setActiveModelUrl}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
