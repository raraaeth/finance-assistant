/* =====================================================
   Finance Assistant
   Component    : Global Setting
   Module       : Financial
   File         : financial.js
   Version      : 2.0.0

   Description :
   Financial Setting Definition

   Structure :
   - Penentuan Rule
   - Activity Pemasukan
   - Activity Pengeluaran
   - Activity Hutang
   - Activity Tabungan

   Principle :
   - Rule Pemasukan wajib
   - Rule Pengeluaran wajib
   - Rule Hutang opsional
   - Rule Tabungan opsional

   Dependency :
   - rule_hutang
       → hutang_piutang

   - rule_tabungan
       → dana_darurat
       → tabungan_kaleng

   Output :
   Satu rule menghasilkan satu result.
   Multiple activity digabung dengan koma.

   Contoh :

   {
       rules :
           "rule_pemasukan",

       type :
           "masuk,hutang,tarik",

       activity :
           "gaji,penghasilan_lain"
   }
===================================================== */


/* =====================================================
   FINANCIAL SETTING
===================================================== */

export const FinancialSetting = {


    /* =================================================
       HEADER
    ================================================= */

    title :

        "Pengaturan Financial",


    subtitle :

        "Atur rule dan activity financial",


    /* =================================================
       SECTIONS
    ================================================= */

    sections : [


        /* =================================================
           PENENTUAN RULE
        ================================================= */

        {

            id :

                "financial_rule",


            title :

                "⚙️ Penentuan Rule",


            description :

                "Tentukan rule Financial yang akan digunakan.",


            addLabel :

                "＋ Tambah Konfigurasi",


            formAddLabel :

                "＋ Simpan Konfigurasi",


            deleteLabel :

                "Hapus",


            autoCloseForm :

                true,


            uniqueFields : [

                "rule_pemasukan",

                "rule_pengeluaran",

                "rule_hutang",

                "rule_tabungan"

            ],


            fields : [


                /* =========================================
                   RULE PEMASUKAN
                ========================================= */

                {

                    name :

                        "rule_pemasukan",


                    label :

                        "Gunakan Rule Pemasukan",


                    type :

                        "checkbox",


                    required :

                        false,


                    value :

                        true

                },


                /* =========================================
                   RULE PENGELUARAN
                ========================================= */

                {

                    name :

                        "rule_pengeluaran",


                    label :

                        "Gunakan Rule Pengeluaran",


                    type :

                        "checkbox",


                    required :

                        false,


                    value :

                        true

                },


                /* =========================================
                   RULE HUTANG
                ========================================= */

                {

                    name :

                        "rule_hutang",


                    label :

                        "Gunakan Rule Hutang",


                    type :

                        "checkbox",


                    required :

                        false,


                    value :

                        false,


                    note :

                        "Opsional. Jika diaktifkan, activity Hutang / Piutang akan tersedia pada Financial."

                },


                /* =========================================
                   RULE TABUNGAN
                ========================================= */

                {

                    name :

                        "rule_tabungan",


                    label :

                        "Gunakan Rule Tabungan",


                    type :

                        "checkbox",


                    required :

                        false,


                    value :

                        false,


                    note :

                        "Opsional. Jika diaktifkan, activity Dana Darurat dan Tabungan Kaleng akan tersedia pada Financial."

                }

            ],


            /* =============================================
               NORMALIZE
            ============================================= */

            normalize :

                function(

                    data

                ){

                    /* =====================================
                       PEMASUKAN WAJIB
                    ===================================== */

                    if(

                        !data.rule_pemasukan

                    ){

                        alert(

                            "Rule Pemasukan wajib digunakan."

                        );


                        return null;

                    }


                    /* =====================================
                       PENGELUARAN WAJIB
                    ===================================== */

                    if(

                        !data.rule_pengeluaran

                    ){

                        alert(

                            "Rule Pengeluaran wajib digunakan."

                        );


                        return null;

                    }


                    /* =====================================
                       ACTIVE RULE
                    ===================================== */

                    const activeRules = [

                        "rule_pemasukan",

                        "rule_pengeluaran"

                    ];


                    if(

                        data.rule_hutang

                    ){

                        activeRules.push(

                            "rule_hutang"

                        );

                    }


                    if(

                        data.rule_tabungan

                    ){

                        activeRules.push(

                            "rule_tabungan"

                        );

                    }


                    return {

                        type_rule :

                            "financial",


                        rules :

                            activeRules.join(

                                ","

                            ),


                        rule_pemasukan :

                            Boolean(

                                data.rule_pemasukan

                            ),


                        rule_pengeluaran :

                            Boolean(

                                data.rule_pengeluaran

                            ),


                        rule_hutang :

                            Boolean(

                                data.rule_hutang

                            ),


                        rule_tabungan :

                            Boolean(

                                data.rule_tabungan

                            )

                    };

                }

        },


        /* =================================================
           ACTIVITY PEMASUKAN
        ================================================= */

        {

            id :

                "financial_activity_pemasukan",


            title :

                "💰 Activity Pemasukan",


            description :

                "Pilih activity yang tersedia untuk pemasukan.",


            addLabel :

                "＋ Tambah Activity",


            formAddLabel :

                "＋ Simpan Activity",


            deleteLabel :

                "Hapus",


            autoCloseForm :

                true,


            uniqueFields : [

                "activity"

            ],


            fields : [


                /* =========================================
                   GAJI
                ========================================= */

                {

                    name :

                        "activity_gaji",


                    label :

                        "Gaji",


                    type :

                        "checkbox",


                    required :

                        false,


                    value :

                        false

                },


                /* =========================================
                   PENGHASILAN LAIN
                ========================================= */

                {

                    name :

                        "activity_penghasilan_lain",


                    label :

                        "Penghasilan Lain",


                    type :

                        "checkbox",


                    required :

                        false,


                    value :

                        false

                },


                /* =========================================
                   HUTANG / PIUTANG
                ========================================= */

                {

                    name :

                        "activity_hutang_piutang",


                    label :

                        "Hutang / Piutang",


                    type :

                        "checkbox",


                    required :

                        false,


                    value :

                        false,


                    dependsOnRule :

                        "rule_hutang"

                },


                /* =========================================
                   DANA DARURAT
                ========================================= */

                {

                    name :

                        "activity_dana_darurat",


                    label :

                        "Dana Darurat",


                    type :

                        "checkbox",


                    required :

                        false,


                    value :

                        false,


                    dependsOnRule :

                        "rule_tabungan"

                },


                /* =========================================
                   TABUNGAN KALENG
                ========================================= */

                {

                    name :

                        "activity_tabungan_kaleng",


                    label :

                        "Tabungan Kaleng",


                    type :

                        "checkbox",


                    required :

                        false,


                    value :

                        false,


                    dependsOnRule :

                        "rule_tabungan"

                }

            ],


            /* =============================================
               NORMALIZE
            ============================================= */

            normalize :

                function(

                    data

                ){

                    const activities = [];


                    if(

                        data.activity_gaji

                    ){

                        activities.push(

                            "gaji"

                        );

                    }


                    if(

                        data.activity_penghasilan_lain

                    ){

                        activities.push(

                            "penghasilan_lain"

                        );

                    }


                    if(

                        data.activity_hutang_piutang

                    ){

                        activities.push(

                            "hutang_piutang"

                        );

                    }


                    if(

                        data.activity_dana_darurat

                    ){

                        activities.push(

                            "dana_darurat"

                        );

                    }


                    if(

                        data.activity_tabungan_kaleng

                    ){

                        activities.push(

                            "tabungan_kaleng"

                        );

                    }


                    if(

                        activities.length === 0

                    ){

                        alert(

                            "Pilih minimal satu activity pemasukan."

                        );


                        return null;

                    }


                    return {

                        rules :

                            "rule_pemasukan",


                        type :

                            "masuk,hutang,tarik",


                        activity :

                            activities.join(

                                ","

                            )

                    };

                }

        },


        /* =================================================
           ACTIVITY PENGELUARAN
        ================================================= */

        {

            id :

                "financial_activity_pengeluaran",


            title :

                "💸 Activity Pengeluaran",


            description :

                "Pilih activity yang tersedia untuk pengeluaran.",


            addLabel :

                "＋ Tambah Activity",


            formAddLabel :

                "＋ Simpan Activity",


            deleteLabel :

                "Hapus",


            autoCloseForm :

                true,


            uniqueFields : [

                "activity"

            ],


            fields : [


                /* =========================================
                   BELANJA HARIAN
                ========================================= */

                {

                    name :

                        "activity_belanja_harian",


                    label :

                        "Belanja Harian",


                    type :

                        "checkbox",


                    required :

                        false

                },


                /* =========================================
                   BELANJA BULANAN
                ========================================= */

                {

                    name :

                        "activity_belanja_bulanan",


                    label :

                        "Belanja Bulanan",


                    type :

                        "checkbox",


                    required :

                        false

                },


                /* =========================================
                   KEBUTUHAN ANAK
                ========================================= */

                {

                    name :

                        "activity_kebutuhan_anak",


                    label :

                        "Kebutuhan Anak",


                    type :

                        "checkbox",


                    required :

                        false

                },


                /* =========================================
                   TAGIHAN
                ========================================= */

                {

                    name :

                        "activity_tagihan",


                    label :

                        "Tagihan",


                    type :

                        "checkbox",


                    required :

                        false

                },


                /* =========================================
                   BELANJA ONLINE
                ========================================= */

                {

                    name :

                        "activity_belanja_online",


                    label :

                        "Belanja Online",


                    type :

                        "checkbox",


                    required :

                        false

                },


                /* =========================================
                   BIAYA PERBAIKAN
                ========================================= */

                {

                    name :

                        "activity_biaya_perbaikan",


                    label :

                        "Biaya Perbaikan",


                    type :

                        "checkbox",


                    required :

                        false

                },


                /* =========================================
                   MAKAN DI LUAR
                ========================================= */

                {

                    name :

                        "activity_makan_diluar",


                    label :

                        "Makan di Luar",


                    type :

                        "checkbox",


                    required :

                        false

                },


                /* =========================================
                   REFRESHING
                ========================================= */

                {

                    name :

                        "activity_refreshing",


                    label :

                        "Refreshing",


                    type :

                        "checkbox",


                    required :

                        false

                },


                /* =========================================
                   BIAYA TAHUNAN
                ========================================= */

                {

                    name :

                        "activity_biaya_tahunan",


                    label :

                        "Biaya Tahunan",


                    type :

                        "checkbox",


                    required :

                        false

                },


                /* =========================================
                   PENGELUARAN LAIN
                ========================================= */

                {

                    name :

                        "activity_pengeluaran_lain",


                    label :

                        "Pengeluaran Lain",


                    type :

                        "checkbox",


                    required :

                        false

                },


                /* =========================================
                   HUTANG / PIUTANG
                ========================================= */

                {

                    name :

                        "activity_hutang_piutang",


                    label :

                        "Hutang / Piutang",


                    type :

                        "checkbox",


                    required :

                        false,


                    dependsOnRule :

                        "rule_hutang"

                },


                /* =========================================
                   DANA DARURAT
                ========================================= */

                {

                    name :

                        "activity_dana_darurat",


                    label :

                        "Dana Darurat",


                    type :

                        "checkbox",


                    required :

                        false,


                    dependsOnRule :

                        "rule_tabungan"

                },


                /* =========================================
                   TABUNGAN KALENG
                ========================================= */

                {

                    name :

                        "activity_tabungan_kaleng",


                    label :

                        "Tabungan Kaleng",


                    type :

                        "checkbox",


                    required :

                        false,


                    dependsOnRule :

                        "rule_tabungan"

                }

            ],


            /* =============================================
               NORMALIZE
            ============================================= */

            normalize :

                function(

                    data

                ){

                    const activities = [];


                    if(

                        data.activity_belanja_harian

                    ){

                        activities.push(

                            "belanja_harian"

                        );

                    }


                    if(

                        data.activity_belanja_bulanan

                    ){

                        activities.push(

                            "belanja_bulanan"

                        );

                    }


                    if(

                        data.activity_kebutuhan_anak

                    ){

                        activities.push(

                            "kebutuhan_anak"

                        );

                    }


                    if(

                        data.activity_tagihan

                    ){

                        activities.push(

                            "tagihan"

                        );

                    }


                    if(

                        data.activity_belanja_online

                    ){

                        activities.push(

                            "belanja_online"

                        );

                    }


                    if(

                        data.activity_biaya_perbaikan

                    ){

                        activities.push(

                            "biaya_perbaikan"

                        );

                    }


                    if(

                        data.activity_makan_diluar

                    ){

                        activities.push(

                            "makan_diluar"

                        );

                    }


                    if(

                        data.activity_refreshing

                    ){

                        activities.push(

                            "refreshing"

                        );

                    }


                    if(

                        data.activity_biaya_tahunan

                    ){

                        activities.push(

                            "biaya_tahunan"

                        );

                    }


                    if(

                        data.activity_pengeluaran_lain

                    ){

                        activities.push(

                            "pengeluaran_lain"

                        );

                    }


                    if(

                        data.activity_hutang_piutang

                    ){

                        activities.push(

                            "hutang_piutang"

                        );

                    }


                    if(

                        data.activity_dana_darurat

                    ){

                        activities.push(

                            "dana_darurat"

                        );

                    }


                    if(

                        data.activity_tabungan_kaleng

                    ){

                        activities.push(

                            "tabungan_kaleng"

                        );

                    }


                    if(

                        activities.length === 0

                    ){

                        alert(

                            "Pilih minimal satu activity pengeluaran."

                        );


                        return null;

                    }


                    return {

                        rules :

                            "rule_pengeluaran",


                        type :

                            "keluar,bayar,nabung",


                        activity :

                            activities.join(

                                ","

                            )

                    };

                }

        },


        /* =================================================
           ACTIVITY HUTANG
        ================================================= */

        {

            id :

                "financial_activity_hutang",


            title :

                "🤝 Activity Hutang",


            description :

                "Activity untuk Rule Hutang. Rule ini bersifat opsional.",


            addLabel :

                "＋ Tambah Activity",


            formAddLabel :

                "＋ Simpan Activity",


            deleteLabel :

                "Hapus",


            autoCloseForm :

                true,


            uniqueFields : [

                "activity"

            ],


            fields : [


                {

                    name :

                        "activity_hutang_piutang",


                    label :

                        "Hutang / Piutang",


                    type :

                        "checkbox",


                    required :

                        false,


                    value :

                        false,


                    dependsOnRule :

                        "rule_hutang"

                }

            ],


            normalize :

                function(

                    data

                ){

                    const activities = [];


                    if(

                        data.activity_hutang_piutang

                    ){

                        activities.push(

                            "hutang_piutang"

                        );

                    }


                    if(

                        activities.length === 0

                    ){

                        alert(

                            "Pilih activity hutang."

                        );


                        return null;

                    }


                    return {

                        rules :

                            "rule_hutang",


                        type :

                            "hutang,bayar",


                        activity :

                            activities.join(

                                ","

                            )

                    };

                }

        },


        /* =================================================
           ACTIVITY TABUNGAN
        ================================================= */

        {

            id :

                "financial_activity_tabungan",


            title :

                "🏦 Activity Tabungan",


            description :

                "Activity untuk Rule Tabungan. Rule ini bersifat opsional.",


            addLabel :

                "＋ Tambah Activity",


            formAddLabel :

                "＋ Simpan Activity",


            deleteLabel :

                "Hapus",


            autoCloseForm :

                true,


            uniqueFields : [

                "activity"

            ],


            fields : [


                /* =========================================
                   DANA DARURAT
                ========================================= */

                {

                    name :

                        "activity_dana_darurat",


                    label :

                        "Dana Darurat",


                    type :

                        "checkbox",


                    required :

                        false,


                    value :

                        false,


                    dependsOnRule :

                        "rule_tabungan"

                },


                /* =========================================
                   TABUNGAN KALENG
                ========================================= */

                {

                    name :

                        "activity_tabungan_kaleng",


                    label :

                        "Tabungan Kaleng",


                    type :

                        "checkbox",


                    required :

                        false,


                    value :

                        false,


                    dependsOnRule :

                        "rule_tabungan"

                }

            ],


            /* =============================================
               NORMALIZE
            ============================================= */

            normalize :

                function(

                    data

                ){

                    const activities = [];


                    if(

                        data.activity_dana_darurat

                    ){

                        activities.push(

                            "dana_darurat"

                        );

                    }


                    if(

                        data.activity_tabungan_kaleng

                    ){

                        activities.push(

                            "tabungan_kaleng"

                        );

                    }


                    if(

                        activities.length === 0

                    ){

                        alert(

                            "Pilih minimal satu activity tabungan."

                        );


                        return null;

                    }


                    return {

                        rules :

                            "rule_tabungan",


                        type :

                            "nabung,tarik",


                        activity :

                            activities.join(

                                ","

                            )

                    };

                }

        }

    ]

};
