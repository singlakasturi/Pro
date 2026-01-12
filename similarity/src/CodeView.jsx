// src/CodeView.jsx
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

export default function CodeView() {
  const location = useLocation();
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
        const text = await res.text();
        setCodeText(text);
      } catch (err) {
        setCodeText("// failed to load code");
      } finally {
        setLoading(false);
      }
    };
    fetchCode();
  }, [codePath]);

  if (loading) return <div className="text-white p-6">Loading code...</div>;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Submitted Code</h1>
      <pre className="bg-gray-900 text-green-300 p-4 rounded-xl overflow-auto">
        <code>{codeText}</code>
      </pre>
    </div>
  );
}
