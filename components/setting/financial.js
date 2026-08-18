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
   - Activity Hutang dikunci jika Rule Hutang tidak aktif
   - Activity Tabungan dikunci jika Rule Tabungan tidak aktif
   - Result checkbox ditampilkan Ya / Tidak
   - Field checkbox UI tidak menjadi activity payload
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

    ],


    /* =================================================
       HUTANG
    ================================================= */

    hutang : [

        {

            name :

                "hutang_piutang",

            label :

                "Hutang / Piutang"

        }

    ],


    /* =================================================
       TABUNGAN
    ================================================= */

    tabungan : [

        {

            name :

                "dana_darurat",

            label :

                "Dana Darurat"

        },


        {

            name :

                "tabungan_kaleng",

            label :

                "Tabungan Kaleng"

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
       RESULT UTAMA

       Struktur ini yang menjadi hasil Financial.
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
       RESULT DISPLAY

       Digunakan hanya untuk menampilkan
       Ya / Tidak pada result card.
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
       DEFAULT STATE
    ============================================= */

    const defaultState = {

        gunakanRulePemasukan :

            true,

        gunakanRulePengeluaran :

            true,

        gunakanRuleHutang :

            false,

        gunakanRuleTabungan :

            false

    };


    if(

        !result ||

        !result.dataset.value

    ){

        return defaultState;

    }


    try{

        const state =

            JSON.parse(

                result.dataset.value

            );


        return {

            gunakanRulePemasukan :

                Boolean(

                    state.gunakanRulePemasukan

                ),


            gunakanRulePengeluaran :

                Boolean(

                    state.gunakanRulePengeluaran

                ),


            gunakanRuleHutang :

                Boolean(

                    state.gunakanRuleHutang

                ),


            gunakanRuleTabungan :

                Boolean(

                    state.gunakanRuleTabungan

                )

        };

    }

    catch(error){

        console.error(

            "Financial Rule State Error:",

            error

        );


        return defaultState;

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
       HUTANG ACTIVITY
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
       TABUNGAN ACTIVITY
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
