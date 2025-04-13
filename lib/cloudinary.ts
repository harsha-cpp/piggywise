import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function uploadVideo(file: any) {
  try {
    const result = await cloudinary.uploader.upload(file, {
      resource_type: "video",
      folder: "modules",
      eager: [
        { streaming_profile: "full_hd", format: "m3u8" }
      ],
      eager_async: true,
    })

    return {
      url: result.secure_url,
      duration: result.duration,
      format: result.format,
      publicId: result.public_id,
    }
  } catch (error) {
    console.error("Error uploading video:", error)
    throw error
  }
}

export async function deleteVideo(publicId: string) {
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: "video" })
  } catch (error) {
    console.error("Error deleting video:", error)
    throw error
  }
} 