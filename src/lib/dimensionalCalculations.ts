import { Keypoint } from "@tensorflow-models/pose-detection";

type adjustKeypointsToOriginProps = {
    keypoints: Keypoint[];
    xScaleDownRatio?: number;
    yScaleDownRatio?: number;
    zScaleDownRatio?: number;
}

const scaleDefault = 35;

export function adjustKeypointsToOrigin({keypoints, xScaleDownRatio = scaleDefault, yScaleDownRatio = scaleDefault, zScaleDownRatio = scaleDefault}: adjustKeypointsToOriginProps): Keypoint[] {
    // Find the left_hip and right_hip keypoints
    const leftHip = keypoints.find(point => point.name === 'left_hip');
    const rightHip = keypoints.find(point => point.name === 'right_hip');
    
    if (!leftHip || !rightHip) {
        return [];   
    }

    // Calculate the midpoint between left_hip and right_hip
    const originX = (leftHip.x + rightHip.x) / 2;
    const originY = (leftHip.y + rightHip.y) / 2;
    const originZ = (leftHip.z! + rightHip.z!) / 2;

    // Adjust all points to have the origin at (0,0)
    return keypoints.map(point => ({
        ...point,
        x: (point.x-originX)/ xScaleDownRatio,
        y: - (point.y -originY) / yScaleDownRatio,
        z: (point.z ? point.z - originZ : 0) / zScaleDownRatio
    }));
}