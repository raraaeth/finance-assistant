/* =====================================================
   Finance Assistant
   Component    : Global Setting
   Module       : Financial
   File         : financial.js
   Version      : 3.0.0

   Description :
   Financial Setting

   Structure :
   1. Penentuan Rule
   2. Activity Pemasukan
   3. Activity Pengeluaran
   4. Activity Hutang
   5. Activity Tabungan

   Output Rule :
   {
       rules    : "...",
       type     : "...",
       activity : "..."
   }

   Catatan :
   - Rule Pemasukan wajib
   - Rule Pengeluaran wajib
   - Rule Hutang opsional
   - Rule Tabungan opsional
   - Activity menggunakan checkbox
   - Result checkbox ditampilkan Ya / Tidak
   - Field checkbox UI tidak ikut masuk payload JSON
===================================================== */


/* =====================================================
   ACTIVITY MASTER
===================================================== */

const ACTIVITY = {

    pemasukan : [

        {
            name : "gaji",
            label : "Gaji"
        },

        {
            name : "penghasilan_lain",
            label : "Penghasilan Lain"
        },

        {
            name : "hutang_piutang",
            label : "Hutang / Piutang",
            rule : "hutang"
        },

        {
            name : "dana_darurat",
            label : "Dana Darurat",
            rule : "tabungan"
        },

        {
            name : "tabungan_kaleng",
            label : "Tabungan Kaleng",
            rule : "tabungan"
        }

    ],


    pengeluaran : [

        {
            name : "belanja_harian",
            label : "Belanja Harian"
        },

        {
            name : "belanja_bulanan",
            label : "Belanja Bulanan"
        },

        {
            name : "kebutuhan_anak",
            label : "Kebutuhan Anak"
        },

        {
            name : "tagihan",
            label : "Tagihan"
        },

        {
            name : "belanja_online",
            label : "Belanja Online"
        },

        {
            name : "biaya_perbaikan",
            label : "Biaya Perbaikan"
        },

        {
            name : "makan_diluar",
            label : "Makan di Luar"
        },

        {
            name : "refreshing",
            label : "Refreshing"
        },

        {
            name : "biaya_tahunan",
            label : "Biaya Tahunan"
        },

        {
            name : "pengeluaran_lain",
            label : "Pengeluaran Lain"
        },

        {
            name : "hutang_piutang",
            label : "Hutang / Piutang",
            rule : "hutang"
        },

        {
            name : "dana_darurat",
            label : "Dana Darurat",
            rule : "tabungan"
        },

        {
            name : "tabungan_kaleng",
            label : "Tabungan Kaleng",
            rule : "tabungan"
        }

    ],


    hutang : [

        {
            name : "hutang_piutang",
            label : "Hutang / Piutang"
        }

    ],


    tabungan : [

        {
            name : "dana_darurat",
            label : "Dana Darurat"
        },

        {
            name : "tabungan_kaleng",
            label : "Tabungan Kaleng"
        }

    ]

};


/* =====================================================
   HELPER
===================================================== */

function createActivityFields(

    list

){

    return list.map(

        item => ({

            name :

                item.name,

            label :

                item.label,

            type :

                "checkbox",

            resultValue :

                item.name

        })

    );

}


/* =====================================================
   NORMALIZE ACTIVITY
===================================================== */

function normalizeActivity(

    data,

    fields,

    rules,

    type

){

    const activity = [];


    /* =============================================
       AMBIL CHECKBOX YANG AKTIF
    ============================================= */

    fields.forEach(

        field => {

            if(

                data[field.name] === true

            ){

                activity.push(

                    field.name

                );

            }

        }

    );


    /* =============================================
       HASIL FINAL
       
       Hanya tiga field ini yang menjadi
       payload sebenarnya.
    ============================================= */

    const result = {

        rules :

            rules,

        type :

            type,

        activity :

            activity.join(",")

    };


    /* =============================================
       SIMPAN NILAI CHECKBOX UNTUK UI RESULT
       
       Dibuat non-enumerable supaya:
       
       - formatResultValue() masih bisa membaca
       - JSON.stringify() tidak memasukkannya
         ke payload Sheet
    ============================================= */

    fields.forEach(

        field => {

            Object.defineProperty(

                result,

                field.name,

                {

                    value :

                        Boolean(

                            data[field.name]

                        ),

                    enumerable :

                        false,

                    configurable :

                        true

                }

            );

        }

    );


    return result;

}


/* =====================================================
   NORMALIZE RULE
===================================================== */

function normalizeRule(

    data

){

    return {

        type :

            "financial",

        gunakanRulePemasukan :

            Boolean(

                data.gunakanRulePemasukan

            ),

        gunakanRulePengeluaran :

            Boolean(

                data.gunakanRulePengeluaran

            ),

        gunakanRuleHutang :

            Boolean(

                data.gunakanRuleHutang

            ),

        gunakanRuleTabungan :

            Boolean(

                data.gunakanRuleTabungan

            )

    };

}


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

        /* =============================================
           PENENTUAN RULE
        ============================================= */

        {

            id :

                "financial_rules",


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

                "gunakanRulePemasukan",
                "gunakanRulePengeluaran",
                "gunakanRuleHutang",
                "gunakanRuleTabungan"

            ],


            fields : [

                {

                    name :

                        "gunakanRulePemasukan",

                    label :

                        "Gunakan Rule Pemasukan",

                    type :

                        "checkbox",

                    value :

                        true,

                    required :

                        false

                },


                {

                    name :

                        "gunakanRulePengeluaran",

                    label :

                        "Gunakan Rule Pengeluaran",

                    type :

                        "checkbox",

                    value :

                        true,

                    required :

                        false

                },


                {

                    name :

                        "gunakanRuleHutang",

                    label :

                        "Gunakan Rule Hutang",

                    type :

                        "checkbox",

                    value :

                        false,

                    required :

                        false,

                    note :

                        "Opsional. Aktifkan jika Financial menggunakan transaksi hutang dan pembayaran hutang."

                },


                {

                    name :

                        "gunakanRuleTabungan",

                    label :

                        "Gunakan Rule Tabungan",

                    type :

                        "checkbox",

                    value :

                        false,

                    required :

                        false,

                    note :

                        "Opsional. Aktifkan jika Financial menggunakan transaksi tabungan dan penarikan tabungan."

                }

            ],


            normalize :

                normalizeRule

        },


        /* =============================================
           ACTIVITY PEMASUKAN
        ============================================= */

        {

            id :

                "financial_activity_pemasukan",


            title :

                "💰 Activity Pemasukan",


            description :

                "Pilih activity yang tersedia untuk Rule Pemasukan.",


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


            fields :

                createActivityFields(

                    ACTIVITY.pemasukan

                ),


            normalize :

                function(

                    data

                ){

                    return normalizeActivity(

                        data,

                        this.fields,

                        "rule_pemasukan",

                        "masuk,hutang,tarik"

                    );

                }

        },


        /* =============================================
           ACTIVITY PENGELUARAN
        ============================================= */

        {

            id :

                "financial_activity_pengeluaran",


            title :

                "💸 Activity Pengeluaran",


            description :

                "Pilih activity yang tersedia untuk Rule Pengeluaran.",


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


            fields :

                createActivityFields(

                    ACTIVITY.pengeluaran

                ),


            normalize :

                function(

                    data

                ){

                    return normalizeActivity(

                        data,

                        this.fields,

                        "rule_pengeluaran",

                        "keluar,bayar,nabung"

                    );

                }

        },


        /* =============================================
           ACTIVITY HUTANG
        ============================================= */

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


            fields :

                createActivityFields(

                    ACTIVITY.hutang

                ),


            normalize :

                function(

                    data

                ){

                    return normalizeActivity(

                        data,

                        this.fields,

                        "rule_hutang",

                        "hutang,bayar"

                    );

                }

        },


        /* =============================================
           ACTIVITY TABUNGAN
        ============================================= */

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


            fields :

                createActivityFields(

                    ACTIVITY.tabungan

                ),


            normalize :

                function(

                    data

                ){

                    return normalizeActivity(

                        data,

                        this.fields,

                        "rule_tabungan",

                        "nabung,tarik"

                    );

                }

        }

    ]

};
