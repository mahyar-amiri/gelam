// Laptop Scroll Animation
import * as THREE from 'three'
import React, { forwardRef } from 'react'
import { Canvas, useFrame, useThree, GroupProps } from '@react-three/fiber'
import { Html, useGLTF, ScrollControls, useScroll, useTexture } from '@react-three/drei'
import useRefs from 'react-use-refs'
import { GLTF } from 'three-stdlib'

// 1. Define the GLTF Result type based on your specific model
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

// 2. Type the math utility function
const rsqw = (t: number, delta: number = 0.1, a: number = 1, f: number = 1 / (2 * Math.PI)): number => 
  (a / Math.atan(1 / delta)) * Math.atan(Math.sin(2 * Math.PI * t * f) / delta)

export default function App() {
  return (
    <Canvas shadows dpr={[1, 2]} camera={{ position: [0, -3.2, 40], fov: 12 }}>
      <ScrollControls pages={5}>
        <Composition />
      </ScrollControls>
    </Canvas>
  )
}

function Composition(props: GroupProps) {
  const scroll = useScroll()
  const { width, height } = useThree((state) => state.viewport)
  
  // 3. Provide strict types to useRefs hook
  const [group, mbp16, mbp14, keyLight, stripLight, fillLight, left, right] = useRefs<
    THREE.Group,
    THREE.Group,
    THREE.Group,
    THREE.DirectionalLight,
    THREE.SpotLight,
    THREE.SpotLight,
    HTMLDivElement,
    HTMLDivElement
  >()
  
  const [textureRed, textureBlue] = useTexture(['/Chroma Red.jpg', '/Chroma Blue.jpg'])

  useFrame((state, delta) => {
    const r1 = scroll.range(0 / 4, 1 / 4)
    const r2 = scroll.range(1 / 4, 1 / 4)
    const r3 = scroll.visible(4 / 5, 1 / 5)
    
    // TypeScript requires checking if `.current` exists before mutating
    if (mbp16.current) mbp16.current.rotation.x = Math.PI - (Math.PI / 2) * rsqw(r1) + r2 * 0.33
    if (mbp14.current) mbp14.current.rotation.x = Math.PI - (Math.PI / 2) * rsqw(r1) - r2 * 0.39
    
    if (group.current) {
      group.current.rotation.y = THREE.MathUtils.damp(group.current.rotation.y, (-Math.PI / 1.45) * r2, 4, delta)
      group.current.position.x = THREE.MathUtils.damp(group.current.position.x, (-width / 7) * r2, 4, delta)
      group.current.scale.x = group.current.scale.y = group.current.scale.z = THREE.MathUtils.damp(group.current.scale.z, 1 + 0.24 * (1 - rsqw(r1)), 4, delta)
    }
    
    if (keyLight.current) {
      keyLight.current.position.set(0.25 + -15 * (1 - r1), 4 + 11 * (1 - r1), 3 + 2 * (1 - r1))
    }
    
    left.current?.classList.toggle('show', r3)
    right.current?.classList.toggle('show', r3)
  })

  return (
    <>
      <spotLight position={[0, -width * 0.7, 0]} intensity={0.5} />
      <directionalLight ref={keyLight} castShadow intensity={6}>
        <orthographicCamera attachObject={['shadow', 'camera']} args={[-10, 10, 10, -10, 0.5, 30]} />
      </directionalLight>
      <group ref={group} position={[0, -height / 2.65, 0]} {...props}>
        <spotLight ref={stripLight} position={[width * 2.5, 0, width]} angle={0.19} penumbra={1} intensity={0.25} />
        <spotLight ref={fillLight} position={[0, -width / 2.4, -width * 2.2]} angle={0.2} penumbra={1} intensity={2} distance={width * 3} />
        <M1 ref={mbp16} texture={textureRed} scale={width / 67}>
          <Tag ref={left} position={[16, 5, 0]} head="up to" stat="13x" expl={`faster\ngraphics\nperformance²`} />
        </M1>
        <M1 ref={mbp14} texture={textureBlue} scale={width / 77} rotation={[0, Math.PI, 0]} position={[0, 0, -width / 2.625]}>
          <Tag ref={right} position={[10, 14, 0]} head="up to" stat="3.7x" expl={`faster CPU\nperformance¹`} />
        </M1>
      </group>
    </>
  )
}

// 4. Define Props for M1 Component
interface M1Props extends GroupProps {
  texture: THREE.Texture
  children?: React.ReactNode
}

const M1 = forwardRef<THREE.Group, M1Props>(({ texture, children, ...props }, ref) => {
  const { nodes, materials } = useGLTF('/laptop.glb') as any as GLTFResult
  
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
      <mesh geometry={nodes.body_1.geometry} material={materials.aluminium} material-color="#aaaaaf" material-envMapIntensity={0.2} />
      <mesh geometry={nodes.body_2.geometry} material={materials.blackmatte} />
    </group>
  )
})

// 5. Define Props for Tag Component
interface TagProps extends React.HTMLAttributes<HTMLDivElement> {
  head: string
  stat: string
  expl: string
  position?: [number, number, number] 
}

const Tag = forwardRef<HTMLDivElement, TagProps>(({ head, stat, expl, ...props }, ref) => {
  return (
    <Html ref={ref} className="data" center {...props}>
      <div>{head}</div>
      <h1>{stat}</h1>
      <h2>{expl}</h2>
    </Html>
  )
})