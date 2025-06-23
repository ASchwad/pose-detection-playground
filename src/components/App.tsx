import '@tensorflow/tfjs-backend-webgl'

import * as tf from '@tensorflow/tfjs-core'
import { useEffect } from 'react'

import LivePoseAnimation from './LivePoseAnimation'
import LivePoseDetector from './LivePoseDetector'
import StaticPoseAnimation from './StaticPoseAnimation'
import StaticPoseDetector from './StaticPoseDetector'
import ThreeDimStaticPoseAnimation from './ThreeDimStaticPoseAnimation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'

const App = () => {
  useEffect(() => {
    const waitForTF = async () => {
      await tf.setBackend('webgl')
      await tf.ready()
      console.log('TF Ready')
    }
    waitForTF()
  }, [])

  return (
    <div className="m-5">
      <Tabs defaultValue="static_animation" className="w-[400px]">
        <TabsList>
          <TabsTrigger value="animation">Animation</TabsTrigger>
          <TabsTrigger value="static_animation">Static Animation</TabsTrigger>
          <TabsTrigger value="3d_static_animation">
            3D Static Animation
          </TabsTrigger>
          {/* <TabsTrigger value="detection">Detection</TabsTrigger>
          <TabsTrigger value="static">Static</TabsTrigger> */}
        </TabsList>
        <TabsContent value="animation">
          <LivePoseAnimation />
        </TabsContent>
        <TabsContent value="static_animation">
          <StaticPoseAnimation />
        </TabsContent>
        <TabsContent value="3d_static_animation">
          <ThreeDimStaticPoseAnimation />
        </TabsContent>
        {/* <TabsContent value="detection">
          <LivePoseDetector />
        </TabsContent>
        <TabsContent value="static">
          <StaticPoseDetector />
        </TabsContent> */}
      </Tabs>
    </div>
  )
}

export default App
