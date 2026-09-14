/* =========================================================
FINANCE ASSISTANT — DOCUMENTATION
SEO Manager
========================================================= */

/* =========================================================

1. BASE CONFIGURATION
   ========================================================= */

const SITE_URL =
"https://financeassistant.web.id";

const DOCS_URL =
"${SITE_URL}/docs/";

const SITE_NAME =
"Finance Assistant";

/* =========================================================
2. SEO CONFIGURATION
Berdasarkan artikel yang terdaftar di router.js
========================================================= */

export const SEO_CONFIG = {

/* =======================================================
STARTED
======================================================= */

pengenalan: {

title:
  "Pengenalan Finance Assistant",

description:
  "Pengenalan Finance Assistant dan gambaran umum modul yang tersedia untuk membantu mengelola berbagai aktivitas keuangan.",

keywords:
  "Finance Assistant, aplikasi keuangan, pengelolaan keuangan, tabungan, financial, kas bersama, payroll"

},

mulai: {

title:
  "Mulai Menggunakan Finance Assistant",

description:
  "Panduan awal untuk mulai menggunakan Finance Assistant, menyiapkan Workspace, dan menggunakan modul yang sesuai dengan kebutuhan.",

keywords:
  "Finance Assistant, cara menggunakan Finance Assistant, panduan Finance Assistant, aplikasi keuangan"

},

workspace: {

title:
  "Workspace — Finance Assistant",

description:
  "Pelajari konsep Workspace di Finance Assistant sebagai tempat berbagai data dan pengaturan aplikasi dikelola.",

keywords:
  "Finance Assistant, Workspace, pengaturan workspace, data keuangan"

},

input: {

title:
  "Pengaturan & Input — Finance Assistant",

description:
  "Panduan pengaturan dan input data di Finance Assistant untuk memulai dan mengelola aktivitas aplikasi.",

keywords:
  "Finance Assistant, input data, pengaturan aplikasi, pencatatan keuangan"

},

/* =======================================================
FITUR
======================================================= */

saving: {

title:
  "Tabungan — Finance Assistant",

description:
  "Panduan menggunakan fitur Tabungan di Finance Assistant untuk mencatat dan memantau aktivitas tabungan.",

keywords:
  "Finance Assistant, tabungan, aplikasi tabungan, pencatatan tabungan, pengelolaan tabungan"

},

kas: {

title:
  "Kas Bersama — Finance Assistant",

description:
  "Panduan menggunakan fitur Kas Bersama di Finance Assistant untuk mengelola pemasukan dan pengeluaran yang digunakan bersama.",

keywords:
  "Finance Assistant, kas bersama, keuangan bersama, pencatatan kas"

},

financial: {

title:
  "Financial — Finance Assistant",

description:
  "Panduan menggunakan fitur Financial di Finance Assistant untuk mencatat aktivitas keuangan dan memahami kondisi keuangan dari waktu ke waktu.",

keywords:
  "Finance Assistant, Financial, aplikasi keuangan, pencatatan keuangan, transaksi keuangan, analisa keuangan"

},

monthly: {

title:
  "Perhitungan Gaji Bulanan — Finance Assistant",

description:
  "Panduan menggunakan Payroll Monthly Finance Assistant untuk menghitung gaji bulanan berdasarkan data kehadiran dan aturan payroll.",

keywords:
  "Finance Assistant, payroll, payroll monthly, gaji bulanan, perhitungan gaji, penggajian"

},

daily: {

title:
  "Perhitungan Gaji Harian — Finance Assistant",

description:
  "Panduan menggunakan Payroll Daily Finance Assistant untuk menghitung gaji berdasarkan pendapatan harian dan aturan yang berlaku.",

keywords:
  "Finance Assistant, payroll, payroll daily, gaji harian, perhitungan gaji, penggajian"

},

airdrop: {

title:
  "Pengingat Airdrop — Finance Assistant",

description:
  "Panduan menggunakan fitur Pengingat Airdrop di Finance Assistant untuk membantu mengingat aktivitas dan deadline airdrop.",

keywords:
  "Finance Assistant, pengingat airdrop, airdrop reminder, deadline airdrop"

},

/* =======================================================
DATA & PRIVASI
======================================================= */

akun: {

title:
  "Akun — Finance Assistant",

description:
  "Panduan mengenai akun dan pengaturan pengguna dalam Finance Assistant.",

keywords:
  "Finance Assistant, akun, pengaturan akun, pengguna"

},

privacy: {

title:
  "Data & Privasi — Finance Assistant",

description:
  "Informasi mengenai data dan privasi dalam penggunaan Finance Assistant.",

keywords:
  "Finance Assistant, data, privasi, keamanan data, data pengguna"

}

};

/* =========================================================
3. GET SEO CONFIG
========================================================= */

export function getSEO(articleId) {

return (
SEO_CONFIG[articleId] ||
SEO_CONFIG.pengenalan
);

}

/* =========================================================
4. META TAG HELPER
========================================================= */

function getOrCreateMeta({
name = null,
property = null
}) {

let selector;

if (name) {

selector =
  `meta[name="${name}"]`;

} else if (property) {

selector =
  `meta[property="${property}"]`;

} else {

return null;

}

let meta =
document.head.querySelector(selector);

if (!meta) {

meta =
  document.createElement("meta");


if (name) {

  meta.setAttribute(
    "name",
    name
  );

}


if (property) {

  meta.setAttribute(
    "property",
    property
  );

}


document.head.appendChild(meta);

}

return meta;

}

/* =========================================================
5. UPDATE META TAG
========================================================= */

function updateMeta({
name = null,
property = null,
content = ""
}) {

const meta =
getOrCreateMeta({
name,
property
});

if (!meta) {
return;
}

meta.setAttribute(
"content",
content
);

}

/* =========================================================
6. UPDATE CANONICAL
========================================================= */

function updateCanonical(url) {

let canonical =
document.head.querySelector(
'link[rel="canonical"]'
);

if (!canonical) {

canonical =
  document.createElement("link");


canonical.setAttribute(
  "rel",
  "canonical"
);


document.head.appendChild(
  canonical
);

}

canonical.setAttribute(
"href",
url
);

}

/* =========================================================
7. UPDATE JSON-LD
========================================================= */

function updateStructuredData({
articleId,
title,
description,
url
}) {

const scriptId =
"finance-assistant-docs-schema";

let script =
document.getElementById(
scriptId
);

if (!script) {

script =
  document.createElement("script");


script.type =
  "application/ld+json";


script.id =
  scriptId;


document.head.appendChild(
  script
);

}

const breadcrumbName =
articleId === "pengenalan"
? "Dokumentasi"
: title;

const schema = {

"@context":
  "https://schema.org",

"@graph": [

  {
    "@type":
      "WebPage",

    "@id":
      `${url}#webpage`,

    url,

    name:
      title,

    description,

    isPartOf: {

      "@type":
        "WebSite",

      name:
        SITE_NAME,

      url:
        `${SITE_URL}/`

    },

    inLanguage:
      "id-ID"

  },


  {
    "@type":
      "BreadcrumbList",

    "@id":
      `${url}#breadcrumb`,

    itemListElement: [

      {
        "@type":
          "ListItem",

        position:
          1,

        name:
          SITE_NAME,

        item:
          `${SITE_URL}/`

      },


      {
        "@type":
          "ListItem",

        position:
          2,

        name:
          "Dokumentasi",

        item:
          DOCS_URL

      },


      {
        "@type":
          "ListItem",

        position:
          3,

        name:
          breadcrumbName,

        item:
          url

      }

    ]

  }

]

};

script.textContent =
JSON.stringify(
schema
);

}

/* =========================================================
8. UPDATE SEO
========================================================= */

export function updateSEO(articleId) {

const seo =
getSEO(articleId);

if (!seo) {
return;
}

/* =======================================================
ARTICLE URL
======================================================= */

const articleURL =
articleId === "pengenalan"
? DOCS_URL
: "${DOCS_URL}${articleId}";

/* =======================================================
TITLE
======================================================= */

document.title =
seo.title;

/* =======================================================
DESCRIPTION
======================================================= */

updateMeta({

name:
  "description",

content:
  seo.description

});

/* =======================================================
KEYWORDS
======================================================= */

updateMeta({

name:
  "keywords",

content:
  seo.keywords

});

/* =======================================================
ROBOTS
======================================================= */

updateMeta({

name:
  "robots",

content:
  "index, follow"

});

/* =======================================================
CANONICAL
======================================================= */

updateCanonical(
articleURL
);

/* =======================================================
OPEN GRAPH
======================================================= */

updateMeta({

property:
  "og:type",

content:
  "article"

});

updateMeta({

property:
  "og:locale",

content:
  "id_ID"

});

updateMeta({

property:
  "og:title",

content:
  seo.title

});

updateMeta({

property:
  "og:description",

content:
  seo.description

});

updateMeta({

property:
  "og:url",

content:
  articleURL

});

updateMeta({

property:
  "og:site_name",

content:
  SITE_NAME

});

/* =======================================================
TWITTER / X
======================================================= */

updateMeta({

name:
  "twitter:card",

content:
  "summary"

});

updateMeta({

name:
  "twitter:title",

content:
  seo.title

});

updateMeta({

name:
  "twitter:description",

content:
  seo.description

});

/* =======================================================
STRUCTURED DATA
======================================================= */

updateStructuredData({

articleId,

title:
  seo.title,

description:
  seo.description,

url:
  articleURL

});

}
