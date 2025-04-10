import React from 'react';

export default function Leaderboard() {
  const contestData = {
    contestNumber: 444,
    questionNumber: 4,
    solved: 197,
    acceptance: "100%",
    participants: 197
  };

  const leaderboard = [
    { rank: 1, username: 'bdyby76545', language: 'python3', time: 'No time recorded', status: 'Accepted' },
    { rank: 2, username: 'Taher Patanwala', language: 'python3', time: 'No time recorded', status: 'Accepted' },
    { rank: 8, username: 'Rik Mahapatra', language: 'python3', time: 'No time recorded', status: 'Accepted' },
    { rank: 9, username: 'Yash Rathod', language: 'cpp', time: 'No time recorded', status: 'Accepted' },
    { rank: 10, username: 'Om Patel', language: 'cpp', time: 'No time recorded', status: 'Accepted' },
    { rank: 12, username: 'tajiyashaikh30', language: 'python3', time: 'No time recorded', status: 'Accepted' },
  ];

  return (
    <div className="bg-black text-white min-h-screen">
      {/* Navigation Bar */}
      <nav className="flex justify-between items-center px-6 py-4 border-b border-gray-800">
        <div className="flex items-center">
          <img src="/api/placeholder/40/40" alt="Logo" className="mr-2" />
          <span className="text-xl font-bold text-yellow-500">Similarity</span>
        </div>
        <div className="flex space-x-6">
          <a href="#" className="hover:text-gray-300">Why Us</a>
          <a href="#" className="hover:text-gray-300">Mission</a>
          <a href="#" className="hover:text-gray-300">About Us</a>
          <a href="#" className="hover:text-gray-300">FAQ</a>
          <a href="#" className="hover:text-gray-300">Contact Us</a>
          <a href="#" className="bg-yellow-600 px-4 py-1 rounded hover:bg-yellow-700">Contests</a>
        </div>
      </nav>

      {/* Back button */}
      <div className="px-6 py-4">
        <a href="#" className="flex items-center text-gray-400 hover:text-white">
          <span>← Back to Questions</span>
        </a>
      </div>

      {/* Contest Header */}
      <div className="px-6 py-2">
        <h1 className="text-3xl font-bold text-yellow-500">LeetCode Weekly Contest {contestData.contestNumber}</h1>
        <div className="flex text-gray-400 mt-1">
          <span>Question {contestData.questionNumber}</span>
          <span className="mx-2">•</span>
          <span>{contestData.solved} solved</span>
          <span className="mx-2">•</span>
          <span>{contestData.acceptance} acceptance</span>
        </div>
      </div>

      {/* Stats */}
      <div className="px-6 py-4 flex justify-end space-x-4">
        <div className="bg-gray-900 px-4 py-2 rounded flex items-center">
          <span className="text-yellow-500 mr-2">🏆</span>
          <span>Top Performers</span>
        </div>
        <div className="bg-gray-900 px-4 py-2 rounded flex items-center">
          <span className="text-yellow-500 mr-2">👥</span>
          <span>{contestData.participants} Participants</span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="px-6 py-4">
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center">
            <svg className="h-5 w-5 text-gray-400" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
              <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </span>
          <input type="text" placeholder="Search by username or language" className="w-full pl-10 pr-4 py-2 rounded bg-gray-800 text-white focus:outline-none" />
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="px-6 py-4">
        <table className="w-full border-collapse">
          <thead>
            <tr className="text-left border-b border-gray-800">
              <th className="py-3 px-6 text-yellow-500">Rank</th>
              <th className="py-3 px-6 text-yellow-500">Username</th>
              <th className="py-3 px-6 text-yellow-500">Language</th>
              <th className="py-3 px-6 text-yellow-500">Time</th>
              <th className="py-3 px-6 text-yellow-500">Status</th>
            </tr>
          </thead>
          <tbody>
            {leaderboard.map((user) => (
              <tr key={user.rank} className="border-b border-gray-800 hover:bg-gray-900">
                <td className="py-3 px-6 text-yellow-500">{user.rank}</td>
                <td className="py-3 px-6">{user.username}</td>
                <td className="py-3 px-6">
                  <span className={`px-2 py-1 rounded text-xs ${user.language === 'python3' ? 'bg-blue-800' : 'bg-purple-800'}`}>
                    {user.language}
                  </span>
                </td>
                <td className="py-3 px-6 text-gray-400">{user.time}</td>
                <td className="py-3 px-6">
                  <span className="flex items-center">
                    <span className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-white">
                      ✓
                    </span>
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}