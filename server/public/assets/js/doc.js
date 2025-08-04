// =======================
// 📄 doc.js
// =======================

// ✅ Wait for DOM to load
document.addEventListener('DOMContentLoaded', () => {

  // ===========================
  // 🎉 Hide Loading Screen
  // ===========================
  const loadingScreen = document.getElementById('loading-screen');
  if (loadingScreen) {
    loadingScreen.classList.add('hidden');
  }

  // ===========================
  // 📌 Generate TOC
  // ===========================
  const tocNav = document.getElementById('toc-nav');
  if (tocNav) {
    const headings = document.querySelectorAll('.documentation h2, .documentation h3');
    const tocList = document.createElement('ul');

    headings.forEach(heading => {
      const text = heading.innerText;
      const id = heading.id || text.toLowerCase().replace(/\s+/g, '-');
      heading.id = id;

      const li = document.createElement('li');
      li.className = `toc-${heading.tagName.toLowerCase()}`;
      const a = document.createElement('a');
      a.href = `#${id}`;
      a.textContent = text;

      li.appendChild(a);
      tocList.appendChild(li);
    });

    tocNav.appendChild(tocList);
  }

  // ===========================
  // 📌 TOC Toggle & Close
  // ===========================
  const tocSidebar = document.getElementById('toc-sidebar');
  const tocToggle = document.getElementById('toc-toggle');
  const tocClose = document.getElementById('toc-close');

  if (tocToggle && tocSidebar) {
    tocToggle.addEventListener('click', () => {
      tocSidebar.classList.toggle('open');
    });
  }

  if (tocClose && tocSidebar) {
    tocClose.addEventListener('click', () => {
      tocSidebar.classList.remove('open');
    });
  }

  // ===========================
  // ⬆️ Back to Top Button
  // ===========================
  const backToTopBtn = document.getElementById('back-to-top');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
      backToTopBtn.style.display = 'flex';
    } else {
      backToTopBtn.style.display = 'none';
    }
  });

  backToTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // ===========================
  // 🌙 Theme Toggle
  // ===========================
  const themeToggle = document.getElementById('theme-toggle');
  const root = document.documentElement;

  // Check saved theme
  if (localStorage.getItem('theme') === 'dark') {
    root.setAttribute('data-theme', 'dark');
  }

  themeToggle.addEventListener('click', () => {
    if (root.getAttribute('data-theme') === 'dark') {
      root.removeAttribute('data-theme');
      localStorage.setItem('theme', 'light');
    } else {
      root.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme', 'dark');
    }
  });

  // ===========================
  // ✅ Highlight Active TOC Link on Scroll
  // ===========================
  const tocLinks = tocNav.querySelectorAll('a');

  window.addEventListener('scroll', () => {
    let current = '';
    headings.forEach(heading => {
      const sectionTop = heading.offsetTop - 80;
      if (window.scrollY >= sectionTop) {
        current = heading.getAttribute('id');
      }
    });

    tocLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });
  });

  // ===========================
  // ✅ Mermaid Init (if used)
  // ===========================
  if (window.mermaid) {
    mermaid.initialize({ startOnLoad: true });
  }
});