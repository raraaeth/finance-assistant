/* =====================================================
   Finance Assistant
   Component    : Global Setting
   Module       : Kas
   File         : kas.js
   Version      : 2.3.0

   Description :
   Kas Setting Definition

   Sheet :
   kas_member

   Structure :
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
           SECTION 1
           MEMBER
        ============================================= */

        {

            id :

                "member",


            title :

                "👥 Member",


            description :

                "Tambahkan nama member yang digunakan dalam Kas.",


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

                }

            ],


            /* =========================================
               NORMALIZE
            ========================================= */

            normalize(data){

                return {

                    nama :

                        data.nama || ""

                };

            }

        },


        /* =============================================
           SECTION 2
           KATEGORI KAS
        ============================================= */

        {

            id :

                "kas_category",


            title :

                "⚙️ Kategori Kas",


            description :

                "Pilih kategori yang ingin digunakan dalam Kas.",


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
               PERSIST
               
               Checkbox hanya menjadi konfigurasi.
               Tidak disimpan sebagai row tersendiri.
            ========================================= */

            persist :

                false,


            /* =========================================
               FIELDS
            ========================================= */

            fields : [


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


                    note :

                        "Centang jika kategori Tabungan ingin digunakan. Jika tidak dicentang, kategori Tabungan tidak ditambahkan."

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


                    note :

                        "Centang jika kategori Kas ingin digunakan. Jika tidak dicentang, kategori Kas tidak ditambahkan."

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


                    note :

                        "Centang jika kategori Hutang ingin digunakan. Jika tidak dicentang, kategori Hutang tidak ditambahkan."

                }

            ],


            /* =========================================
               NORMALIZE
            ========================================= */

            normalize(data){

                return {

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

       Mengubah hasil Setting menjadi struktur
       kas_member.

       Contoh:

       nama       tabungan    kas       hutang
       Naila      nabung      iuran     hutang
       Samudi     tarik       tarik     bayar
       Nisa       lain_lain   lain_lain
       Irawan
       Dewi
    ================================================= */

    prepareSave(payload, context){


        /* =============================================
           VALIDASI
        ============================================= */

        if(!Array.isArray(payload)){

            return payload;

        }


        /* =============================================
           AMBIL DATA MEMBER
        ============================================= */

        const memberRows =

            payload.filter(

                item =>

                    item.section === "kas_member"

            );


        /* =============================================
           AMBIL SEMUA HASIL FORM

           context.data berisi seluruh hasil dari
           Setting sebelum persist:false difilter.
        ============================================= */

        const allData =

            Array.isArray(context?.data)

                ? context.data

                : [];


        /* =============================================
           AMBIL HASIL KATEGORI
        ============================================= */

        const categoryResults =

            allData.filter(

                item =>

                    item.section === "kas_category"

            );


        /* =============================================
           DEFAULT KATEGORI
        ============================================= */

        let categoryData = {};


        /* =============================================
           GUNAKAN KONFIGURASI KATEGORI TERAKHIR
        ============================================= */

        if(categoryResults.length){

            const lastCategory =

                categoryResults[
                    categoryResults.length - 1
                ];


            categoryData =

                lastCategory.data || {};

        }


        /* =============================================
           DAFTAR KATEGORI TABUNGAN
        ============================================= */

        const tabunganCategories = [

            "nabung",

            "tarik",

            "lain_lain"

        ];


        /* =============================================
           DAFTAR KATEGORI KAS
        ============================================= */

        const kasCategories = [

            "iuran",

            "tarik",

            "lain_lain"

        ];


        /* =============================================
           DAFTAR KATEGORI HUTANG
        ============================================= */

        const hutangCategories = [

            "hutang",

            "bayar"

        ];


        /* =============================================
           INDEX KATEGORI
        ============================================= */

        let tabunganIndex = 0;

        let kasIndex = 0;

        let hutangIndex = 0;


        /* =============================================
           BENTUK DATA MEMBER FINAL
        ============================================= */

        const finalMemberRows =

            memberRows.map(

                item => {


                    /* ---------------------------------
                       DATA ASLI
                    --------------------------------- */

                    const source =

                        item.data || {};


                    /* ---------------------------------
                       ROW DASAR

                       Member selalu hanya membutuhkan
                       nama.
                    --------------------------------- */

                    const row = {

                        nama :

                            source.nama || ""

                    };


                    /* ---------------------------------
                       TABUNGAN
                    --------------------------------- */

                    if(

                        categoryData.tabungan === true

                    ){

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

                    if(

                        categoryData.kas === true

                    ){

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

                    if(

                        categoryData.hutang === true

                    ){

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


                    /* ---------------------------------
                       RETURN
                    --------------------------------- */

                    return {

                        section :

                            "kas_member",


                        data :

                            row

                    };

                }

            );


        /* =============================================
           AMBIL SECTION LAIN
        ============================================= */

        const otherRows =

            payload.filter(

                item =>

                    item.section !== "kas_member"

            );


        /* =============================================
           HASIL AKHIR
        ============================================= */

        return [

            ...otherRows,

            ...finalMemberRows

        ];

    }

};
