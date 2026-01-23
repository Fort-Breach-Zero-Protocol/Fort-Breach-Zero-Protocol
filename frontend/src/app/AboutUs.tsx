import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, ExternalLink, ArrowLeft } from "lucide-react";
import { motion } from "motion/react";
import backgroundImage from "@/assets/885408bc9f9e51f743a471a27b12eef7765bbfd6.png";

export default function AboutUs() {
  const navigate = useNavigate();

  const developers = [
    {
      name: "Sanskar",
      role: "Game Developer",
      linkedin:
        "https://www.linkedin.com/in/sanskar-gupta-b64214394?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app",
      description: "Phaser Game Mechanics & Design",
    },
    {
      name: "Prashant Bansal",
      role: "Full Stack Developer",
      linkedin: "https://www.linkedin.com/in/prashantbansal2006/",
      description: "Backend & Frontend Architecture",
    },
    {
      name: "Rishabh Agarwal",
      role: "Backend Developer",
      linkedin: "http://www.linkedin.com/in/rishabh-agarwaal",
      description: "Server Architecture & Database Management",
    },
    {
      name: "Adarsh Pandey",
      role: "Frontend Developer",
      linkedin:
        "https://www.linkedin.com/in/adarsh0411?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app",
      description: "UI/UX Design & Frontend Development",
    },
  ];

  const techStack = [
    {
      category: "Frontend",
      technologies: [
        "React",
        "TypeScript",
        "Vite",
        "Tailwind CSS",
        "Phaser 3",
        "Motion",
      ],
    },
    {
      category: "Backend",
      technologies: ["Node.js", "Express.js", "MongoDB", "JWT", "Bcrypt"],
    },
    {
      category: "Tools",
      technologies: ["Git", "VS Code", "MongoDB Atlas", "REST API"],
    },
  ];

  return (
    <div
      className="min-h-screen relative flex flex-col overflow-hidden"
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundColor: "#1e3a5f",
      }}
    >
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#1e3a5f]/90 via-[#1e3a5f]/80 to-[#1e3a5f]/70" />

      {/* HEADER */}
      <motion.header
        className="relative z-20 px-12 py-8 flex items-center justify-between border-b border-cyan-400/20"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3">
          <Shield size={32} color="#22d3ee" />
          <h1
            className="tracking-wider text-cyan-400"
            style={{ fontFamily: "Orbitron, sans-serif", fontSize: "2rem" }}
          >
            FORT BREACH
          </h1>
        </div>

        {/* Back Button */}
        <button
          onClick={() => navigate("/home")}
          className="flex items-center gap-2 px-6 py-2 bg-transparent border border-cyan-400/30 text-cyan-400 hover:border-cyan-400/60 transition-all"
          style={{
            clipPath:
              "polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 0 100%)",
            fontFamily: "Rajdhani, sans-serif",
          }}
        >
          <ArrowLeft size={20} />
          Back to Home
        </button>
      </motion.header>

      {/* MAIN CONTENT */}
      <div className="relative z-10 flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto px-12 py-12 space-y-16">
          {/* Title Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1
              className="text-5xl font-bold text-cyan-400 mb-4"
              style={{ fontFamily: "Orbitron, sans-serif" }}
            >
              ABOUT FORT BREACH
            </h1>
            <p
              className="text-xl text-cyan-300"
              style={{ fontFamily: "Rajdhani, sans-serif" }}
            >
              A Strategic Tower Game Experience
            </p>
          </motion.section>

          {/* Project Description */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="bg-[#0f2847]/50 border border-cyan-400/30 rounded-lg p-8"
            style={{
              clipPath:
                "polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px))",
            }}
          >
            <h2
              className="text-3xl font-bold text-orange-400 mb-6"
              style={{ fontFamily: "Orbitron, sans-serif" }}
            >
              Project Overview
            </h2>
            <div
              className="space-y-4 text-cyan-300"
              style={{ fontFamily: "Rajdhani, sans-serif" }}
            >
              <p className="text-lg leading-relaxed">
                <strong>Fort Breach</strong> is a "Micro-Tactical" web game that
                prioritizes precision strategy over army size. Players navigate
                a maximum of 25 units through a linear grid filled with logic
                gates, moving walls, and tactical bottlenecks. The game shifts
                the high-stakes puzzle experience where environmental
                manipulation are the keys to victory.
              </p>
              <p className="text-lg leading-relaxed">
                The game features five progressive levels of increasing
                difficulty, each with unique challenges and environments.
                Players must carefully manage their limited troop resources and
                plan their strategies to repel enemy attacks and progress
                through all levels.
              </p>
              <p className="text-lg leading-relaxed">
                <strong>Key Features:</strong>
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>5 Progressive Game Levels</li>
                <li>Real-time Strategic Gameplay</li>
                <li>User Authentication & Progress Tracking</li>
                <li>Persistent Data Storage with MongoDB</li>
                <li>Dynamic Leaderboard System</li>
                <li>Points System based on Troop Efficiency</li>
                <li>Multiple Character Selection Options</li>
              </ul>
            </div>
          </motion.section>

          {/* Tech Stack */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h2
              className="text-3xl font-bold text-orange-400 mb-8"
              style={{ fontFamily: "Orbitron, sans-serif" }}
            >
              Technology Stack
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {techStack.map((stack, index) => (
                <motion.div
                  key={stack.category}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
                  className="bg-[#0f2847]/50 border border-cyan-400/30 rounded-lg p-6 hover:border-cyan-400/60 transition-all"
                  style={{
                    clipPath:
                      "polygon(0 0, calc(100% - 15px) 0, 100% 15px, 100% 100%, 15px 100%, 0 calc(100% - 15px))",
                  }}
                >
                  <h3
                    className="text-2xl font-bold text-cyan-400 mb-4"
                    style={{ fontFamily: "Orbitron, sans-serif" }}
                  >
                    {stack.category}
                  </h3>
                  <div className="space-y-2">
                    {stack.technologies.map((tech) => (
                      <div
                        key={tech}
                        className="inline-block mr-3 mb-2 px-3 py-1 bg-cyan-900/30 border border-cyan-400/40 text-cyan-300 rounded text-sm"
                        style={{ fontFamily: "Rajdhani, sans-serif" }}
                      >
                        {tech}
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* Developers */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <h2
              className="text-3xl font-bold text-orange-400 mb-8"
              style={{ fontFamily: "Orbitron, sans-serif" }}
            >
              Development Team
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {developers.map((dev, index) => (
                <motion.div
                  key={dev.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
                  className="bg-gradient-to-br from-cyan-900/30 to-cyan-800/20 border border-cyan-400/30 rounded-lg p-8 hover:border-cyan-400/60 transition-all group"
                  style={{
                    clipPath:
                      "polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px))",
                  }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3
                        className="text-2xl font-bold text-cyan-400"
                        style={{ fontFamily: "Orbitron, sans-serif" }}
                      >
                        {dev.name}
                      </h3>
                      <p
                        className="text-orange-400 font-semibold"
                        style={{ fontFamily: "Rajdhani, sans-serif" }}
                      >
                        {dev.role}
                      </p>
                    </div>
                  </div>
                  <p
                    className="text-cyan-300 mb-6"
                    style={{ fontFamily: "Rajdhani, sans-serif" }}
                  >
                    {dev.description}
                  </p>
                  <a
                    href={dev.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-900/50 border border-cyan-400/50 text-cyan-400 rounded hover:bg-cyan-800/50 hover:border-cyan-400/80 transition-all group-hover:translate-x-1"
                    style={{ fontFamily: "Rajdhani, sans-serif" }}
                  >
                    <span>Visit LinkedIn</span>
                    <ExternalLink size={18} />
                  </a>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* Game Mechanics */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-[#0f2847]/50 border border-cyan-400/30 rounded-lg p-8"
            style={{
              clipPath:
                "polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px))",
            }}
          >
            <h2
              className="text-3xl font-bold text-orange-400 mb-6"
              style={{ fontFamily: "Orbitron, sans-serif" }}
            >
              Game Mechanics
            </h2>
            <div
              className="grid grid-cols-1 md:grid-cols-2 gap-6 text-cyan-300"
              style={{ fontFamily: "Rajdhani, sans-serif" }}
            >
              <div>
                <h4 className="text-xl font-bold text-cyan-400 mb-3">
                  Scoring System
                </h4>
                <p>
                  Points are calculated as <strong>100 - Troops Used</strong>.
                  The fewer troops you deploy, the higher your score. Efficient
                  strategy is rewarded!
                </p>
              </div>
              <div>
                <h4 className="text-xl font-bold text-cyan-400 mb-3">
                  Level Progression
                </h4>
                <p>
                  Unlock new levels by completing previous ones. Each level
                  presents unique challenges and increases in difficulty.
                </p>
              </div>
              <div>
                <h4 className="text-xl font-bold text-cyan-400 mb-3">
                  Leaderboard
                </h4>
                <p>
                  Compete with other players globally. The leaderboard ranks
                  players by their total points across all levels.
                </p>
              </div>
              <div>
                <h4 className="text-xl font-bold text-cyan-400 mb-3">
                  Data Persistence
                </h4>
                <p>
                  All your progress, points, and achievements are securely saved
                  in our database and sync across sessions.
                </p>
              </div>
            </div>
          </motion.section>

          {/* Footer Spacing */}
          <div className="h-12" />
        </div>
      </div>
    </div>
  );
}
