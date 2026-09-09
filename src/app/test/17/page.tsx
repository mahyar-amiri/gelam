"use client";

import { useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useTexture } from "@react-three/drei";
import * as THREE from "three";

interface Point2D {
  x: number;
  y: number;
}

export interface TextureSources {
  front: string;
  back: string;
  edge: string;
}

export interface RoundedCylinderProps {
  radius: number;
  height: number;
  edge: number;
  textures: TextureSources;
}

export interface RoundedShieldProps {
  width: number;
  height: number;
  depth: number;
  edge: number;
  textures: TextureSources;
}

export interface RoundedPlaqueProps {
  width: number;
  length: number;
  height: number;
  edge: number;
  textures: TextureSources;
}

export function RoundedCylinder({
  radius,
  height,
  edge,
  textures,
}: RoundedCylinderProps) {
  const r = radius;
  const h = height;
  const f = Math.min(edge, h / 2, r / 2);
  const flatRadius = r - f;

  // Load face textures via drei hook
  const loadedTextures = useTexture({
    front: textures.front,
    back: textures.back,
    edge: textures.edge,
  });

  useMemo(() => {
    // Front & Back: Clamp edges so the artwork does not bleed
    [loadedTextures.front, loadedTextures.back].forEach((tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.wrapS = THREE.ClampToEdgeWrapping;
      tex.wrapT = THREE.ClampToEdgeWrapping;
      tex.repeat.set(1, 1);
      tex.anisotropy = 16;
      tex.needsUpdate = true;
    });

    // Edge: Repeat horizontally around the perimeter
    loadedTextures.edge.colorSpace = THREE.SRGBColorSpace;
    loadedTextures.edge.wrapS = THREE.RepeatWrapping;
    loadedTextures.edge.wrapT = THREE.ClampToEdgeWrapping;
    loadedTextures.edge.repeat.set(8, 1);
    loadedTextures.edge.anisotropy = 16;
    loadedTextures.edge.needsUpdate = true;
  }, [loadedTextures]);

  // Flat circular top geometry
  const topGeometry = useMemo(
    () => new THREE.CircleGeometry(flatRadius, 128),
    [flatRadius]
  );

  // Flat circular bottom geometry
  const bottomGeometry = useMemo(
    () => new THREE.CircleGeometry(flatRadius, 128),
    [flatRadius]
  );

  // Rim profile: bottom fillet -> side wall -> top fillet
  const rimGeometry = useMemo(() => {
    const profile: THREE.Vector2[] = [];

    // Bottom rounded fillet
    const bottomCenterY = -h / 2 + f;
    for (let i = 0; i <= 12; i++) {
      const theta = -Math.PI / 2 + (i / 12) * (Math.PI / 2);
      profile.push(
        new THREE.Vector2(
          r - f + f * Math.cos(theta),
          bottomCenterY + f * Math.sin(theta)
        )
      );
    }

    // Vertical side wall
    profile.push(new THREE.Vector2(r, h / 2 - f));

    // Top rounded fillet
    const topCenterY = h / 2 - f;
    for (let i = 0; i <= 12; i++) {
      const theta = (i / 12) * (Math.PI / 2);
      profile.push(
        new THREE.Vector2(
          r - f + f * Math.cos(theta),
          topCenterY + f * Math.sin(theta)
        )
      );
    }

    const geo = new THREE.LatheGeometry(profile, 128);
    geo.computeVertexNormals();
    return geo;
  }, [r, h, f]);

  return (
    <group>
      {/* Front / Top Face */}
      <mesh
        geometry={topGeometry}
        position={[0, h / 2, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial
          map={loadedTextures.front}
          roughness={0.6}
          metalness={0}
        />
      </mesh>

      {/* Back / Bottom Face */}
      <mesh
        geometry={bottomGeometry}
        position={[0, -h / 2, 0]}
        rotation={[Math.PI / 2, 0, 0]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial
          map={loadedTextures.back}
          roughness={0.6}
          metalness={0}
        />
      </mesh>

      {/* Edge & Filleted Corners */}
      <mesh geometry={rimGeometry} castShadow receiveShadow>
        <meshStandardMaterial
          map={loadedTextures.edge}
          roughness={0.6}
          metalness={0}
        />
      </mesh>
    </group>
  );
}

export function RoundedShield({
  width,
  height,
  depth,
  edge,
  textures,
}: RoundedShieldProps) {
  const hw = width / 2;
  const hh = height / 2;

  // Load face and edge textures
  const loadedTextures = useTexture({
    front: textures.front,
    back: textures.back,
    edge: textures.edge,
  });

  useMemo(() => {
    // Front & Back: Clamp edges so artwork doesn't bleed
    [loadedTextures.front, loadedTextures.back].forEach((tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.wrapS = THREE.ClampToEdgeWrapping;
      tex.wrapT = THREE.ClampToEdgeWrapping;
      tex.repeat.set(1, 1);
      tex.anisotropy = 16;
      tex.needsUpdate = true;
    });

    // Edge: Repeat horizontally around the shield rim
    loadedTextures.edge.colorSpace = THREE.SRGBColorSpace;
    loadedTextures.edge.wrapS = THREE.RepeatWrapping;
    loadedTextures.edge.wrapT = THREE.ClampToEdgeWrapping;
    loadedTextures.edge.repeat.set(8, 1);
    loadedTextures.edge.anisotropy = 16;
    loadedTextures.edge.needsUpdate = true;
  }, [loadedTextures]);

  // Generate 2D shield contour matching the escutcheon silhouette
  const shieldShape = useMemo(() => {
    const shape = new THREE.Shape();
    const cornerRadius = 2;
    const topArchHeight = 3.5;

    // Start at bottom tip
    shape.moveTo(0, -hh);

    // Bottom-right inward curve up to the flank
    shape.bezierCurveTo(
      hw * 0.7, -hh * 0.7,
      hw, -hh * 0.4,
      hw, 0
    );

    // Right flank up towards the top-right corner
    shape.bezierCurveTo(
      hw, hh * 0.35,
      hw, hh * 0.65,
      hw, hh - cornerRadius - 1.2
    );

    // Rounded top-right corner
    shape.quadraticCurveTo(
      hw, hh - 1.2,
      hw - cornerRadius, hh - 1.2
    );

    // Convex top edge arching through the center
    shape.quadraticCurveTo(
      0, hh + topArchHeight,
      -(hw - cornerRadius), hh - 1.2
    );

    // Rounded top-left corner
    shape.quadraticCurveTo(
      -hw, hh - 1.2,
      -hw, hh - cornerRadius - 1.2
    );

    // Left flank down
    shape.bezierCurveTo(
      -hw, hh * 0.65,
      -hw, hh * 0.35,
      -hw, 0
    );

    // Bottom-left curve back to the bottom tip
    shape.bezierCurveTo(
      -hw, -hh * 0.4,
      -hw * 0.7, -hh * 0.7,
      0, -hh
    );

    return shape;
  }, [hw, hh]);

  // Build extruded, filleted geometry and partition it into Front, Back, and Rim geometries
  const { frontGeometry, backGeometry, rimGeometry } = useMemo(() => {
    const bevel = Math.min(edge, depth / 2 - 0.2);
    const extrudeThickness = depth - bevel * 2;

    const baseGeo = new THREE.ExtrudeGeometry(shieldShape, {
      steps: 1,
      depth: extrudeThickness,
      bevelEnabled: true,
      bevelThickness: bevel,
      bevelSize: bevel,
      bevelOffset: -bevel,
      bevelSegments: 8,
      curveSegments: 64,
    });

    baseGeo.center();
    baseGeo.computeVertexNormals();

    const pos = baseGeo.attributes.position;
    const norm = baseGeo.attributes.normal;
    const index = baseGeo.index;

    // Handle both indexed and non-indexed geometry
    const vertexCount = index ? index.count : pos.count;
    const getVertexIdx = (i: number) => (index ? index.getX(i) : i);

    baseGeo.computeBoundingBox();
    const bbox = baseGeo.boundingBox!;
    const minZ = bbox.min.z;
    const maxZ = bbox.max.z;
    const minX = bbox.min.x;
    const maxX = bbox.max.x;
    const minY = bbox.min.y;
    const maxY = bbox.max.y;
    const spanX = maxX - minX;
    const spanY = maxY - minY;
    const spanZ = maxZ - minZ;

    const zTolerance = spanZ * 0.02;

    const frontIdx: number[] = [];
    const backIdx: number[] = [];
    const rimIdx: number[] = [];

    // Separate triangles into Front face, Back face, and Rim/Bevel
    for (let i = 0; i < vertexCount; i += 3) {
      const a = getVertexIdx(i);
      const b = getVertexIdx(i + 1);
      const c = getVertexIdx(i + 2);

      const za = pos.getZ(a);
      const zb = pos.getZ(b);
      const zc = pos.getZ(c);

      const isFront =
        maxZ - za < zTolerance &&
        maxZ - zb < zTolerance &&
        maxZ - zc < zTolerance;

      const isBack =
        za - minZ < zTolerance &&
        zb - minZ < zTolerance &&
        zc - minZ < zTolerance;

      if (isFront) {
        frontIdx.push(a, b, c);
      } else if (isBack) {
        backIdx.push(a, b, c);
      } else {
        rimIdx.push(a, b, c);
      }
    }

    // Front geometry with normalized [0, 1] planar UVs
    const frontPos: number[] = [];
    const frontNorm: number[] = [];
    const frontUVs: number[] = [];
    for (let i = 0; i < frontIdx.length; i++) {
      const idx = frontIdx[i];
      const x = pos.getX(idx);
      const y = pos.getY(idx);
      frontPos.push(x, y, pos.getZ(idx));
      frontNorm.push(norm.getX(idx), norm.getY(idx), norm.getZ(idx));
      frontUVs.push((x - minX) / spanX, (y - minY) / spanY);
    }
    const frontGeo = new THREE.BufferGeometry();
    frontGeo.setAttribute("position", new THREE.Float32BufferAttribute(frontPos, 3));
    frontGeo.setAttribute("normal", new THREE.Float32BufferAttribute(frontNorm, 3));
    frontGeo.setAttribute("uv", new THREE.Float32BufferAttribute(frontUVs, 2));

    // Back geometry with horizontally mirrored UVs
    const backPos: number[] = [];
    const backNorm: number[] = [];
    const backUVs: number[] = [];
    for (let i = 0; i < backIdx.length; i++) {
      const idx = backIdx[i];
      const x = pos.getX(idx);
      const y = pos.getY(idx);
      backPos.push(x, y, pos.getZ(idx));
      backNorm.push(norm.getX(idx), norm.getY(idx), norm.getZ(idx));
      backUVs.push((maxX - x) / spanX, (y - minY) / spanY);
    }
    const backGeo = new THREE.BufferGeometry();
    backGeo.setAttribute("position", new THREE.Float32BufferAttribute(backPos, 3));
    backGeo.setAttribute("normal", new THREE.Float32BufferAttribute(backNorm, 3));
    backGeo.setAttribute("uv", new THREE.Float32BufferAttribute(backUVs, 2));

    // Rim geometry with perimeter polar wrap and seam correction
    const rimPos: number[] = [];
    const rimNorm: number[] = [];
    const rimUVs: number[] = [];
    for (let i = 0; i < rimIdx.length; i += 3) {
      const tri = [rimIdx[i], rimIdx[i + 1], rimIdx[i + 2]];

      const angles = tri.map((idx) => {
        const x = pos.getX(idx);
        const y = pos.getY(idx);
        return (Math.atan2(x, y) + Math.PI) / (2 * Math.PI);
      });

      if (
        Math.abs(angles[0] - angles[1]) > 0.5 ||
        Math.abs(angles[1] - angles[2]) > 0.5 ||
        Math.abs(angles[0] - angles[2]) > 0.5
      ) {
        for (let k = 0; k < 3; k++) {
          if (angles[k] < 0.5) angles[k] += 1.0;
        }
      }

      for (let k = 0; k < 3; k++) {
        const idx = tri[k];
        rimPos.push(pos.getX(idx), pos.getY(idx), pos.getZ(idx));
        rimNorm.push(norm.getX(idx), norm.getY(idx), norm.getZ(idx));
        const z = pos.getZ(idx);
        rimUVs.push(angles[k], (z - minZ) / spanZ);
      }
    }
    const rimGeo = new THREE.BufferGeometry();
    rimGeo.setAttribute("position", new THREE.Float32BufferAttribute(rimPos, 3));
    rimGeo.setAttribute("normal", new THREE.Float32BufferAttribute(rimNorm, 3));
    rimGeo.setAttribute("uv", new THREE.Float32BufferAttribute(rimUVs, 2));

    baseGeo.dispose();

    return {
      frontGeometry: frontGeo,
      backGeometry: backGeo,
      rimGeometry: rimGeo,
    };
  }, [shieldShape, depth, edge]);

  return (
    <group rotation={[-Math.PI / 2, 0, 0]}>
      {/* Front / Top Face */}
      <mesh geometry={frontGeometry} castShadow receiveShadow>
        <meshStandardMaterial
          map={loadedTextures.front}
          roughness={0.65}
          metalness={0.05}
        />
      </mesh>

      {/* Back / Bottom Face */}
      <mesh geometry={backGeometry} castShadow receiveShadow>
        <meshStandardMaterial
          map={loadedTextures.back}
          roughness={0.65}
          metalness={0.05}
        />
      </mesh>

      {/* Edge & Filleted Corners */}
      <mesh geometry={rimGeometry} castShadow receiveShadow>
        <meshStandardMaterial
          map={loadedTextures.edge}
          roughness={0.7}
          metalness={0.05}
        />
      </mesh>
    </group>
  );
}

/**
 * Builds the symmetrical 2D cartouche / bracket plaque contour with:
 * - Convex center crown arches
 * - Stepped inward cove notches
 * - Rounded outer corner lobes (ears)
 */
function getPlaqueContourPoints(w: number, l: number, samplesPerSegment = 10): Point2D[] {
  // Key normalized control points for Quadrant 1 (x >= 0, y >= 0)
  // Mirroring across the diagonal creates balanced corner brackets
  const q1: Point2D[] = [];

  // 1. Top Crown Arch (from top-center to notch)
  for (let i = 0; i <= samplesPerSegment; i++) {
    const t = i / samplesPerSegment;
    const u = 0.5 * t;
    const v = 1 - 0.2 * Math.pow(t, 2);
    q1.push({ x: u * w, y: v * l });
  }

  // 2. Top-Right Inward Bracket Notch (step inward, then right)
  q1.push({ x: 0.6 * w, y: 0.78 * l });
  q1.push({ x: 0.6 * w, y: 0.78 * l });

  // 3. Corner Ear Arc (rounded outward corner tab)
  const earCenterX = 0.63 * w;
  const earCenterY = 0.63 * l;
  const earRadiusX = 0.15 * w;
  const earRadiusY = 0.15 * l;
  const earSamples = 16;
  for (let i = 0; i <= earSamples; i++) {
    const theta = Math.PI / 2 - (i / earSamples) * (Math.PI / 2);
    q1.push({
      x: earCenterX + earRadiusX * Math.cos(theta),
      y: earCenterY + earRadiusY * Math.sin(theta),
    });
  }

  // 4. Side Inward Bracket Notch (step down, then outward)
  q1.push({ x: 0.8 * w, y: 0.55 * l });
  q1.push({ x: 0.8 * w, y: 0.55 * l });

  // 5. Right Side Crown Arch (from notch to right-center)
  for (let i = 1; i <= samplesPerSegment; i++) {
    const t = i / samplesPerSegment;
    const v = 0.55 * (1 - t);
    const u = 1 - 0.08 * Math.pow(1 - t, 4);
    q1.push({ x: u * w, y: v * l });
  }

  // Mirror across all four quadrants to generate a closed symmetrical perimeter
  const fullLoop: Point2D[] = [];

  // Q1: (+X, +Y)
  for (let i = 0; i < q1.length; i++) {
    fullLoop.push({ x: q1[i].x, y: q1[i].y });
  }
  // Q4: (+X, -Y)
  for (let i = q1.length - 2; i >= 0; i--) {
    fullLoop.push({ x: q1[i].x, y: -q1[i].y });
  }
  // Q3: (-X, -Y)
  for (let i = 1; i < q1.length; i++) {
    fullLoop.push({ x: -q1[i].x, y: -q1[i].y });
  }
  // Q2: (-X, +Y)
  for (let i = q1.length - 2; i > 0; i--) {
    fullLoop.push({ x: -q1[i].x, y: q1[i].y });
  }

  return fullLoop;
}

export function RoundedPlaque({
  width,
  length,
  height,
  edge,
  textures,
}: RoundedPlaqueProps) {
  const halfW = width / 2;
  const halfL = length / 2;
  const f = Math.min(edge, height / 2.1, halfL / 4);

  const loadedTextures = useTexture({
    front: textures.front,
    back: textures.back,
    edge: textures.edge,
  });

  useMemo(() => {
    // Front & Back: Clamp texture so the border and wood grain fit cleanly
    [loadedTextures.front, loadedTextures.back].forEach((tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.wrapS = THREE.ClampToEdgeWrapping;
      tex.wrapT = THREE.ClampToEdgeWrapping;
      tex.repeat.set(1, 1);
      tex.anisotropy = 16;
      tex.needsUpdate = true;
    });

    // Edge: Wrap wood grain horizontally around the perimeter
    loadedTextures.edge.colorSpace = THREE.SRGBColorSpace;
    loadedTextures.edge.wrapS = THREE.RepeatWrapping;
    loadedTextures.edge.wrapT = THREE.ClampToEdgeWrapping;
    loadedTextures.edge.repeat.set(6, 1);
    loadedTextures.edge.anisotropy = 16;
    loadedTextures.edge.needsUpdate = true;
  }, [loadedTextures]);

  // Base outer contour points and 2D normals
  const { contourPoints, normals } = useMemo(() => {
    const pts = getPlaqueContourPoints(halfW, halfL, 10);
    const n = pts.length;
    const normList: Point2D[] = [];

    for (let i = 0; i < n; i++) {
      const prev = pts[(i - 1 + n) % n];
      const next = pts[(i + 1) % n];
      const dx = next.x - prev.x;
      const dy = next.y - prev.y;
      const len = Math.hypot(dx, dy) || 1;
      // 2D outward normal for CCW loop: (dy/len, -dx/len)
      normList.push({ x: dy / len, y: -dx / len });
    }

    return { contourPoints: pts, normals: normList };
  }, [halfW, halfL]);

  // Flat top face geometry (inset by fillet radius f)
  const topGeometry = useMemo(() => {
    const shape = new THREE.Shape();
    const pts = contourPoints.map((pt, i) => ({
      x: pt.x - f * normals[i].x,
      y: pt.y - f * normals[i].y,
    }));

    shape.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) {
      shape.lineTo(pts[i].x, pts[i].y);
    }
    shape.closePath();

    const geo = new THREE.ShapeGeometry(shape, 64);
    // Normalize planar UVs across [0, 1] bounds
    const pos = geo.attributes.position;
    const uvs = new Float32Array(pos.count * 2);
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      uvs[i * 2] = (x + halfW) / (2 * halfW);
      uvs[i * 2 + 1] = (y + halfL) / (2 * halfL);
    }
    geo.setAttribute("uv", new THREE.BufferAttribute(uvs, 2));
    geo.computeVertexNormals();
    return geo;
  }, [contourPoints, normals, halfW, halfL, f]);

  // Flat bottom face geometry
  const bottomGeometry = useMemo(() => {
    return topGeometry.clone();
  }, [topGeometry]);

  // Swept filleted rim: bottom roundover -> vertical wall -> top roundover
  const rimGeometry = useMemo(() => {
    // 1. Vertical profile
    const profile: { y: number; offset: number }[] = [];
    const filletSteps = 2;

    // Bottom fillet
    for (let i = 0; i <= filletSteps; i++) {
      const theta = -Math.PI / 2 + (i / filletSteps) * (Math.PI / 2);
      profile.push({
        y: -height / 2 + f + f * Math.sin(theta),
        offset: -f * (1 + Math.cos(theta)),
      });
    }

    // Top fillet
    for (let i = 0; i <= filletSteps; i++) {
      const theta = (i / filletSteps) * (Math.PI / 2);
      profile.push({
        y: height / 2 - f + f * Math.sin(theta),
        offset: -f * (1 + Math.cos(theta)),
      });
    }

    const numPts = contourPoints.length;
    const numProfile = profile.length;
    const vertices: number[] = [];
    const uvs: number[] = [];
    const indices: number[] = [];

    // 2. Vertex and UV grid (sweep profile along the 2D perimeter)
    for (let i = 0; i <= numPts; i++) {
      const idx = i % numPts;
      const pt = contourPoints[idx];
      const norm = normals[idx];
      const u = i / numPts;

      for (let j = 0; j < numProfile; j++) {
        const prof = profile[j];
        const v = j / (numProfile - 1);

        const vx = pt.x + (norm.x * prof.offset);
        const vy = prof.y;
        const vz = pt.y + (norm.y * prof.offset);

        vertices.push(vx, vy, vz);
        uvs.push(u, v);
      }
    }

    // 3. Triangle indices
    for (let i = 0; i < numPts; i++) {
      for (let j = 0; j < numProfile - 1; j++) {
        const row1 = i * numProfile;
        const row2 = (i + 1) * numProfile;

        const a = row1 + j;
        const b = row2 + j;
        const c = row2 + (j + 1);
        const d = row1 + (j + 1);

        indices.push(a, b, d);
        indices.push(b, c, d);
      }
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(vertices, 3)
    );
    geo.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
    geo.setIndex(indices);
    geo.computeVertexNormals();
    return geo;
  }, [contourPoints, normals, height, f]);

  return (
    <group>
      {/* Front / Top Face (Text & artwork) */}
      <mesh
        geometry={topGeometry}
        position={[0, height / 2, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial
          map={loadedTextures.front}
          roughness={0.65}
          metalness={0.0}
        />
      </mesh>

      {/* Back / Bottom Face */}
      <mesh
        geometry={bottomGeometry}
        position={[0, -height / 2, 0]}
        rotation={[Math.PI / 2, 0, 0]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial
          map={loadedTextures.back}
          roughness={0.65}
          metalness={0.0}
        />
      </mesh>

      {/* Filleted Side Rim & Edges */}
      <mesh geometry={rimGeometry} castShadow receiveShadow>
        <meshStandardMaterial
          map={loadedTextures.edge}
          roughness={0.65}
          metalness={0.0}
        />
      </mesh>
    </group>
  );
}

const ROUNDED_CYLINDER_TEXTURES: TextureSources = {
  front: "/pixel-f.jpg",
  back: "/pixel-b.jpg",
  edge: "/pixel-e.jpg",
};

const ROUNDED_SHIELD_TEXTURES: TextureSources = {
  front: "/pixel-f2.jpg",
  back: "/pixel-b2.jpg",
  edge: "/pixel-e2.jpg",
};

const ROUNDED_PLAQUE_TEXTURES: TextureSources = {
  front: "/pixel-f3.jpg",
  back: "/pixel-b3.jpg",
  edge: "/pixel-e3.jpg",
};

function Scene() {
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      camera={{
        fov: 42,
        near: 0.1,
        far: 500,
        position: [0, 130, 0],
      }}
    >
      <ambientLight intensity={1.2} />
      <directionalLight
        position={[45, 60, 35]}
        intensity={2.2}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <directionalLight
        position={[-35, 20, -35]}
        intensity={0.7}
      />

      <group position={[-70, 0, 0]}>
        <RoundedShield width={44} height={54} depth={6} edge={1.2} textures={ROUNDED_SHIELD_TEXTURES} />
      </group>

      <group position={[75, 0, 0]}>
        <RoundedCylinder radius={26} height={6} edge={1} textures={ROUNDED_CYLINDER_TEXTURES} />
      </group>

      <group>
        <RoundedPlaque width={82} length={53} height={6} edge={1} textures={ROUNDED_PLAQUE_TEXTURES} />
      </group>

      <gridHelper
        args={[90, 18, "#404040", "#252525"]}
        position={[0, -4, 0]}
      />

      <OrbitControls
        makeDefault
        enableDamping
        dampingFactor={0.08}
        minDistance={42}
        maxDistance={150}
        target={[0, 0, 0]}
      />
    </Canvas>
  );
}

export default function App() {
  return (
    <main className="h-screen w-screen bg-gray-500">
      <Scene />
    </main>
  );
}
