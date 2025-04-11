import { useEffect, useState } from 'react';

const LeetCodeContests = () => {
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchContests = async () => {
    try {
      const response = await fetch('http://localhost:8080/contests');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setContests(data);
    } catch (error) {
      console.error('There was a problem with the fetch operation:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };
  

  useEffect(() => {
    fetchContests();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="max-w-3xl mx-auto p-5 font-sans bg-white rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">LeetCode Contests</h1>
      <p className="text-gray-600 mb-4">Search and filter contests to explore questions and rankings</p>
      
      <div className="space-y-4">
        {contests.map((contest) => (
          <div key={contest.id} className="border border-gray-200 rounded-lg p-5 hover:shadow-xl transition-shadow duration-300 ease-in-out">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-gray-800">
                {contest.type === "biweekly" 
                  ? "LeetCode Biweekly Contest" 
                  : "LeetCode Weekly Contest"} {contest.id}
              </h2>
              <h3 className="text-gray-700">{contest.title}</h3>
            </div>
            
            <div className="text-gray-500 text-sm mb-4 space-y-1">
              {contest.date && <p>{contest.date}</p>}
              {contest.participants && <p>{contest.participants} participants</p>}
            </div>
            
            <button className="text-blue-600 font-medium px-4 py-2 rounded hover:bg-blue-50 transition-colors duration-200">
              View Contest Details
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LeetCodeContests;