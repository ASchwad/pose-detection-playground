import React, { useState } from 'react'
import { Input } from './ui/input'
import { Label } from './ui/label'

interface ImageUploaderProps {
  setImageUrl: (url: string) => void
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ setImageUrl }) => {
  const handleImageChange = (
    e: React.ChangeEvent<HTMLInputElement | undefined>
  ) => {
    const files = e.target.files
    if (files && files.length > 0) {
      const imageUrl = URL.createObjectURL(files[0])
      setImageUrl(imageUrl)
    }
  }

  return (
    <div className="grid w-full max-w-sm items-center gap-1.5">
      <Label htmlFor="picture">Picture</Label>
      <Input id="picture" type="file" onChange={handleImageChange} />
    </div>
  )
}

export default ImageUploader
