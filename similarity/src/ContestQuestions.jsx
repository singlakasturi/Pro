import React from 'react';

export default function ContestQuestions() {
  const contestInfo = {
    contestNumber: 444,
    duration: "1h 30m",
    totalPoints: 17,
    questionCount: 3
  };

  const questions = [
    {
      questionNumber: 4,
      title: "Minimum Pair Removal to Sort Array II",
      difficulty: "HARD",
      acceptance: "4.3%",
      points: 6
    },
    {
      questionNumber: 3,
      title: "Maximum Product of Subsequences With an Alternating Sum Equal to K",
      difficulty: "HARD",
      acceptance: "2.0%",
      points: 6
    },
    {
      questionNumber: 2,
      title: "Implement Router",
      difficulty: "MEDIUM",
      acceptance: "16.3%",
      points: 5
    }
  ];

  // Map difficulty to background color
  const difficultyColors = {
    'EASY': 'bg-green-700',
    'MEDIUM': 'bg-yellow-700',
    'HARD': 'bg-red-700'
  };

  return (
    <div className="bg-black min-h-screen text-white p-6">
      <h1 className="text-4xl font-bold text-yellow-500 text-center mb-2">
        LeetCode Weekly Contest {contestInfo.contestNumber}
      </h1>
      <p className="text-gray-400 text-center mb-6">
        Select a question to view rankings
      </p>
      
      <div className="bg-gray-800 rounded-full max-w-md mx-auto mb-12 flex justify-around p-2">
        <div className="flex items-center text-gray-300">
          <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {contestInfo.duration} duration
        </div>
        <div className="flex items-center text-gray-300">
          <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
          </svg>
          {contestInfo.totalPoints} points total
        </div>
        <div className="flex items-center text-gray-300">
          <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {contestInfo.questionCount} questions
        </div>
      </div>
      
      {questions.map((question) => (
        <div key={question.questionNumber} className="bg-gray-900 rounded-lg p-6 mb-4 shadow-md">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-6">
              <div className="bg-yellow-800 text-yellow-400 px-3 py-2 rounded font-bold">
                Q{question.questionNumber}
              </div>
              
              <div>
                <h3 className="text-xl text-white font-medium mb-3">{question.title}</h3>
                <div className="flex items-center space-x-3">
                  <span className={`${difficultyColors[question.difficulty]} text-white text-sm px-3 py-1 rounded-md uppercase`}>
                    {question.difficulty}
                  </span>
                  <span className="bg-purple-800 text-white text-sm px-3 py-1 rounded-md">
                    {question.acceptance} Acceptance
                  </span>
                  <span className="bg-blue-800 text-white text-sm px-3 py-1 rounded-md">
                    {question.points} Points
                  </span>
                </div>
              </div>
            </div>
            
            <div>
              <button className="flex items-center text-yellow-500 hover:text-yellow-400">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-5 w-5 mr-2" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
                View Rankings
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}