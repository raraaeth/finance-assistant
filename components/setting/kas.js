/* =====================================================
   Finance Assistant
   Component    : Global Setting
   Module       : Kas
   File         : kas.js
   Version      : 2.1.0

   Description :
   Kas Setting Definition

   Sheet :
   kas_member

   Fields :
   - nama
   - tabungan
   - kas
   - hutang

   Category :
   Tabungan :
   - nabung
   - tarik
   - lain_lain

   Kas :
   - iuran
   - tarik
   - lain_lain

   Hutang :
   - hutang
   - bayar
===================================================== */


/* =====================================================
   KAS SETTING
===================================================== */

export const KasSetting = {


    /* =================================================
       HEADER
    ================================================= */

    title :

        "Pengaturan Kas",


    subtitle :

        "Atur konfigurasi Kas",


    /* =================================================
       SECTIONS
    ================================================= */

    sections : [

        /* =============================================
           MEMBER
        ============================================= */

        {

            id :

                "member",


            title :

                "👥 Nama Member",


            description :

                "Tambahkan nama member dan pilih kategori yang ingin tersedia.",


            /* =========================================
               ADD BUTTON
            ========================================= */

            addLabel :

                "＋ Tambah",


            /* =========================================
               FORM BUTTON
            ========================================= */

            formAddLabel :

                "＋ Tambahkan",


            /* =========================================
               DELETE BUTTON
            ========================================= */

            deleteLabel :

                "Hapus",


            /* =========================================
               UNIQUE
            ========================================= */

            uniqueFields : [

                "nama"

            ],


            /* =========================================
               FIELDS
            ========================================= */

            fields : [

                /* -------------------------------------
                   NAMA
                ------------------------------------- */

                {

                    name :

                        "nama",


                    label :

                        "Nama Member",


                    type :

                        "text",


                    placeholder :

                        "Masukkan nama member",


                    required :

                        true

                },


                /* -------------------------------------
                   TABUNGAN
                ------------------------------------- */

                {

                    name :

                        "tabungan",


                    label :

                        "Tabungan",


                    type :

                        "checkbox",


                    options : [

                        {

                            value :

                                true,


                            label :

                                "Aktifkan kategori Tabungan"

                        }

                    ]

                },


                /* -------------------------------------
                   KAS
                ------------------------------------- */

                {

                    name :

                        "kas",


                    label :

                        "Kas",


                    type :

                        "checkbox",


                    options : [

                        {

                            value :

                                true,


                            label :

                                "Aktifkan kategori Kas"

                        }

                    ]

                },


                /* -------------------------------------
                   HUTANG
                ------------------------------------- */

                {

                    name :

                        "hutang",


                    label :

                        "Hutang",


                    type :

                        "checkbox",


                    options : [

                        {

                            value :

                                true,


                            label :

                                "Aktifkan kategori Hutang"

                        }

                    ]

                }

            ],


            /* =========================================
               NORMALIZE
            ========================================= */

            normalize(data){

                return {

                    nama :

                        data.nama || "",


                    tabungan :

                        data.tabungan === true,


                    kas :

                        data.kas === true,


                    hutang :

                        data.hutang === true

                };

            }

        }

    ],


    /* =================================================
       PREPARE SAVE
       
       Mengubah hasil input Setting menjadi struktur
       kas_member sesuai kebutuhan.
       
       Contoh:
       
       nama       tabungan    kas       hutang
       Naila      nabung      iuran     hutang
       Samudi     tarik       tarik     bayar
       Nisa       lain_lain   lain_lain
       Irawan
       Dewi
       
    ================================================= */

    prepareSave(payload){

        if(!Array.isArray(payload)){

            return payload;

        }


        /* =============================================
           PISAHKAN DATA KAS DARI DATA LAIN
        ============================================= */

        const kasRows =

            payload.filter(

                item =>

                    item.section === "kas_member"

            );


        const otherRows =

            payload.filter(

                item =>

                    item.section !== "kas_member"

            );


        /* =============================================
           KALAU TIDAK ADA DATA KAS
        ============================================= */

        if(!kasRows.length){

            return payload;

        }


        /* =============================================
           DAFTAR KATEGORI TETAP
        ============================================= */

        const tabunganCategories = [

            "nabung",

            "tarik",

            "lain_lain"

        ];


        const kasCategories = [

            "iuran",

            "tarik",

            "lain_lain"

        ];


        const hutangCategories = [

            "hutang",

            "bayar"

        ];


        /* =============================================
           INDEX KATEGORI
           
           Index berjalan berdasarkan urutan member
           yang mengaktifkan kategori tersebut.
        ============================================= */

        let tabunganIndex = 0;

        let kasIndex = 0;

        let hutangIndex = 0;


        /* =============================================
           BENTUK DATA FINAL
        ============================================= */

        const finalKasRows =

            kasRows.map(

                item => {

                    const source =

                        item.data || {};


                    const row = {


                        nama :

                            source.nama || ""

                    };


                    /* ---------------------------------
                       TABUNGAN
                    --------------------------------- */

                    if(source.tabungan === true){

                        if(

                            tabunganIndex <

                            tabunganCategories.length

                        ){

                            row.tabungan =

                                tabunganCategories[
                                    tabunganIndex
                                ];

                        }

                        tabunganIndex++;

                    }


                    /* ---------------------------------
                       KAS
                    --------------------------------- */

                    if(source.kas === true){

                        if(

                            kasIndex <

                            kasCategories.length

                        ){

                            row.kas =

                                kasCategories[
                                    kasIndex
                                ];

                        }

                        kasIndex++;

                    }


                    /* ---------------------------------
                       HUTANG
                    --------------------------------- */

                    if(source.hutang === true){

                        if(

                            hutangIndex <

                            hutangCategories.length

                        ){

                            row.hutang =

                                hutangCategories[
                                    hutangIndex
                                ];

                        }

                        hutangIndex++;

                    }


                    return {

                        section :

                            "kas_member",


                        data :

                            row

                    };

                }

            );


        /* =============================================
           HASIL AKHIR
        ============================================= */

        return [

            ...otherRows,

            ...finalKasRows

        ];

    }

};
