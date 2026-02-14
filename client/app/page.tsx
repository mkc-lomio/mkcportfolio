"use client";

import { useState, useEffect, useRef, useCallback, FormEvent } from "react";

// ============ LAZY IMAGE ============

function LazyImage({ src, alt, className, ...props }: React.ImgHTMLAttributes<HTMLImageElement>) {
  const [loaded, setLoaded] = useState(false);
  const [inView, setInView] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setInView(true); observer.disconnect(); } },
      { rootMargin: "200px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={`lazy-image-wrapper ${loaded ? "loaded" : ""}`}>
      {!loaded && <div className="skeleton-shimmer" />}
      {inView && (
        <img
          src={src}
          alt={alt}
          className={className}
          onLoad={() => setLoaded(true)}
          {...props}
        />
      )}
    </div>
  );
}

// ============ TYPING ANIMATION ============

const typingRoles = ["Software Engineer", "Full-Stack Developer", "Back End Developer", "Front End Developer", "C#.NET Developer", "Azure Developer", "Tech Enthusiast"];

function TypingAnimation() {
  const [roleIndex, setRoleIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [deleting, setDeleting] = useState(false);
  const [pause, setPause] = useState(false);

  useEffect(() => {
    const current = typingRoles[roleIndex];

    if (pause) {
      const t = setTimeout(() => { setPause(false); setDeleting(true); }, 2000);
      return () => clearTimeout(t);
    }

    if (deleting) {
      if (charIndex === 0) {
        setDeleting(false);
        setRoleIndex((prev) => (prev + 1) % typingRoles.length);
        return;
      }
      const t = setTimeout(() => setCharIndex((c) => c - 1), 30);
      return () => clearTimeout(t);
    }

    if (charIndex < current.length) {
      const t = setTimeout(() => setCharIndex((c) => c + 1), 80);
      return () => clearTimeout(t);
    }

    setPause(true);
  }, [charIndex, deleting, pause, roleIndex]);

  return (
    <span className="typing-text">
      {typingRoles[roleIndex].slice(0, charIndex)}
      <span className="typing-cursor">|</span>
    </span>
  );
}

// ============ CONFETTI ============

function fireConfetti() {
  const canvas = document.createElement("canvas");
  canvas.style.cssText = "position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:9999";
  document.body.appendChild(canvas);
  const ctx = canvas.getContext("2d")!;
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const particles: { x: number; y: number; vx: number; vy: number; size: number; color: string; rotation: number; rv: number; life: number }[] = [];
  const colors = ["#FFD700", "#FFA500", "#FF6347", "#7CFC00", "#00BFFF", "#FF69B4", "#9370DB"];

  for (let i = 0; i < 120; i++) {
    particles.push({
      x: canvas.width / 2 + (Math.random() - 0.5) * 200,
      y: canvas.height * 0.6,
      vx: (Math.random() - 0.5) * 12,
      vy: -Math.random() * 14 - 4,
      size: Math.random() * 6 + 3,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 360,
      rv: (Math.random() - 0.5) * 10,
      life: 1,
    });
  }

  let frame = 0;
  const animate = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let alive = false;
    for (const p of particles) {
      p.x += p.vx;
      p.vy += 0.25;
      p.y += p.vy;
      p.rotation += p.rv;
      p.life -= 0.008;
      if (p.life <= 0) continue;
      alive = true;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);
      ctx.globalAlpha = p.life;
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
      ctx.restore();
    }
    frame++;
    if (alive && frame < 300) requestAnimationFrame(animate);
    else document.body.removeChild(canvas);
  };
  requestAnimationFrame(animate);
}

// ============ SKILL RADAR CHART ============

function SkillRadarChart({ skills }: { skills: { name: string; value: number }[] }) {
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting && !hasAnimated) { setHasAnimated(true); observer.disconnect(); } },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasAnimated]);

  if (!skills.length) return null;

  const cx = 150, cy = 150, maxR = 110;
  const n = skills.length;
  const angleStep = (2 * Math.PI) / n;

  const getPoint = (index: number, value: number) => {
    const angle = angleStep * index - Math.PI / 2;
    const r = (value / 100) * maxR;
    return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
  };

  const gridLevels = [20, 40, 60, 80, 100];

  const dataPoints = skills.map((s, i) => getPoint(i, s.value));
  const dataPath = dataPoints.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ") + " Z";

  return (
    <svg ref={ref} viewBox="0 0 300 300" className="radar-chart">
      {/* Grid */}
      {gridLevels.map((level) => {
        const pts = Array.from({ length: n }, (_, i) => getPoint(i, level));
        const path = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ") + " Z";
        return <path key={level} d={path} className="radar-grid" />;
      })}
      {/* Axes */}
      {skills.map((_, i) => {
        const p = getPoint(i, 100);
        return <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} className="radar-axis" />;
      })}
      {/* Data polygon */}
      <g className={`radar-data-group ${hasAnimated ? "radar-animated" : ""}`} style={{ transformOrigin: `${cx}px ${cy}px` }}>
        <path d={dataPath} className="radar-data" />
        <path d={dataPath} className="radar-data-stroke" />
        {/* Dots */}
        {skills.map((s, i) => {
          const dp = getPoint(i, s.value);
          return <circle key={s.name} cx={dp.x} cy={dp.y} r={4} className="radar-dot" />;
        })}
      </g>
      {/* Labels (always visible) */}
      {skills.map((s, i) => {
        const lp = getPoint(i, 120);
        return (
          <text key={s.name} x={lp.x} y={lp.y} className="radar-label" textAnchor="middle" dominantBaseline="central">
            {s.name.split(" / ")[0]}
          </text>
        );
      })}
    </svg>
  );
}

// ============ ANIMATED COUNTER ============

function AnimatedCounter({ end, suffix = "", duration = 1600 }: { end: number; suffix?: string; duration?: number }) {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          const start = performance.now();
          const step = (now: number) => {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(eased * end));
            if (progress < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [end, duration, hasAnimated]);

  return <span ref={ref} className="counter-value">{count}{suffix}</span>;
}
import Image from "next/image";

declare global {
  interface Window {
    grecaptcha: {
      ready: (cb: () => void) => void;
      execute: (siteKey: string, options: { action: string }) => Promise<string>;
    };
  }
}

// ============ TYPES ============

interface Service {
  icon: string;
  title: string;
  text: string;
}

interface Testimonial {
  avatar: string;
  name: string;
  subtitle?: string;
  relation?: string;
  date?: string;
  text: string;
}

interface Education {
  title: string;
  year: string;
  address: string;
  text: string;
}

interface Certification {
  title: string;
  issuer: string;
  text: string;
  url: string;
}

interface Experience {
  title: string;
  address: string;
  year: string;
  text: string;
}

interface CoreSkill {
  name: string;
  value: number;
}

interface SkillGroup {
  category: string;
  icon: string;
  items: string[];
}

interface SkillsData {
  coreSkills: CoreSkill[];
  skillGroups: SkillGroup[];
}

interface Project {
  images: string[];
  title: string;
  category: string;
  url: string;
  description: string;
  techStack?: string[];
}

interface BlogPost {
  img: string;
  title: string;
  category: string;
  date: string;
  text: string;
  url: string;
  claps?: number;
  pinned?: boolean;
  readTime?: number;
}

interface ChessGame {
  white: string;
  whiteElo: number;
  whiteTitle: string;
  whiteCountry: string;
  whiteImg: string;
  black: string;
  blackElo: number;
  blackTitle: string;
  blackCountry: string;
  blackImg: string;
  result: string;
  opening: string;
  date: string;
  timeControl: string;
  termination: string;
  link: string;
  pinned: boolean;
  pinLabel: string;
}

// ============ CONSTANTS ============

const CHESS_PAGE_SIZE = 10;
const BLOG_PAGE_SIZE = 6;
const filterCategories = ["All", "Administrative", "E-commerce", "Healthcare", "Recruitment", "Insurance", "AI Solutions", "Others"];
const navPages = ["About", "Resume", "Portfolio", "Blog", "Hobbies", "Contact"];

// ============ COMPONENT ============

export default function Home() {
  const [activePage, setActivePage] = useState("about");
  const [prevPage, setPrevPage] = useState("about");
  const [transitioning, setTransitioning] = useState(false);
  const [sidebarActive, setSidebarActive] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");
  const [selectOpen, setSelectOpen] = useState(false);
  const [selectValue, setSelectValue] = useState("Select category");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState<Testimonial | null>(null);
  const [formValid, setFormValid] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState<"success" | "error" | null>(null);
  const [formErrors, setFormErrors] = useState<{ fullname?: string; email?: string; message?: string }>({});
  const [formTouched, setFormTouched] = useState<{ fullname?: boolean; email?: boolean; message?: boolean }>({});
  const [imagePopup, setImagePopup] = useState<string | null>(null);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [galleryTitle, setGalleryTitle] = useState("");
  const [galleryUrl, setGalleryUrl] = useState("");
  const [galleryDescription, setGalleryDescription] = useState("");
  const [marqueePaused, setMarqueePaused] = useState(false);
  const [chessPage, setChessPage] = useState(1);
  const [blogPage, setBlogPage] = useState(1);
  const [testimonialIndex, setTestimonialIndex] = useState(0);
  const [testimonialPaused, setTestimonialPaused] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [showMobileNav, setShowMobileNav] = useState(true);
  const lastScrollY = useRef(0);

  // Data state
  const [services, setServices] = useState<Service[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [clients, setClients] = useState<string[]>([]);
  const [education, setEducation] = useState<Education[]>([]);
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [experience, setExperience] = useState<Experience[]>([]);
  const [skills, setSkills] = useState<CoreSkill[]>([]);
  const [skillGroups, setSkillGroups] = useState<SkillGroup[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [chessGames, setChessGames] = useState<ChessGame[]>([]);

  const marqueeRef = useRef<HTMLUListElement>(null);
  const scrollPosRef = useRef(0);

  // Fetch all data from JSON files
  useEffect(() => {
    const fetchData = async () => {
      const [
        servicesRes, testimonialsRes, clientsRes, educationRes,
        certificationsRes, experienceRes, skillsRes, projectsRes,
        blogPostsRes, chessGamesRes,
      ] = await Promise.all([
        fetch("/data/services.json"),
        fetch("/data/testimonials.json"),
        fetch("/data/clients.json"),
        fetch("/data/education.json"),
        fetch("/data/certifications.json"),
        fetch("/data/experience.json"),
        fetch("/data/skills.json"),
        fetch("/data/projects.json"),
        fetch("/data/blog-posts.json"),
        fetch("/data/chess-games.json"),
      ]);

      setServices(await servicesRes.json());
      const testimonialsData = await testimonialsRes.json();
      setTestimonials(testimonialsData);
      setModalData(testimonialsData[0] || null);
      setClients(await clientsRes.json());
      setEducation(await educationRes.json());
      setCertifications(await certificationsRes.json());
      setExperience(await experienceRes.json());
      const skillsData: SkillsData = await skillsRes.json();
      setSkills(skillsData.coreSkills);
      setSkillGroups(skillsData.skillGroups);
      setProjects(await projectsRes.json());
      setBlogPosts(await blogPostsRes.json());
      setChessGames(await chessGamesRes.json());
    };
    fetchData();
  }, []);
  useEffect(() => {
    const marquee = marqueeRef.current;
    if (!marquee) return;

    let animationId: number;
    const speed = 0.5;

    const step = () => {
      if (!marqueePaused) {
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

  // Theme toggle
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  // Favicon pulse on tab return
  useEffect(() => {
    const originalTitle = document.title;
    let interval: ReturnType<typeof setInterval>;

    const handleVisibility = () => {
      if (document.hidden) {
        let toggle = false;
        interval = setInterval(() => {
          document.title = toggle ? "👋 Come back!" : originalTitle;
          toggle = !toggle;
        }, 1500);
      } else {
        clearInterval(interval);
        document.title = originalTitle;
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      clearInterval(interval);
      document.title = originalTitle;
    };
  }, []);

  // Testimonial auto-scroll
  useEffect(() => {
    if (testimonials.length <= 1 || testimonialPaused) return;
    const interval = setInterval(() => {
      setTestimonialIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [testimonials.length, testimonialPaused]);

  // Scroll listener for scroll-to-top button and mobile nav hide/show
  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY;
      setShowScrollTop(y > 400);
      // Hide mobile nav on scroll down, show on scroll up
      if (y > lastScrollY.current && y > 100) {
        setShowMobileNav(false);
      } else {
        setShowMobileNav(true);
      }
      lastScrollY.current = y;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);


  const handleNavClick = (page: string) => {
    const next = page.toLowerCase();
    if (next === activePage) return;
    setTransitioning(true);
    setTimeout(() => {
      setPrevPage(activePage);
      setActivePage(next);
      window.scrollTo(0, 0);
      setTimeout(() => setTransitioning(false), 50);
    }, 200);
  };

  // Keyboard navigation (arrow keys to switch tabs)
  useEffect(() => {
    const pages = navPages.map((p) => p.toLowerCase());
    const handleKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
        const idx = pages.indexOf(activePage);
        if (idx === -1) return;
        const nextIdx = e.key === "ArrowRight"
          ? (idx + 1) % pages.length
          : (idx - 1 + pages.length) % pages.length;
        const next = pages[nextIdx];
        if (next === activePage) return;
        setTransitioning(true);
        setTimeout(() => {
          setPrevPage(activePage);
          setActivePage(next);
          window.scrollTo(0, 0);
          setTimeout(() => setTransitioning(false), 50);
        }, 200);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [activePage]);

  const handleFilter = (category: string) => {
    setActiveFilter(category.toLowerCase());
  };

  const handleSelectItem = (category: string) => {
    setSelectValue(category);
    setSelectOpen(false);
    setActiveFilter(category.toLowerCase());
  };

  const openModal = (testimonial: Testimonial) => {
    setModalData(testimonial);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  const validateField = (name: string, value: string) => {
    if (name === "fullname") {
      if (!value.trim()) return "Full name is required";
      if (value.trim().length < 2) return "Name must be at least 2 characters";
    }
    if (name === "email") {
      if (!value.trim()) return "Email is required";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "Please enter a valid email";
    }
    if (name === "message") {
      if (!value.trim()) return "Message is required";
      if (value.trim().length < 10) return "Message must be at least 10 characters";
    }
    return "";
  };

  const handleFieldBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormTouched((prev) => ({ ...prev, [name]: true }));
    const error = validateField(name, value);
    setFormErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleFormChange = (e: FormEvent<HTMLFormElement>) => {
    const form = e.currentTarget;
    const data = new FormData(form);
    const errors: typeof formErrors = {};
    let valid = true;
    for (const [name, value] of data.entries()) {
      const err = validateField(name, value as string);
      if (err) valid = false;
      if (formTouched[name as keyof typeof formTouched]) {
        errors[name as keyof typeof formErrors] = err;
      }
    }
    setFormErrors(errors);
    setFormValid(valid);
  };

  const handleFormSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    // Validate all fields
    const errors: typeof formErrors = {};
    let valid = true;
    for (const [name, value] of formData.entries()) {
      const err = validateField(name, value as string);
      if (err) { valid = false; errors[name as keyof typeof formErrors] = err; }
    }
    setFormTouched({ fullname: true, email: true, message: true });
    setFormErrors(errors);
    if (!valid) return;

    // Client-side rate limit: max 3 sends per 10 minutes
    const now = Date.now();
    const RATE_LIMIT_WINDOW = 10 * 60 * 1000;
    const MAX_SENDS = 3;
    const sendTimestamps: number[] = JSON.parse(sessionStorage.getItem("contact_sends") || "[]");
    const recentSends = sendTimestamps.filter((t) => now - t < RATE_LIMIT_WINDOW);
    if (recentSends.length >= MAX_SENDS) {
      setSendResult("error");
      return;
    }

    setSending(true);
    setSendResult(null);

    const data = {
      fullname: (formData.get("fullname") as string).trim(),
      email: (formData.get("email") as string).trim(),
      message: (formData.get("message") as string).trim(),
    };

    // Basic honeypot / validation
    if (!data.fullname || !data.email || !data.message) {
      setSending(false);
      return;
    }

    try {
      // Get reCAPTCHA token
      const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || "";
      const token = await new Promise<string>((resolve, reject) => {
        if (!window.grecaptcha) {
          reject(new Error("reCAPTCHA not loaded"));
          return;
        }
        window.grecaptcha.ready(() => {
          window.grecaptcha.execute(siteKey, { action: "contact" }).then(resolve).catch(reject);
        });
      });

      const res = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          service_id: process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID,
          template_id: process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID,
          user_id: process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY,
          template_params: {
            from_name: data.fullname,
            from_email: data.email,
            message: data.message,
            "g-recaptcha-response": token,
          },
        }),
      });

      if (res.ok) {
        setSendResult("success");
        form.reset();
        setFormValid(false);
        setFormErrors({});
        setFormTouched({});
        fireConfetti();
        // Track send timestamp
        recentSends.push(now);
        sessionStorage.setItem("contact_sends", JSON.stringify(recentSends));
      } else {
        setSendResult("error");
      }
    } catch {
      setSendResult("error");
    } finally {
      setSending(false);
      setTimeout(() => setSendResult(null), 5000);
    }
  };

  const isProjectVisible = (category: string) => {
    return activeFilter === "all" || activeFilter === category;
  };

  const openGallery = (project: Project, startIndex = 0) => {
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

  const isMyWin = (game: ChessGame) => {
    const me = "DrMkcTheHandSome";
    if (game.result === "1-0" && game.white === me) return true;
    if (game.result === "0-1" && game.black === me) return true;
    return false;
  };

  const isMyLoss = (game: ChessGame) => {
    const me = "DrMkcTheHandSome";
    if (game.result === "1-0" && game.black === me) return true;
    if (game.result === "0-1" && game.white === me) return true;
    return false;
  };

  const sortedChessGames = [...chessGames].sort((a, b) => {
    // Pinned first
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    // Within unpinned: wins first, then by opponent elo desc
    if (!a.pinned && !b.pinned) {
      const me = "DrMkcTheHandSome";
      const aWin = (a.result === "1-0" && a.white === me) || (a.result === "0-1" && a.black === me);
      const bWin = (b.result === "1-0" && b.white === me) || (b.result === "0-1" && b.black === me);
      if (aWin && !bWin) return -1;
      if (!aWin && bWin) return 1;
      const aOppElo = a.white === me ? a.blackElo : a.whiteElo;
      const bOppElo = b.white === me ? b.blackElo : b.whiteElo;
      return bOppElo - aOppElo;
    }
    return 0;
  });
  const chessTotalPages = Math.ceil(sortedChessGames.length / CHESS_PAGE_SIZE);
  const paginatedChessGames = sortedChessGames.slice(
    (chessPage - 1) * CHESS_PAGE_SIZE,
    chessPage * CHESS_PAGE_SIZE
  );

  return (
    <main className={theme}>
      {/* ===== SIDEBAR ===== */}
      <aside className={`sidebar ${sidebarActive ? "active" : ""}`}>
        <div className="sidebar-info">
          <figure className="avatar-box">
            <img src="/memoji/my-avatar.png" alt="Marc Kenneth Lomio" width={60} />
          </figure>

          <div className="info-content">
            <h1 className="name" title="Marc Kenneth Lomio">
              Marc Kenneth Lomio
            </h1>
            <p className="title"><TypingAnimation /></p>
            <span className="availability-badge" title="Based in Philippines, UTC+8">
              <span className="availability-dot" />
              Open to opportunities
            </span>
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
              <a href="https://github.com/mkc-lomio" className="social-link" target="_blank" rel="noopener noreferrer">
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

          <a
            href="files/MarcKennethLomio_CV.pdf"
            download="MarcKennethLomio_CV.pdf"
            className="download-cv-btn"
          >
            <ion-icon name="download-outline"></ion-icon>
            Download CV
          </a>

          <button className="theme-toggle-btn" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
            <ion-icon name={theme === "dark" ? "sunny-outline" : "moon-outline"}></ion-icon>
            <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
          </button>

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
            </div>
          </div>
        </div>
      </aside>

      {/* ===== MAIN CONTENT ===== */}
      <div className="main-content">
        {/* NAVBAR */}
        <nav className={`navbar ${showMobileNav ? "" : "navbar-hidden"}`}>
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
          className={`about ${activePage === "about" ? "active" : ""} ${transitioning ? "page-exit" : "page-enter"}`}
        >
          <header>
            <h2 className="h2 article-title">About me</h2>
          </header>

          <section className="about-text">
            <p>
              He is a Software Engineer and individual contributor with 6+
              years of experience in the Microsoft tech stack. He has delivered
              12 projects across HR, insurance, e-commerce, healthcare, and
              more — whether it&apos;s developing applications from the ground
              up, reverse engineering, version upgrades, research &amp;
              development, or maintenance. He picks up new tools and
              domains quickly, often ramping up on unfamiliar stacks to deliver
              ahead of schedule.
            </p>
            <p>
              Outside of work, he is a competitive chess player.
            </p>
          </section>

          {/* Stats */}
          <section className="about-stats">
            <div className="stats-row">
              <div className="stat-item">
                <AnimatedCounter end={6} suffix="+" />
                <span className="stat-label">Years Experience</span>
              </div>
              <div className="stat-separator" />
              <div className="stat-item">
                <AnimatedCounter end={clients.length || 12} suffix="" />
                <span className="stat-label">Clients</span>
              </div>
              <div className="stat-separator" />
              <div className="stat-item">
                <AnimatedCounter end={projects.length || 14} suffix="" />
                <span className="stat-label">Projects</span>
              </div>
              <div className="stat-separator" />
              <div className="stat-item">
                <AnimatedCounter end={skillGroups.reduce((sum, g) => sum + g.items.length, 0) || 78} suffix="+" />
                <span className="stat-label">Technologies</span>
              </div>
            </div>
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
            <div className="testimonials-header">
              <div>
                <h3 className="h3 testimonials-title">The Feedback Loop</h3>
                <p className="testimonials-tagline">Proof of impact from the trusted network</p>
              </div>
              {testimonials.length > 1 && (
                <span className="testimonials-count">{testimonials.length} recommendations</span>
              )}
            </div>

            <div
              className="testimonials-carousel"
              onMouseEnter={() => setTestimonialPaused(true)}
              onMouseLeave={() => setTestimonialPaused(false)}
              onTouchStart={(e) => {
                setTestimonialPaused(true);
                (e.currentTarget as HTMLElement).dataset.touchX = String(e.touches[0].clientX);
              }}
              onTouchEnd={(e) => {
                const startX = Number((e.currentTarget as HTMLElement).dataset.touchX || 0);
                const endX = e.changedTouches[0].clientX;
                const diff = startX - endX;
                if (Math.abs(diff) > 50) {
                  if (diff > 0) {
                    setTestimonialIndex((prev) => (prev + 1) % testimonials.length);
                  } else {
                    setTestimonialIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
                  }
                }
                setTimeout(() => setTestimonialPaused(false), 3000);
              }}
            >
              <div className="testimonials-track">
                {testimonials.map((t, i) => (
                  <div
                    className={`testimonials-slide ${i === testimonialIndex ? "active" : ""}`}
                    key={t.name}
                  >
                    <div className="content-card testimonials-card">
                      <div className="testimonials-card-header">
                        <div className="testimonials-initials-box">
                          {t.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                        </div>
                        <div className="testimonials-card-info">
                          <h4 className="h4 testimonials-item-title">{t.name}</h4>
                          <span className="testimonials-subtitle">
                            {[t.relation, t.subtitle].filter(Boolean).join(" • ")}
                          </span>
                          {t.date && <span className="testimonials-date">{t.date}</span>}
                        </div>
                        <img src="/icon-quote.svg" alt="quote icon" className="testimonials-quote-icon" />
                      </div>
                      <blockquote className="testimonials-quote">
                        <p>&ldquo;{t.text}&rdquo;</p>
                      </blockquote>
                    </div>
                  </div>
                ))}
              </div>

              {testimonials.length > 1 && (
                <>
                  <div className="testimonials-nav">
                    <button
                      className="testimonials-nav-btn"
                      onClick={() => setTestimonialIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)}
                      aria-label="Previous testimonial"
                    >
                      <ion-icon name="chevron-back-outline"></ion-icon>
                    </button>
                    <button
                      className="testimonials-nav-btn"
                      onClick={() => setTestimonialIndex((prev) => (prev + 1) % testimonials.length)}
                      aria-label="Next testimonial"
                    >
                      <ion-icon name="chevron-forward-outline"></ion-icon>
                    </button>
                  </div>

                  <div className="testimonials-dots">
                    {testimonials.map((_, i) => (
                      <button
                        key={i}
                        className={`testimonials-dot ${i === testimonialIndex ? "active" : ""}`}
                        onClick={() => setTestimonialIndex(i)}
                        aria-label={`Go to testimonial ${i + 1}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>

            <div className="testimonials-cta">
              <p>Worked with me? I&apos;d love to hear your feedback! Send your testimonial to{" "}
                <a href="mailto:marckenneth.lomio@gmail.com?subject=Testimonial for Marc Kenneth">
                  marckenneth.lomio@gmail.com
                </a>
              </p>
            </div>
          </section>
          <section className="clients">
            <h3 className="h3 clients-title">Clients</h3>
            <div
              className="clients-marquee-wrapper"
              onMouseEnter={() => setMarqueePaused(true)}
              onMouseLeave={() => setMarqueePaused(false)}
              onTouchStart={() => setMarqueePaused(true)}
              onTouchEnd={() => { setTimeout(() => setMarqueePaused(false), 2000); }}
            >
              <ul className="clients-marquee" ref={marqueeRef}>
                {[...clients, ...clients].map((logo, i) => (
                  <li className="clients-item" key={i}>
                    <img src={logo} alt="client logo" draggable={false} />
                  </li>
                ))}
              </ul>
            </div>
          </section>

        </article>

        {/* ===== RESUME ===== */}
        <article
          className={`resume ${activePage === "resume" ? "active" : ""} ${transitioning ? "page-exit" : "page-enter"}`}
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
          className={`portfolio ${activePage === "portfolio" ? "active" : ""} ${transitioning ? "page-exit" : "page-enter"}`}
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
                      <LazyImage
                        src={project.images[0]}
                        alt={project.title}
                      />
                    </figure>
                    <h3 className="project-title">{project.title}</h3>
                    <p className="project-category">{project.category}</p>
                    {project.techStack && project.techStack.length > 0 && (
                      <div className="project-tech-tags">
                        {project.techStack.slice(0, 5).map((tech) => (
                          <span className="project-tech-tag" key={tech}>{tech}</span>
                        ))}
                      </div>
                    )}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        </article>

        {/* ===== BLOG ===== */}
        <article
          className={`blog ${activePage === "blog" ? "active" : ""} ${transitioning ? "page-exit" : "page-enter"}`}
        >
          <header>
            <h2 className="h2 article-title">Blog</h2>
          </header>

          <section className="blog-posts">
            <ul className="blog-posts-list">
              {(() => {
                const sorted = [...blogPosts].sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));
                const paginated = sorted.slice((blogPage - 1) * BLOG_PAGE_SIZE, blogPage * BLOG_PAGE_SIZE);
                return paginated.map((post) => (
                  <li className="blog-post-item" key={post.title}>
                    <a href={post.url} target="_blank" rel="noopener noreferrer">
                      <figure className="blog-banner-box">
                        {post.pinned && <span className="blog-pin-badge"><ion-icon name="pin-outline"></ion-icon> Pinned</span>}
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
                          <time dateTime={post.date}>{post.date}</time>
                        </div>
                        <span className="blog-read-badge">
                          <ion-icon name="time-outline"></ion-icon>
                          {post.readTime || Math.max(1, Math.ceil(post.text.split(/\s+/).length / 200))} min read
                        </span>
                        <h3 className="h3 blog-item-title">{post.title}</h3>
                        <p className="blog-text">{post.text}</p>
                      </div>
                    </a>
                  </li>
                ));
              })()}
            </ul>

            {/* Blog Pagination */}
            {blogPosts.length > BLOG_PAGE_SIZE && (() => {
              const totalPages = Math.ceil(blogPosts.length / BLOG_PAGE_SIZE);
              return (
                <div className="pagination">
                  <button
                    className="page-btn"
                    disabled={blogPage <= 1}
                    onClick={() => setBlogPage((p) => p - 1)}
                  >
                    <ion-icon name="chevron-back-outline"></ion-icon>
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => (
                    <button
                      key={i}
                      className={`page-btn ${blogPage === i + 1 ? "active" : ""}`}
                      onClick={() => setBlogPage(i + 1)}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    className="page-btn"
                    disabled={blogPage >= totalPages}
                    onClick={() => setBlogPage((p) => p + 1)}
                  >
                    <ion-icon name="chevron-forward-outline"></ion-icon>
                  </button>
                </div>
              );
            })()}
          </section>
        </article>

        {/* ===== HOBBIES ===== */}
        <article
          className={`hobbies ${activePage === "hobbies" ? "active" : ""} ${transitioning ? "page-exit" : "page-enter"}`}
        >
          <header>
            <h2 className="h2 article-title">Hobbies</h2>
          </header>

          <section className="hobbies-content">
            <div className="hobby-card content-card">
              <div className="hobby-header">
                <span className="hobby-icon">♟️</span>
                <div>
                  <h4 className="h4">Chess</h4>
                  <p className="hobby-subtitle">Memorable Games</p>
                </div>
              </div>

              <ul className="chess-games-list">
                {paginatedChessGames.map((game, i) => (
                  <li className={`chess-game-item ${game.pinned ? "chess-game-pinned" : ""} ${isMyWin(game) ? "chess-border-win" : isMyLoss(game) ? "chess-border-loss" : ""}`} key={`game-${i}`}>
                    {game.pinned && <span className="chess-pin-badge">{game.pinLabel || "Pinned"}</span>}
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
                <div className="pagination">
                  <button
                    className="page-btn"
                    disabled={chessPage <= 1}
                    onClick={() => setChessPage((p) => p - 1)}
                  >
                    <ion-icon name="chevron-back-outline"></ion-icon>
                  </button>
                  {Array.from({ length: chessTotalPages }, (_, i) => (
                    <button
                      key={i}
                      className={`page-btn ${chessPage === i + 1 ? "active" : ""}`}
                      onClick={() => setChessPage(i + 1)}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    className="page-btn"
                    disabled={chessPage >= chessTotalPages}
                    onClick={() => setChessPage((p) => p + 1)}
                  >
                    <ion-icon name="chevron-forward-outline"></ion-icon>
                  </button>
                </div>
              )}
            </div>
          </section>
        </article>

        {/* ===== CONTACT ===== */}
        <article
          className={`contact ${activePage === "contact" ? "active" : ""} ${transitioning ? "page-exit" : "page-enter"}`}
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
              onSubmit={handleFormSubmit}
            >
              <div className="input-wrapper">
                <div className="form-field">
                  <input
                    type="text"
                    name="fullname"
                    className={`form-input ${formErrors.fullname && formTouched.fullname ? "form-input-error" : ""}`}
                    placeholder="Full name"
                    required
                    disabled={sending}
                    onBlur={handleFieldBlur}
                  />
                  {formErrors.fullname && formTouched.fullname && (
                    <span className="form-error">{formErrors.fullname}</span>
                  )}
                </div>
                <div className="form-field">
                  <input
                    type="email"
                    name="email"
                    className={`form-input ${formErrors.email && formTouched.email ? "form-input-error" : ""}`}
                    placeholder="Email address"
                    required
                    disabled={sending}
                    onBlur={handleFieldBlur}
                  />
                  {formErrors.email && formTouched.email && (
                    <span className="form-error">{formErrors.email}</span>
                  )}
                </div>
              </div>

              <div className="form-field">
                <textarea
                  name="message"
                  className={`form-input ${formErrors.message && formTouched.message ? "form-input-error" : ""}`}
                  placeholder="Your Message"
                  required
                  disabled={sending}
                  onBlur={handleFieldBlur}
                ></textarea>
                {formErrors.message && formTouched.message && (
                  <span className="form-error">{formErrors.message}</span>
                )}
              </div>

              <button
                className="form-btn"
                type="submit"
                disabled={!formValid || sending}
              >
                <ion-icon name={sending ? "hourglass-outline" : "paper-plane"}></ion-icon>
                <span>{sending ? "Sending..." : "Send Message"}</span>
              </button>

              {sendResult === "success" && (
                <p className="form-result form-result-success">Message sent successfully!</p>
              )}
              {sendResult === "error" && (
                <p className="form-result form-result-error">Failed to send. Please try again or email me directly.</p>
              )}
            </form>
          </section>
        </article>
      </div>

      {/* Scroll to Top */}
      <button
        className={`scroll-top-btn ${showScrollTop ? "visible" : ""}`}
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        aria-label="Scroll to top"
      >
        <ion-icon name="chevron-up-outline"></ion-icon>
      </button>

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