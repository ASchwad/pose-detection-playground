import React, { useRef, useEffect } from 'react'
import {
  SupportedModels,
  createDetector
} from '@tensorflow-models/pose-detection'
import { drawAngle, drawKeypoint, drawSkeleton } from '@/lib/canvasRenderer'
import {
  areJointsAligned,
  estimateBodyPositionToCamera,
  filterKeypoints
} from '@/lib/plankCalculations'

const LivePoseDetector: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null) // Annotate with the type
  const canvasRef = useRef<HTMLCanvasElement>(null)

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
                // Set canvas dimensions
                const canvas = canvasRef.current
                if (canvas) {
                  canvas.width = video.videoWidth
                  canvas.height = video.videoHeight

                  // Draw poses on canvas
                  const ctx = canvas.getContext('2d')
                  if (ctx) {
                    poses.forEach(({ keypoints }) => {
                      ctx.clearRect(0, 0, width, height) // Clear canvas
                      drawSkeleton(ctx, keypoints, model)
                      keypoints.forEach((keypoint) => {
                        drawKeypoint(ctx, keypoint)
                      })
                      console.log(
                        'Position',
                        estimateBodyPositionToCamera(keypoints)
                      )

                      const shoulder = keypoints.find(
                        (keypoint) => keypoint.name?.includes('shoulder')!
                      )
                      const elbow = keypoints.find(
                        (keypoint) => keypoint.name?.includes('elbow')!
                      )
                      const hip = keypoints.find(
                        (keypoint) => keypoint.name?.includes('hip')!
                      )

                      const position = estimateBodyPositionToCamera(keypoints)

                      const filtered_keypoints = filterKeypoints(
                        keypoints,
                        position
                      )
                      console.log(filtered_keypoints)

                      drawAngle(shoulder!, hip!, elbow!, ctx)
                      const plankKeypointNames = filtered_keypoints
                        .map((keypoint) => keypoint.name!)
                        .filter(
                          (name) =>
                            name.includes('shoulder') ||
                            name.includes('hip') ||
                            name.includes('knee') ||
                            name.includes('ankle')
                        )
                      console.log(
                        areJointsAligned(filtered_keypoints, plankKeypointNames)
                      )
                    })
                  }
                }
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
    </>
  )
}

export default LivePoseDetector
