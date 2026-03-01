import { useRef, useEffect } from "react"
import { useGLTF } from "@react-three/drei"
import { useThree } from "@react-three/fiber"
import { Group, PerspectiveCamera } from "three"
import type { OrbitControls as OrbitControlsType } from "three-stdlib"
import React from "react"

interface ModelProps {
  [key: string]: unknown
}

export default function Model(props: ModelProps): React.ReactElement {
  const group = useRef<Group>(null)
  const { scene } = useGLTF('/city.glb')

  return (
    <group ref={group} dispose={null}>
      <primitive
        object={scene}
        scale={2.2}
        position={[0, -1, 0]}
        {...props}
      />
    </group>
  )
}

useGLTF.preload('/city.glb')