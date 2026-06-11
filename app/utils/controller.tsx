"use client";

import { useEffect } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { PivotControls } from "@react-three/drei";
import {
  AmbientLight,
  DirectionalLight,
  PointLight,
  SpotLight,
  CameraConfig,
  RenderConfig,
} from "@/types/controller";

// Camera controller (imperative, inside Canvas)
export function CameraController({ config, orbitControlsRef }: { config: CameraConfig, orbitControlsRef?: React.RefObject<OrbitControlsImpl | null> }) {
  const { camera } = useThree();

  useEffect(() => {
    const cam = camera as THREE.PerspectiveCamera;
    cam.fov = config.fov;
    cam.near = config.near;
    cam.far = config.far;
    cam.updateProjectionMatrix();
  }, [camera, config.fov, config.near, config.far]);

  useEffect(() => {
    // If orbit is enabled, we need to manually update both the camera and the orbit controls target
    // If the difference is extremely small, it might be triggered by orbitcontrols itself,
    // so we shouldn't overwrite unless difference is significant enough.
    const posDiff = Math.abs(camera.position.x - config.posX) + Math.abs(camera.position.y - config.posY) + Math.abs(camera.position.z - config.posZ);
    const tgtDiff = orbitControlsRef?.current ? Math.abs(orbitControlsRef.current.target.x - config.targetX) + Math.abs(orbitControlsRef.current.target.y - config.targetY) + Math.abs(orbitControlsRef.current.target.z - config.targetZ) : 0;

    // We only force update from sidebar if the diff is significant (> 0.02 is safe, as we write 0.01 threshold in ModelViewerSettings)
    // Wait, the easiest is to just set it, but to prevent feedback loop, maybe only update if dist is > 0.02
    // Actually, setting camera position and target directly is fine. OrbitControls will pick it up when we call update().
    if (!config.orbitEnabled) {
      camera.position.set(config.posX, config.posY, config.posZ);
      camera.lookAt(config.targetX, config.targetY, config.targetZ);
    } else {
      if (orbitControlsRef?.current && (posDiff > 0.02 || tgtDiff > 0.02)) {
        camera.position.set(config.posX, config.posY, config.posZ);
        orbitControlsRef.current.target.set(config.targetX, config.targetY, config.targetZ);
        orbitControlsRef.current.update();
      }
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
    orbitControlsRef
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
  setDir1,
  dir2,
  setDir2,
  point,
  setPoint,
  spot,
  setSpot,
  renderConfig,
}: {
  ambient: AmbientLight;
  dir1: DirectionalLight;
  setDir1?: React.Dispatch<React.SetStateAction<DirectionalLight>>;
  dir2: DirectionalLight;
  setDir2?: React.Dispatch<React.SetStateAction<DirectionalLight>>;
  point: PointLight;
  setPoint?: React.Dispatch<React.SetStateAction<PointLight>>;
  spot: SpotLight;
  setSpot?: React.Dispatch<React.SetStateAction<SpotLight>>;
  renderConfig: RenderConfig;
}) {
  return (
    <>
      <ambientLight intensity={ambient.intensity} color={ambient.color} />

      {dir1.enabled && (
        <>
          <directionalLight
            position={[dir1.posX, dir1.posY, dir1.posZ]}
            intensity={dir1.intensity}
            color={dir1.color}
            castShadow={renderConfig.shadowsEnabled && dir1.castShadow}
          />
          <PivotControls
            matrix={new THREE.Matrix4().setPosition(dir1.posX, dir1.posY, dir1.posZ)}
            onDrag={(matrix) => {
              const pos = new THREE.Vector3().setFromMatrixPosition(matrix);
              setDir1?.(prev => ({ ...prev, posX: pos.x, posY: pos.y, posZ: pos.z }));
            }}
            scale={0.5}
            anchor={[0, 0, 0]}
            depthTest={false}
          >
            <mesh>
              <sphereGeometry args={[dir1.intensity * 0.05, 16, 16]} />
              <meshBasicMaterial color={dir1.color} />
            </mesh>
          </PivotControls>
        </>
      )}
      {dir2.enabled && (
        <>
          <directionalLight
            position={[dir2.posX, dir2.posY, dir2.posZ]}
            intensity={dir2.intensity}
            color={dir2.color}
            castShadow={renderConfig.shadowsEnabled && dir2.castShadow}
          />
          <PivotControls
            matrix={new THREE.Matrix4().setPosition(dir2.posX, dir2.posY, dir2.posZ)}
            onDrag={(matrix) => {
              const pos = new THREE.Vector3().setFromMatrixPosition(matrix);
              setDir2?.(prev => ({ ...prev, posX: pos.x, posY: pos.y, posZ: pos.z }));
            }}
            scale={0.5}
            anchor={[0, 0, 0]}
            depthTest={false}
          >
            <mesh>
              <sphereGeometry args={[dir2.intensity * 0.05, 16, 16]} />
              <meshBasicMaterial color={dir2.color} />
            </mesh>
          </PivotControls>
        </>
      )}
      {point.enabled && (
        <>
          <pointLight
            position={[point.posX, point.posY, point.posZ]}
            intensity={point.intensity}
            color={point.color}
            distance={point.distance}
            decay={point.decay}
          />
          <PivotControls
            matrix={new THREE.Matrix4().setPosition(point.posX, point.posY, point.posZ)}
            onDrag={(matrix) => {
              const pos = new THREE.Vector3().setFromMatrixPosition(matrix);
              setPoint?.(prev => ({ ...prev, posX: pos.x, posY: pos.y, posZ: pos.z }));
            }}
            scale={0.5}
            anchor={[0, 0, 0]}
            depthTest={false}
          >
            <mesh>
              <sphereGeometry args={[point.intensity * 0.05, 16, 16]} />
              <meshBasicMaterial color={point.color} />
            </mesh>
          </PivotControls>
        </>
      )}
      {spot.enabled && (
        <>
          <spotLight
            position={[spot.posX, spot.posY, spot.posZ]}
            intensity={spot.intensity}
            color={spot.color}
            angle={spot.angle}
            penumbra={spot.penumbra}
            castShadow={renderConfig.shadowsEnabled}
          />
          <PivotControls
            matrix={new THREE.Matrix4().setPosition(spot.posX, spot.posY, spot.posZ)}
            onDrag={(matrix) => {
              const pos = new THREE.Vector3().setFromMatrixPosition(matrix);
              setSpot?.(prev => ({ ...prev, posX: pos.x, posY: pos.y, posZ: pos.z }));
            }}
            scale={0.5}
            anchor={[0, 0, 0]}
            depthTest={false}
          >
            <mesh>
              <sphereGeometry args={[spot.intensity * 0.05, 16, 16]} />
              <meshBasicMaterial color={spot.color} />
            </mesh>
          </PivotControls>
        </>
      )}
    </>
  );
}
