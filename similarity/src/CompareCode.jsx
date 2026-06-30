// src/CompareCode.jsx
import React, { useEffect, useState, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";

// Trivial lines check to avoid highlighting braces, imports, or boilerplate
const isTrivial = (line) => {
  const t = line.trim();
  if (t.length <= 1) return true;
  if (t === "{" || t === "}" || t === "};" || t === "];" || t === "};") return true;
  // Skip include/import/using/package statements
  if (/^(#include|import |from |using |package |#define |#pragma )/.test(t)) return true;
  // Skip common boilerplate
  if (/^(public\s+class |int\s+main|if\s+__name__|def\s+main|return\s+0;?$)/.test(t)) return true;
  return false;
};

// Normalize a code line to a language-agnostic representation for cross-language matching
const normalizeLine = (line) => {
  let s = line;

  // Strip all comment styles: //, /* */, #
  s = s.replace(/\/\/.*$/g, "");
  s = s.replace(/\/\*[\s\S]*?\*\//g, "");
  s = s.replace(/#.*$/g, "");

  // Remove trailing semicolons
  s = s.replace(/;+\s*$/g, "");

  // Remove type declarations (int, long, long long, double, float, string, bool, char, auto, var, let, const, vector<...>, etc.)
  s = s.replace(/\b(int|long\s+long|long|double|float|string|bool|boolean|char|auto|var|let|const|void|unsigned|signed|size_t|uint64_t|int64_t|int32_t)\b/g, "");
  s = s.replace(/\bvector\s*<[^>]*>/g, "");
  s = s.replace(/\barray\s*<[^>]*>/g, "");
  s = s.replace(/\bmap\s*<[^>]*>/g, "");
  s = s.replace(/\bset\s*<[^>]*>/g, "");
  s = s.replace(/\bpair\s*<[^>]*>/g, "");
  s = s.replace(/\bList\s*<[^>]*>/g, "");
  s = s.replace(/\bMap\s*<[^>]*>/g, "");
  s = s.replace(/\bSet\s*<[^>]*>/g, "");

  // Normalize print/output statements
  s = s.replace(/\bcout\s*<<\s*/g, "print(");
  s = s.replace(/\bSystem\.out\.println?\s*\(/g, "print(");
  s = s.replace(/\bprintf\s*\(/g, "print(");
  s = s.replace(/\bconsole\.log\s*\(/g, "print(");

  // Normalize input statements
  s = s.replace(/\bcin\s*>>\s*/g, "input(");
  s = s.replace(/\bscanner\.\w+\s*\(\s*\)/g, "input()");

  // Remove language-specific keywords that don't affect logic
  s = s.replace(/\b(endl|std::|self\.|this\.|this->|new |public |private |protected |static |final |virtual |override |inline )/g, "");
  s = s.replace(/\b(def |fn |func |function )/g, "");

  // Normalize for-loop syntax: Python range() vs C-style
  s = s.replace(/for\s*\(\s*\w*\s*=\s*(\w+)\s*;\s*\w+\s*[<>]=?\s*(\w+)\s*;\s*\w+\+\+\s*\)/g, "for($1,$2)");
  s = s.replace(/for\s+\w+\s+in\s+range\s*\(\s*(\w+)\s*,?\s*(\w*)\s*\)/g, "for($1,$2)");

  // Remove braces
  s = s.replace(/[{}]/g, "");

  // Normalize Python-style 'and'/'or'/'not' to symbolic
  s = s.replace(/\band\b/g, "&&");
  s = s.replace(/\bor\b/g, "||");
  s = s.replace(/\bnot\b/g, "!");

  // Normalize array access: Python list[i] and C++ arr[i] are already the same, but normalize .at(i)
  s = s.replace(/\.at\s*\(/g, "[");

  // Normalize len/size/length
  s = s.replace(/\blen\s*\(/g, "size(");
  s = s.replace(/\.size\s*\(\s*\)/g, ".size()");
  s = s.replace(/\.length\b/g, ".size()");

  // Normalize append/push_back/add
  s = s.replace(/\.push_back\s*\(/g, ".add(");
  s = s.replace(/\.append\s*\(/g, ".add(");
  s = s.replace(/\.emplace_back\s*\(/g, ".add(");

  // Remove colons at end (Python block syntax)
  s = s.replace(/:\s*$/g, "");

  // Collapse all whitespace
  s = s.replace(/\s+/g, "");

  return s;
};

// LCS implementation to find matching lines across any language
const getMatches = (codeA, codeB) => {
  const matchesA = new Set();
  const matchesB = new Set();
  if (!codeA || !codeB) return { matchesA, matchesB };

  const linesA = codeA.split("\n");
  const linesB = codeB.split("\n");

  const cleanA = linesA.map(normalizeLine);
  const cleanB = linesB.map(normalizeLine);

  // Track which B lines are already matched to avoid double-counting
  const usedB = new Set();

  // For each non-trivial line in A, find the best matching non-trivial line in B
  for (let i = 0; i < linesA.length; i++) {
    if (isTrivial(linesA[i]) || cleanA[i].length === 0) continue;

    let bestJ = -1;
    let bestSim = 0;

    for (let j = 0; j < linesB.length; j++) {
      if (usedB.has(j)) continue;
      if (isTrivial(linesB[j]) || cleanB[j].length === 0) continue;

      const cA = cleanA[i];
      const cB = cleanB[j];

      // Exact match on normalized form
      if (cA === cB) {
        bestJ = j;
        bestSim = 1.0;
        break;
      }

      const m = cA.length;
      const n = cB.length;

      // Early exit if the length difference is too large to achieve threshold similarity
      const maxPossibleSim = (2 * Math.min(m, n)) / (m + n);
      if (maxPossibleSim < 0.5) continue;

      // Character LCS on normalized code
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

    if (bestSim >= 0.5) {
      matchesA.add(i);
      matchesB.add(bestJ);
      usedB.add(bestJ);
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
    if (!codeText) return <div className="text-zinc-500 italic p-2">// Empty code</div>;
    const lines = codeText.split("\n");
    return lines.map((line, idx) => {
      const isMatched = matchesSet.has(idx);
      return (
        <div 
          key={idx} 
          className={`flex min-w-full ${isMatched ? 'bg-[#abd9ff]/10 border-l-4 border-[#abd9ff]' : 'border-l-4 border-transparent'} hover:bg-zinc-800/40 py-0.5 transition-colors`}
        >
          <span className="w-12 select-none text-right pr-4 text-zinc-650 font-mono text-xs pt-0.5">{idx + 1}</span>
          <pre className="flex-1 whitespace-pre font-mono text-sm m-0 text-zinc-300">
            <code>{line || " "}</code>
          </pre>
        </div>
      );
    });
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white px-6 py-12 relative flex flex-col animate-fade-in overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#abd9ff]/5 rounded-full blur-3xl pointer-events-none animate-pulse-glow"></div>

      {/* Floating navigation buttons */}
      <button
        onClick={handlePrev}
        disabled={currentIndex === 0}
        className="fixed left-4 top-1/2 -translate-y-1/2 z-45 bg-zinc-900/90 hover:bg-[#abd9ff] hover:text-black border border-zinc-800 hover:border-[#abd9ff] text-white p-4 rounded-full shadow-2xl transition-all hover:scale-105 active:scale-95 disabled:opacity-20 disabled:pointer-events-none cursor-pointer duration-300"
        title="Previous Plagiarism Comparison"
      >
        <ChevronLeft size={24} />
      </button>

      <button
        onClick={handleNext}
        disabled={currentIndex === similarList.length - 1}
        className="fixed right-4 top-1/2 -translate-y-1/2 z-45 bg-zinc-900/90 hover:bg-[#abd9ff] hover:text-black border border-zinc-800 hover:border-[#abd9ff] text-white p-4 rounded-full shadow-2xl transition-all hover:scale-105 active:scale-95 disabled:opacity-20 disabled:pointer-events-none cursor-pointer duration-300"
        title="Next Plagiarism Comparison"
      >
        <ChevronRight size={24} />
      </button>

      <div className="max-w-6xl mx-auto w-full flex-1 flex flex-col relative z-10 animate-scale-in">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-zinc-900 pb-6 gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/solution-details", { state: solutionInfo })}
              className="flex items-center gap-1.5 text-zinc-400 hover:text-[#abd9ff] transition-colors cursor-pointer text-sm font-medium"
            >
              <ArrowLeft size={16} />
              <span>Back to Details</span>
            </button>
            <div className="h-6 w-px bg-zinc-900 hidden sm:block"></div>
            <div>
              <h1 className="text-2xl font-extrabold text-white">Compare <span className="text-[#abd9ff]">Code</span></h1>
              <p className="text-xs text-zinc-500 mt-0.5">
                {solutionInfo.contestId} • Question {solutionInfo.questionNumber}
              </p>
            </div>
          </div>
          
          <div className="bg-zinc-900/35 border border-zinc-900 rounded-xl px-4 py-2.5 flex items-center justify-between gap-6 backdrop-blur-md">
            <div className="text-xs font-semibold text-zinc-300">
              Comparison <span className="text-[#abd9ff]">{currentIndex + 1}</span> of <span className="text-zinc-400">{similarList.length}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-zinc-500 text-xs font-semibold uppercase tracking-wider">Similarity:</span>
              <span className="bg-rose-950/40 text-rose-450 border border-rose-500/20 text-xs px-2.5 py-0.5 rounded-full font-bold">{currentSim?.similarity}</span>
            </div>
          </div>
        </div>

        {/* Dual Screen Code Viewer */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1">
          {/* Main User Code */}
          <div className="flex flex-col">
            <div className="bg-zinc-900/30 border-t border-x border-zinc-900 rounded-t-2xl px-4 py-3 flex items-center justify-between">
              <span className="font-bold text-sm text-[#abd9ff]">{mainUsername} <span className="text-zinc-500 text-xs font-normal">(Main User)</span></span>
              <span className="bg-zinc-800/40 text-zinc-400 text-[10px] font-bold px-2 py-0.5 rounded border border-zinc-800 uppercase tracking-wider">{solutionInfo.language}</span>
            </div>
            <div className="flex-1 min-h-[500px] max-h-[70vh] overflow-auto bg-zinc-900/10 border border-zinc-900 rounded-b-2xl p-4 font-mono text-sm no-scrollbar">
              {renderLines(mainCode, matchesA)}
            </div>
          </div>

          {/* Similar User Code */}
          <div className="flex flex-col">
            <div className="bg-zinc-900/30 border-t border-x border-zinc-900 rounded-t-2xl px-4 py-3 flex items-center justify-between">
              <span className="font-bold text-sm text-[#abd9ff]">{currentSim?.username} <span className="text-zinc-500 text-xs font-normal">(Similar User)</span></span>
              <span className="bg-zinc-800/40 text-zinc-400 text-[10px] font-bold px-2 py-0.5 rounded border border-zinc-800 uppercase tracking-wider">{currentSim?.language}</span>
            </div>
            <div className="flex-1 min-h-[500px] max-h-[70vh] overflow-auto bg-zinc-900/10 border border-zinc-900 rounded-b-2xl p-4 font-mono text-sm no-scrollbar relative">
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
