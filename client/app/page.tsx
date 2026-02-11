"use client";

import { useState, useEffect, useRef, useCallback, FormEvent } from "react";
import Image from "next/image";

// ============ DATA ============

const services = [
  {
    icon: "/icon-dev.svg",
    title: "Backend Development",
    text: "Building robust APIs and web services using C#/.NET, with expertise in CQRS, Clean Architecture, and SQL Server optimization.",
  },
  {
    icon: "/icon-design.svg",
    title: "Frontend Development",
    text: "Developing dynamic, responsive web applications with Angular, React, and TypeScript for seamless user experiences.",
  },
  {
    icon: "/icon-app.svg",
    title: "API Integration",
    text: "Integrating third-party APIs such as Hubstaff, Zoom, Paynamics, and SharePoint to extend application capabilities.",
  },
  {
    icon: "/icon-photo.svg",
    title: "Process Automation",
    text: "Automating workflows with Azure WebJobs, Functions, and CI/CD pipelines to improve efficiency and reduce manual effort.",
  },
];

const testimonials = [
  {
    avatar: "/avatar-1.png",
    name: "Your Name Here",
    text: "Share your experience working with Marc Kenneth. Your testimonial will appear here.",
  },
];

const clients = [
  "/daikin-logo.png",
  "/homeqube-logo.jpg",
  "/iscan-logo.png",
  "/advance-energy-logo.png",
  "/mundipharma-logo.jpg",
  "/kinetic-logo.png",
  "/magsaysay-careers-logo.png",
  "/chesslab-ae-logo.png",
  "/marius-logo.jpg",
  "/mr-geek-logo.png",
  "/rivtechcorp_cover-logo.jpg",
  "/xamun-ai-logo.png",
];

const education = [
  {
    title: "Bachelor of Science: Information Technology",
    year: "Jose Rizal University",
    address: "Philippines",
    text: "Completed a comprehensive IT program covering software development, database management, and systems analysis.",
  },
];

const certifications = [
  {
    title: "Exam 483: Programming in C#",
    issuer: "Microsoft",
    text: "Demonstrated proficiency in C# programming including managing program flow, creating types, and debugging applications.",
    url: "https://www.credly.com/badges/13902a49-5ee2-4694-96d6-f7b3d22bf884/public_url",
  },
  {
    title: "Azure Developer Associate",
    issuer: "Microsoft",
    text: "Certified in designing, building, testing, and maintaining cloud applications and services on Microsoft Azure.",
    url: "https://www.credly.com/badges/de57f472-20aa-42ed-af1a-23f25f9b4dfb",
  },
  {
    title: "Advanced C# Programming in .NET Core",
    issuer: "EDUCBA",
    text: "Advanced training in .NET Core development covering modern C# features, async programming, and enterprise patterns.",
    url: "https://www.coursera.org/account/accomplishments/verify/8ELB2A7JAYB3",
  },
  {
    title: "Product Management",
    issuer: "IBM",
    text: "Certification covering product lifecycle management, stakeholder communication, and strategic product planning.",
    url: "https://www.coursera.org/account/accomplishments/verify/LOOSMZOI690C",
  },
  {
    title: "EF SET: C1 Advanced",
    issuer: "EF Standard English Test",
    text: "Achieved C1 Advanced level proficiency in English, demonstrating fluent and effective communication skills.",
    url: "https://cert.efset.org/en/pUaqtj",
  },
];

const experience = [
  {
    title: "Software Engineer — Kinetic Innovative Staffing",
    address: "Brisbane City, Queensland, Australia",
    year: "Sep 2023 — Present",
    text: "Automated attendance tracking with WebJobs pulling 100,000+ daily data points. Built a sessionization algorithm increasing time-tracking accuracy by 90% for 4,000+ users.",
  },
  {
    title: "Software Engineer — BlastAsia, Inc.",
    address: "Metro Manila, Philippines",
    year: "May 2019 — Sep 2023",
    text: "Delivered 17 applications across recruitment, healthcare, e-commerce, insurance, and asset management. Led code reviews, R&D initiatives, and deployed scalable apps with Azure App Service.",
  },
  {
    title: "Software Developer Intern — Mr. Geek Mobile Solution Inc.",
    address: "Metro Manila, Philippines",
    year: "Oct 2018 — Jan 2019",
    text: "Developed android mobile application using Android Studio (Java) and PHP 7 as backend service.",
  },
];

const skills = [
  { name: "C# / .NET", value: 95 },
  { name: "Angular / TypeScript", value: 90 },
  { name: "SQL Server / T-SQL", value: 90 },
  { name: "Azure Services", value: 85 },
  { name: "REST API Development", value: 95 },
];

const skillGroups = [
  {
    category: "Languages",
    icon: "code-slash-outline",
    items: ["C#", "TypeScript", "JavaScript", "SQL", "T-SQL", "PowerShell", "Go", "PHP", "RxJS", "JSON", "XML"],
  },
  {
    category: "Backend",
    icon: "server-outline",
    items: [".NET 5", ".NET Core 3.1", ".NET Core 2.1", "IdentityServer4", "NSwag", "REST API", "Webhook", "MediatR"],
  },
  {
    category: "Frontend",
    icon: "laptop-outline",
    items: ["Angular", "React.js", "Redux", "Bootstrap", "Metronic", "HTML/CSS"],
  },
  {
    category: "Database",
    icon: "layers-outline",
    items: ["SQL Server", "Azure SQL", "MySQL", "Cosmos DB", "SQLite", "Dapper", "EF Core"],
  },
  {
    category: "Cloud & DevOps",
    icon: "cloud-outline",
    items: ["Azure WebJobs", "Azure Functions", "Azure Blob Storage", "Azure Pipelines", "GitHub Actions", "Docker", "Jenkins", "IIS"],
  },
  {
    category: "Integrations",
    icon: "git-network-outline",
    items: ["Hubstaff", "Time Doctor", "Screenshot Monitor", "Paynamics", "Zoom", "SharePoint", "SendGrid", "Movider", "Google Auth", "Facebook Auth", "Telerivet"],
  },
  {
    category: "Libraries & Tools",
    icon: "construct-outline",
    items: ["Leaflet.js", "Plotly.js", "DrawFlow", "FullCalendar", "Pako.js", "ClosedXML", "MemoryCache", "Polly", "Swagger", "Postman", "DevToys"],
  },
  {
    category: "Architecture",
    icon: "git-merge-outline",
    items: ["CQRS", "Clean Architecture", "DDD", "MVC", "Repository Pattern", "Onion Architecture", "N-Tier", "SOLID", "Design Patterns"],
  },
  {
    category: "Workflow",
    icon: "people-outline",
    items: ["Agile / Scrum", "Kanban", "Git", "GitHub", "BitBucket", "Azure DevOps", "xUnit"],
  },
];

const projects = [
  { images: ["/kinetic-portal-img.png",
    "/kinetic-portal-img-2.png","/kinetic-portal-img-3.png","/kinetic-portal-img-4.png"
  ], title: "Kinetic Portal", category: "administrative", url: "https://portal.kineticstaff.com/", description: "This project focused on boosting HR and administrative efficiency. It introduced a unified platform that handled leave and overtime requests, internal job postings, and employee contracts. Key features included a resume format for daily applicants, a payroll schedule manager, and advanced activity reports. Built to streamline HR operations, the platform improved employee experience and workflow.\n\nKey Contribution:\n• Automated Late WebJobs to run every 30 minutes, improving attendance tracking and cutting absenteeism response time by 25%.\n• Built WebJobs to pull 100,000+ daily data points from APIs (Holiday, Screenshot Monitor, Time Doctor, Hubstaff), boosting data accuracy and reducing manual input.\n• Created a Booking Calendar with FullCalendar to automate orientation scheduling for 63,000+ candidates.\n• Developed a timesheet monitor for 4,000+ team members, improving accountability and reducing errors.\n• Supported 70+ internal users by quickly resolving app issues, ensuring smooth business operations.\n• Built a sessionization algorithm to reconstruct continuous sessions from raw Hubstaff logs — increasing time-tracking accuracy by 90% for over 4,000 users.\n• Redesigned and optimized complex SQL Server queries handling 9 million candidate records, implementing strategic indexing, query plan optimization, and stored procedure refactoring to enhance database performance and user experience.\n• Strengthened application security by implementing user role-based access control for API authorization, integrating JWT token validation for secure authentication, and utilizing parameterized queries with Dapper to eliminate SQL injection vulnerabilities.\n• Implemented AES-256 encryption to secure team members' salary data at rest, ensuring confidentiality and compliance with data protection standards.\n• Implemented materialized views as a database-level caching strategy to precompute and store query results, reducing response times and improving performance for read-intensive workloads." },
  { images: ["/xamun-ai-img.png","/xamun-ai-img-2.png"], title: "Xamun Dev Portal", category: "ai solutions", url: "https://www.xamun.ai/", description: "A full-code platform for startups and digital projects—faster and simpler than Low-Code.\n\nKey Contribution:\n• Wrote PowerShell scripts for Azure Pipelines to automate CI/CD, cut deployment time, and reduce errors.\n• Integrated workflows using the DrawFlow library to streamline process design.\n• Built a reusable Angular schematics library to speed up development and ensure UI consistency.\n• Deployed scalable web apps with Azure and Docker, boosting release speed and system stability.\n• Set up secure external logins with IdentityServer4, connecting Facebook, Google, and AzureAD to simplify user access.\n• Built an Azure Services Class Library with Polly for resilient communication between services, incorporating retry logic and a circuit breaker pattern to enhance fault tolerance." },
  { images: ["/rivington-1.jpg","/rivington-2.jpg","/rivington-3.jpg"], title: "Rivington (Collections Application, AMIG Application, Centauri Application)", category: "insurance", url: "#", description: "Rivington Partners is a managing general agency that focuses on writing specialty property & casualty insurance and placing risk with sponsoring insurance carriers.\n\nKey Contribution:\n• Built a Reports API using ClosedXML and LargeXLSX .NET to handle payments, premiums, cancellations, and endorsements.\n• Led development of a Claims feature to import external data into the RivTech Star App, improving data integration.\n• Developed and managed Azure Functions to automate daily and monthly financial transaction reports, enabling timely, accurate insights and supporting high-volume payment processing workflows.\n• Built and tested complex reporting logic for premium tracking—covering inforce, written, earned, and unearned—ensuring compliance and accuracy.\n• Led backend improvements focused on performance, research, and new development efforts.\n• Developed dynamic, state-based forms tailored for U.S. users to improve data input and UX.\n• Upgraded the backend from .NET Core 2.1 to .NET 5.0, modernizing the stack and boosting performance.\n• Migrated Azure Functions to .NET 5.0 Isolated Process to improve scalability and cloud performance." },
  { images: ["/daikin-ecommerce-1.jpg"], title: "Daikin E-commerce", category: "e-commerce", url: "#", description: "Daikin Philippines runs an online store for air purifiers, enabling customers to browse and purchase products seamlessly.\n\nKey Contribution:\n• Implemented end-to-end payment integration with Paynamics for enabling secure transaction processing and handling card payment flows.\n• Built webhooks, APIs, and blob storage systems with SQL scripts and social login via Facebook and Google.\n• Designed and implemented Split Pay functionality with Paynamics, enabling automated payment segregation to multiple stakeholders (merchants, logistics, digital platforms) during a single customer transaction, with convenience fees configured per payment channel — e.g., Credit/Debit Cards (4% + ₱20), Online Bank Transfer/E-Wallets (2.5%), Over-the-Counter (₱25), and Installments (0.60% for credit cards, 2.50% for non-credit)." },
  { images: ["/daikin-virtualshowroom-1.jpg","/daikin-virtualshowroom-2.jpg"], title: "Daikin Virtual Showroom", category: "e-commerce", url: "#", description: "Daikin's Virtual Showroom helps customers explore products without visiting a physical store, providing an immersive online browsing experience.\n\nKey Contribution:\n• Boosted API performance for the Virtual Showroom through focused optimization.\n• Developed CRUD APIs and service classes to manage data more efficiently.\n• Designed the ERD for the Virtual Showroom database to support structured data storage and fast retrieval." },
  { images: ["/iscan-1.jpg","/iscan-2.jpg"], title: "iScan Diagnostic Center", category: "healthcare", url: "#", description: "iScan offers fast, reliable medical imaging services, powered by a skilled and patient-focused team.\n\nKey Contribution:\n• Built backend workflows for release and notification modules, improving control and speeding up communication.\n• Developed and maintained an Azure Function to automate alerts, boosting response time and cutting manual work.\n• Set up SMTP for email alerts and integrated Telerivet for SMS, ensuring reliable, multi-channel messaging." },
  { images: ["/mundipharma-1.jpg","/mundipharma-2.jpg"], title: "My Scorecard (Mundipharma)", category: "healthcare", url: "#", description: "A web app that processes sales data and calculates employee incentives. Exports payout summaries and reports directly to Excel.\n\nKey Contribution:\n• Led web development using .NET Core, React.js, and Redux.\n• Deployed the app using Jenkins and IIS.\n• Overhauled report generation workflows to improve speed and clarity." },
  { images: ["/magsaysay-1.jpg"], title: "Magsaysay Online Careers", category: "recruitment", url: "#", description: "A mobile and web-based HR platform for end-to-end recruitment. Built for ease of use and seamless hiring.\n\nKey Contribution:\n• Integrated Zoom API to streamline meetings and boost communication.\n• Debugged the codebase thoroughly to resolve issues fast and keep the app reliable." },
  { images: ["/marius-1.jpg","/marius-2.jpg"], title: "Marius", category: "insurance", url: "#", description: "Marius is a cyber-insurance platform for clients, underwriters, and system admins. It manages policies from application to endorsement, renewal, cancellation, and claims.\n\nKey Contribution:\n• Built secure upload/download features using Azure Blob Storage to manage files at scale.\n• Developed modules for quote binding and bind requests, speeding up policy handling and boosting efficiency.\n• Developed modules for payments, endorsements, and cancellations to ensure accurate transactions and improve user satisfaction." },
  { images: ["/tempest-1.jpg","/tempest-2.jpg"], title: "Tempest Asset Management", category: "administrative", url: "#", description: "This system lets school staff track repairs from start to finish—from part usage to student restoration time. Accessible from any browser, anytime, on any device.\n\nKey Contribution:\n• Built reusable components and services across API, backend, and frontend.\n• Improved and added features to the web app for the TIG user base." },
  { images: ["/catalyst-1.jpg","/catalyst-2.jpg"], title: "Catalyst", category: "others", url: "#", description: "A code generator tool that helps build high-quality software faster.\n\nKey Contribution:\n• Built a full client app from scratch using Angular 9.\n• Set up and deployed the Angular schematic project as npm package.\n• Integrated Azure services including Queue, Function, Table, Cosmos DB, and Storage." },
  { images: ["/homeqube-1.jpg"], title: "HomeQube", category: "ai solutions", url: "https://www.homeqube.com/", description: "Homeqube builds performance systems to tackle global housing shortages. It champions decentralization, open access, and breaking down barriers in knowledge, production, and supply.\n\nKey Contribution:\n• Researched and applied tools like Plotly.js, Leaflet.js, and Pako.js to meet stakeholder needs.\n• Built reusable components and services for both front-end and back-end development." },
];

const blogPosts = [
  {
    img: "/blog-1.jpg",
    title: "Coming Soon",
    category: "Blog",
    date: "2025",
    text: "Stay tuned — blog posts about software development, tech insights, and lessons learned will be shared here soon.",
  },
];

const chessGames = [
  {
    white: "DrMkcTheHandSome",
    whiteElo: 2656,
    whiteTitle: "",
    whiteCountry: "PH",
    whiteImg: "https://images.chesscomfiles.com/uploads/v1/user/30529124.f8db1ea0.50x50o.89fc2cc1a0fe.jpeg",
    black: "Lestofante90",
    blackElo: 2829,
    blackTitle: "GM",
    blackCountry: "IT",
    blackImg: "https://images.chesscomfiles.com/uploads/v1/user/27728592.a32ae2c7.50x50o.d5700c0c4af8.jpeg",
    result: "1-0",
    opening: "Indian Game",
    date: "Jan 22, 2025",
    timeControl: "3 min",
    termination: "Won by resignation",
    link: "https://www.chess.com/analysis/game/live/131252971603/analysis",
    pinned: true,
    pinLabel: "Win vs Italian GM Danyyil Dvirnyy",
  },
      {
    white: "DrMkcTheHandSome",
    whiteElo: 2672,
    whiteTitle: "",
    whiteCountry: "PH",
    whiteImg: "https://images.chesscomfiles.com/uploads/v1/user/30529124.f8db1ea0.50x50o.89fc2cc1a0fe.jpeg",
    black: "TRadjabov",
    blackElo: 3055,
    blackTitle: "GM",
    blackCountry: "AZ",
    blackImg: "https://images.chesscomfiles.com/uploads/v1/user/18202610.a304129e.50x50o.09bc9c3e8aa7.jpeg",
    result: "0-1",
    opening: "East Indian / London System",
    date: "Aug 2, 2024",
    timeControl: "3 min",
    termination: "TRadjabov won by resignation",
    link: "https://www.chess.com/analysis/game/live/116358617561/analysis",
    pinned: true,
    pinLabel: "vs Super GM Teimour Radjabov (3055 Elo)",
  },
  {
    white: "NigelShort",
    whiteElo: 2873,
    whiteTitle: "GM",
    whiteCountry: "GB",
    whiteImg: "https://images.chesscomfiles.com/uploads/v1/user/12089276.726643af.50x50o.8057016c8698.jpg",
    black: "DrMkcTheHandSome",
    blackElo: 2552,
    blackTitle: "",
    blackCountry: "PH",
    blackImg: "https://images.chesscomfiles.com/uploads/v1/user/30529124.f8db1ea0.50x50o.89fc2cc1a0fe.jpeg",
    result: "1-0",
    opening: "Scandinavian Defense",
    date: "Dec 18, 2024",
    timeControl: "3 min",
    termination: "NigelShort won by resignation",
    link: "https://www.chess.com/analysis/game/live/128260136447/analysis",
    pinned: true,
    pinLabel: "vs Legendary Nigel Short",
  },
  {
    white: "DrMkcTheHandSome",
    whiteElo: 2589,
    whiteTitle: "",
    whiteCountry: "PH",
    whiteImg: "https://images.chesscomfiles.com/uploads/v1/user/30529124.f8db1ea0.50x50o.89fc2cc1a0fe.jpeg",
    black: "FaustinoOro",
    blackElo: 3121,
    blackTitle: "IM",
    blackCountry: "AR",
    blackImg: "https://images.chesscomfiles.com/uploads/v1/user/80994690.b4cf9a71.50x50o.d54f67f28ec0.jpg",
    result: "0-1",
    opening: "Van't Kruijs Opening",
    date: "Aug 7, 2025",
    timeControl: "3 min",
    termination: "FaustinoOro won by checkmate",
    link: "https://www.chess.com/analysis/game/live/141601772714/analysis",
    pinned: true,
    pinLabel: "vs Prodigy Faustino Oro (3121 Elo)",
  },
  {
    white: "GM_dmitrij",
    whiteElo: 3000,
    whiteTitle: "GM",
    whiteCountry: "DE",
    whiteImg: "https://images.chesscomfiles.com/uploads/v1/user/27181148.59e377d4.50x50o.29f1c14d472a.jpeg",
    black: "DrMkcTheHandSome",
    blackElo: 2668,
    blackTitle: "",
    blackCountry: "PH",
    blackImg: "https://images.chesscomfiles.com/uploads/v1/user/30529124.f8db1ea0.50x50o.89fc2cc1a0fe.jpeg",
    result: "1-0",
    opening: "Scandinavian Defense",
    date: "Jan 22, 2025",
    timeControl: "3 min",
    termination: "GM_dmitrij won by resignation",
    link: "https://www.chess.com/analysis/game/live/131304631235/analysis",
    pinned: true,
    pinLabel: "vs Super GM Dmitrij Kollars (3000 Elo)",
  },
  {
    white: "DrMkcTheHandSome",
    whiteElo: 2529,
    whiteTitle: "",
    whiteCountry: "PH",
    whiteImg: "https://images.chesscomfiles.com/uploads/v1/user/30529124.f8db1ea0.50x50o.89fc2cc1a0fe.jpeg",
    black: "ShrookWafa",
    blackElo: 2528,
    blackTitle: "WGM",
    blackCountry: "EG",
    blackImg: "",
    result: "1-0",
    opening: "English Opening",
    date: "Dec 11, 2025",
    timeControl: "3 min",
    termination: "Won by checkmate",
    link: "https://www.chess.com/analysis/game/live/146589984330/analysis",
    pinned: false,
    pinLabel: "",
  },
  {
    white: "DrMkcTheHandSome",
    whiteElo: 2606,
    whiteTitle: "",
    whiteCountry: "PH",
    whiteImg: "https://images.chesscomfiles.com/uploads/v1/user/30529124.f8db1ea0.50x50o.89fc2cc1a0fe.jpeg",
    black: "Akshayraj_Kore",
    blackElo: 2729,
    blackTitle: "GM",
    blackCountry: "US",
    blackImg: "https://images.chesscomfiles.com/uploads/v1/user/6179690.a3b2c80b.50x50o.9bded12a99f0.png",
    result: "1-0",
    opening: "English Opening",
    date: "Nov 18, 2025",
    timeControl: "3 min",
    termination: "Won by resignation",
    link: "https://www.chess.com/analysis/game/live/145643480342/analysis",
    pinned: false,
    pinLabel: "",
  },
  {
    white: "DrMkcTheHandSome",
    whiteElo: 2677,
    whiteTitle: "",
    whiteCountry: "PH",
    whiteImg: "https://images.chesscomfiles.com/uploads/v1/user/30529124.f8db1ea0.50x50o.89fc2cc1a0fe.jpeg",
    black: "Hongjin",
    blackElo: 2754,
    blackTitle: "IM",
    blackCountry: "KR",
    blackImg: "https://images.chesscomfiles.com/uploads/v1/user/52951788.c76c8bf7.50x50o.55cd6040abcb.png",
    result: "1-0",
    opening: "Sicilian Defense",
    date: "Sep 2, 2025",
    timeControl: "3 min",
    termination: "Won by resignation",
    link: "https://www.chess.com/analysis/game/live/142635706398/analysis?move=70",
    pinned: false,
    pinLabel: "",
  },
  {
    white: "DrMkcTheHandSome",
    whiteElo: 2682,
    whiteTitle: "",
    whiteCountry: "PH",
    whiteImg: "https://images.chesscomfiles.com/uploads/v1/user/30529124.f8db1ea0.50x50o.89fc2cc1a0fe.jpeg",
    black: "TheCount",
    blackElo: 2660,
    blackTitle: "GM",
    blackCountry: "US",
    blackImg: "https://images.chesscomfiles.com/uploads/v1/user/6204387.76703bbd.50x50o.2dc344ab4ed6.jpg",
    result: "1-0",
    opening: "Alapin Sicilian",
    date: "Aug 26, 2025",
    timeControl: "3 min",
    termination: "Won on time",
    link: "https://www.chess.com/analysis/game/live/142363070494/analysis",
    pinned: false,
    pinLabel: "",
  },
  {
    white: "DrMkcTheHandSome",
    whiteElo: 2679,
    whiteTitle: "",
    whiteCountry: "PH",
    whiteImg: "https://images.chesscomfiles.com/uploads/v1/user/30529124.f8db1ea0.50x50o.89fc2cc1a0fe.jpeg",
    black: "StrategySensei007",
    blackElo: 2730,
    blackTitle: "GM",
    blackCountry: "BG",
    blackImg: "https://images.chesscomfiles.com/uploads/v1/user/5979666.d5a77311.50x50o.8da5d6d4f9b0.jpg",
    result: "1-0",
    opening: "Modern Defense",
    date: "Aug 26, 2025",
    timeControl: "3 min",
    termination: "Won by resignation",
    link: "https://www.chess.com/analysis/game/live/142362212080/analysis",
    pinned: false,
    pinLabel: "",
  },
  {
    white: "DrMkcTheHandSome",
    whiteElo: 2675,
    whiteTitle: "",
    whiteCountry: "PH",
    whiteImg: "https://images.chesscomfiles.com/uploads/v1/user/30529124.f8db1ea0.50x50o.89fc2cc1a0fe.jpeg",
    black: "krsolomac",
    blackElo: 2644,
    blackTitle: "IM",
    blackCountry: "BA",
    blackImg: "https://images.chesscomfiles.com/uploads/v1/user/11931378.cdc5997e.50x50o.00542293b8db.jpeg",
    result: "1-0",
    opening: "Sicilian Defense",
    date: "Aug 26, 2025",
    timeControl: "3 min",
    termination: "Won by resignation",
    link: "https://www.chess.com/analysis/game/live/142359477492/analysis",
    pinned: false,
    pinLabel: "",
  },
  {
    white: "DrMkcTheHandSome",
    whiteElo: 2666,
    whiteTitle: "",
    whiteCountry: "PH",
    whiteImg: "https://images.chesscomfiles.com/uploads/v1/user/30529124.f8db1ea0.50x50o.89fc2cc1a0fe.jpeg",
    black: "SecretGM",
    blackElo: 2710,
    blackTitle: "GM",
    blackCountry: "US",
    blackImg: "https://images.chesscomfiles.com/uploads/v1/user/6265586.1a732832.50x50o.79e98762c407.jpeg",
    result: "1-0",
    opening: "Nimzo-Indian Defense",
    date: "Aug 26, 2025",
    timeControl: "3 min",
    termination: "Won by checkmate",
    link: "https://www.chess.com/analysis/game/live/142351821154/analysis",
    pinned: false,
    pinLabel: "",
  },
  {
    white: "DrMkcTheHandSome",
    whiteElo: 2668,
    whiteTitle: "",
    whiteCountry: "PH",
    whiteImg: "https://images.chesscomfiles.com/uploads/v1/user/30529124.f8db1ea0.50x50o.89fc2cc1a0fe.jpeg",
    black: "blueshark23",
    blackElo: 2632,
    blackTitle: "GM",
    blackCountry: "HU",
    blackImg: "",
    result: "1-0",
    opening: "Sicilian Defense",
    date: "Aug 13, 2025",
    timeControl: "3 min",
    termination: "Won on time",
    link: "https://www.chess.com/analysis/game/live/141840314364/analysis",
    pinned: false,
    pinLabel: "",
  },
  {
    white: "VSanduleac",
    whiteElo: 2672,
    whiteTitle: "GM",
    whiteCountry: "MD",
    whiteImg: "https://images.chesscomfiles.com/uploads/v1/user/43935916.d7ab5db2.50x50o.e846c30c1581.jpeg",
    black: "DrMkcTheHandSome",
    blackElo: 2650,
    blackTitle: "",
    blackCountry: "PH",
    blackImg: "https://images.chesscomfiles.com/uploads/v1/user/30529124.f8db1ea0.50x50o.89fc2cc1a0fe.jpeg",
    result: "0-1",
    opening: "Caro-Kann Defense",
    date: "Aug 13, 2025",
    timeControl: "3 min",
    termination: "Won by resignation",
    link: "https://www.chess.com/analysis/game/live/141829214754/analysis",
    pinned: false,
    pinLabel: "",
  },
  {
    white: "DrMkcTheHandSome",
    whiteElo: 2576,
    whiteTitle: "",
    whiteCountry: "PH",
    whiteImg: "https://images.chesscomfiles.com/uploads/v1/user/30529124.f8db1ea0.50x50o.89fc2cc1a0fe.jpeg",
    black: "gorato",
    blackElo: 2562,
    blackTitle: "GM",
    blackCountry: "RS",
    blackImg: "",
    result: "1-0",
    opening: "Sicilian Defense",
    date: "Jul 31, 2025",
    timeControl: "3 min",
    termination: "Won by resignation",
    link: "https://www.chess.com/analysis/game/live/141333519806/analysis",
    pinned: false,
    pinLabel: "",
  },
  {
    white: "SchroedingersTiger",
    whiteElo: 2695,
    whiteTitle: "GM",
    whiteCountry: "DE",
    whiteImg: "https://images.chesscomfiles.com/uploads/v1/user/20001882.15a29b43.50x50o.0464bc3b3b68.jpg",
    black: "DrMkcTheHandSome",
    blackElo: 2636,
    blackTitle: "",
    blackCountry: "PH",
    blackImg: "https://images.chesscomfiles.com/uploads/v1/user/30529124.f8db1ea0.50x50o.89fc2cc1a0fe.jpeg",
    result: "0-1",
    opening: "Scandinavian Defense",
    date: "Feb 18, 2025",
    timeControl: "3 min",
    termination: "Won by resignation",
    link: "https://www.chess.com/analysis/game/live/123012836344/analysis",
    pinned: false,
    pinLabel: "",
  },
  {
    white: "Ron_Weasley_Chess",
    whiteElo: 2686,
    whiteTitle: "FM",
    whiteCountry: "IL",
    whiteImg: "",
    black: "DrMkcTheHandSome",
    blackElo: 2616,
    blackTitle: "",
    blackCountry: "PH",
    blackImg: "https://images.chesscomfiles.com/uploads/v1/user/30529124.f8db1ea0.50x50o.89fc2cc1a0fe.jpeg",
    result: "0-1",
    opening: "Réti Opening",
    date: "Feb 18, 2025",
    timeControl: "3 min",
    termination: "Won by checkmate",
    link: "https://www.chess.com/analysis/game/live/123012400208/analysis",
    pinned: false,
    pinLabel: "",
  },
  {
    white: "gmjoey1",
    whiteElo: 2708,
    whiteTitle: "GM",
    whiteCountry: "PH",
    whiteImg: "https://images.chesscomfiles.com/uploads/v1/user/2406471.35bf5585.50x50o.e9e94ee09965.jpg",
    black: "DrMkcTheHandSome",
    blackElo: 2664,
    blackTitle: "",
    blackCountry: "PH",
    blackImg: "https://images.chesscomfiles.com/uploads/v1/user/30529124.f8db1ea0.50x50o.89fc2cc1a0fe.jpeg",
    result: "0-1",
    opening: "Caro-Kann Defense",
    date: "Feb 3, 2025",
    timeControl: "3 min",
    termination: "Won on time",
    link: "https://www.chess.com/analysis/game/live/132319867025/analysis",
    pinned: false,
    pinLabel: "",
  },
  {
    white: "DrMkcTheHandSome",
    whiteElo: 2561,
    whiteTitle: "",
    whiteCountry: "PH",
    whiteImg: "https://images.chesscomfiles.com/uploads/v1/user/30529124.f8db1ea0.50x50o.89fc2cc1a0fe.jpeg",
    black: "Ginger_GM",
    blackElo: 2605,
    blackTitle: "GM",
    blackCountry: "GB",
    blackImg: "https://images.chesscomfiles.com/uploads/v1/user/13423970.d6fd8e2b.50x50o.35135199b0fa.jpg",
    result: "1-0",
    opening: "King's Indian Defense",
    date: "Dec 5, 2024",
    timeControl: "3 min",
    termination: "Won by resignation",
    link: "https://www.chess.com/analysis/game/live/127150814903/analysis",
    pinned: false,
    pinLabel: "",
  },
  {
    white: "DrMkcTheHandSome",
    whiteElo: 2594,
    whiteTitle: "",
    whiteCountry: "PH",
    whiteImg: "https://images.chesscomfiles.com/uploads/v1/user/30529124.f8db1ea0.50x50o.89fc2cc1a0fe.jpeg",
    black: "gmmitkov",
    blackElo: 2621,
    blackTitle: "GM",
    blackCountry: "US",
    blackImg: "https://images.chesscomfiles.com/uploads/v1/user/25494216.67aa8f86.50x50o.79c657162590.jpeg",
    result: "1-0",
    opening: "Ruy Lopez",
    date: "Sep 2, 2024",
    timeControl: "3 min",
    termination: "Won on time",
    link: "https://www.chess.com/analysis/game/live/118986566359/analysis",
    pinned: false,
    pinLabel: "",
  },
  {
    white: "ChristopherYoo",
    whiteElo: 3011,
    whiteTitle: "GM",
    whiteCountry: "TV",
    whiteImg: "",
    black: "DrMkcTheHandSome",
    blackElo: 2656,
    blackTitle: "",
    blackCountry: "PH",
    blackImg: "https://images.chesscomfiles.com/uploads/v1/user/30529124.f8db1ea0.50x50o.89fc2cc1a0fe.jpeg",
    result: "1-0",
    opening: "King's Indian Attack",
    date: "Jul 31, 2024",
    timeControl: "3 min",
    termination: "ChristopherYoo won by resignation",
    link: "https://www.chess.com/analysis/game/live/116190049329/analysis?move=0",
    pinned: true,
    pinLabel: "vs GM Christopher Yoo (3011 Elo)",
  },
  {
    white: "DrMkcTheHandSome",
    whiteElo: 2653,
    whiteTitle: "",
    whiteCountry: "PH",
    whiteImg: "https://images.chesscomfiles.com/uploads/v1/user/30529124.f8db1ea0.50x50o.89fc2cc1a0fe.jpeg",
    black: "RichardBitoon",
    blackElo: 2637,
    blackTitle: "GM",
    blackCountry: "PH",
    blackImg: "https://images.chesscomfiles.com/uploads/v1/user/2024982.6d370c0b.50x50o.25c4ffd46e4d.jpg",
    result: "1-0",
    opening: "Sicilian Defense",
    date: "Aug 1, 2024",
    timeControl: "3 min",
    termination: "Won by resignation",
    link: "https://www.chess.com/analysis/game/live/116269814789/analysis",
    pinned: false,
    pinLabel: "",
  },
  {
    white: "DrMkcTheHandSome",
    whiteElo: 2676,
    whiteTitle: "",
    whiteCountry: "PH",
    whiteImg: "https://images.chesscomfiles.com/uploads/v1/user/30529124.f8db1ea0.50x50o.89fc2cc1a0fe.jpeg",
    black: "Mastroskaki",
    blackElo: 2763,
    blackTitle: "GM",
    blackCountry: "GR",
    blackImg: "https://images.chesscomfiles.com/uploads/v1/user/61789490.4308c692.50x50o.3674eac708ff.webp",
    result: "1-0",
    opening: "Caro-Kann Defense",
    date: "Aug 1, 2024",
    timeControl: "3 min",
    termination: "Won by resignation",
    link: "https://www.chess.com/analysis/game/live/116256052285/analysis",
    pinned: false,
    pinLabel: "",
  },
];

const CHESS_PAGE_SIZE = 10;

const filterCategories = ["All", "Administrative", "E-commerce", "Healthcare", "Recruitment", "Insurance", "AI Solutions","others"];
const navPages = ["About", "Resume", "Portfolio", "Blog", "Contact"];

// ============ COMPONENT ============

export default function Home() {
  const [activePage, setActivePage] = useState("about");
  const [sidebarActive, setSidebarActive] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");
  const [selectOpen, setSelectOpen] = useState(false);
  const [selectValue, setSelectValue] = useState("Select category");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState(testimonials[0]);
  const [formValid, setFormValid] = useState(false);
  const [imagePopup, setImagePopup] = useState<string | null>(null);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [galleryTitle, setGalleryTitle] = useState("");
  const [galleryUrl, setGalleryUrl] = useState("");
  const [galleryDescription, setGalleryDescription] = useState("");
  const [marqueePaused, setMarqueePaused] = useState(false);
  const [chessPage, setChessPage] = useState(1);
  const marqueeRef = useRef<HTMLUListElement>(null);
  const scrollPosRef = useRef(0);
  const isDraggingRef = useRef(false);
  const dragStartXRef = useRef(0);
  const dragStartScrollRef = useRef(0);

  useEffect(() => {
    const marquee = marqueeRef.current;
    if (!marquee) return;

    let animationId: number;
    const speed = 0.5;

    const step = () => {
      if (!marqueePaused && !isDraggingRef.current) {
        scrollPosRef.current += speed;
        const halfWidth = marquee.scrollWidth / 2;
        if (scrollPosRef.current >= halfWidth) {
          scrollPosRef.current = 0;
        }
        if (scrollPosRef.current < 0) {
          scrollPosRef.current = halfWidth;
        }
        marquee.style.transform = `translateX(-${scrollPosRef.current}px)`;
      }
      animationId = requestAnimationFrame(step);
    };

    animationId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animationId);
  }, [marqueePaused]);

  const handleMarqueePointerDown = useCallback((e: React.PointerEvent) => {
    isDraggingRef.current = true;
    dragStartXRef.current = e.clientX;
    dragStartScrollRef.current = scrollPosRef.current;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }, []);

  const handleMarqueePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDraggingRef.current || !marqueeRef.current) return;
    const delta = dragStartXRef.current - e.clientX;
    let newPos = dragStartScrollRef.current + delta;
    const halfWidth = marqueeRef.current.scrollWidth / 2;
    if (newPos >= halfWidth) newPos -= halfWidth;
    if (newPos < 0) newPos += halfWidth;
    scrollPosRef.current = newPos;
    marqueeRef.current.style.transform = `translateX(-${newPos}px)`;
  }, []);

  const handleMarqueePointerUp = useCallback(() => {
    isDraggingRef.current = false;
  }, []);

  const handleNavClick = (page: string) => {
    setActivePage(page.toLowerCase());
    window.scrollTo(0, 0);
  };

  const handleFilter = (category: string) => {
    setActiveFilter(category.toLowerCase());
  };

  const handleSelectItem = (category: string) => {
    setSelectValue(category);
    setSelectOpen(false);
    setActiveFilter(category.toLowerCase());
  };

  const openModal = (testimonial: (typeof testimonials)[0]) => {
    setModalData(testimonial);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  const handleFormChange = (e: FormEvent<HTMLFormElement>) => {
    const form = e.currentTarget;
    setFormValid(form.checkValidity());
  };

  const isProjectVisible = (category: string) => {
    return activeFilter === "all" || activeFilter === category;
  };

  const openGallery = (project: (typeof projects)[0], startIndex = 0) => {
    setGalleryImages(project.images);
    setGalleryIndex(startIndex);
    setGalleryTitle(project.title);
    setGalleryUrl(project.url);
    setGalleryDescription(project.description);
    setGalleryOpen(true);
  };

  const closeGallery = () => {
    setGalleryOpen(false);
  };

  const galleryPrev = () => {
    setGalleryIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
  };

  const galleryNext = () => {
    setGalleryIndex((prev) => (prev + 1) % galleryImages.length);
  };

  // Chess helpers
  const countryFlagUrl = (code: string) =>
    `https://flagcdn.com/20x15/${code.toLowerCase()}.png`;

  const isMyWin = (game: (typeof chessGames)[0]) => {
    const me = "DrMkcTheHandSome";
    if (game.result === "1-0" && game.white === me) return true;
    if (game.result === "0-1" && game.black === me) return true;
    return false;
  };

  const isMyLoss = (game: (typeof chessGames)[0]) => {
    const me = "DrMkcTheHandSome";
    if (game.result === "1-0" && game.black === me) return true;
    if (game.result === "0-1" && game.white === me) return true;
    return false;
  };

  const pinnedGames = chessGames.filter((g) => g.pinned);
  const unpinnedGames = chessGames.filter((g) => !g.pinned).sort((a, b) => {
    const me = "DrMkcTheHandSome";
    const aWin = (a.result === "1-0" && a.white === me) || (a.result === "0-1" && a.black === me);
    const bWin = (b.result === "1-0" && b.white === me) || (b.result === "0-1" && b.black === me);
    // Wins first
    if (aWin && !bWin) return -1;
    if (!aWin && bWin) return 1;
    // Within same group, sort by opponent rating desc
    const aOppElo = a.white === me ? a.blackElo : a.whiteElo;
    const bOppElo = b.white === me ? b.blackElo : b.whiteElo;
    return bOppElo - aOppElo;
  });
  const chessTotalPages = Math.ceil(unpinnedGames.length / CHESS_PAGE_SIZE);
  const paginatedGames = unpinnedGames.slice(
    (chessPage - 1) * CHESS_PAGE_SIZE,
    chessPage * CHESS_PAGE_SIZE
  );

  return (
    <main>
      {/* ===== SIDEBAR ===== */}
      <aside className={`sidebar ${sidebarActive ? "active" : ""}`}>
        <div className="sidebar-info">
          <figure className="avatar-box">
            <img src="/my-avatar.png" alt="Marc Kenneth Lomio" width={80} />
          </figure>

          <div className="info-content">
            <h1 className="name" title="Marc Kenneth Lomio">
              Marc Kenneth Lomio
            </h1>
            <p className="title">Software Engineer</p>
          </div>

          <button
            className="info_more-btn"
            onClick={() => setSidebarActive(!sidebarActive)}
          >
            <span>Show Contacts</span>
            <ion-icon name="chevron-down"></ion-icon>
          </button>
        </div>

        <div className="sidebar-info_more">
          <div className="separator"></div>

          <ul className="contacts-list">
            <li className="contact-item">
              <div className="icon-box">
                <ion-icon name="mail-outline"></ion-icon>
              </div>
              <div className="contact-info">
                <p className="contact-title">Email</p>
                <a href="mailto:marckenneth.lomio@gmail.com" className="contact-link">
                  marckenneth.lomio@gmail.com
                </a>
              </div>
            </li>

            <li className="contact-item">
              <div className="icon-box">
                <ion-icon name="location-outline"></ion-icon>
              </div>
              <div className="contact-info">
                <p className="contact-title">Location</p>
                <address>Antipolo, Rizal, Philippines</address>
              </div>
            </li>
          </ul>

          <div className="separator"></div>

          <ul className="social-list">
            <li className="social-item">
              <a href="https://www.linkedin.com/in/marc-kenneth-lomio" className="social-link" target="_blank" rel="noopener noreferrer">
                <ion-icon name="logo-linkedin"></ion-icon>
              </a>
            </li>
            <li className="social-item">
              <a href="https://github.com/marckenneth" className="social-link" target="_blank" rel="noopener noreferrer">
                <ion-icon name="logo-github"></ion-icon>
              </a>
            </li>
            <li className="social-item">
              <a href="mailto:marckenneth.lomio@gmail.com" className="social-link">
                <ion-icon name="mail-outline"></ion-icon>
              </a>
            </li>
          </ul>

          <div className="separator"></div>

          <div className="powered-by">
            <p className="powered-by-label">Powered by</p>
            <div className="powered-by-badges">
              <a href="https://nextjs.org" target="_blank" rel="noopener noreferrer" className="powered-by-badge">
                <svg viewBox="0 0 180 180" width="14" height="14" fill="currentColor">
                  <mask id="nextMask" maskUnits="userSpaceOnUse" x="0" y="0" width="180" height="180">
                    <circle cx="90" cy="90" r="90" fill="white"/>
                    <path d="M149.508 157.52L69.142 54H54v71.97h12.114V69.384l73.885 95.461a90.304 90.304 0 009.509-7.325z" fill="black"/>
                    <rect x="115" y="54" width="12" height="72" fill="black"/>
                  </mask>
                  <circle cx="90" cy="90" r="90" mask="url(#nextMask)"/>
                </svg>
                <span>Next.js</span>
              </a>
              <a href="https://expressjs.com" target="_blank" rel="noopener noreferrer" className="powered-by-badge">
                <svg viewBox="0 0 32 32" width="14" height="14" fill="currentColor">
                  <path d="M32 24.795c-1.164.296-1.884.013-2.53-.957l-4.594-6.356-.664-.872-5.42 7.257c-.577.77-1.227 1.065-2.25.77l7.066-9.428-6.589-8.59c.984-.135 1.744-.037 2.358.825l4.74 6.447 4.778-6.413c.578-.77 1.228-1.067 2.25-.77l-2.633 3.51-3.615 4.746c-.263.346-.227.692.039 1.028l6.06 8.048zm-17.027-8.77L8.092 6.196c1.185-.214 1.872-.035 2.468.822l4.18 5.927 4.258-5.926c.577-.77 1.227-1.065 2.25-.77l-6.12 8.194-6.573 8.757c-1.007.26-1.775.074-2.381-.795l4.8-6.38zM.005 15.846l.78-3.593c1.458-4.376 7.58-6.27 11.226-3.483 2.15 1.643 2.84 4.03 2.658 6.788H1.456c-.187 5.312 3.46 8.09 7.834 6.057 1.35-.629 2.2-1.823 2.6-3.254.194-.693.55-.813 1.2-.627-.78 3.19-2.94 5.1-6.293 5.372-3.978.323-7.443-1.906-8.357-5.437-.162-.627-.27-1.272-.434-1.823zm1.467-.64h12.4c-.116-4.237-2.786-7.02-6.24-7.02-3.688 0-6.044 2.882-6.16 7.02z"/>
                </svg>
                <span>Express.js</span>
              </a>
            </div>
          </div>
        </div>
      </aside>

      {/* ===== MAIN CONTENT ===== */}
      <div className="main-content">
        {/* NAVBAR */}
        <nav className="navbar">
          <ul className="navbar-list">
            {navPages.map((page) => (
              <li className="navbar-item" key={page}>
                <button
                  className={`navbar-link ${
                    activePage === page.toLowerCase() ? "active" : ""
                  }`}
                  onClick={() => handleNavClick(page)}
                >
                  {page}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* ===== ABOUT ===== */}
        <article
          className={`about ${activePage === "about" ? "active" : ""}`}
        >
          <header>
            <h2 className="h2 article-title">About me</h2>
          </header>

          <section className="about-text">
            <p>
              I&apos;m a Software Engineer with 6+ years of experience specializing
              in the Microsoft tech stack. I&apos;ve delivered 19 projects across
              development, upgrades, and support — spanning HR systems, insurance
              platforms, healthcare, e-commerce, and more.
            </p>
            <p>
              I&apos;m skilled in process automation, third-party API integration,
              and efficient code to solve complex problems. My focus
              is on boosting system performance, reliability, and scalability. I
              enjoy turning business requirements into well-architected solutions
              using C#/.NET, Angular, SQL Server, and Azure cloud services.
            </p>
          </section>

          {/* Service */}
          <section className="service">
            <h3 className="h3 service-title">What I&apos;m doing</h3>
            <ul className="service-list">
              {services.map((service) => (
                <li className="service-item" key={service.title}>
                  <div className="service-icon-box">
                    <img
                      src={service.icon}
                      alt={`${service.title} icon`}
                      width={40}
                    />
                  </div>
                  <div className="service-content-box">
                    <h4 className="h4 service-item-title">{service.title}</h4>
                    <p className="service-item-text">{service.text}</p>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          {/* Testimonials */}
          <section className="testimonials">
            <h3 className="h3 testimonials-title">Testimonials</h3>
            <ul className="testimonials-list has-scrollbar">
              {testimonials.map((t) => (
                <li className="testimonials-item" key={t.name}>
                  <div
                    className="content-card"
                    onClick={() => openModal(t)}
                  >
                    <figure className="testimonials-avatar-box">
                      <img src={t.avatar} alt={t.name} width={60} />
                    </figure>
                    <h4 className="h4 testimonials-item-title">{t.name}</h4>
                    <div className="testimonials-text">
                      <p>{t.text}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          {/* Testimonials Modal */}
          <div className={`modal-container ${modalOpen ? "active" : ""}`}>
            <div
              className={`overlay ${modalOpen ? "active" : ""}`}
              onClick={closeModal}
            ></div>
            <section className="testimonials-modal">
              <button className="modal-close-btn" onClick={closeModal}>
                <ion-icon name="close-outline"></ion-icon>
              </button>
              <div className="modal-img-wrapper">
                <figure className="modal-avatar-box">
                  <img
                    src={modalData.avatar}
                    alt={modalData.name}
                    width={80}
                  />
                </figure>
                <img src="/icon-quote.svg" alt="quote icon" />
              </div>
              <div className="modal-content">
                <h4 className="h3 modal-title">{modalData.name}</h4>
                <time dateTime="2021-06-14">14 June, 2021</time>
                <div>
                  <p>{modalData.text}</p>
                </div>
              </div>
            </section>
          </div>

          {/* Clients */}
          <section className="clients">
            <h3 className="h3 clients-title">Clients</h3>
            <div
              className="clients-marquee-wrapper"
              onMouseEnter={() => setMarqueePaused(true)}
              onMouseLeave={() => { setMarqueePaused(false); isDraggingRef.current = false; }}
              onTouchStart={() => setMarqueePaused(true)}
              onTouchEnd={() => { setTimeout(() => setMarqueePaused(false), 2000); }}
              onPointerDown={handleMarqueePointerDown}
              onPointerMove={handleMarqueePointerMove}
              onPointerUp={handleMarqueePointerUp}
              onPointerCancel={handleMarqueePointerUp}
            >
              <ul className="clients-marquee" ref={marqueeRef}>
                {[...clients, ...clients].map((logo, i) => (
                  <li className="clients-item" key={i}>
                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        setImagePopup(logo);
                      }}
                    >
                      <img src={logo} alt="client logo" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* Image Popup */}
          {imagePopup && (
            <div className="image-popup-overlay" onClick={() => setImagePopup(null)}>
              <div className="image-popup-content" onClick={(e) => e.stopPropagation()}>
                <button className="image-popup-close" onClick={() => setImagePopup(null)}>
                  <ion-icon name="close-outline"></ion-icon>
                </button>
                <img src={imagePopup} alt="Client logo" />
              </div>
            </div>
          )}

          {/* Hobbies */}
          <section className="hobbies">
            <h3 className="h3 hobbies-title">Hobbies & Interests</h3>

            <div className="hobby-card content-card">
              <div className="hobby-header">
                <span className="hobby-icon">♟️</span>
                <div>
                  <h4 className="h4">Chess</h4>
                  <p className="hobby-subtitle">Memorable Games</p>
                </div>
              </div>

              {/* Pinned Games */}
              {pinnedGames.length > 0 && (
                <div className="chess-pinned-section">
                  <div className="chess-pinned-label">
                    <ion-icon name="pin-outline"></ion-icon> Pinned
                  </div>
                  <ul className="chess-games-list">
                    {pinnedGames.map((game, i) => (
                      <li className={`chess-game-item chess-game-pinned ${isMyWin(game) ? "chess-border-win" : isMyLoss(game) ? "chess-border-loss" : ""}`} key={`pin-${i}`}>
                        {game.pinLabel && <span className="chess-pin-badge">{game.pinLabel}</span>}
                        <div className="chess-game-players">
                          <div className="chess-player">
                            <span className="chess-piece-icon chess-piece-white">♔</span>
                            <img src={countryFlagUrl(game.whiteCountry)} alt={game.whiteCountry} className="chess-flag" />
                            {game.whiteImg ? <img src={game.whiteImg} alt={game.white} className="chess-avatar" /> : <span className="chess-avatar chess-avatar-placeholder">♟</span>}
                            <span className="chess-player-name">
                              {game.whiteTitle && <span className="chess-title-badge">{game.whiteTitle}</span>}
                              {game.white}
                            </span>
                            <span className="chess-elo">({game.whiteElo})</span>
                          </div>
                          <span className="chess-vs">vs</span>
                          <div className="chess-player">
                            <span className="chess-piece-icon chess-piece-black">♚</span>
                            <img src={countryFlagUrl(game.blackCountry)} alt={game.blackCountry} className="chess-flag" />
                            {game.blackImg ? <img src={game.blackImg} alt={game.black} className="chess-avatar" /> : <span className="chess-avatar chess-avatar-placeholder">♟</span>}
                            <span className="chess-player-name">
                              {game.blackTitle && <span className="chess-title-badge">{game.blackTitle}</span>}
                              {game.black}
                            </span>
                            <span className="chess-elo">({game.blackElo})</span>
                          </div>
                        </div>
                        <div className="chess-game-meta">
                          <span className={`chess-result ${isMyWin(game) ? "chess-result-win" : isMyLoss(game) ? "chess-result-loss" : "chess-result-draw"}`}>
                            {game.result} {isMyWin(game) ? "Win" : isMyLoss(game) ? "Loss" : "Draw"}
                          </span>
                          <span>{game.opening}</span>
                          <span>{game.timeControl}</span>
                          <span>{game.date}</span>
                        </div>
                        <div className="chess-game-footer">
                          <span className="chess-termination">{game.termination}</span>
                          <a href={game.link} target="_blank" rel="noopener noreferrer" className="chess-view-btn">
                            <ion-icon name="open-outline"></ion-icon> View Game
                          </a>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* All Games */}
              <div className="chess-all-section">
                <div className="chess-section-label">All Games</div>
                <ul className="chess-games-list">
                  {paginatedGames.map((game, i) => (
                    <li className={`chess-game-item ${isMyWin(game) ? "chess-border-win" : isMyLoss(game) ? "chess-border-loss" : ""}`} key={`game-${i}`}>
                      <div className="chess-game-players">
                        <div className="chess-player">
                          <span className="chess-piece-icon chess-piece-white">♔</span>
                          <img src={countryFlagUrl(game.whiteCountry)} alt={game.whiteCountry} className="chess-flag" />
                          {game.whiteImg ? <img src={game.whiteImg} alt={game.white} className="chess-avatar" /> : <span className="chess-avatar chess-avatar-placeholder">♟</span>}
                          <span className="chess-player-name">
                            {game.whiteTitle && <span className="chess-title-badge">{game.whiteTitle}</span>}
                            {game.white}
                          </span>
                          <span className="chess-elo">({game.whiteElo})</span>
                        </div>
                        <span className="chess-vs">vs</span>
                        <div className="chess-player">
                          <span className="chess-piece-icon chess-piece-black">♚</span>
                          <img src={countryFlagUrl(game.blackCountry)} alt={game.blackCountry} className="chess-flag" />
                          {game.blackImg ? <img src={game.blackImg} alt={game.black} className="chess-avatar" /> : <span className="chess-avatar chess-avatar-placeholder">♟</span>}
                          <span className="chess-player-name">
                            {game.blackTitle && <span className="chess-title-badge">{game.blackTitle}</span>}
                            {game.black}
                          </span>
                          <span className="chess-elo">({game.blackElo})</span>
                        </div>
                      </div>
                      <div className="chess-game-meta">
                        <span className={`chess-result ${isMyWin(game) ? "chess-result-win" : isMyLoss(game) ? "chess-result-loss" : "chess-result-draw"}`}>
                          {game.result} {isMyWin(game) ? "Win" : isMyLoss(game) ? "Loss" : "Draw"}
                        </span>
                        <span>{game.opening}</span>
                        <span>{game.timeControl}</span>
                        <span>{game.date}</span>
                      </div>
                      <div className="chess-game-footer">
                        <span className="chess-termination">{game.termination}</span>
                        <a href={game.link} target="_blank" rel="noopener noreferrer" className="chess-view-btn">
                          <ion-icon name="open-outline"></ion-icon> View Game
                        </a>
                      </div>
                    </li>
                  ))}
                </ul>

                {/* Pagination */}
                {chessTotalPages > 1 && (
                  <div className="chess-pagination">
                    <button
                      className="chess-page-btn"
                      disabled={chessPage <= 1}
                      onClick={() => setChessPage((p) => p - 1)}
                    >
                      <ion-icon name="chevron-back-outline"></ion-icon>
                    </button>
                    {Array.from({ length: chessTotalPages }, (_, i) => (
                      <button
                        key={i}
                        className={`chess-page-btn ${chessPage === i + 1 ? "active" : ""}`}
                        onClick={() => setChessPage(i + 1)}
                      >
                        {i + 1}
                      </button>
                    ))}
                    <button
                      className="chess-page-btn"
                      disabled={chessPage >= chessTotalPages}
                      onClick={() => setChessPage((p) => p + 1)}
                    >
                      <ion-icon name="chevron-forward-outline"></ion-icon>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </section>
        </article>

        {/* ===== RESUME ===== */}
        <article
          className={`resume ${activePage === "resume" ? "active" : ""}`}
        >
          <header>
            <h2 className="h2 article-title">Resume</h2>
          </header>

          <section className="timeline">
            <div className="title-wrapper">
              <div className="icon-box">
                <ion-icon name="book-outline"></ion-icon>
              </div>
              <h3 className="h3">Education</h3>
            </div>
            <ol className="timeline-list">
              {education.map((item) => (
                <li className="timeline-item" key={item.title}>
                  <h4 className="h4 timeline-item-title">{item.title}</h4>
                  <span>{item.year}</span>
                  {item.address && (
                    <span className="timeline-address">
                      <ion-icon name="location-outline"></ion-icon>
                      {item.address}
                    </span>
                  )}
                  <p className="timeline-text">{item.text}</p>
                </li>
              ))}
            </ol>
          </section>

          <section className="timeline">
            <div className="title-wrapper">
              <div className="icon-box">
                <ion-icon name="book-outline"></ion-icon>
              </div>
              <h3 className="h3">Experience</h3>
            </div>
            <ol className="timeline-list">
              {experience.map((item) => (
                <li className="timeline-item" key={item.title}>
                  <h4 className="h4 timeline-item-title">{item.title}</h4>
                  <span>{item.year}</span>
                  {item.address && (
                    <span className="timeline-address">
                      <ion-icon name="location-outline"></ion-icon>
                      {item.address}
                    </span>
                  )}
                  <p className="timeline-text">{item.text}</p>
                </li>
              ))}
            </ol>
          </section>

          <section className="timeline">
            <div className="title-wrapper">
              <div className="icon-box">
                <ion-icon name="ribbon-outline"></ion-icon>
              </div>
              <h3 className="h3">Certifications</h3>
            </div>
            <ol className="timeline-list">
              {certifications.map((cert) => (
                <li className="timeline-item" key={cert.title}>
                  <h4 className="h4 timeline-item-title">
                    <a href={cert.url} target="_blank" rel="noopener noreferrer" style={{ color: "inherit", textDecoration: "none" }}>
                      {cert.title}
                      <ion-icon name="open-outline" style={{ fontSize: "14px", marginLeft: "6px", verticalAlign: "middle" }}></ion-icon>
                    </a>
                  </h4>
                  <span>{cert.issuer}</span>
                  <p className="timeline-text">{cert.text}</p>
                </li>
              ))}
            </ol>
          </section>

          <section className="skill">
            <h3 className="h3 skills-title">My skills</h3>

            <div className="skills-grid">
              {skillGroups.map((group) => (
                <div className="skill-category-card content-card" key={group.category}>
                  <div className="skill-category-header">
                    <ion-icon name={group.icon}></ion-icon>
                    <h5 className="h5">{group.category}</h5>
                  </div>
                  <div className="skill-tags">
                    {group.items.map((item) => (
                      <span className="skill-tag" key={item}>{item}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="skills-core-bar">
              <h4 className="h5 skills-bar-heading">Core Proficiency</h4>
              <ul className="skills-bar-list content-card">
                {skills.map((skill) => (
                  <li className="skills-item" key={skill.name}>
                    <div className="title-wrapper">
                      <h5 className="h5">{skill.name}</h5>
                      <data value={skill.value}>{skill.value}%</data>
                    </div>
                    <div className="skill-progress-bg">
                      <div
                        className="skill-progress-fill"
                        style={{ width: `${skill.value}%` }}
                      ></div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        </article>

        {/* ===== PORTFOLIO ===== */}
        <article
          className={`portfolio ${activePage === "portfolio" ? "active" : ""}`}
        >
          <header>
            <h2 className="h2 article-title">Portfolio</h2>
          </header>

          <section className="projects">
            {/* Desktop filter */}
            <ul className="filter-list">
              {filterCategories.map((cat) => (
                <li className="filter-item" key={cat}>
                  <button
                    className={
                      activeFilter === cat.toLowerCase() ? "active" : ""
                    }
                    onClick={() => handleFilter(cat)}
                  >
                    {cat}
                  </button>
                </li>
              ))}
            </ul>

            {/* Mobile filter select */}
            <div className="filter-select-box">
              <button
                className={`filter-select ${selectOpen ? "active" : ""}`}
                onClick={() => setSelectOpen(!selectOpen)}
              >
                <div className="select-value">{selectValue}</div>
                <div className="select-icon">
                  <ion-icon name="chevron-down"></ion-icon>
                </div>
              </button>

              <ul className="select-list">
                {filterCategories.map((cat) => (
                  <li className="select-item" key={cat}>
                    <button onClick={() => handleSelectItem(cat)}>
                      {cat}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Project list */}
            <ul className="project-list">
              {projects.map((project) => (
                <li
                  className={`project-item ${
                    isProjectVisible(project.category) ? "active" : ""
                  }`}
                  key={project.title}
                >
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      openGallery(project);
                    }}
                  >
                    <figure className="project-img">
                      <div className="project-item-icon-box">
                        <ion-icon name="eye-outline"></ion-icon>
                      </div>
                      <img
                        src={project.images[0]}
                        alt={project.title}
                        loading="lazy"
                      />
                    </figure>
                    <h3 className="project-title">{project.title}</h3>
                    <p className="project-category">{project.category}</p>
                  </a>
                </li>
              ))}
            </ul>
          </section>
        </article>

        {/* ===== TECH HIGHLIGHTS ===== */}
        <article
          className={`blog ${activePage === "blog" ? "active" : ""}`}
        >
          <header>
            <h2 className="h2 article-title">Blog</h2>
          </header>

          <section className="blog-posts">
            <ul className="blog-posts-list">
              {blogPosts.map((post) => (
                <li className="blog-post-item" key={post.title}>
                  <a href="#">
                    <figure className="blog-banner-box">
                      <img
                        src={post.img}
                        alt={post.title}
                        loading="lazy"
                      />
                    </figure>
                    <div className="blog-content">
                      <div className="blog-meta">
                        <p className="blog-category">{post.category}</p>
                        <span className="dot"></span>
                        <time dateTime="2022-02-23">{post.date}</time>
                      </div>
                      <h3 className="h3 blog-item-title">{post.title}</h3>
                      <p className="blog-text">{post.text}</p>
                    </div>
                  </a>
                </li>
              ))}
            </ul>
          </section>
        </article>

        {/* ===== CONTACT ===== */}
        <article
          className={`contact ${activePage === "contact" ? "active" : ""}`}
        >
          <header>
            <h2 className="h2 article-title">Contact</h2>
          </header>

          <section className="mapbox">
            <figure>
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d61693.39870858498!2d121.14697285!3d14.588399!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3397c00c5b2e1b6d%3A0x5e0b5e47c097950c!2sAntipolo%2C%20Rizal%2C%20Philippines!5e0!3m2!1sen!2sph!4v1700000000000!5m2!1sen!2sph"
                width="400"
                height="300"
                loading="lazy"
              ></iframe>
            </figure>
          </section>

          <section className="contact-form">
            <h3 className="h3 form-title">Contact Form</h3>

            <form
              action="#"
              className="form"
              onChange={handleFormChange}
            >
              <div className="input-wrapper">
                <input
                  type="text"
                  name="fullname"
                  className="form-input"
                  placeholder="Full name"
                  required
                />
                <input
                  type="email"
                  name="email"
                  className="form-input"
                  placeholder="Email address"
                  required
                />
              </div>

              <textarea
                name="message"
                className="form-input"
                placeholder="Your Message"
                required
              ></textarea>

              <button
                className="form-btn"
                type="submit"
                disabled={!formValid}
              >
                <ion-icon name="paper-plane"></ion-icon>
                <span>Send Message</span>
              </button>
            </form>
          </section>
        </article>
      </div>

      {/* Gallery Popup */}
      {galleryOpen && (
        <div className="gallery-overlay" onClick={closeGallery}>
          <div className="gallery-popup" onClick={(e) => e.stopPropagation()}>
            <button className="gallery-close-btn" onClick={closeGallery}>
              <ion-icon name="close-outline"></ion-icon>
            </button>

            <div className="gallery-body">
              {galleryImages.length > 1 && (
                <button className="gallery-nav gallery-nav-prev" onClick={galleryPrev}>
                  <ion-icon name="chevron-back-outline"></ion-icon>
                </button>
              )}

              <div className="gallery-image-wrapper">
                <img
                  src={galleryImages[galleryIndex]}
                  alt={`${galleryTitle} - ${galleryIndex + 1}`}
                />
              </div>

              {galleryImages.length > 1 && (
                <button className="gallery-nav gallery-nav-next" onClick={galleryNext}>
                  <ion-icon name="chevron-forward-outline"></ion-icon>
                </button>
              )}
            </div>

            <div className="gallery-footer">
              <div className="gallery-footer-left">
                <h4 className="gallery-title">{galleryTitle}</h4>
                {galleryUrl && galleryUrl !== "#" && (
                  <a
                    href={galleryUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="gallery-url"
                  >
                    <ion-icon name="open-outline"></ion-icon>
                    Visit Site
                  </a>
                )}
              </div>
              {galleryImages.length > 1 && (
                <span className="gallery-counter">
                  {galleryIndex + 1} / {galleryImages.length}
                </span>
              )}
            </div>

            {galleryDescription && (
              <div className="gallery-description">
                {galleryDescription.split("\n").map((line, i) => (
                  <p key={i}>{line}</p>
                ))}
              </div>
            )}

            {galleryImages.length > 1 && (
              <div className="gallery-thumbnails">
                {galleryImages.map((img, i) => (
                  <button
                    key={i}
                    className={`gallery-thumb ${i === galleryIndex ? "active" : ""}`}
                    onClick={() => setGalleryIndex(i)}
                  >
                    <img src={img} alt={`Thumbnail ${i + 1}`} />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}