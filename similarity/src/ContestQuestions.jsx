// src/ContestQuestions.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { parseCSV } from "./utils/parseCSV";

export default function ContestQuestions() {
  const { code } = useParams();
  const navigate = useNavigate();
  const [contestInfo, setContestInfo] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
        const res = await fetch(`${baseUrl}/contests/${code}/questions`);
        if (!res.ok) throw new Error("Failed to fetch questions");
        const json = await res.json();
        if (json.length === 0) {
          setContestInfo(null);
          setQuestions([]);
        } else {
          const totalPoints = json.reduce((s, q) => s + Number(q.point || 0), 0);
          setContestInfo({
            contestNumber: code.replace(/[^0-9]/g, ""),
            duration: "1h 30m",
            totalPoints,
            questionCount: json.length,
          });
          setQuestions(
            json.map((q) => ({
              questionNumber: Number(q.questionNumber),
              questionId: q.questionId,
              title: q.title,
              difficulty: q.difficulty || "MEDIUM",
              acceptance: (q.totalSubmissions > 0 ? ((q.totalAccepted / q.totalSubmissions) * 100).toFixed(1) : "0") + "%",
              points: Number(q.point || 0),
            }))
          );
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, [code]);

  if (loading) return <div className="text-white p-6">Loading...</div>;
  if (!contestInfo) return <div className="bg-black min-h-screen text-white flex items-center justify-center">Contest not found</div>;

  const difficultyColors = { EASY: "bg-green-700", MEDIUM: "bg-yellow-700", HARD: "bg-red-700" };

  return (
    <div className="bg-black min-h-screen text-white p-6">
      <div className="relative max-w-7xl mx-auto mb-2 flex items-center justify-center">
        <button
          onClick={() => navigate("/contests")}
          className="absolute left-0 flex items-center gap-2 text-zinc-400 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft size={20} />
          <span className="hidden sm:inline">Back to Contests</span>
        </button>
        <h1 className="text-4xl font-bold text-yellow-500 text-center">Contest {contestInfo.contestNumber}</h1>
      </div>
      <p className="text-gray-400 text-center mb-6">Select a question to view rankings</p>

      <div className="bg-gray-800 rounded-full max-w-md mx-auto mb-12 flex justify-around p-2 text-gray-300">
        <span>{contestInfo.duration} duration</span>
        <span>{contestInfo.totalPoints} points total</span>
        <span>{contestInfo.questionCount} questions</span>
      </div>

      {questions.map((q) => (
        <div key={q.questionId} className="bg-gray-900 rounded-lg p-6 mb-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-6">
              <div className="bg-yellow-800 text-yellow-400 px-3 py-2 rounded font-bold">Q{q.questionNumber}</div>
              <div>
                <h3 className="text-xl font-medium mb-3">{q.title}</h3>
                <div className="flex space-x-3">
                  <span className={`${difficultyColors[q.difficulty]} px-3 py-1 rounded-md`}>{q.difficulty}</span>
                  <span className="bg-purple-800 px-3 py-1 rounded-md">{q.acceptance} Acceptance</span>
                  <span className="bg-blue-800 px-3 py-1 rounded-md">{q.points} Points</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => navigate(`/leaderboard/${code}/${q.questionId}`)}
              className="text-yellow-500 hover:text-yellow-400"
            >
              View Rankings
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
