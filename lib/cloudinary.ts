import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function uploadImage(file: string) {
  try {
    console.log("Starting image upload to Cloudinary...")
    
    const result = await cloudinary.uploader.upload(file, {
      folder: "modules/thumbnails",
      transformation: [
        { width: 800, height: 450, crop: "fill" },  // 16:9 aspect ratio
        { quality: "auto:best" }
      ],
    })

    console.log("Image upload successful:", {
      url: result.secure_url,
      width: result.width,
      height: result.height,
      format: result.format,
      publicId: result.public_id,
    })

    return {
      url: result.secure_url,
      width: result.width,
      height: result.height,
      format: result.format,
      publicId: result.public_id,
    }
  } catch (error) {
    console.error("Error uploading image to Cloudinary:", error)
    throw error
  }
}

export async function uploadVideo(file: string) {
  try {
    console.log("Starting video upload to Cloudinary...")
    
    const result = await cloudinary.uploader.upload(file, {
      resource_type: "video",
      folder: "modules/videos",
      eager: [
        { streaming_profile: "full_hd", format: "m3u8" }
      ],
      eager_async: true,
      chunk_size: 6000000, // 6MB chunks
      timeout: 120000, // 2 minutes timeout
    })

    console.log("Video upload successful:", {
      url: result.secure_url,
      duration: result.duration,
      format: result.format,
      publicId: result.public_id,
    })

    return {
      url: result.secure_url,
      duration: result.duration,
      format: result.format,
      publicId: result.public_id,
    }
  } catch (error) {
    console.error("Error uploading video to Cloudinary:", error)
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

export async function deleteImage(publicId: string) {
  try {
    await cloudinary.uploader.destroy(publicId)
  } catch (error) {
    console.error("Error deleting image:", error)
    throw error
  }
}

export async function uploadAudio(file: string) {
  try {
    console.log("Starting audio upload to Cloudinary...")
    
    const result = await cloudinary.uploader.upload(file, {
      resource_type: "auto",
      folder: "podcasts/audio",
      use_filename: true,
      unique_filename: true,
      overwrite: true,
      format: "mp3",
    })

    console.log("Audio upload successful:", {
      url: result.secure_url,
      duration: result.duration,
      format: result.format,
      publicId: result.public_id,
    })

    return {
      url: result.secure_url,
      duration: result.duration,
      format: result.format,
      publicId: result.public_id,
    }
  } catch (error) {
    console.error("Error uploading audio to Cloudinary:", error)
    throw error
  }
}

export async function deleteAudio(publicId: string) {
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: "video" }) // Audio uses "video" resource type in Cloudinary
  } catch (error) {
    console.error("Error deleting audio:", error)
    throw error
  }
} 