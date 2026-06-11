"use client";

import { useEffect } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import {
  AmbientLight,
  DirectionalLight,
  PointLight,
  SpotLight,
  CameraConfig,
  RenderConfig,
} from "@/types/controller";

// Camera controller (imperative, inside Canvas)
export function CameraController({ config }: { config: CameraConfig }) {
  const { camera } = useThree();

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

// Render settings (inside Canvas)
export function RenderSettings({ config }: { config: RenderConfig }) {
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

// Scene Lights
export function SceneLights({
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
