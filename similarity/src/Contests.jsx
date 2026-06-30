// src/Contests.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Contest from "./components/Contest";
import { parseCSV } from "./utils/parseCSV";

const Contests = () => {
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchContests = async () => {
      try {
        const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
        const res = await fetch(`${baseUrl}/contests`);
        if (!res.ok) throw new Error("Failed to fetch contests");
        const json = await res.json();
        const data = json.map((c) => ({
          id: c.contestId,
          code: c.contestId,
          title: c.title,
          date: c.startDate ? new Date(c.startDate).toLocaleDateString() : "",
          participants: Number(c.participantCount || 0),
        }));
        setContests(data);
        setLoading(false);
      } catch (err) {
        setError(err.message || "Failed to load contests");
        setLoading(false);
      }
    };
    fetchContests();
  }, []);

  if (loading) return <div className="text-white p-6">Loading contests...</div>;
  if (error) return <div className="text-red-500 p-6">{error}</div>;

  return (
    <div className="min-h-screen bg-zinc-950 px-6 py-12 relative overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#abd9ff]/5 rounded-full blur-3xl pointer-events-none animate-pulse-glow"></div>

      <div className="relative max-w-6xl mx-auto mb-12 flex flex-col items-center animate-fade-in">
        <div className="w-full flex items-center justify-between mb-8">
          <Link
            to="/"
            className="flex items-center gap-2 text-zinc-400 hover:text-[#abd9ff] transition-all cursor-pointer text-sm font-medium"
          >
            <ArrowLeft size={16} />
            <span>Back to Home</span>
          </Link>
        </div>

        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-white tracking-tight mb-3">
            LeetCode <span className="text-[#abd9ff]">Contests</span>
          </h1>
          <p className="text-zinc-400 max-w-md mx-auto text-sm">
            Select a contest to view flagged questions, analyze similarities, and ensure academic honesty.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 place-items-stretch">
        {contests.map((contest, index) => (
          <div 
            key={contest.id} 
            className={`animate-fade-in-up stagger-${(index % 8) + 1}`}
          >
            <Contest 
              code={contest.code} 
              title={contest.title} 
              date={contest.date} 
              participants={contest.participants} 
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Contests;
