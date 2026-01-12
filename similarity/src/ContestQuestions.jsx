// src/ContestQuestions.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
        const res = await fetch("/data/questions.csv");
        const text = await res.text();
        const rows = parseCSV(text);
        const filtered = rows.filter((r) => r.contestCode === code);
        if (filtered.length === 0) {
          setContestInfo(null);
          setQuestions([]);
        } else {
          // derive contest-level stats from questions
          const totalPoints = filtered.reduce((s, q) => s + Number(q.points || 0), 0);
          setContestInfo({
            contestNumber: filtered[0].contestCode.replace(/[^0-9]/g, ""),
            duration: "1h 30m",
            totalPoints,
            questionCount: filtered.length,
          });
          setQuestions(
            filtered.map((q) => ({
              questionNumber: Number(q.questionNumber),
              title: q.title,
              difficulty: q.difficulty,
              acceptance: q.acceptance + "%",
              points: Number(q.points),
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
      <h1 className="text-4xl font-bold text-yellow-500 text-center mb-2">Contest {contestInfo.contestNumber}</h1>
      <p className="text-gray-400 text-center mb-6">Select a question to view rankings</p>

      <div className="bg-gray-800 rounded-full max-w-md mx-auto mb-12 flex justify-around p-2 text-gray-300">
        <span>{contestInfo.duration} duration</span>
        <span>{contestInfo.totalPoints} points total</span>
        <span>{contestInfo.questionCount} questions</span>
      </div>

      {questions.map((q) => (
        <div key={q.questionNumber} className="bg-gray-900 rounded-lg p-6 mb-4">
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
              onClick={() => navigate(`/leaderboard/${code}/${q.questionNumber}`)}
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
