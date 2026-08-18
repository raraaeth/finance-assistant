/* =====================================================
   Finance Assistant
   Component    : Global Setting
   Module       : Financial
   File         : financial.js
   Version      : 1.0.0

   Description :
   Financial Setting Definition

   Structure :
   - Penentuan Rule
   - Activity Pemasukan
   - Activity Pengeluaran
   - Activity Hutang
   - Activity Tabungan

   Principle :
   Rule Pemasukan dan Pengeluaran wajib digunakan.

   Rule Hutang dan Tabungan bersifat opsional.

   Activity merupakan konfigurasi Financial
   yang nantinya digunakan oleh Input Engine.
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

                "＋ Tambah Rule",


            formAddLabel :

                "＋ Simpan Rule",


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

                        "Opsional. Aktifkan jika Financial menggunakan transaksi hutang dan pembayaran hutang."

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

                        "Opsional. Aktifkan jika Financial menggunakan transaksi tabungan dan penarikan tabungan."

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
                       RULE YANG AKTIF
                    ===================================== */

                    const rules = [


                        "rule_pemasukan",


                        "rule_pengeluaran"

                    ];


                    if(

                        data.rule_hutang

                    ){

                        rules.push(

                            "rule_hutang"

                        );

                    }


                    if(

                        data.rule_tabungan

                    ){

                        rules.push(

                            "rule_tabungan"

                        );

                    }


                    return {

                        type_rule :

                            "financial",


                        rules :

                            rules,


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

                "Activity yang tersedia untuk Rule Pemasukan.",


            addLabel :

                "＋ Tambah Activity",


            formAddLabel :

                "＋ Tambahkan",


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

                        "activity",


                    label :

                        "Activity Pemasukan",


                    type :

                        "select",


                    placeholder :

                        "Pilih activity pemasukan",


                    required :

                        true,


                    options : [


                        {

                            value :

                                "gaji",


                            label :

                                "Gaji"

                        },


                        {

                            value :

                                "penghasilan_lain",


                            label :

                                "Penghasilan Lain"

                        },


                        {

                            value :

                                "hutang_piutang",


                            label :

                                "Hutang / Piutang"

                        },


                        {

                            value :

                                "dana_darurat",


                            label :

                                "Dana Darurat"

                        },


                        {

                            value :

                                "tabungan_kaleng",


                            label :

                                "Tabungan Kaleng"

                        }

                    ]

                }

            ],


            normalize :

                function(

                    data

                ){

                    return {

                        rules :

                            "rule_pemasukan",


                        type :

                            "masuk,hutang,tarik",


                        activity :

                            data.activity ?? ""

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

                "Activity yang tersedia untuk Rule Pengeluaran.",


            addLabel :

                "＋ Tambah Activity",


            formAddLabel :

                "＋ Tambahkan",


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

                        "activity",


                    label :

                        "Activity Pengeluaran",


                    type :

                        "select",


                    placeholder :

                        "Pilih activity pengeluaran",


                    required :

                        true,


                    options : [


                        {

                            value :

                                "belanja_harian",


                            label :

                                "Belanja Harian"

                        },


                        {

                            value :

                                "belanja_bulanan",


                            label :

                                "Belanja Bulanan"

                        },


                        {

                            value :

                                "kebutuhan_anak",


                            label :

                                "Kebutuhan Anak"

                        },


                        {

                            value :

                                "tagihan",


                            label :

                                "Tagihan"

                        },


                        {

                            value :

                                "belanja_online",


                            label :

                                "Belanja Online"

                        },


                        {

                            value :

                                "biaya_perbaikan",


                            label :

                                "Biaya Perbaikan"

                        },


                        {

                            value :

                                "makan_diluar",


                            label :

                                "Makan di Luar"

                        },


                        {

                            value :

                                "refreshing",


                            label :

                                "Refreshing"

                        },


                        {

                            value :

                                "biaya_tahunan",


                            label :

                                "Biaya Tahunan"

                        },


                        {

                            value :

                                "pengeluaran_lain",


                            label :

                                "Pengeluaran Lain"

                        },


                        {

                            value :

                                "hutang_piutang",


                            label :

                                "Hutang / Piutang"

                        },


                        {

                            value :

                                "dana_darurat",


                            label :

                                "Dana Darurat"

                        },


                        {

                            value :

                                "tabungan_kaleng",


                            label :

                                "Tabungan Kaleng"

                        }

                    ]

                }

            ],


            normalize :

                function(

                    data

                ){

                    return {

                        rules :

                            "rule_pengeluaran",


                        type :

                            "keluar,bayar,nabung",


                        activity :

                            data.activity ?? ""

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

                "＋ Tambahkan",


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

                        "activity",


                    label :

                        "Activity Hutang",


                    type :

                        "select",


                    placeholder :

                        "Pilih activity hutang",


                    required :

                        true,


                    options : [


                        {

                            value :

                                "hutang_piutang",


                            label :

                                "Hutang / Piutang"

                        }

                    ]

                }

            ],


            normalize :

                function(

                    data

                ){

                    return {

                        rules :

                            "rule_hutang",


                        type :

                            "hutang,bayar",


                        activity :

                            data.activity ?? ""

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

                "＋ Tambahkan",


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

                        "activity",


                    label :

                        "Activity Tabungan",


                    type :

                        "select",


                    placeholder :

                        "Pilih activity tabungan",


                    required :

                        true,


                    options : [


                        {

                            value :

                                "dana_darurat",


                            label :

                                "Dana Darurat"

                        },


                        {

                            value :

                                "tabungan_kaleng",


                            label :

                                "Tabungan Kaleng"

                        }

                    ]

                }

            ],


            normalize :

                function(

                    data

                ){

                    return {

                        rules :

                            "rule_tabungan",


                        type :

                            "nabung,tarik",


                        activity :

                            data.activity ?? ""

                    };

                }

        }

    ]

};
