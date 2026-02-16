// ========================================
// RESUME.JS - Resume Utilities
// ========================================

function downloadResume() {
    const resumeText = `
Y2K PORTFOLIO - PROFESSIONAL RESUME

CONTACT INFORMATION
Email: hello@y2k.local
Website: Your Y2K Portfolio
Social: @Y2KStyle

PROFESSIONAL SUMMARY
Full-stack developer passionate about creating beautiful, functional web applications. 
Specialized in modern web technologies and Y2K aesthetic design.

EXPERIENCE

Full Stack Developer (2023 - Present)
- Built responsive web applications using HTML5, CSS3, and JavaScript
- Designed and implemented user interfaces with modern aesthetics
- Managed databases and created RESTful APIs
- Collaborated with design teams on UI/UX improvements

Web Designer (2022 - 2023)
- Created pixel-perfect website designs
- Optimized websites for performance and accessibility
- Implemented responsive design patterns
- Worked with clients on branding and visual identity

SKILLS

Languages: HTML5, CSS3, JavaScript, Python, SQL
Frameworks: React, Next.js, Node.js, Express
Tools & Platforms: Git, GitHub, VS Code, Figma, Photoshop, Adobe XD
Databases: MongoDB, PostgreSQL, MySQL
Other: REST APIs, GraphQL, Web Performance, Responsive Design

EDUCATION

Bachelor of Science in Computer Science & Web Design
University of Technology, 2020 - 2024
- Dean's List: 2022, 2023
- Relevant Coursework: Web Development, Database Design, UI/UX Design

PROJECTS

Y2K Portfolio Website (2024)
Pure HTML/CSS/JavaScript portfolio with Y2K aesthetic
Features: Blog, Diary, Admin Panel, LocalStorage persistence
No frameworks or dependencies

Blog Platform (2023)
Full-stack blogging application with React and Node.js
Features: User authentication, post management, comments, search

E-Commerce Platform (2022)
React-based shopping application with Stripe integration
Features: Product catalog, shopping cart, checkout, admin panel

CERTIFICATIONS
- Web Development Bootcamp (2021)
- UI/UX Design Fundamentals (2021)
- JavaScript Advanced Concepts (2022)

ACHIEVEMENTS
- Featured in design community blogs
- 1000+ visitors on personal portfolio
- 50+ successful client projects

Generated: ${new Date().toLocaleDateString()}
    `;

    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(resumeText));
    element.setAttribute('download', 'Resume.txt');
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    
    showAlert('Resume downloaded!', 'success');
}

function printResume() {
    window.print();
    showAlert('Print dialog opened!', 'info');
}

// Initialize on load
document.addEventListener('DOMContentLoaded', function() {
    // Resume page ready
});