/* =====================================================
   Finance Assistant
   Component    : Global Update
   File         : update.js
   Version      : 1.0.0

   Description :
   Global Update Engine

   Handles :
   - Update field
   - Update full row
   - Target validation
   - Update request
   - Duplicate protection
   - JSONP request
   - Update response normalization

   Architecture :

   Component
       ↓
   Update.updateField()
   Update.updateRow()
       ↓
   Update.update()
       ↓
   Apps Script
       ↓
   main.gs
       ↓
   update.gs
       ↓
   Google Sheets
===================================================== */


/* =====================================================
   UPDATE STATE
===================================================== */

const Update = {

    /* -------------------------------------------------
       STATE
    ------------------------------------------------- */

    state: {

        busy: false,

        lastRequest: null,

        lastResponse: null,

        locks: new Set()

    },


    /* -------------------------------------------------
       INIT
    ------------------------------------------------- */

    init(){

        Update.state.busy = false;

        Update.state.lastRequest = null;

        Update.state.lastResponse = null;

        Update.state.locks.clear();

        return Update;

    },


    /* =================================================
       PUBLIC
       UPDATE FIELD
    ================================================= */

    async updateField(
        workspace,
        target,
        changes
    ){

        /* ---------------------------------------------
           VALIDATE WORKSPACE
        --------------------------------------------- */

        if(
            typeof workspace !== "string" ||
            !workspace.trim()
        ){

            return Update.error(
                "INVALID_WORKSPACE",
                "Workspace tidak valid."
            );

        }


        /* ---------------------------------------------
           VALIDATE TARGET
        --------------------------------------------- */

        const targetResult =
            Update.validateTarget(target);

        if(!targetResult.success){

            return targetResult;

        }


        /* ---------------------------------------------
           VALIDATE CHANGES
        --------------------------------------------- */

        const changesResult =
            Update.validateChanges(changes);

        if(!changesResult.success){

            return changesResult;

        }


        /* ---------------------------------------------
           BUILD DATA
        --------------------------------------------- */

        const data = {

            mode: "field",

            target: {

                id: target.id,

                project: target.project

            },

            changes: changesResult.changes

        };


        /* ---------------------------------------------
           SEND
        --------------------------------------------- */

        return Update.update(
            workspace,
            data
        );

    },


    /* =================================================
       PUBLIC
       UPDATE ROW
    ================================================= */

    async updateRow(
        workspace,
        target,
        row
    ){

        /* ---------------------------------------------
           VALIDATE WORKSPACE
        --------------------------------------------- */

        if(
            typeof workspace !== "string" ||
            !workspace.trim()
        ){

            return Update.error(
                "INVALID_WORKSPACE",
                "Workspace tidak valid."
            );

        }


        /* ---------------------------------------------
           VALIDATE TARGET
        --------------------------------------------- */

        const targetResult =
            Update.validateTarget(target);

        if(!targetResult.success){

            return targetResult;

        }


        /* ---------------------------------------------
           VALIDATE ROW
        --------------------------------------------- */

        if(
            !row ||
            typeof row !== "object" ||
            Array.isArray(row)
        ){

            return Update.error(
                "INVALID_ROW",
                "Data row harus berupa object."
            );

        }


        /* ---------------------------------------------
           ROW MUST HAVE ID
        --------------------------------------------- */

        if(
            row.id === undefined ||
            row.id === null ||
            String(row.id).trim() === ""
        ){

            return Update.error(
                "INVALID_ROW_ID",
                "Row harus memiliki ID."
            );

        }


        /* ---------------------------------------------
           TARGET ID MUST MATCH ROW ID
        --------------------------------------------- */

        if(
            String(row.id).trim() !==
            String(target.id).trim()
        ){

            return Update.error(
                "TARGET_ID_MISMATCH",
                "ID target dan ID row tidak sama."
            );

        }


        /* ---------------------------------------------
           BUILD DATA
        --------------------------------------------- */

        const data = {

            mode: "row",

            target: {

                id: target.id,

                project: target.project

            },

            row: {

                ...row

            }

        };


        /* ---------------------------------------------
           SEND
        --------------------------------------------- */

        return Update.update(
            workspace,
            data
        );

    },


    /* =================================================
       CORE UPDATE
    ================================================= */

    async update(
        workspace,
        data
    ){

        /* ---------------------------------------------
           VALIDATE
        --------------------------------------------- */

        if(
            typeof workspace !== "string" ||
            !workspace.trim()
        ){

            return Update.error(
                "INVALID_WORKSPACE",
                "Workspace tidak valid."
            );

        }


        if(
            !data ||
            typeof data !== "object" ||
            Array.isArray(data)
        ){

            return Update.error(
                "INVALID_DATA",
                "Data update tidak valid."
            );

        }


        if(
            data.mode !== "field" &&
            data.mode !== "row"
        ){

            return Update.error(
                "INVALID_MODE",
                "Mode update harus field atau row."
            );

        }


        /* ---------------------------------------------
           VALIDATE TARGET
        --------------------------------------------- */

        const targetResult =
            Update.validateTarget(data.target);

        if(!targetResult.success){

            return targetResult;

        }


        /* ---------------------------------------------
           SIGNATURE
        --------------------------------------------- */

        const signature =
            Update.createSignature(
                workspace,
                data
            );


        /* ---------------------------------------------
           DUPLICATE PROTECTION
        --------------------------------------------- */

        if(
            Update.state.locks.has(signature)
        ){

            return Update.error(
                "DUPLICATE_REQUEST",
                "Request update yang sama sedang diproses."
            );

        }


        Update.state.locks.add(signature);

        Update.state.busy = true;

        Update.state.lastRequest = {

            workspace,

            data,

            signature

        };


        try{

            /* -----------------------------------------
               SEND REQUEST
            ----------------------------------------- */

            const result =
                await Update.request(
                    workspace,
                    data
                );


            /* -----------------------------------------
               SAVE RESPONSE
            ----------------------------------------- */

            Update.state.lastResponse =
                result;


            return result;

        }

        catch(error){

            const message =
                error &&
                error.message
                    ? error.message
                    : String(error);


            const result =
                Update.error(
                    "UPDATE_REQUEST_FAILED",
                    message
                );


            Update.state.lastResponse =
                result;


            return result;

        }

        finally{

            Update.state.busy = false;

            Update.state.locks.delete(
                signature
            );

        }

    },


    /* =================================================
       REQUEST
    ================================================= */

    async request(
        workspace,
        data
    ){

        /* ---------------------------------------------
           GET SESSION
        --------------------------------------------- */

        const session =
            await Update.getSession();

        if(!session.success){

            return session;

        }


        /* ---------------------------------------------
           ENDPOINT
        --------------------------------------------- */

        const endpoint =
            Update.getEndpoint();

        if(
            !endpoint
        ){

            return Update.error(
                "ENDPOINT_NOT_FOUND",
                "Endpoint Apps Script tidak ditemukan."
            );

        }


        /* ---------------------------------------------
           CALLBACK
        --------------------------------------------- */

        const callback =
            Update.createCallbackName();


        /* ---------------------------------------------
           REQUEST URL
        --------------------------------------------- */

        const params = {

            action: "update",

            workspace,

            spreadsheetId:
                session.spreadsheetId,

            accessToken:
                session.accessToken,

            data:
                JSON.stringify(data),

            callback

        };


        const url =
            Update.buildUrl(
                endpoint,
                params
            );


        /* ---------------------------------------------
           JSONP
        --------------------------------------------- */

        return Update.jsonp(
            url,
            callback
        );

    },


    /* =================================================
       SESSION
    ================================================= */

    async getSession(){

        try{

            /* -----------------------------------------
               FINANCE ASSISTANT GLOBAL SESSION
            ----------------------------------------- */

            if(
                typeof Auth !== "undefined" &&
                Auth &&
                typeof Auth.getSession === "function"
            ){

                const result =
                    await Auth.getSession();


                if(
                    result &&
                    result.success
                ){

                    return {

                        success: true,

                        accessToken:
                            result.accessToken,

                        spreadsheetId:
                            result.spreadsheetId

                    };

                }

            }


            /* -----------------------------------------
               FALLBACK GLOBAL STORAGE
            ----------------------------------------- */

            const accessToken =
                localStorage.getItem(
                    "accessToken"
                );


            const spreadsheetId =
                localStorage.getItem(
                    "spreadsheetId"
                );


            if(
                accessToken &&
                spreadsheetId
            ){

                return {

                    success: true,

                    accessToken,

                    spreadsheetId

                };

            }


            return Update.error(
                "SESSION_NOT_FOUND",
                "Session Finance Assistant tidak ditemukan."
            );

        }

        catch(error){

            return Update.error(
                "SESSION_ERROR",
                error.message ||
                "Gagal membaca session."
            );

        }

    },


    /* =================================================
       ENDPOINT
    ================================================= */

    getEndpoint(){

        /* ---------------------------------------------
           CONFIG
        --------------------------------------------- */

        try{

            if(
                typeof CONFIG !== "undefined"
            ){

                if(
                    CONFIG.endpoint
                ){

                    return CONFIG.endpoint;

                }


                if(
                    CONFIG.api &&
                    CONFIG.api.endpoint
                ){

                    return CONFIG.api.endpoint;

                }

            }

        }

        catch(error){

            console.warn(
                "[Update] CONFIG endpoint error:",
                error
            );

        }


        /* ---------------------------------------------
           GLOBAL API
        --------------------------------------------- */

        try{

            if(
                typeof API !== "undefined"
            ){

                if(
                    API.endpoint
                ){

                    return API.endpoint;

                }

            }

        }

        catch(error){

            console.warn(
                "[Update] API endpoint error:",
                error
            );

        }


        return null;

    },


    /* =================================================
       BUILD URL
    ================================================= */

    buildUrl(
        endpoint,
        params
    ){

        const query = [];

        Object.keys(params)
            .forEach(key => {

                const value =
                    params[key];

                if(
                    value === undefined ||
                    value === null
                ){

                    return;

                }


                query.push(

                    encodeURIComponent(key) +
                    "=" +
                    encodeURIComponent(value)

                );

            });


        const separator =
            endpoint.includes("?")
                ? "&"
                : "?";


        return (
            endpoint +
            separator +
            query.join("&")
        );

    },


    /* =================================================
       JSONP
    ================================================= */

    jsonp(
        url,
        callback
    ){

        return new Promise(
            (resolve, reject) => {

                const script =
                    document.createElement(
                        "script"
                    );


                let finished = false;


                /* -------------------------------------
                   CLEANUP
                ------------------------------------- */

                const cleanup = () => {

                    try{

                        script.remove();

                    }
                    catch(error){}


                    try{

                        delete window[callback];

                    }
                    catch(error){}

                };


                /* -------------------------------------
                   SUCCESS CALLBACK
                ------------------------------------- */

                window[callback] = (
                    response
                ) => {

                    if(finished){

                        return;

                    }


                    finished = true;

                    cleanup();


                    resolve(
                        Update.normalizeResponse(
                            response
                        )
                    );

                };


                /* -------------------------------------
                   ERROR
                ------------------------------------- */

                script.onerror = () => {

                    if(finished){

                        return;

                    }


                    finished = true;

                    cleanup();


                    reject(
                        new Error(
                            "Gagal menghubungi Apps Script."
                        )
                    );

                };


                /* -------------------------------------
                   REQUEST
                ------------------------------------- */

                script.src =
                    url;


                document.head.appendChild(
                    script
                );

            }
        );

    },


    /* =================================================
       TARGET VALIDATION
    ================================================= */

    validateTarget(target){

        if(
            !target ||
            typeof target !== "object" ||
            Array.isArray(target)
        ){

            return Update.error(
                "INVALID_TARGET",
                "Target update harus berupa object."
            );

        }


        if(
            target.id === undefined ||
            target.id === null ||
            String(target.id).trim() === ""
        ){

            return Update.error(
                "INVALID_TARGET_ID",
                "Target harus memiliki ID."
            );

        }


        if(
            target.project === undefined ||
            target.project === null ||
            String(target.project).trim() === ""
        ){

            return Update.error(
                "INVALID_TARGET_PROJECT",
                "Target harus memiliki project."
            );

        }


        return {

            success: true,

            target: {

                id:
                    String(target.id).trim(),

                project:
                    String(target.project).trim()

            }

        };

    },


    /* =================================================
       CHANGES VALIDATION
    ================================================= */

    validateChanges(changes){

        if(
            !changes ||
            typeof changes !== "object" ||
            Array.isArray(changes)
        ){

            return Update.error(
                "INVALID_CHANGES",
                "Changes harus berupa object."
            );

        }


        const keys =
            Object.keys(changes);


        if(
            keys.length === 0
        ){

            return Update.error(
                "EMPTY_CHANGES",
                "Tidak ada field yang akan di-update."
            );

        }


        /* ---------------------------------------------
           ID / PROJECT CANNOT BE CHANGED
           IN FIELD MODE
        --------------------------------------------- */

        if(
            Object.prototype.hasOwnProperty.call(
                changes,
                "id"
            )
        ){

            return Update.error(
                "IMMUTABLE_ID",
                "ID tidak boleh diubah menggunakan updateField()."
            );

        }


        if(
            Object.prototype.hasOwnProperty.call(
                changes,
                "project"
            )
        ){

            return Update.error(
                "IMMUTABLE_PROJECT",
                "Project tidak boleh diubah menggunakan updateField()."
            );

        }


        return {

            success: true,

            changes: {

                ...changes

            }

        };

    },


    /* =================================================
       SIGNATURE
    ================================================= */

    createSignature(
        workspace,
        data
    ){

        let serialized = "";

        try{

            serialized =
                JSON.stringify(
                    data
                );

        }
        catch(error){

            serialized =
                String(data);

        }


        return [

            workspace,

            data.mode,

            serialized

        ].join("|");

    },


    /* =================================================
       CALLBACK NAME
    ================================================= */

    createCallbackName(){

        return (
            "__FA_UPDATE_" +
            Date.now() +
            "_" +
            Math.random()
                .toString(36)
                .substring(2, 10)
        );

    },


    /* =================================================
       NORMALIZE RESPONSE
    ================================================= */

    normalizeResponse(response){

        /* ---------------------------------------------
           NULL RESPONSE
        --------------------------------------------- */

        if(
            response === undefined ||
            response === null
        ){

            return {

                success: false,

                code: "EMPTY_RESPONSE",

                message:
                    "Apps Script mengembalikan response kosong."

            };

        }


        /* ---------------------------------------------
           STRING RESPONSE
        --------------------------------------------- */

        if(
            typeof response === "string"
        ){

            try{

                response =
                    JSON.parse(
                        response
                    );

            }
            catch(error){

                return {

                    success: false,

                    code: "INVALID_RESPONSE",

                    message:
                        response

                };

            }

        }


        /* ---------------------------------------------
           OBJECT RESPONSE
        --------------------------------------------- */

        if(
            typeof response !== "object"
        ){

            return {

                success: false,

                code: "INVALID_RESPONSE",

                message:
                    "Format response tidak valid."

            };

        }


        return response;

    },


    /* =================================================
       ERROR
    ================================================= */

    error(
        code,
        message,
        extra = {}
    ){

        return {

            success: false,

            code,

            message,

            ...extra

        };

    },


    /* =================================================
       STATUS
    ================================================= */

    isBusy(){

        return Update.state.busy;

    },


    /* =================================================
       LAST RESPONSE
    ================================================= */

    getLastResponse(){

        return Update.state.lastResponse;

    },


    /* =================================================
       RESET
    ================================================= */

    reset(){

        Update.state.busy = false;

        Update.state.lastRequest = null;

        Update.state.lastResponse = null;

        Update.state.locks.clear();

        return Update;

    }

};


/* =====================================================
   INITIALIZE
===================================================== */

Update.init();


/* =====================================================
   EXPORT
===================================================== */

export default Update;
