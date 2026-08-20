/* =====================================================
   Finance Assistant
   FILE : pwa.js
   DESCRIPTION : PWA Service Worker Registration
===================================================== */


if (

    "serviceWorker" in navigator

){

    window.addEventListener(

        "load",

        () => {

            navigator.serviceWorker.register(

                "/finance-assistant/sw.js",

                {

                    scope :

                        "/finance-assistant/pages/"

                }

            )

            .then(

                registration => {

                    console.log(

                        "Finance Assistant PWA aktif.",

                        registration.scope

                    );

                }

            )

            .catch(

                error => {

                    console.error(

                        "PWA Service Worker gagal:",

                        error

                    );

                }

            );

        }

    );

}
