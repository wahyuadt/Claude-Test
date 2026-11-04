/* ==========================================================================
   YOUR PERSONAL CONTENT — EDIT THIS FILE
   ==========================================================================
   This is the ONLY file you need to change to make the site yours.
   Everything on the page (name, role, bio, skills, projects, links) is
   read from the SITE_CONTENT object below.

   How to edit:
   1. Replace every value marked "PLACEHOLDER" with your own details.
   2. Keep the quotes around text, and keep the commas between items.
   3. Save the file and refresh the browser to see your changes.

   Tips:
   - To add a skill, add another "text" to a group's "items" list.
   - To add a project, copy one { ... } block in "projects", paste it after
     a comma, and change its values. Remove a block to delete a project.
   - Leave "liveUrl" or "codeUrl" as "" (empty) to hide that link.
   - Images live in the assets/ folder. Swap in your own files and update
     the path and the "alt" text (a short description of the image).
   ========================================================================== */

window.SITE_CONTENT = {
  // --- Basics ------------------------------------------------------------
  name: "Your Name",                         // PLACEHOLDER
  role: "Frontend Developer",                // PLACEHOLDER
  pitch: "I build fast, accessible websites that are a pleasure to use.", // PLACEHOLDER
  // Shown in search results and link previews (about 150 characters).
  description: "Portfolio of Your Name, a frontend developer who builds fast, accessible websites.", // PLACEHOLDER

  // --- About -------------------------------------------------------------
  about: [                                   // PLACEHOLDER: 2–3 sentences, one paragraph per line
    "I'm a frontend developer based in Your City who turns ideas into clean, reliable interfaces.",
    "I care about accessibility, performance and the small details that make a site feel right. When I'm not coding, you'll find me hiking, reading or tinkering with side projects."
  ],
  avatar: {
    src: "assets/avatar.svg",                // PLACEHOLDER: e.g. "assets/me.jpg"
    alt: "Placeholder portrait of Your Name" // PLACEHOLDER: describe your photo
  },

  // --- Skills (grouped) ----------------------------------------------------
  skills: [                                  // PLACEHOLDER
    { group: "Frontend", items: ["HTML", "CSS", "JavaScript", "TypeScript", "React", "Accessibility"] },
    { group: "Backend",  items: ["Node.js", "Express", "REST APIs", "PostgreSQL"] },
    { group: "Tools",    items: ["Git", "GitHub", "VS Code", "Figma", "Playwright"] }
  ],

  // --- Projects (3 recommended) -------------------------------------------
  projects: [                                // PLACEHOLDER: replace with your real projects
    {
      title: "Weather Now",
      description: "A tiny weather app that shows a 5-day forecast for any city.",
      tags: ["JavaScript", "Fetch API", "CSS Grid"],
      image: { src: "assets/project-1.svg", alt: "Placeholder preview of the Weather Now app" },
      liveUrl: "https://example.com/",
      codeUrl: "https://github.com/your-username/weather-now"
    },
    {
      title: "Task Board",
      description: "A drag-and-drop to-do board that saves your tasks in the browser.",
      tags: ["React", "TypeScript", "localStorage"],
      image: { src: "assets/project-2.svg", alt: "Placeholder preview of the Task Board app" },
      liveUrl: "https://example.com/",
      codeUrl: "https://github.com/your-username/task-board"
    },
    {
      title: "Recipe API",
      description: "A small REST API for searching and saving recipes.",
      tags: ["Node.js", "Express", "PostgreSQL"],
      image: { src: "assets/project-3.svg", alt: "Placeholder preview of the Recipe API documentation" },
      liveUrl: "https://example.com/",
      codeUrl: "https://github.com/your-username/recipe-api"
    }
  ],

  // --- Contact -------------------------------------------------------------
  contact: {
    blurb: "Have a project in mind or just want to say hi? My inbox is always open.", // PLACEHOLDER
    email: "you@example.com",                                      // PLACEHOLDER
    github: "https://github.com/your-username",                    // PLACEHOLDER
    linkedin: "https://www.linkedin.com/in/your-username"          // PLACEHOLDER
  }
};
