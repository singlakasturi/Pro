// src/LeaderBoard.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { parseCSV } from "./utils/parseCSV";

export default function Leaderboard({ user, onSignOut }) {
  const { contestCode, questionId } = useParams();
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState({ contestNumber: contestCode, questionId });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBoard = async () => {
      try {
        const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
        const res = await fetch(`${baseUrl}/contests/${contestCode}/questions/${questionId}`);
        if (!res.ok) throw new Error("Failed to fetch leaderboard");
        const json = await res.json();
        const data = json.map((s, index) => ({
          rank: index + 1,
          username: s.username,
          language: s.language,
          time: s.submissionDate ? new Date(s.submissionDate).toLocaleString() : "",
          status: "Accepted",
          submissionId: s.submissionId,
        }));
        setRows(data);
        setMeta((m) => ({ ...m, participants: data.length }));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchBoard();
  }, [contestCode, questionId]);

  if (loading) return <div className="text-white p-6">Loading leaderboard...</div>;
  if (!rows.length) return <div className="bg-black min-h-screen text-white flex items-center justify-center">No leaderboard data found</div>;

  return (
    <div className="bg-black text-white min-h-screen">
      <nav className="flex justify-between items-center px-6 py-4 border-b border-gray-800">
        <div className="flex items-center">
          <img src="/api/placeholder/40/40" alt="Logo" className="mr-2" />
          <span className="text-xl font-bold text-yellow-500">Similarity</span>
        </div>
        <div className="flex space-x-6 items-center">
          <a href="#" className="hover:text-gray-300">Why Us</a>
          <a href="#" className="hover:text-gray-300">Mission</a>
          <a href="#" className="hover:text-gray-300">FAQ</a>
          <a href="#" className="hover:text-gray-300">Contact Us</a>
          {user && user.email === "kasturisingla2@gmail.com" && (
            <Link
              to="/admin/populator"
              className="text-xs text-[#abd9ff] hover:text-[#8ec7f5] transition-colors cursor-pointer font-semibold mr-2 bg-[#abd9ff]/10 py-1 px-3.5 rounded-full border border-[#abd9ff]/20 hover:border-[#abd9ff]/45"
            >
              Admin Panel
            </Link>
          )}
          {user && (
            <div className="flex items-center space-x-2 bg-white/10 rounded-full py-1 px-3 border border-white/10">
              <img
                src={user.picture}
                alt={user.name}
                className="w-5 h-5 rounded-full border border-white/20"
                onError={(e) => { e.target.src = "https://www.gravatar.com/avatar?d=mp"; }}
              />
              <span className="text-xs text-zinc-300 font-medium max-w-[100px] truncate">{user.name}</span>
              <button
                onClick={onSignOut}
                className="text-[10px] text-[#abd9ff] hover:underline cursor-pointer ml-1.5 border-l border-zinc-700 pl-1.5 font-semibold"
              >
                Sign Out
              </button>
            </div>
          )}
          <a href="/contests" className="bg-yellow-600 px-4 py-1 rounded hover:bg-yellow-700">Contests</a>
        </div>
      </nav>

      <div className="px-6 py-4">
        <button onClick={() => navigate(`/contest-questions/${contestCode}`)} className="text-gray-400 hover:text-white">← Back to Questions</button>
      </div>

      <div className="px-6 py-2">
        <h1 className="text-3xl font-bold text-yellow-500">Contest {meta.contestNumber}</h1>
        <div className="flex text-gray-400 mt-1">
          <span>Question {meta.questionId}</span>
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
                    onClick={() => navigate("/solution-details", { state: { contestCode, questionId, username: user.username, submissionId: user.submissionId, language: user.language, time: user.time, rank: user.rank } })}
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
