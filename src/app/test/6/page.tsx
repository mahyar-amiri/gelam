"use client";

import * as THREE from "three"
import React, { forwardRef, useRef } from "react"
import { Canvas, useFrame, useThree, type GroupProps } from "@react-three/fiber"
import { Html, useGLTF, ScrollControls, useScroll, useTexture, type HtmlProps } from "@react-three/drei"
import type { GLTF } from "three-stdlib"

// --- Types ---
type GLTFResult = GLTF & {
  nodes: {
    back_1: THREE.Mesh
    back_2: THREE.Mesh
    matte: THREE.Mesh
    body_1: THREE.Mesh
    body_2: THREE.Mesh
  }
  materials: {
    blackmatte: THREE.Material
    aluminium: THREE.Material
  }
}

interface M1Props extends GroupProps {
  texture: THREE.Texture
  children?: React.ReactNode
}

interface TagProps extends Omit<HtmlProps, "children"> {
  head: string
  stat: string
  expl: string
}

// --- Math Utilities ---
const rsqw = (t: number, delta = 0.1, a = 1, f = 1 / (2 * Math.PI)): number =>
  (a / Math.atan(1 / delta)) * Math.atan(Math.sin(2 * Math.PI * t * f) / delta)

// --- Assets Preload ---
const ASSETS = {
  model: "/laptop.glb",
  textures: ["/background.jpg", "/letter-front.jpg"],
}

useGLTF.preload(ASSETS.model)
useTexture.preload(ASSETS.textures[0])
useTexture.preload(ASSETS.textures[1])

// --- Components ---
export default function App() {
  return (
    <main className="h-screen w-full">
      <Canvas shadows dpr={[1, 2]} camera={{ position: [0, -3.2, 40], fov: 12 }}>
        <ScrollControls pages={5}>
          <Composition />
        </ScrollControls>
      </Canvas>
    </main>
  )
}

function Composition(props: GroupProps) {
  const scroll = useScroll()
  const { width, height } = useThree((state) => state.viewport)

  const group = useRef<THREE.Group>(null)
  const mbp16 = useRef<THREE.Group>(null)
  const mbp14 = useRef<THREE.Group>(null)
  const keyLight = useRef<THREE.DirectionalLight>(null)
  const leftTag = useRef<HTMLDivElement>(null)
  const rightTag = useRef<HTMLDivElement>(null)

  const [textureRed, textureBlue] = useTexture(ASSETS.textures)

  useFrame((_, delta) => {
    const r1 = scroll.range(0 / 4, 1 / 4)
    const r2 = scroll.range(1 / 4, 1 / 4)
    const r3 = scroll.visible(4 / 5, 1 / 5)

    // Laptop hinge rotations
    if (mbp16.current) {
      mbp16.current.rotation.x = Math.PI - (Math.PI / 2) * rsqw(r1) + r2 * 0.33
    }
    if (mbp14.current) {
      mbp14.current.rotation.x = Math.PI - (Math.PI / 2) * rsqw(r1) - r2 * 0.39
    }

    // Camera rig movement & scale
    if (group.current) {
      group.current.rotation.y = THREE.MathUtils.damp(group.current.rotation.y, (-Math.PI / 1.45) * r2, 4, delta)
      group.current.position.x = THREE.MathUtils.damp(group.current.position.x, (-width / 7) * r2, 4, delta)
      
      const targetScale = 1 + 0.24 * (1 - rsqw(r1))
      const currentScale = THREE.MathUtils.damp(group.current.scale.z, targetScale, 4, delta)
      group.current.scale.setScalar(currentScale)
    }

    // Dynamic light tracking
    if (keyLight.current) {
      keyLight.current.position.set(0.25 - 15 * (1 - r1), 4 + 11 * (1 - r1), 3 + 2 * (1 - r1))
    }

    // Direct DOM toggling to prevent React re-renders
    leftTag.current?.classList.toggle("show", r3)
    rightTag.current?.classList.toggle("show", r3)
  })

  return (
    <>
      <spotLight position={[0, -width * 0.7, 0]} intensity={0.5} />
      
      <directionalLight ref={keyLight} castShadow intensity={6}>
        <orthographicCamera attach="shadow-camera" args={[-10, 10, 10, -10, 0.5, 30]} />
      </directionalLight>

      <group ref={group} position={[0, -height / 2.65, 0]} {...props}>
        <spotLight position={[width * 2.5, 0, width]} angle={0.19} penumbra={1} intensity={0.25} />
        <spotLight position={[0, -width / 2.4, -width * 2.2]} angle={0.2} penumbra={1} intensity={2} distance={width * 3} />

        <M1 ref={mbp16} texture={textureRed} scale={width / 67}>
          <Tag ref={leftTag} position={[16, 5, 0]} head="up to" stat="13x" expl={`faster\ngraphics\nperformance²`} />
        </M1>

        <M1 ref={mbp14} texture={textureBlue} scale={width / 77} rotation={[0, Math.PI, 0]} position={[0, 0, -width / 2.625]}>
          <Tag ref={rightTag} position={[10, 14, 0]} head="up to" stat="3.7x" expl={`faster CPU\nperformance¹`} />
        </M1>
      </group>
    </>
  )
}

const M1 = forwardRef<THREE.Group, M1Props>(({ texture, children, ...props }, ref) => {
  const { nodes, materials } = useGLTF(ASSETS.model) as unknown as GLTFResult

  return (
    <group {...props} dispose={null}>
      <group ref={ref} position={[0, -0.43, -11.35]} rotation={[Math.PI / 2, 0, 0]}>
        <mesh geometry={nodes.back_1.geometry} material={materials.blackmatte} />
        <mesh receiveShadow castShadow geometry={nodes.back_2.geometry} material={materials.aluminium} />
        <mesh geometry={nodes.matte.geometry}>
          <meshLambertMaterial map={texture} toneMapped={false} />
        </mesh>
      </group>
      {children}
      <mesh 
        geometry={nodes.body_1.geometry} 
        material={materials.aluminium} 
        material-color="#aaaaaf" 
        material-envMapIntensity={0.2} 
      />
      <mesh geometry={nodes.body_2.geometry} material={materials.blackmatte} />
    </group>
  )
})

const Tag = forwardRef<HTMLDivElement, TagProps>(({ head, stat, expl, ...props }, ref) => {
  return (
    <Html ref={ref} className="data" center {...props}>
      <div>{head}</div>
      <h1>{stat}</h1>
      <h2>{expl}</h2>
    </Html>
  )
})