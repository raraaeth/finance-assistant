/* =====================================================
   Finance Assistant
   Documentation : Kas Bersama
   File          : kasdocs.js
   ===================================================== */

export default {
  title: "Kas Bersama",

  content: `

    <h2>Catat Buku Kas Mandiri</h2>

    <p class="doc-lead">
      <strong>Kas Bersama</strong> membantu kamu mencatat dan mengelola keuangan
      yang digunakan bersama, baik untuk kebutuhan tabungan maupun iuran.
      Semua transaksi dapat dicatat secara teratur berdasarkan anggota yang
      sudah terdaftar.
    </p>

    <p>
      Selain mencatat pemasukan dan pengeluaran, Kas Bersama juga dapat membantu
      melihat <strong>saldo kas, statistik transaksi, riwayat hutang,
      hingga distribusi dana setiap anggota</strong>.
    </p>

    <p>
      Yang menarik, fitur Kas dapat disesuaikan melalui Pengaturan. Kamu bisa
      menentukan apakah kas digunakan untuk <strong>tabungan atau iuran</strong>,
      serta mengaktifkan fitur <strong>hutang piutang</strong> jika diperlukan.
    </p>

    <div class="doc-image-card">
      <img
        src="/docs/images/kas_view.webp"
        alt="Tampilan Kas Bersama"
        loading="lazy"
      >
    </div>

    <h3>📊 Tampilan & Fitur Kas</h3>

    <p>
      Kas memiliki struktur tampilan yang sama seperti workspace lainnya,
      sehingga kamu akan menemukan beberapa bagian utama seperti
      <strong>Home, Statistik, Ringkasan, dan Profile</strong>.
    </p>

    <p>
      Pada halaman <strong>Home</strong>, kamu dapat melihat kondisi kas secara
      ringkas, termasuk total saldo dan informasi pemasukan yang sedang berjalan.
      Dari sini kamu juga bisa langsung menuju fitur input untuk menambahkan
      transaksi.
    </p>

    <p>
      Pada <strong>Statistik</strong>, data transaksi dapat dilihat berdasarkan
      periode tertentu. Tersedia filter periode seperti
      <strong>1 bulan, 3 bulan, 6 bulan, dan 12 bulan</strong>, sehingga
      perkembangan transaksi lebih mudah dipantau.
    </p>

    <p>
      Sementara itu, halaman <strong>Ringkasan</strong> memberikan informasi
      yang lebih spesifik mengenai kondisi kas. Salah satu bagian yang tersedia
      adalah <strong>Distribusi Dana</strong>, yang memperlihatkan jumlah dana
      yang dimiliki atau menjadi bagian masing-masing anggota.
    </p>

    <p>
      Jika fitur hutang piutang diaktifkan, Ringkasan juga akan menampilkan
      bagian <strong>Hutang</strong>. Bagian ini digunakan untuk melihat hutang
      yang masih aktif sekaligus riwayat transaksi pinjam dan bayar.
    </p>


    <h2>⚙️ Atur Kas Sebelum Digunakan</h2>

    <p>
      Sebelum mulai mencatat transaksi, sebaiknya lakukan konfigurasi Kas
      terlebih dahulu.
    </p>

    <p>
      Pengaturan Kas terdiri dari dua bagian utama:
    </p>

    <ul>
      <li>
        <strong>Rule Kas</strong> — menentukan jenis transaksi yang tersedia.
      </li>
      <li>
        <strong>Nama Member</strong> — menentukan siapa saja yang dapat
        digunakan dalam transaksi Kas.
      </li>
    </ul>

    <div class="doc-image-card">
      <img
        src="/docs/images/kas_setting.webp"
        alt="Pengaturan Kas Bersama"
        loading="lazy"
      >
    </div>

    <h3>⚙️ Tentukan Rule Kas</h3>

    <p>
      Rule digunakan untuk menentukan bagaimana Kas akan digunakan.
    </p>

    <p>
      Terdapat pilihan kategori yang dapat disesuaikan dengan kebutuhan.
    </p>

    <p>
      <strong>Tabungan</strong> digunakan jika Kas tersebut ditujukan untuk
      kegiatan menabung. Transaksi yang dibuat nantinya akan menggunakan
      kategori <strong>Nabung</strong>.
    </p>

    <p>
      Sedangkan <strong>Kas</strong> digunakan jika Kas tersebut diperuntukkan
      untuk kegiatan <strong>iuran</strong>. Transaksi yang dicatat akan
      mengikuti kategori yang tersedia untuk kebutuhan kas atau iuran.
    </p>

    <p>
      Selain itu, tersedia <strong>Rule Hutang</strong> yang dapat diaktifkan
      jika kamu ingin menggunakan fitur hutang piutang.
    </p>

    <p>
      Ketika Rule Hutang diaktifkan, transaksi <strong>Hutang</strong> dan
      <strong>Bayar</strong> akan tersedia pada saat melakukan input.
      Data hutang tersebut juga akan digunakan pada bagian
      <strong>Hutang</strong> di Ringkasan.
    </p>

    <div class="doc-info-box">
      <strong>💡 Tips</strong>
      <p>
        Atur Rule Kas sesuai kebutuhan sejak awal agar pilihan transaksi yang
        muncul saat input tetap relevan dengan fungsi Kas yang kamu buat.
      </p>
    </div>


    <h3>👥 Tambahkan Member</h3>

    <p>
      Bagian <strong>Nama Member</strong> digunakan untuk menentukan anggota
      yang terlibat dalam Kas.
    </p>

    <p>
      Kamu cukup memasukkan nama anggota melalui Pengaturan. Setelah tersimpan,
      nama-nama tersebut akan otomatis tersedia ketika melakukan input transaksi.
    </p>

    <p>
      Jadi, kamu <strong>tidak perlu mengetik nama member secara manual setiap
      kali membuat transaksi</strong>.
    </p>


    <h2>✍️ Catat Transaksi Kas</h2>

    <p>
      Setelah konfigurasi selesai, kamu bisa mulai mencatat transaksi.
    </p>

    <p>
      Proses input dilakukan <strong>secara bertahap</strong>, sehingga kamu
      dapat memasukkan beberapa transaksi sekaligus sebelum melakukan
      konfirmasi.
    </p>

    <div class="doc-image-card">
      <img
        src="/docs/images/kas_input.webp"
        alt="Input transaksi Kas Bersama"
        loading="lazy"
      >
    </div>

    <h3>1. Pilih Jenis Transaksi</h3>

    <p>
      Langkah pertama adalah memilih <strong>Jenis Transaksi</strong>.
    </p>

    <p>
      Pilihan yang tersedia akan mengikuti <strong>Rule Kas</strong> yang
      sebelumnya kamu aktifkan di Pengaturan.
    </p>

    <p>
      Artinya, kamu tidak perlu mengatur ulang jenis transaksi setiap kali
      melakukan input. Sistem akan menyesuaikan pilihan berdasarkan konfigurasi
      Kas.
    </p>


    <h3>2. Lengkapi Data Transaksi</h3>

    <p>
      Setelah jenis transaksi dipilih, lengkapi informasi transaksi yang
      diperlukan.
    </p>

    <p>
      Untuk transaksi yang melibatkan anggota, pilihan
      <strong>Nama Member</strong> akan otomatis mengambil daftar member yang
      sudah kamu masukkan melalui Pengaturan Kas.
    </p>

    <p>
      Cukup pilih member yang sesuai, kemudian masukkan nominal dan informasi
      transaksi lainnya.
    </p>


    <h3>3. Tambahkan Transaksi Berikutnya</h3>

    <p>
      Kamu tidak harus melakukan konfirmasi setiap kali selesai memasukkan
      satu transaksi.
    </p>

    <p>
      Transaksi dapat ditambahkan <strong>satu per satu dan dikumpulkan
      terlebih dahulu</strong> pada bagian <strong>Input Saat Ini</strong>.
    </p>

    <p>
      Dengan begitu, misalnya kamu memiliki beberapa transaksi iuran dari
      beberapa anggota pada hari yang sama, semuanya dapat dimasukkan terlebih
      dahulu sebelum disimpan.
    </p>


    <h3>4. Keluar → Lain-lain</h3>

    <p>
      Selain transaksi yang berkaitan dengan member, tersedia juga jenis
      transaksi <strong>Keluar → Lain-lain</strong>.
    </p>

    <p>
      Jenis transaksi ini digunakan ketika dana Kas dikeluarkan untuk
      <strong>keperluan lain di luar tabungan atau iuran anggota</strong>.
    </p>

    <p>
      Contohnya seperti membeli peralatan yang dibutuhkan untuk kegiatan Kas,
      membayar kebutuhan operasional, atau menggunakan sebagian dana Kas untuk
      <strong>donasi</strong>.
    </p>

    <div class="doc-info-box">
      <strong>💡 Penting</strong>
      <p>
        Transaksi <strong>Keluar → Lain-lain</strong> tidak membutuhkan
        <strong>Nama Member</strong>, karena pengeluaran tersebut bukan
        transaksi pribadi milik salah satu anggota.
      </p>
    </div>

    <p>
      Dana yang dicatat sebagai <strong>Keluar → Lain-lain</strong> akan
      <strong>mengurangi total saldo Kas</strong>, karena memang dana tersebut
      keluar dari kas bersama.
    </p>

    <p>
      Namun, transaksi ini <strong>tidak mengurangi saldo tabungan atau iuran
      perorangan</strong> yang sebelumnya dikumpulkan dari masing-masing member.
    </p>

    <p>
      Jadi, jika seluruh anggota sudah mengumpulkan dana dan sebagian dana
      tersebut digunakan untuk membeli perlengkapan Kas, pengeluaran tersebut
      dicatat sebagai <strong>Keluar → Lain-lain</strong>, bukan sebagai
      pengurangan saldo milik salah satu member.
    </p>


    <h3>5. Periksa dan Konfirmasi</h3>

    <p>
      Setelah semua transaksi selesai dimasukkan, periksa kembali daftar pada
      <strong>Input Saat Ini</strong>.
    </p>

    <p>
      Jika sudah sesuai, tekan <strong>Konfirmasi</strong> untuk menyimpan
      seluruh transaksi.
    </p>

    <p>
      Cara ini membuat pencatatan beberapa transaksi menjadi lebih praktis
      tanpa harus bolak-balik membuka form input.
    </p>


    <h2>💡 Bagaimana dengan Hutang?</h2>

    <p>
      Jika <strong>Rule Hutang</strong> diaktifkan, Kas akan memiliki
      kemampuan untuk mencatat transaksi hutang piutang.
    </p>

    <p>
      Transaksi dapat dicatat sebagai <strong>Hutang</strong> ketika seorang
      anggota meminjam dana, kemudian dicatat sebagai <strong>Bayar</strong>
      ketika hutang tersebut dibayarkan.
    </p>

    <p>
      Sistem kemudian dapat menggunakan riwayat tersebut untuk menampilkan
      kondisi hutang pada bagian <strong>Ringkasan</strong>.
    </p>

    <p>
      Jika tidak ada transaksi hutang atau seluruh hutang sudah dibayar,
      bagian hutang aktif akan menunjukkan bahwa
      <strong>tidak ada anggota yang masih memiliki hutang</strong>.
    </p>

    <p>
      Dengan begitu, fitur hutang tidak mengganggu Kas yang hanya digunakan
      untuk tabungan atau iuran — fitur tersebut dapat diaktifkan hanya ketika
      memang dibutuhkan.
    </p>


    <h2>🎯 Kas Siap Digunakan</h2>

    <p>
      Dengan konfigurasi Rule dan Member yang sudah sesuai, Kas siap digunakan
      untuk mencatat transaksi secara lebih teratur.
    </p>

    <div class="doc-highlight">
      <strong>Atur rule → Tambahkan member → Catat transaksi → Periksa → Konfirmasi.</strong>
    </div>

    <p>
      Semua data yang sudah dicatat kemudian dapat dipantau kembali melalui
      <strong>Home, Statistik, dan Ringkasan</strong>.
    </p>

  `
};
