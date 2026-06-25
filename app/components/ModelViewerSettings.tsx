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
import { useControls, folder, button, useCreateStore, LevaPanel } from "leva";

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
  D_HELPERS,
  ENV_PRESETS,
  TONE_MAPS,
} from "@/consts/controller";
import { ModelUploaderSection } from "@/components/Controller";

function LoadingOverlay() {
  const { active, progress } = useProgress();

  if (!active) return null;

  return (
    <div className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none transition-opacity duration-300">
      <div className="flex flex-col items-center justify-center gap-3 bg-zinc-950/80 px-6 py-4 rounded-xl backdrop-blur-md border border-zinc-800 shadow-2xl">
        <div className="w-8 h-8 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin" />
        <div className="text-amber-500 font-mono text-[11px] tracking-widest">
          {progress.toFixed(0)}%
        </div>
      </div>
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
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
      // eslint-disable-next-line react-hooks/set-state-in-effect
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
  const store = useCreateStore();

  useControls(
    () => ({
      "Reset All": button(() => {
        store.setValueAtPath("Transform.posX", D_TRANSFORM.posX, true);
        store.setValueAtPath("Transform.posY", D_TRANSFORM.posY, true);
        store.setValueAtPath("Transform.posZ", D_TRANSFORM.posZ, true);
        store.setValueAtPath("Transform.rotX", D_TRANSFORM.rotX, true);
        store.setValueAtPath("Transform.rotY", D_TRANSFORM.rotY, true);
        store.setValueAtPath("Transform.rotZ", D_TRANSFORM.rotZ, true);
        store.setValueAtPath("Transform.scale", D_TRANSFORM.scale, true);
        store.setValueAtPath("Transform.Auto Rotate.autoRotateEnabled", D_AUTO_ROTATE.enabled, true);
        store.setValueAtPath("Transform.Auto Rotate.autoRotateSpeed", D_AUTO_ROTATE.speed, true);
        store.setValueAtPath("Transform.Auto Rotate.autoRotateAxis", D_AUTO_ROTATE.axis, true);

        store.setValueAtPath("Camera.fov", D_CAMERA.fov, true);
        store.setValueAtPath("Camera.near", D_CAMERA.near, true);
        store.setValueAtPath("Camera.far", D_CAMERA.far, true);
        store.setValueAtPath("Camera.orbitEnabled", D_CAMERA.orbitEnabled, true);
        store.setValueAtPath("Camera.enablePan", D_CAMERA.enablePan, true);
        store.setValueAtPath("Camera.enableZoom", D_CAMERA.enableZoom, true);
        store.setValueAtPath("Camera.autoRotateOrbit", D_CAMERA.autoRotateOrbit, true);
        store.setValueAtPath("Camera.autoRotateOrbitSpeed", D_CAMERA.autoRotateOrbitSpeed, true);
        store.setValueAtPath("Camera.minDistance", D_CAMERA.minDistance, true);
        store.setValueAtPath("Camera.maxDistance", D_CAMERA.maxDistance, true);
        store.setValueAtPath("Camera.minPolarAngle", D_CAMERA.minPolarAngle, true);
        store.setValueAtPath("Camera.maxPolarAngle", D_CAMERA.maxPolarAngle, true);
        store.setValueAtPath("Camera.dampingFactor", D_CAMERA.dampingFactor, true);
        store.setValueAtPath("Camera.posX", D_CAMERA.posX, true);
        store.setValueAtPath("Camera.posY", D_CAMERA.posY, true);
        store.setValueAtPath("Camera.posZ", D_CAMERA.posZ, true);
        store.setValueAtPath("Camera.targetX", D_CAMERA.targetX, true);
        store.setValueAtPath("Camera.targetY", D_CAMERA.targetY, true);
        store.setValueAtPath("Camera.targetZ", D_CAMERA.targetZ, true);

        store.setValueAtPath("Depth of Field.enabled", D_DOF.enabled, true);
        store.setValueAtPath("Depth of Field.focalLength", D_DOF.focalLength, true);
        store.setValueAtPath("Depth of Field.bokehScale", D_DOF.bokehScale, true);

        store.setValueAtPath("Lights.Ambient Light.ambientIntensity", D_AMBIENT.intensity, true);
        store.setValueAtPath("Lights.Ambient Light.ambientColor", D_AMBIENT.color, true);

        store.setValueAtPath("Lights.Directional Light 1.dir1Enabled", D_DIR1.enabled, true);
        store.setValueAtPath("Lights.Directional Light 1.dir1ShowHelper", D_DIR1.showHelper, true);
        store.setValueAtPath("Lights.Directional Light 1.dir1Intensity", D_DIR1.intensity, true);
        store.setValueAtPath("Lights.Directional Light 1.dir1Color", D_DIR1.color, true);
        store.setValueAtPath("Lights.Directional Light 1.dir1PosX", D_DIR1.posX, true);
        store.setValueAtPath("Lights.Directional Light 1.dir1PosY", D_DIR1.posY, true);
        store.setValueAtPath("Lights.Directional Light 1.dir1PosZ", D_DIR1.posZ, true);
        store.setValueAtPath("Lights.Directional Light 1.dir1CastShadow", D_DIR1.castShadow, true);

        store.setValueAtPath("Lights.Directional Light 2.dir2Enabled", D_DIR2.enabled, true);
        store.setValueAtPath("Lights.Directional Light 2.dir2ShowHelper", D_DIR2.showHelper, true);
        store.setValueAtPath("Lights.Directional Light 2.dir2Intensity", D_DIR2.intensity, true);
        store.setValueAtPath("Lights.Directional Light 2.dir2Color", D_DIR2.color, true);
        store.setValueAtPath("Lights.Directional Light 2.dir2PosX", D_DIR2.posX, true);
        store.setValueAtPath("Lights.Directional Light 2.dir2PosY", D_DIR2.posY, true);
        store.setValueAtPath("Lights.Directional Light 2.dir2PosZ", D_DIR2.posZ, true);
        store.setValueAtPath("Lights.Directional Light 2.dir2CastShadow", D_DIR2.castShadow, true);

        store.setValueAtPath("Lights.Point Light.pointEnabled", D_POINT.enabled, true);
        store.setValueAtPath("Lights.Point Light.pointShowHelper", D_POINT.showHelper, true);
        store.setValueAtPath("Lights.Point Light.pointIntensity", D_POINT.intensity, true);
        store.setValueAtPath("Lights.Point Light.pointColor", D_POINT.color, true);
        store.setValueAtPath("Lights.Point Light.pointPosX", D_POINT.posX, true);
        store.setValueAtPath("Lights.Point Light.pointPosY", D_POINT.posY, true);
        store.setValueAtPath("Lights.Point Light.pointPosZ", D_POINT.posZ, true);
        store.setValueAtPath("Lights.Point Light.pointDistance", D_POINT.distance, true);
        store.setValueAtPath("Lights.Point Light.pointDecay", D_POINT.decay, true);

        store.setValueAtPath("Lights.Spot Light.spotEnabled", D_SPOT.enabled, true);
        store.setValueAtPath("Lights.Spot Light.spotShowHelper", D_SPOT.showHelper, true);
        store.setValueAtPath("Lights.Spot Light.spotIntensity", D_SPOT.intensity, true);
        store.setValueAtPath("Lights.Spot Light.spotColor", D_SPOT.color, true);
        store.setValueAtPath("Lights.Spot Light.spotPosX", D_SPOT.posX, true);
        store.setValueAtPath("Lights.Spot Light.spotPosY", D_SPOT.posY, true);
        store.setValueAtPath("Lights.Spot Light.spotPosZ", D_SPOT.posZ, true);
        store.setValueAtPath("Lights.Spot Light.spotAngle", D_SPOT.angle, true);
        store.setValueAtPath("Lights.Spot Light.spotPenumbra", D_SPOT.penumbra, true);

        store.setValueAtPath("Environment.preset", D_ENV.preset, true);
        store.setValueAtPath("Environment.showBackground", D_ENV.showBackground, true);
        store.setValueAtPath("Environment.backgroundBlur", D_ENV.backgroundBlur, true);
        store.setValueAtPath("Environment.envIntensity", D_ENV.envIntensity, true);

        store.setValueAtPath("Render.toneMapping", D_RENDER.toneMapping, true);
        store.setValueAtPath("Render.toneMappingExposure", D_RENDER.toneMappingExposure, true);
        store.setValueAtPath("Render.useEnvBackground", D_RENDER.useEnvBackground, true);
        store.setValueAtPath("Render.backgroundColor", D_RENDER.backgroundColor, true);
        store.setValueAtPath("Render.shadowsEnabled", D_RENDER.shadowsEnabled, true);
        store.setValueAtPath("Render.fogEnabled", D_RENDER.fogEnabled, true);
        store.setValueAtPath("Render.fogColor", D_RENDER.fogColor, true);
        store.setValueAtPath("Render.fogNear", D_RENDER.fogNear, true);
        store.setValueAtPath("Render.fogFar", D_RENDER.fogFar, true);
        store.setValueAtPath("Render.wireframe", D_RENDER.wireframe, true);

        store.setValueAtPath("Material Override.enabled", D_MATERIAL.enabled, true);
        store.setValueAtPath("Material Override.color", D_MATERIAL.color, true);
        store.setValueAtPath("Material Override.roughness", D_MATERIAL.roughness, true);
        store.setValueAtPath("Material Override.metalness", D_MATERIAL.metalness, true);
        store.setValueAtPath("Material Override.opacity", D_MATERIAL.opacity, true);
        store.setValueAtPath("Material Override.transparent", D_MATERIAL.transparent, true);

        store.setValueAtPath("Helpers.Grid Helper.gridEnabled", D_HELPERS.grid.enabled, true);
        store.setValueAtPath("Helpers.Grid Helper.gridSize", D_HELPERS.grid.size, true);
        store.setValueAtPath("Helpers.Grid Helper.gridDivisions", D_HELPERS.grid.divisions, true);
        store.setValueAtPath("Helpers.Grid Helper.gridColor1", D_HELPERS.grid.color1, true);
        store.setValueAtPath("Helpers.Grid Helper.gridColor2", D_HELPERS.grid.color2, true);

        store.setValueAtPath("Helpers.Axes Helper.axesEnabled", D_HELPERS.axes.enabled, true);
        store.setValueAtPath("Helpers.Axes Helper.axesSize", D_HELPERS.axes.size, true);

        store.setValueAtPath("Helpers.Gizmo Helper.gizmoEnabled", D_HELPERS.gizmo.enabled, true);
        store.setValueAtPath("Helpers.Gizmo Helper.gizmoAlignment", D_HELPERS.gizmo.alignment, true);
        store.setValueAtPath("Helpers.Gizmo Helper.gizmoType", D_HELPERS.gizmo.type, true);
      })
    }),
    { store }
  );

  const [transform] = useControls(
    "Transform",
    () => ({
      "Reset Transform": button(() => {
        store.setValueAtPath("Transform.posX", D_TRANSFORM.posX, true);
        store.setValueAtPath("Transform.posY", D_TRANSFORM.posY, true);
        store.setValueAtPath("Transform.posZ", D_TRANSFORM.posZ, true);
        store.setValueAtPath("Transform.rotX", D_TRANSFORM.rotX, true);
        store.setValueAtPath("Transform.rotY", D_TRANSFORM.rotY, true);
        store.setValueAtPath("Transform.rotZ", D_TRANSFORM.rotZ, true);
        store.setValueAtPath("Transform.scale", D_TRANSFORM.scale, true);
        store.setValueAtPath("Transform.Auto Rotate.autoRotateEnabled", D_AUTO_ROTATE.enabled, true);
        store.setValueAtPath("Transform.Auto Rotate.autoRotateSpeed", D_AUTO_ROTATE.speed, true);
        store.setValueAtPath("Transform.Auto Rotate.autoRotateAxis", D_AUTO_ROTATE.axis, true);
      }),
      posX: { value: D_TRANSFORM.posX, min: -5, max: 5, step: 0.001 },
      posY: { value: D_TRANSFORM.posY, min: -5, max: 5, step: 0.001 },
      posZ: { value: D_TRANSFORM.posZ, min: -5, max: 5, step: 0.001 },
      rotX: { value: D_TRANSFORM.rotX, min: -180, max: 180, step: 0.001 },
      rotY: { value: D_TRANSFORM.rotY, min: -180, max: 180, step: 0.001 },
      rotZ: { value: D_TRANSFORM.rotZ, min: -180, max: 180, step: 0.001 },
      scale: { value: D_TRANSFORM.scale, min: 0.01, max: 10, step: 0.001 },
      "Auto Rotate": folder(
        {
          autoRotateEnabled: D_AUTO_ROTATE.enabled,
          autoRotateSpeed: {
            value: D_AUTO_ROTATE.speed,
            min: 0.1,
            max: 10,
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
    { store, collapsed: true },
  );

  const autoRotate = {
    enabled: transform.autoRotateEnabled,
    speed: transform.autoRotateSpeed,
    axis: transform.autoRotateAxis as "x" | "y" | "z",
  };

  const [camera] = useControls(
    "Camera",
    () => ({
      "Reset Camera": button(() => {
        store.setValueAtPath("Camera.fov", D_CAMERA.fov, true);
        store.setValueAtPath("Camera.near", D_CAMERA.near, true);
        store.setValueAtPath("Camera.far", D_CAMERA.far, true);
        store.setValueAtPath("Camera.orbitEnabled", D_CAMERA.orbitEnabled, true);
        store.setValueAtPath("Camera.enablePan", D_CAMERA.enablePan, true);
        store.setValueAtPath("Camera.enableZoom", D_CAMERA.enableZoom, true);
        store.setValueAtPath("Camera.autoRotateOrbit", D_CAMERA.autoRotateOrbit, true);
        store.setValueAtPath("Camera.autoRotateOrbitSpeed", D_CAMERA.autoRotateOrbitSpeed, true);
        store.setValueAtPath("Camera.minDistance", D_CAMERA.minDistance, true);
        store.setValueAtPath("Camera.maxDistance", D_CAMERA.maxDistance, true);
        store.setValueAtPath("Camera.minPolarAngle", D_CAMERA.minPolarAngle, true);
        store.setValueAtPath("Camera.maxPolarAngle", D_CAMERA.maxPolarAngle, true);
        store.setValueAtPath("Camera.dampingFactor", D_CAMERA.dampingFactor, true);
        store.setValueAtPath("Camera.posX", D_CAMERA.posX, true);
        store.setValueAtPath("Camera.posY", D_CAMERA.posY, true);
        store.setValueAtPath("Camera.posZ", D_CAMERA.posZ, true);
        store.setValueAtPath("Camera.targetX", D_CAMERA.targetX, true);
        store.setValueAtPath("Camera.targetY", D_CAMERA.targetY, true);
        store.setValueAtPath("Camera.targetZ", D_CAMERA.targetZ, true);
      }),
      fov: { value: D_CAMERA.fov, min: 10, max: 120, step: 1 },
      near: { value: D_CAMERA.near, min: 0.0001, step: 0.001 },
      far: { value: D_CAMERA.far, min: 1, step: 10 },
      orbitEnabled: D_CAMERA.orbitEnabled,
      enablePan: D_CAMERA.enablePan,
      enableZoom: D_CAMERA.enableZoom,
      autoRotateOrbit: D_CAMERA.autoRotateOrbit,
      autoRotateOrbitSpeed: {
        value: D_CAMERA.autoRotateOrbitSpeed,
        min: 0.1,
        max: 10,
        step: 0.1,
      },
      minDistance: {
        value: D_CAMERA.minDistance,
        min: 0.001,
        max: 10,
        step: 0.01,
      },
      maxDistance: { value: D_CAMERA.maxDistance, min: 1, max: 100, step: 1 },
      minPolarAngle: {
        value: D_CAMERA.minPolarAngle,
        min: 0,
        max: 180,
        step: 1,
      },
      maxPolarAngle: {
        value: D_CAMERA.maxPolarAngle,
        min: 0,
        max: 180,
        step: 1,
      },
      dampingFactor: {
        value: D_CAMERA.dampingFactor,
        min: 0.01,
        max: 1,
        step: 0.01,
      },
      posX: { value: D_CAMERA.posX, min: -10, max: 10, step: 0.001 },
      posY: { value: D_CAMERA.posY, min: -10, max: 10, step: 0.001 },
      posZ: { value: D_CAMERA.posZ, min: -10, max: 10, step: 0.001 },
      targetX: { value: D_CAMERA.targetX, min: -10, max: 10, step: 0.001 },
      targetY: { value: D_CAMERA.targetY, min: -10, max: 10, step: 0.001 },
      targetZ: { value: D_CAMERA.targetZ, min: -10, max: 10, step: 0.001 },
    }),
    { store, collapsed: true },
  );

  const [dof] = useControls(
    "Depth of Field",
    () => ({
      "Reset DOF": button(() => {
        store.setValueAtPath("Depth of Field.enabled", D_DOF.enabled, true);
        store.setValueAtPath("Depth of Field.focalLength", D_DOF.focalLength, true);
        store.setValueAtPath("Depth of Field.bokehScale", D_DOF.bokehScale, true);
      }),
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
    { store, collapsed: true },
  );

  const [lights] = useControls(
    "Lights",
    () => ({
      "Reset Lights": button(() => {
        store.setValueAtPath("Lights.Ambient Light.ambientIntensity", D_AMBIENT.intensity, true);
        store.setValueAtPath("Lights.Ambient Light.ambientColor", D_AMBIENT.color, true);

        store.setValueAtPath("Lights.Directional Light 1.dir1Enabled", D_DIR1.enabled, true);
        store.setValueAtPath("Lights.Directional Light 1.dir1ShowHelper", D_DIR1.showHelper, true);
        store.setValueAtPath("Lights.Directional Light 1.dir1Intensity", D_DIR1.intensity, true);
        store.setValueAtPath("Lights.Directional Light 1.dir1Color", D_DIR1.color, true);
        store.setValueAtPath("Lights.Directional Light 1.dir1PosX", D_DIR1.posX, true);
        store.setValueAtPath("Lights.Directional Light 1.dir1PosY", D_DIR1.posY, true);
        store.setValueAtPath("Lights.Directional Light 1.dir1PosZ", D_DIR1.posZ, true);
        store.setValueAtPath("Lights.Directional Light 1.dir1CastShadow", D_DIR1.castShadow, true);

        store.setValueAtPath("Lights.Directional Light 2.dir2Enabled", D_DIR2.enabled, true);
        store.setValueAtPath("Lights.Directional Light 2.dir2ShowHelper", D_DIR2.showHelper, true);
        store.setValueAtPath("Lights.Directional Light 2.dir2Intensity", D_DIR2.intensity, true);
        store.setValueAtPath("Lights.Directional Light 2.dir2Color", D_DIR2.color, true);
        store.setValueAtPath("Lights.Directional Light 2.dir2PosX", D_DIR2.posX, true);
        store.setValueAtPath("Lights.Directional Light 2.dir2PosY", D_DIR2.posY, true);
        store.setValueAtPath("Lights.Directional Light 2.dir2PosZ", D_DIR2.posZ, true);
        store.setValueAtPath("Lights.Directional Light 2.dir2CastShadow", D_DIR2.castShadow, true);

        store.setValueAtPath("Lights.Point Light.pointEnabled", D_POINT.enabled, true);
        store.setValueAtPath("Lights.Point Light.pointShowHelper", D_POINT.showHelper, true);
        store.setValueAtPath("Lights.Point Light.pointIntensity", D_POINT.intensity, true);
        store.setValueAtPath("Lights.Point Light.pointColor", D_POINT.color, true);
        store.setValueAtPath("Lights.Point Light.pointPosX", D_POINT.posX, true);
        store.setValueAtPath("Lights.Point Light.pointPosY", D_POINT.posY, true);
        store.setValueAtPath("Lights.Point Light.pointPosZ", D_POINT.posZ, true);
        store.setValueAtPath("Lights.Point Light.pointDistance", D_POINT.distance, true);
        store.setValueAtPath("Lights.Point Light.pointDecay", D_POINT.decay, true);

        store.setValueAtPath("Lights.Spot Light.spotEnabled", D_SPOT.enabled, true);
        store.setValueAtPath("Lights.Spot Light.spotShowHelper", D_SPOT.showHelper, true);
        store.setValueAtPath("Lights.Spot Light.spotIntensity", D_SPOT.intensity, true);
        store.setValueAtPath("Lights.Spot Light.spotColor", D_SPOT.color, true);
        store.setValueAtPath("Lights.Spot Light.spotPosX", D_SPOT.posX, true);
        store.setValueAtPath("Lights.Spot Light.spotPosY", D_SPOT.posY, true);
        store.setValueAtPath("Lights.Spot Light.spotPosZ", D_SPOT.posZ, true);
        store.setValueAtPath("Lights.Spot Light.spotAngle", D_SPOT.angle, true);
        store.setValueAtPath("Lights.Spot Light.spotPenumbra", D_SPOT.penumbra, true);
      }),
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
            max: 10,
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
            max: 10,
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
            max: 50,
            step: 0.5,
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
            step: 0.001,
          },
          spotPenumbra: { value: D_SPOT.penumbra, min: 0, max: 1, step: 0.01 },
        },
        { collapsed: true },
      ),
    }),
    { store, collapsed: true },
  );

  const ambient: AmbientLight = {
    intensity: lights.ambientIntensity,
    color: lights.ambientColor,
  };
  const dir1: DirectionalLight = {
    enabled: lights.dir1Enabled,
    intensity: lights.dir1Intensity,
    color: lights.dir1Color,
    posX: lights.dir1PosX,
    posY: lights.dir1PosY,
    posZ: lights.dir1PosZ,
    castShadow: lights.dir1CastShadow,
    showHelper: lights.dir1ShowHelper,
  };
  const dir2: DirectionalLight = {
    enabled: lights.dir2Enabled,
    intensity: lights.dir2Intensity,
    color: lights.dir2Color,
    posX: lights.dir2PosX,
    posY: lights.dir2PosY,
    posZ: lights.dir2PosZ,
    castShadow: lights.dir2CastShadow,
    showHelper: lights.dir2ShowHelper,
  };
  const point: PointLight = {
    enabled: lights.pointEnabled,
    intensity: lights.pointIntensity,
    color: lights.pointColor,
    posX: lights.pointPosX,
    posY: lights.pointPosY,
    posZ: lights.pointPosZ,
    distance: lights.pointDistance,
    decay: lights.pointDecay,
    showHelper: lights.pointShowHelper,
  };
  const spot: SpotLight = {
    enabled: lights.spotEnabled,
    intensity: lights.spotIntensity,
    color: lights.spotColor,
    posX: lights.spotPosX,
    posY: lights.spotPosY,
    posZ: lights.spotPosZ,
    angle: lights.spotAngle,
    penumbra: lights.spotPenumbra,
    showHelper: lights.spotShowHelper,
  };

  const [env] = useControls(
    "Environment",
    () => ({
      "Reset Environment": button(() => {
        store.setValueAtPath("Environment.preset", D_ENV.preset, true);
        store.setValueAtPath("Environment.showBackground", D_ENV.showBackground, true);
        store.setValueAtPath("Environment.backgroundBlur", D_ENV.backgroundBlur, true);
        store.setValueAtPath("Environment.envIntensity", D_ENV.envIntensity, true);
      }),
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
    { store, collapsed: true },
  );

  const [renderConfig] = useControls(
    "Render",
    () => ({
      "Reset Render": button(() => {
        store.setValueAtPath("Render.toneMapping", D_RENDER.toneMapping, true);
        store.setValueAtPath("Render.toneMappingExposure", D_RENDER.toneMappingExposure, true);
        store.setValueAtPath("Render.useEnvBackground", D_RENDER.useEnvBackground, true);
        store.setValueAtPath("Render.backgroundColor", D_RENDER.backgroundColor, true);
        store.setValueAtPath("Render.shadowsEnabled", D_RENDER.shadowsEnabled, true);
        store.setValueAtPath("Render.fogEnabled", D_RENDER.fogEnabled, true);
        store.setValueAtPath("Render.fogColor", D_RENDER.fogColor, true);
        store.setValueAtPath("Render.fogNear", D_RENDER.fogNear, true);
        store.setValueAtPath("Render.fogFar", D_RENDER.fogFar, true);
        store.setValueAtPath("Render.wireframe", D_RENDER.wireframe, true);
      }),
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
      fogFar: { value: D_RENDER.fogFar, min: 0, max: 200, step: 1 },
      wireframe: D_RENDER.wireframe,
    }),
    { store, collapsed: true },
  );

  const [material] = useControls(
    "Material Override",
    () => ({
      "Reset Material": button(() => {
        store.setValueAtPath("Material Override.enabled", D_MATERIAL.enabled, true);
        store.setValueAtPath("Material Override.color", D_MATERIAL.color, true);
        store.setValueAtPath("Material Override.roughness", D_MATERIAL.roughness, true);
        store.setValueAtPath("Material Override.metalness", D_MATERIAL.metalness, true);
        store.setValueAtPath("Material Override.opacity", D_MATERIAL.opacity, true);
        store.setValueAtPath("Material Override.transparent", D_MATERIAL.transparent, true);
      }),
      enabled: D_MATERIAL.enabled,
      color: D_MATERIAL.color,
      roughness: { value: D_MATERIAL.roughness, min: 0, max: 1, step: 0.01 },
      metalness: { value: D_MATERIAL.metalness, min: 0, max: 1, step: 0.01 },
      opacity: { value: D_MATERIAL.opacity, min: 0, max: 1, step: 0.01 },
      transparent: D_MATERIAL.transparent,
    }),
    { store, collapsed: true },
  );

  const [helpers] = useControls(
    "Helpers",
    () => ({
      "Reset Helpers": button(() => {
        store.setValueAtPath("Helpers.Grid Helper.gridEnabled", D_HELPERS.grid.enabled, true);
        store.setValueAtPath("Helpers.Grid Helper.gridSize", D_HELPERS.grid.size, true);
        store.setValueAtPath("Helpers.Grid Helper.gridDivisions", D_HELPERS.grid.divisions, true);
        store.setValueAtPath("Helpers.Grid Helper.gridColor1", D_HELPERS.grid.color1, true);
        store.setValueAtPath("Helpers.Grid Helper.gridColor2", D_HELPERS.grid.color2, true);

        store.setValueAtPath("Helpers.Axes Helper.axesEnabled", D_HELPERS.axes.enabled, true);
        store.setValueAtPath("Helpers.Axes Helper.axesSize", D_HELPERS.axes.size, true);

        store.setValueAtPath("Helpers.Gizmo Helper.gizmoEnabled", D_HELPERS.gizmo.enabled, true);
        store.setValueAtPath("Helpers.Gizmo Helper.gizmoAlignment", D_HELPERS.gizmo.alignment, true);
        store.setValueAtPath("Helpers.Gizmo Helper.gizmoType", D_HELPERS.gizmo.type, true);
      }),
      "Grid Helper": folder({
        gridEnabled: D_HELPERS.grid.enabled,
        gridSize: { value: D_HELPERS.grid.size, min: 1, max: 100, step: 1 },
        gridDivisions: { value: D_HELPERS.grid.divisions, min: 1, max: 100, step: 1 },
        gridColor1: D_HELPERS.grid.color1,
        gridColor2: D_HELPERS.grid.color2,
      }, { collapsed: true }),
      "Axes Helper": folder({
        axesEnabled: D_HELPERS.axes.enabled,
        axesSize: { value: D_HELPERS.axes.size, min: 1, max: 100, step: 1 },
      }, { collapsed: true }),
      "Gizmo Helper": folder({
        gizmoEnabled: D_HELPERS.gizmo.enabled,
        gizmoAlignment: { options: ["top-left", "top-right", "bottom-left", "bottom-right", "bottom-center", "top-center"], value: D_HELPERS.gizmo.alignment },
        gizmoType: { options: ["viewport", "viewcube"], value: D_HELPERS.gizmo.type },
      }, { collapsed: true })
    }),
    { store, collapsed: true },
  );

  return (
    <div className="fixed inset-0 flex bg-zinc-950 overflow-hidden">
      <style dangerouslySetInnerHTML={{__html: `
        :root {
          --leva-sizes-rootWidth: 480px;
        }
        .leva-c-hHqakV {
           max-height: 60vh !important;
           overflow-y: auto !important;
           overflow-x: hidden !important;
        }
      `}} />
      <div className="flex-1 relative">
        {/* Leva wrapper to constrain height/scroll safely */}
        <div style={{ position: "absolute", top: 10, right: 10, zIndex: 100, width: 480, maxHeight: "60vh", overflowY: "auto", overflowX: "hidden" }}>
          <LevaPanel
            store={store}
            fill
            theme={{
              sizes: {
                rootWidth: "100%",
                controlWidth: "160px",
              },
              colors: {
                elevation1: "#18181b",
                elevation2: "#27272a",
                elevation3: "#3f3f46",
                accent1: "#f59e0b",
                accent2: "#d97706",
                accent3: "#b45309",
                highlight1: "#fcd34d",
                highlight2: "#f59e0b",
                highlight3: "#d97706",
                vivid1: "#fbbf24",
                folderWidgetColor: "#a1a1aa",
                folderTextColor: "#d4d4d8",
                toolTipBackground: "#27272a",
                toolTipText: "#e4e4e7",
              },
            }}
          />
        </div>
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
            <SceneHelpers config={{
              grid: { enabled: helpers.gridEnabled, size: helpers.gridSize, divisions: helpers.gridDivisions, color1: helpers.gridColor1, color2: helpers.gridColor2 },
              axes: { enabled: helpers.axesEnabled, size: helpers.axesSize },
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              gizmo: { enabled: helpers.gizmoEnabled, alignment: helpers.gizmoAlignment, type: helpers.gizmoType as any, margin: D_HELPERS.gizmo.margin }
            }} />
            <SceneLights
              ambient={ambient}
              dir1={dir1}
              dir2={dir2}
              point={point}
              spot={spot}
              renderConfig={renderConfig}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              setLights={(l: any) => {
                if (l.dir1PosX !== undefined) store.setValueAtPath("Lights.Directional Light 1.dir1PosX", l.dir1PosX, true);
                if (l.dir1PosY !== undefined) store.setValueAtPath("Lights.Directional Light 1.dir1PosY", l.dir1PosY, true);
                if (l.dir1PosZ !== undefined) store.setValueAtPath("Lights.Directional Light 1.dir1PosZ", l.dir1PosZ, true);

                if (l.dir2PosX !== undefined) store.setValueAtPath("Lights.Directional Light 2.dir2PosX", l.dir2PosX, true);
                if (l.dir2PosY !== undefined) store.setValueAtPath("Lights.Directional Light 2.dir2PosY", l.dir2PosY, true);
                if (l.dir2PosZ !== undefined) store.setValueAtPath("Lights.Directional Light 2.dir2PosZ", l.dir2PosZ, true);

                if (l.pointPosX !== undefined) store.setValueAtPath("Lights.Point Light.pointPosX", l.pointPosX, true);
                if (l.pointPosY !== undefined) store.setValueAtPath("Lights.Point Light.pointPosY", l.pointPosY, true);
                if (l.pointPosZ !== undefined) store.setValueAtPath("Lights.Point Light.pointPosZ", l.pointPosZ, true);

                if (l.spotPosX !== undefined) store.setValueAtPath("Lights.Spot Light.spotPosX", l.spotPosX, true);
                if (l.spotPosY !== undefined) store.setValueAtPath("Lights.Spot Light.spotPosY", l.spotPosY, true);
                if (l.spotPosZ !== undefined) store.setValueAtPath("Lights.Spot Light.spotPosZ", l.spotPosZ, true);
              }}
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
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
                      store.setValueAtPath("Camera.posX", pos.x, true);
                      store.setValueAtPath("Camera.posY", pos.y, true);
                      store.setValueAtPath("Camera.posZ", pos.z, true);
                      store.setValueAtPath("Camera.targetX", tgt.x, true);
                      store.setValueAtPath("Camera.targetY", tgt.y, true);
                      store.setValueAtPath("Camera.targetZ", tgt.z, true);
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
