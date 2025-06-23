import { OrbitControls, Sphere } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import {
  createDetector,
  SupportedModels
} from '@tensorflow-models/pose-detection'
import React, { useEffect, useRef } from 'react'
import { Mesh } from 'three'

const keypointTypes = [
  'nose',
  'left_eye',
  'right_eye',
  'left_ear',
  'right_ear',
  'left_shoulder',
  'right_shoulder',
  'left_elbow',
  'right_elbow',
  'left_wrist',
  'right_wrist',
  'left_hip',
  'right_hip',
  'left_knee',
  'right_knee',
  'left_ankle',
  'right_ankle'
]

const LivePoseAnimation: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null) // Annotate with the type
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const sphereRefs = useRef<Mesh[]>([])

  useEffect(() => {
    const runPoseDetection = async () => {
      try {
        const model = SupportedModels.MoveNet
        // Load the pose-detection model
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true
        })

        // Get access to the webcam
        const video = videoRef.current
        const width = 640
        const height = 480

        if (video && 'srcObject' in video) {
          video.srcObject = stream
          video.play()

          createDetector(model, {
            inputResolution: { width, height },
            architecture: 'ResNet50',
            outputStride: 16
          }).then((detector) => {
            const detectPoseInRealTime = async () => {
              const video = videoRef.current
              if (video) {
                const poses = await detector.estimatePoses(video)
                if (sphereRefs.current !== null) {
                  // Do animation stuff here
                  poses.forEach(({ keypoints }) => {
                    keypoints.forEach((keypoint, index) => {
                      sphereRefs.current[index]?.position.set(
                        (keypoint.x - 330) / 100,
                        -(keypoint.y - 380) / 100,
                        0
                      )
                    })
                  })
                }

                // Set canvas dimensions
                requestAnimationFrame(() => {
                  detectPoseInRealTime()
                })
              }
              return null
            }
            detectPoseInRealTime()
          })
        }
      } catch (error) {
        console.error(
          'Error loading pose-detection model or accessing webcam:',
          error
        )
      }
    }

    runPoseDetection()

    // Cleanup function
    return () => {
      const video = videoRef.current
      if (video) {
        const stream = video.srcObject
        if (stream instanceof MediaStream) {
          const tracks = stream.getTracks()
          tracks.forEach((track) => track.stop())
        }
      }
    }
  }, [])

  return (
    <>
      <video
        className="absolute inset-20"
        width="640"
        height="480"
        ref={videoRef}
        autoPlay
      />
      <canvas
        className="absolute inset-20"
        width="640"
        height="480"
        ref={canvasRef}
      />
      <Canvas style={{ width: '800px', height: '800px' }}>
        {keypointTypes.map((point, index) => (
          <Sphere
            key={index}
            ref={(el) => sphereRefs.current?.push(el)}
            position={[0, 0, 0]}
            args={[0.2]}
          >
            <meshStandardMaterial color="orange" />
          </Sphere>
        ))}
        <ambientLight intensity={0.1} />
        <directionalLight position={[0, 0, 5]} color="red" />
        <OrbitControls />
      </Canvas>
    </>
  )
}

export default LivePoseAnimation
