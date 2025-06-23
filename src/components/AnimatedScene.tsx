import { OrbitControls } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { Keypoint } from '@tensorflow-models/pose-detection'
import React from 'react'
import { GridHelper } from 'three'

import { RawModel } from './RawModel'

interface AnimatedSceneProps {
  poseKeypoints: Keypoint[]
}

const AnimatedScene: React.FC<AnimatedSceneProps> = ({ poseKeypoints }) => {
  return (
    <Canvas style={{ width: '800px', height: '800px' }}>
      {/* <Model2 poseKeypoints={poseKeypoints}/> */}
      <ambientLight intensity={10} />
      <directionalLight position={[0, 0, 1]} color="white" />
      <OrbitControls />
      <axesHelper args={[5]} />
      <primitive object={new GridHelper(10, 10)} />;
      {/* <Cubeman poseKeypoints={poseKeypoints} /> */}
      {/* <Elf poseKeypoints={poseKeypoints} /> */}
      <RawModel poseKeypoints={poseKeypoints} />
    </Canvas>
  )
}

export default AnimatedScene
