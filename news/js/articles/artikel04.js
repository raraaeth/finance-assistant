/* =====================================================
   FINANCE ASSISTANT
   NEWS & UPDATE

   File    : /news/js/articles/artikel04.js
   Version : 1.0.0

   Description :
   Artikel 04 — Update Aplikasi Android.
===================================================== */

export default {
    slug:
        "update-aplikasi-android-finance-assistant",

    title:
        "Update: Finance Assistant Kini Punya Aplikasi Android",

    date:
        "2026-09-16",

    image:
        "/news/images/artikel04.webp",

    seo: {
        title:
            "Update: Finance Assistant Kini Punya Aplikasi Android | Finance Assistant",

        description:
            "Finance Assistant kini memiliki versi aplikasi Android untuk memudahkan akses dan input data tanpa harus membuka Chrome.",

        keywords:
            "Finance Assistant, aplikasi Android Finance Assistant, aplikasi keuangan Android, Finance Assistant Android, aplikasi pengelola keuangan, PWA Finance Assistant"
    },

    content: `
        <p>
            Ada satu hal baru yang baru saja saya selesaikan dalam pengembangan
            Finance Assistant.
        </p>

        <p>
            Setelah sebelumnya Finance Assistant bisa digunakan melalui
            browser sebagai PWA, sekarang saya juga sudah membuat
            <strong>versi aplikasi Android</strong> yang bisa dipasang
            langsung di perangkat.
        </p>

        <p>
            Sebenarnya, kalau sudah ada PWA, kenapa masih perlu membuat
            aplikasi Android?
        </p>

        <p>
            Jawabannya berawal dari masalah yang saya temukan ketika melakukan
            testing.
        </p>

        <h2>Awalnya saya kira masalahnya ada di aplikasi</h2>

        <p>
            Saat melakukan beberapa pengujian, saya menemukan sesuatu yang
            cukup membingungkan.
        </p>

        <p>
            Pada beberapa HP yang menggunakan Chrome, proses
            <strong>input data maupun pembuatan workspace tidak berhasil</strong>.
        </p>

        <p>
            Finance Assistant seperti tidak bisa terhubung dengan baik ke
            Google Apps Script yang digunakan untuk memproses data.
        </p>

        <p>
            Padahal ketika menggunakan HP yang sama, tetapi dibuka melalui
            <strong>mode Incognito</strong>, semuanya justru bisa berjalan
            dengan normal.
        </p>

        <p>
            Di situ saya mulai curiga bahwa masalahnya bukan berada pada
            aplikasi atau koneksi ke Apps Script-nya.
        </p>

        <p>
            Kalau HP yang sama bisa menjalankan proses tersebut melalui
            Incognito, berarti ada sesuatu pada lingkungan browser Chrome yang
            memengaruhinya.
        </p>

        <h2>Clear cache juga tidak menyelesaikan masalah</h2>

        <p>
            Saya kemudian mencoba beberapa hal yang biasanya dilakukan ketika
            browser mengalami masalah.
        </p>

        <p>
            Cache dibersihkan.
        </p>

        <p>
            Data Chrome dihapus.
        </p>

        <p>
            Kemudian dicoba lagi.
        </p>

        <p>
            Tetapi masalahnya tetap ada.
        </p>

        <p>
            Sementara ketika menggunakan mode Incognito, proses input dan
            pembuatan workspace kembali berhasil.
        </p>

        <p>
            Bagi saya ini cukup mengganggu, terutama karena Finance Assistant
            memang dibuat supaya proses pencatatan keuangan bisa dilakukan
            dengan mudah.
        </p>

        <p>
            Kalau pengguna harus mencari tahu kenapa Chrome di HP mereka tidak
            bisa melakukan input, tentu pengalaman menggunakan aplikasi menjadi
            kurang nyaman.
        </p>

        <p>
            Dari sinilah muncul sebuah ide.
        </p>

        <h2>Kenapa tidak membuat browser sendiri?</h2>

        <p>
            Saya kemudian berpikir:
        </p>

        <blockquote>
            <p>
                Bagaimana kalau Finance Assistant tidak perlu bergantung
                sepenuhnya pada browser bawaan di HP?
            </p>
        </blockquote>

        <p>
            Kalau masalahnya muncul dari lingkungan Chrome, mungkin kita bisa
            membuat aplikasi Android yang memiliki lingkungan browser sendiri.
        </p>

        <p>
            Bukan berarti PWA-nya bermasalah.
        </p>

        <p>
            Justru PWA tetap menjadi bagian penting dari Finance Assistant.
        </p>

        <p>
            Tetapi aplikasi Android ini memberikan pilihan lain untuk
            mengakses Finance Assistant tanpa harus membuka Chrome terlebih
            dahulu.
        </p>

        <p>
            Dari situlah saya mulai membuat versi Android.
        </p>

        <h2>Sekarang tidak perlu membuka Chrome untuk melakukan input</h2>

        <p>
            Dengan aplikasi Android ini, pengguna bisa langsung membuka
            <a href="/">Finance Assistant</a> dari aplikasi yang sudah terpasang di HP.
        </p>

        <p>
            Tidak perlu membuka Chrome.
        </p>

        <p>
            Tidak perlu mengetik alamat website.
        </p>

        <p>
            Tidak perlu mencari kembali bookmark atau shortcut PWA.
        </p>

        <p>
            Tinggal buka aplikasinya dan gunakan Finance Assistant seperti
            biasa.
        </p>

        <p>
            Terutama untuk aktivitas yang sering dilakukan seperti mencatat
            transaksi, mengatur workspace, atau melakukan input data lainnya,
            cara seperti ini terasa lebih praktis.
        </p>

        <p>
            Dan yang paling penting bagi saya, aplikasi ini menggunakan
            lingkungan browser sendiri sehingga tidak bergantung sepenuhnya
            pada konfigurasi Chrome yang ada di perangkat.
        </p>

        <h2>Bagaimana dengan PWA?</h2>

        <p>
            PWA tetap ada.
        </p>

        <p>
            Saya tidak membuat aplikasi Android ini untuk menggantikan PWA.
        </p>

        <p>
            Justru saya melihat keduanya sebagai dua cara untuk menggunakan
            Finance Assistant.
        </p>

        <p>
            PWA tetap bisa digunakan langsung melalui browser tanpa perlu
            memasang aplikasi.
        </p>

        <p>
            Sedangkan versi Android bisa menjadi pilihan bagi pengguna yang
            lebih nyaman menggunakan aplikasi dan ingin membuka Finance
            Assistant secara langsung dari HP.
        </p>

        <p>
            Jadi tidak harus memilih salah satunya.
        </p>

        <p>
            <strong>Gunakan cara yang paling nyaman.</strong>
        </p>

        <h2>Aplikasi Android ini masih dalam tahap pengembangan</h2>

        <p>
            Ada satu hal yang perlu saya sampaikan.
        </p>

        <p>
            Versi Android yang sekarang <strong>belum tersedia di Google Play
            Store</strong>.
        </p>

        <p>
            Aplikasi ini masih dalam tahap pengembangan dan untuk sementara
            file instalasinya tersedia dalam bentuk <strong>APK</strong>.
        </p>

        <p>
            Karena aplikasi belum terdaftar di Google Play Store, beberapa HP
            mungkin akan menampilkan peringatan keamanan ketika proses
            instalasi dilakukan.
        </p>

        <p>
            Hal tersebut dapat terjadi karena aplikasi dipasang dari sumber
            di luar Play Store.
        </p>

        <p>
            Jika ingin mencoba versi Android ini, gunakan file APK yang
            disediakan melalui Finance Assistant dan perhatikan peringatan
            keamanan yang ditampilkan oleh perangkat sebelum melanjutkan
            instalasi.
        </p>

        <p>
    Untuk sementara, kamu bisa mendapatkan aplikasi Android melalui
    link berikut:
</p>

<p>
    <a
        href="/assets/download/app-release.apk"
        download
    >
        📲 Download Aplikasi Android Finance Assistant
    </a>
</p>

<p>
    Jika link download di atas tidak berhasil, kamu bisa mengunjungi
    <a href="/pages/dashboard">Dashboard Finance Assistant</a>.
    Di sana tersedia tombol download aplikasi Android yang bisa digunakan
    untuk mendapatkan file APK.
</p>

        <h2>Kenapa belum ada di Google Play Store?</h2>

        <p>
            Sebenarnya saya juga ingin versi Android ini nantinya bisa
            tersedia secara resmi di Google Play Store.
        </p>

        <p>
            Tetapi proses pengembangannya belum selesai.
        </p>

        <p>
            Ada beberapa keterbatasan di lingkungan pengembangan yang sedang
            saya gunakan. Salah satunya karena komputer yang saya gunakan
            masih menggunakan <strong>Windows 7</strong>, sehingga proses
            pengembangan dan peningkatan versi Android Studio menjadi lebih
            terbatas.
        </p>

        <p>
            Jadi untuk saat ini, saya memilih menyelesaikan versi yang bisa
            digunakan terlebih dahulu.
        </p>

        <p>
            Ke depannya, saya akan berusaha membuat versi yang bisa
            didistribusikan melalui Google Play Store.
        </p>

        <h2>Ini bukan akhir dari pengembangan Finance Assistant</h2>

        <p>
            Bagi saya, membuat aplikasi Android ini sebenarnya bukan sekadar
            menambahkan satu cara baru untuk membuka Finance Assistant.
        </p>

        <p>
            Masalah yang saya temukan ketika testing justru membuat saya
            melihat bahwa sebuah aplikasi harus bisa beradaptasi dengan
            kondisi perangkat yang digunakan penggunanya.
        </p>

        <p>
            PWA memberikan kemudahan karena tidak perlu instalasi.
        </p>

        <p>
            Tetapi ketika ada kondisi tertentu pada browser yang membuat
            fungsi input tidak berjalan sebagaimana mestinya, memiliki
            alternatif akses tentu menjadi sesuatu yang berguna.
        </p>

        <p>
            Karena itu saya memutuskan untuk mencoba membuat aplikasi Android
            sendiri.
        </p>

        <p>
            Awalnya hanya karena ingin mencari solusi dari masalah yang saya
            temukan saat testing.
        </p>

        <p>
            Tetapi sekarang hasilnya sudah menjadi sebuah aplikasi yang bisa
            digunakan.
        </p>

        <h2>Finance Assistant Android</h2>

        <p>
            Jadi, kalau kamu sudah menggunakan Finance Assistant melalui
            browser, tidak ada kewajiban untuk berpindah ke aplikasi Android.
        </p>

        <p>
            PWA tetap bisa digunakan seperti biasa.
        </p>

        <p>
            Tetapi kalau kamu lebih suka membuka Finance Assistant seperti
            aplikasi Android biasa, sekarang sudah ada pilihannya.
        </p>

        <p>
            Untuk sementara versi Android ini masih dalam pengembangan dan
            belum tersedia di Google Play Store.
        </p>

        <p>
            Namun ini merupakan langkah awal menuju versi Android yang
            nantinya ingin saya kembangkan lebih jauh.
        </p>

        <p>
            <strong>
                Dari sebuah masalah saat testing, akhirnya lahir satu cara
                baru untuk menggunakan Finance Assistant.
            </strong>
        </p>

        <p>
            Dan seperti pengembangan fitur-fitur lainnya, aplikasi ini juga
            akan terus saya kembangkan sedikit demi sedikit.
        </p>
    `
};
