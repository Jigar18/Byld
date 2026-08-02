const icon = (name, size = 16) => {
  const paths = {
    check: '<path d="m5 12 4 4L19 6"/>',
    pin: '<path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/>',
    edit: '<path d="m14 6 4 4M3 21l3.5-.7L19 7.8a2.8 2.8 0 0 0-4-4L2.7 16.2 2 20.9Z"/>',
    about: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5m0-8h.01"/>',
    work: '<rect x="3" y="6" width="18" height="14" rx="2"/><path d="M8 6V4h8v2m-13 5h18"/>',
    activity: '<path d="M3 12h4l2-7 4 14 2-7h6"/>',
    skills: '<path d="m12 3 2.2 4.5 5 .7-3.6 3.5.9 5-4.5-2.4-4.5 2.4.9-5L4.8 8.2l5-.7Z"/>',
    award: '<circle cx="12" cy="8" r="5"/><path d="m8.5 12-1 9 4.5-3 4.5 3-1-9"/>',
    education: '<path d="m3 9 9-5 9 5-9 5-9-5Z"/><path d="M7 12v5c3 2 7 2 10 0v-5"/>',
    connect: '<circle cx="6" cy="12" r="3"/><circle cx="18" cy="6" r="3"/><circle cx="18" cy="18" r="3"/><path d="m8.5 10.5 7-3m-7 6 7 3"/>',
    experience: '<path d="M9 6V4h6v2"/><rect x="3" y="6" width="18" height="15" rx="2"/><path d="M3 11h18"/>'
  };
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name]}</svg>`;
};

const sectionHeading = (iconName, title, subtitle, action = "") => `
  <div class="section-heading">
    <div class="heading-main">
      <span class="heading-icon">${icon(iconName)}</span>
      <div><h2>${title}</h2>${subtitle ? `<p class="section-subtitle">${subtitle}</p>` : ""}</div>
    </div>
    ${action}
  </div>`;

const projects = [
  ["chgfn", "bfnhf", ["Spring boot", "Spring security"]],
  ["cnfmg", "nbfgcmg", ["React", "Nodejs", "Typescript", "+2 more"]],
  ["cnfn", "cnvbmgm", ["Nodejs", "Typescript", "Java", "+2 more"]],
  ["fnhnbhgfn", "ccgnbfmghmg", ["Spring boot", "Spring security", "Git", "+1 more"]]
];
const skills = ["React", "Nodejs", "Typescript", "Java", "Mongodb", "Nextjs", "Spring boot", "Spring security", "Git", "Github", "Docker", "Javascript", "Tailwind", "Sql server", "My sql", "Postgresql", "Html", "Css", "Dotnet", "Express"];

document.querySelector("#portfolio-root").innerHTML = `
  <div class="app-controls">
    <button class="control icon" type="button" aria-label="Theme"><span class="theme-dot"></span></button>
    <button class="control logout" type="button">Log out</button>
  </div>

  <main class="portfolio">
    <section class="profile-card">
      <button class="edit" type="button" aria-label="Edit profile">${icon("edit", 14)}</button>
      <div class="avatar-shell">
        <img class="avatar" src="https://vadqtghahevoepfabrdd.supabase.co/storage/v1/object/public/profile-picture/user-image/23fb3c9d-4db7-4fca-b72a-117d831ffbba-1783869260446-profile-picture.jpg" alt="Jigar Rajput">
        <span class="verified">${icon("check", 15)}</span>
      </div>
      <div class="profile-copy">
        <h1>Jigar Rajput</h1>
        <p class="profile-role">Associate Software Engineer</p>
        <div class="location">${icon("pin", 13)}<span>Faridabad, India</span></div>
      </div>
      <div class="school">SHARDA UNIVERSITY</div>
    </section>

    <section class="section about">
      ${sectionHeading("about", "About Me", "", `<button class="edit" type="button" aria-label="Edit about">${icon("edit", 14)}</button>`)}
      <p class="about-copy">Final-year Computer Science Engineering student with hands-on internship experience in full-stack development and REST API design. Proficient in Java, JavaScript, React.js, Node.js, and Next.js with a strong foundation in Data Structures &amp; Algorithms (500+ problems solved). Published IEEE researcher on LLM evaluation. Experienced in writing clean, efficient code across real-world projects and eager to grow as a software developer within a structured, collaborative team environment.</p>
    </section>

    <section class="section projects">
      ${sectionHeading("work", "Projects", "Selected work, experiments, and proof of craft.", '<button class="primary-action" type="button">Add project</button>')}
      <div class="project-strip">
        ${projects.map(project => `
          <article class="project-card">
            <div class="project-visual">
              <div class="card-actions"><button class="card-action" type="button" aria-label="Edit project">${icon("edit", 13)}</button><button class="card-action" type="button" aria-label="Delete project">×</button></div>
            </div>
            <div class="project-copy">
              <h3>${project[0]}</h3><p>${project[1]}</p>
              <div class="tags">${project[2].map(tag => `<span class="tag">${tag}</span>`).join("")}</div>
            </div>
          </article>`).join("")}
      </div>
    </section>

    <section class="section activity">
      ${sectionHeading("activity", "GitHub activity", "")}
      <div class="panel activity-panel">
        <div class="activity-head">
          <span class="activity-title">GitHub activity</span>
          <span class="activity-state"><i class="state-dot"></i>Shown publicly</span>
        </div>
        <div class="heat-scroll"><div class="heatmap" id="heatmap" aria-label="Contribution activity"></div></div>
        <div class="heat-legend"><span>Less</span><i class="legend-cell" style="background:var(--heat-0)"></i><i class="legend-cell" style="background:var(--heat-1)"></i><i class="legend-cell" style="background:var(--heat-2)"></i><i class="legend-cell" style="background:var(--heat-3)"></i><span>More</span></div>
      </div>
    </section>

    <section class="section skills">
      ${sectionHeading("skills", "Skills", "")}
      <div class="panel skills-panel"><div class="skill-list">${skills.map(skill => `<span class="skill">${skill}</span>`).join("")}<span class="skill more">+2</span></div></div>
    </section>

    <div class="section credentials-grid">
      <section class="panel credential-panel">
        ${sectionHeading("award", "Certifications", "", '<span class="count-pill">+1</span>')}
        <div class="credential-list">
          <article class="credential"><h3>Internship Certficate</h3><p>This is the certificate for doing Internship at Credex Technology.</p><div class="credential-actions"><span>Download</span><span>View Certificate</span></div></article>
          <article class="credential"><h3>Udemy Web Development Certificate</h3><p>Summer Term Udemy Certificate for MERN Stack</p><div class="credential-actions"><span>Download</span><span>View Certificate</span></div></article>
          <article class="credential"><h3>Example Certificate</h3><p>This is just an example certificate to test the UI</p></article>
        </div>
      </section>
      <section class="panel credential-panel">
        ${sectionHeading("education", "Education", "", '<span class="count-pill">+1</span>')}
        <div class="credential-list">
          <article class="credential"><h3>Sharda University</h3><p class="credential-meta">2022 - 2026</p><p>Bachelor of Technology · Computer Science</p></article>
          <article class="credential"><h3>Rawal Convent School</h3><p class="credential-meta">2020 - 2021</p><p>Secondary School · PCM</p></article>
        </div>
      </section>
    </div>

    <section class="section connect">
      ${sectionHeading("connect", "Connect", "")}
      <div class="connect-grid">
        <a class="social" href="#"><span class="social-mark">in</span>LinkedIn</a>
        <a class="social" href="#"><span class="social-mark">@</span>Email</a>
        <a class="social" href="#"><span class="social-mark">𝕏</span>Twitter</a>
        <a class="social" href="#"><span class="social-mark">GH</span>Github</a>
      </div>
    </section>

    <section class="section experience">
      ${sectionHeading("experience", "Experience", "")}
      <article class="panel experience-card">
        <div class="experience-top">
          <div><h3>Credex Technology</h3><p class="experience-role">Associate Software Engineer</p></div>
          <time class="experience-date">November 2025 - Present</time>
        </div>
        <ul class="experience-points">
          <li>Developed and maintained React.js frontend modules for an internal recruitment dashboard, improving usability and optimizing data rendering for large datasets.</li>
          <li>Contributed to the CSD Smart Card project (.NET) by resolving 100+ bugs, significantly improving system stability and reducing runtime issues.</li>
          <li>Implemented feature enhancements including pagination and query optimization, reducing unnecessary data processing.</li>
        </ul>
      </article>
    </section>

    <footer class="page-footer"><span>Jigar Rajput · Portfolio</span><span>Built around real work.</span></footer>
  </main>`;

const heatmap = document.querySelector("#heatmap");
for (let index = 0; index < 371; index += 1) {
  const cell = document.createElement("i");
  const active = index % 17 === 0 ? 3 : index % 11 === 0 ? 2 : index % 5 === 0 ? 1 : 0;
  cell.className = "heat-cell";
  cell.dataset.level = String(active);
  heatmap.append(cell);
}
