import { NextResponse } from "next/server"
import { v2 as cloudinary } from 'cloudinary'

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json({ 
        success: false, 
        error: 'No file provided' 
      }, { status: 400 })
    }

    console.log('File received:', {
      name: file.name,
      type: file.type,
      size: file.size
    })

    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    console.log('Buffer created, size:', buffer.length)

    // Upload to Cloudinary
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: "video",
          folder: "modules/test",
          eager: [
            { streaming_profile: "full_hd", format: "m3u8" }
          ],
          eager_async: true,
        },
        (error, result) => {
          if (error) {
            console.error('Cloudinary upload error:', error)
            reject(error)
          } else {
            console.log('Cloudinary upload success:', result)
            resolve(result)
          }
        }
      )

      // Handle upload stream errors
      uploadStream.on('error', (error) => {
        console.error('Upload stream error:', error)
      })

      uploadStream.end(buffer)
    })

    return NextResponse.json({ 
      success: true, 
      result 
    })
  } catch (error: any) {
    console.error("[CLOUDINARY_UPLOAD_TEST] Detailed error:", {
      message: error.message,
      name: error.name,
      stack: error.stack,
      details: error.details || error
    })
    
    return NextResponse.json({ 
      success: false, 
      error: 'Upload failed', 
      details: error.message,
      name: error.name
    }, { status: 500 })
  }
} 