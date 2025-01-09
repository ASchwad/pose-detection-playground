import { Keypoint } from '@tensorflow-models/pose-detection'

enum BodySide {
  LEFT = 'left',
  RIGHT = 'right',
  CENTER = 'center'
}

export function estimateBodyPositionToCamera(keypoints: Keypoint[]): BodySide {
  let leftScore = 0
  let rightScore = 0

  // Sum up the scores for left and right keypoints
  for (const keypoint of keypoints) {
    if (keypoint.name!.startsWith('left_')) {
      leftScore += keypoint.score!
    } else if (keypoint.name!.startsWith('right_')) {
      rightScore += keypoint.score!
    }
  }

  // Determine the body side based on the sum of scores
  if (leftScore > rightScore) {
    return BodySide.LEFT
  } else if (rightScore > leftScore) {
    return BodySide.RIGHT
  } else {
    return BodySide.CENTER
  }
}

// use only keypoints relevant to position
export function filterKeypoints(
  keypoints: Keypoint[],
  bodySide: BodySide
): Keypoint[] {
  return keypoints.filter((keypoint) => {
    if (bodySide === BodySide.LEFT) {
      return keypoint.name!.startsWith('left_')
    } else if (bodySide === BodySide.RIGHT) {
      return keypoint.name!.startsWith('right_')
    } else {
      return true
    }
  })
}

export function calculateIsBackStraight(
  shoulder: Keypoint,
  hip: Keypoint
): boolean {
  // Calculated as Slope - incline or decline shouldnt be more than the treshold
  const threshold = 0.15
  return Math.abs(calculateSlope(shoulder!, hip!) || 999) < threshold
}

export function calculateIsElbowAngleInThreshhold(
  shoulder: Keypoint,
  elbow: Keypoint,
  hip: Keypoint
): boolean {
  // check if elbows are aligned with shoulders
  const elbowAngle = calculateAngle(shoulder!, elbow!, hip!)
  const elbowAngleDeviation = Math.abs(90 - elbowAngle)
  // allowed degree deviation
  const elbowAngleThreshold = 25

  return Math.abs(elbowAngleDeviation) < elbowAngleThreshold
}

export function calculateAngle(
  middlePoint: Keypoint,
  point2: Keypoint,
  point3: Keypoint,
  angleUnit = 'degree' as 'degree' | 'rad'
): number {
  const dx1 = point2.x - middlePoint.x
  const dy1 = point2.y - middlePoint.y
  const dx2 = point3.x - middlePoint.x
  const dy2 = point3.y - middlePoint.y

  const dotProduct = dx1 * dx2 + dy1 * dy2
  const magnitude1 = Math.sqrt(dx1 * dx1 + dy1 * dy1)
  const magnitude2 = Math.sqrt(dx2 * dx2 + dy2 * dy2)

  const cosTheta = dotProduct / (magnitude1 * magnitude2)

  if (angleUnit === 'rad') return Math.acos(cosTheta)
  return Math.acos(cosTheta) * (180 / Math.PI)
}

export function calculateSlope(
  point1: Keypoint,
  point2: Keypoint
): number | null {
  if (point1.x === point2.x) {
    return null // Avoid division by zero
  }
  return (point2.y - point1.y) / (point2.x - point1.x)
}

export function areJointsAligned(
  keypoints: Keypoint[],
  jointNames: string[]
): boolean {
  const jointPoints: Keypoint[] = jointNames.map(
    (name) => keypoints.find((point) => point.name === name)!
  )

  // Calculate slopes for adjacent joints
  const slopes: number[] = []
  for (let i = 0; i < jointPoints.length - 1; i++) {
    const slope = calculateSlope(jointPoints[i], jointPoints[i + 1]) || 0
    console.log(
      'Calculating slope for ',
      jointPoints[i].name,
      jointPoints[i + 1].name,
      slope
    )
    slopes.push(slope)
  }

  // Check if slopes are similar
  const threshold = 0.2 // Adjust as needed based on your requirements
  const avgSlope =
    slopes.reduce((acc, slope) => (slope !== null ? acc! + slope! : acc), 0) /
    slopes.length

  console.log(slopes, avgSlope, threshold)
  for (const slope of slopes) {
    if (slope !== null && Math.abs(slope! - avgSlope!) > threshold) {
      return false
    }
  }
  return true
}

/*
Head to left wrist distance (Used points: 0,7)
Head to right wrist distance (Used points: 0,4)
Angle between left shoulder and left wrist (Used points: 7,6,5)
Angle between right shoulder and right wrist (Used points: 4,3,2)
Angle between left hip and left ankle (Used points: 11,12,13)
Angle between right hip and right ankle (Used points: 8,9,10)

https://github.com/augmentedstartups/Pose-Estimation/tree/master/5.%20Plank%20Pose%20Corrector
*/
export function isPlank(keypoints: Keypoint[]): boolean {
  const keypointsDict: { [key: string]: [number, number] } = {}
  keypoints.forEach((kp) => {
    keypointsDict[kp.name!] = [kp.x, kp.y]
  })

  function distance(kp1: string, kp2: string): number {
    const [x1, y1] = keypointsDict[kp1]
    const [x2, y2] = keypointsDict[kp2]
    return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2)
  }

  const angleThreshold = 10 // in degrees
  const distanceThreshold = 50 // in pixels

  if (
    Math.abs(
      keypointsDict['left_shoulder'][1] - keypointsDict['left_elbow'][1]
    ) < distanceThreshold &&
    Math.abs(
      keypointsDict['right_shoulder'][1] - keypointsDict['right_elbow'][1]
    ) < distanceThreshold &&
    Math.abs(keypointsDict['left_elbow'][1] - keypointsDict['left_wrist'][1]) <
      distanceThreshold &&
    Math.abs(
      keypointsDict['right_elbow'][1] - keypointsDict['right_wrist'][1]
    ) < distanceThreshold &&
    Math.abs(keypointsDict['left_shoulder'][0] - keypointsDict['left_hip'][0]) <
      distanceThreshold &&
    Math.abs(
      keypointsDict['right_shoulder'][0] - keypointsDict['right_hip'][0]
    ) < distanceThreshold &&
    Math.abs(keypointsDict['left_hip'][1] - keypointsDict['left_knee'][1]) <
      distanceThreshold &&
    Math.abs(keypointsDict['right_hip'][1] - keypointsDict['right_knee'][1]) <
      distanceThreshold &&
    Math.abs(keypointsDict['left_knee'][1] - keypointsDict['left_ankle'][1]) <
      distanceThreshold &&
    Math.abs(keypointsDict['right_knee'][1] - keypointsDict['right_ankle'][1]) <
      distanceThreshold &&
    Math.abs(
      distance('left_elbow', 'left_shoulder') -
        distance('left_wrist', 'left_elbow')
    ) < distanceThreshold &&
    Math.abs(
      distance('right_elbow', 'right_shoulder') -
        distance('right_wrist', 'right_elbow')
    ) < distanceThreshold &&
    Math.abs(
      distance('left_knee', 'left_hip') - distance('left_ankle', 'left_knee')
    ) < distanceThreshold &&
    Math.abs(
      distance('right_knee', 'right_hip') -
        distance('right_ankle', 'right_knee')
    ) < distanceThreshold
  ) {
    return true
  } else {
    return false
  }
}
