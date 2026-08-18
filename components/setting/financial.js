/* =====================================================
   Finance Assistant
   Component    : Global Setting
   Module       : Financial
   File         : financial.js
   Version      : 4.0.0

   Description :
   Financial Setting

   Structure :
   1. Penentuan Rule
   2. Activity Pemasukan
   3. Activity Pengeluaran

   Rule :
   - Rule Pemasukan wajib digunakan
   - Rule Pengeluaran wajib digunakan
   - Rule Hutang opsional
   - Rule Tabungan opsional

   Activity :
   - Activity Hutang mengikuti Rule Hutang
   - Activity Dana Darurat dan Tabungan Kaleng
     mengikuti Rule Tabungan

   Auto Rule :
   - Rule Hutang dibuat oleh Controller
   - Rule Tabungan dibuat oleh Controller

   Output Activity :
   {
       rules    : "...",
       type     : "...",
       activity : "..."
   }

   Catatan :
   - Activity menggunakan checkbox
   - Checkbox yang disabled tidak dapat dipilih
   - Result checkbox ditampilkan Ya / Tidak
   - Field checkbox UI tidak ikut masuk sebagai
     field mentah ke payload normalize
===================================================== */


/* =====================================================
   ACTIVITY MASTER
===================================================== */

const ACTIVITY = {


    /* =================================================
       PEMASUKAN
    ================================================= */

    pemasukan : [

        {
            name :

                "gaji",

            label :

                "Gaji"
        },


        {
            name :

                "penghasilan_lain",

            label :

                "Penghasilan Lain"
        },


        {
            name :

                "hutang_piutang",

            label :

                "Hutang / Piutang",

            rule :

                "hutang"
        },


        {
            name :

                "dana_darurat",

            label :

                "Dana Darurat",

            rule :

                "tabungan"
        },


        {
            name :

                "tabungan_kaleng",

            label :

                "Tabungan Kaleng",

            rule :

                "tabungan"
        }

    ],


    /* =================================================
       PENGELUARAN
    ================================================= */

    pengeluaran : [

        {
            name :

                "belanja_harian",

            label :

                "Belanja Harian"
        },


        {
            name :

                "belanja_bulanan",

            label :

                "Belanja Bulanan"
        },


        {
            name :

                "kebutuhan_anak",

            label :

                "Kebutuhan Anak"
        },


        {
            name :

                "tagihan",

            label :

                "Tagihan"
        },


        {
            name :

                "belanja_online",

            label :

                "Belanja Online"
        },


        {
            name :

                "biaya_perbaikan",

            label :

                "Biaya Perbaikan"
        },


        {
            name :

                "makan_diluar",

            label :

                "Makan di Luar"
        },


        {
            name :

                "refreshing",

            label :

                "Refreshing"
        },


        {
            name :

                "biaya_tahunan",

            label :

                "Biaya Tahunan"
        },


        {
            name :

                "pengeluaran_lain",

            label :

                "Pengeluaran Lain"
        },


        {
            name :

                "hutang_piutang",

            label :

                "Hutang / Piutang",

            rule :

                "hutang"
        },


        {
            name :

                "dana_darurat",

            label :

                "Dana Darurat",

            rule :

                "tabungan"
        },


        {
            name :

                "tabungan_kaleng",

            label :

                "Tabungan Kaleng",

            rule :

                "tabungan"
        }

    ]

};


/* =====================================================
   CREATE ACTIVITY FIELDS
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

                item.name,

            activityRule :

                item.rule ?? ""

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
       AMBIL CHECKBOX AKTIF
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
       
       Hanya tiga field ini menjadi payload
       activity sebenarnya.
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
       DATA DISPLAY
       
       Dipakai Controller untuk menampilkan
       hasil checkbox sebagai Ya / Tidak.
    ============================================= */

    result.__display = {};


    fields.forEach(

        field => {

            result.__display[field.name] =

                Boolean(

                    data[field.name]

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
   GET FINANCIAL RULE STATE
===================================================== */

function getFinancialRuleState(){

    const result =

        document.querySelector(

            '[data-section="financial_rules"] .global-setting-result-item'

        );


    /* =============================================
       DEFAULT
    ============================================= */

    if(

        !result ||

        !result.dataset.value

    ){

        return {

            gunakanRulePemasukan :

                true,

            gunakanRulePengeluaran :

                true,

            gunakanRuleHutang :

                false,

            gunakanRuleTabungan :

                false

        };

    }


    /* =============================================
       PARSE
    ============================================= */

    try{

        const data =

            JSON.parse(

                result.dataset.value

            );


        return {

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

    catch(error){

        console.error(

            "Financial Rule State Error:",

            error

        );


        return {

            gunakanRulePemasukan :

                true,

            gunakanRulePengeluaran :

                true,

            gunakanRuleHutang :

                false,

            gunakanRuleTabungan :

                false

        };

    }

}


/* =====================================================
   ACTIVITY RULE CONTROL
===================================================== */

function applyActivityRuleControl(

    form,

    ruleData

){

    if(

        !form ||

        !ruleData

    ){

        return;

    }


    /* =============================================
       RULE STATUS
    ============================================= */

    const ruleHutang =

        Boolean(

            ruleData.gunakanRuleHutang

        );


    const ruleTabungan =

        Boolean(

            ruleData.gunakanRuleTabungan

        );


    /* =============================================
       HUTANG
       
       Berlaku untuk:
       - Pemasukan
       - Pengeluaran
    ============================================= */

    const hutangFields =

        form.querySelectorAll(

            '[data-activity-rule="hutang"]'

        );


    hutangFields.forEach(

        field => {

            const input =

                field.querySelector(

                    'input[type="checkbox"]'

                );


            if(

                !input

            ){

                return;

            }


            input.disabled =

                !ruleHutang;


            if(

                !ruleHutang

            ){

                input.checked =

                    false;

            }


            field.classList.toggle(

                "disabled",

                !ruleHutang

            );

        }

    );


    /* =============================================
       TABUNGAN
       
       Berlaku untuk:
       - Pemasukan
       - Pengeluaran
    ============================================= */

    const tabunganFields =

        form.querySelectorAll(

            '[data-activity-rule="tabungan"]'

        );


    tabunganFields.forEach(

        field => {

            const input =

                field.querySelector(

                    'input[type="checkbox"]'

                );


            if(

                !input

            ){

                return;

            }


            input.disabled =

                !ruleTabungan;


            if(

                !ruleTabungan

            ){

                input.checked =

                    false;

            }


            field.classList.toggle(

                "disabled",

                !ruleTabungan

            );

        }

    );

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
       
       HANYA 3 SECTION
    ================================================= */

    sections : [


        /* =============================================
           1. PENENTUAN RULE
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
           2. ACTIVITY PEMASUKAN
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

                },


            onRender :

                function(

                    form

                ){

                    applyActivityRuleControl(

                        form,

                        getFinancialRuleState()

                    );

                }

        },


        /* =============================================
           3. ACTIVITY PENGELUARAN
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

                },


            onRender :

                function(

                    form

                ){

                    applyActivityRuleControl(

                        form,

                        getFinancialRuleState()

                    );

                }

        }

    ]

};
