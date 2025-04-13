import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/auth"

// Mock data for demonstration purposes
const mockModules = [
  {
    id: "basics-of-money",
    title: "Basics of Money",
    description: "Learn the fundamentals of money and how it works.",
    completedLessons: 5,
    totalLessons: 5,
    thumbnail: "/images/modules/money-basics.jpg",
    lessons: [
      { id: "1", title: "What is Money?", isCompleted: true, duration: "4:30" },
      { id: "2", title: "History of Money", isCompleted: true, duration: "5:15" },
      { id: "3", title: "Types of Money", isCompleted: true, duration: "3:45" },
      { id: "4", title: "Value of Money", isCompleted: true, duration: "6:20" },
      { id: "5", title: "Money in Different Countries", isCompleted: true, duration: "4:50" }
    ]
  },
  {
    id: "saving-and-goals",
    title: "Saving & Goals",
    description: "Discover how to save money and set financial goals.",
    completedLessons: 3,
    totalLessons: 5,
    thumbnail: "/images/modules/saving-goals.jpg",
    lessons: [
      { id: "1", title: "Why Save Money?", isCompleted: true, duration: "3:20" },
      { id: "2", title: "Setting Financial Goals", isCompleted: true, duration: "5:10" },
      { id: "3", title: "Creating a Savings Plan", isCompleted: true, duration: "4:45" },
      { id: "4", title: "Interest and Growth", isCompleted: false, duration: "6:30" },
      { id: "5", title: "Saving for Big Dreams", isCompleted: false, duration: "5:15" }
    ]
  },
  {
    id: "spending-wisely",
    title: "Spending Wisely",
    description: "Learn how to make smart spending decisions.",
    completedLessons: 2,
    totalLessons: 4,
    thumbnail: "/images/modules/spending.jpg",
    lessons: [
      { id: "1", title: "Needs vs. Wants", isCompleted: true, duration: "4:50" },
      { id: "2", title: "Comparing Prices", isCompleted: true, duration: "5:30" },
      { id: "3", title: "Making a Budget", isCompleted: false, duration: "6:15" },
      { id: "4", title: "Smart Shopping Habits", isCompleted: false, duration: "5:45" }
    ]
  },
  {
    id: "earning-money",
    title: "Earning Money",
    description: "Explore different ways kids can earn money.",
    completedLessons: 0,
    totalLessons: 3,
    thumbnail: "/images/modules/earning.jpg",
    lessons: [
      { id: "1", title: "Ways to Earn", isCompleted: false, duration: "4:20" },
      { id: "2", title: "Starting Small Businesses", isCompleted: false, duration: "5:40" },
      { id: "3", title: "Working and Responsibility", isCompleted: false, duration: "5:10" }
    ]
  },
  {
    id: "digital-money",
    title: "Digital Money",
    description: "Understanding modern financial technologies.",
    completedLessons: 1,
    totalLessons: 6,
    thumbnail: "",
    lessons: [
      { id: "1", title: "Banking Online", isCompleted: true, duration: "5:30" },
      { id: "2", title: "Digital Payments", isCompleted: false, duration: "4:15" },
      { id: "3", title: "Mobile Apps for Money", isCompleted: false, duration: "6:20" },
      { id: "4", title: "Safety and Security", isCompleted: false, duration: "7:10" },
      { id: "5", title: "Future of Money", isCompleted: false, duration: "5:50" },
      { id: "6", title: "Blockchain for Kids", isCompleted: false, duration: "6:40" }
    ]
  }
]

export async function GET() {
  try {
    // Verify the session
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }
    
    // Mock data for modules
    const modules = [
      {
        id: "1",
        title: "Part 1",
        description: "Find hidden treasures and learn about saving",
        thumbnailUrl: "/placeholder.svg?height=200&width=200",
        instructor: "Ms. Money",
        totalDuration: "12 min",
        objectives: [
          "Understand the importance of saving money",
          "Learn how to identify small saving opportunities",
          "Create a basic saving plan"
        ],
        lessons: [
          {
            id: "p1-l1",
            title: "Introduction to Saving",
            duration: "5 min",
            videoUrl: "https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4",
            isCompleted: true
          },
          {
            id: "p1-l2",
            title: "Finding Hidden Money",
            duration: "7 min",
            videoUrl: "https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4",
            isCompleted: false
          }
        ],
        completedLessons: 1,
        totalLessons: 2
      },
      {
        id: "2",
        title: "Part 2",
        description: "Climb to the top by making smart choices",
        thumbnailUrl: "/placeholder.svg?height=200&width=200",
        instructor: "Mr. Budget",
        totalDuration: "14 min",
        objectives: [
          "Learn to make informed spending decisions",
          "Understand budget basics",
          "Prioritize needs vs wants"
        ],
        lessons: [
          {
            id: "p2-l1",
            title: "Smart Money Choices",
            duration: "6 min",
            videoUrl: "https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4",
            isCompleted: true
          },
          {
            id: "p2-l2",
            title: "Budgeting Basics",
            duration: "8 min",
            videoUrl: "https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4",
            isCompleted: false
          }
        ],
        completedLessons: 1,
        totalLessons: 2
      },
      {
        id: "3",
        title: "Part 3",
        description: "Buy and sell to learn about markets",
        thumbnailUrl: "/placeholder.svg?height=200&width=200",
        instructor: "Dr. Market",
        totalDuration: "12 min",
        objectives: [
          "Understand how markets work",
          "Learn buying and selling basics",
          "Develop market awareness"
        ],
        lessons: [
          {
            id: "p3-l1",
            title: "Introduction to Markets",
            duration: "5 min",
            videoUrl: "https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4",
            isCompleted: true
          },
          {
            id: "p3-l2",
            title: "Buying and Selling",
            duration: "7 min",
            videoUrl: "https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4",
            isCompleted: false
          }
        ],
        completedLessons: 1,
        totalLessons: 2
      }
    ]
    
    return NextResponse.json({ modules })
    
  } catch (error) {
    console.error("Error fetching modules:", error)
    return NextResponse.json(
      { error: "Error fetching modules" },
      { status: 500 }
    )
  }
} 