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
  DOFConfig,
  HelpersConfig,
} from "@/types/controller";

export const D_TRANSFORM: Transform = {
  posX: 0,
  posY: 0,
  posZ: 0.02,
  rotX: 90,
  rotY: 0,
  rotZ: 0,
  scale: 1,
};

export const D_AUTO_ROTATE: AutoRotate = {
  enabled: false,
  speed: 1,
  axis: "y",
};

export const D_AMBIENT: AmbientLight = { intensity: 0.8, color: "#ffffff" };

export const D_DIR1: DirectionalLight = {
  enabled: true,
  intensity: 2,
  color: "#ffffff",
  posX: 4,
  posY: 6,
  posZ: 4,
  castShadow: false,
  showHelper: false,
};

export const D_DIR2: DirectionalLight = {
  enabled: false,
  intensity: 1,
  color: "#4488ff",
  posX: -4,
  posY: 2,
  posZ: -4,
  castShadow: false,
  showHelper: false,
};

export const D_POINT: PointLight = {
  enabled: false,
  intensity: 3,
  color: "#ffaa44",
  posX: 0,
  posY: 2,
  posZ: 0,
  distance: 10,
  decay: 2,
  showHelper: false,
};

export const D_SPOT: SpotLight = {
  enabled: false,
  intensity: 5,
  color: "#ffffff",
  posX: 0,
  posY: 5,
  posZ: 2,
  angle: 0.4,
  penumbra: 0.2,
  showHelper: false,
};

export const D_ENV: EnvConfig = {
  preset: "city",
  showBackground: true,
  backgroundBlur: 0,
  envIntensity: 1,
};

export const D_CAMERA: CameraConfig = {
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

export const D_DOF: DOFConfig = {
  enabled: false,
  focalLength: 0.02, // Controls how deep the in-focus area is
  bokehScale: 2, // Controls the intensity of the blur
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
    size: 10,
    divisions: 10,
    color1: "#444444",
    color2: "#888888",
  },
  axes: {
    enabled: false,
    size: 5,
  },
  gizmo: {
    enabled: false,
    alignment: "bottom-right",
    margin: [80, 80],
    type: "viewcube",
  },
};
