export interface Vector3Type {
  x: number;
  y: number;
  z: number;
}

export interface Transform {
  position: Vector3Type;
  rotation: Vector3Type;
  scale: Vector3Type;
}

export interface AmbientLight {
  intensity: number;
  color: string;
}

export interface DirectionalLight {
  enabled: boolean;
  intensity: number;
  color: string;
  position: Vector3Type;
  castShadow: boolean;
  customTargetEnabled: boolean;
  customTargetPosition: Vector3Type;
  showHelper: boolean;
  helperSize: number;
  showPivotControls: boolean;
  showSphere: boolean;
  sphereScale: number;
}

export interface PointLight {
  enabled: boolean;
  intensity: number;
  color: string;
  position: Vector3Type;
  distance: number;
  decay: number;
  showHelper: boolean;
  helperSize: number;
  showPivotControls: boolean;
  showSphere: boolean;
  sphereScale: number;
}

export interface SpotLight {
  enabled: boolean;
  intensity: number;
  color: string;
  position: Vector3Type;
  angle: number;
  penumbra: number;
  customTargetEnabled: boolean;
  customTargetPosition: Vector3Type;
  showHelper: boolean;
  showPivotControls: boolean;
  showSphere: boolean;
  sphereScale: number;
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
  position: Vector3Type;
  target: Vector3Type;
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
