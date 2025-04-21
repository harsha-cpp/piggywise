"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useQuery } from "@tanstack/react-query"
import { Button } from "./ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog"
import { Lightbulb, Award, CheckCircle, ListChecks } from "lucide-react"

interface CharacterPanelProps {
  lessonsCompleted?: number;
}

interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
}

interface Task {
  id: string;
  title: string;
  description?: string;
  status: "PENDING" | "COMPLETED";
  childId: string;
  dueDate?: string;
  createdAt: string;
}

export function CharacterPanel({ lessonsCompleted = 7 }: CharacterPanelProps) {
  const { data: session } = useSession()
  const [userXP, setUserXP] = useState(0)
  const [userLevel, setUserLevel] = useState(1)
  const [quizOpen, setQuizOpen] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selections, setSelections] = useState<Record<number, string>>({})
  const [score, setScore] = useState(0)
  const [quizCompleted, setQuizCompleted] = useState(false)
  const [earnedXP, setEarnedXP] = useState(0)
  const [quizSet, setQuizSet] = useState(1)
  const [allQuizzesCompleted, setAllQuizzesCompleted] = useState(false)
  
  // Store completed quiz sets
  const [completedQuizSets, setCompletedQuizSets] = useState<number[]>([])
  
  // Calculate tasks completed/total
  const [completedTasks, setCompletedTasks] = useState(0)
  const [totalTasks, setTotalTasks] = useState(0)
  
  // Quiz set 1 - Easy questions for children
  const quizSet1: QuizQuestion[] = [
    {
      id: 1,
      question: "What can you do if you need money?",
      options: [
        "Take money from someone's wallet without asking",
        "Cry until someone gives you money",
        "Help with chores and earn money",
        "Never spend money ever again"
      ],
      correctAnswer: 2
    },
    {
      id: 2,
      question: "Where is a safe place to keep your money?",
      options: [
        "Under your pillow",
        "In a piggy bank or savings account",
        "In your pocket all the time",
        "Hidden in your favorite toy"
      ],
      correctAnswer: 1
    },
    {
      id: 3,
      question: "What should you do before buying a toy?",
      options: [
        "Ask if you have enough money for it",
        "Buy it right away before someone else does",
        "Cry if your parents say no",
        "Get as many toys as possible"
      ],
      correctAnswer: 0
    },
    {
      id: 4,
      question: "What is an allowance?",
      options: [
        "When you're allowed to stay up late",
        "Money your parents give you regularly",
        "When you get extra dessert",
        "A type of piggy bank"
      ],
      correctAnswer: 1
    },
    {
      id: 5,
      question: "What can you do with money you save?",
      options: [
        "Only keep it forever and never spend it",
        "Buy everything you see right away",
        "Save for something special you really want",
        "Give all your money away"
      ],
      correctAnswer: 2
    }
  ];
  
  // Quiz set 2 - Another set of easy questions
  const quizSet2: QuizQuestion[] = [
    {
      id: 1,
      question: "What is the difference between 'needs' and 'wants'?",
      options: [
        "They are the same thing",
        "Needs are things you must have, wants are nice to have",
        "Wants are more important than needs",
        "Needs are only for grown-ups"
      ],
      correctAnswer: 1
    },
    {
      id: 2,
      question: "What can you do to earn money as a kid?",
      options: [
        "Take money from your sibling",
        "Help with tasks around the house",
        "Ask for money every day",
        "Nothing, kids can't earn money"
      ],
      correctAnswer: 1
    },
    {
      id: 3,
      question: "If you have $5 and want to buy a $7 toy, what should you do?",
      options: [
        "Borrow $2 and never pay it back",
        "Cry until someone buys it for you",
        "Save more money until you have enough",
        "Buy it anyway and worry later"
      ],
      correctAnswer: 2
    },
    {
      id: 4,
      question: "What helps you keep track of your money?",
      options: [
        "Spending it right away",
        "Hiding it in different places",
        "Keeping a list of what you save and spend",
        "Letting someone else handle it"
      ],
      correctAnswer: 2
    },
    {
      id: 5,
      question: "What is a smart money goal?",
      options: [
        "Getting as much money as possible",
        "Saving for something special you want",
        "Spending all your money right away",
        "Never spending any money"
      ],
      correctAnswer: 1
    }
  ];
  
  // Get current quiz set based on quizSet state
  const getCurrentQuizSet = () => {
    if (quizSet === 1) return quizSet1;
    if (quizSet === 2) return quizSet2;
    return quizSet1; // Default to first set
  };
  
  // Fetch user progress data
  const { data: progressData } = useQuery({
    queryKey: ["childProgress"],
    queryFn: async () => {
      const response = await fetch('/api/child/progress');
      if (!response.ok) {
        // If API isn't available, return default data based on lessons completed
        return { 
          lessonsCompleted: lessonsCompleted,
          modulesCompleted: Math.floor(lessonsCompleted / 5) // Assuming modules have around 5 lessons
        };
      }
      return response.json();
    },
    enabled: !!session?.user?.id,
    // Refetch more frequently to catch XP updates
    refetchInterval: 5000,
  });
  
  // Fetch tasks data
  const { data: tasksData } = useQuery({
    queryKey: ["childTasks"],
    queryFn: async () => {
      const response = await fetch('/api/child/tasks');
      if (!response.ok) {
        throw new Error('Failed to fetch tasks');
      }
      return response.json();
    },
    enabled: !!session?.user?.id,
    refetchInterval: 5000,
  });
  
  // Update tasks count when task data changes
  useEffect(() => {
    if (tasksData?.tasks) {
      const allTasks = tasksData.tasks.filter((task: Task) => task.childId === session?.user?.id);
      const completed = allTasks.filter((task: Task) => task.status === "COMPLETED").length;
      
      setCompletedTasks(completed);
      setTotalTasks(allTasks.length);
    }
  }, [tasksData, session?.user?.id]);
  
  // Calculate XP and level based on progress
  useEffect(() => {
    // Default to props value if data isn't available
    const completedLessons = progressData?.lessonsCompleted || lessonsCompleted;
    const completedModules = progressData?.modulesCompleted || Math.floor(lessonsCompleted / 5);
    
    // Calculate XP based on the rules
    // - 25 XP per lesson completed
    // - 20 XP bonus for each module completed
    const lessonXP = completedLessons * 25;
    const moduleXP = completedModules * 20;
    
    // Add stored quiz XP if available
    let quizXP = 0;
    if (typeof window !== 'undefined') {
      const storedQuizXP = localStorage.getItem('quizXP');
      if (storedQuizXP) {
        try {
          quizXP = parseInt(storedQuizXP, 10) || 0;
        } catch (e) {
          console.error("Error parsing quiz XP", e);
        }
      }
    }
    
    const totalXP = lessonXP + moduleXP + quizXP;
    
    // Calculate level (each level requires 100 XP)
    const calculatedLevel = Math.floor(totalXP / 100) + 1;
    
    setUserXP(totalXP);
    setUserLevel(calculatedLevel);
  }, [progressData, lessonsCompleted]);
  
  // Load completed quiz sets from localStorage on component mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedCompletedSets = localStorage.getItem('completedQuizSets');
      if (savedCompletedSets) {
        try {
          const parsed = JSON.parse(savedCompletedSets);
          setCompletedQuizSets(parsed);
          // Check if all quiz sets are completed
          setAllQuizzesCompleted(parsed.includes(1) && parsed.includes(2));
        } catch (e) {
          console.error("Error parsing saved quiz sets", e);
        }
      }
    }
  }, []);
  
  // Calculate level progress percentage
  const calculateLevelProgress = () => {
    const xpForCurrentLevel = (userLevel - 1) * 100;
    const xpForNextLevel = userLevel * 100;
    const xpInCurrentLevel = userXP - xpForCurrentLevel;
    const xpNeededForNextLevel = xpForNextLevel - xpForCurrentLevel;
    return Math.round((xpInCurrentLevel / xpNeededForNextLevel) * 100);
  }
  
  const handleStartQuiz = () => {
    // If all quizzes completed, show message and don't open quiz
    if (allQuizzesCompleted) {
      return;
    }
    
    // Determine which quiz set to show
    let nextQuizSet = 1;
    if (completedQuizSets.includes(1)) {
      nextQuizSet = 2;
    }
    
    setQuizSet(nextQuizSet);
    setQuizOpen(true);
    setCurrentQuestion(0);
    setScore(0);
    setQuizCompleted(false);
    setEarnedXP(0);
    setSelections({});
  }
  
  const handleOptionSelect = (value: string) => {
    setSelections(prev => ({
      ...prev,
      [currentQuestion]: value
    }));
  }
  
  const handleNextQuestion = () => {
    const currentSelection = selections[currentQuestion];
    const currentQuizSet = getCurrentQuizSet();
    
    if (currentSelection === currentQuizSet[currentQuestion].correctAnswer.toString()) {
      setScore(score + 1);
    }
    
    if (currentQuestion < currentQuizSet.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      completeQuiz();
    }
  }
  
  const completeQuiz = () => {
    const currentSelection = selections[currentQuestion];
    const currentQuizSet = getCurrentQuizSet();
    
    const finalScore = currentSelection === currentQuizSet[currentQuestion].correctAnswer.toString() 
      ? score + 1 
      : score;
    
    // Calculate XP earned (10 XP per correct answer)
    const xpEarned = finalScore * 10;
    setEarnedXP(xpEarned);
    setScore(finalScore);
    setQuizCompleted(true);
    
    // Update completed quiz sets
    if (!completedQuizSets.includes(quizSet)) {
      const updatedCompletedSets = [...completedQuizSets, quizSet];
      setCompletedQuizSets(updatedCompletedSets);
      
      // Save to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('completedQuizSets', JSON.stringify(updatedCompletedSets));
        
        // Store earned quiz XP in localStorage
        const currentQuizXP = parseInt(localStorage.getItem('quizXP') || '0', 10);
        const newTotalQuizXP = currentQuizXP + xpEarned;
        localStorage.setItem('quizXP', newTotalQuizXP.toString());
        
        // Immediately update the XP display
        const completedLessons = progressData?.lessonsCompleted || lessonsCompleted;
        const completedModules = progressData?.modulesCompleted || Math.floor(lessonsCompleted / 5);
        const lessonXP = completedLessons * 25;
        const moduleXP = completedModules * 20;
        const updatedTotalXP = lessonXP + moduleXP + newTotalQuizXP;
        setUserXP(updatedTotalXP);
        setUserLevel(Math.floor(updatedTotalXP / 100) + 1);
      }
      
      // Check if all quizzes are now completed
      if (updatedCompletedSets.includes(1) && updatedCompletedSets.includes(2)) {
        setAllQuizzesCompleted(true);
      }
    }
    
    // Update user XP via API if available
    if (typeof window !== 'undefined' && window.earnXP && session?.user) {
      window.earnXP(xpEarned);
    }
  }
  
  const closeQuiz = () => {
    setQuizOpen(false);
  }
  
  return (
    <>
      <div
        className="bg-gradient-to-b from-blue-300 to-blue-400 rounded-xl shadow-md overflow-hidden h-auto border border-blue-200"
      >
        <div className="p-4 flex flex-col items-center h-full relative">
          {/* Character name */}
          <div className="bg-white/80 px-4 py-1 rounded-full mb-8 mt-2">
            <h3 className="font-bold text-blue-800">Saver Dragon</h3>
          </div>
          
          {/* Character face */}
          <div className="w-full flex-1 relative flex flex-col items-center justify-center">
            {/* Eyes */}
            <div className="flex justify-center mb-10">
              <div className="w-10 h-5 bg-white rounded-full mx-5 relative">
                <div className="w-4 h-4 bg-black rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
              </div>
              <div className="w-10 h-5 bg-white rounded-full mx-5 relative">
                <div className="w-4 h-4 bg-black rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
              </div>
            </div>

            {/* Mouth */}
            <div className="w-28 h-10 bg-white rounded-full mb-8 flex items-center justify-center">
              <div className="flex items-center justify-between w-20">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="w-1 h-4 bg-gray-300 rounded-full"></div>
                ))}
              </div>
            </div>
          </div>

          {/* Character level and progress */}
          <div className="w-full bg-blue-500/50 p-2 rounded-lg">
            <div className="flex justify-between items-center text-white mb-1">
              <span className="text-sm font-medium">Level {userLevel}</span>
              <span className="text-sm font-medium">{calculateLevelProgress()}%</span>
            </div>
            <div className="h-2 bg-white/30 rounded-full overflow-hidden">
              <div className="h-full bg-white rounded-full" style={{ width: `${calculateLevelProgress()}%` }}></div>
            </div>
          </div>
          
          {/* Character stats */}
          <div className="w-full mt-3 grid grid-cols-2 gap-2">
            <div className="bg-blue-200/50 p-2 rounded-lg text-center">
              <span className="text-xs font-medium text-blue-900 block">Total XP</span>
              <span className="text-lg font-bold text-blue-900">{userXP}</span>
            </div>
            <div className="bg-blue-200/50 p-2 rounded-lg text-center">
              <span className="text-xs font-medium text-blue-900 block">Tasks</span>
              <span className="text-lg font-bold text-blue-900">
                {totalTasks > 0 ? `${completedTasks}/${totalTasks}` : "No tasks"}
              </span>
            </div>
          </div>
          
          {/* Lessons Completed Stats */}
          <div className="w-full mt-2 bg-blue-200/50 p-2 rounded-lg text-center">
            <span className="text-xs font-medium text-blue-900 block">Lessons Completed</span>
            <span className="text-lg font-bold text-blue-900">{progressData?.lessonsCompleted || lessonsCompleted}</span>
          </div>
          
          {/* Quiz Button */}
          <Button 
            onClick={handleStartQuiz}
            className={`w-full mt-3 ${
              allQuizzesCompleted 
                ? 'bg-green-500 hover:bg-green-600 text-white' 
                : 'bg-indigo-500 hover:bg-indigo-600 text-white'
            }`}
          >
            {allQuizzesCompleted ? (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Quizzes Completed!
              </>
            ) : (
              <>
                <Lightbulb className="w-4 h-4 mr-2" />
                Take a Quiz {completedQuizSets.length > 0 ? `(${completedQuizSets.length}/2)` : ''}
              </>
            )}
          </Button>
        </div>
      </div>
      
      {/* Quiz Dialog */}
      <Dialog open={quizOpen} onOpenChange={setQuizOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {quizCompleted 
                ? 'Quiz Results' 
                : `Question ${currentQuestion + 1} of ${getCurrentQuizSet().length}`}
            </DialogTitle>
          </DialogHeader>
          
          {!quizCompleted ? (
            <>
              <div className="mb-4">
                <h3 className="text-lg font-semibold mb-4">{getCurrentQuizSet()[currentQuestion].question}</h3>
                
                <div className="space-y-2">
                  {getCurrentQuizSet()[currentQuestion].options.map((option, index) => (
                    <div 
                      key={`question-${currentQuestion}-option-${index}`} 
                      className={`flex items-center space-x-2 border p-3 rounded-md cursor-pointer ${
                        selections[currentQuestion] === index.toString() 
                          ? 'bg-blue-50 border-blue-300' 
                          : 'hover:bg-gray-50'
                      }`}
                      onClick={() => handleOptionSelect(index.toString())}
                    >
                      <div className={`h-4 w-4 rounded-full border ${
                        selections[currentQuestion] === index.toString() 
                          ? 'bg-blue-500 border-blue-500' 
                          : 'border-gray-300'
                      }`}>
                        {selections[currentQuestion] === index.toString() && (
                          <div className="h-1.5 w-1.5 rounded-full bg-white m-auto mt-[3px]" />
                        )}
                      </div>
                      <div className="flex-1">
                        {option}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <DialogFooter>
                <Button 
                  onClick={handleNextQuestion}
                  disabled={!selections[currentQuestion]}
                  className="w-full"
                >
                  {currentQuestion < getCurrentQuizSet().length - 1 ? 'Next Question' : 'Complete Quiz'}
                </Button>
              </DialogFooter>
            </>
          ) : (
            <div className="text-center py-4">
              <Award className="w-16 h-16 mx-auto text-yellow-500 mb-4 quiz-result-animation" />
              <h3 className="text-2xl font-bold mb-2">You scored: {score}/{getCurrentQuizSet().length}</h3>
              <p className="text-green-600 font-semibold mb-6 quiz-badge">+{earnedXP} XP earned!</p>
              
              {completedQuizSets.length >= 2 ? (
                <div className="mb-4 p-3 bg-green-50 rounded-md border border-green-200">
                  <ListChecks className="w-6 h-6 mx-auto text-green-600 mb-2" />
                  <p className="text-sm text-green-800">You've completed all available quizzes!</p>
                  <p className="text-xs text-green-600 mt-1">More coming soon!</p>
                </div>
              ) : (
                <div className="mb-4 p-3 bg-blue-50 rounded-md border border-blue-200">
                  <p className="text-sm">Quiz {quizSet}/2 completed! {2 - completedQuizSets.length} more quiz available.</p>
                </div>
              )}
              
              <Button onClick={closeQuiz} className="w-full">
                Close
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}