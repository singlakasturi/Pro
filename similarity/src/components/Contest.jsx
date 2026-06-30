// src/components/Contest.jsx
import React from "react";
import { CalendarDays, Users, ArrowUpRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Contest = ({ code, title, date, participants }) => {
  const navigate = useNavigate();

  return (
    <div 
      onClick={() => navigate(`/contest-questions/${code}`)}
      className="bg-zinc-900/30 hover:bg-zinc-900/50 backdrop-blur-sm text-white rounded-2xl p-6 w-full max-w-md shadow-lg hover:shadow-xl hover:shadow-[#abd9ff]/5 border border-zinc-800/80 hover:border-[#abd9ff]/30 hover:-translate-y-1 transition-all duration-300 cursor-pointer group flex flex-col justify-between h-full"
    >
      <div>
        <div className="flex justify-between items-center mb-5">
          <span className="bg-[#abd9ff]/10 text-[#abd9ff] border border-[#abd9ff]/20 text-xs font-semibold px-3 py-1 rounded-lg tracking-wider">
            {code}
          </span>
          <ArrowUpRight size={18} className="text-zinc-500 group-hover:text-[#abd9ff] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-300" />
        </div>

        <h2 className="text-xl font-bold mb-3 text-zinc-100 group-hover:text-white transition-colors">
          {title}
        </h2>

        <div className="flex items-center text-zinc-400 text-xs space-x-4 mb-6">
          <div className="flex items-center space-x-1.5">
            <CalendarDays size={14} className="text-[#abd9ff]/70" />
            <span>{date}</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <Users size={14} className="text-[#abd9ff]/70" />
            <span>{participants.toLocaleString()} participants</span>
          </div>
        </div>
      </div>

      <button 
        onClick={(e) => {
          e.stopPropagation();
          navigate(`/contest-questions/${code}`);
        }}
        className="w-full border border-[#abd9ff]/25 text-[#abd9ff] font-medium py-2.5 px-4 rounded-xl text-sm transition-all duration-300 hover:bg-[#abd9ff] hover:text-black hover:border-[#abd9ff] cursor-pointer shadow-sm text-center"
      >
        View Questions
      </button>
    </div>
  );
};

export default Contest;
