// src/Contests.jsx
import React, { useEffect, useState } from "react";
import Contest from "./components/Contest";
import { parseCSV } from "./utils/parseCSV";

const Contests = () => {
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchContests = async () => {
      try {
        const res = await fetch("/data/contests.csv");
        if (!res.ok) throw new Error("Failed to fetch contests CSV");
        const text = await res.text();
        const rows = parseCSV(text);
        // convert participants & id
        const data = rows.map((r) => ({
          id: Number(r.id),
          code: r.code,
          title: r.title,
          date: r.date,
          participants: Number(r.participants || 0),
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
      <h1 className="text-3xl font-bold text-white mb-8 text-center">LeetCode Contests</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 place-items-center">
        {contests.map((contest) => (
          <Contest key={contest.id} code={contest.code} title={contest.title} date={contest.date} participants={contest.participants} />
        ))}
      </div>
    </div>
  );
};

export default Contests;
