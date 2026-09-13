/* =========================================================
   FINANCE ASSISTANT — DOCUMENTATION
   Article : Data & Privasi
   ========================================================= */

export default {

  title: "Data & Privasi",

  content: `

    <h2>🔐 Data Kamu, Tetap di Ruangmu</h2>

    <p>
      Finance Assistant dibangun dengan prinsip sederhana:
      <strong>data keuangan adalah milik user yang membuatnya.</strong>
    </p>

    <p>
      Karena itu, Finance Assistant tidak dirancang untuk
      mengumpulkan seluruh data keuangan pengguna ke dalam
      satu database pusat. Setiap user menggunakan akun Google
      miliknya sendiri untuk menyimpan dan mengelola data
      Finance Assistant.
    </p>

    <div class="doc-highlight">

      <strong>🛡️ Prinsip utama Finance Assistant</strong>

      <p>
        Finance Assistant berfungsi sebagai aplikasi yang
        menjembatani user dengan data miliknya sendiri,
        bukan mengambil alih kepemilikan data tersebut.
      </p>

    </div>


    <h2>🔑 Mengapa Harus Login dengan Google?</h2>

    <p>
      Login Google diperlukan karena Finance Assistant
      memanfaatkan <strong>Google Drive dan Google Sheets</strong>
      sebagai tempat penyimpanan data masing-masing user.
    </p>

    <p>
      Setelah user memberikan izin, Finance Assistant dapat
      menggunakan Google Services milik user untuk membuat,
      membaca, dan memperbarui data yang dibutuhkan aplikasi.
    </p>

    <p>
      Jadi, login Google bukan sekadar untuk mengetahui siapa
      yang menggunakan aplikasi. Login tersebut menjadi
      penghubung antara Finance Assistant dan ruang data pribadi
      milik user.
    </p>


    <h2>☁️ Data Disimpan di Google Drive Milikmu</h2>

    <p>
      Finance Assistant membuat struktur workspace pada Google
      Drive akun yang terhubung. Di dalamnya terdapat folder
      <strong>Finance Assistant</strong> dan
      <strong>Finance Core</strong> sebagai bagian dari sistem
      workspace.
    </p>

    <p>
      Data setiap user berada pada ruang Google miliknya sendiri.
      User lain tidak mendapatkan akses otomatis ke workspace
      atau data tersebut.
    </p>

    <div class="doc-info-box">

      <strong>💡 Setiap user memiliki ruang datanya sendiri</strong>

      <p>
        Tidak ada satu spreadsheet pusat yang digunakan untuk
        menampung data keuangan seluruh pengguna Finance Assistant.
      </p>

    </div>


    <h2>👤 Bagaimana dengan Data yang Kamu Masukkan?</h2>

    <p>
      Ketika kamu mencatat pemasukan, pengeluaran, tabungan,
      kas, payroll, airdrop, maupun konfigurasi lainnya,
      data tersebut digunakan untuk kebutuhan workspace kamu
      sendiri.
    </p>

    <p>
      Data input tersebut tidak dibuat untuk menjadi kumpulan
      data milik Finance Assistant yang kemudian dapat dilihat
      oleh pengguna lain.
    </p>

    <p>
      Dengan arsitektur seperti ini, <strong>developer dan user
      lain tidak secara otomatis mengetahui data yang kamu
      masukkan ke dalam workspace milikmu.</strong>
    </p>


    <h2>🔒 Bagaimana dengan Data Login?</h2>

    <p>
      Informasi login Google digunakan untuk autentikasi,
      menjaga sesi user, dan mendapatkan akses yang diperlukan
      untuk menggunakan Google Drive dan Google Sheets milik
      user.
    </p>

    <p>
      Data login tidak digunakan untuk kepentingan lain,
      tidak dimaksudkan untuk dijadikan produk data, dan tidak
      disebarluaskan kepada pihak lain.
    </p>

    <p>
      Prinsipnya sederhana:
      <strong>login digunakan agar Finance Assistant dapat
      menyimpan dan memuat kembali data dari Google milikmu.</strong>
    </p>


    <h2>🌉 Finance Assistant Hanya Sebagai Jembatan</h2>

    <p>
      Finance Assistant dapat dibayangkan sebagai sebuah
      <strong>jembatan</strong>.
    </p>

    <p>
      Di satu sisi terdapat kamu dan data milikmu di Google Drive.
      Di sisi lainnya terdapat aplikasi Finance Assistant yang
      menyediakan tampilan, fitur, perhitungan, dan sistem untuk
      mengelola data tersebut.
    </p>

    <p>
      Aplikasi membantu kamu menggunakan data tersebut dengan
      lebih mudah, tetapi ruang penyimpanan dasarnya tetap berada
      pada akun Google yang kamu gunakan sendiri.
    </p>

    <div class="doc-highlight">

      <strong>💙 Visi Finance Assistant</strong>

      <p>
        Membantu orang mengelola keuangan dengan lebih mudah,
        teratur, dan nyaman, tanpa menjadikan data keuangan
        pribadi mereka sebagai milik aplikasi.
      </p>

    </div>


    <h2>📌 Singkatnya</h2>

    <ul>

      <li>
        Login Google diperlukan untuk menghubungkan Finance
        Assistant dengan Google milik user.
      </li>

      <li>
        Data disimpan pada Google Drive dan Google Sheets
        milik masing-masing user.
      </li>

      <li>
        Setiap user memiliki workspace dan data masing-masing.
      </li>

      <li>
        Developer maupun user lain tidak mendapatkan akses
        otomatis ke data workspace milikmu.
      </li>

      <li>
        Informasi login digunakan untuk kebutuhan autentikasi
        dan akses data yang diperlukan aplikasi, bukan untuk
        kepentingan lain atau disebarluaskan.
      </li>

      <li>
        Finance Assistant berperan sebagai aplikasi yang
        menjembatani kamu dengan data milikmu sendiri.
      </li>

    </ul>


    <div class="doc-info-box">

      <strong>🔐 Data kamu tetap milikmu.</strong>

      <p>
        Finance Assistant dibuat untuk membantu kamu mengelola
        data tersebut, bukan untuk mengambil alih data pribadi
        yang kamu simpan.
      </p>

    </div>

  `

};
