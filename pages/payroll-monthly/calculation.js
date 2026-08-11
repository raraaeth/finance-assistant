/* =====================================================
   Finance Assistant
   Page        : Payroll Monthly
   Module      : Calculation
   File        : calculation.js
   Version     : 1.0.0

   Description :
   Payroll Calculation Engine

   Principle :
   - Rules menjadi sumber aturan gaji
   - Attendance menjadi sumber riwayat kehadiran
   - Period menjadi sumber periode payroll

   Sections :
   - Import
   - State
   - Init
   - Process
   - Earnings
   - Deductions
   - Overtime
   - Helper
===================================================== */


/* =====================================================
   IMPORT
===================================================== */

import {

    Period

} from "./period.js";

import {

    Rules

} from "./rules.js";

import {

    Attendance

} from "./attendance.js";


/* =====================================================
   STATE
===================================================== */

export const Calculation = {

    data : {

        period : null,

        attendance : [],

        earnings : [],

        deductions : [],

        gajiPokok : 0,

        totalEarnings : 0,

        totalDeductions : 0,

        grossSalary : 0,

        netSalary : 0

    }

};


/* =====================================================
   INIT
===================================================== */

Calculation.init = function(){

    processCalculation();

};


/* =====================================================
   PROCESS CALCULATION
===================================================== */

function processCalculation(){

    const period =

        Period.data;


    const attendance =

        Attendance.data ?? [];


    /*
       Filter attendance berdasarkan
       periode payroll.
    */

    const periodAttendance =

        filterAttendanceByPeriod(

            attendance,

            period

        );


    const earnings =

        [];


    const deductions =

        [];


    /* =============================================
       GAJI POKOK
    ============================================= */

    const gajiRule =

        findRule(

            Rules.data.gaji,

            "gaji"

        );


    const gajiPokok =

        gajiRule

        ?

        toNumber(

            gajiRule.nominal

        )

        :

        0;


    /* =============================================
       TAMBAHAN
    ============================================= */

    processTambah(

        periodAttendance,

        earnings

    );


    /* =============================================
       GAJI POKOK
       Masuk sebagai komponen terpisah
    ============================================= */

    earnings.unshift({

        nama :

            "gaji",

        label :

            "Gaji Pokok",

        nominal :

            gajiPokok,

        jumlah :

            1,

        total :

            gajiPokok

    });


    /* =============================================
       POTONGAN
    ============================================= */

    processPotong(

        periodAttendance,

        deductions

    );


    /* =============================================
       TOTAL
    ============================================= */

    const totalEarnings =

        earnings.reduce(

            (

                total,

                item

            ) =>

                total +

                toNumber(

                    item.total

                ),

            0

        );


    const totalDeductions =

        deductions.reduce(

            (

                total,

                item

            ) =>

                total +

                toNumber(

                    item.total

                ),

            0

        );


    const grossSalary =

        totalEarnings;


    const netSalary =

        grossSalary -

        totalDeductions;


    /* =============================================
       SAVE
    ============================================= */

    Calculation.data = {

        period :

            period,

        attendance :

            periodAttendance,

        earnings :

            earnings,

        deductions :

            deductions,

        gajiPokok :

            gajiPokok,

        totalEarnings :

            totalEarnings,

        totalDeductions :

            totalDeductions,

        grossSalary :

            grossSalary,

        netSalary :

            netSalary

    };


    /* =============================================
       DEBUG
    ============================================= */

    console.log(

        "========== PAYROLL CALCULATION =========="

    );

    console.log(

        "PAYROLL PERIOD:",

        period

    );

    console.log(

        "PAYROLL ATTENDANCE:",

        periodAttendance

    );

    console.log(

        "PAYROLL EARNINGS:",

        earnings

    );

    console.log(

        "PAYROLL DEDUCTIONS:",

        deductions

    );

    console.log(

        "PAYROLL TOTAL EARNINGS:",

        totalEarnings

    );

    console.log(

        "PAYROLL TOTAL DEDUCTIONS:",

        totalDeductions

    );

    console.log(

        "PAYROLL NET SALARY:",

        netSalary

    );

}


/* =====================================================
   PROCESS TAMBAH
===================================================== */

function processTambah(

    attendance,

    result

){

    const rules =

        Rules.data.tambah ?? [];


    rules.forEach(

        rule => {

            /*
               Rule periode / gaji

               Contoh:

               tunjangan
               uang_transport
            */

            if(

                rule.kondisi ===

                    "periode"

                &&

                rule.waktu ===

                    "gaji"

            ){

                addComponent(

                    result,

                    rule,

                    1

                );

                return;

            }


            /*
               Rule harian

               Contoh:

               uang_makan
               lembur harian
            */

            if(

                rule.waktu ===

                "harian"

            ){

                let jumlah =

                    0;


                if(

                    rule.kondisi

                    ?.split(",")

                    .includes(

                        "masuk"

                    )

                ){

                    jumlah +=

                        countStatus(

                            attendance,

                            "masuk"

                        );

                }


                if(

                    rule.kondisi

                    ?.split(",")

                    .includes(

                        "lembur"

                    )

                ){

                    jumlah +=

                        countStatus(

                            attendance,

                            "lembur"

                        );

                }


                /*
                   Untuk rule lembur_harian,
                   hanya hitung status lembur.
                */

                if(

                    rule.kondisi ===

                    "lembur_harian"

                ){

                    jumlah =

                        countStatus(

                            attendance,

                            "lembur"

                        );

                }


                if(

                    jumlah > 0

                ){

                    addComponent(

                        result,

                        rule,

                        jumlah

                    );

                }

                return;

            }


            /*
               Rule jam

               Diproses khusus untuk
               lembur jam.
            */

            if(

                rule.waktu ===

                "jam"

                &&

                rule.nama?.startsWith(

                    "lembur_jam"

                )

            ){

                return;

            }

        }

    );


    /*
       Lembur jam diproses terpisah
       agar aturan berjenjang bisa
       diterapkan.
    */

    processOvertimeHours(

        attendance,

        result

    );

}


/* =====================================================
   PROCESS POTONG
===================================================== */

function processPotong(

    attendance,

    result

){

    const rules =

        Rules.data.potong ?? [];


    rules.forEach(

        rule => {

            /* =====================================
               POTONGAN PERIODE
            ===================================== */

            if(

                rule.kondisi ===

                    "periode"

                &&

                rule.waktu ===

                    "gaji"

            ){

                addComponent(

                    result,

                    rule,

                    1

                );

                return;

            }


            /* =====================================
               POTONGAN TELAT
            ===================================== */

            if(

                rule.kondisi ===

                    "telat"

                &&

                rule.waktu ===

                    "menit"

            ){

                const jumlah =

                    countLateRule(

                        attendance,

                        rule

                    );


                if(

                    jumlah > 0

                ){

                    addComponent(

                        result,

                        rule,

                        jumlah

                    );

                }

                return;

            }


            /* =====================================
               IZIN TELAT
            ===================================== */

            if(

                rule.kondisi ===

                    "izin_telat"

            ){

                const hours =

                    sumAttendanceValue(

                        attendance,

                        "izinTelatHours"

                    );


                if(

                    hours > 0

                ){

                    addComponent(

                        result,

                        rule,

                        hours

                    );

                }

                return;

            }


            /* =====================================
               IZIN PULANG
            ===================================== */

            if(

                rule.kondisi ===

                    "izin_pulang"

            ){

                const hours =

                    sumAttendanceValue(

                        attendance,

                        "izinPulangHours"

                    );


                if(

                    hours > 0

                ){

                    addComponent(

                        result,

                        rule,

                        hours

                    );

                }

                return;

            }


            /* =====================================
               ABSEN
            ===================================== */

            if(

                rule.kondisi ===

                    "absen"

                &&

                rule.waktu ===

                    "harian"

            ){

                const jumlah =

                    countStatus(

                        attendance,

                        "absen"

                    );


                if(

                    jumlah > 0

                ){

                    addComponent(

                        result,

                        rule,

                        jumlah

                    );

                }

            }

        }

    );

}


/* =====================================================
   PROCESS OVERTIME HOURS
===================================================== */

function processOvertimeHours(

    attendance,

    result

){

    const totalHours =

        attendance.reduce(

            (

                total,

                item

            ) =>

                total +

                toNumber(

                    item.overtimeHours

                ),

            0

        );


    if(

        totalHours <= 0

    ){

        return;

    }


    const rules =

        Rules.data.tambah

        ?.filter(

            rule =>

                rule.waktu ===

                    "jam"

                &&

                rule.nama

                ?.startsWith(

                    "lembur_jam"

                )

        )

        ?? [];


    if(

        rules.length === 0

    ){

        return;

    }


    /*
       Urutkan berdasarkan
       nilai_start.

       Contoh:

       jam_1 → 1
       jam_2 → 2
       jam_3 → 3
       jam_4 → 4
    */

    rules.sort(

        (

            a,

            b

        ) =>

            toNumber(

                a.nilai_start

            )

            -

            toNumber(

                b.nilai_start

            )

    );


    /*
       Hitung satu per satu jam.

       Contoh:

       3 jam

       Jam 1 → rule 1
       Jam 2 → rule 2
       Jam 3 → rule 2

       Jika ada rule 3:

       Jam 3 → rule 3
    */

    for(

        let hour = 1;

        hour <= totalHours;

        hour++

    ){

        const rule =

            findOvertimeHourRule(

                rules,

                hour

            );


        if(

            !rule

        ){

            continue;

        }


        const existing =

            result.find(

                item =>

                    item.nama ===

                    rule.nama

            );


        if(

            existing

        ){

            existing.jumlah++;

            existing.total +=

                toNumber(

                    rule.nominal

                );

        }

        else {

            result.push({

                nama :

                    rule.nama,

                label :

                    formatLabel(

                        rule.nama

                    ),

                nominal :

                    toNumber(

                        rule.nominal

                    ),

                jumlah :

                    1,

                total :

                    toNumber(

                        rule.nominal

                    )

            });

        }

    }

}


/* =====================================================
   FIND OVERTIME HOUR RULE
===================================================== */

function findOvertimeHourRule(

    rules,

    hour

){

    /*
       Cari rule yang secara eksplisit
       mencakup jam tersebut.
    */

    const rangedRule =

        rules.find(

            rule => {

                const start =

                    toNumber(

                        rule.nilai_start

                    );


                const end =

                    toNumber(

                        rule.nilai_end

                    );


                if(

                    start <= 0

                ){

                    return false;

                }


                /*
                   Jika end kosong,
                   rule berlaku mulai start
                   dan seterusnya.

                   Ini membuat:

                   lembur_jam_1
                   start = 1

                   tetap bisa menjadi
                   fallback apabila diperlukan.
                */

                if(

                    !end

                ){

                    return hour >= start;

                }


                return (

                    hour >= start

                )

                &&

                (

                    hour <= end

                );

            }

        );


    if(

        rangedRule

    ){

        /*
           Jangan langsung memakai rule
           start=1 untuk semua jam jika
           ada rule yang lebih spesifik.

           Cari rule dengan start terbesar
           yang masih <= jam.
        */

        const candidates =

            rules.filter(

                rule => {

                    const start =

                        toNumber(

                            rule.nilai_start

                        );


                    return (

                        start > 0

                    )

                    &&

                    (

                        start <= hour

                    )

                    &&

                    (

                        !rule.nilai_end

                        ||

                        hour <=

                        toNumber(

                            rule.nilai_end

                        )

                    );

                }

            );


        candidates.sort(

            (

                a,

                b

            ) =>

                toNumber(

                    b.nilai_start

                )

                -

                toNumber(

                    a.nilai_start

                )

        );


        return candidates[0] ?? null;

    }


    return null;

}


/* =====================================================
   ADD COMPONENT
===================================================== */

function addComponent(

    result,

    rule,

    jumlah

){

    const nominal =

        toNumber(

            rule.nominal

        );


    result.push({

        nama :

            rule.nama,

        label :

            formatLabel(

                rule.nama

            ),

        nominal :

            nominal,

        jumlah :

            jumlah,

        total :

            nominal *

            jumlah

    });

}


/* =====================================================
   FILTER ATTENDANCE
===================================================== */

function filterAttendanceByPeriod(

    attendance,

    period

){

    if(

        !period

        ||

        !period.start

        ||

        !period.end

    ){

        return [];

    }


    const start =

        startOfDay(

            period.start

        );


    const end =

        endOfDay(

            period.end

        );


    return attendance.filter(

        item => {

            if(

                !item.dateObject

            ){

                return false;

            }


            return (

                item.dateObject >=

                start

            )

            &&

            (

                item.dateObject <=

                end

            );

        }

    );

}


/* =====================================================
   COUNT STATUS
===================================================== */

function countStatus(

    attendance,

    status

){

    return attendance.filter(

        item =>

            item.status ===

            status

    ).length;

}


/* =====================================================
   COUNT LATE RULE
===================================================== */

function countLateRule(

    attendance,

    rule

){

    return attendance.filter(

        item =>

            item.lateRule ===

            rule.nama

    ).length;

}


/* =====================================================
   SUM ATTENDANCE VALUE
===================================================== */

function sumAttendanceValue(

    attendance,

    property

){

    return attendance.reduce(

        (

            total,

            item

        ) =>

            total +

            toNumber(

                item[property]

            ),

        0

    );

}


/* =====================================================
   FIND RULE
===================================================== */

function findRule(

    rules,

    name

){

    return (

        rules ?? []

    ).find(

        rule =>

            rule.nama ===

            name

    );

}


/* =====================================================
   FORMAT LABEL
===================================================== */

function formatLabel(

    value

){

    if(

        !value

    ){

        return "-";

    }


    return String(

        value

    )

    .replace(

        /_/g,

        " "

    )

    .replace(

        /\b\w/g,

        letter =>

            letter.toUpperCase()

    );

}


/* =====================================================
   NUMBER
===================================================== */

function toNumber(

    value

){

    if(

        value ===

            null

        ||

        value ===

            undefined

        ||

        value ===

            ""

    ){

        return 0;

    }


    const number =

        Number(

            value

        );


    return Number.isFinite(

        number

    )

        ?

        number

        :

        0;

}


/* =====================================================
   START OF DAY
===================================================== */

function startOfDay(

    date

){

    const result =

        new Date(

            date

        );


    result.setHours(

        0,

        0,

        0,

        0

    );


    return result;

}


/* =====================================================
   END OF DAY
===================================================== */

function endOfDay(

    date

){

    const result =

        new Date(

            date

        );


    result.setHours(

        23,

        59,

        59,

        999

    );


    return result;

}
