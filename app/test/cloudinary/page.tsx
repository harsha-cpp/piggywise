"use client"

import { useState } from 'react'

export default function CloudinaryTest() {
  const [uploading, setUploading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<any>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setUploading(true)
    setError(null)
    setResult(null)

    try {
      const form = e.currentTarget
      const fileInput = form.querySelector('input[type="file"]') as HTMLInputElement
      const file = fileInput?.files?.[0]

      if (!file) {
        throw new Error('Please select a file')
      }

      console.log('Uploading file:', {
        name: file.name,
        type: file.type,
        size: file.size
      })

      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/test/cloudinary/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.details || data.error || 'Upload failed')
      }

      setResult(data.result)
    } catch (err: any) {
      console.error('Upload error:', err)
      setError({
        message: err.message,
        details: err.details || err
      })
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Cloudinary Video Upload Test</h1>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Select Video File
          </label>
          <input 
            type="file" 
            name="file" 
            accept="video/*"
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100"
            required
          />
          <p className="mt-1 text-sm text-gray-500">
            Maximum file size: 100MB
          </p>
        </div>

        <button
          type="submit"
          disabled={uploading}
          className="px-4 py-2 bg-blue-600 text-white rounded-md
            hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed"
        >
          {uploading ? 'Uploading...' : 'Upload Video'}
        </button>
      </form>

      {error && (
        <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-md">
          <h3 className="font-medium mb-2">Upload Error:</h3>
          <p className="text-sm">{error.message}</p>
          {error.details && (
            <pre className="mt-2 text-xs bg-red-100 p-2 rounded overflow-auto">
              {JSON.stringify(error.details, null, 2)}
            </pre>
          )}
        </div>
      )}

      {result && (
        <div className="mt-6 space-y-4">
          <h2 className="text-xl font-semibold">Upload Successful!</h2>
          
          <div className="p-4 bg-green-50 rounded-md">
            <h3 className="font-medium mb-2">Video Details:</h3>
            <ul className="space-y-2 text-sm">
              <li><strong>URL:</strong> {result.secure_url}</li>
              <li><strong>Format:</strong> {result.format}</li>
              <li><strong>Duration:</strong> {result.duration}s</li>
              <li><strong>Size:</strong> {Math.round(result.bytes / 1024 / 1024 * 100) / 100}MB</li>
            </ul>
          </div>

          {result.secure_url && (
            <div>
              <h3 className="font-medium mb-2">Preview:</h3>
              <video 
                controls 
                className="w-full max-w-2xl rounded-lg shadow-lg"
                src={result.secure_url}
              />
            </div>
          )}
        </div>
      )}
    </div>
  )
} 