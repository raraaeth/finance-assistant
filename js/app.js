import { loadUser } from "./storage.js";

const user = loadUser();

if(user?.onboardingCompleted){

    location.href="pages/dashboard/";

}else{

    location.href="pages/onboarding/";

}
