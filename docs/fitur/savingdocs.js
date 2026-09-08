/* =====================================================
   Finance Assistant
   Documentation : Saving
   File          : savingdocs.js

   Location :
   /docs/fitur/savingdocs.js

   Description :
   Dokumentasi fitur Saving
   ===================================================== */

export default {

  title: "saving",

  content: `

    <!-- =========================================
         INTRO
         ========================================= -->

    <h2> Catat Tabungan Mandiri (Saving) </h2>
    
    <p class="doc-lead">
      Saving membantu kamu mencatat dan memantau
      <strong>dana yang kamu simpan</strong> di berbagai
      bank, e-wallet, maupun tempat penyimpanan lainnya.
    </p>

    <p>
      Dengan Saving, kamu bisa melihat kondisi tabungan
      secara keseluruhan, memantau pergerakan dana,
      serta mencatat setiap transaksi yang memengaruhi
      saldo penyimpananmu.
    </p>

    <div class="doc-image-card">
      <img
        src="/docs/images/saving_view.webp"
        alt="Tampilan Home, Statistik, dan Summary pada Saving"
        loading="lazy"
      >
    </div>

    <p>
      Saving memiliki tiga bagian utama yang membantu
      kamu melihat dan memahami kondisi dana:
    </p>


    <!-- HOME -->

    <div class="doc-step">

      <h3>🏠 Home</h3>

      <p>
        Home menjadi halaman utama Saving.
      </p>

      <p>
        Di sini kamu bisa melihat
        <strong>ringkasan kondisi tabungan</strong>
        sekaligus mengakses fungsi utama untuk
        mengelola data Saving.
      </p>

      <p>Pada Home tersedia:</p>

      <ul>
        <li>
          <strong>Ringkasan saldo</strong> —
          melihat gambaran kondisi dana yang tersimpan.
        </li>

        <li>
          <strong>Konfigurasi Setting</strong> —
          mengatur pilihan bank, wallet, atau tempat
          penyimpanan yang digunakan.
        </li>

        <li>
          <strong>Input</strong> —
          menambahkan transaksi Saving.
        </li>
      </ul>

      <p>
        Jadi, Home bisa menjadi titik awal untuk
        <strong>melihat kondisi dana sekaligus
        mengelola data Saving.</strong>
      </p>

    </div>


    <!-- STATISTIK -->

    <div class="doc-step">

      <h3>📊 Statistik</h3>

      <p>
        Statistik digunakan untuk melihat
        <strong>pergerakan transaksi Saving berdasarkan
        periode tertentu.</strong>
      </p>

      <p>Di dalamnya terdapat:</p>

      <ul>
        <li>
          <strong>Filter data</strong> —
          menentukan periode data yang ingin dilihat,
          seperti 1, 3, 6, atau 12 bulan.
        </li>

        <li>
          <strong>Grafik</strong> —
          menampilkan perubahan transaksi berdasarkan
          tanggal dalam bentuk grafik.
        </li>

        <li>
          <strong>Rincian Transaksi</strong> —
          melihat data transaksi yang termasuk dalam
          periode yang dipilih.
        </li>
      </ul>

      <p>
        Dengan Statistik, kamu bisa lebih mudah melihat
        <strong>kapan dana masuk, keluar, atau mengalami
        perpindahan.</strong>
      </p>

    </div>


    <!-- SUMMARY -->

    <div class="doc-step">

      <h3>📋 Summary</h3>

      <p>
        Summary memberikan gambaran yang lebih ringkas
        mengenai <strong>kondisi keseluruhan dana
        Saving.</strong>
      </p>

      <p>Di dalamnya terdapat:</p>

      <ul>
        <li>
          <strong>Ringkasan</strong> —
          menampilkan total saldo serta perbandingan
          dana masuk dan keluar.
        </li>

        <li>
          <strong>Distribusi Dana</strong> —
          melihat bagaimana total dana tersebar di
          berbagai tempat penyimpanan melalui
          <strong>donut chart.</strong>
        </li>

        <li>
          <strong>Total per Bank / Wallet</strong> —
          melihat jumlah dana yang tersimpan pada
          masing-masing bank atau tempat penyimpanan
          dalam bentuk <strong>horizontal bar.</strong>
        </li>
      </ul>

      <p>
        Dengan begitu, kamu bisa mengetahui
        <strong>berapa total dana yang dimiliki dan
        di mana dana tersebut tersimpan</strong>
        tanpa harus melihat transaksi satu per satu.
      </p>

    </div>


    <!-- =========================================
         2. KONFIGURASI SAVING
         ========================================= -->

    <h2>⚙️ Konfigurasi Saving</h2>

    <div class="doc-image-card">
      <img
        src="/docs/images/saving_setting.webp"
        alt="Pengaturan Saving untuk memilih bank dan menambahkan nama penyimpanan sendiri"
        loading="lazy"
      >
    </div>

    <p>
      Sebelum mulai memasukkan transaksi, Saving
      menyediakan konfigurasi untuk menentukan
      <strong>tempat-tempat penyimpanan dana yang ingin
      digunakan.</strong>
    </p>

    <p>
      Konfigurasi ini dilakukan melalui menu
      <strong>Pengaturan Saving.</strong>
    </p>


    <!-- BANK / WALLET -->

    <div class="doc-step">

      <h3>🏦 Pilihan Bank / Wallet</h3>

      <p>
        Saving sudah menyediakan daftar pilihan bank,
        e-wallet, dan beberapa tempat penyimpanan dana
        yang umum digunakan.
      </p>

      <p>Contohnya:</p>

      <ul>
        <li>Mandiri</li>
        <li>BRI</li>
        <li>BNI</li>
        <li>BCA</li>
        <li>SeaBank</li>
        <li>DANA</li>
        <li>Dan lain sebagainya</li>
      </ul>

      <p>
        Kamu cukup
        <strong>mencentang pilihan yang ingin digunakan.</strong>
      </p>

      <p>
        Pilihan yang kamu aktifkan nantinya akan otomatis
        menjadi <strong>opsi Bank / Wallet</strong>
        yang tersedia saat melakukan input transaksi.
      </p>

      <p>
        Jadi, kamu tidak perlu mengetik ulang nama
        penyimpanan setiap kali mencatat transaksi.
      </p>

    </div>


    <!-- TIPS -->

    <div class="doc-info-box">

      <strong>💡 Tips</strong>

      <p>
        Aktifkan hanya pilihan yang memang kamu gunakan
        agar daftar pada form input tetap rapi dan
        mudah dipilih.
      </p>

    </div>


    <!-- NAMA SENDIRI -->

    <div class="doc-step">

      <h3>✏️ Nama Sendiri</h3>

      <p>
        Tidak semua tempat penyimpanan harus tersedia
        di daftar bawaan.
      </p>

      <p>
        Kalau kamu memiliki bank, wallet, rekening,
        atau tempat penyimpanan lain yang belum tersedia,
        kamu bisa menambahkannya melalui bagian
        <strong>Nama Sendiri.</strong>
      </p>

      <p>
        Caranya cukup masukkan nama penyimpanan yang
        kamu inginkan, kemudian tambahkan ke daftar pilihan.
      </p>

      <p>Misalnya:</p>

      <ul>
        <li>Jago</li>
        <li>SeaBank Bisnis</li>
        <li>Rekening Usaha</li>
        <li>Tabungan Rumah</li>
        <li>Dompet Pribadi</li>
      </ul>

      <p>
        Nama yang kamu tambahkan nantinya juga dapat
        digunakan sebagai
        <strong>pilihan Bank / Wallet pada saat
        input transaksi.</strong>
      </p>

      <p>
        Dengan fitur ini, daftar penyimpanan bisa
        disesuaikan dengan kondisi keuanganmu sendiri.
      </p>

    </div>


    <!-- =========================================
         3. CARA INPUT
         ========================================= -->

    <h2>📝 Cara Input Saving</h2>

    <div class="doc-image-card">
      <img
        src="/docs/images/saving_input.webp"
        alt="Cara input transaksi pada Saving"
        loading="lazy"
      >
    </div>

    <p>
      Setelah konfigurasi selesai, kamu bisa mulai
      mencatat transaksi melalui fitur
      <strong>Input.</strong>
    </p>

    <p>
      Saving dirancang agar kamu tidak harus memasukkan
      transaksi satu per satu. Beberapa transaksi dapat
      dikumpulkan terlebih dahulu dalam satu proses input.
    </p>


    <!-- STEP 1 -->

    <div class="doc-step">

      <h3>1. Mulai Input</h3>

      <p>
        Pilih jenis transaksi yang ingin dicatat,
        kemudian lengkapi data transaksi sesuai kebutuhan.
      </p>

      <p>
        Setelah data selesai diisi, tekan
        <strong>Tambahkan.</strong>
      </p>

      <p>
        Transaksi tersebut akan masuk ke daftar
        <strong>Input Saat Ini.</strong>
      </p>

    </div>


    <!-- STEP 2 -->

    <div class="doc-step">

      <h3>2. Tambahkan Beberapa Transaksi</h3>

      <p>
        Setelah satu transaksi ditambahkan, form input
        dapat digunakan kembali untuk memasukkan transaksi
        berikutnya.
      </p>

      <p>
        Kamu bisa menekan
        <strong>Tambahkan</strong> setiap kali selesai
        mengisi satu transaksi.
      </p>

      <p>
        Dengan begitu,
        <strong>beberapa transaksi dapat dikumpulkan
        dalam satu proses input.</strong>
      </p>

      <p>Misalnya dalam satu sesi kamu ingin mencatat:</p>

      <ul>
        <li>Transfer masuk dari seseorang</li>
        <li>Setoran tabungan</li>
        <li>Pengeluaran dari bank tertentu</li>
        <li>Transfer antar rekening sendiri</li>
      </ul>

      <p>
        Semua transaksi tersebut bisa dikumpulkan
        terlebih dahulu sebelum disimpan.
      </p>

    </div>


    <!-- STEP 3 -->

    <div class="doc-step">

      <h3>3. Periksa &amp; Konfirmasi</h3>

      <p>
        Setiap transaksi yang sudah ditambahkan akan
        muncul pada bagian
        <strong>Input Saat Ini.</strong>
      </p>

      <p>
        Sebelum menyimpan, kamu bisa memeriksa kembali
        data yang sudah dimasukkan.
      </p>

      <p>
        Jika semua transaksi sudah benar, tekan
        <strong>Konfirmasi.</strong>
      </p>

      <p>
        Semua data yang sudah dikumpulkan kemudian akan
        diproses sekaligus.
      </p>

    </div>


    <!-- TIPS INPUT -->

    <div class="doc-info-box">

      <strong>💡 Tips</strong>

      <p>
        Fitur ini cocok digunakan ketika kamu ingin
        mencatat banyak transaksi sekaligus, misalnya
        setelah merekap transaksi beberapa hari atau
        setelah melakukan pengecekan rekening.
      </p>

    </div>


    <!-- =========================================
         4. INTERNAL TRANSFER
         ========================================= -->

    <h2>🔄 Transfer — Internal Transfer</h2>

    <p>
      Salah satu jenis transaksi penting di Saving
      adalah <strong>Internal Transfer.</strong>
    </p>

    <p>
      Internal Transfer digunakan ketika kamu
      <strong>memindahkan dana antar bank, wallet,
      atau tempat penyimpanan yang masih menjadi
      milikmu sendiri.</strong>
    </p>


    <!-- CONTOH -->

    <div class="doc-highlight">

      <h3>💸 Contoh</h3>

      <p>
        <strong>Mandiri → SeaBank</strong>
      </p>

      <p>
        Misalnya kamu memindahkan:
      </p>

      <p>
        <strong>Rp1.000.000 dari Mandiri ke SeaBank.</strong>
      </p>

      <p>
        Dana tersebut sebenarnya tidak bertambah
        dan tidak berkurang.
      </p>

      <p>
        Yang berubah hanya
        <strong>lokasi penyimpanannya.</strong>
      </p>

    </div>


    <!-- SALDO -->

    <div class="doc-step">

      <h3>💰 Apa yang terjadi pada saldo?</h3>

      <ul>
        <li>
          Mandiri: <strong>− Rp1.000.000</strong>
        </li>

        <li>
          SeaBank: <strong>+ Rp1.000.000</strong>
        </li>

        <li>
          Total saldo:
          <strong>tetap</strong>
        </li>
      </ul>

      <p>
        Jadi, Internal Transfer
        <strong>tidak dianggap sebagai pemasukan atau
        pengeluaran yang mengubah total saldo Saving.</strong>
      </p>

      <p>
        Fungsinya hanya untuk mencatat bahwa dana telah
        berpindah dari satu tempat penyimpanan ke
        tempat lainnya.
      </p>

    </div>


    <!-- KENAPA PENTING -->

    <div class="doc-step">

      <h3>🔄 Kenapa Internal Transfer penting?</h3>

      <p>
        Tanpa Internal Transfer, perpindahan dana antar
        rekening sendiri bisa terlihat seperti:
      </p>

      <p>
        <strong>
          uang keluar dari satu bank
          → uang masuk lagi sebagai pemasukan.
        </strong>
      </p>

      <p>
        Padahal sebenarnya
        <strong>tidak ada perubahan jumlah kekayaan,
        hanya perpindahan tempat.</strong>
      </p>

      <p>
        Dengan menggunakan Internal Transfer,
        pencatatan menjadi lebih akurat karena sistem
        dapat membedakan antara:
      </p>

      <ul>
        <li>
          💰 <strong>Dana benar-benar masuk atau keluar</strong>
        </li>

        <li>
          🔄 <strong>Dana hanya berpindah tempat</strong>
        </li>
      </ul>

    </div>


    <!-- =========================================
         ALUR
         ========================================= -->

    <h2>✨ Alur Penggunaan Saving</h2>

    <p>
      Secara sederhana, penggunaan Saving bisa mengikuti
      alur:
    </p>

    <div class="doc-highlight">

      <p>
        <strong>⚙️ Konfigurasi → 📝 Input → 📊 Pantau</strong>
      </p>

      <p>
        <strong>Konfigurasi</strong><br>
        Tentukan bank, wallet, dan tempat penyimpanan
        yang kamu gunakan.
      </p>

      <p>
        ↓
      </p>

      <p>
        <strong>Input</strong><br>
        Catat transaksi dan gunakan Internal Transfer
        jika dana berpindah antar penyimpanan milik sendiri.
      </p>

      <p>
        ↓
      </p>

      <p>
        <strong>Home</strong><br>
        Lihat kondisi dana secara cepat.
      </p>

      <p>
        ↓
      </p>

      <p>
        <strong>Statistik</strong><br>
        Analisis pergerakan transaksi berdasarkan periode.
      </p>

      <p>
        ↓
      </p>

      <p>
        <strong>Summary</strong><br>
        Lihat total saldo dan distribusi dana di seluruh
        penyimpanan.
      </p>

    </div>


    <!-- =========================================
         PENUTUP
         ========================================= -->

    <div class="doc-next-card">

      <h3>🎯 Saving siap digunakan</h3>

      <p>
        Setelah bank atau tempat penyimpanan dikonfigurasi,
        kamu bisa mulai mencatat transaksi dan memantau
        perkembangan dana melalui Home, Statistik,
        dan Summary.
      </p>

    </div>

  `
};
