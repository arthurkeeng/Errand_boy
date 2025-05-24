"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Upload, X, ImageIcon } from "lucide-react"

interface ImageUploadProps {
  onUpload: (file: File) => void
  onCancel: () => void
}

export default function ImageUpload({ onUpload, onCancel }: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    setFile(selectedFile)
    const reader = new FileReader()
    reader.onload = () => {
      setPreview(reader.result as string)
    }
    reader.readAsDataURL(selectedFile)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const droppedFile = e.dataTransfer.files?.[0]
    if (!droppedFile) return

    setFile(droppedFile)
    const reader = new FileReader()
    reader.onload = () => {
      setPreview(reader.result as string)
    }
    reader.readAsDataURL(droppedFile)
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
  }

  const handleUpload = () => {
    if (!file) return

    setIsLoading(true)
    // We'll let the parent component handle the actual upload
    // and just pass the file
    onUpload(file)
  }

  return (
    <div className="space-y-4">
      <div
        className="border-2 border-dashed border-brand-200 rounded-lg p-6 text-center cursor-pointer bg-brand-50 hover:bg-brand-100 transition-colors"
        onClick={() => fileInputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />

        {preview ? (
          <div className="relative mx-auto w-full max-w-xs">
            <img
              src={preview || "/placeholder.svg"}
              alt="Preview"
              className="mx-auto max-h-48 object-contain rounded-md"
            />
            <Button
              variant="destructive"
              size="icon"
              className="absolute top-0 right-0 h-6 w-6"
              onClick={(e) => {
                e.stopPropagation()
                setPreview(null)
                setFile(null)
              }}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="mx-auto w-12 h-12 rounded-full bg-brand-100 flex items-center justify-center">
              <ImageIcon className="h-6 w-6 text-brand-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-brand-700">Click to upload or drag and drop</p>
              <p className="text-xs text-muted-foreground">Upload an image to find similar products</p>
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <Button
          variant="outline"
          className="flex-1 border-brand-200 hover:bg-brand-50 text-brand-700"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button className="flex-1 bg-brand-500 hover:bg-brand-600" onClick={handleUpload} disabled={!file || isLoading}>
          {isLoading ? (
            <>
              <Upload className="h-4 w-4 mr-2 animate-pulse" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              Upload & Search
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
