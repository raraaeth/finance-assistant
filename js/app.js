/**
 * ==============================================
 * Finance Assistant
 * Module      : App
 * File        : app.js
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



