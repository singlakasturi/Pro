import { useState } from "react";
import "./App.css";
import { ChevronDown } from "lucide-react";

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
function App() {
  return (
    <>
      <section id="main" className="Main">
        <nav className="fixed top-6 left-0 right-0 z-50 flex justify-center cursor-pointer">
          <div className="bg-black/60 rounded-lg py-2.5 px-8 max-w-4xl w-full mx-auto flex justify-between items-center shadow-lg backdrop-blur-sm">
            <a
              href="#"
              className="text-[#abd9ff] text-2xl font-bold flex items-center gap-2"
            >
              Resemblance
            </a>
            <div className="hidden md:flex items-center space-x-10">
              <button className="text-white hover:text-gray-300 transition-colors">
                Why Us
              </button>
              <button className="text-white hover:text-gray-300 transition-colors">
                Mission
              </button>
              <button className="text-white hover:text-gray-300 transition-colors">
                FAQ
              </button>
              <button className="text-white hover:text-gray-300 transition-colors">
                Contact Us
              </button>
            </div>
            <div className="relative">
              <div className="absolute -inset-px bg-gradient-to-r rounded-lg opacity-30 blur-sm"></div>
              <button className="relative bg-[#abd9ff] text-black px-4 py-2 rounded-md hover:bg-[#abd9ff] transition-color0s cursor-pointer">
                Contests
              </button>
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
              <h3 className="text-4xl md:text-5xl font-bold mt-6 text-[#abd9ff] opacity-style">
                Integrity in Logic
              </h3>
              <p className="text-lg text-gray-400 mt-8 max-w-3xl mx-auto opacity-style">
                Uncovering duplicates post every challenge.
              </p>
              <div className="mt-12 opacity-style">
                <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&amp;_svg]:pointer-events-none [&amp;_svg]:size-4 [&amp;_svg]:shrink-0 hover:bg-primary/90 h-10 bg-[#1e1e1e] border border-[#333] text-white py-5 px-6 rounded-md text-base cursor-pointer">
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
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
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
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
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
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
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
            <button className="justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&amp;_svg]:pointer-events-none [&amp;_svg]:size-4 [&amp;_svg]:shrink-0 h-10 bg-transparent hover:bg-[#abd9ff] text-[#abd9ff] hover:text-[#000] border border-[#abd9ff] rounded-md py-3 px-6 flex items-center gap-2 mx-auto cursor-pointer">
              Contact Us{" "}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
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
              <form className="space-y-6">
                <div>
                  <label
                    for="name"
                    className="block text-sm font-medium text-gray-400 mb-2"
                  >
                    Full Name
                  </label>
                  <input
                    className="flex h-10 w-full rounded-md border px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm bg-[#222] border-[#333] text-white"
                    id="name"
                    placeholder="Your Full Name"
                  ></input>
                </div>
                <div>
                  <label
                    for="email"
                    className="block text-sm font-medium text-gray-400 mb-2"
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    className="flex h-10 w-full rounded-md border px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm bg-[#222] border-[#333] text-white"
                    id="email"
                    placeholder="Your Email"
                  ></input>
                </div>
                <div>
                  <label
                    for="message"
                    className="block text-sm font-medium text-gray-400 mb-2"
                  >
                    Your Message
                  </label>
                  <textarea
                    className="flex w-full rounded-md border px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 bg-[#222] border-[#333] text-white min-h-[120px]"
                    id="message"
                    placeholder="Share your thoughts, feedback, or questions here!"
                    required=""
                  ></textarea>
                </div>
                <button
                  className="whitespace-nowrap ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&amp;_svg]:pointer-events-none [&amp;_svg]:size-4 [&amp;_svg]:shrink-0 h-10 px-4 w-full bg-[#abd9ff] hover:bg-[#2f6796] text-black font-medium py-5 rounded-md text-base flex items-center justify-center gap-2 cursor-pointer"
                  type="submit"
                >
                  Send Message
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    className="lucide lucide-arrow-right"
                  >
                    <path d="M5 12h14"></path>
                    <path d="m12 5 7 7-7 7"></path>
                  </svg>
                </button>
              </form>
            </div>
          </div>
      </section>
    </>
  );
}

function FAQSection() {
  const [openIndex, setOpenIndex] = useState(null);

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
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 animate-fadeInUp">
          Common Questions Answered
        </h2>
        <div className="max-w-3xl mx-auto space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="border border-[#333] rounded-lg overflow-hidden bg-[#1a1a1a]"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full flex items-center justify-between px-6 py-4 text-lg font-medium hover:no-underline transition-all"
              >
                {faq.question}
                <ChevronDown
                  className={`h-4 w-4 transition-transform duration-300 ${
                    openIndex === index ? "rotate-180" : ""
                  }`}
                />
              </button>
              {openIndex === index && (
                <div className="px-6 pb-4 text-sm text-gray-300 transition-all animate-fadeIn">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
    </section>
  );
}
export default App;
