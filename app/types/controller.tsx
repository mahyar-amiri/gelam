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
  axis?: "x" | "y" | "z";
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
