/* =====================================================
   Finance Assistant
   Module        : Kas
   File          : kas.js
   Version       : 2.0.0

   Description :
   Kas Setting Configuration

   Responsibility :
   - Member
   - Category Rule
   - Tabungan Rule
   - Kas Rule
   - Hutang Rule

   Struktur Sheet:
   kas_member

   nama
   tabungan
   kas
   hutang

   Principle :
   - Controller tetap generic
   - Logic Kas berada di module ini
   - Checkbox bukan data member
   - Checkbox hanya menentukan rule kategori
   - Member dapat ditambahkan tanpa checkbox
===================================================== */


/* =====================================================
   CONSTANT
===================================================== */

const KAS_CATEGORY_RULES = {

    tabungan : [

        "nabung",

        "tarik",

        "lain_lain"

    ],

    kas : [

        "iuran",

        "tarik",

        "lain_lain"

    ],

    hutang : [

        "hutang",

        "bayar"

    ]

};



/* =====================================================
   SETTING
===================================================== */

export const KasSetting = {

    /* =================================================
       TITLE
    ================================================= */

    title :

        "Pengaturan Kas",


    subtitle :

        "Atur member dan kategori Kas",



    /* =================================================
       SECTIONS
    ================================================= */

    sections : [

        /* =============================================
           MEMBER
        ============================================= */

        {

            id :

                "kas_member",


            title :

                "Member",


            description :

                "Tambahkan nama member yang dapat digunakan di Kas.",


            addLabel :

                "＋ Tambah Member",


            formAddLabel :

                "＋ Tambahkan",


            uniqueFields : [

                "nama"

            ],


            fields : [

                {

                    name :

                        "nama",

                    label :

                        "Nama",

                    type :

                        "text",

                    placeholder :

                        "Masukkan nama member",

                    required :

                        true

                }

            ]

        },


        /* =============================================
           CATEGORY RULE
           ============================================= */

        {

            id :

                "kas_category_rules",


            title :

                "Kategori Kas",


            description :

                "Pilih kategori yang ingin digunakan pada workspace Kas.",


            addLabel :

                "＋ Atur Kategori",


            formAddLabel :

                "＋ Terapkan",


            inputMode :

                "checkbox-group",


            /*
             * Section ini hanya menjadi UI/controller.
             *
             * Rule yang dihasilkan oleh normalize()
             * akan diproses sebagai data kategori.
             */

            fields : [

                {

                    name :

                        "tabungan",

                    label :

                        "Tabungan",

                    type :

                        "checkbox",

                    value :

                        false

                },


                {

                    name :

                        "kas",

                    label :

                        "Kas",

                    type :

                        "checkbox",

                    value :

                        false

                },


                {

                    name :

                        "hutang",

                    label :

                        "Hutang",

                    type :

                        "checkbox",

                    value :

                        false

                }

            ],


            /* =========================================
               NORMALIZE
               
               Checkbox tidak dikirim sebagai:
               
                   tabungan: true
               
               tetapi langsung diubah menjadi
               rule kategori.
            ========================================= */

            normalize(data){

                const results = [];


                /* =====================================
                   TABUNGAN
                ===================================== */

                if(

                    data.tabungan === true

                ){

                    KAS_CATEGORY_RULES.tabungan.forEach(

                        category => {

                            results.push({

                                tabungan :

                                    category

                            });

                        }

                    );

                }


                /* =====================================
                   KAS
                ===================================== */

                if(

                    data.kas === true

                ){

                    KAS_CATEGORY_RULES.kas.forEach(

                        category => {

                            results.push({

                                kas :

                                    category

                            });

                        }

                    );

                }


                /* =====================================
                   HUTANG
                ===================================== */

                if(

                    data.hutang === true

                ){

                    KAS_CATEGORY_RULES.hutang.forEach(

                        category => {

                            results.push({

                                hutang :

                                    category

                            });

                        }

                    );

                }


                /* =====================================
                   EMPTY
                   
                   Tidak ada checkbox dipilih.
                   
                   Jangan membuat data boolean.
                ===================================== */

                if(

                    results.length === 0

                ){

                    return [];

                }


                return results;

            }

        }

    ]

};
