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
    <div className="min-h-screen bg-black px-6 py-10">
      <div className="relative max-w-7xl mx-auto mb-8 flex items-center justify-center">
        <Link
          to="/"
          className="absolute left-0 flex items-center gap-2 text-zinc-400 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft size={20} />
          <span className="hidden sm:inline">Back to Home</span>
        </Link>
        <h1 className="text-3xl font-bold text-white text-center">LeetCode Contests</h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 place-items-center">
        {contests.map((contest) => (
          <Contest key={contest.id} code={contest.code} title={contest.title} date={contest.date} participants={contest.participants} />
        ))}
      </div>
    </div>
  );
};

export default Contests;
