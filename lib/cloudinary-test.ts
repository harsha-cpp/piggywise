import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function testCloudinaryConnection() {
  try {
    // Test the connection by trying to get account details
    const result = await cloudinary.api.ping()
    console.log('Cloudinary Connection Test:', result)
    return { success: true, message: 'Successfully connected to Cloudinary' }
  } catch (error) {
    console.error('Cloudinary Connection Error:', error)
    return { success: false, message: error.message }
  }
}

// Test specific folder creation for modules
export async function setupModuleFolder() {
  try {
    // Create a test folder for modules if it doesn't exist
    await cloudinary.api.create_folder('modules')
    return { success: true, message: 'Modules folder created/verified' }
  } catch (error) {
    // If folder already exists, this is fine
    if (error.error && error.error.message.includes('already exists')) {
      return { success: true, message: 'Modules folder already exists' }
    }
    console.error('Folder Creation Error:', error)
    return { success: false, message: error.message }
  }
} 