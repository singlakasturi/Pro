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
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors cursor-pointer font-medium"
          >
            <ArrowLeft size={18} />
            <span>Back</span>
          </button>
          <div className="h-6 w-px bg-zinc-800"></div>
          <h1 className="text-3xl font-bold text-yellow-500">Submitted Code</h1>
        </div>
        <pre className="bg-zinc-950 text-green-300 p-6 rounded-xl overflow-auto no-scrollbar border border-zinc-800 font-mono text-sm leading-relaxed max-h-[80vh]">
          <code>{codeText}</code>
        </pre>
      </div>
    </div>
  );
}
