import test from "node:test";
import assert from "node:assert/strict";
import { parseResumeText } from "./src/services/resumeParser.js";
import { parseJobDescriptionText } from "./src/services/jobDescriptionParser.js";
import { compareResumeToJob } from "./src/services/analysisService.js";

const pavitraResume = `
PAVITRA PANDEY
Full Stack Developer | Distributed Systems | MERN Stack | Java
+91-6261448184 • pavitrapandeysagar@gmail.com • Bhopal, India
LinkedIn • GitHub • Codolio
EDUCATION
University Institute of Technology, RGPV — Bhopal Nov 2023 – Present
B.Tech in Information Technology | CGPA: 7.11 | 3rd Year
TECHNICAL SKILLS
● Languages: Java, JavaScript (ES6+), HTML5, CSS3, SQL
● Frontend: React.js (React 19), Vite, Tailwind CSS, Bootstrap, Obsidian Glassmorphism Design System
● Backend & Distributed: Node.js, Express.js, Apache Kafka, Redis, Microservices Architecture
● Databases: MongoDB (Mongoose, Aggregation Pipelines & Compound Indexes), SQL
● Tools & DevOps: Docker, Docker Compose, Git, GitHub, Render, Vercel, VS Code, Chrome Manifest V3
● Core Concepts: Data Structures & Algorithms (DSA), System Design, OOP, DBMS, RESTful APIs
PROJECTS
CareerSignal — Event-Driven Job Fit Intelligence & Mock Interview Studio
Live Demo | GitHub
● Architected an event-driven distributed system using Node.js, Express, and Apache Kafka to decouple resume parsing from 
background scoring workers, reducing synchronous API blocking by 65%.
● Engineered an idempotent deduplication engine utilizing SHA-256 content hashing and MongoDB compound unique 
indexes, eliminating 100% of duplicate database records and redundant re-computations.
● Integrated Redis Cache-Aside with TTL eviction & O(1) JWT blacklist revocation, accelerating report retrieval latencies 
under 40ms and preventing unauthorized access from logged-out sessions.
● Built an AI Mock Interview Coach & Bullet Optimizer powered by Groq / Gemini LLMs, implementing Google's X-Y-Z 
formula for bullet quantification and an interactive 4-dimension rubric answer evaluator.
Tech Stack: React 19, Vite, Node.js, Express, Apache Kafka, Redis, MongoDB Atlas, Groq API, Docker, Render, Vercel
Algo-Vault — Spaced Repetition LeetCode Tracker & Chrome Extension
Live Demo | GitHub
● Full-stack MERN application + Chrome Extension that auto-captures LeetCode/CodeChef submissions and schedules 
revisions using a Spaced Repetition System (SRS) to combat the Forgetting Curve.
● Built a Chrome Extension (Manifest V3) that hooks into submission events and pipes code + metadata to a MongoDB 
instance, eliminating manual copy-paste for 100% of saves.
● Implemented SRS review scheduler with Again/Hard/Good/Easy ratings, an activity heatmap for consistency tracking, and 
syntax-highlighted code viewer.
Tech Stack: React, Vite, Tailwind CSS, Node.js, Express, MongoDB, Mongoose, Chrome Manifest V3
LEADERSHIP & EXPERIENCE
Technical Co-Head — E-Cell, UIT-RGPV 2023 – Present
● Mentored junior students during technical onboarding sessions, helping them set up development environments and 
understand core web technologies.
● Contributed to technical initiatives, digital solutions, and assisted in organizing tech events and inter-college coordination 
activities.
ACHIEVEMENTS
● College Rank #1 on Codolio with a C Score of 757.58 across all competitive programming metrics.
● Runner-Up at MLSA DevSprint Hackathon 1.0 — competed against teams across the region building full-stack solutions 
under time constraints.
● Solved 500+ DSA problems across LeetCode, CodeChef, and Codeforces; LeetCode Rating: 1540.
LANGUAGES
English (Fluent) • Hindi (Native)
`;

const infosysJobDescription = {
    title: "Full stack developer",
    company: "Infosys",
    rawText: `
Job Title: Full Stack Developer
Company: Infosys
Location: Bangalore / Hybrid
Experience: 0-2 years

Key Responsibilities:
- Design and develop scalable web applications using React and Node.js.
- Build RESTful APIs and integrate backend services with databases.
- Collaborate with agile teams to deliver high quality software.

Requirements:
- Strong experience with JavaScript, React, Node.js, and RESTful APIs.
- Understanding of databases (MongoDB / SQL), version control (Git).
- Good problem solving skills and foundational DSA knowledge.
`,
};

test("Resume Parser correctly extracts all sections, multiple projects, leadership, and metrics", () => {
    const parsed = parseResumeText(pavitraResume);

    // 1. Projects
    assert.equal(parsed.projects.length, 2, "Should parse both CareerSignal and Algo-Vault");
    assert.equal(parsed.projects[0].name, "CareerSignal", "Project 1 title should not be cut off");
    assert.equal(parsed.projects[1].name, "Algo-Vault", "Project 2 title should be Algo-Vault");
    assert.ok(parsed.projects[0].bullets.length >= 3, "CareerSignal should have extracted bullets");
    assert.ok(parsed.projects[1].bullets.length >= 3, "Algo-Vault should have extracted bullets");

    // 2. Metrics
    assert.equal(parsed.hasMetrics, true, "Resume definitely has measurable metrics (65%, 100%, 40ms, etc.)");
    assert.ok(parsed.projects[0].hasMetrics, "CareerSignal has metrics");
    assert.ok(parsed.projects[1].hasMetrics, "Algo-Vault has metrics");

    // 3. Experience & Leadership
    assert.ok(parsed.experience.length >= 1, "Leadership & Experience must be parsed as experience");
    assert.match(parsed.experience[0].role, /Technical Co-Head/i);

    // 4. Skills
    assert.ok(parsed.skills.includes("git"), "Git should be recognized in skills");
    assert.ok(parsed.skills.includes("restful apis"), "RESTful APIs should be recognized");
    assert.ok(parsed.skills.includes("react"), "React should be recognized");
    assert.ok(parsed.skills.includes("kafka"), "Kafka should be recognized");

    // 5. Bullets
    assert.ok(parsed.bullets.length >= 6, "All bullet points should be captured");
    assert.ok(!parsed.bullets.some(b => b.startsWith("●")), "Bullets should be cleaned of unicode symbols");
});

test("compareResumeToJob produces accurate, non-misinterpreted analysis for Pavitra's resume", () => {
    const resume = {
        title: "Pavitra_Pandey_Resume",
        rawText: pavitraResume,
        parsedProfile: parseResumeText(pavitraResume),
    };

    const report = compareResumeToJob(resume, infosysJobDescription, [], { days: 14 });

    // 1. Overall fit & Job Specific competency
    assert.ok(report.overallFit >= 75, `Overall fit should be high (>=75%), got ${report.overallFit}`);
    assert.ok(report.scoreBreakdown.jobSpecific > 0, `Job-specific competency must NOT be 0% when skills match, got ${report.scoreBreakdown.jobSpecific}%`);

    // 2. Metrics should NOT be marked missing
    const metricsBlocker = report.shortlistBlockers.blockers.find(b => /Measurable|Metrics/i.test(b.title));
    assert.equal(metricsBlocker, undefined, "Should NOT flag missing metrics when resume has 65%, 100%, 40ms");

    const metricsWeakness = report.scoreExplanations.missingOrWeak.find(w => /Lacks Quantifiable Metrics/i.test(w.factor));
    assert.equal(metricsWeakness, undefined, "Should NOT list Lacks Quantifiable Metrics in score explanations");

    // 3. restful apis should NOT be flagged as unverified claim when candidate has full stack node/express projects
    const unverifiedApis = report.scoreExplanations.missingOrWeak.find(w => /restful apis/i.test(w.factor));
    assert.equal(unverifiedApis, undefined, "RESTful APIs should be verified by backend/node/express projects");

    // 4. Project relevance
    assert.equal(report.projectRelevance.rankedProjects.length >= 2, true, "Both projects should be ranked");
    assert.equal(report.projectRelevance.rankedProjects[0].name, "CareerSignal");

    // 5. Resume Optimization should NOT show fake 'Developed backend services using Node.js.'
    assert.ok(!report.resumeOptimization.bulletRewrites.some(b => b.original === "Developed backend services using Node.js."));
    assert.ok(report.resumeOptimization.bulletRewrites[0].original.length > 30, "Should use candidate's actual bullet");
});
