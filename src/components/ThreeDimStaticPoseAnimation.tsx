import React, { useRef, useEffect, useState } from 'react'
import {
  createDetector,
  Keypoint,
  SupportedModels
} from '@tensorflow-models/pose-detection'
import { drawKeypoint, drawSkeleton } from '@/lib/canvasRenderer'
import ImageUploader from './ImageUploader'
import AnimatedScene from './AnimatedScene'

const ThreeDimStaticPoseAnimation: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [imageDimensions, setImageDimensions] = useState({ width: 640, height: 480 });
  const [keypoints, setKeypoints] = useState<Keypoint[]>([])

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { naturalWidth, naturalHeight, height, width } = e.currentTarget;
    console.log(naturalWidth, naturalHeight)
    // setImageDimensions({ width: naturalWidth, height: naturalHeight });
    // Calculate scaling factor to keep width <= 640px while maintaining aspect ratio
    const maxWidth = 640;
    const maxHeight = 480;
    
    if(naturalWidth > maxWidth || naturalHeight > maxHeight) {
      // Calculate scaling factors for width and height
      const widthScaleFactor = maxWidth / naturalWidth;
      const heightScaleFactor = maxHeight / naturalHeight;
    
      // Determine the scale factor to use to ensure both dimensions are within the limits
      const scaleFactor = Math.min(widthScaleFactor, heightScaleFactor, 1);    
      const scaledWidth = naturalWidth * scaleFactor;
      const scaledHeight = naturalHeight * scaleFactor;
      
      setImageDimensions({ width: scaledWidth, height: scaledHeight });
    } else {
      setImageDimensions({ width: naturalWidth, height: naturalHeight });
    }
  };

  useEffect(() => {
    console.log(imageUrl)
    const runPoseDetection = async () => {
      const canvas = canvasRef.current
      const width = imageDimensions.width
      const height = imageDimensions.height
      // const model = SupportedModels.MoveNet
      const model = SupportedModels.BlazePose;
      createDetector(model, {
        runtime: 'tfjs',
        modelType: 'full'
      }).then((detector) => {
        const pixelInput = new Image()
        pixelInput.src = imageUrl as string
        pixelInput.width = width
        pixelInput.height = height

        detector.estimatePoses(pixelInput).then((poses) => {
          poses.forEach(({ keypoints }) => {
            setKeypoints(keypoints)

            if (canvas) {
              const ctx = canvas.getContext('2d')
              if (ctx) {                
                ctx.clearRect(0, 0, width, height) // Clear canvas
                drawSkeleton(ctx, keypoints, model)
                keypoints.forEach((keypoint) => {
                  drawKeypoint(ctx, keypoint)
                })
                return null
              }
            }
          })
        })
        return setKeypoints([])
      })
    }
    runPoseDetection()
  }, [imageUrl, imageDimensions])


  return (
    <div className="relative flex flex-col gap-5">
      <ImageUploader setImageUrl={setImageUrl} />
      <div>
        {imageUrl && (
          <img
            src={imageUrl}
            alt="Uploaded"
            className="absolute"
            style={{ height: imageDimensions.height, maxWidth: imageDimensions.width, zIndex: -1 }}
            onLoad={handleImageLoad}
          />
        )}
        <canvas width={imageDimensions.width} height={imageDimensions.height} ref={canvasRef} />
      </div>
      <AnimatedScene poseKeypoints={keypoints}/>
    </div>
  )
}

export default ThreeDimStaticPoseAnimation
