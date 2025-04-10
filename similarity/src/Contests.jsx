// src/pages/ContestDetails.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import QuestionCard from "./components/Contest";

const ContestDetails = () => {
  const { contestId } = useParams();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [contestInfo, setContestInfo] = useState({
    duration: "",
    totalPoints: 0,
  });

  useEffect(() => {
    fetch(`http://10.10.198.249:8080/api/contests/${contestId}`)
      .then((res) => res.json())
      .then((data) => {
        setQuestions(data.questions || []);
        setContestInfo({
          duration: data.duration || "90 mins",
          totalPoints: data.totalPoints || 0,
        });
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching contest details:", err);
        setLoading(false);
      });
  }, [contestId]);

  if (loading) return <div className="text-white p-4">Loading...</div>;

  return (
    <div className="bg-black min-h-screen text-white px-6 py-10">
      <div className="text-center mb-6">
        <h1 className="text-4xl font-bold text-yellow-400 mb-2">
          LeetCode Contest {contestId}
        </h1>
        <p className="text-gray-400">
          Duration: {contestInfo.duration} | Total Points: {contestInfo.totalPoints} | Questions: {questions.length}
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
        {questions.map((question) => (
          <QuestionCard key={question.questionId} question={question} />
        ))}
      </div>
    </div>
  );
};

export default ContestDetails;
