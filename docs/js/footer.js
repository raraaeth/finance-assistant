
/* =====================================================
   Finance Assistant
   Documentation
   Component    : Sidebar Footer
   File         : footer.js
   ===================================================== */

const sidebarContent =
  document.getElementById("sidebarContent");


/* =====================================================
   1. RENDER SIDEBAR FOOTER
   ===================================================== */

function renderSidebarFooter() {

  if (!sidebarContent) {
    return;
  }

  /*
   * Hindari footer ganda jika fungsi dipanggil ulang.
   */

  const existingFooter =
    sidebarContent.querySelector(".sidebar-footer");

  if (existingFooter) {
    existingFooter.remove();
  }

  const footer =
    document.createElement("footer");

  footer.className =
    "sidebar-footer";

  footer.innerHTML = `

    <nav
      class="sidebar-footer-links"
      aria-label="Tautan informasi"
    >

      <a href="/">
        Beranda
      </a>

      <a href="/pages/dashboard">
        Dashboard
      </a>

      <a href="/pages/">
        Home App
      </a>

      <a href="/news/">
        News and Update
      </a>

      <a href="/privacy/">
        Privacy Policy
      </a>

      <a href="/terms/">
        Terms of Service
      </a>

      <a href="/app/">
        About App
      </a>

      <a href="/contact/">
        Contact &amp; Feedback
      </a>

      <a href="/sitemap/">
        Sitemap
      </a>

    </nav>

  `;

  /*
   * Footer diletakkan setelah semua kategori
   * artikel di dalam sidebar.
   */

  sidebarContent.appendChild(footer);

}


/* =====================================================
   2. INITIALIZE
   ===================================================== */

renderSidebarFooter();
