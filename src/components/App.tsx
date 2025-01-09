import { useEffect } from 'react'
import LivePoseDetector from './LivePoseDetector'
import StaticPoseDetector from './StaticPoseDetector'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import * as tf from '@tensorflow/tfjs-core'
import LivePoseAnimation from './LivePoseAnimation'
import StaticPoseAnimation from './StaticPoseAnimation'
import ThreeDimStaticPoseAnimation from './ThreeDimStaticPoseAnimation'

const App = () => {
  useEffect(() => {
    const waitForTF = async () => {
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
          <TabsTrigger value="3d_static_animation">3D Static Animation</TabsTrigger>
          <TabsTrigger value="detection">Detection</TabsTrigger>
          <TabsTrigger value="static">Static</TabsTrigger>
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
        <TabsContent value="detection">
          <LivePoseDetector/>
        </TabsContent>
        <TabsContent value="static">
          <StaticPoseDetector />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default App
