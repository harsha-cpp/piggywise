import { NextResponse } from "next/server"
import { testCloudinaryConnection, setupModuleFolder } from "@/lib/cloudinary-test"

export async function GET() {
  try {
    // Test connection
    const connectionTest = await testCloudinaryConnection()
    if (!connectionTest.success) {
      return NextResponse.json({ 
        success: false, 
        error: 'Connection test failed', 
        details: connectionTest.message 
      }, { status: 500 })
    }

    // Setup folder
    const folderSetup = await setupModuleFolder()
    if (!folderSetup.success) {
      return NextResponse.json({ 
        success: false, 
        error: 'Folder setup failed', 
        details: folderSetup.message 
      }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      connection: connectionTest.message,
      folder: folderSetup.message
    })
  } catch (error) {
    console.error("[CLOUDINARY_TEST]", error)
    return NextResponse.json({ 
      success: false, 
      error: 'Test failed', 
      details: error.message 
    }, { status: 500 })
  }
} 