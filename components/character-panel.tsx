"use client"

export function CharacterPanel() {
  return (
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
            <span className="text-sm font-medium">Level 3</span>
            <span className="text-sm font-medium">75%</span>
          </div>
          <div className="h-2 bg-white/30 rounded-full overflow-hidden">
            <div className="h-full bg-white rounded-full" style={{ width: '75%' }}></div>
          </div>
        </div>
        
        {/* Character stats */}
        <div className="w-full mt-3 grid grid-cols-2 gap-2">
          <div className="bg-blue-200/50 p-2 rounded-lg text-center">
            <span className="text-xs font-medium text-blue-900 block">Total Coins</span>
            <span className="text-lg font-bold text-blue-900">350</span>
          </div>
          <div className="bg-blue-200/50 p-2 rounded-lg text-center">
            <span className="text-xs font-medium text-blue-900 block">Tasks</span>
            <span className="text-lg font-bold text-blue-900">12/15</span>
          </div>
        </div>
      </div>
    </div>
  )
}
