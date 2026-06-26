"use client";

import { useEffect, useRef, useMemo } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import {
  PivotControls,
  useHelper,
  GizmoHelper,
  GizmoViewport,
  GizmoViewcube,
} from "@react-three/drei";
import {
  AmbientLight,
  DirectionalLight,
  PointLight,
  SpotLight,
  CameraConfig,
  RenderConfig,
  HelpersConfig,
} from "@/types/controller";

// Camera controller (imperative, inside Canvas)
export function CameraController({
  config,
  orbitControlsRef,
}: {
  config: CameraConfig;
  orbitControlsRef?: React.RefObject<OrbitControlsImpl | null>;
}) {
  const { camera } = useThree();

  useEffect(() => {
    const cam = camera as THREE.PerspectiveCamera;
    cam.fov = config.fov;
    cam.near = config.near;
    cam.far = config.far;
    cam.updateProjectionMatrix();
  }, [camera, config.fov, config.near, config.far]);

  useEffect(() => {
    const posDiff =
      Math.abs(camera.position.x - config.position.x) +
      Math.abs(camera.position.y - config.position.y) +
      Math.abs(camera.position.z - config.position.z);
    const tgtDiff = orbitControlsRef?.current
      ? Math.abs(orbitControlsRef.current.target.x - config.target.x) +
        Math.abs(orbitControlsRef.current.target.y - config.target.y) +
        Math.abs(orbitControlsRef.current.target.z - config.target.z)
      : 0;

    if (!config.orbitEnabled) {
      camera.position.set(
        config.position.x,
        config.position.y,
        config.position.z,
      );
      camera.lookAt(config.target.x, config.target.y, config.target.z);
    } else {
      if (orbitControlsRef?.current && (posDiff > 0.02 || tgtDiff > 0.02)) {
        camera.position.set(
          config.position.x,
          config.position.y,
          config.position.z,
        );
        orbitControlsRef.current.target.set(
          config.target.x,
          config.target.y,
          config.target.z,
        );
        orbitControlsRef.current.update();
      }
    }
  }, [
    camera,
    config.orbitEnabled,
    config.position.x,
    config.position.y,
    config.position.z,
    config.target.x,
    config.target.y,
    config.target.z,
    orbitControlsRef,
  ]);

  return null;
}

// Render settings (inside Canvas)
export function RenderSettings({ config }: { config: RenderConfig }) {
  const { gl } = useThree();

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

  return (
    <>
      {!config.useEnvBackground && (
        <color attach="background" args={[config.backgroundColor]} />
      )}
      {config.fogEnabled && (
        <fog
          attach="fog"
          args={[config.fogColor, config.fogNear, config.fogFar]}
        />
      )}
    </>
  );
}

// Scene Helpers
export function SceneHelpers({ config }: { config: HelpersConfig }) {
  return (
    <>
      {config.grid.enabled && (
        <gridHelper
          args={[
            config.grid.size,
            config.grid.divisions,
            config.grid.color1,
            config.grid.color2,
          ]}
        />
      )}
      {config.axes.enabled && <axesHelper args={[config.axes.size]} />}
      {config.gizmo.enabled && (
        <GizmoHelper
          alignment={config.gizmo.alignment as any}
          margin={config.gizmo.margin}
        >
          {config.gizmo.type === "viewport" ? (
            <GizmoViewport />
          ) : (
            <GizmoViewcube />
          )}
        </GizmoHelper>
      )}
    </>
  );
}

// Scene Lights
function DirLightWithHelper({
  light,
  renderConfig,
  setLights,
  propPrefix,
  modelPosition,
}: {
  light: DirectionalLight;
  renderConfig: RenderConfig;
  setLights: any;
  propPrefix: string;
  modelPosition?: {x:number, y:number, z:number};
}) {
  const ref = useRef<any>(null);
  useHelper(
    light.showHelper ? ref : false,
    THREE.DirectionalLightHelper,
    0.1,
    light.color,
  );

  const matrix = useMemo(
    () =>
      new THREE.Matrix4().setPosition(
        light.position.x,
        light.position.y,
        light.position.z,
      ),
    [light.position.x, light.position.y, light.position.z],
  );

  return (
    <>
      <directionalLight
        ref={ref}
        position={[light.position.x, light.position.y, light.position.z]}
        intensity={light.intensity}
        color={light.color}
        castShadow={renderConfig.shadowsEnabled && light.castShadow}
      />
      <PivotControls
        matrix={matrix}
        onDrag={(m) => {
          const pos = new THREE.Vector3().setFromMatrixPosition(m);
          if (
            Math.abs(pos.x - light.position.x) > 0.01 ||
            Math.abs(pos.y - light.position.y) > 0.01 ||
            Math.abs(pos.z - light.position.z) > 0.01
          ) {
            setLights?.({
              [`${propPrefix}Position`]: { x: pos.x, y: pos.y, z: pos.z },
            });
          }
        }}
        scale={0.25}
        anchor={[0, 0, 0]}
        depthTest={false}
      >
        <mesh>
          <sphereGeometry args={[light.intensity * 0.05, 16, 16]} />
          <meshBasicMaterial color={light.color} />
        </mesh>
      </PivotControls>
    </>
  );
}

function PointLightWithHelper({
  light,
  setLights,
  propPrefix,
}: {
  light: PointLight;
  setLights: any;
  propPrefix: string;
}) {
  const ref = useRef<any>(null);
  useHelper(
    light.showHelper ? ref : false,
    THREE.PointLightHelper,
    1,
    light.color,
  );

  const matrix = useMemo(
    () =>
      new THREE.Matrix4().setPosition(
        light.position.x,
        light.position.y,
        light.position.z,
      ),
    [light.position.x, light.position.y, light.position.z],
  );

  return (
    <>
      <pointLight
        ref={ref}
        position={[light.position.x, light.position.y, light.position.z]}
        intensity={light.intensity}
        color={light.color}
        distance={light.distance}
        decay={light.decay}
      />
      <PivotControls
        matrix={matrix}
        onDrag={(m) => {
          const pos = new THREE.Vector3().setFromMatrixPosition(m);
          if (
            Math.abs(pos.x - light.position.x) > 0.01 ||
            Math.abs(pos.y - light.position.y) > 0.01 ||
            Math.abs(pos.z - light.position.z) > 0.01
          ) {
            setLights?.({
              [`${propPrefix}Position`]: { x: pos.x, y: pos.y, z: pos.z },
            });
          }
        }}
        scale={0.5}
        anchor={[0, 0, 0]}
        depthTest={false}
      >
        <mesh>
          <sphereGeometry args={[light.intensity * 0.05, 16, 16]} />
          <meshBasicMaterial color={light.color} />
        </mesh>
      </PivotControls>
    </>
  );
}

function SpotLightWithHelper({
  light,
  renderConfig,
  setLights,
  propPrefix,
  modelPosition,
}: {
  light: SpotLight;
  renderConfig: RenderConfig;
  setLights: any;
  propPrefix: string;
  modelPosition?: {x:number, y:number, z:number};
}) {
  const ref = useRef<any>(null);
  useHelper(
    light.showHelper ? ref : false,
    THREE.SpotLightHelper,
    light.color as any,
  );

  const matrix = useMemo(
    () =>
      new THREE.Matrix4().setPosition(
        light.position.x,
        light.position.y,
        light.position.z,
      ),
    [light.position.x, light.position.y, light.position.z],
  );

  return (
    <>
      <spotLight
        ref={ref}
        position={[light.position.x, light.position.y, light.position.z]}
        intensity={light.intensity}
        color={light.color}
        angle={light.angle}
        penumbra={light.penumbra}
        castShadow={renderConfig.shadowsEnabled}
      />
      <PivotControls
        matrix={matrix}
        onDrag={(m) => {
          const pos = new THREE.Vector3().setFromMatrixPosition(m);
          if (
            Math.abs(pos.x - light.position.x) > 0.01 ||
            Math.abs(pos.y - light.position.y) > 0.01 ||
            Math.abs(pos.z - light.position.z) > 0.01
          ) {
            setLights?.({
              [`${propPrefix}Position`]: { x: pos.x, y: pos.y, z: pos.z },
            });
          }
        }}
        scale={0.5}
        anchor={[0, 0, 0]}
        depthTest={false}
      >
        <mesh>
          <sphereGeometry args={[light.intensity * 0.05, 16, 16]} />
          <meshBasicMaterial color={light.color} />
        </mesh>
      </PivotControls>
    </>
  );
}

export function SceneLights({
  ambient,
  dir1,
  dir2,
  point1,
  point2,
  spot1,
  spot2,
  modelPosition = {x:0, y:0, z:0},
  renderConfig,
  setLights,
}: {
  ambient: AmbientLight;
  dir1: DirectionalLight;
  dir2: DirectionalLight;
  point1: PointLight;
  point2: PointLight;
  spot1: SpotLight;
  spot2: SpotLight;
  modelPosition?: {x:number, y:number, z:number};
  renderConfig: RenderConfig;
  setLights?: any;
}) {
  return (
    <>
      <ambientLight intensity={ambient.intensity} color={ambient.color} />

      {dir1.enabled && (
        <DirLightWithHelper
          light={dir1}
          renderConfig={renderConfig}
          setLights={setLights}
          propPrefix="dir1"
          modelPosition={modelPosition}
        />
      )}
      {dir2.enabled && (
        <DirLightWithHelper
          light={dir2}
          renderConfig={renderConfig}
          setLights={setLights}
          propPrefix="dir2"
          modelPosition={modelPosition}
        />
      )}
      {point1.enabled && (
        <PointLightWithHelper
          light={point1}
          setLights={setLights}
          propPrefix="point1"
        />
      )}
      {point2.enabled && (
        <PointLightWithHelper
          light={point2}
          setLights={setLights}
          propPrefix="point2"
        />
      )}
      {spot1.enabled && (
        <SpotLightWithHelper
          light={spot1}
          renderConfig={renderConfig}
          setLights={setLights}
          propPrefix="spot1"
          modelPosition={modelPosition}
        />
      )}
      {spot2.enabled && (
        <SpotLightWithHelper
          light={spot2}
          renderConfig={renderConfig}
          setLights={setLights}
          propPrefix="spot2"
          modelPosition={modelPosition}
        />
      )}
    </>
  );
}
