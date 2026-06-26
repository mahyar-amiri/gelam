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
  AmbientLight,
  DirectionalLight,
  PointLight,
  SpotLight,
  RenderConfig,
  MaterialOverride,
} from "@/types/controller";
import {
  D_TRANSFORM,
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
  renderConfig,
  materialConfig,
  onModelClick,
}: {
  url: string;
  transform: Transform;
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

  return (
    <group
      ref={groupRef}
      position={[
        transform.position.x,
        transform.position.y,
        transform.position.z,
      ]}
      rotation={[
        THREE.MathUtils.degToRad(transform.rotation.x),
        THREE.MathUtils.degToRad(transform.rotation.y),
        THREE.MathUtils.degToRad(transform.rotation.z),
      ]}
      scale={[transform.scale.x, transform.scale.y, transform.scale.z]}
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

  const setters = useRef<any>({});

  // Set up the initial text based on your default constants
  const initialActiveLights =
    [
      D_AMBIENT.intensity > 0 ? "Ambient" : null,
      D_DIR1.enabled ? "Dir 1" : null,
      D_DIR2.enabled ? "Dir 2" : null,
      D_POINT.enabled ? "Point" : null,
      D_SPOT.enabled ? "Spot" : null,
    ]
      .filter(Boolean)
      .join(", ") || "None";
  const [, setGlobalInfo] = useControls(() => ({
    "Selected Model": { value: "None", editable: false },
    "Active Lights": { value: initialActiveLights, editable: false },
    // useControls({
    "Reset All": button(() => {
      if (setters.current.setTransform) {
        setters.current.setTransform({
          position: D_TRANSFORM.position,
          rotation: D_TRANSFORM.rotation,
          scale: D_TRANSFORM.scale,
        });
      }
      if (setters.current.setCamera) {
        setters.current.setCamera({
          fov: D_CAMERA.fov,
          near: D_CAMERA.near,
          far: D_CAMERA.far,
          orbitEnabled: D_CAMERA.orbitEnabled,
          enablePan: D_CAMERA.enablePan,
          enableZoom: D_CAMERA.enableZoom,
          autoRotateOrbit: D_CAMERA.autoRotateOrbit,
          autoRotateOrbitSpeed: D_CAMERA.autoRotateOrbitSpeed,
          dampingFactor: D_CAMERA.dampingFactor,
          minDistance: D_CAMERA.minDistance,
          maxDistance: D_CAMERA.maxDistance,
          minPolarAngle: D_CAMERA.minPolarAngle,
          maxPolarAngle: D_CAMERA.maxPolarAngle,
          position: D_CAMERA.position,
          target: D_CAMERA.target,
        });
      }
      if (setters.current.setDof) {
        setters.current.setDof({
          enabled: D_DOF.enabled,
          focalLength: D_DOF.focalLength,
          bokehScale: D_DOF.bokehScale,
        });
      }
      if (setters.current.setLights) {
        setters.current.setLights({
          ambientIntensity: D_AMBIENT.intensity,
          ambientColor: D_AMBIENT.color,
          dir1Enabled: D_DIR1.enabled,
          dir1ShowHelper: D_DIR1.showHelper,
          dir1Intensity: D_DIR1.intensity,
          dir1Color: D_DIR1.color,
          dir1Position: {
            x: D_DIR1.position.x,
            y: D_DIR1.position.y,
            z: D_DIR1.position.z,
          },
          dir1CastShadow: D_DIR1.castShadow,
          dir2Enabled: D_DIR2.enabled,
          dir2ShowHelper: D_DIR2.showHelper,
          dir2Intensity: D_DIR2.intensity,
          dir2Color: D_DIR2.color,
          dir2Position: {
            x: D_DIR2.position.x,
            y: D_DIR2.position.y,
            z: D_DIR2.position.z,
          },
          dir2CastShadow: D_DIR2.castShadow,
          pointEnabled: D_POINT.enabled,
          pointShowHelper: D_POINT.showHelper,
          pointIntensity: D_POINT.intensity,
          pointColor: D_POINT.color,
          pointPosition: {
            x: D_POINT.position.x,
            y: D_POINT.position.y,
            z: D_POINT.position.z,
          },
          pointDistance: D_POINT.distance,
          pointDecay: D_POINT.decay,
          spotEnabled: D_SPOT.enabled,
          spotShowHelper: D_SPOT.showHelper,
          spotIntensity: D_SPOT.intensity,
          spotColor: D_SPOT.color,
          spotPosition: {
            x: D_SPOT.position.x,
            y: D_SPOT.position.y,
            z: D_SPOT.position.z,
          },
          spotAngle: D_SPOT.angle,
          spotPenumbra: D_SPOT.penumbra,
        });
      }
      if (setters.current.setEnv) {
        setters.current.setEnv({
          preset: D_ENV.preset,
          showBackground: D_ENV.showBackground,
          backgroundBlur: D_ENV.backgroundBlur,
          envIntensity: D_ENV.envIntensity,
        });
      }
      if (setters.current.setRenderConfig) {
        setters.current.setRenderConfig({
          toneMapping: D_RENDER.toneMapping,
          toneMappingExposure: D_RENDER.toneMappingExposure,
          useEnvBackground: D_RENDER.useEnvBackground,
          backgroundColor: D_RENDER.backgroundColor,
          shadowsEnabled: D_RENDER.shadowsEnabled,
          fogEnabled: D_RENDER.fogEnabled,
          fogColor: D_RENDER.fogColor,
          fogNear: D_RENDER.fogNear,
          fogFar: D_RENDER.fogFar,
          wireframe: D_RENDER.wireframe,
        });
      }
      if (setters.current.setMaterial) {
        setters.current.setMaterial({
          enabled: D_MATERIAL.enabled,
          color: D_MATERIAL.color,
          roughness: D_MATERIAL.roughness,
          metalness: D_MATERIAL.metalness,
          opacity: D_MATERIAL.opacity,
          transparent: D_MATERIAL.transparent,
        });
      }
      if (setters.current.setHelpers) {
        setters.current.setHelpers({
          gridEnabled: D_HELPERS.grid.enabled,
          gridSize: D_HELPERS.grid.size,
          gridDivisions: D_HELPERS.grid.divisions,
          gridColor1: D_HELPERS.grid.color1,
          gridColor2: D_HELPERS.grid.color2,
          axesEnabled: D_HELPERS.axes.enabled,
          axesSize: D_HELPERS.axes.size,
          gizmoEnabled: D_HELPERS.gizmo.enabled,
          gizmoAlignment: D_HELPERS.gizmo.alignment,
          gizmoType: D_HELPERS.gizmo.type,
        });
      }
    }),
  }));

  const [transform, setTransform] = useControls(
    "Transform",
    () => ({
      Reset: button(() => {
        setTransform({
          position: D_TRANSFORM.position,
          rotation: D_TRANSFORM.rotation,
          scale: D_TRANSFORM.scale,
        });
      }),
      position: {
        value: {
          x: D_TRANSFORM.position.x,
          y: D_TRANSFORM.position.y,
          z: D_TRANSFORM.position.z,
        },
        step: 0.01,
      },
      rotation: {
        value: {
          x: D_TRANSFORM.rotation.x,
          y: D_TRANSFORM.rotation.y,
          z: D_TRANSFORM.rotation.z,
        },
        step: 0.01,
      },
      scale: {
        value: {
          x: D_TRANSFORM.scale.x,
          y: D_TRANSFORM.scale.y,
          z: D_TRANSFORM.scale.z,
        },
        step: 0.01,
        lock: true,
      },
    }),
    { collapsed: true },
  );
  setters.current.setTransform = setTransform;

  const [camera, setCamera] = useControls(
    "Camera",
    () => ({
      Reset: button(() => {
        setCamera({
          fov: D_CAMERA.fov,
          near: D_CAMERA.near,
          far: D_CAMERA.far,
          orbitEnabled: D_CAMERA.orbitEnabled,
          enablePan: D_CAMERA.enablePan,
          enableZoom: D_CAMERA.enableZoom,
          autoRotateOrbit: D_CAMERA.autoRotateOrbit,
          autoRotateOrbitSpeed: D_CAMERA.autoRotateOrbitSpeed,
          dampingFactor: D_CAMERA.dampingFactor,
          minDistance: D_CAMERA.minDistance,
          maxDistance: D_CAMERA.maxDistance,
          minPolarAngle: D_CAMERA.minPolarAngle,
          maxPolarAngle: D_CAMERA.maxPolarAngle,
          position: D_CAMERA.position,
          target: D_CAMERA.target,
        });
      }),
      orbitEnabled: D_CAMERA.orbitEnabled,
      enablePan: D_CAMERA.enablePan,
      enableZoom: D_CAMERA.enableZoom,
      fov: { value: D_CAMERA.fov, min: 1, max: 160, step: 1 },
      near: { value: D_CAMERA.near, min: 0.0001, step: 0.001 },
      far: { value: D_CAMERA.far, min: 1, step: 10 },
      position: {
        value: {
          x: D_CAMERA.position.x,
          y: D_CAMERA.position.y,
          z: D_CAMERA.position.z,
        },
        step: 0.001,
      },
      target: {
        value: {
          x: D_CAMERA.target.x,
          y: D_CAMERA.target.y,
          z: D_CAMERA.target.z,
        },
        step: 0.001,
      },
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
    }),
    { collapsed: true },
  );
  setters.current.setCamera = setCamera;

  const [dof, setDof] = useControls(
    "Depth of Field",
    () => ({
      Reset: button(() => {
        setDof({
          enabled: D_DOF.enabled,
          focalLength: D_DOF.focalLength,
          bokehScale: D_DOF.bokehScale,
        });
      }),
      enabled: D_DOF.enabled,
      focalLength: {
        value: D_DOF.focalLength,
        min: 0.01,
        step: 0.01,
      },
      bokehScale: { value: D_DOF.bokehScale, min: 0, step: 0.1 },
      clearTarget: button(() => setFocusTarget(null)),
    }),
    { collapsed: true },
  );
  setters.current.setDof = setDof;

  const [lights, setLights] = useControls(
    "Lights",
    () => ({
      Reset: button(() => {
        setLights({
          ambientIntensity: D_AMBIENT.intensity,
          ambientColor: D_AMBIENT.color,
          dir1Enabled: D_DIR1.enabled,
          dir1ShowHelper: D_DIR1.showHelper,
          dir1Intensity: D_DIR1.intensity,
          dir1Color: D_DIR1.color,
          dir1Position: {
            x: D_DIR1.position.x,
            y: D_DIR1.position.y,
            z: D_DIR1.position.z,
          },
          dir1CastShadow: D_DIR1.castShadow,
          dir2Enabled: D_DIR2.enabled,
          dir2ShowHelper: D_DIR2.showHelper,
          dir2Intensity: D_DIR2.intensity,
          dir2Color: D_DIR2.color,
          dir2Position: {
            x: D_DIR2.position.x,
            y: D_DIR2.position.y,
            z: D_DIR2.position.z,
          },
          dir2CastShadow: D_DIR2.castShadow,
          pointEnabled: D_POINT.enabled,
          pointShowHelper: D_POINT.showHelper,
          pointIntensity: D_POINT.intensity,
          pointColor: D_POINT.color,
          pointPosition: {
            x: D_POINT.position.x,
            y: D_POINT.position.y,
            z: D_POINT.position.z,
          },
          pointDistance: D_POINT.distance,
          pointDecay: D_POINT.decay,
          spotEnabled: D_SPOT.enabled,
          spotShowHelper: D_SPOT.showHelper,
          spotIntensity: D_SPOT.intensity,
          spotColor: D_SPOT.color,
          spotPosition: {
            x: D_SPOT.position.x,
            y: D_SPOT.position.y,
            z: D_SPOT.position.z,
          },
          spotAngle: D_SPOT.angle,
          spotPenumbra: D_SPOT.penumbra,
        });
      }),
      "Ambient Light": folder(
        {
          ambientIntensity: {
            value: D_AMBIENT.intensity,
            min: 0,
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
            step: 0.1,
          },
          dir1Color: D_DIR1.color,
          dir1Position: {
            value: {
              x: D_DIR1.position.x,
              y: D_DIR1.position.y,
              z: D_DIR1.position.z,
            },
            step: 0.001,
          },
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
          dir2Position: {
            value: {
              x: D_DIR2.position.x,
              y: D_DIR2.position.y,
              z: D_DIR2.position.z,
            },
            step: 0.001,
          },
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
          pointPosition: {
            value: {
              x: D_POINT.position.x,
              y: D_POINT.position.y,
              z: D_POINT.position.z,
            },
            step: 0.001,
          },
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
          spotPosition: {
            value: {
              x: D_SPOT.position.x,
              y: D_SPOT.position.y,
              z: D_SPOT.position.z,
            },
            step: 0.001,
          },
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
  setters.current.setLights = setLights;

  const ambient: AmbientLight = {
    intensity: lights.ambientIntensity,
    color: lights.ambientColor,
  };
  const dir1: DirectionalLight = {
    enabled: lights.dir1Enabled,
    showHelper: lights.dir1ShowHelper,
    intensity: lights.dir1Intensity,
    color: lights.dir1Color,
    position: lights.dir1Position,
    castShadow: lights.dir1CastShadow,
  };
  const dir2: DirectionalLight = {
    enabled: lights.dir2Enabled,
    showHelper: lights.dir2ShowHelper,
    intensity: lights.dir2Intensity,
    color: lights.dir2Color,
    position: lights.dir2Position,
    castShadow: lights.dir2CastShadow,
  };
  const point: PointLight = {
    enabled: lights.pointEnabled,
    showHelper: lights.pointShowHelper,
    intensity: lights.pointIntensity,
    color: lights.pointColor,
    position: lights.pointPosition,
    distance: lights.pointDistance,
    decay: lights.pointDecay,
  };
  const spot: SpotLight = {
    enabled: lights.spotEnabled,
    showHelper: lights.spotShowHelper,
    intensity: lights.spotIntensity,
    color: lights.spotColor,
    position: lights.spotPosition,
    angle: lights.spotAngle,
    penumbra: lights.spotPenumbra,
  };

  const [env, setEnv] = useControls(
    "Environment",
    () => ({
      Reset: button(() => {
        setEnv({
          preset: D_ENV.preset,
          showBackground: D_ENV.showBackground,
          backgroundBlur: D_ENV.backgroundBlur,
          envIntensity: D_ENV.envIntensity,
        });
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
    { collapsed: true },
  );
  setters.current.setEnv = setEnv;

  const [renderConfig, setRenderConfig] = useControls(
    "Render",
    () => ({
      Reset: button(() => {
        setRenderConfig({
          toneMapping: D_RENDER.toneMapping,
          toneMappingExposure: D_RENDER.toneMappingExposure,
          useEnvBackground: D_RENDER.useEnvBackground,
          backgroundColor: D_RENDER.backgroundColor,
          shadowsEnabled: D_RENDER.shadowsEnabled,
          fogEnabled: D_RENDER.fogEnabled,
          fogColor: D_RENDER.fogColor,
          fogNear: D_RENDER.fogNear,
          fogFar: D_RENDER.fogFar,
          wireframe: D_RENDER.wireframe,
        });
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
      fogFar: { value: D_RENDER.fogFar, min: 0, max: 200, step: 0.5 },
      wireframe: D_RENDER.wireframe,
    }),
    { collapsed: true },
  );
  setters.current.setRenderConfig = setRenderConfig;

  const [material, setMaterial] = useControls(
    "Material Override",
    () => ({
      Reset: button(() => {
        setMaterial({
          enabled: D_MATERIAL.enabled,
          color: D_MATERIAL.color,
          roughness: D_MATERIAL.roughness,
          metalness: D_MATERIAL.metalness,
          opacity: D_MATERIAL.opacity,
          transparent: D_MATERIAL.transparent,
        });
      }),
      enabled: D_MATERIAL.enabled,
      color: D_MATERIAL.color,
      roughness: { value: D_MATERIAL.roughness, min: 0, max: 1, step: 0.01 },
      metalness: { value: D_MATERIAL.metalness, min: 0, max: 1, step: 0.01 },
      opacity: { value: D_MATERIAL.opacity, min: 0, max: 1, step: 0.01 },
      transparent: D_MATERIAL.transparent,
    }),
    { collapsed: true },
  );
  setters.current.setMaterial = setMaterial;

  const [helpers, setHelpers] = useControls(
    "Helpers",
    () => ({
      Reset: button(() => {
        setHelpers({
          gridEnabled: D_HELPERS.grid.enabled,
          gridSize: D_HELPERS.grid.size,
          gridDivisions: D_HELPERS.grid.divisions,
          gridColor1: D_HELPERS.grid.color1,
          gridColor2: D_HELPERS.grid.color2,
          axesEnabled: D_HELPERS.axes.enabled,
          axesSize: D_HELPERS.axes.size,
          gizmoEnabled: D_HELPERS.gizmo.enabled,
          gizmoAlignment: D_HELPERS.gizmo.alignment,
          gizmoType: D_HELPERS.gizmo.type,
        });
      }),
      "Grid Helper": folder(
        {
          gridEnabled: D_HELPERS.grid.enabled,
          gridSize: {
            value: D_HELPERS.grid.size,
            min: 0.1,
            step: 0.1,
          },
          gridDivisions: {
            value: D_HELPERS.grid.divisions,
            min: 1,
            step: 1,
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
              "top-right",
              "top-center",
              "top-left",
              "bottom-right",
              "bottom-center",
              "bottom-left",
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
  setters.current.setHelpers = setHelpers;

  useEffect(() => {
    // Format the model name
    let modelName = "None";
    if (activeModelUrl) {
      if (activeModelUrl.startsWith("blob:")) {
        modelName = "Uploaded Local Model";
      } else {
        // Grab just the filename from the URL, ignoring query parameters
        modelName = activeModelUrl.split("/").pop()?.split("?")[0] || "Unknown";
      }
    }

    // Determine which lights are currently active
    const active = [];
    if (lights.ambientIntensity > 0) active.push("Ambient");
    if (lights.dir1Enabled) active.push("Dir 1");
    if (lights.dir2Enabled) active.push("Dir 2");
    if (lights.pointEnabled) active.push("Point");
    if (lights.spotEnabled) active.push("Spot");

    // Update the top Leva panel
    setGlobalInfo({
      "Selected Model": modelName,
      "Active Lights": active.length > 0 ? active.join(", ") : "None",
    });
  }, [activeModelUrl, lights, setGlobalInfo]);

  return (
    <div className="fixed inset-0 flex bg-zinc-950 overflow-hidden">
      <div className="flex-1 relative">
        <Leva
          titleBar={{
            title: "Settings",
          }}
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
              position: [
                D_CAMERA.position.x,
                D_CAMERA.position.y,
                D_CAMERA.position.z,
              ],
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
                      Math.abs(camera.position.x - pos.x) > 0.01 ||
                      Math.abs(camera.position.y - pos.y) > 0.01 ||
                      Math.abs(camera.position.z - pos.z) > 0.01 ||
                      Math.abs(camera.target.x - tgt.x) > 0.01 ||
                      Math.abs(camera.target.y - tgt.y) > 0.01 ||
                      Math.abs(camera.target.z - tgt.z) > 0.01
                    ) {
                      setCamera({
                        position: { x: pos.x, y: pos.y, z: pos.z },
                        target: { x: tgt.x, y: tgt.y, z: tgt.z },
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
