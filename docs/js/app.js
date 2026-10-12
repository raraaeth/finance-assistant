
/* =========================================================
   FINANCE ASSISTANT — DOCUMENTATION
   Application Entry Point
   File         : app.js
   ========================================================= */

import { initRouter } from "./router.js";
import { initSidebar } from "./sidebar.js";
import { initSidebarFooter } from "./footer.js";


document.addEventListener("DOMContentLoaded", () => {

  initSidebar();

  initSidebarFooter();

  initRouter();

});
