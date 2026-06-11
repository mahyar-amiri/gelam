"use client";

import { Suspense, useRef, useState, useCallback, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, useGLTF, OrbitControls } from "@react-three/drei";
import * as THREE from "three";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Transform {
  posX: number;
  posY: number;
  posZ: number;
  rotX: number;
  rotY: number;
  rotZ: number;
  scale: number;
}

interface AutoRotate {
  enabled: boolean;
  speed: number;
  axis: "x" | "y" | "z";
}

interface AmbientLight {
  intensity: number;
  color: string;
}

interface DirectionalLight {
  enabled: boolean;
  intensity: number;
  color: string;
  posX: number;
  posY: number;
  posZ: number;
  castShadow: boolean;
}

interface PointLight {
  enabled: boolean;
  intensity: number;
  color: string;
  posX: number;
  posY: number;
  posZ: number;
  distance: number;
  decay: number;
}

interface SpotLight {
  enabled: boolean;
  intensity: number;
  color: string;
  posX: number;
  posY: number;
  posZ: number;
  angle: number;
  penumbra: number;
}

interface EnvConfig {
  preset: string;
  showBackground: boolean;
  backgroundBlur: number;
  envIntensity: number;
}

interface CameraConfig {
  fov: number;
  near: number;
  far: number;
  posX: number;
  posY: number;
  posZ: number;
  targetX: number;
  targetY: number;
  targetZ: number;
  orbitEnabled: boolean;
  minDistance: number;
  maxDistance: number;
  minPolarAngle: number;
  maxPolarAngle: number;
  enablePan: boolean;
  enableZoom: boolean;
  autoRotateOrbit: boolean;
  autoRotateOrbitSpeed: number;
  dampingFactor: number;
}

interface RenderConfig {
  toneMapping: string;
  toneMappingExposure: number;
  shadowsEnabled: boolean;
  fogEnabled: boolean;
  fogColor: string;
  fogNear: number;
  fogFar: number;
  wireframe: boolean;
  backgroundColor: string;
  useEnvBackground: boolean;
}

interface MaterialOverride {
  enabled: boolean;
  roughness: number;
  metalness: number;
  color: string;
  opacity: number;
  transparent: boolean;
}

// ─── Defaults ─────────────────────────────────────────────────────────────────
// const MODEL_NAME = "/the_elder_wand.glb";
const MODEL_NAME = "/wooden_box.glb";

const D_TRANSFORM: Transform = {
  posX: 0,
  posY: 0,
  posZ: 0,
  rotX: 0,
  rotY: 0,
  rotZ: 0,
  scale: 1,
};
const D_AUTO_ROTATE: AutoRotate = { enabled: false, speed: 1, axis: "y" };
const D_AMBIENT: AmbientLight = { intensity: 0.8, color: "#ffffff" };
const D_DIR1: DirectionalLight = {
  enabled: true,
  intensity: 2,
  color: "#ffffff",
  posX: 4,
  posY: 6,
  posZ: 4,
  castShadow: false,
};
const D_DIR2: DirectionalLight = {
  enabled: false,
  intensity: 1,
  color: "#4488ff",
  posX: -4,
  posY: 2,
  posZ: -4,
  castShadow: false,
};
const D_POINT: PointLight = {
  enabled: false,
  intensity: 3,
  color: "#ffaa44",
  posX: 0,
  posY: 2,
  posZ: 0,
  distance: 10,
  decay: 2,
};
const D_SPOT: SpotLight = {
  enabled: false,
  intensity: 5,
  color: "#ffffff",
  posX: 0,
  posY: 5,
  posZ: 2,
  angle: 0.4,
  penumbra: 0.2,
};
const D_ENV: EnvConfig = {
  preset: "city",
  showBackground: true,
  backgroundBlur: 0,
  envIntensity: 1,
};
const D_CAMERA: CameraConfig = {
  fov: 45,
  near: 0.001,
  far: 1000,
  posX: 0,
  posY: 0,
  posZ: 0.5,
  targetX: 0,
  targetY: 0,
  targetZ: 0,
  orbitEnabled: true,
  minDistance: 0.001,
  maxDistance: 100,
  minPolarAngle: 0,
  maxPolarAngle: 180,
  enablePan: true,
  enableZoom: true,
  autoRotateOrbit: false,
  autoRotateOrbitSpeed: 2,
  dampingFactor: 0.05,
};
const D_RENDER: RenderConfig = {
  toneMapping: "ACESFilmic",
  toneMappingExposure: 1,
  shadowsEnabled: false,
  fogEnabled: false,
  fogColor: "#cccccc",
  fogNear: 1,
  fogFar: 20,
  wireframe: false,
  backgroundColor: "#18181b",
  useEnvBackground: true,
};
const D_MATERIAL: MaterialOverride = {
  enabled: false,
  roughness: 0.5,
  metalness: 0.5,
  color: "#ffffff",
  opacity: 1,
  transparent: false,
};

const ENV_PRESETS = [
  "apartment",
  "city",
  "dawn",
  "forest",
  "lobby",
  "night",
  "park",
  "studio",
  "sunset",
  "warehouse",
];
const TONE_MAPS = [
  "None",
  "Linear",
  "Reinhard",
  "Cineon",
  "ACESFilmic",
  "AgX",
  "Neutral",
];

// ─── Camera controller (imperative, inside Canvas) ────────────────────────────

function CameraController({ config }: { config: CameraConfig }) {
  const { camera, gl } = useThree();

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

// ─── Render settings (inside Canvas) ─────────────────────────────────────────

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

// ─── Material override (inside Canvas) ───────────────────────────────────────

function MaterialOverrideController({
  config,
  scene,
}: {
  config: MaterialOverride;
  scene: THREE.Object3D;
}) {
  useEffect(() => {
    scene.traverse((obj: any) => {
      if (obj.isMesh && obj.material) {
        const mat = obj.material as THREE.MeshStandardMaterial;
        if (config.enabled) {
          mat.roughness = config.roughness;
          mat.metalness = config.metalness;
          mat.color?.set(config.color);
          mat.opacity = config.opacity;
          mat.transparent = config.transparent;
          mat.wireframe = false;
        }
        mat.wireframe = config.enabled ? false : false; // reset below
      }
    });
  }, [scene, config]);

  return null;
}

// ─── Wand Model ───────────────────────────────────────────────────────────────

function WandModel({
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

// ─── Scene Lights ─────────────────────────────────────────────────────────────

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

// ─── UI Primitives ────────────────────────────────────────────────────────────

function Divider() {
  return <div className="border-t border-zinc-800/60 mx-3 my-0.5" />;
}

function SubLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] uppercase tracking-widest text-zinc-500 pt-1">
      {children}
    </p>
  );
}

function SectionHeader({
  label,
  open,
  onToggle,
  badge,
}: {
  label: string;
  open: boolean;
  onToggle: () => void;
  badge?: string;
}) {
  return (
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold tracking-widest uppercase text-amber-400/80 hover:text-amber-300 transition-colors cursor-pointer"
    >
      <span className="flex items-center gap-2">
        {label}
        {badge && (
          <span className="text-[9px] bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded-full tracking-normal normal-case font-normal">
            {badge}
          </span>
        )}
      </span>
      <svg
        className={`w-3.5 h-3.5 transition-transform duration-200 shrink-0 ${open ? "rotate-180" : ""}`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 9l-7 7-7-7"
        />
      </svg>
    </button>
  );
}

function Slider({
  label,
  value,
  min,
  max,
  step = 0.01,
  onChange,
  displayValue,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
  displayValue?: string;
}) {
  const pct = Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));
  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center">
        <span className="text-[11px] text-zinc-400">{label}</span>
        <span className="text-[11px] font-mono text-zinc-300 tabular-nums">
          {displayValue ?? value.toFixed(2)}
        </span>
      </div>
      <div className="relative h-1.5 bg-zinc-700 rounded-full">
        <div
          className="absolute inset-y-0 left-0 bg-amber-500/70 rounded-full"
          style={{ width: `${pct}%` }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
      </div>
    </div>
  );
}

function NumberInput({
  label,
  value,
  onChange,
  step = 0.1,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  step?: number;
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-[11px] text-zinc-400 shrink-0">{label}</span>
      <input
        type="number"
        value={value}
        step={step}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        className="w-20 text-[11px] font-mono bg-zinc-800 border border-zinc-700 text-zinc-200 rounded-full px-2 py-1 outline-none focus:border-amber-500/60 text-right"
      />
    </div>
  );
}

function ColorPicker({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[11px] text-zinc-400">{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-[11px] font-mono text-zinc-300">{value}</span>
        <label className="relative w-6 h-6 rounded-full cursor-pointer border border-zinc-600 overflow-hidden">
          <div
            className="absolute inset-0"
            style={{ backgroundColor: value }}
          />
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
          />
        </label>
      </div>
    </div>
  );
}

function Toggle({
  label,
  checked,
  onChange,
  desc,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  desc?: string;
}) {
  return (
    <div className="flex items-start justify-between gap-2">
      <div>
        <span className="text-[11px] text-zinc-400">{label}</span>
        {desc && <p className="text-[10px] text-zinc-600 mt-0.5">{desc}</p>}
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative shrink-0 w-8 h-4 rounded-full transition-colors duration-200 mt-0.5 cursor-pointer ${checked ? "bg-amber-500" : "bg-zinc-600"}`}
      >
        <span
          className={`absolute top-0.5 w-3 h-3 bg-white rounded-full shadow transition-all duration-200 ${checked ? "left-4.5" : "left-0.5"}`}
        />
      </button>
    </div>
  );
}

function Select({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-[11px] text-zinc-400 shrink-0">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="text-[11px] bg-zinc-700 border border-zinc-600 text-zinc-200 rounded-full px-2 py-1 cursor-pointer outline-none focus:border-amber-500/60 max-w-30"
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  );
}

function ResetBtn({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full mt-0.5 py-1 text-[10px] tracking-wider uppercase text-zinc-500 hover:text-amber-400 border border-zinc-800 hover:border-amber-500/30 rounded-full transition-colors duration-150 cursor-pointer"
    >
      Reset section
    </button>
  );
}

function XYZSliders({
  prefix,
  values,
  onChange,
  min = -20,
  max = 20,
  step = 0.01,
}: {
  prefix: string;
  values: [number, number, number];
  onChange: (axis: "X" | "Y" | "Z", v: number) => void;
  min?: number;
  max?: number;
  step?: number;
}) {
  return (
    <>
      <Slider
        label={`${prefix} X`}
        value={values[0]}
        min={min}
        max={max}
        step={step}
        onChange={(v) => onChange("X", v)}
      />
      <Slider
        label={`${prefix} Y`}
        value={values[1]}
        min={min}
        max={max}
        step={step}
        onChange={(v) => onChange("Y", v)}
      />
      <Slider
        label={`${prefix} Z`}
        value={values[2]}
        min={min}
        max={max}
        step={step}
        onChange={(v) => onChange("Z", v)}
      />
    </>
  );
}

// ─── Section: Transform ───────────────────────────────────────────────────────

function TransformSection({
  transform,
  setTransform,
  autoRotate,
  setAutoRotate,
}: {
  transform: Transform;
  setTransform: React.Dispatch<React.SetStateAction<Transform>>;
  autoRotate: AutoRotate;
  setAutoRotate: React.Dispatch<React.SetStateAction<AutoRotate>>;
}) {
  const [open, setOpen] = useState(true);
  const set = useCallback(
    <K extends keyof Transform>(k: K, v: Transform[K]) =>
      setTransform((s) => ({ ...s, [k]: v })),
    [setTransform],
  );

  return (
    <>
      <SectionHeader
        label="Transform"
        open={open}
        onToggle={() => setOpen((s) => !s)}
      />
      {open && (
        <div className="px-3 pb-3 space-y-3">
          <SubLabel>Position</SubLabel>
          <XYZSliders
            prefix="Pos"
            values={[transform.posX, transform.posY, transform.posZ]}
            onChange={(ax, v) => set(("pos" + ax) as keyof Transform, v)}
            min={-5}
            max={5}
          />
          <SubLabel>Rotation</SubLabel>
          <XYZSliders
            prefix="Rot"
            values={[transform.rotX, transform.rotY, transform.rotZ]}
            onChange={(ax, v) => set(("rot" + ax) as keyof Transform, v)}
            min={-180}
            max={180}
            step={1}
          />
          <SubLabel>Scale</SubLabel>
          <Slider
            label="Uniform scale"
            value={transform.scale}
            min={0.01}
            max={10}
            step={0.01}
            onChange={(v) => set("scale", v)}
            displayValue={`${transform.scale.toFixed(2)}×`}
          />
          <SubLabel>Auto-rotate</SubLabel>
          <Toggle
            label="Enable"
            checked={autoRotate.enabled}
            onChange={(v) => setAutoRotate((s) => ({ ...s, enabled: v }))}
          />
          {autoRotate.enabled && (
            <>
              <Slider
                label="Speed"
                value={autoRotate.speed}
                min={0.1}
                max={10}
                step={0.1}
                onChange={(v) => setAutoRotate((s) => ({ ...s, speed: v }))}
                displayValue={`${autoRotate.speed.toFixed(1)}×`}
              />
              <Select
                label="Axis"
                value={autoRotate.axis}
                options={["x", "y", "z"]}
                onChange={(v) =>
                  setAutoRotate((s) => ({ ...s, axis: v as "x" | "y" | "z" }))
                }
              />
            </>
          )}
          <ResetBtn
            onClick={() => {
              setTransform(D_TRANSFORM);
              setAutoRotate(D_AUTO_ROTATE);
            }}
          />
        </div>
      )}
    </>
  );
}

// ─── Section: Ambient Light ───────────────────────────────────────────────────

function AmbientSection({
  light,
  setLight,
}: {
  light: AmbientLight;
  setLight: React.Dispatch<React.SetStateAction<AmbientLight>>;
}) {
  const [open, setOpen] = useState(false);
  const set = <K extends keyof AmbientLight>(k: K, v: AmbientLight[K]) =>
    setLight((s) => ({ ...s, [k]: v }));
  return (
    <>
      <SectionHeader
        label="Ambient Light"
        open={open}
        onToggle={() => setOpen((s) => !s)}
      />
      {open && (
        <div className="px-3 pb-3 space-y-3">
          <Slider
            label="Intensity"
            value={light.intensity}
            min={0}
            max={5}
            step={0.05}
            onChange={(v) => set("intensity", v)}
          />
          <ColorPicker
            label="Color"
            value={light.color}
            onChange={(v) => set("color", v)}
          />
          <ResetBtn onClick={() => setLight(D_AMBIENT)} />
        </div>
      )}
    </>
  );
}

// ─── Section: Directional Light ───────────────────────────────────────────────

function DirLightSection({
  label,
  light,
  setLight,
  defaults,
}: {
  label: string;
  light: DirectionalLight;
  setLight: React.Dispatch<React.SetStateAction<DirectionalLight>>;
  defaults: DirectionalLight;
}) {
  const [open, setOpen] = useState(false);
  const set = <K extends keyof DirectionalLight>(
    k: K,
    v: DirectionalLight[K],
  ) => setLight((s) => ({ ...s, [k]: v }));
  return (
    <>
      <SectionHeader
        label={label}
        open={open}
        onToggle={() => setOpen((s) => !s)}
        badge={light.enabled ? "on" : "off"}
      />
      {open && (
        <div className="px-3 pb-3 space-y-3">
          <Toggle
            label="Enable"
            checked={light.enabled}
            onChange={(v) => set("enabled", v)}
          />
          <Slider
            label="Intensity"
            value={light.intensity}
            min={0}
            max={20}
            step={0.1}
            onChange={(v) => set("intensity", v)}
          />
          <ColorPicker
            label="Color"
            value={light.color}
            onChange={(v) => set("color", v)}
          />
          <SubLabel>Position</SubLabel>
          <XYZSliders
            prefix="Pos"
            values={[light.posX, light.posY, light.posZ]}
            onChange={(ax, v) => set(("pos" + ax) as keyof DirectionalLight, v)}
          />
          <Toggle
            label="Cast shadow"
            checked={light.castShadow}
            onChange={(v) => set("castShadow", v)}
            desc="Requires shadows enabled in Render"
          />
          <ResetBtn onClick={() => setLight(defaults)} />
        </div>
      )}
    </>
  );
}

// ─── Section: Point Light ─────────────────────────────────────────────────────

function PointLightSection({
  light,
  setLight,
}: {
  light: PointLight;
  setLight: React.Dispatch<React.SetStateAction<PointLight>>;
}) {
  const [open, setOpen] = useState(false);
  const set = <K extends keyof PointLight>(k: K, v: PointLight[K]) =>
    setLight((s) => ({ ...s, [k]: v }));
  return (
    <>
      <SectionHeader
        label="Point Light"
        open={open}
        onToggle={() => setOpen((s) => !s)}
        badge={light.enabled ? "on" : "off"}
      />
      {open && (
        <div className="px-3 pb-3 space-y-3">
          <Toggle
            label="Enable"
            checked={light.enabled}
            onChange={(v) => set("enabled", v)}
          />
          <Slider
            label="Intensity"
            value={light.intensity}
            min={0}
            max={20}
            step={0.1}
            onChange={(v) => set("intensity", v)}
          />
          <ColorPicker
            label="Color"
            value={light.color}
            onChange={(v) => set("color", v)}
          />
          <Slider
            label="Distance"
            value={light.distance}
            min={0}
            max={50}
            step={0.5}
            onChange={(v) => set("distance", v)}
          />
          <Slider
            label="Decay"
            value={light.decay}
            min={0}
            max={5}
            step={0.05}
            onChange={(v) => set("decay", v)}
          />
          <SubLabel>Position</SubLabel>
          <XYZSliders
            prefix="Pos"
            values={[light.posX, light.posY, light.posZ]}
            onChange={(ax, v) => set(("pos" + ax) as keyof PointLight, v)}
          />
          <ResetBtn onClick={() => setLight(D_POINT)} />
        </div>
      )}
    </>
  );
}

// ─── Section: Spot Light ──────────────────────────────────────────────────────

function SpotLightSection({
  light,
  setLight,
}: {
  light: SpotLight;
  setLight: React.Dispatch<React.SetStateAction<SpotLight>>;
}) {
  const [open, setOpen] = useState(false);
  const set = <K extends keyof SpotLight>(k: K, v: SpotLight[K]) =>
    setLight((s) => ({ ...s, [k]: v }));
  return (
    <>
      <SectionHeader
        label="Spot Light"
        open={open}
        onToggle={() => setOpen((s) => !s)}
        badge={light.enabled ? "on" : "off"}
      />
      {open && (
        <div className="px-3 pb-3 space-y-3">
          <Toggle
            label="Enable"
            checked={light.enabled}
            onChange={(v) => set("enabled", v)}
          />
          <Slider
            label="Intensity"
            value={light.intensity}
            min={0}
            max={50}
            step={0.5}
            onChange={(v) => set("intensity", v)}
          />
          <ColorPicker
            label="Color"
            value={light.color}
            onChange={(v) => set("color", v)}
          />
          <Slider
            label="Angle"
            value={light.angle}
            min={0}
            max={Math.PI / 2}
            step={0.01}
            onChange={(v) => set("angle", v)}
            displayValue={`${((light.angle * 180) / Math.PI).toFixed(1)}°`}
          />
          <Slider
            label="Penumbra"
            value={light.penumbra}
            min={0}
            max={1}
            step={0.01}
            onChange={(v) => set("penumbra", v)}
          />
          <SubLabel>Position</SubLabel>
          <XYZSliders
            prefix="Pos"
            values={[light.posX, light.posY, light.posZ]}
            onChange={(ax, v) => set(("pos" + ax) as keyof SpotLight, v)}
          />
          <ResetBtn onClick={() => setLight(D_SPOT)} />
        </div>
      )}
    </>
  );
}

// ─── Section: Environment ─────────────────────────────────────────────────────

function EnvSection({
  env,
  setEnv,
}: {
  env: EnvConfig;
  setEnv: React.Dispatch<React.SetStateAction<EnvConfig>>;
}) {
  const [open, setOpen] = useState(false);
  const set = <K extends keyof EnvConfig>(k: K, v: EnvConfig[K]) =>
    setEnv((s) => ({ ...s, [k]: v }));
  return (
    <>
      <SectionHeader
        label="Environment"
        open={open}
        onToggle={() => setOpen((s) => !s)}
      />
      {open && (
        <div className="px-3 pb-3 space-y-3">
          <Select
            label="Preset"
            value={env.preset}
            options={ENV_PRESETS}
            onChange={(v) => set("preset", v)}
          />
          <Toggle
            label="Show as background"
            checked={env.showBackground}
            onChange={(v) => set("showBackground", v)}
          />
          <Slider
            label="Background blur"
            value={env.backgroundBlur}
            min={0}
            max={1}
            step={0.01}
            onChange={(v) => set("backgroundBlur", v)}
          />
          <Slider
            label="Env intensity"
            value={env.envIntensity}
            min={0}
            max={5}
            step={0.05}
            onChange={(v) => set("envIntensity", v)}
          />
          <ResetBtn onClick={() => setEnv(D_ENV)} />
        </div>
      )}
    </>
  );
}

// ─── Section: Camera ──────────────────────────────────────────────────────────

function CameraSection({
  camera,
  setCamera,
}: {
  camera: CameraConfig;
  setCamera: React.Dispatch<React.SetStateAction<CameraConfig>>;
}) {
  const [open, setOpen] = useState(false);
  const set = <K extends keyof CameraConfig>(k: K, v: CameraConfig[K]) =>
    setCamera((s) => ({ ...s, [k]: v }));
  return (
    <>
      <SectionHeader
        label="Camera"
        open={open}
        onToggle={() => setOpen((s) => !s)}
      />
      {open && (
        <div className="px-3 pb-3 space-y-3">
          <SubLabel>Projection</SubLabel>
          <Slider
            label="FOV"
            value={camera.fov}
            min={10}
            max={120}
            step={1}
            onChange={(v) => set("fov", v)}
            displayValue={`${camera.fov}°`}
          />
          <NumberInput
            label="Near clip"
            value={camera.near}
            onChange={(v) => set("near", Math.max(0.0001, v))}
            step={0.001}
          />
          <NumberInput
            label="Far clip"
            value={camera.far}
            onChange={(v) => set("far", Math.max(1, v))}
            step={10}
          />

          <SubLabel>Orbit Controls</SubLabel>
          <Toggle
            label="Enable orbit"
            checked={camera.orbitEnabled}
            onChange={(v) => set("orbitEnabled", v)}
          />
          {camera.orbitEnabled && (
            <>
              <Toggle
                label="Enable pan"
                checked={camera.enablePan}
                onChange={(v) => set("enablePan", v)}
              />
              <Toggle
                label="Enable zoom"
                checked={camera.enableZoom}
                onChange={(v) => set("enableZoom", v)}
              />
              <Toggle
                label="Auto-rotate orbit"
                checked={camera.autoRotateOrbit}
                onChange={(v) => set("autoRotateOrbit", v)}
              />
              {camera.autoRotateOrbit && (
                <Slider
                  label="Orbit speed"
                  value={camera.autoRotateOrbitSpeed}
                  min={-20}
                  max={20}
                  step={0.5}
                  onChange={(v) => set("autoRotateOrbitSpeed", v)}
                />
              )}
              <Slider
                label="Damping"
                value={camera.dampingFactor}
                min={0.01}
                max={0.5}
                step={0.01}
                onChange={(v) => set("dampingFactor", v)}
              />
              <Slider
                label="Min distance"
                value={camera.minDistance}
                min={0.001}
                max={10}
                step={0.001}
                onChange={(v) => set("minDistance", v)}
              />
              <Slider
                label="Max distance"
                value={camera.maxDistance}
                min={1}
                max={500}
                step={1}
                onChange={(v) => set("maxDistance", v)}
              />
              <Slider
                label="Min polar °"
                value={camera.minPolarAngle}
                min={0}
                max={180}
                step={1}
                onChange={(v) => set("minPolarAngle", v)}
                displayValue={`${camera.minPolarAngle}°`}
              />
              <Slider
                label="Max polar °"
                value={camera.maxPolarAngle}
                min={0}
                max={180}
                step={1}
                onChange={(v) => set("maxPolarAngle", v)}
                displayValue={`${camera.maxPolarAngle}°`}
              />
            </>
          )}

          {!camera.orbitEnabled && (
            <>
              <SubLabel>Position</SubLabel>
              <XYZSliders
                prefix="Cam"
                values={[camera.posX, camera.posY, camera.posZ]}
                onChange={(ax, v) => set(("pos" + ax) as keyof CameraConfig, v)}
                min={-20}
                max={20}
              />
              <SubLabel>Look-at target</SubLabel>
              <XYZSliders
                prefix="Tgt"
                values={[camera.targetX, camera.targetY, camera.targetZ]}
                onChange={(ax, v) =>
                  set(("target" + ax) as keyof CameraConfig, v)
                }
                min={-10}
                max={10}
              />
            </>
          )}
          <ResetBtn onClick={() => setCamera(D_CAMERA)} />
        </div>
      )}
    </>
  );
}

// ─── Section: Render ──────────────────────────────────────────────────────────

function RenderSection({
  config,
  setConfig,
}: {
  config: RenderConfig;
  setConfig: React.Dispatch<React.SetStateAction<RenderConfig>>;
}) {
  const [open, setOpen] = useState(false);
  const set = <K extends keyof RenderConfig>(k: K, v: RenderConfig[K]) =>
    setConfig((s) => ({ ...s, [k]: v }));
  return (
    <>
      <SectionHeader
        label="Render"
        open={open}
        onToggle={() => setOpen((s) => !s)}
      />
      {open && (
        <div className="px-3 pb-3 space-y-3">
          <SubLabel>Tone mapping</SubLabel>
          <Select
            label="Mode"
            value={config.toneMapping}
            options={TONE_MAPS}
            onChange={(v) => set("toneMapping", v)}
          />
          <Slider
            label="Exposure"
            value={config.toneMappingExposure}
            min={0}
            max={5}
            step={0.05}
            onChange={(v) => set("toneMappingExposure", v)}
          />

          <SubLabel>Background</SubLabel>
          <Toggle
            label="Use env as background"
            checked={config.useEnvBackground}
            onChange={(v) => set("useEnvBackground", v)}
          />
          {!config.useEnvBackground && (
            <ColorPicker
              label="BG color"
              value={config.backgroundColor}
              onChange={(v) => set("backgroundColor", v)}
            />
          )}

          <SubLabel>Shadows</SubLabel>
          <Toggle
            label="Enable shadows"
            checked={config.shadowsEnabled}
            onChange={(v) => set("shadowsEnabled", v)}
            desc="Per-light shadow must also be toggled"
          />

          <SubLabel>Fog</SubLabel>
          <Toggle
            label="Enable fog"
            checked={config.fogEnabled}
            onChange={(v) => set("fogEnabled", v)}
          />
          {config.fogEnabled && (
            <>
              <ColorPicker
                label="Fog color"
                value={config.fogColor}
                onChange={(v) => set("fogColor", v)}
              />
              <Slider
                label="Near"
                value={config.fogNear}
                min={0}
                max={50}
                step={0.5}
                onChange={(v) => set("fogNear", v)}
              />
              <Slider
                label="Far"
                value={config.fogFar}
                min={0}
                max={200}
                step={1}
                onChange={(v) => set("fogFar", v)}
              />
            </>
          )}

          <SubLabel>Debug</SubLabel>
          <Toggle
            label="Wireframe"
            checked={config.wireframe}
            onChange={(v) => set("wireframe", v)}
          />

          <ResetBtn onClick={() => setConfig(D_RENDER)} />
        </div>
      )}
    </>
  );
}

// ─── Section: Material ────────────────────────────────────────────────────────

function MaterialSection({
  config,
  setConfig,
}: {
  config: MaterialOverride;
  setConfig: React.Dispatch<React.SetStateAction<MaterialOverride>>;
}) {
  const [open, setOpen] = useState(false);
  const set = <K extends keyof MaterialOverride>(
    k: K,
    v: MaterialOverride[K],
  ) => setConfig((s) => ({ ...s, [k]: v }));
  return (
    <>
      <SectionHeader
        label="Material Override"
        open={open}
        onToggle={() => setOpen((s) => !s)}
        badge={config.enabled ? "active" : undefined}
      />
      {open && (
        <div className="px-3 pb-3 space-y-3">
          <Toggle
            label="Override material"
            checked={config.enabled}
            onChange={(v) => set("enabled", v)}
            desc="Overrides all mesh materials"
          />
          {config.enabled && (
            <>
              <ColorPicker
                label="Color"
                value={config.color}
                onChange={(v) => set("color", v)}
              />
              <Slider
                label="Roughness"
                value={config.roughness}
                min={0}
                max={1}
                step={0.01}
                onChange={(v) => set("roughness", v)}
              />
              <Slider
                label="Metalness"
                value={config.metalness}
                min={0}
                max={1}
                step={0.01}
                onChange={(v) => set("metalness", v)}
              />
              <Slider
                label="Opacity"
                value={config.opacity}
                min={0}
                max={1}
                step={0.01}
                onChange={(v) => set("opacity", v)}
              />
              <Toggle
                label="Transparent"
                checked={config.transparent}
                onChange={(v) => set("transparent", v)}
              />
            </>
          )}
          <ResetBtn onClick={() => setConfig(D_MATERIAL)} />
        </div>
      )}
    </>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

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
              <WandModel
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
