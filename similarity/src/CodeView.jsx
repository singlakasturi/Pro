// src/CodeView.jsx
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function CodeView() {
  const location = useLocation();
  const navigate = useNavigate();
  // expects either location.state.codePath or query param ?path=/data/code/...
  const [codeText, setCodeText] = useState("");
  const [loading, setLoading] = useState(true);

  const codePath = location?.state?.codePath || new URLSearchParams(location.search).get("path");

  useEffect(() => {
    const fetchCode = async () => {
      try {
        if (!codePath) {
          setCodeText("// no code selected");
          setLoading(false);
          return;
        }
        const res = await fetch(codePath);
        const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
        if (codePath.startsWith("http") || codePath.startsWith(baseUrl)) {
          const json = await res.json();
          setCodeText(json.submittedCode || "");
        } else {
          const text = await res.text();
          setCodeText(text);
        }
      } catch (err) {
        setCodeText("// failed to load code");
      } finally {
        setLoading(false);
      }
    };
    fetchCode();
  }, [codePath]);

  if (loading) return <div className="text-white bg-black min-h-screen p-6">Loading code...</div>;

  return (
    <div className="min-h-screen bg-zinc-950 text-white px-6 py-12 relative overflow-hidden animate-fade-in">
      {/* Background glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#abd9ff]/5 rounded-full blur-3xl pointer-events-none animate-pulse-glow"></div>

      <div className="max-w-4xl mx-auto relative z-10 animate-scale-in">
        <div className="mb-8 flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-zinc-400 hover:text-[#abd9ff] transition-all cursor-pointer font-medium text-sm"
          >
            <ArrowLeft size={16} />
            <span>Back</span>
          </button>
          <div className="h-4 w-px bg-zinc-800"></div>
          <h1 className="text-3xl font-extrabold text-white">Submitted <span className="text-[#abd9ff]">Code</span></h1>
        </div>
        
        <pre className="bg-zinc-900/35 text-zinc-100 p-6 rounded-2xl overflow-auto no-scrollbar border border-zinc-900 font-mono text-sm leading-relaxed max-h-[75vh] shadow-xl">
          <code>{codeText}</code>
        </pre>
      </div>
    </div>
  );
}
