// src/SolutionDetails.jsx
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
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
        // fetch solutions master CSV
        const res = await fetch("/data/solutions.csv");
        const text = await res.text();
        const rows = parseCSV(text);

        // find main solution row
        const main = rows.find(
          (r) =>
            r.contestId === (params.contestCode || r.contestId) &&
            String(r.questionNumber) === String(params.questionNumber || r.questionNumber) &&
            (!params.username || r.username === params.username)
        );

        if (!main) {
          // fallback: choose first that matches contestId + questionNumber
          const fallback = rows.find((r) => r.contestId === (params.contestCode || rows[0]?.contestId));
          if (fallback) {
            setSolutionInfo(fallback);
          } else {
            setSolutionInfo(null);
          }
        } else {
          setSolutionInfo(main);
        }

        // load similar solutions CSV
        const res2 = await fetch("/data/similar_solutions.csv");
        const text2 = await res2.text();
        const simRows = parseCSV(text2).filter(
          (r) => r.contestId === (params.contestCode || main?.contestId) && String(r.questionNumber) === String(params.questionNumber || main?.questionNumber)
        );

        setSimilar(simRows);
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
    <div className="bg-black text-white p-6">
      <h1 className="text-3xl font-bold text-yellow-500 mb-2">Solution Details</h1>
      <div className="flex items-center space-x-2 text-gray-400 mb-6">
        <span>{solutionInfo.contestId}</span>
        <span>•</span>
        <span>Question {solutionInfo.questionNumber}</span>
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

          <div className="mt-6">
            <button
              onClick={() => {
                // open CodeView with codePath
                navigate("/code-view", { state: { codePath: solutionInfo.codePath } });
              }}
              className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-3 rounded flex items-center justify-center"
            >
              View Code
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
                      No similar solutions found in CSV.
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
                        className="flex items-center text-white hover:text-gray-300"
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
  );
}
