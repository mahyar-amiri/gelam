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
  D_POINT1,
  D_POINT2,
  D_SPOT1,
  D_SPOT2,
  D_ENV,
  D_CAMERA,
  D_DOF,
  D_RENDER,
  D_MATERIAL,
  ENV_PRESETS,
  TONE_MAPS,
  D_HELPERS,
} from "@/consts/controller";

const LEVA_TITLE_BAR = { title: "Settings" };
const LEVA_THEME = { sizes: { rootWidth: "480px" } };

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
  const [activeModelUrl, setActiveModelUrl] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [models, setModels] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const importInputRef = useRef<HTMLInputElement>(null);
  // Fetch Models (Unchanged, just isolated)
  useEffect(() => {
    const fetchModels = async () => {
      try {
        const res = await fetch("/api/models");
        const data = await res.json();
        if (data.models) setModels(data.models);
      } catch (e) {
        console.error("Error fetching models:", e);
      }
    };
    fetchModels();
  }, []);

  const [focusTarget, setFocusTarget] = useState<THREE.Vector3 | null>(null);

  const orbitRef = useRef<OrbitControlsImpl>(null);

  const setters = useRef<any>({});
  const isResetting = useRef(false);

  // Restore Local Storage ONCE
  useEffect(() => {
    const saved = localStorage.getItem("viewerSettings");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.activeModelUrl) setActiveModelUrl(parsed.activeModelUrl);
        // We will apply the rest of the settings below after a short delay
        // to ensure Leva has mounted.
        setTimeout(() => {
          if (parsed.transform && setters.current.setTransform) setters.current.setTransform(parsed.transform);
          if (parsed.camera && setters.current.setCamera) setters.current.setCamera(parsed.camera);
          if (parsed.dof && setters.current.setDof) setters.current.setDof(parsed.dof);
          if (parsed.lights && setters.current.setLights) setters.current.setLights(parsed.lights);
          if (parsed.env && setters.current.setEnv) setters.current.setEnv(parsed.env);
          if (parsed.renderConfig && setters.current.setRenderConfig) setters.current.setRenderConfig(parsed.renderConfig);
          if (parsed.material && setters.current.setMaterial) setters.current.setMaterial(parsed.material);
          if (parsed.helpers && setters.current.setHelpers) setters.current.setHelpers(parsed.helpers);
          setIsInitialized(true);
        }, 100);
      } catch (e) {
        console.error("Failed to parse settings", e);
        setIsInitialized(true);
      }
    } else {
      setIsInitialized(true);
    }
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/models", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        const newUrl = `/models/${data.name}`;

        // Refresh models list
        const modelsRes = await fetch("/api/models");
        const modelsData = await modelsRes.json();
        if (modelsData.models) {
          setModels(modelsData.models);
        }

        // Update active model
        setActiveModelUrl(newUrl);
        if (setters.current.setModel) {
          setters.current.setModel({ modelOptions: newUrl });
        }
      }
    } catch (error) {
      console.error("Upload failed", error);
    } finally {
      if (e.target) e.target.value = ""; // Reset input
    }
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const confirmImport = window.confirm(
      "The current config is not saved, and is it ok to import a new config?"
    );

    if (!confirmImport) {
      if (e.target) e.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.activeModelUrl !== undefined) setActiveModelUrl(parsed.activeModelUrl);
        if (parsed.transform && setters.current.setTransform) setters.current.setTransform(parsed.transform);
        if (parsed.camera && setters.current.setCamera) setters.current.setCamera(parsed.camera);
        if (parsed.dof && setters.current.setDof) setters.current.setDof(parsed.dof);
        if (parsed.lights && setters.current.setLights) setters.current.setLights(parsed.lights);
        if (parsed.env && setters.current.setEnv) setters.current.setEnv(parsed.env);
        if (parsed.renderConfig && setters.current.setRenderConfig) setters.current.setRenderConfig(parsed.renderConfig);
        if (parsed.material && setters.current.setMaterial) setters.current.setMaterial(parsed.material);
        if (parsed.helpers && setters.current.setHelpers) setters.current.setHelpers(parsed.helpers);
      } catch (error) {
        console.error("Failed to parse imported settings", error);
        alert("Failed to parse imported settings. Ensure the file is a valid JSON configuration.");
      } finally {
        if (e.target) e.target.value = "";
      }
    };
    reader.readAsText(file);
  };

  const [, setGlobalInfo] = useControls(() => ({
    "Selected Model": { value: "None", editable: false },
    "Reset All": button(() => {
      isResetting.current = true;
      localStorage.removeItem("viewerSettings");
      setActiveModelUrl(null);
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
          point1Enabled: D_POINT1.enabled,
          point1ShowHelper: D_POINT1.showHelper,
          point1Intensity: D_POINT1.intensity,
          point1Color: D_POINT1.color,
          point1Position: {
            x: D_POINT1.position.x,
            y: D_POINT1.position.y,
            z: D_POINT1.position.z,
          },
          point1Distance: D_POINT1.distance,
          point1Decay: D_POINT1.decay,
          spot1Enabled: D_SPOT1.enabled,
          spot1ShowHelper: D_SPOT1.showHelper,
          spot1Intensity: D_SPOT1.intensity,
          spot1Color: D_SPOT1.color,
          spot1Position: {
            x: D_SPOT1.position.x,
            y: D_SPOT1.position.y,
            z: D_SPOT1.position.z,
          },
          spot1Angle: D_SPOT1.angle,
          spot1Penumbra: D_SPOT1.penumbra,
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
      // Give Leva time to process the updates before re-enabling save
      setTimeout(() => {
        isResetting.current = false;
      }, 500);
    }),
  }));

  const modelOptionsRecord: Record<string, string> = { None: "" };
  if (activeModelUrl) {
    const modelName = activeModelUrl.startsWith("blob:")
      ? "Uploaded Local Model"
      : activeModelUrl.split("/").pop()?.split("?")[0] || "Unknown";
    modelOptionsRecord[modelName] = activeModelUrl;
  }
  models.forEach((m) => {
    modelOptionsRecord[m] = `/models/${m}`;
  });

  const [modelSettings, setModel] = useControls(
    "Model",
    () => ({
      Upload: button(() => {
        fileInputRef.current?.click();
      }),
      Import: button(() => {
        importInputRef.current?.click();
      }),
      Export: button(() => {
        let modelName = "None";
        if (currentStateRef.current.activeModelUrl) {
          if (currentStateRef.current.activeModelUrl.startsWith("blob:")) {
            modelName = "Uploaded_Local_Model";
          } else {
            modelName = currentStateRef.current.activeModelUrl.split("/").pop()?.split("?")[0] || "Unknown";
          }
        }

        // Remove file extension
        modelName = modelName.replace(/\.[^/.]+$/, "");

        const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
        const filename = `${modelName}_${timestamp}.json`;

        const blob = new Blob([JSON.stringify(currentStateRef.current, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        a.click();

        URL.revokeObjectURL(url);
      }),
      modelOptions: {
        label: "Select",
        options: modelOptionsRecord,
        value: activeModelUrl || "",
        onChange: (
          value: string,
          path: string,
          context: { initial: boolean },
        ) => {
          if (context.initial) return;
          setActiveModelUrl(value || null);
        },
        transient: false,
      },
    }),
    { collapsed: true },
    [models, isInitialized],
  );

  useEffect(() => {
    if (setters.current.setModel) {
      setters.current.setModel({ modelOptions: activeModelUrl || "" });
    }
  }, [activeModelUrl]);
  setters.current.setModel = setModel;

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
          dir1HelperSize: D_DIR1.helperSize,
          dir1ShowPivotControls: D_DIR1.showPivotControls,
          dir1ShowSphere: D_DIR1.showSphere,
          dir1SphereScale: D_DIR1.sphereScale,
          dir1CustomTargetEnabled: D_DIR1.customTargetEnabled,
          dir1CustomTargetPosition: {
            x: D_DIR1.customTargetPosition.x,
            y: D_DIR1.customTargetPosition.y,
            z: D_DIR1.customTargetPosition.z,
          },
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
          dir2HelperSize: D_DIR2.helperSize,
          dir2ShowPivotControls: D_DIR2.showPivotControls,
          dir2ShowSphere: D_DIR2.showSphere,
          dir2SphereScale: D_DIR2.sphereScale,
          dir2CustomTargetEnabled: D_DIR2.customTargetEnabled,
          dir2CustomTargetPosition: {
            x: D_DIR2.customTargetPosition.x,
            y: D_DIR2.customTargetPosition.y,
            z: D_DIR2.customTargetPosition.z,
          },
          dir2Intensity: D_DIR2.intensity,
          dir2Color: D_DIR2.color,
          dir2Position: {
            x: D_DIR2.position.x,
            y: D_DIR2.position.y,
            z: D_DIR2.position.z,
          },
          dir2CastShadow: D_DIR2.castShadow,
          point1Enabled: D_POINT1.enabled,
          point1ShowHelper: D_POINT1.showHelper,
          point1HelperSize: D_POINT1.helperSize,
          point1ShowPivotControls: D_POINT1.showPivotControls,
          point1ShowSphere: D_POINT1.showSphere,
          point1SphereScale: D_POINT1.sphereScale,
          point1Intensity: D_POINT1.intensity,
          point1Color: D_POINT1.color,
          point1Position: {
            x: D_POINT1.position.x,
            y: D_POINT1.position.y,
            z: D_POINT1.position.z,
          },
          point1Distance: D_POINT1.distance,
          point1Decay: D_POINT1.decay,
          point2Enabled: D_POINT2.enabled,
          point2ShowHelper: D_POINT2.showHelper,
          point2HelperSize: D_POINT2.helperSize,
          point2ShowPivotControls: D_POINT2.showPivotControls,
          point2ShowSphere: D_POINT2.showSphere,
          point2SphereScale: D_POINT2.sphereScale,
          point2Intensity: D_POINT2.intensity,
          point2Color: D_POINT2.color,
          point2Position: {
            x: D_POINT2.position.x,
            y: D_POINT2.position.y,
            z: D_POINT2.position.z,
          },
          point2Distance: D_POINT2.distance,
          point2Decay: D_POINT2.decay,
          spot1Enabled: D_SPOT1.enabled,
          spot1ShowHelper: D_SPOT1.showHelper,
          spot1ShowPivotControls: D_SPOT1.showPivotControls,
          spot1ShowSphere: D_SPOT1.showSphere,
          spot1SphereScale: D_SPOT1.sphereScale,
          spot1CustomTargetEnabled: D_SPOT1.customTargetEnabled,
          spot1CustomTargetPosition: {
            x: D_SPOT1.customTargetPosition.x,
            y: D_SPOT1.customTargetPosition.y,
            z: D_SPOT1.customTargetPosition.z,
          },
          spot1Intensity: D_SPOT1.intensity,
          spot1Color: D_SPOT1.color,
          spot1Position: {
            x: D_SPOT1.position.x,
            y: D_SPOT1.position.y,
            z: D_SPOT1.position.z,
          },
          spot1Angle: D_SPOT1.angle,
          spot1Penumbra: D_SPOT1.penumbra,
          spot2Enabled: D_SPOT2.enabled,
          spot2ShowHelper: D_SPOT2.showHelper,
          spot2ShowPivotControls: D_SPOT2.showPivotControls,
          spot2ShowSphere: D_SPOT2.showSphere,
          spot2SphereScale: D_SPOT2.sphereScale,
          spot2CustomTargetEnabled: D_SPOT2.customTargetEnabled,
          spot2CustomTargetPosition: {
            x: D_SPOT2.customTargetPosition.x,
            y: D_SPOT2.customTargetPosition.y,
            z: D_SPOT2.customTargetPosition.z,
          },
          spot2Intensity: D_SPOT2.intensity,
          spot2Color: D_SPOT2.color,
          spot2Position: {
            x: D_SPOT2.position.x,
            y: D_SPOT2.position.y,
            z: D_SPOT2.position.z,
          },
          spot2Angle: D_SPOT2.angle,
          spot2Penumbra: D_SPOT2.penumbra,
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
          dir1ShowHelper: D_DIR1.showHelper,
          dir1CustomTargetEnabled: D_DIR1.customTargetEnabled,
          dir1CustomTargetPosition: {
            value: {
              x: D_DIR1.customTargetPosition.x,
              y: D_DIR1.customTargetPosition.y,
              z: D_DIR1.customTargetPosition.z,
            },
            step: 0.01,
          },
          dir1HelperSize: { value: D_DIR1.helperSize, min: 0.1, step: 0.1 },
          dir1ShowPivotControls: D_DIR1.showPivotControls,
          dir1ShowSphere: D_DIR1.showSphere,
          dir1SphereScale: {
            value: D_DIR1.sphereScale,
            min: 0.01,
            max: 1,
            step: 0.01,
          },
        },
        { collapsed: true },
      ),
      "Directional Light 2": folder(
        {
          dir2Enabled: D_DIR2.enabled,
          dir2Intensity: {
            value: D_DIR2.intensity,
            min: 0,
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
          dir2CustomTargetEnabled: D_DIR2.customTargetEnabled,
          dir2CustomTargetPosition: {
            value: {
              x: D_DIR2.customTargetPosition.x,
              y: D_DIR2.customTargetPosition.y,
              z: D_DIR2.customTargetPosition.z,
            },
            step: 0.01,
          },
          dir2ShowHelper: D_DIR2.showHelper,
          dir2HelperSize: { value: D_DIR2.helperSize, min: 0.1, step: 0.1 },
          dir2ShowPivotControls: D_DIR2.showPivotControls,
          dir2ShowSphere: D_DIR2.showSphere,
          dir2SphereScale: {
            value: D_DIR2.sphereScale,
            min: 0.01,
            max: 1,
            step: 0.01,
          },
        },
        { collapsed: true },
      ),
      "Point Light 1": folder(
        {
          point1Enabled: D_POINT1.enabled,
          point1Intensity: {
            value: D_POINT1.intensity,
            min: 0,
            step: 0.1,
          },
          point1Color: D_POINT1.color,
          point1Position: {
            value: {
              x: D_POINT1.position.x,
              y: D_POINT1.position.y,
              z: D_POINT1.position.z,
            },
            step: 0.001,
          },
          point1Distance: {
            value: D_POINT1.distance,
            min: 0,
            step: 0.5,
          },
          point1Decay: { value: D_POINT1.decay, min: 0, max: 5, step: 0.05 },
          point1ShowHelper: D_POINT1.showHelper,
          point1HelperSize: { value: D_POINT1.helperSize, min: 0.1, step: 0.1 },
          point1ShowPivotControls: D_POINT1.showPivotControls,
          point1ShowSphere: D_POINT1.showSphere,
          point1SphereScale: {
            value: D_POINT1.sphereScale,
            min: 0.01,
            max: 1,
            step: 0.01,
          },
        },
        { collapsed: true },
      ),
      "Point Light 2": folder(
        {
          point2Enabled: D_POINT2.enabled,
          point2Intensity: {
            value: D_POINT2.intensity,
            min: 0,
            step: 0.1,
          },
          point2Color: D_POINT2.color,
          point2Position: {
            value: {
              x: D_POINT2.position.x,
              y: D_POINT2.position.y,
              z: D_POINT2.position.z,
            },
            step: 0.001,
          },
          point2Distance: {
            value: D_POINT2.distance,
            min: 0,
            step: 0.5,
          },
          point2Decay: { value: D_POINT2.decay, min: 0, max: 5, step: 0.05 },
          point2ShowHelper: D_POINT2.showHelper,
          point2HelperSize: { value: D_POINT2.helperSize, min: 0.1, step: 0.1 },
          point2ShowPivotControls: D_POINT2.showPivotControls,
          point2ShowSphere: D_POINT2.showSphere,
          point2SphereScale: {
            value: D_POINT2.sphereScale,
            min: 0.01,
            max: 1,
            step: 0.01,
          },
        },
        { collapsed: true },
      ),
      "Spot Light 1": folder(
        {
          spot1Enabled: D_SPOT1.enabled,
          spot1Intensity: {
            value: D_SPOT1.intensity,
            min: 0,
            step: 0.5,
          },
          spot1Color: D_SPOT1.color,
          spot1Position: {
            value: {
              x: D_SPOT1.position.x,
              y: D_SPOT1.position.y,
              z: D_SPOT1.position.z,
            },
            step: 0.001,
          },
          spot1Angle: {
            value: D_SPOT1.angle,
            min: 0,
            max: Math.PI / 2,
            step: 0.05,
          },
          spot1Penumbra: {
            value: D_SPOT1.penumbra,
            min: 0,
            max: 1,
            step: 0.05,
          },
          spot1CustomTargetEnabled: D_SPOT1.customTargetEnabled,
          spot1CustomTargetPosition: {
            value: {
              x: D_SPOT1.customTargetPosition.x,
              y: D_SPOT1.customTargetPosition.y,
              z: D_SPOT1.customTargetPosition.z,
            },
            step: 0.01,
          },
          spot1ShowHelper: D_SPOT1.showHelper,
          spot1ShowPivotControls: D_SPOT1.showPivotControls,
          spot1ShowSphere: D_SPOT1.showSphere,
          spot1SphereScale: {
            value: D_SPOT1.sphereScale,
            min: 0.01,
            max: 1,
            step: 0.01,
          },
        },
        { collapsed: true },
      ),
      "Spot Light 2": folder(
        {
          spot2Enabled: D_SPOT2.enabled,
          spot2Intensity: {
            value: D_SPOT2.intensity,
            min: 0,
            step: 0.5,
          },
          spot2Color: D_SPOT2.color,
          spot2Position: {
            value: {
              x: D_SPOT2.position.x,
              y: D_SPOT2.position.y,
              z: D_SPOT2.position.z,
            },
            step: 0.001,
          },
          spot2Angle: {
            value: D_SPOT2.angle,
            min: 0,
            max: Math.PI / 2,
            step: 0.05,
          },
          spot2Penumbra: {
            value: D_SPOT2.penumbra,
            min: 0,
            max: 1,
            step: 0.05,
          },
          spot2CustomTargetEnabled: D_SPOT2.customTargetEnabled,
          spot2CustomTargetPosition: {
            value: {
              x: D_SPOT2.customTargetPosition.x,
              y: D_SPOT2.customTargetPosition.y,
              z: D_SPOT2.customTargetPosition.z,
            },
            step: 0.01,
          },
          spot2ShowHelper: D_SPOT2.showHelper,
          spot2ShowPivotControls: D_SPOT2.showPivotControls,
          spot2ShowSphere: D_SPOT2.showSphere,
          spot2SphereScale: {
            value: D_SPOT2.sphereScale,
            min: 0.01,
            max: 1,
            step: 0.01,
          },
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
    intensity: lights.dir1Intensity,
    color: lights.dir1Color,
    position: lights.dir1Position,
    castShadow: lights.dir1CastShadow,
    customTargetEnabled: lights.dir1CustomTargetEnabled,
    customTargetPosition: lights.dir1CustomTargetPosition,
    showHelper: lights.dir1ShowHelper,
    helperSize: lights.dir1HelperSize,
    showPivotControls: lights.dir1ShowPivotControls,
    showSphere: lights.dir1ShowSphere,
    sphereScale: lights.dir1SphereScale,
  };
  const dir2: DirectionalLight = {
    enabled: lights.dir2Enabled,
    intensity: lights.dir2Intensity,
    color: lights.dir2Color,
    position: lights.dir2Position,
    castShadow: lights.dir2CastShadow,
    customTargetEnabled: lights.dir2CustomTargetEnabled,
    customTargetPosition: lights.dir2CustomTargetPosition,
    showHelper: lights.dir2ShowHelper,
    helperSize: lights.dir2HelperSize,
    showPivotControls: lights.dir2ShowPivotControls,
    showSphere: lights.dir2ShowSphere,
    sphereScale: lights.dir2SphereScale,
  };
  const point1: PointLight = {
    enabled: lights.point1Enabled,
    intensity: lights.point1Intensity,
    color: lights.point1Color,
    position: lights.point1Position,
    distance: lights.point1Distance,
    decay: lights.point1Decay,
    showHelper: lights.point1ShowHelper,
    helperSize: lights.point1HelperSize,
    showPivotControls: lights.point1ShowPivotControls,
    showSphere: lights.point1ShowSphere,
    sphereScale: lights.point1SphereScale,
  };
  const point2: PointLight = {
    enabled: lights.point2Enabled,
    intensity: lights.point2Intensity,
    color: lights.point2Color,
    position: lights.point2Position,
    distance: lights.point2Distance,
    decay: lights.point2Decay,
    showHelper: lights.point2ShowHelper,
    helperSize: lights.point2HelperSize,
    showPivotControls: lights.point2ShowPivotControls,
    showSphere: lights.point2ShowSphere,
    sphereScale: lights.point2SphereScale,
  };
  const spot1: SpotLight = {
    enabled: lights.spot1Enabled,
    intensity: lights.spot1Intensity,
    color: lights.spot1Color,
    position: lights.spot1Position,
    angle: lights.spot1Angle,
    penumbra: lights.spot1Penumbra,
    customTargetEnabled: lights.spot1CustomTargetEnabled,
    customTargetPosition: lights.spot1CustomTargetPosition,
    showHelper: lights.spot1ShowHelper,
    showPivotControls: lights.spot1ShowPivotControls,
    showSphere: lights.spot1ShowSphere,
    sphereScale: lights.spot1SphereScale,
  };
  const spot2: SpotLight = {
    enabled: lights.spot2Enabled,
    intensity: lights.spot2Intensity,
    color: lights.spot2Color,
    position: lights.spot2Position,
    angle: lights.spot2Angle,
    penumbra: lights.spot2Penumbra,
    customTargetEnabled: lights.spot2CustomTargetEnabled,
    customTargetPosition: lights.spot2CustomTargetPosition,
    showHelper: lights.spot2ShowHelper,
    showPivotControls: lights.spot2ShowPivotControls,
    showSphere: lights.spot2ShowSphere,
    sphereScale: lights.spot2SphereScale,
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

    // Update the top Leva panel
    setGlobalInfo({
      "Selected Model": modelName,
    });
  }, [activeModelUrl, setGlobalInfo]);

  // Keep ref of all current states for autosave and export
  const currentStateRef = useRef<any>({});
  useEffect(() => {
    currentStateRef.current = {
      activeModelUrl,
      transform,
      camera,
      dof,
      lights,
      env,
      renderConfig,
      material,
      helpers,
    };

    if (!isInitialized || isResetting.current) return;

    localStorage.setItem("viewerSettings", JSON.stringify(currentStateRef.current));
  }, [
    activeModelUrl,
    transform,
    camera,
    dof,
    lights,
    env,
    renderConfig,
    material,
    helpers,
    isInitialized,
  ]);

  return (
    <div className="fixed inset-0 flex bg-zinc-950 overflow-hidden">
      <input
        type="file"
        ref={fileInputRef}
        accept=".glb,.gltf"
        className="hidden"
        onChange={handleUpload}
      />
      <input
        type="file"
        ref={importInputRef}
        accept=".json"
        className="hidden"
        onChange={handleImport}
      />
      <div className="flex-1 relative">
        <Leva titleBar={LEVA_TITLE_BAR} theme={LEVA_THEME} />
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
              point1={point1}
              point2={point2}
              spot1={spot1}
              spot2={spot2}
              renderConfig={renderConfig}
              setLights={setLights}
              modelPosition={transform.position}
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
                onEnd={(e) => {
                  if (!e) return;
                  const target = e.target as unknown as OrbitControlsImpl;
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
      </div>
    </div>
  );
}
