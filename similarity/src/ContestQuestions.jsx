// src/ContestQuestions.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, Clock, Award, BookOpen } from "lucide-react";

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

  if (loading) return <div className="text-[#abd9ff] p-6 bg-zinc-950 min-h-screen flex items-center justify-center">Loading questions...</div>;
  if (!contestInfo) return <div className="bg-zinc-950 min-h-screen text-white flex items-center justify-center">Contest not found</div>;

  const difficultyStyles = { 
    EASY: "bg-emerald-950/40 text-emerald-400 border border-emerald-500/20 text-xs px-2.5 py-0.5 rounded-full font-medium", 
    MEDIUM: "bg-amber-950/40 text-amber-400 border border-amber-500/20 text-xs px-2.5 py-0.5 rounded-full font-medium", 
    HARD: "bg-rose-950/40 text-rose-400 border border-rose-500/20 text-xs px-2.5 py-0.5 rounded-full font-medium" 
  };

  return (
    <div className="bg-zinc-950 min-h-screen text-white px-6 py-12 relative overflow-hidden">
      {/* Glow Effects */}
      <div className="absolute top-0 right-1/4 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl pointer-events-none animate-pulse-glow"></div>

      <div className="max-w-6xl mx-auto mb-10">
        <Link
          to="/contests"
          className="inline-flex items-center gap-2 text-zinc-400 hover:text-[#abd9ff] transition-all cursor-pointer text-sm font-medium mb-8 animate-fade-in"
        >
          <ArrowLeft size={16} />
          <span>Back to Contests</span>
        </Link>

        <div className="text-center mb-10 animate-fade-in">
          <h1 className="text-4xl font-extrabold text-white tracking-tight mb-2">
            Contest <span className="text-[#abd9ff]">{contestInfo.contestNumber}</span>
          </h1>
          <p className="text-zinc-400 text-sm">Select a question below to analyze student rankings and similarity indices</p>
        </div>

        {/* Contest Info Bar */}
        <div className="bg-zinc-900/35 border border-zinc-800/80 rounded-2xl max-w-lg mx-auto mb-12 flex justify-around p-3.5 text-zinc-300 text-xs font-semibold backdrop-blur-md shadow-sm animate-scale-in">
          <div className="flex items-center gap-1.5">
            <Clock size={14} className="text-[#abd9ff]/70" />
            <span>{contestInfo.duration}</span>
          </div>
          <div className="h-4 w-px bg-zinc-800"></div>
          <div className="flex items-center gap-1.5">
            <Award size={14} className="text-[#abd9ff]/70" />
            <span>{contestInfo.totalPoints} points total</span>
          </div>
          <div className="h-4 w-px bg-zinc-800"></div>
          <div className="flex items-center gap-1.5">
            <BookOpen size={14} className="text-[#abd9ff]/70" />
            <span>{contestInfo.questionCount} questions</span>
          </div>
        </div>

        {/* Questions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {questions.map((q, index) => (
            <div
              key={q.questionId}
              className={`animate-fade-in-up stagger-${(index % 8) + 1}`}
            >
              <div
                onClick={() => navigate(`/leaderboard/${code}/${q.questionId}`)}
                className="bg-zinc-900/20 hover:bg-zinc-900/50 border border-zinc-800/80 hover:border-[#abd9ff]/30 hover:-translate-y-1 hover:shadow-xl hover:shadow-[#abd9ff]/5 transition-all duration-300 rounded-2xl p-6 cursor-pointer group shadow-lg flex flex-col justify-between h-full"
              >
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <span className="bg-[#abd9ff]/10 text-[#abd9ff] border border-[#abd9ff]/25 px-3 py-1 rounded-lg font-bold text-xs tracking-wider">
                      Q{q.questionNumber}
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-bold text-zinc-100 group-hover:text-white transition-colors mb-5 leading-snug">
                    {q.title}
                  </h3>
                </div>

                <div>
                  <div className="flex flex-wrap gap-2 mb-6">
                    <span className={difficultyStyles[q.difficulty]}>{q.difficulty}</span>
                    <span className="bg-purple-950/45 text-purple-300 border border-purple-500/20 text-xs px-2.5 py-0.5 rounded-full font-medium">
                      {q.acceptance} Acceptance
                    </span>
                    <span className="bg-blue-950/45 text-blue-300 border border-blue-500/20 text-xs px-2.5 py-0.5 rounded-full font-medium">
                      {q.points} Points
                    </span>
                  </div>

                  <div className="h-px bg-zinc-800/80 w-full mb-4"></div>

                  <div className="flex items-center justify-between">
                    <span className="text-zinc-500 group-hover:text-zinc-400 text-xs transition-colors">
                      Click to inspect rankings
                    </span>
                    <span className="text-[#abd9ff] group-hover:text-white font-semibold transition-colors duration-200 flex items-center gap-1 text-sm">
                      View Rankings
                      <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform duration-200" />
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
