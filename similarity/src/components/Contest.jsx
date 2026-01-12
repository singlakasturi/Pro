// src/components/Contest.jsx
import React from "react";
import { CalendarDays, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Contest = ({ code, title, date, participants }) => {
  const navigate = useNavigate();

  return (
    <div className="bg-[#1c1c1e] text-white rounded-xl p-6 w-full max-w-md shadow-lg border border-[#2c2c2e]">
      <div className="mb-4">
        <span className="bg-[#5c3b1e] text-[#f5b259] text-sm font-semibold px-3 py-1 rounded">{code}</span>
      </div>

      <h2 className="text-2xl font-bold mb-2">{title}</h2>

      <div className="flex items-center text-gray-400 text-sm space-x-4 mb-6">
        <div className="flex items-center space-x-1">
          <CalendarDays size={16} />
          <span>{date}</span>
        </div>
        <div className="flex items-center space-x-1">
          <Users size={16} />
          <span>{participants.toLocaleString()} participants</span>
        </div>
      </div>

      <button onClick={() => navigate(`/contest-questions/${code}`)} className="bg-[#4d3823] hover:bg-[#6c4e30] transition text-white font-medium py-2 px-4 rounded">
        View Contest Details
      </button>
    </div>
  );
};

export default Contest;
