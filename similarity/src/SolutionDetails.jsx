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

  const getSimilarityStyle = (similarity) => {
    const value = parseFloat(similarity);
    if (value >= 90) return "bg-rose-950/40 text-rose-400 border border-rose-500/20 text-xs px-2.5 py-0.5 rounded-full font-medium";
    if (value >= 75) return "bg-amber-950/40 text-amber-400 border border-amber-500/20 text-xs px-2.5 py-0.5 rounded-full font-medium";
    return "bg-emerald-950/40 text-emerald-400 border border-emerald-500/20 text-xs px-2.5 py-0.5 rounded-full font-medium";
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white px-6 py-12 relative overflow-hidden animate-fade-in">
      {/* Background Glow */}
      <div className="absolute top-0 right-10 w-96 h-96 bg-[#abd9ff]/5 rounded-full blur-3xl pointer-events-none animate-pulse-glow"></div>

      <div className="max-w-6xl mx-auto">
        <div className="mb-10 animate-fade-in">
          <div className="relative flex items-center justify-between mb-6">
            <button
              onClick={() => navigate(`/leaderboard/${solutionInfo.contestId}/${solutionInfo.questionNumber}${params.page ? `?page=${params.page}` : ""}`)}
              className="flex items-center gap-1.5 text-zinc-400 hover:text-[#abd9ff] transition-colors cursor-pointer text-sm font-medium"
            >
              <ArrowLeft size={16} />
              <span>Back to Rankings</span>
            </button>
          </div>
          <div className="text-center">
            <h1 className="text-4xl font-extrabold text-white tracking-tight mb-2">Solution <span className="text-[#abd9ff]">Details</span></h1>
            <div className="flex items-center justify-center space-x-2 text-zinc-400 text-sm font-medium">
              <span>{solutionInfo.contestId}</span>
              <span className="text-zinc-700">•</span>
              <span>Question {solutionInfo.questionNumber}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="animate-scale-in">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-12 h-12 rounded-full bg-zinc-800 text-zinc-300 flex items-center justify-center text-lg font-bold border border-zinc-700 shadow-md">
                {solutionInfo.avatar || solutionInfo.username?.[0]?.toUpperCase()}
              </div>
              <h2 className="text-xl font-bold text-zinc-100">{solutionInfo.username}</h2>
            </div>

            <div className="bg-zinc-900/20 border border-zinc-900 rounded-2xl p-6 shadow-xl">
              <h3 className="text-sm font-bold text-[#abd9ff] uppercase tracking-wider mb-5">Performance Stats</h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-zinc-900/40 border border-zinc-800/80 p-4 rounded-xl">
                  <p className="text-zinc-500 text-xs font-semibold uppercase tracking-wider mb-1">Rank</p>
                  <p className="text-xl font-extrabold text-white">#{solutionInfo.rank}</p>
                </div>

                <div className="bg-zinc-900/40 border border-zinc-800/80 p-4 rounded-xl">
                  <p className="text-zinc-500 text-xs font-semibold uppercase tracking-wider mb-1.5">Language</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                    solutionInfo.language === "python3" 
                      ? "bg-blue-950/40 text-blue-300 border border-blue-500/20" 
                      : "bg-indigo-950/40 text-indigo-300 border border-indigo-500/20"
                  }`}>
                    {solutionInfo.language}
                  </span>
                </div>

                <div className="bg-zinc-900/40 border border-zinc-800/80 p-4 rounded-xl">
                  <p className="text-zinc-500 text-xs font-semibold uppercase tracking-wider mb-1">Submission Date</p>
                  <p className="text-sm font-medium text-zinc-300">{solutionInfo.time}</p>
                </div>

                <div className="bg-zinc-900/40 border border-zinc-800/80 p-4 rounded-xl">
                  <p className="text-zinc-500 text-xs font-semibold uppercase tracking-wider mb-1">Similar Submissions</p>
                  <p className="text-xl font-extrabold text-white">{solutionInfo.similarSolutionsCount}</p>
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
                className="bg-[#abd9ff] hover:bg-[#8ec7f5] text-black font-semibold px-6 py-2.5 rounded-xl transition-all shadow-md shadow-blue-500/5 cursor-pointer text-sm"
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
                className={`px-6 py-2.5 rounded-xl flex items-center justify-center font-semibold text-sm transition-all border ${
                  similar.length === 0 
                    ? "bg-zinc-900/20 text-zinc-650 cursor-not-allowed border-zinc-900" 
                    : "border-[#abd9ff]/30 text-[#abd9ff] hover:bg-[#abd9ff]/10 hover:border-[#abd9ff]/60 cursor-pointer"
                }`}
              >
                Compare Code
              </button>
            </div>
          </div>

          <div className="animate-scale-in">
            <h3 className="text-lg font-bold text-[#abd9ff] uppercase tracking-wider mb-2">Similar Solutions</h3>
            <p className="text-zinc-400 text-sm mb-6">Users who submitted highly similar code structures to this problem</p>

            <div className="bg-zinc-900/20 border border-zinc-900 rounded-2xl overflow-hidden shadow-xl">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-zinc-900 text-left bg-zinc-900/10">
                    <th className="py-4 px-4 text-[#abd9ff] font-semibold text-xs tracking-wider uppercase">Rank</th>
                    <th className="py-4 px-4 text-[#abd9ff] font-semibold text-xs tracking-wider uppercase">Username</th>
                    <th className="py-4 px-4 text-[#abd9ff] font-semibold text-xs tracking-wider uppercase">Language</th>
                    <th className="py-4 px-4 text-[#abd9ff] font-semibold text-xs tracking-wider uppercase">Similarity</th>
                    <th className="py-4 px-4 text-[#abd9ff] font-semibold text-xs tracking-wider uppercase text-right">Code</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900/50">
                  {similar.length === 0 && (
                    <tr>
                      <td className="p-6 text-zinc-500 text-sm italic text-center" colSpan="5">
                        No highly similar solutions found for this submission.
                      </td>
                    </tr>
                  )}
                  {similar.map((s, index) => (
                    <tr key={index} className={`hover:bg-zinc-900/30 transition-colors animate-fade-in stagger-${(index % 8) + 1}`}>
                      <td className="py-4 px-4 text-zinc-300 text-sm font-medium">{s.rank}</td>
                      <td className="py-4 px-4 text-zinc-200 text-sm font-semibold">{s.username}</td>
                      <td className="py-4 px-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          s.language === "python3" 
                            ? "bg-blue-950/40 text-blue-300 border border-blue-500/20" 
                            : "bg-indigo-950/40 text-indigo-300 border border-indigo-500/20"
                        }`}>
                          {s.language}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className={getSimilarityStyle(s.similarity)}>{s.similarity}</span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <button
                          onClick={() => navigate("/code-view", { state: { codePath: s.codePath } })}
                          className="text-[#abd9ff] hover:text-white transition-colors cursor-pointer font-bold text-xs"
                        >
                          View Code
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
