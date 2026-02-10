"use client";

import { useState, FormEvent } from "react";
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
  "/steer-logo.png",
  "/xamun-ai-logo.png",
];

const education = [
  {
    title: "Bachelor of Science: Information Technology",
    year: "Jose Rizal University",
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
    year: "2023 — Present",
    text: "Automated attendance tracking with WebJobs pulling 100,000+ daily data points. Built a sessionization algorithm increasing time-tracking accuracy by 90% for 4,000+ users.",
  },
  {
    title: "Software Engineer — BlastAsia, Inc.",
    year: "2019 — 2023",
    text: "Delivered 17 applications across recruitment, healthcare, e-commerce, insurance, and asset management. Led code reviews, R&D initiatives, and deployed scalable apps with Azure App Service.",
  },
  {
    title: "Software Developer Intern — Mr. Geek Mobile Solution Inc.",
    year: "2018",
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

const projects = [
  { images: ["/kinetic-portal-img.png"], title: "Kinetic Portal", category: "enterprise", url: "https://portal.kineticstaff.com/" },
  { images: ["/project-2.png"], title: "Xamun Dev Portal", category: "enterprise", url: "https://www.xamun.ai/" },
  { images: ["/project-3.jpg"], title: "Rivington (Collections, AMIG, Centauri)", category: "enterprise", url: "#" },
  { images: ["/project-4.png"], title: "Daikin E-Commerce & Virtual Showroom", category: "e-commerce", url: "#" },
  { images: ["/project-5.png"], title: "iScan Diagnostic Center", category: "healthcare", url: "#" },
  { images: ["/project-6.png"], title: "Marius Cyber-Insurance", category: "enterprise", url: "#" },
  { images: ["/project-8.jpg"], title: "Catalyst Code Generator", category: "developer tools", url: "#" },
  { images: ["/project-9.png"], title: "My Scorecard (MundiPharma)", category: "enterprise", url: "#" },
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

const filterCategories = ["All", "Enterprise", "E-commerce", "Healthcare", "Developer tools"];
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
              Marc Kenneth Capitulo-Lomio
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
                <ion-icon name="phone-portrait-outline"></ion-icon>
              </div>
              <div className="contact-info">
                <p className="contact-title">Phone</p>
                <a href="tel:+639171667863" className="contact-link">
                  +63 917-166-7863
                </a>
              </div>
            </li>

            <li className="contact-item">
              <div className="icon-box">
                <ion-icon name="calendar-outline"></ion-icon>
              </div>
              <div className="contact-info">
                <p className="contact-title">Birthday</p>
                <time dateTime="1997-12-11">Dec 11, 1997</time>
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
            <ul className="clients-list has-scrollbar">
              {clients.map((logo, i) => (
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
            <ul className="skills-list content-card">
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
    </main>
  );
}