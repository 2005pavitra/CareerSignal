export const knownSkills = [
    // Languages
    "javascript", "typescript", "python", "java", "c++", "c#", "go", "golang", "rust", "php", "ruby", "sql", "html", "html5", "css", "css3",
    // Frontend
    "react", "react.js", "react 19", "vite", "tailwind", "tailwind css", "bootstrap", "next.js", "vue", "angular", "redux", "redux toolkit",
    // Backend & APIs
    "node.js", "express", "express.js", "fastapi", "django", "flask", "spring boot", "rest api", "restful apis", "graphql", "grpc", "websockets",
    // Databases & Caching
    "mongodb", "postgresql", "mysql", "redis", "elasticsearch", "cassandra", "dynamodb", "prisma", "mongoose", "dbms", "nosql",
    // Messaging & Streaming
    "kafka", "apache kafka", "rabbitmq", "sqs",
    // Cloud & DevOps
    "docker", "docker compose", "kubernetes", "aws", "gcp", "azure", "ci/cd", "github actions", "terraform", "linux", "nginx", "git", "github", "render", "vercel", "postman", "vs code",
    // Architecture & Core
    "microservices", "system design", "distributed systems", "event-driven architecture", "data structures", "algorithms", "dsa", "oop",
    // Security & Auth
    "jwt", "oauth",
    // Testing
    "jest", "unit testing", "pytest",
    // Specialized & AI / ML
    "chrome extension", "manifest v3", "groq", "gemini", "langchain", "langgraph", "llm", "rag", "vector db", "prompt engineering"
];

const sectionAliases = {
    summary: ["summary", "profile", "about", "professional summary", "objective", "career objective"],
    skills: ["skills", "technical skills", "technologies", "core competencies", "skills & tools", "technical expertise"],
    experience: [
        "experience", "work experience", "employment", "professional experience", "internships",
        "leadership & experience", "leadership experience", "leadership", "experience & leadership",
        "positions of responsibility", "work & leadership", "relevant experience"
    ],
    projects: ["projects", "personal projects", "key projects", "academic projects", "featured projects", "technical projects"],
    education: ["education", "academic background", "qualifications", "academic qualifications"],
    achievements: [
        "achievements", "honors & awards", "awards", "accomplishments", "hackathons & achievements",
        "competitive programming", "extracurricular achievements", "key achievements"
    ],
};

const normalizeHeading = (line) => line.trim().toLowerCase().replace(/[:\-]+$/, "");

const extractSections = (lines) => {
    const sections = {};
    let currentSection = "other";

    for (const line of lines) {
        const normalizedLine = normalizeHeading(line);
        const sectionName = Object.entries(sectionAliases).find(([, aliases]) => aliases.includes(normalizedLine))?.[0];

        if (sectionName) {
            currentSection = sectionName;
            sections[currentSection] ||= [];
        } else if (line.trim()) {
            sections[currentSection] ||= [];
            sections[currentSection].push(line.trim());
        }
    }

    return sections;
};

const extractSectionBlocks = (rawLines) => {
    const sections = {};
    let currentSection = "other";
    let currentBlock = [];

    const flushBlock = () => {
        if (currentBlock.length) {
            sections[currentSection] ||= [];
            sections[currentSection].push(currentBlock);
            currentBlock = [];
        }
    };

    for (const rawLine of rawLines) {
        const line = rawLine.trim();
        const normalizedLine = normalizeHeading(line);
        const sectionName = Object.entries(sectionAliases).find(([, aliases]) => aliases.includes(normalizedLine))?.[0];

        if (sectionName) {
            flushBlock();
            currentSection = sectionName;
            continue;
        }

        if (!line) {
            flushBlock();
            continue;
        }

        currentBlock.push(line);
    }

    flushBlock();
    return sections;
};

export const extractSkills = (text) => {
    if (!text) return [];
    const searchableText = ` ${text.toLowerCase()} `;
    const detected = new Set();

    for (const skill of knownSkills) {
        const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const regex = new RegExp(`(?:^|[\\s,;()/\\[\\]{}:.-])${escaped}(?:$|[\\s,;()/\\[\\]{}:.-])`, "i");
        if (regex.test(searchableText)) {
            // Normalize variants to canonical forms
            if (skill === "react 19" || skill === "react.js") {
                detected.add("react");
            } else if (skill === "express.js") {
                detected.add("express");
            } else if (skill === "apache kafka") {
                detected.add("kafka");
            } else if (skill === "tailwind css") {
                detected.add("tailwind");
                detected.add("tailwind css");
            } else {
                detected.add(skill);
            }
        }
    }

    return [...detected];
};

export const hasMeasurableMetric = (text) => {
    if (!text) return false;

    // 1. Percentage check: handle % without relying on trailing \b (% is non-word character)
    if (/\b\d+(?:\.\d+)?%/.test(text)) return true;

    // 2. Numbers followed by metric units or quantities
    if (/\b\d+(?:\.\d+)?\s*(?:x|k|ms|s|sec|seconds?|users?|req|rpm|rps|clients?|customers?|\$|million|billion|mb|gb|tb|tbps|gbps|stars?|commits?)\b/i.test(text)) return true;

    // 3. Numbers with plus notation (e.g. 500+ DSA problems, 10k+ requests)
    if (/\b\d+\+\s*(?:dsa|problems?|questions?|users?|requests?|clients?|saves?|records?|repos?)\b/i.test(text)) return true;

    // 4. Ranks, ratings, and competitive scores (e.g. Rank #1, Rating: 1540, Score of 757.58)
    if (/\b(?:rank\s*#?\d+|rating\s*:\s*\d+|score\s*(?:of|:)?\s*\d+|cgpa\s*:\s*\d+(?:\.\d+)?|#\d+)\b/i.test(text)) return true;

    // 5. Big-O complexity notation (e.g. O(1), O(N))
    if (/\bo\([1nlog\s]+\)/i.test(text)) return true;

    // 6. Action verbs with numerical outcomes (past or present participle: reducing by 65%, eliminating 100%, accelerating under 40ms)
    if (/\b(?:reduc(?:ed?|ing)|increas(?:ed?|ing)|improv(?:ed?|ing)|optimiz(?:ed?|ing)|boost(?:ed?|ing)|accelerat(?:ed?|ing)|cut(?:ting)?|scal(?:ed?|ing)|eliminat(?:ed?|ing)|sav(?:ed?|ing)|handl(?:ed?|ing)|process(?:ed?|ing)|serv(?:ed?|ing)|speed(?:ing)?\s*up|streamlin(?:ed?|ing))\b[^\n\.\;]*?\b\d+/i.test(text)) return true;

    // 7. Numerical thresholds and bounds
    if (/\b(?:under|less than|more than|over|by)\s+\d+(?:\.\d+)?\s*(?:ms|%|s|seconds?|min|minutes?|hours?|x)\b/i.test(text)) return true;

    return false;
};

const BULLET_PREFIX_REGEX = /^[●•▪▫◦✦❖–—\-*○⁃▶►\u25cf\u2022\u25aa\u25ab\u25e6\u2726\u2756\u2013\u2014\u25cb\u2043\u2219\u25b6\u25ba]/;
const NUMBERED_PREFIX_REGEX = /^\(?\d+[\.\)]\s*/;
const ACTION_VERBS_REGEX = /^(developed|built|designed|implemented|architected|scaled|optimized|created|engineered|led|spearheaded|refactored|integrated|mentored|contributed|solved|managed|automated|orchestrated|collaborated|conducted|established|reduced|improved|accelerated|eliminated|integrated|authored|achieved)\b/i;

export const isBulletLine = (line) => {
    if (!line) return false;
    const trimmed = line.trim();
    if (BULLET_PREFIX_REGEX.test(trimmed)) return true;
    if (NUMBERED_PREFIX_REGEX.test(trimmed)) return true;

    const cleaned = trimmed
        .replace(BULLET_PREFIX_REGEX, "")
        .replace(NUMBERED_PREFIX_REGEX, "")
        .trim();

    return ACTION_VERBS_REGEX.test(cleaned);
};

export const cleanBullet = (line) => {
    if (!line) return "";
    return line
        .replace(/^[●•▪▫◦✦❖–—\-*○⁃▶►\u25cf\u2022\u25aa\u25ab\u25e6\u2726\u2756\u2013\u2014\u25cb\u2043\u2219\u25b6\u25ba\s]+/, "")
        .replace(/^\(?\d+[\.\)]\s*/, "")
        .trim();
};

const extractCleanProjectName = (rawTitle) => {
    const cleaned = cleanBullet(rawTitle);
    // Split on em-dash, en-dash, pipe, or colon surrounded by spaces, or em-dash without spaces
    const parts = cleaned.split(/\s+[—–|:]\s+|\s*—\s*|\s*\|\s*/);
    return parts[0].trim();
};

const isProjectHeaderLine = (line, nextLine, prevLine) => {
    if (!line || isBulletLine(line)) return false;
    if (/^(tech stack|technologies|tools used):/i.test(line)) return false;
    if (/^(live demo|github|demo|link|http)/i.test(line)) return false;

    // Pattern like "CareerSignal — Event-Driven..." or "Algo-Vault | Spaced Repetition..."
    if (/\s+[—–|]\s+|\s*—\s*/.test(line)) return true;

    // Followed by links like Live Demo / GitHub
    if (nextLine && /live demo|github|http/i.test(nextLine)) return true;

    // Following a tech stack line or completed bullet group
    if (prevLine && /tech stack|technologies/i.test(prevLine)) return true;

    return false;
};

const segmentProjectLines = (lines) => {
    if (!lines?.length) return [];
    const segments = [];
    let currentLines = [];

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const nextLine = lines[i + 1];
        const prevLine = lines[i - 1];

        if (isProjectHeaderLine(line, nextLine, prevLine) && currentLines.length > 0) {
            segments.push(currentLines);
            currentLines = [line];
        } else {
            currentLines.push(line);
        }
    }

    if (currentLines.length) {
        segments.push(currentLines);
    }

    return segments;
};

const extractBulletsFromLines = (lines) => {
    const bullets = [];
    let currentBullet = "";

    for (const rawLine of lines) {
        const line = rawLine.trim();
        if (!line) continue;
        if (/^(tech stack|technologies|tools used):/i.test(line)) break;
        if (/^(live demo|github|demo|link|http)/i.test(line)) continue;

        if (isBulletLine(line)) {
            if (currentBullet) bullets.push(currentBullet.trim());
            currentBullet = cleanBullet(line);
        } else if (currentBullet) {
            currentBullet += " " + line;
        }
    }

    if (currentBullet) bullets.push(currentBullet.trim());
    return bullets;
};

const parseSingleProject = (lines) => {
    if (!lines?.length) return null;

    const bullets = extractBulletsFromLines(lines);
    const text = lines.join(" ");
    const hasDeployment = /docker|kubernetes|aws|vercel|render|ci\/cd|pipeline|production|deployed|live/i.test(text);

    return {
        name: extractCleanProjectName(lines[0]),
        rawTitle: lines[0],
        description: lines.slice(1).join(" ").slice(0, 1500),
        bullets: bullets.length ? bullets : [lines.slice(1).join(" ").slice(0, 500)],
        technologies: extractSkills(text),
        hasDeployment,
        hasMetrics: bullets.some(hasMeasurableMetric) || lines.some(hasMeasurableMetric),
    };
};

const parseProjects = (lines) => {
    if (!lines?.length) return [];
    const segments = segmentProjectLines(lines);
    return segments.map(parseSingleProject).filter(Boolean);
};

const parseProjectBlocks = (blocks) => {
    if (!blocks?.length) return [];
    const allLines = blocks.flat();
    return parseProjects(allLines);
};

const parseSingleExperience = (lines) => {
    if (!lines?.length) return null;

    const bullets = extractBulletsFromLines(lines);
    const text = lines.join(" ");
    const header = lines[0];

    // Try extracting Role and Company from header like "Technical Co-Head — E-Cell, UIT-RGPV 2023 – Present"
    const headerParts = header.split(/\s+[—–|]\s+|\s*—\s*/);
    const role = headerParts[0]?.trim() || header;
    const company = headerParts[1]?.trim() || (lines[1] && !isBulletLine(lines[1]) ? lines[1] : undefined);

    return {
        role,
        company,
        rawHeader: header,
        description: text.slice(0, 1500),
        bullets: bullets.length ? bullets : [lines.slice(1).join(" ").slice(0, 500)],
        skills: extractSkills(text),
        current: /present|current|ongoing/i.test(text),
        hasMetrics: bullets.some(hasMeasurableMetric) || lines.some(hasMeasurableMetric),
    };
};

const parseExperience = (lines) => {
    if (!lines?.length) return [];

    // Check if lines contain multiple experience entries
    const entries = [];
    let currentEntry = [];

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const isHeader = !isBulletLine(line) && (
            /\b(?:20\d{2}|19\d{2}|present|current)\b/i.test(line)
            || /\s+[—–|]\s+|\s*—\s*/.test(line)
        );

        if (isHeader && currentEntry.length > 0) {
            entries.push(currentEntry);
            currentEntry = [line];
        } else {
            currentEntry.push(line);
        }
    }

    if (currentEntry.length) entries.push(currentEntry);

    return entries.map(parseSingleExperience).filter(Boolean);
};

const parseExperienceBlocks = (blocks) => {
    if (!blocks?.length) return [];
    const allLines = blocks.flat();
    return parseExperience(allLines);
};

const parseAchievements = (lines) => {
    if (!lines?.length) return { list: [], dsaAchievements: "", hasDsaEvidence: false };

    const list = lines.filter(Boolean).map(cleanBullet).filter(Boolean);
    const text = list.join(" ");

    const dsaProblemMatch = text.match(/(?:solved\s+)?(\d+\+?)\s*(?:dsa\s+)?problems?/i);
    const leetCodeMatch = text.match(/leetcode\s*rating\s*:\s*(\d+)/i);
    const codolioMatch = text.match(/codolio\b[^\n\.\;]*?(?:c\s*score\s*(?:of\s*)?(\d+(?:\.\d+)?)|rank\s*#?(\d+))/i);

    const summaries = [];
    if (dsaProblemMatch) summaries.push(`${dsaProblemMatch[1]} DSA problems solved`);
    if (leetCodeMatch) summaries.push(`LeetCode rating ${leetCodeMatch[1]}`);
    if (codolioMatch) summaries.push(`Codolio verified`);

    return {
        list,
        dsaAchievements: summaries.length ? summaries.join(", ") : (list.find(l => /dsa|leetcode|codechef/i.test(l)) || ""),
        hasDsaEvidence: /dsa|leetcode|codechef|codeforces|codolio|problems solved/i.test(text),
    };
};

export const parseResumeText = (rawText) => {
    if (!rawText) {
        return {
            summary: "",
            skills: [],
            experience: [],
            projects: [],
            education: [],
            achievements: [],
            bullets: [],
            hasMetrics: false,
        };
    }

    const rawLines = rawText.split(/\r?\n/).map((line) => line.trim());
    const lines = rawLines.filter(Boolean);
    const sections = extractSections(lines);
    const sectionBlocks = extractSectionBlocks(rawLines);

    const experience = sectionBlocks.experience?.length > 1
        ? parseExperienceBlocks(sectionBlocks.experience)
        : parseExperience(sections.experience);

    const projects = sectionBlocks.projects?.length > 1
        ? parseProjectBlocks(sectionBlocks.projects)
        : parseProjects(sections.projects);

    const achievementsData = parseAchievements(sections.achievements || []);

    const allBullets = [
        ...experience.flatMap((e) => e.bullets || []),
        ...projects.flatMap((p) => p.bullets || []),
    ].filter((b) => b && b.length > 15);

    // If projects or experience had metrics, or any bullet had metrics, or the overall rawText has metrics
    const hasAnyMetrics = allBullets.some(hasMeasurableMetric)
        || projects.some((p) => p.hasMetrics)
        || experience.some((e) => e.hasMetrics)
        || hasMeasurableMetric(rawText);

    const skills = extractSkills(rawText);

    return {
        summary: (sections.summary || lines.slice(0, 4)).join(" ").slice(0, 1000),
        skills,
        experience,
        projects,
        education: sections.education || [],
        achievements: achievementsData.list,
        dsaAchievements: achievementsData.dsaAchievements,
        hasDsaEvidence: achievementsData.hasDsaEvidence,
        bullets: allBullets,
        hasMetrics: hasAnyMetrics,
    };
};
