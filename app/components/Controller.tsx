"use client";

import { useState, useCallback } from "react";
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
  D_POINT,
  D_SPOT,
  D_ENV,
  D_CAMERA,
  D_RENDER,
  D_MATERIAL,
  ENV_PRESETS,
  TONE_MAPS,
} from "@/consts/controller";

export function Divider() {
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

// Section: Transform
export function TransformSection({
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
                value={autoRotate.axis || "y"}
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

// Section: Ambient Light
export function AmbientSection({
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

// Section: Directional Light
export function DirLightSection({
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

// Section: Point Light
export function PointLightSection({
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

// Section: Spot Light
export function SpotLightSection({
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

// Section: Environment
export function EnvSection({
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

// Section: Camera
export function CameraSection({
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
          <ResetBtn onClick={() => setCamera(D_CAMERA)} />
        </div>
      )}
    </>
  );
}

// Section: Render
export function RenderSection({
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

// Section: Material
export function MaterialSection({
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
