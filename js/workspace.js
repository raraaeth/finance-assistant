function jsonpRequest(

    params = {}

){

    return new Promise(

        (

            resolve,

            reject

        ) => {


            const callbackName =

                "__financeAssistantWorkspace_"

                +

                Date.now()

                +

                "_"

                +

                Math.random()

                .toString(

                    36

                )

                .slice(

                    2

                );


            const script =

                document.createElement(

                    "script"

                );


            const requestParams =

                new URLSearchParams();


            let timeout =

                null;


            /* =============================================
               ADD PARAMS
            ============================================= */

            Object.entries(

                params

            )

            .forEach(

                ([

                    key,

                    value

                ]) => {

                    if(

                        value !== undefined

                        &&

                        value !== null

                    ){

                        requestParams.set(

                            key,

                            value

                        );

                    }

                }

            );


            /* =============================================
               CALLBACK
            ============================================= */

            requestParams.set(

                "callback",

                callbackName

            );


            /* =============================================
               CLEANUP
            ============================================= */

            const cleanup = () => {

                if(

                    timeout

                ){

                    clearTimeout(

                        timeout

                    );

                }


                if(

                    window[

                        callbackName

                    ]

                ){

                    delete window[

                        callbackName

                    ];

                }


                if(

                    script.parentNode

                ){

                    script.remove();

                }

            };


            /* =============================================
               REGISTER CALLBACK
            ============================================= */

            window[

                callbackName

            ] = function(

                data

            ){

                cleanup();


                resolve(

                    data

                );

            };


            /* =============================================
               SCRIPT ERROR
            ============================================= */

            script.onerror = function(){

                cleanup();


                reject(

                    new Error(

                        "Gagal menghubungi Finance Assistant API"

                    )

                );

            };


            /* =============================================
               TIMEOUT
            ============================================= */

            timeout =

                setTimeout(

                    () => {

                        cleanup();


                        reject(

                            new Error(

                                "Request ke server timeout"

                            )

                        );

                    },

                    30000

                );


            /* =============================================
               BUILD URL
            ============================================= */

            script.src =

                getApiUrl()

                +

                "?"

                +

                requestParams.toString();


            /* =============================================
               SEND REQUEST
            ============================================= */

            document.head.appendChild(

                script

            );

        }

    );

}
