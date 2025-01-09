import {
  Keypoint,
  SupportedModels,
  util
} from '@tensorflow-models/pose-detection'

export const drawAngle = (
  point1: Keypoint,
  point2: Keypoint,
  point3: Keypoint,
  ctx: CanvasRenderingContext2D
) => {
  const radius = 50
  const angleStart = Math.atan2(point2.y - point1.y, point2.x - point1.x)
  const angleEnd = Math.atan2(point3.y - point1.y, point3.x - point1.x)
  ctx.beginPath()
  ctx.arc(point1.x, point1.y, radius, angleStart, angleEnd)
  ctx.stroke()

  // Calculate angle
  let angle = angleStart - angleEnd

  // Add angle value text
  const textX = point1.x + radius * Math.cos((angleStart + angleEnd) / 2)
  const textY = point1.y + radius * Math.sin((angleStart + angleEnd) / 2)
  ctx.fillText(`${((angle * 180) / Math.PI).toFixed(2)}°`, textX, textY)
}

export const drawKeypoint = (
  ctx: CanvasRenderingContext2D,
  keypoint: Keypoint,
  showName = false
) => {
  // If score is null, just show the keypoint.
  const score = keypoint.score != null ? keypoint.score : 1
  const scoreThreshold = 0.3

  const ignoredKeypoints = ['left_eye', 'right_eye', 'left_ear', 'right_ear']
  if (ignoredKeypoints.includes(keypoint.name!)) {
    return
  }

  if (score >= scoreThreshold) {
    const circle = new Path2D()
    ctx.fillStyle = 'red'
    if (score < 0.5) {
      ctx.fillStyle = 'yellow'
    } else {
      ctx.fillStyle = 'green'
    }

    ctx.beginPath()
    circle.arc(keypoint.x, keypoint.y, 5, 0, 2 * Math.PI)
    // show tooltip on hover on keypoint with its name

    if (showName) {
      ctx.font = '16px Arial'
      ctx.fillText(keypoint.name!, keypoint.x, keypoint.y)
    }
    ctx.fill(circle)
  }
}

export const drawSkeleton = (
  ctx: CanvasRenderingContext2D,
  keypoints: Keypoint[],
  model: SupportedModels
) => {
  const color = 'White'
  ctx.fillStyle = color
  ctx.strokeStyle = color
  ctx.lineWidth = 2

  util.getAdjacentPairs(model).forEach(([i, j]) => {
    const kp1 = keypoints[i]
    const kp2 = keypoints[j]

    // If score is null, just show the keypoint.
    const score1 = kp1.score != null ? kp1.score : 1
    const score2 = kp2.score != null ? kp2.score : 1
    const scoreThreshold = 0.3

    if (score1 >= scoreThreshold && score2 >= scoreThreshold) {
      ctx.beginPath()
      ctx.moveTo(kp1.x, kp1.y)
      ctx.lineTo(kp2.x, kp2.y)
      ctx.stroke()
    }
  })
}
