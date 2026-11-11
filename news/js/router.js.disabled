/* =====================================================
   FINANCE ASSISTANT
   NEWS & UPDATE

   File    : /news/js/router.js
   Version : 1.0.0

   Description :
   News URL Router.

   Handles :
   - Clean URL
   - News home
   - Article route
===================================================== */


/* =====================================================
   ROUTER
===================================================== */

const router = {


    /* =================================================
       INIT
    ================================================= */

    init(){

        this.render();

    },


    /* =================================================
       GET PATH
    ================================================= */

    getPath(){

        let path =
            window.location.pathname;


        /*
           Hilangkan trailing slash.

           Contoh:

           /news/
           ↓
           /news

           /news/artikel01/
           ↓
           /news/artikel01
        */

        path =
            path.replace(
                /\/+$/,
                ""
            );


        /*
           Jika root menjadi kosong,
           kembalikan /news.
        */

        if(
            path === ""
        ){

            path =
                "/news";

        }


        return path;

    },


    /* =================================================
       GET ROUTE
    ================================================= */

    getRoute(){

        const path =
            this.getPath();


        /*
           News Home
        */

        if(
            path === "/news"
        ){

            return {

                type: "home",

                slug: null

            };

        }


        /*
           Article

           /news/artikel01
        */

        const prefix =
            "/news/";


        if(
            path.startsWith(
                prefix
            )
        ){

            const slug =
                path
                    .slice(
                        prefix.length
                    )
                    .replace(
                        /\/+$/,
                        ""
                    );


            if(
                slug
            ){

                return {

                    type: "article",

                    slug

                };

            }

        }


        /*
           Tidak ditemukan
        */

        return {

            type: "not-found",

            slug: null

        };

    },


    /* =================================================
       RENDER
    ================================================= */

    render(){

        const route =
            this.getRoute();


        /*
           Renderer akan kita sambungkan
           pada tahap berikutnya.

           Untuk sekarang router hanya
           menentukan halaman.
        */

        window.dispatchEvent(

            new CustomEvent(
                "news:route",
                {
                    detail: route
                }
            )

        );

    },


    /* =================================================
       NAVIGATE
    ================================================= */

    navigate(
        path
    ){

        if(
            !path
        ){
            return;
        }


        window.history.pushState(
            {},
            "",
            path
        );


        this.render();

    }


};


/* =====================================================
   BROWSER HISTORY
===================================================== */

window.addEventListener(
    "popstate",
    () => {

        router.render();

    }
);


/* =====================================================
   EXPORT
===================================================== */

export default router;
