/* =====================================================
   Finance Assistant
   Page        : Payroll Monthly
   Module      : Insight
   File        : insight.js
   Version     : 2.0.0

   Description :
   Payroll Monthly Motivation Engine

   Sections :
   - State
   - Init
   - Short Motivation
   - Random Motivation
   - Helper
===================================================== */


/* =====================================================
   STATE
===================================================== */

export const Insight = {

    short : {

        text : "",

        period : "",

        start : null,

        end : null

    },


    long : {

        text : ""

    }

};


/* =====================================================
   MOTIVATION LIST
===================================================== */

const MOTIVATION_LIST = [

    "💪 Tetap semangat dan jaga konsistensimu. Sedikit demi sedikit, semuanya akan menjadi hasil yang berarti.",

    "🔥 Tetap lanjutkan langkahmu. Tidak harus sempurna setiap hari, yang penting kamu terus bergerak maju.",

    "🌱 Setiap hari adalah kesempatan untuk menjadi sedikit lebih baik dari hari sebelumnya. Tetap konsisten.",

    "🚀 Teruskan perjuanganmu. Apa yang kamu lakukan hari ini sedang membangun hasil yang akan kamu nikmati nanti.",

    "✨ Jangan remehkan kemajuan kecil. Konsistensi dari hal-hal sederhana bisa membawa perubahan besar.",

    "🎯 Tetap fokus pada prosesmu. Satu hari yang baik mungkin terasa kecil, tetapi kumpulan hari yang baik akan menjadi pencapaian besar.",

    "☀️ Jalani hari ini dengan tenang dan lakukan yang terbaik. Tidak perlu terburu-buru, yang penting terus maju.",

    "💚 Kamu tidak harus selalu sempurna. Cukup terus belajar, memperbaiki diri, dan menjaga langkahmu tetap berjalan.",

    "🔥 Pertahankan ritmemu. Setiap usaha yang kamu lakukan hari ini adalah bagian dari perjalanan menuju hasil yang lebih baik.",

    "🌟 Tetap percaya pada proses. Hasil besar sering kali dimulai dari kebiasaan kecil yang dilakukan berulang kali.",

    "💪 Jangan berhenti hanya karena progres terasa lambat. Selama kamu masih bergerak, kamu masih menuju ke depan.",

    "🌱 Terus jaga kebiasaan baikmu. Apa yang dilakukan secara konsisten akan jauh lebih berarti daripada usaha besar yang hanya sesekali.",

    "🎯 Fokus pada apa yang bisa kamu lakukan hari ini. Selesaikan satu per satu, dan biarkan hasilnya mengikuti.",

    "✨ Kamu sudah berjalan sejauh ini. Teruskan langkahmu dan jadikan setiap hari sebagai kesempatan untuk berkembang.",

    "🚀 Tidak perlu membandingkan perjalananmu dengan orang lain. Fokus pada progresmu sendiri dan terus tingkatkan sedikit demi sedikit."

];


/* =====================================================
   INIT
===================================================== */

Insight.init = function(){

    processShortMotivation();

    processRandomMotivation();


};


/* =====================================================
   SHORT MOTIVATION
===================================================== */

function processShortMotivation(){

    const today =

        new Date();


    const year =

        today.getFullYear();


    const month =

        today.getMonth();


    const day =

        today.getDate();


    let startDay;

    let endDay;

    let text;


    /* =============================================
       PERIODE 1 - 10
    ============================================= */

    if(

        day <= 10

    ){

        startDay = 1;

        endDay = 10;


        text =

            "Awal periode, saatnya membangun ritme yang baik.";

    }


    /* =============================================
       PERIODE 11 - 20
    ============================================= */

    else if(

        day <= 20

    ){

        startDay = 11;

        endDay = 20;


        text =

            "Pertahankan ritmemu, perjalanan masih terus berjalan.";

    }


    /* =============================================
       PERIODE 21 - AKHIR BULAN
    ============================================= */

    else {

        startDay = 21;


        endDay =

            new Date(

                year,

                month + 1,

                0

            ).getDate();


        text =

            "Sudah mendekati akhir bulan, tetap konsisten sampai selesai.";

    }


    const start =

        new Date(

            year,

            month,

            startDay

        );


    const end =

        new Date(

            year,

            month,

            endDay

        );


    Insight.short.start =

        start;


    Insight.short.end =

        end;


    Insight.short.period =

        `${startDay}-${endDay}`;


    Insight.short.text =

        text;

}


/* =====================================================
   RANDOM MOTIVATION
===================================================== */

function processRandomMotivation(){

    const index =

        Math.floor(

            Math.random() *

            MOTIVATION_LIST.length

        );


    Insight.long.text =

        MOTIVATION_LIST[index];

}


/* =====================================================
   GET SHORT MOTIVATION
===================================================== */

Insight.getShortMotivation = function(){

    return {

        ...Insight.short

    };

};


/* =====================================================
   GET RANDOM MOTIVATION
===================================================== */

Insight.getMotivation = function(){

    return Insight.long.text;

};


/* =====================================================
   GET COMPLETE INSIGHT
===================================================== */

Insight.getInsight = function(){

    return {

        short :

            {

                ...Insight.short

            },

        long :

            Insight.long.text

    };

};
