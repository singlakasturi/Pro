import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";

import "./App.css";
import { ChevronDown } from "lucide-react";
import Contests from "./Contests";
import ContestQuestions from "./ContestQuestions";
import Leaderboard from "./LeaderBoard";
import CodeView from "./CodeView";
import SolutionDetails from "./SolutionDetails";
import DatabasePopulator from "./DatabasePopulator";
import CompareCode from "./CompareCode";

const faqs = [
  {
    question: "What does this website offer, and who is it for?",
    answer:
      "This platform provides resources and tools aimed at helping users with XYZ tasks. It is designed for both beginners and professionals.",
  },
  {
    question: "Do we track or report user activity on this site?",
    answer:
      "No, we respect user privacy and do not track or report any personal activity unless explicitly stated.",
  },
  {
    question: "I think my information is incorrect here — how can I fix it?",
    answer:
      "Please reach out to our support team using the contact form, and we'll review and correct your information as soon as possible.",
  },
  {
    question: "What updates or features are planned next?",
    answer:
      "We are working on adding personalized dashboards, API access, and real-time updates. Stay tuned!",
  },
];

const decodeJwt = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window.atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Failed to decode JWT token", error);
    return null;
  }
};

function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });

  const handleSignOut = () => {
    setUser(null);
    localStorage.removeItem("user");
    if (window.google) {
      window.google.accounts.id.disableAutoSelect();
    }
  };

  useEffect(() => {
    let isMounted = true;

    const initGoogleGis = () => {
      if (!window.google) return;

      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        callback: (response) => {
          if (!isMounted) return;
          const token = response.credential;
          const decoded = decodeJwt(token);
          if (decoded) {
            const userData = {
              token,
              name: decoded.name,
              email: decoded.email,
              picture: decoded.picture
            };
            setUser(userData);
            localStorage.setItem("user", JSON.stringify(userData));
          }
        },
        auto_select: false
      });

      if (!user) {
        const buttonDiv = document.getElementById("google-signin-button");
        if (buttonDiv) {
          window.google.accounts.id.renderButton(buttonDiv, {
            theme: "filled_blue",
            size: "large",
            width: 280,
            shape: "pill"
          });
        }
        window.google.accounts.id.prompt();
      }
    };

    if (window.google) {
      initGoogleGis();
    } else {
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = initGoogleGis;
      document.head.appendChild(script);
    }

    return () => {
      isMounted = false;
    };
  }, [user]);

  return (
    <Router>
      {!user && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="relative bg-zinc-950 border border-zinc-800 rounded-2xl p-10 max-w-md w-full mx-4 shadow-2xl text-center flex flex-col items-center">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-[#abd9ff] to-blue-600 rounded-2xl opacity-30 blur-lg -z-10 animate-pulse"></div>
            <h2 className="text-3xl font-extrabold text-white mb-2 tracking-tight">
              Resemblance
            </h2>
            <p className="text-zinc-400 mb-8 text-sm max-w-xs">
              Detecting plagiarism, protecting integrity. Please sign in with your Google account to proceed.
            </p>
            <div id="google-signin-button" className="min-h-[40px] w-full flex justify-center"></div>
          </div>
        </div>
      )}
      <Routes>
        <Route path="/" element={<Home user={user} onSignOut={handleSignOut} />} />
        <Route path="/contests" element={<Contests user={user} onSignOut={handleSignOut} />} />
        <Route path="/contest-questions/:code" element={<ContestQuestions user={user} onSignOut={handleSignOut} />} />
        <Route path="/leaderboard/:contestCode/:questionId" element={<Leaderboard user={user} onSignOut={handleSignOut} />} />
        <Route path="/code-view" element={<CodeView user={user} onSignOut={handleSignOut} />} />
        <Route path="/solution-details" element={<SolutionDetails user={user} onSignOut={handleSignOut} />} />
        <Route path="/compare-code" element={<CompareCode user={user} onSignOut={handleSignOut} />} />
        <Route path="/admin/populator" element={<DatabasePopulator user={user} onSignOut={handleSignOut} />} />
      </Routes>
    </Router>
  );
}

function Home({ user, onSignOut }) {
  const [contactName, setContactName] = useState(() => localStorage.getItem("contactName") || "");
  const [contactEmail, setContactEmail] = useState(() => localStorage.getItem("contactEmail") || "");
  const [contactMessage, setContactMessage] = useState(() => localStorage.getItem("contactMessage") || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  useEffect(() => {
    localStorage.setItem("contactName", contactName);
  }, [contactName]);

  useEffect(() => {
    localStorage.setItem("contactEmail", contactEmail);
  }, [contactEmail]);

  useEffect(() => {
    localStorage.setItem("contactMessage", contactMessage);
  }, [contactMessage]);

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

    try {
      const response = await fetch(`${baseUrl}/contact`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: contactName,
          email: contactEmail,
          message: contactMessage,
        }),
      });

      if (response.ok) {
        setSubmitStatus("success");
        setContactName("");
        setContactEmail("");
        setContactMessage("");
      } else {
        setSubmitStatus("error");
      }
    } catch (error) {
      console.error("Error submitting contact form", error);
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <section id="main" className="Main">
        <nav className="fixed top-6 left-0 right-0 z-50 flex justify-center cursor-pointer">
          <div className="bg-black/60 rounded-lg py-2.5 px-8 max-w-6xl w-full mx-auto flex justify-between items-center shadow-lg backdrop-blur-sm">
            <Link to="/" className="text-[#abd9ff] text-2xl font-bold flex items-center gap-2">
              Resemblance
            </Link>
            <div className="hidden md:flex items-center space-x-10">
              <button onClick={() => scrollToSection("why")} className="text-white hover:text-gray-300 transition-colors cursor-pointer">Why Us</button>
              <button onClick={() => scrollToSection("mission")} className="text-white hover:text-gray-300 transition-colors cursor-pointer">Mission</button>
              <button onClick={() => scrollToSection("faq")} className="text-white hover:text-gray-300 transition-colors cursor-pointer">FAQ</button>
              <button onClick={() => scrollToSection("contact")} className="text-white hover:text-gray-300 transition-colors cursor-pointer">Contact Us</button>
            </div>
            <div className="flex items-center space-x-4">
              {user && user.email === import.meta.env.VITE_ADMIN_EMAIL && (
                <Link
                  to="/admin/populator"
                  className="text-xs text-[#abd9ff] hover:text-[#8ec7f5] transition-colors cursor-pointer font-semibold mr-2 bg-[#abd9ff]/10 py-1 px-3.5 rounded-full border border-[#abd9ff]/20 hover:border-[#abd9ff]/45"
                >
                  Admin Panel
                </Link>
              )}
              {user && (
                <div className="flex items-center space-x-2 bg-white/10 rounded-full py-1 px-3 border border-white/10">
                  <img
                    src={user.picture}
                    alt={user.name}
                    className="w-5 h-5 rounded-full border border-white/20"
                    onError={(e) => { e.target.src = "https://www.gravatar.com/avatar?d=mp"; }}
                  />
                  <span className="text-xs text-zinc-300 font-medium max-w-[100px] truncate">{user.name}</span>
                  <button
                    onClick={onSignOut}
                    className="text-[10px] text-[#abd9ff] hover:underline cursor-pointer ml-1.5 border-l border-zinc-700 pl-1.5 font-semibold"
                  >
                    Sign Out
                  </button>
                </div>
              )}
              <div className="relative">
                <Link
                  to="/contests"
                  className="relative bg-[#abd9ff] text-black px-4 py-2 rounded-md hover:bg-[#abd9ff] transition-colors cursor-pointer"
                >
                  Contests
                </Link>
              </div>
            </div>
          </div>
        </nav>

        <div className="w-full h-screen flex items-center justify-center">
          <div className="max-w-7xl px-6 pt-32 flex flex-col items-center relative -mt-7">
            <div className="absolute inset-0 dot-pattern-overlay z-0"></div>
            <div className="text-center relative z-10">
              <h1 className="text-5xl md:text-6xl font-bold mb-6 opacity-style">
                <span className="text-[#abd9ff]">Echoes </span>
                <span>Revealed</span>
              </h1>
              <h2 className="text-5xl md:text-6xl font-bold opacity-style">
                Past <span className="inline-block mx-2">✦</span> Pretending.
              </h2>
              <h3 className="text-4xl md:text-5xl font-bold mt-6 text-[#abd9ff] opacity-style">Integrity in Logic</h3>
              <p className="text-lg text-gray-400 mt-8 max-w-3xl mx-auto opacity-style">Uncovering duplicates post every challenge.</p>
              <div className="mt-12 opacity-style">
                <button onClick={() => scrollToSection("why")} className="inline-flex items-center justify-center gap-2 h-10 bg-[#1e1e1e] border border-[#333] text-white py-5 px-6 rounded-md text-base cursor-pointer">
                  Learn More ↓
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="why" className="max-w-7xl mx-auto px-6 pt-20">
        <div className="flex justify-center mb-12">
          <div className="rounded-full bg-[#222] px-8 py-2 inline-block animate-fadeInUp animate-visible">
            <span className="text-white text-lg font-normal">Why Us</span>
          </div>
        </div>
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 animate-fadeInUp animate-visible">
          Seamless Tracing
        </h2>
        <h3 className="text-3xl md:text-4xl font-bold text-center mb-10 animate-fadeInUp animate-visible">
          Pure Code Standards
        </h3>
        <p className="text-lg text-gray-400 text-center mb-20 animate-fadeInUp animate-visible">
          Spot cloned submissions quickly, easily, and reliably.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mt-10">
          <div className="animate-fadeInLeft animate-visible-left">
            <div className="flex flex-col items-center text-center">
              <div className="bg-[#2f6796] h-20 w-20 rounded-full flex items-center justify-center mb-8">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-brain h-8 w-8 text-white"
                >
                  <path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z"></path>
                  <path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z"></path>
                  <path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4"></path>
                  <path d="M17.599 6.5a3 3 0 0 0 .399-1.375"></path>
                  <path d="M6.003 5.125A3 3 0 0 0 6.401 6.5"></path>
                  <path d="M3.477 10.896a4 4 0 0 1 .585-.396"></path>
                  <path d="M19.938 10.5a4 4 0 0 1 .585.396"></path>
                  <path d="M6 18a4 4 0 0 1-1.967-.516"></path>
                  <path d="M19.967 17.484A4 4 0 0 1 18 18"></path>
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-4">
                Clean Design, Clear Insight
              </h3>
              <p className="text-gray-400">
                Navigate with ease—no clutter, just what you need.
              </p>
            </div>
          </div>
          <div className="animate-fadeInUp animate-visible">
            <div className="flex flex-col items-center text-center">
              <div className="bg-[#2f6796] h-20 w-20 rounded-full flex items-center justify-center mb-8">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-zap h-8 w-8 text-white"
                >
                  <path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-4">
                Fast Insights, Precise Flags
              </h3>
              <p className="text-gray-400">
                Highlight dishonest entries with rich, actionable data.
              </p>
            </div>
          </div>
          <div className="animate-fadeInRight animate-visible-right">
            <div className="flex flex-col items-center text-center">
              <div className="bg-[#2f6796] h-20 w-20 rounded-full flex items-center justify-center mb-8">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-users h-8 w-8 text-white"
                >
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-4">
                Honest Competition, Always
              </h3>
              <p className="text-gray-400">
                We safeguard merit, preserving authentic standings.
              </p>
            </div>
          </div>
        </div>
        <div className="flex justify-center mt-20 animate-fadeInUp animate-visible"></div>
      </section>

      <section id="mission" className="max-w-7xl mx-auto px-6 pt-20">
        <div className="flex justify-center mb-12">
          <div className="rounded-full bg-[#222] px-8 py-2 inline-block animate-fadeInUp animate-visible">
            <span className="text-white text-lg font-normal">Our Mission</span>
          </div>
        </div>
        <div className="text-center max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 animate-fadeInUp animate-visible">
            Unmasking the<span className="text-[#abd9ff]"> Imitation 🔍</span>
          </h2>
          <h3 className="text-3xl md:text-4xl font-bold mb-4 animate-fadeInUp animate-visible">
            Championing<span className="text-[#abd9ff]"> True Skill 🏆</span>
          </h3>
          <p className="text-lg text-gray-400 mb-4 animate-fadeInUp animate-visible">
            We detect plagiarism with sharp accuracy, preserving the spirit of
            honest competition.
          </p>
          <p className="text-lg text-gray-400 mb-20 animate-fadeInUp animate-visible">
            By defending fairness, we let authentic talent shine beyond the
            shadows of imitation.
          </p>
          <div className="animate-fadeInUp animate-visible">
            <button onClick={() => scrollToSection("contact")} className="justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&amp;_svg]:pointer-events-none [&amp;_svg]:size-4 [&amp;_svg]:shrink-0 h-10 bg-transparent hover:bg-[#abd9ff] text-[#abd9ff] hover:text-[#000] border border-[#abd9ff] rounded-md py-3 px-6 flex items-center gap-2 mx-auto cursor-pointer">
              Contact Us{" "}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-arrow-right"
              >
                <path d="M5 12h14"></path>
                <path d="m12 5 7 7-7 7"></path>
              </svg>
            </button>
          </div>
        </div>
      </section>

      <FAQSection />

      <section id="contact" className="max-w-7xl mx-auto px-6 py-20">
          <div className="flex justify-center mb-12">
            <div className="rounded-full bg-[#1e1e1e] px-8 py-2 inline-block animate-fadeInUp animate-visible">
              <span className="text-white text-lg font-medium">
                Let's Connect
              </span>
            </div>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 animate-fadeInUp animate-visible">
            Get in Touch
          </h2>
          <div className="max-w-2xl mx-auto animate-fadeInUp animate-visible">
            <div className="bg-[#1a1a1a] border border-[#333] rounded-lg overflow-hidden p-8 relative">
              <div className="flex space-x-2 absolute top-4 left-4">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
              <div className="mt-8 text-center mb-8">
                <p className="text-gray-400">
                  Got questions or feedback? Whether you're here to explore,
                  report issues, or just say hi, feel free to drop a message!
                </p>
              </div>
              {submitStatus === "success" && (
                <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 text-green-400 rounded-md text-sm text-center">
                  Message Sent Successfully! We'll get back to you soon.
                </div>
              )}
              {submitStatus === "error" && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 text-red-400 rounded-md text-sm text-center">
                  Failed to send message. Please try again later.
                </div>
              )}
              <form onSubmit={handleContactSubmit} className="space-y-6">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-400 mb-2"
                  >
                    Full Name
                  </label>
                  <input
                    className="flex h-10 w-full rounded-md border px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm bg-[#222] border-[#333] text-white"
                    id="name"
                    placeholder="Your Full Name"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    required
                  ></input>
                </div>
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-400 mb-2"
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    className="flex h-10 w-full rounded-md border px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm bg-[#222] border-[#333] text-white"
                    id="email"
                    placeholder="Your Email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    required
                  ></input>
                </div>
                <div>
                  <label
                    htmlFor="message"
                    className="block text-sm font-medium text-gray-400 mb-2"
                  >
                    Your Message
                  </label>
                  <textarea
                    className="flex w-full rounded-md border px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 bg-[#222] border-[#333] text-white min-h-[120px]"
                    id="message"
                    placeholder="Share your thoughts, feedback, or questions here!"
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                    required
                  ></textarea>
                </div>
                <button
                  className="whitespace-nowrap ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&amp;_svg]:pointer-events-none [&amp;_svg]:size-4 [&amp;_svg]:shrink-0 h-10 px-4 w-full bg-[#abd9ff] hover:bg-[#2f6796] text-black font-medium py-5 rounded-md text-base flex items-center justify-center gap-2 cursor-pointer"
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Sending..." : "Send Message"}
                  {!isSubmitting && (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="lucide lucide-arrow-right"
                    >
                      <path d="M5 12h14"></path>
                      <path d="m12 5 7 7-7 7"></path>
                    </svg>
                  )}
                </button>
              </form>
            </div>
          </div>
      </section>
    </>
  );
}

function FAQSection() {
  const [openIndex, setOpenIndex] = React.useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="max-w-7xl mx-auto px-6 pt-20">
      <div className="flex justify-center mb-12">
        <div className="rounded-full bg-[#1e1e1e] px-8 py-2 inline-block animate-fadeInUp">
          <span className="text-white text-lg font-medium">Quick Help</span>
        </div>
      </div>
      <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 animate-fadeInUp">Common Questions Answered</h2>
      <div className="max-w-3xl mx-auto space-y-4">
        {faqs.map((faq, index) => (
          <div key={index} className="border border-[#333] rounded-lg overflow-hidden bg-[#1a1a1a]">
            <button onClick={() => toggleFAQ(index)} className="w-full flex items-center justify-between px-6 py-4 text-lg font-medium hover:no-underline transition-all">
              {faq.question}
              <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${openIndex === index ? "rotate-180" : ""}`} />
            </button>
            {openIndex === index && <div className="px-6 pb-4 text-sm text-gray-300 transition-all animate-fadeIn">{faq.answer}</div>}
          </div>
        ))}
      </div>
    </section>
  );
}

export default App;
