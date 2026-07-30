/**
 * ==============================================
 * Finance Assistant
 * Module      : App
 * File        : app.js
 * Version     : 1.0.0
 *
 * Description :
 * Entry point aplikasi.
 * Selama development langsung membuka Onboarding.
 * ==============================================
 */

import { loadUser } from "./storage.js";

const user = loadUser();

if (user?.onboardingCompleted) {

    location.replace(
        "pages/dashboard/index.html"
    );

} else {

    location.replace(
        "pages/onboarding/index.html"
    );

}
