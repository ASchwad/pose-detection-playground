/*
Auto-generated by: https://github.com/pmndrs/gltfjsx
Command: npx gltfjsx@6.5.0 scene.gltf --transform 
Files: scene.gltf [54.63KB] > /Users/aschwad/Documents/Code/pose-detection/Dayo Miniroyale Rigged/scene-transformed.glb [511.14KB] (-836%)
Author: zct_33 (https://sketchfab.com/zct_33)
License: CC-BY-4.0 (http://creativecommons.org/licenses/by/4.0/)
Source: https://sketchfab.com/3d-models/dayo-miniroyaleio-rigged-f46755a3a4764f9bb1c20d3e07f01de0
Title: Dayo  - miniroyale.io - (Rigged)
*/

import React, { useEffect, useRef, useState } from 'react'
import { Sphere, useGLTF, Line } from '@react-three/drei'
import { Keypoint } from '@tensorflow-models/pose-detection'
import { Mesh, Vector3 } from 'three'
import { adjustKeypointsToOrigin } from '@/lib/dimensionalCalculations'

const keypointTypes = [
  "nose",
  "left_eye",
  "right_eye",
  "left_ear",
  "right_ear",
  "left_shoulder",
  "right_shoulder",
  "left_elbow",
  "right_elbow",
  "left_wrist",
  "right_wrist",
  "left_hip",
  "right_hip",
  "left_knee",
  "right_knee",
  "left_ankle",
  "right_ankle"
]

const keypointTypes_blazepose = [
  "nose",
  "left_eye_inner",
  "left_eye",
  "left_eye_outer",
  "right_eye_inner",
  "right_eye",
  "right_eye_outer",
  "left_ear",
  "right_ear",
  "mouth_left",
  "mouth_right",
  "left_shoulder",
  "right_shoulder",
  "left_elbow",
  "right_elbow",
  "left_wrist",
  "right_wrist",
  "left_pinky",
  "right_pinky",
  "left_index",
  "right_index",
  "left_thumb",
  "right_thumb",
  "left_hip",
  "right_hip",
  "left_knee",
  "right_knee",
  "left_ankle",
  "right_ankle",
  "left_heel",
  "right_heel",
  "left_foot_index",
  "right_foot_index"
]

// Define connections between keypoints
const connections = [
  // Face
  ["nose", "left_eye"],
  ["nose", "right_eye"],
  ["left_eye", "left_ear"],
  ["right_eye", "right_ear"],
  // Arms
  ["left_shoulder", "right_shoulder"],
  ["left_shoulder", "left_elbow"],
  ["right_shoulder", "right_elbow"],
  ["left_elbow", "left_wrist"],
  ["right_elbow", "right_wrist"],
  // Torso
  ["left_shoulder", "left_hip"],
  ["right_shoulder", "right_hip"],
  ["left_hip", "right_hip"],
  // Legs
  ["left_hip", "left_knee"],
  ["right_hip", "right_knee"],
  ["left_knee", "left_ankle"],
  ["right_knee", "right_ankle"]
] as const

interface RawModelProps {
  poseKeypoints: Keypoint[]
}

export function RawModel({ poseKeypoints }: RawModelProps) {
  const sphereRefs = useRef<Mesh[]>([])
  const [linePoints, setLinePoints] = useState<[Vector3, Vector3][]>([])

  useEffect(() => {
    const correctedKeypoints = adjustKeypointsToOrigin({ keypoints: poseKeypoints, zScaleDownRatio: 150 })
    
    // Update sphere positions
    correctedKeypoints.forEach((keypoint, index) => {
      sphereRefs.current[index]?.position.set(keypoint.x, keypoint.y, keypoint.z || 0)
    })

    // Create lines between connected points
    const newLinePoints = connections.map(([start, end]) => {
      const startPoint = correctedKeypoints.find(k => k.name === start)
      const endPoint = correctedKeypoints.find(k => k.name === end)
      if (startPoint && endPoint) {
        return [
          new Vector3(startPoint.x, startPoint.y, startPoint.z || 0),
          new Vector3(endPoint.x, endPoint.y, endPoint.z || 0)
        ] as [Vector3, Vector3]
      }
      return [new Vector3(), new Vector3()] as [Vector3, Vector3]
    })
    setLinePoints(newLinePoints)
  }, [poseKeypoints])

  return (
    <>
      {keypointTypes_blazepose.map((point, index) => (
        <Sphere
          key={index}
          ref={(el) => {
            if (el) sphereRefs.current[index] = el
          }}
          position={[0,0,0]}
          args={[0.2]}
        >
          <meshStandardMaterial color="orange" />
        </Sphere>
      ))}
      {linePoints.map((points: [Vector3, Vector3], index: number) => (
        <Line
          key={`line-${index}`}
          points={points}
          color="white"
          lineWidth={2}
        />
      ))}
    </>
  )
}

useGLTF.preload('/scene-transformed.glb')