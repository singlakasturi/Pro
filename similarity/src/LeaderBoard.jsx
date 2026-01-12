// src/LeaderBoard.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { parseCSV } from "./utils/parseCSV";

export default function Leaderboard() {
  const { contestCode, questionNumber } = useParams();
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState({ contestNumber: contestCode, questionNumber });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBoard = async () => {
      try {
        const res = await fetch("/data/leaderboard.csv");
        const text = await res.text();
        const data = parseCSV(text);
        const filtered = data
          .filter((r) => r.contestCode === contestCode && String(r.questionNumber) === String(questionNumber))
          .map((r) => ({
            rank: Number(r.rank),
            username: r.username,
            language: r.language,
            time: r.time,
            status: r.status,
          }))
          .sort((a, b) => a.rank - b.rank);
        setRows(filtered);
        setMeta((m) => ({ ...m, participants: filtered.length }));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchBoard();
  }, [contestCode, questionNumber]);

  if (loading) return <div className="text-white p-6">Loading leaderboard...</div>;
  if (!rows.length) return <div className="bg-black min-h-screen text-white flex items-center justify-center">No leaderboard data found</div>;

  return (
    <div className="bg-black text-white min-h-screen">
      <nav className="flex justify-between items-center px-6 py-4 border-b border-gray-800">
        <div className="flex items-center">
          <img src="/api/placeholder/40/40" alt="Logo" className="mr-2" />
          <span className="text-xl font-bold text-yellow-500">Similarity</span>
        </div>
        <div className="flex space-x-6">
          <a href="#" className="hover:text-gray-300">Why Us</a>
          <a href="#" className="hover:text-gray-300">Mission</a>
          <a href="#" className="hover:text-gray-300">FAQ</a>
          <a href="#" className="hover:text-gray-300">Contact Us</a>
          <a href="/contests" className="bg-yellow-600 px-4 py-1 rounded hover:bg-yellow-700">Contests</a>
        </div>
      </nav>

      <div className="px-6 py-4">
        <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-white">← Back to Questions</button>
      </div>

      <div className="px-6 py-2">
        <h1 className="text-3xl font-bold text-yellow-500">Contest {meta.contestNumber}</h1>
        <div className="flex text-gray-400 mt-1">
          <span>Question {meta.questionNumber}</span>
          <span className="mx-2">•</span>
          <span>{meta.participants || rows.length} Participants</span>
        </div>
      </div>

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
            {rows.map((user) => (
              <tr key={user.rank} className="border-b border-gray-800 hover:bg-gray-900">
                <td className="py-3 px-6 text-yellow-500">{user.rank}</td>
                <td className="py-3 px-6">
                  <button
                    onClick={() => navigate("/solution-details", { state: { contestCode, questionNumber, username: user.username } })}
                    className="text-left hover:underline"
                  >
                    {user.username}
                  </button>
                </td>
                <td className="py-3 px-6">
                  <span className={`px-2 py-1 rounded text-xs ${user.language === "python3" ? "bg-blue-800" : "bg-purple-800"}`}>{user.language}</span>
                </td>
                <td className="py-3 px-6 text-gray-400">{user.time}</td>
                <td className="py-3 px-6">
                  <span className="flex items-center">
                    <span className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-white">✓</span>
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
