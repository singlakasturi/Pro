import React from 'react';

export default function SolutionDetails() {
  const solutionInfo = {
    contestId: "weekly-contest-444",
    questionNumber: 4,
    mainUser: {
      username: "bdyby76545",
      avatar: "B",
      rank: 1,
      language: "python3",
      time: "0:00",
      similarSolutionsCount: 6
    },
    similarSolutions: [
      { rank: 19, username: "Aryandonnn", language: "python3", similarity: "100.0%" },
      { rank: 44, username: "C2UvuQTsxC", language: "python3", similarity: "100.0%" },
      { rank: 8, username: "Rik Mahapatra", language: "python3", similarity: "100.0%" },
      { rank: 26, username: "DeVaNsHu_TripAtHi", language: "python3", similarity: "99.8%" },
      { rank: 212, username: "Antagonist_378", language: "python3", similarity: "79.4%" },
      { rank: 109, username: "AMAN", language: "python3", similarity: "66.1%" }
    ]
  };

  // Helper function to generate similarity badge color
  const getSimilarityColor = (similarity) => {
    const value = parseFloat(similarity);
    if (value >= 99) return "bg-red-700";
    if (value >= 75) return "bg-yellow-700";
    return "bg-green-700";
  };

  return (
    <div className="bg-black text-white p-6">
      <h1 className="text-3xl font-bold text-yellow-500 mb-2">Solution Details</h1>
      <div className="flex items-center space-x-2 text-gray-400 mb-6">
        <span>{solutionInfo.contestId}</span>
        <span>•</span>
        <span>Question {solutionInfo.questionNumber}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left column - User details */}
        <div>
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-black text-2xl font-bold">
              {solutionInfo.mainUser.avatar}
            </div>
            <h2 className="text-2xl font-bold">{solutionInfo.mainUser.username}</h2>
          </div>

          <div className="bg-gray-900 rounded-lg p-6">
            <h3 className="text-xl text-yellow-500 mb-4">Performance Stats</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-800 p-4 rounded">
                <p className="text-gray-400 mb-2">Rank</p>
                <p className="text-xl font-bold">#{solutionInfo.mainUser.rank}</p>
              </div>
              
              <div className="bg-gray-800 p-4 rounded">
                <p className="text-gray-400 mb-2">Language</p>
                <span className="bg-blue-800 text-white text-sm px-3 py-1 rounded">
                  {solutionInfo.mainUser.language}
                </span>
              </div>
              
              <div className="bg-gray-800 p-4 rounded">
                <p className="text-gray-400 mb-2">Time</p>
                <div className="flex items-center">
                  <svg className="h-5 w-5 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-xl">{solutionInfo.mainUser.time}</span>
                </div>
              </div>
              
              <div className="bg-gray-800 p-4 rounded">
                <p className="text-gray-400 mb-2">Similar Solutions</p>
                <div className="flex items-center">
                  <svg className="h-5 w-5 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span className="text-xl">{solutionInfo.mainUser.similarSolutionsCount}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <button className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-3 rounded flex items-center justify-center">
              <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
              View Code
            </button>
          </div>
        </div>

        {/* Right column - Similar solutions */}
        <div>
          <h3 className="text-2xl text-yellow-500 mb-4">Similar Solutions</h3>
          <p className="text-gray-400 mb-6">Users who submitted similar solutions to this problem</p>
          
          <div className="bg-gray-900 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left py-3 px-4 text-yellow-500">Rank</th>
                  <th className="text-left py-3 px-4 text-yellow-500">Username</th>
                  <th className="text-left py-3 px-4 text-yellow-500">Language</th>
                  <th className="text-left py-3 px-4 text-yellow-500">Similarity</th>
                  <th className="text-left py-3 px-4 text-yellow-500">Code</th>
                </tr>
              </thead>
              <tbody>
                {solutionInfo.similarSolutions.map((solution, index) => (
                  <tr key={index} className="border-b border-gray-800">
                    <td className="py-3 px-4">{solution.rank}</td>
                    <td className="py-3 px-4">{solution.username}</td>
                    <td className="py-3 px-4">
                      <span className="bg-blue-800 text-white text-xs px-2 py-1 rounded">
                        {solution.language}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`${getSimilarityColor(solution.similarity)} text-white text-xs px-2 py-1 rounded`}>
                        {solution.similarity}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <button className="flex items-center text-white hover:text-gray-300">
                        <svg className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                        </svg>
                        Code
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}