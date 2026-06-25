export interface Transform {
  posX: number;
  posY: number;
  posZ: number;
  rotX: number;
  rotY: number;
  rotZ: number;
  scale: number;
}

export interface AutoRotate {
  enabled: boolean;
  speed: number;
  axis: "x" | "y" | "z";
}

export interface AmbientLight {
  intensity: number;
  color: string;
}

export interface DirectionalLight {
  enabled: boolean;
  intensity: number;
  color: string;
  posX: number;
  posY: number;
  posZ: number;
  castShadow: boolean;
  showHelper: boolean;
}

export interface PointLight {
  enabled: boolean;
  intensity: number;
  color: string;
  posX: number;
  posY: number;
  posZ: number;
  distance: number;
  decay: number;
  showHelper: boolean;
}

export interface SpotLight {
  enabled: boolean;
  intensity: number;
  color: string;
  posX: number;
  posY: number;
  posZ: number;
  angle: number;
  penumbra: number;
  showHelper: boolean;
}

export interface EnvConfig {
  preset: string;
  showBackground: boolean;
  backgroundBlur: number;
  envIntensity: number;
}

export interface CameraConfig {
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

export interface DOFConfig {
  enabled: boolean;
  focalLength: number;
  bokehScale: number;
}

export interface RenderConfig {
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

export interface MaterialOverride {
  enabled: boolean;
  roughness: number;
  metalness: number;
  color: string;
  opacity: number;
  transparent: boolean;
}

export interface LightConfig {
  ambientIntensity: number;
  dirIntensity: number;
  dirX: number;
  dirY: number;
  dirZ: number;
  dirColor: string;
  envPreset: string;
  showEnv: boolean;
}

export interface GridHelperConfig {
  enabled: boolean;
  size: number;
  divisions: number;
  color1: string;
  color2: string;
}

export interface AxesHelperConfig {
  enabled: boolean;
  size: number;
}

export interface GizmoHelperConfig {
  enabled: boolean;
  alignment: string;
  margin: [number, number];
  type: "viewport" | "viewcube";
}

export interface HelpersConfig {
  grid: GridHelperConfig;
  axes: AxesHelperConfig;
  gizmo: GizmoHelperConfig;
}
