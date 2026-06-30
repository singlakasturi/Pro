// src/LeaderBoard.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link, useSearchParams } from "react-router-dom";
import { parseCSV } from "./utils/parseCSV";

export default function Leaderboard({ user, onSignOut }) {
  const { contestCode, questionId } = useParams();
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState({ contestNumber: contestCode, questionId });
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const pageParam = searchParams.get("page");
  const currentPage = pageParam ? parseInt(pageParam, 10) : 1;
  const itemsPerPage = 50;

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

  const totalPages = Math.ceil(rows.length / itemsPerPage);
  const indexOfLastRow = currentPage * itemsPerPage;
  const indexOfFirstRow = indexOfLastRow - itemsPerPage;
  const currentRows = rows.slice(indexOfFirstRow, indexOfLastRow);

  const changePage = (pageNum) => {
    setSearchParams({ page: pageNum });
  };

  const getPageNumbers = () => {
    const pageNumbers = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      pageNumbers.push(1);
      
      let start = Math.max(2, currentPage - 2);
      let end = Math.min(totalPages - 1, currentPage + 2);
      
      if (currentPage <= 4) {
        end = 5;
      }
      if (currentPage >= totalPages - 3) {
        start = totalPages - 4;
      }
      
      if (start > 2) {
        pageNumbers.push("ellipsis-start");
      }
      
      for (let i = start; i <= end; i++) {
        pageNumbers.push(i);
      }
      
      if (end < totalPages - 1) {
        pageNumbers.push("ellipsis-end");
      }
      
      pageNumbers.push(totalPages);
    }
    return pageNumbers;
  };

  if (loading) return <div className="text-white p-6">Loading leaderboard...</div>;
  if (!rows.length) return <div className="bg-black min-h-screen text-white flex items-center justify-center">No leaderboard data found</div>;

  return (
    <div className="bg-zinc-950 text-white min-h-screen relative overflow-hidden animate-fade-in">
      {/* Background glow */}
      <div className="absolute top-0 right-10 w-96 h-96 bg-[#abd9ff]/5 rounded-full blur-3xl pointer-events-none animate-pulse-glow"></div>

      <nav className="flex justify-between items-center px-8 py-4 border-b border-zinc-900 bg-zinc-950/50 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center">
          <Link to="/" className="text-xl font-bold text-[#abd9ff] tracking-tight">
            Resemblance
          </Link>
        </div>
        <div className="flex space-x-6 items-center">
          <Link to="/" className="text-sm text-zinc-400 hover:text-white transition-colors">Why Us</Link>
          <Link to="/" className="text-sm text-zinc-400 hover:text-white transition-colors">Mission</Link>
          <Link to="/" className="text-sm text-zinc-400 hover:text-white transition-colors">FAQ</Link>
          {user && user.email === "kasturisingla2@gmail.com" && (
            <Link
              to="/admin/populator"
              className="text-xs text-[#abd9ff] hover:text-[#8ec7f5] transition-colors cursor-pointer font-semibold bg-[#abd9ff]/10 py-1.5 px-3.5 rounded-full border border-[#abd9ff]/20 hover:border-[#abd9ff]/45"
            >
              Admin Panel
            </Link>
          )}
          {user && (
            <div className="flex items-center space-x-2 bg-white/5 rounded-full py-1 px-3 border border-zinc-850">
              <img
                src={user.picture}
                alt={user.name}
                className="w-5 h-5 rounded-full border border-zinc-700"
                onError={(e) => { e.target.src = "https://www.gravatar.com/avatar?d=mp"; }}
              />
              <span className="text-xs text-zinc-300 font-medium max-w-[100px] truncate">{user.name}</span>
              <button
                onClick={onSignOut}
                className="text-[10px] text-[#abd9ff] hover:underline cursor-pointer ml-1.5 border-l border-zinc-800 pl-1.5 font-semibold"
              >
                Sign Out
              </button>
            </div>
          )}
          <Link to="/contests" className="bg-[#abd9ff] hover:bg-[#8ec7f5] text-black px-4 py-1.5 rounded-xl transition-all font-semibold text-sm cursor-pointer shadow-sm">
            Contests
          </Link>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="mb-8 animate-fade-in">
          <button 
            onClick={() => navigate(`/contest-questions/${contestCode}`)} 
            className="flex items-center gap-1.5 text-zinc-400 hover:text-[#abd9ff] transition-colors cursor-pointer text-sm font-medium mb-6"
          >
            ← Back to Questions
          </button>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-extrabold text-white">
                Contest <span className="text-[#abd9ff]">{meta.contestNumber}</span>
              </h1>
              <div className="flex items-center gap-2 text-zinc-400 mt-2 text-sm font-medium">
                <span>Question {meta.questionId}</span>
                <span className="text-zinc-700">•</span>
                <span>{meta.participants || rows.length} Submissions</span>
              </div>
            </div>
          </div>
        </div>

        {/* Table Container */}
        <div className="bg-zinc-900/20 border border-zinc-900 rounded-2xl overflow-hidden shadow-xl mb-8 animate-scale-in">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-zinc-900 text-left bg-zinc-900/10">
                <th className="py-4 px-6 text-[#abd9ff] font-semibold text-xs tracking-wider uppercase">Rank</th>
                <th className="py-4 px-6 text-[#abd9ff] font-semibold text-xs tracking-wider uppercase">Username</th>
                <th className="py-4 px-6 text-[#abd9ff] font-semibold text-xs tracking-wider uppercase">Language</th>
                <th className="py-4 px-6 text-[#abd9ff] font-semibold text-xs tracking-wider uppercase">Submission Date</th>
                <th className="py-4 px-6 text-[#abd9ff] font-semibold text-xs tracking-wider uppercase text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900/50">
              {currentRows.map((row, index) => {
                const isTop3 = row.rank <= 3;
                const rankColor = row.rank === 1 ? "text-[#abd9ff]" : row.rank === 2 ? "text-[#8ec7f5]" : row.rank === 3 ? "text-zinc-300" : "text-zinc-400";
                
                return (
                  <tr
                    key={row.rank}
                    onClick={() => navigate("/solution-details", { state: { contestCode, questionId, username: row.username, submissionId: row.submissionId, language: row.language, time: row.time, rank: row.rank, page: currentPage } })}
                    className={`hover:bg-zinc-900/30 cursor-pointer transition-colors duration-250 group animate-fade-in stagger-${(index % 8) + 1}`}
                  >
                    <td className="py-4 px-6 font-bold">
                      <span className={rankColor}>
                        {isTop3 ? `#${row.rank}` : row.rank}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-zinc-200 font-medium group-hover:text-white group-hover:underline transition-all">
                        {row.username}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        row.language === "python3" 
                          ? "bg-blue-950/40 text-blue-300 border border-blue-500/20" 
                          : "bg-indigo-950/40 text-indigo-300 border border-indigo-500/20"
                      }`}>
                        {row.language}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-zinc-400 text-sm">{row.time}</td>
                    <td className="py-4 px-6 text-right">
                      <div className="inline-flex items-center justify-center">
                        <span className="w-5 h-5 rounded-full bg-emerald-950/40 text-emerald-400 border border-emerald-500/20 flex items-center justify-center text-xs font-bold">
                          ✓
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-4 pb-4 flex-wrap">
            <button
              onClick={() => changePage(Math.max(currentPage - 1, 1))}
              disabled={currentPage === 1}
              className="px-3.5 py-2 rounded-xl bg-zinc-900/50 hover:bg-zinc-900 border border-zinc-800 text-zinc-300 disabled:opacity-40 disabled:hover:bg-zinc-900/50 disabled:cursor-not-allowed transition-all duration-150 text-sm font-medium"
            >
              &laquo; Prev
            </button>
            {getPageNumbers().map((num, idx) => {
              if (num === "ellipsis-start" || num === "ellipsis-end") {
                return (
                  <span key={`ellipsis-${idx}`} className="px-2.5 text-zinc-600 font-medium">
                    ...
                  </span>
                );
              }
              return (
                <button
                  key={num}
                  onClick={() => changePage(num)}
                  className={`px-3.5 py-1.5 rounded-xl border transition-all duration-150 text-sm font-medium ${
                    currentPage === num
                      ? "bg-[#abd9ff] text-black border-[#abd9ff] font-bold shadow-md shadow-blue-500/5"
                      : "bg-zinc-950 hover:bg-zinc-900 text-zinc-400 border-zinc-850"
                  }`}
                >
                  {num}
                </button>
              );
            })}
            <button
              onClick={() => changePage(Math.min(currentPage + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3.5 py-2 rounded-xl bg-zinc-900/50 hover:bg-zinc-900 border border-zinc-800 text-zinc-300 disabled:opacity-40 disabled:hover:bg-zinc-900/50 disabled:cursor-not-allowed transition-all duration-150 text-sm font-medium"
            >
              Next &raquo;
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
