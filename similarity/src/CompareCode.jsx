// src/CompareCode.jsx
import React, { useEffect, useState, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";

// Trivial lines check to avoid highlighting braces or imports
const isTrivial = (line) => {
  const t = line.trim();
  if (t.length <= 1) return true;
  if (t === "{" || t === "}" || t === "};" || t === "];") return true;
  return false;
};

// LCS implementation to find matching lines fuzzy-style
const getMatches = (codeA, codeB) => {
  const matchesA = new Set();
  const matchesB = new Set();
  if (!codeA || !codeB) return { matchesA, matchesB };

  const linesA = codeA.split("\n");
  const linesB = codeB.split("\n");

  const clean = (l) => {
    return l
      .replace(/\/\/.*$/g, "")
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .replace(/\s+/g, "")
      .trim();
  };

  const cleanA = linesA.map(clean);
  const cleanB = linesB.map(clean);

  // For each non-trivial line in A, find the best matching non-trivial line in B
  for (let i = 0; i < linesA.length; i++) {
    if (isTrivial(linesA[i]) || cleanA[i].length === 0) continue;

    let bestJ = -1;
    let bestSim = 0;

    for (let j = 0; j < linesB.length; j++) {
      if (isTrivial(linesB[j]) || cleanB[j].length === 0) continue;

      const cA = cleanA[i];
      const cB = cleanB[j];

      if (cA === cB) {
        bestJ = j;
        bestSim = 1.0;
        break;
      }

      const m = cA.length;
      const n = cB.length;

      // Early exit if the length difference is too large to achieve > 0.6 similarity
      const maxPossibleSim = (2 * Math.min(m, n)) / (m + n);
      if (maxPossibleSim < 0.6) continue;

      // Character LCS
      const dp = Array(n + 1).fill(0);
      let prev = Array(n + 1).fill(0);
      for (let r = 1; r <= m; r++) {
        for (let c = 1; c <= n; c++) {
          if (cA[r - 1] === cB[c - 1]) {
            dp[c] = prev[c - 1] + 1;
          } else {
            dp[c] = Math.max(prev[c], dp[c - 1]);
          }
        }
        prev = [...dp];
      }
      const lcsLen = dp[n];
      const sim = (2 * lcsLen) / (m + n);

      if (sim > bestSim) {
        bestSim = sim;
        bestJ = j;
      }
    }

    if (bestSim >= 0.6) {
      matchesA.add(i);
      matchesB.add(bestJ);
    }
  }

  return { matchesA, matchesB };
};

export default function CompareCode() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const { 
    similarList = [], 
    currentIndex: initialIndex = 0, 
    mainUsername = "User", 
    mainCodePath = "", 
    solutionInfo = {} 
  } = location.state || {};

  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [mainCode, setMainCode] = useState("");
  const [similarCode, setSimilarCode] = useState("");
  const [loading, setLoading] = useState(true);

  // Fetch main code once
  useEffect(() => {
    let active = true;
    const fetchMainCode = async () => {
      try {
        if (!mainCodePath) return;
        const res = await fetch(mainCodePath);
        const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
        if (mainCodePath.startsWith("http") || mainCodePath.startsWith(baseUrl)) {
          const json = await res.json();
          if (active) setMainCode(json.submittedCode || "");
        } else {
          const text = await res.text();
          if (active) setMainCode(text);
        }
      } catch (err) {
        console.error("Error fetching main code:", err);
        if (active) setMainCode("// Failed to load main code");
      }
    };
    fetchMainCode();
    return () => { active = false; };
  }, [mainCodePath]);

  // Fetch similar code whenever currentIndex changes
  useEffect(() => {
    let active = true;
    const fetchSimilarCode = async () => {
      setLoading(true);
      try {
        const currentSim = similarList[currentIndex];
        if (!currentSim || !currentSim.codePath) {
          if (active) setSimilarCode("// No code path found for similar solution");
          setLoading(false);
          return;
        }
        const res = await fetch(currentSim.codePath);
        const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
        if (currentSim.codePath.startsWith("http") || currentSim.codePath.startsWith(baseUrl)) {
          const json = await res.json();
          if (active) setSimilarCode(json.submittedCode || "");
        } else {
          const text = await res.text();
          if (active) setSimilarCode(text);
        }
      } catch (err) {
        console.error("Error fetching similar code:", err);
        if (active) setSimilarCode("// Failed to load similar code");
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchSimilarCode();
    return () => { active = false; };
  }, [currentIndex, similarList]);

  const { matchesA, matchesB } = useMemo(() => {
    return getMatches(mainCode, similarCode);
  }, [mainCode, similarCode]);

  if (!similarList || similarList.length === 0) {
    return (
      <div className="bg-black min-h-screen text-white flex flex-col items-center justify-center">
        <p className="text-xl mb-4">No similar solutions found for comparison.</p>
        <button onClick={() => navigate(-1)} className="bg-yellow-600 px-4 py-2 rounded text-white hover:bg-yellow-700 cursor-pointer">Go Back</button>
      </div>
    );
  }

  const currentSim = similarList[currentIndex];

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < similarList.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const renderLines = (codeText, matchesSet) => {
    if (!codeText) return <div className="text-gray-500 italic p-2">// Empty code</div>;
    const lines = codeText.split("\n");
    return lines.map((line, idx) => {
      const isMatched = matchesSet.has(idx);
      return (
        <div 
          key={idx} 
          className={`flex min-w-full ${isMatched ? 'bg-yellow-500/15 border-l-4 border-yellow-500' : 'border-l-4 border-transparent'} hover:bg-zinc-800/60 py-0.5 transition-colors`}
        >
          <span className="w-12 select-none text-right pr-4 text-zinc-600 font-mono text-xs pt-0.5">{idx + 1}</span>
          <pre className="flex-1 whitespace-pre font-mono text-sm m-0">
            <code>{line || " "}</code>
          </pre>
        </div>
      );
    });
  };

  return (
    <div className="min-h-screen bg-black text-white p-6 relative flex flex-col animate-fadeIn">
      {/* Floating navigation buttons */}
      <button
        onClick={handlePrev}
        disabled={currentIndex === 0}
        className="fixed left-4 top-1/2 -translate-y-1/2 z-45 bg-zinc-900/90 hover:bg-yellow-500 hover:text-black border border-zinc-700 hover:border-yellow-500 text-white p-4 rounded-full shadow-2xl transition-all disabled:opacity-20 disabled:pointer-events-none cursor-pointer"
        title="Previous Plagiarism Comparison"
      >
        <ChevronLeft size={24} />
      </button>

      <button
        onClick={handleNext}
        disabled={currentIndex === similarList.length - 1}
        className="fixed right-4 top-1/2 -translate-y-1/2 z-45 bg-zinc-900/90 hover:bg-yellow-500 hover:text-black border border-zinc-700 hover:border-yellow-500 text-white p-4 rounded-full shadow-2xl transition-all disabled:opacity-20 disabled:pointer-events-none cursor-pointer"
        title="Next Plagiarism Comparison"
      >
        <ChevronRight size={24} />
      </button>

      <div className="max-w-7xl mx-auto w-full flex-1 flex flex-col">
        {/* Header */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-zinc-800 pb-4 gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/solution-details", { state: solutionInfo })}
              className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              <ArrowLeft size={18} />
              <span>Back to Details</span>
            </button>
            <div className="h-6 w-px bg-zinc-800 hidden sm:block"></div>
            <div>
              <h1 className="text-2xl font-bold text-yellow-500">Compare Code</h1>
              <p className="text-xs text-zinc-400">
                {solutionInfo.contestId} • Question {solutionInfo.questionNumber}
              </p>
            </div>
          </div>
          
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2 flex items-center justify-between gap-6">
            <div className="text-sm">
              Comparison <span className="font-semibold text-yellow-500">{currentIndex + 1}</span> of <span className="font-semibold">{similarList.length}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-zinc-400 text-sm">Similarity:</span>
              <span className="bg-yellow-700 text-white text-xs px-2 py-1 rounded font-bold">{currentSim?.similarity}</span>
            </div>
          </div>
        </div>

        {/* Dual Screen Code Viewer */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1">
          {/* Main User Code */}
          <div className="flex flex-col">
            <div className="bg-zinc-900 border-t border-x border-zinc-800 rounded-t-lg px-4 py-3 flex items-center justify-between">
              <span className="font-semibold text-yellow-500">{mainUsername} <span className="text-zinc-500 text-xs">(Main User)</span></span>
              <span className="bg-zinc-800 text-zinc-400 text-xs px-2 py-0.5 rounded uppercase">{solutionInfo.language}</span>
            </div>
            <div className="flex-1 min-h-[500px] max-h-[70vh] overflow-auto bg-zinc-950 border border-zinc-800 rounded-b-lg p-4 font-mono text-sm no-scrollbar">
              {renderLines(mainCode, matchesA)}
            </div>
          </div>

          {/* Similar User Code */}
          <div className="flex flex-col">
            <div className="bg-zinc-900 border-t border-x border-zinc-800 rounded-t-lg px-4 py-3 flex items-center justify-between">
              <span className="font-semibold text-yellow-500">{currentSim?.username} <span className="text-zinc-500 text-xs">(Similar User)</span></span>
              <span className="bg-zinc-800 text-zinc-400 text-xs px-2 py-0.5 rounded uppercase">{currentSim?.language}</span>
            </div>
            <div className="flex-1 min-h-[500px] max-h-[70vh] overflow-auto bg-zinc-950 border border-zinc-800 rounded-b-lg p-4 font-mono text-sm no-scrollbar relative">
              {loading ? (
                <div className="absolute inset-0 bg-zinc-950/80 flex items-center justify-center text-zinc-400 text-sm">
                  Loading code comparison...
                </div>
              ) : (
                renderLines(similarCode, matchesB)
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
