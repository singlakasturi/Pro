// src/SolutionDetails.jsx
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { parseCSV } from "./utils/parseCSV";

export default function SolutionDetails() {
  const location = useLocation();
  const navigate = useNavigate();
  const params = location.state || {}; // { contestCode, questionNumber, username } from Leaderboard click
  const [solutionInfo, setSolutionInfo] = useState(null);
  const [similar, setSimilar] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        if (params.username) {
          let similarData = [];
          try {
            const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
            const simRes = await fetch(`${baseUrl}/api/v1/plagiarism/submissions/${params.submissionId}`);
            if (simRes.ok) {
              similarData = await simRes.json();
            }
          } catch (err) {
            console.error("Failed to fetch similar solutions from API:", err);
          }

          setSolutionInfo({
            contestId: params.contestCode || params.contestId,
            questionNumber: params.questionId || params.questionNumber,
            username: params.username,
            rank: params.rank,
            language: params.language,
            time: params.time,
            submissionId: params.submissionId,
            similarSolutionsCount: similarData.length,
          });
          setSimilar(similarData);
        } else {
          const res = await fetch("/data/solutions.csv");
          const text = await res.text();
          const rows = parseCSV(text);
          const main = rows[0];
          setSolutionInfo(main);

          const res2 = await fetch("/data/similar_solutions.csv");
          const text2 = await res2.text();
          const simRows = parseCSV(text2).filter(
            (r) => r.contestId === main?.contestId && String(r.questionNumber) === String(main?.questionNumber)
          );
          setSimilar(simRows);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [location.state]);

  if (loading) return <div className="text-white p-6">Loading...</div>;
  if (!solutionInfo) return <div className="bg-black min-h-screen text-white flex items-center justify-center">Solution not found</div>;

  const getSimilarityColor = (similarity) => {
    const value = parseFloat(similarity);
    if (value >= 99) return "bg-red-700";
    if (value >= 75) return "bg-yellow-700";
    return "bg-green-700";
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="relative flex items-center justify-center">
            <button
              onClick={() => navigate(`/leaderboard/${solutionInfo.contestId}/${solutionInfo.questionNumber}`)}
              className="absolute left-0 flex items-center gap-2 text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              <ArrowLeft size={18} />
              <span className="hidden sm:inline">Back to Rankings</span>
            </button>
            <h1 className="text-5xl font-bold text-yellow-500 text-center">Solution Details</h1>
          </div>
          <div className="flex items-center justify-center space-x-2 text-gray-400 mt-2">
            <span>{solutionInfo.contestId}</span>
            <span>•</span>
            <span>Question {solutionInfo.questionNumber}</span>
          </div>
        </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-black text-2xl font-bold">{solutionInfo.avatar || solutionInfo.username?.[0]}</div>
            <h2 className="text-2xl font-bold">{solutionInfo.username}</h2>
          </div>

          <div className="bg-gray-900 rounded-lg p-6">
            <h3 className="text-xl text-yellow-500 mb-4">Performance Stats</h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-800 p-4 rounded">
                <p className="text-gray-400 mb-2">Rank</p>
                <p className="text-xl font-bold">#{solutionInfo.rank}</p>
              </div>

              <div className="bg-gray-800 p-4 rounded">
                <p className="text-gray-400 mb-2">Language</p>
                <span className="bg-blue-800 text-white text-sm px-3 py-1 rounded">{solutionInfo.language}</span>
              </div>

              <div className="bg-gray-800 p-4 rounded">
                <p className="text-gray-400 mb-2">Time</p>
                <div className="flex items-center">
                  <span className="text-xl">{solutionInfo.time}</span>
                </div>
              </div>

              <div className="bg-gray-800 p-4 rounded">
                <p className="text-gray-400 mb-2">Similar Solutions</p>
                <div className="flex items-center">
                  <span className="text-xl">{solutionInfo.similarSolutionsCount}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex items-center gap-4">
            <button
              onClick={() => {
                const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
                const path = solutionInfo.submissionId 
                  ? `${baseUrl}/contest/${solutionInfo.contestId}/questions/${solutionInfo.questionNumber}/code/${solutionInfo.submissionId}`
                  : solutionInfo.codePath;
                navigate("/code-view", { state: { codePath: path } });
              }}
              className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-3 rounded flex items-center justify-center cursor-pointer font-medium"
            >
              View Code
            </button>
            <button
              onClick={() => {
                const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
                const path = solutionInfo.submissionId 
                  ? `${baseUrl}/contest/${solutionInfo.contestId}/questions/${solutionInfo.questionNumber}/code/${solutionInfo.submissionId}`
                  : solutionInfo.codePath;
                navigate("/compare-code", {
                  state: {
                    similarList: similar,
                    currentIndex: 0,
                    mainUsername: solutionInfo.username,
                    mainCodePath: path,
                    solutionInfo: solutionInfo
                  }
                });
              }}
              disabled={similar.length === 0}
              className={`px-6 py-3 rounded flex items-center justify-center font-medium transition-all ${
                similar.length === 0 
                  ? "bg-zinc-900 text-zinc-600 cursor-not-allowed opacity-50 border border-zinc-800" 
                  : "bg-transparent border border-yellow-500 hover:bg-yellow-500/10 text-yellow-500 cursor-pointer"
              }`}
            >
              Compare Code
            </button>
          </div>
        </div>

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
                {similar.length === 0 && (
                  <tr>
                    <td className="p-4 text-gray-400" colSpan="5">
                      No Similar Solutions
                    </td>
                  </tr>
                )}
                {similar.map((s, index) => (
                  <tr key={index} className="border-b border-gray-800">
                    <td className="py-3 px-4">{s.rank}</td>
                    <td className="py-3 px-4">{s.username}</td>
                    <td className="py-3 px-4">
                      <span className="bg-blue-800 text-white text-xs px-2 py-1 rounded">{s.language}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`${getSimilarityColor(s.similarity)} text-white text-xs px-2 py-1 rounded`}>{s.similarity}</span>
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => navigate("/code-view", { state: { codePath: s.codePath } })}
                        className="flex items-center text-white hover:text-gray-300 cursor-pointer font-medium"
                      >
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
  </div>
  );
}
