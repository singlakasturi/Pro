import React, { useState } from "react";
import { Link } from "react-router-dom";

export default function DatabasePopulator({ user, onSignOut }) {
  const [startContest, setStartContest] = useState(420);
  const [endContest, setEndContest] = useState(420);
  const [status, setStatus] = useState({ type: null, message: "" });
  const [loading, setLoading] = useState(false);
  const [contestType, setContestType] = useState("weekly");

  const handleTypeChange = (type) => {
    setContestType(type);
    if (type === "weekly") {
      setStartContest(420);
      setEndContest(420);
    } else {
      setStartContest(140);
      setEndContest(140);
    }
  };

  // Hardcoded Admin Email check
  const isAdmin = user && user.email === "kasturisingla2@gmail.com";

  const handleTriggerScraper = async (e) => {
    e.preventDefault();
    if (!isAdmin) {
      setStatus({ type: "error", message: "Forbidden: You are not authorized as admin." });
      return;
    }
    if (startContest > endContest) {
      setStatus({ type: "error", message: "Start contest number cannot be greater than end contest number." });
      return;
    }

    setLoading(true);
    setStatus({ type: "info", message: "Triggering scraper job on the backend..." });

    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
      const res = await fetch(`${baseUrl}/api/v1/admin/scrape?start=${startContest}&end=${endContest}&type=${contestType}`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${user.token}`,
        },
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Failed to trigger scraper");
      }

      const msg = await res.text();
      setStatus({
        type: "success",
        message: `${msg}. The python scraper is now processing ${contestType} contests ${startContest} to ${endContest} in the background. Check backend console outputs for details!`,
      });
    } catch (err) {
      setStatus({ type: "error", message: err.message || "An unexpected error occurred." });
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6">
        <div className="relative bg-zinc-950 border border-red-900/50 rounded-2xl p-10 max-w-md w-full shadow-2xl text-center flex flex-col items-center">
          <div className="absolute -inset-0.5 bg-red-600 rounded-2xl opacity-10 blur-lg -z-10"></div>
          <div className="w-16 h-16 bg-red-900/20 text-red-500 rounded-full flex items-center justify-center mb-6 border border-red-500/30">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-red-500 mb-2">Access Denied</h2>
          <p className="text-zinc-400 mb-8 text-sm">
            Only authorized administrators can access the database populator dashboard.
          </p>
          <Link to="/" className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-white px-6 py-2.5 rounded-lg text-sm transition-colors w-full">
            Back to Safety
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <nav className="flex justify-between items-center px-8 py-4 border-b border-zinc-900 bg-zinc-950/40 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center space-x-3">
          <Link to="/" className="text-xl font-bold text-[#abd9ff] flex items-center gap-2">
            Resemblance
          </Link>
          <span className="text-zinc-700">|</span>
          <span className="text-xs text-zinc-400 bg-zinc-900 px-2.5 py-1 rounded-full uppercase tracking-wider font-semibold border border-zinc-800">Admin Control</span>
        </div>
        <div className="flex items-center space-x-6">
          <Link to="/contests" className="text-sm text-zinc-400 hover:text-white transition-colors">Contests</Link>
          {user && (
            <div className="flex items-center space-x-2 bg-white/5 rounded-full py-1 px-3 border border-zinc-850">
              <img
                src={user.picture}
                alt={user.name}
                className="w-5 h-5 rounded-full border border-zinc-700"
                onError={(e) => { e.target.src = "https://www.gravatar.com/avatar?d=mp"; }}
              />
              <span className="text-xs text-zinc-300 font-medium">{user.name}</span>
              <button
                onClick={onSignOut}
                className="text-[10px] text-[#abd9ff] hover:underline cursor-pointer ml-1.5 border-l border-zinc-800 pl-1.5 font-semibold"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-16 flex flex-col items-center">
        <div className="w-full text-center mb-12">
          <h1 className="text-4xl font-extrabold mb-3 bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
            Database Populator
          </h1>
          <p className="text-zinc-400 max-w-xl mx-auto text-sm">
            Trigger automated LeetCode weekly or biweekly contest scrapes to pull contest details, questions, submissions, and code. Results will automatically run similarity tests and populate the platform.
          </p>
        </div>

        <div className="relative w-full max-w-lg bg-zinc-950 border border-zinc-800/80 rounded-2xl p-8 shadow-2xl">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-[#abd9ff]/30 to-blue-600/30 rounded-2xl opacity-10 blur-xl -z-10"></div>
          
          <form onSubmit={handleTriggerScraper} className="space-y-6">
            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2.5">
                Contest Type
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleTypeChange("weekly")}
                  className={`py-3 px-4 rounded-xl border text-sm font-medium transition-all ${
                    contestType === "weekly"
                      ? "bg-zinc-900 border-[#abd9ff] text-[#abd9ff]"
                      : "bg-zinc-950 border-zinc-900 text-zinc-400 hover:border-zinc-800 hover:text-white"
                  }`}
                >
                  Weekly Contest
                </button>
                <button
                  type="button"
                  onClick={() => handleTypeChange("biweekly")}
                  className={`py-3 px-4 rounded-xl border text-sm font-medium transition-all ${
                    contestType === "biweekly"
                      ? "bg-zinc-900 border-[#abd9ff] text-[#abd9ff]"
                      : "bg-zinc-950 border-zinc-900 text-zinc-400 hover:border-zinc-800 hover:text-white"
                  }`}
                >
                  Biweekly Contest
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="startContest" className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                  From {contestType === "weekly" ? "Weekly" : "Biweekly"} Contest
                </label>
                <input
                  type="number"
                  id="startContest"
                  value={startContest}
                  onChange={(e) => setStartContest(parseInt(e.target.value) || 0)}
                  min="1"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#abd9ff] transition-colors"
                  required
                />
              </div>

              <div>
                <label htmlFor="endContest" className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                  To {contestType === "weekly" ? "Weekly" : "Biweekly"} Contest
                </label>
                <input
                  type="number"
                  id="endContest"
                  value={endContest}
                  onChange={(e) => setEndContest(parseInt(e.target.value) || 0)}
                  min="1"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#abd9ff] transition-colors"
                  required
                />
              </div>
            </div>

            {status.message && (
              <div className={`p-4 rounded-xl text-sm border flex gap-3 ${
                status.type === "success" 
                  ? "bg-emerald-950/20 text-emerald-400 border-emerald-500/20" 
                  : status.type === "error" 
                  ? "bg-rose-950/20 text-rose-400 border-rose-500/20" 
                  : "bg-zinc-900/50 text-zinc-300 border-zinc-800"
              }`}>
                <div className="mt-0.5 shrink-0">
                  {status.type === "success" ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                      <path d="m9 11 3 3L22 4" />
                    </svg>
                  ) : status.type === "error" ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" x2="12" y1="8" y2="12" />
                      <line x1="12" x2="12.01" y1="16" y2="16" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" x2="12" y1="12" y2="16" />
                      <line x1="12" x2="12.01" y1="8" y2="8" />
                    </svg>
                  )}
                </div>
                <p className="leading-relaxed">{status.message}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3.5 px-6 rounded-xl font-semibold text-black transition-all flex items-center justify-center gap-2 ${
                loading 
                  ? "bg-zinc-800 text-zinc-500 cursor-not-allowed" 
                  : "bg-[#abd9ff] hover:bg-[#8ec7f5] active:scale-[0.98] shadow-lg shadow-[#abd9ff]/10 hover:shadow-[#abd9ff]/25"
              }`}
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-zinc-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Initializing Scraper Process...
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                    <polyline points="3.29 7 12 12 20.71 7" />
                    <line x1="12" x2="12" y1="22" y2="12" />
                  </svg>
                  Run Scraper Job
                </>
              )}
            </button>
          </form>
        </div>

        <div className="w-full max-w-lg mt-8 bg-zinc-950/30 border border-zinc-900 rounded-xl p-5 text-xs text-zinc-500 leading-relaxed">
          <p className="font-semibold text-zinc-400 mb-1.5">Note on Scraper Execution:</p>
          Scraper processes are resource-intensive and will run asynchronously in a background thread on the server. You can check the server logs directly to monitor progress. Once completed, the new contest questions and results will immediately populate in the <Link to="/contests" className="text-[#abd9ff] hover:underline">Contests</Link> tab.
        </div>
      </div>
    </div>
  );
}
