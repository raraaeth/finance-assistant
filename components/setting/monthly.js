/* =====================================================
   Finance Assistant
   Component    : Global Setting
   Module      : Payroll Monthly
   File        : monthly.js
   Version     : 1.0.0

   Description :
   Payroll Monthly Setting Definition

   Prototype :
   - Rule Periode
   - Rule Gaji
   - Rule Attendance
===================================================== */


/* =====================================================
   MONTHLY SETTING
===================================================== */

export const MonthlySetting = {


    /* =================================================
       HEADER
    ================================================= */

    title :

        "Pengaturan Payroll Monthly",


    subtitle :

        "Atur rule Payroll Monthly",


    /* =================================================
       SECTIONS
    ================================================= */

    sections : [

        /* =============================================
           RULE PERIODE
        ============================================= */

        {

            id :

                "periode",

            title :

                "📅 Rule Periode",

            description :

                "Aturan periode gaji.",

            resultTitle :

                "Periode Gaji"

        },


        /* =============================================
           RULE GAJI
        ============================================= */

        {

            id :

                "gaji",

            title :

                "💰 Rule Gaji",

            description :

                "Aturan gaji, tambahan dan potongan.",

            resultTitle :

                "Rule Gaji"

        },


        /* =============================================
           RULE ATTENDANCE
        ============================================= */

        {

            id :

                "attendance",

            title :

                "📅 Rule Attendance",

            description :

                "Aturan masuk, telat, izin dan lembur.",

            resultTitle :

                "Rule Attendance"

        }

    ]

};
