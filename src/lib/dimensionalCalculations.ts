import { Keypoint } from '@tensorflow-models/pose-detection'

type adjustKeypointsToOriginProps = {
  keypoints: Keypoint[]
  xScaleDownRatio?: number
  yScaleDownRatio?: number
  zScaleDownRatio?: number
}

const scaleDefault = 35

export function adjustKeypointsToOrigin({
  keypoints,
  xScaleDownRatio = scaleDefault,
  yScaleDownRatio = scaleDefault,
  zScaleDownRatio = scaleDefault
}: adjustKeypointsToOriginProps): Keypoint[] {
  if (keypoints.length === 0) {
    return []
  }

  // Calculate the center of all keypoints
  const centerX =
    keypoints.reduce((sum, point) => sum + point.x, 0) / keypoints.length
  const centerY =
    keypoints.reduce((sum, point) => sum + point.y, 0) / keypoints.length
  const centerZ =
    keypoints.reduce((sum, point) => sum + (point.z || 0), 0) / keypoints.length

  // Center all points around (0,0,0) and apply scaling
  return keypoints.map((point) => ({
    ...point,
    x: (point.x - centerX) / xScaleDownRatio,
    y: -(point.y - centerY) / yScaleDownRatio, // Keep Y-axis inversion for proper 3D orientation
    z: ((point.z || 0) - centerZ) / zScaleDownRatio
  }))
}
