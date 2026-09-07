/* =====================================================
   Finance Assistant
   Documentation
   Component    : Footer
   File         : footer.js
   ===================================================== */

const footer = document.getElementById("docsFooter");


if (footer) {

  footer.innerHTML = `

    <footer class="docs-footer">

      <nav
        class="docs-footer-links"
        aria-label="Tautan informasi"
      >

       <a href="/">
          Home
        </a>

        <span>*</span>
        
        <a href="/privacy/">
          Privacy Policy
        </a>

        <span>*</span>


        <a href="/terms/">
          Terms of Service
        </a>

        <span>*</span>


        <a href="/docs/">
          User Guide
        </a>

        <span>*</span>


        <a href="/app/">
          About App
        </a>

      </nav>

    </footer>

  `;

}
