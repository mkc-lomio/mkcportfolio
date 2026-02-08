"use client";

import { useState, FormEvent } from "react";
import Image from "next/image";

// ============ DATA ============

const services = [
  {
    icon: "/icon-design.svg",
    title: "Web design",
    text: "The most modern and high-quality design made at a professional level.",
  },
  {
    icon: "/icon-dev.svg",
    title: "Web development",
    text: "High-quality development of sites at the professional level.",
  },
  {
    icon: "/icon-app.svg",
    title: "Mobile apps",
    text: "Professional development of applications for iOS and Android.",
  },
  {
    icon: "/icon-photo.svg",
    title: "Photography",
    text: "I make high-quality photos of any category at a professional level.",
  },
];

const testimonials = [
  {
    avatar: "/avatar-1.png",
    name: "Daniel lewis",
    text: "Richard was hired to create a corporate identity. We were very pleased with the work done. She has a lot of experience and is very concerned about the needs of client. Lorem ipsum dolor sit amet, ullamcous cididt consectetur adipiscing elit, seds do et eiusmod tempor incididunt ut laborels dolore magnarels alia.",
  },
  {
    avatar: "/avatar-2.png",
    name: "Jessica miller",
    text: "Richard was hired to create a corporate identity. We were very pleased with the work done. She has a lot of experience and is very concerned about the needs of client. Lorem ipsum dolor sit amet, ullamcous cididt consectetur adipiscing elit, seds do et eiusmod tempor incididunt ut laborels dolore magnarels alia.",
  },
  {
    avatar: "/avatar-3.png",
    name: "Emily evans",
    text: "Richard was hired to create a corporate identity. We were very pleased with the work done. She has a lot of experience and is very concerned about the needs of client. Lorem ipsum dolor sit amet, ullamcous cididt consectetur adipiscing elit, seds do et eiusmod tempor incididunt ut laborels dolore magnarels alia.",
  },
  {
    avatar: "/avatar-4.png",
    name: "Henry william",
    text: "Richard was hired to create a corporate identity. We were very pleased with the work done. She has a lot of experience and is very concerned about the needs of client. Lorem ipsum dolor sit amet, ullamcous cididt consectetur adipiscing elit, seds do et eiusmod tempor incididunt ut laborels dolore magnarels alia.",
  },
];

const clients = [
  "/logo-1-color.png",
  "/logo-2-color.png",
  "/logo-3-color.png",
  "/logo-4-color.png",
  "/logo-5-color.png",
  "/logo-6-color.png",
];

const education = [
  {
    title: "University school of the arts",
    year: "2007 — 2008",
    text: "Nemo enims ipsam voluptatem, blanditiis praesentium voluptum delenit atque corrupti, quos dolores et quas molestias exceptur.",
  },
  {
    title: "New york academy of art",
    year: "2006 — 2007",
    text: "Ratione voluptatem sequi nesciunt, facere quisquams facere menda ossimus, omnis voluptas assumenda est omnis..",
  },
  {
    title: "High school of art and design",
    year: "2002 — 2004",
    text: "Duis aute irure dolor in reprehenderit in voluptate, quila voluptas mag odit aut fugit, sed consequuntur magni dolores eos.",
  },
];

const experience = [
  {
    title: "Creative director",
    year: "2015 — Present",
    text: "Nemo enim ipsam voluptatem blanditiis praesentium voluptum delenit atque corrupti, quos dolores et qvuas molestias exceptur.",
  },
  {
    title: "Art director",
    year: "2013 — 2015",
    text: "Nemo enims ipsam voluptatem, blanditiis praesentium voluptum delenit atque corrupti, quos dolores et quas molestias exceptur.",
  },
  {
    title: "Web designer",
    year: "2010 — 2013",
    text: "Nemo enims ipsam voluptatem, blanditiis praesentium voluptum delenit atque corrupti, quos dolores et quas molestias exceptur.",
  },
];

const skills = [
  { name: "Web design", value: 80 },
  { name: "Graphic design", value: 70 },
  { name: "Branding", value: 90 },
  { name: "WordPress", value: 50 },
];

const projects = [
  { img: "/project-1.jpg", title: "Finance", category: "web development" },
  { img: "/project-2.png", title: "Orizon", category: "web development" },
  { img: "/project-3.jpg", title: "Fundo", category: "web design" },
  { img: "/project-4.png", title: "Brawlhalla", category: "applications" },
  { img: "/project-5.png", title: "DSM.", category: "web design" },
  { img: "/project-6.png", title: "MetaSpark", category: "web design" },
  { img: "/project-7.png", title: "Summary", category: "web development" },
  { img: "/project-8.jpg", title: "Task Manager", category: "applications" },
  { img: "/project-9.png", title: "Arrival", category: "web development" },
];

const blogPosts = [
  {
    img: "/blog-1.jpg",
    title: "Design conferences in 2022",
    category: "Design",
    date: "Fab 23, 2022",
    text: "Veritatis et quasi architecto beatae vitae dicta sunt, explicabo.",
  },
  {
    img: "/blog-2.jpg",
    title: "Best fonts every designer",
    category: "Design",
    date: "Fab 23, 2022",
    text: "Sed ut perspiciatis, nam libero tempore, cum soluta nobis est eligendi.",
  },
  {
    img: "/blog-3.jpg",
    title: "Design digest #80",
    category: "Design",
    date: "Fab 23, 2022",
    text: "Excepteur sint occaecat cupidatat no proident, quis nostrum exercitationem ullam corporis suscipit.",
  },
  {
    img: "/blog-4.jpg",
    title: "UI interactions of the week",
    category: "Design",
    date: "Fab 23, 2022",
    text: "Enim ad minim veniam, consectetur adipiscing elit, quis nostrud exercitation ullamco laboris nisi.",
  },
  {
    img: "/blog-5.jpg",
    title: "The forgotten art of spacing",
    category: "Design",
    date: "Fab 23, 2022",
    text: "Maxime placeat, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  },
  {
    img: "/blog-6.jpg",
    title: "Design digest #79",
    category: "Design",
    date: "Fab 23, 2022",
    text: "Optio cumque nihil impedit uo minus quod maxime placeat, velit esse cillum.",
  },
];

const filterCategories = ["All", "Web design", "Applications", "Web development"];
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

  return (
    <main>
      {/* ===== SIDEBAR ===== */}
      <aside className={`sidebar ${sidebarActive ? "active" : ""}`}>
        <div className="sidebar-info">
          <figure className="avatar-box">
            <img src="/my-avatar.png" alt="Richard hanrick" width={80} />
          </figure>

          <div className="info-content">
            <h1 className="name" title="Richard hanrick">
              Richard hanrick
            </h1>
            <p className="title">Web developer</p>
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
                <a href="mailto:richard@example.com" className="contact-link">
                  richard@example.com
                </a>
              </div>
            </li>

            <li className="contact-item">
              <div className="icon-box">
                <ion-icon name="phone-portrait-outline"></ion-icon>
              </div>
              <div className="contact-info">
                <p className="contact-title">Phone</p>
                <a href="tel:+12133522795" className="contact-link">
                  +1 (213) 352-2795
                </a>
              </div>
            </li>

            <li className="contact-item">
              <div className="icon-box">
                <ion-icon name="calendar-outline"></ion-icon>
              </div>
              <div className="contact-info">
                <p className="contact-title">Birthday</p>
                <time dateTime="1982-06-23">June 23, 1982</time>
              </div>
            </li>

            <li className="contact-item">
              <div className="icon-box">
                <ion-icon name="location-outline"></ion-icon>
              </div>
              <div className="contact-info">
                <p className="contact-title">Location</p>
                <address>Sacramento, California, USA</address>
              </div>
            </li>
          </ul>

          <div className="separator"></div>

          <ul className="social-list">
            <li className="social-item">
              <a href="#" className="social-link">
                <ion-icon name="logo-facebook"></ion-icon>
              </a>
            </li>
            <li className="social-item">
              <a href="#" className="social-link">
                <ion-icon name="logo-twitter"></ion-icon>
              </a>
            </li>
            <li className="social-item">
              <a href="#" className="social-link">
                <ion-icon name="logo-instagram"></ion-icon>
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
              I&apos;m Creative Director and UI/UX Designer from Sydney,
              Australia, working in web development and print media. I enjoy
              turning complex problems into simple, beautiful and intuitive
              designs.
            </p>
            <p>
              My job is to build your website so that it is functional and
              user-friendly but at the same time attractive. Moreover, I add
              personal touch to your product and make sure that is eye-catching
              and easy to use. My aim is to bring across your message and
              identity in the most creative way. I created web design for many
              famous brand companies.
            </p>
          </section>

          {/* Service */}
          <section className="service">
            <h3 className="h3 service-title">What i&apos;m doing</h3>
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
                  <a href="#">
                    <img src={logo} alt="client logo" />
                  </a>
                </li>
              ))}
            </ul>
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
                  <a href="#">
                    <figure className="project-img">
                      <div className="project-item-icon-box">
                        <ion-icon name="eye-outline"></ion-icon>
                      </div>
                      <img
                        src={project.img}
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

        {/* ===== BLOG ===== */}
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
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d199666.5651251294!2d-121.58334177520186!3d38.56165006739519!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x809ac672b28397f9%3A0x921f6aaa74197fdb!2sSacramento%2C%20CA%2C%20USA!5e0!3m2!1sen!2sbd!4v1647608789441!5m2!1sen!2sbd"
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
