import {
  Transform,
  AmbientLight,
  DirectionalLight,
  PointLight,
  SpotLight,
  EnvConfig,
  CameraConfig,
  RenderConfig,
  MaterialOverride,
  DOFConfig,
  HelpersConfig,
} from "@/types/controller";

export const D_TRANSFORM: Transform = {
  position: { x: 0, y: 0, z: 0 },
  rotation: { x: 0, y: 0, z: 0 },
  scale: { x: 1, y: 1, z: 1 },
};

export const D_CAMERA: CameraConfig = {
  fov: 45,
  near: 0.001,
  far: 1000,
  position: { x: 0, y: 0, z: 0.5 },
  target: { x: 0, y: 0, z: 0 },
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

export const D_DOF: DOFConfig = {
  enabled: false,
  focalLength: 0.1, // Controls how deep the in-focus area is
  bokehScale: 5, // Controls the intensity of the blur
};

export const D_AMBIENT: AmbientLight = { intensity: 1, color: "#ffffff" };

export const D_DIR1: DirectionalLight = {
  enabled: true,
  intensity: 0.5,
  color: "#ffffff",
  position: { x: 1, y: 1, z: 1 },
  castShadow: false,
  customTargetEnabled: false,
  customTargetPosition: { x: 0, y: 0, z: 0 },
  showHelper: true,
  helperSize: 0.2,
  showPivotControls: true,
  showSphere: true,
  sphereScale: 0.1,
};

export const D_DIR2: DirectionalLight = {
  enabled: false,
  intensity: 1,
  color: "#4488ff",
  position: { x: -4, y: 2, z: -4 },
  castShadow: false,
  customTargetEnabled: false,
  customTargetPosition: { x: 0, y: 0, z: 0 },
  showHelper: true,
  helperSize: 0.2,
  showPivotControls: true,
  showSphere: true,
  sphereScale: 0.1,
};

export const D_POINT1: PointLight = {
  enabled: false,
  intensity: 3,
  color: "#ffaa44",
  position: { x: 0, y: 2, z: 0 },
  distance: 10,
  decay: 2,
  showHelper: true,
  helperSize: 0.2,
  showPivotControls: true,
  showSphere: true,
  sphereScale: 0.1,
};

export const D_POINT2: PointLight = {
  enabled: false,
  intensity: 2,
  color: "#ffaa44",
  position: { x: 2, y: 1, z: 0 },
  distance: 10,
  decay: 2,
  showHelper: true,
  helperSize: 0.2,
  showPivotControls: true,
  showSphere: true,
  sphereScale: 0.1,
};

export const D_SPOT1: SpotLight = {
  enabled: false,
  intensity: 2,
  color: "#ffffff",
  position: { x: 0, y: 5, z: 2 },
  angle: 0.4,
  penumbra: 0.2,
  customTargetEnabled: false,
  customTargetPosition: { x: 0, y: 0, z: 0 },
  showHelper: true,
  showPivotControls: true,
  showSphere: true,
  sphereScale: 0.2,
};

export const D_SPOT2: SpotLight = {
  enabled: false,
  intensity: 5,
  color: "#ffffff",
  position: { x: 0, y: 5, z: 2 },
  angle: 0.4,
  penumbra: 0.2,
  customTargetEnabled: false,
  customTargetPosition: { x: 0, y: 0, z: 0 },
  showHelper: true,
  showPivotControls: true,
  showSphere: true,
  sphereScale: 0.2,
};

export const D_ENV: EnvConfig = {
  preset: "city",
  showBackground: true,
  backgroundBlur: 0,
  envIntensity: 1,
};

export const D_RENDER: RenderConfig = {
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

export const D_MATERIAL: MaterialOverride = {
  enabled: false,
  roughness: 0.5,
  metalness: 0.5,
  color: "#ffffff",
  opacity: 1,
  transparent: false,
};

export const ENV_PRESETS = [
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
export const TONE_MAPS = [
  "None",
  "Linear",
  "Reinhard",
  "Cineon",
  "ACESFilmic",
  "AgX",
  "Neutral",
];

export const D_HELPERS: HelpersConfig = {
  grid: {
    enabled: false,
    size: 1,
    divisions: 10,
    color1: "#888888",
    color2: "#444444",
  },
  axes: {
    enabled: false,
    size: 2,
  },
  gizmo: {
    enabled: true,
    alignment: "bottom-right",
    margin: [80, 80],
    type: "viewcube",
  },
};
