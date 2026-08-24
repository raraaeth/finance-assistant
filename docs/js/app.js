import { initRouter } from "./router.js";
import { initSidebar } from "./sidebar.js";


/* =========================================================
   FINANCE ASSISTANT — DOCUMENTATION
   Application Entry Point
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

  initRouter();
  initSidebar();

});
