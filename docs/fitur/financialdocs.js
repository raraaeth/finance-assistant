export default {
  title: "financial",
  content: `
    <div class="doc-article">

      <h2>Catat pengeluaran Financialmu</h2>

      <p class="doc-lead">
        Financial membantu kamu mencatat pemasukan dan pengeluaran harian
        secara lebih terperinci. Dengan setiap transaksi yang dicatat,
        kamu bisa memantau kondisi dan saldo actual secara real time.
      </p>

      <p>
        Dengan begitu, kamu tidak perlu khawatir ada uang yang
        "kesalip" atau terlupakan. Setiap uang yang masuk dan keluar
        dapat dicatat dan ditelusuri kembali.
      </p>

      <p>
        Namun Financial tidak hanya digunakan untuk mencatat pemasukan
        dan pengeluaran. Kamu juga bisa menggunakannya untuk mencatat
        <strong>hutang</strong> serta <strong>tabungan atau dana darurat</strong>
        yang sedang kamu simpan.
      </p>


      <div class="doc-image-card">
        <img
          src="/docs/images/financial_view.webp"
          alt="Tampilan Financial"
        >
      </div>


      <h2>⚙️ Setting Financial</h2>

      <p>
        Sebelum mulai mencatat transaksi, kamu bisa menentukan rule dan
        activity yang ingin digunakan pada Financial.
      </p>

      <p>
        Setting Financial terdiri dari tiga bagian utama.
      </p>


      <div class="doc-step">
        <h3>1. Aktifkan Rule</h3>

        <p>
          Rule digunakan untuk menentukan fitur transaksi tambahan
          yang ingin digunakan.
        </p>

        <p>
          Rule pemasukan dan pengeluaran menjadi dasar pencatatan
          transaksi. Selain itu, kamu bisa mengaktifkan
          <strong>Rule Hutang</strong> dan <strong>Rule Tabungan</strong>
          jika memang membutuhkan pencatatan hutang atau tabungan.
        </p>

        <p>
          Ketika sebuah rule diaktifkan, pilihan transaksi yang
          berhubungan dengan rule tersebut akan tersedia pada bagian
          input.
        </p>
      </div>


      <div class="doc-step">
        <h3>2. Pilih Activity Pemasukan</h3>

        <p>
          Pilih activity pemasukan sesuai dengan kebutuhanmu.
          Activity yang dipilih di sini nantinya akan menjadi pilihan
          ketika kamu melakukan input transaksi pemasukan.
        </p>

        <p>
          Contohnya seperti <strong>Gaji</strong>,
          <strong>Penghasilan Lain</strong>, atau activity lain
          yang tersedia.
        </p>
      </div>


      <div class="doc-step">
        <h3>3. Pilih Activity Pengeluaran</h3>

        <p>
          Pilih juga activity pengeluaran yang memang ingin kamu
          gunakan dalam pencatatan sehari-hari.
        </p>

        <p>
          Activity yang sudah dipilih akan menjadi pilihan saat
          kamu membuat transaksi pengeluaran.
        </p>
      </div>


      <div class="doc-info-box">
        <strong>💡 Tips</strong>
        <p>
          Pilih activity yang memang kamu perlukan. Dengan begitu,
          pilihan saat melakukan input tetap sederhana dan sesuai
          dengan kebiasaan keuanganmu.
        </p>
      </div>


      <h3>🪙 Tabungan dan Dana Darurat</h3>

      <p>
        Rule Tabungan bisa digunakan untuk mencatat uang yang sengaja
        kamu simpan, baik sebagai tabungan biasa maupun sebagai
        <strong>dana darurat</strong>.
      </p>

      <p>
        Bahkan, fitur ini bisa berguna untuk jenis tabungan sederhana
        seperti <strong>tabungan kaleng</strong>.
      </p>

      <p>
        Biasanya, jumlah uang di dalam tabungan kaleng baru bisa
        diketahui setelah tabungan tersebut dibuka atau dipecahkan.
        Dengan Financial, kamu bisa mencatat setiap uang yang
        dimasukkan ke dalam tabungan tersebut.
      </p>

      <p>
        Dari catatan tersebut, kamu bisa mengetahui berapa nominal
        yang sudah terkumpul tanpa harus membuka tabungannya terlebih
        dahulu.
      </p>

      <div class="doc-highlight">
        <strong>💰 Tabungan tetap bisa dipantau</strong>
        <p>
          Uang yang sudah ditabung memang tidak lagi tersedia di
          saldo actual, tetapi nominalnya tetap tercatat sebagai
          dana yang tersimpan.
        </p>
      </div>


      <div class="doc-image-card">
        <img
          src="/docs/images/financial_setting.webp"
          alt="Pengaturan Financial"
        >
      </div>


      <h2>📝 Input Financial</h2>

      <p>
        Setelah rule dan activity selesai diatur, kamu bisa mulai
        mencatat transaksi.
      </p>

      <p>
        Alur input Financial tidak jauh berbeda dengan workspace lainnya.
        Kamu memilih <strong>jenis transaksi</strong> terlebih dahulu,
        kemudian mengisi data sesuai dengan transaksi yang dipilih.
      </p>

      <p>
        Pilihan jenis transaksi yang tersedia akan mengikuti rule yang
        sudah kamu aktifkan sebelumnya pada Setting.
      </p>


      <div class="doc-image-card">
        <img
          src="/docs/images/financial_input.webp"
          alt="Input transaksi Financial"
        >
      </div>


      <h3>💰 Masuk</h3>

      <p>
        <strong>Masuk</strong> berarti ada uang yang diterima.
        Karena ada uang yang masuk, transaksi ini akan
        <strong>menambah saldo actual</strong>.
      </p>

      <p>
        Activity yang tersedia akan mengikuti activity pemasukan
        yang sudah kamu pilih pada Setting.
      </p>


      <h3>💸 Keluar</h3>

      <p>
        <strong>Keluar</strong> berarti ada uang yang digunakan atau
        dibelanjakan. Transaksi ini akan
        <strong>mengurangi saldo actual</strong>.
      </p>

      <p>
        Activity pengeluaran yang tersedia juga mengikuti pilihan
        yang sudah ditentukan pada Setting.
      </p>


      <h3>🏦 Nabung</h3>

      <p>
        <strong>Nabung</strong> berarti kamu memindahkan sebagian
        uang dari saldo actual menjadi uang yang disimpan.
      </p>

      <p>
        Karena uang tersebut keluar dari saldo actual yang bisa
        digunakan sehari-hari, transaksi Nabung akan
        <strong>mengurangi saldo actual</strong>.
      </p>

      <p>
        Namun uang tersebut tidak dianggap sebagai pengeluaran biasa.
        Nominalnya akan tercatat sebagai <strong>tabungan</strong>
        dan dapat ditampilkan pada Summary.
      </p>

      <div class="doc-info-box">
        <strong>💡 Kenapa Nabung termasuk pengeluaran?</strong>
        <p>
          Karena dari sisi saldo actual, uang tersebut memang keluar
          dari uang yang tersedia. Tetapi uangnya tidak hilang,
          melainkan berpindah menjadi dana yang disimpan.
        </p>
      </div>


      <h3>↩️ Tarik</h3>

      <p>
        <strong>Tarik</strong> merupakan kebalikan dari Nabung.
        Saat kamu mengambil uang dari tabungan untuk digunakan kembali,
        uang tersebut masuk kembali ke saldo actual.
      </p>

      <p>
        Artinya, transaksi Tarik akan
        <strong>menambah saldo actual</strong> sekaligus
        <strong>mengurangi saldo tabungan</strong>.
      </p>

      <div class="doc-highlight">
        <strong>Nabung</strong> → saldo actual berkurang,
        tabungan bertambah.
        <br><br>
        <strong>Tarik</strong> → saldo actual bertambah,
        tabungan berkurang.
      </div>


      <h3>💳 Hutang</h3>

      <p>
        Jika Rule Hutang diaktifkan, Financial juga bisa digunakan
        untuk mencatat transaksi hutang.
      </p>

      <p>
        <strong>Hutang</strong> berarti kamu menerima sejumlah uang
        dari hasil berhutang. Karena ada uang yang masuk,
        transaksi ini akan <strong>menambah saldo actual</strong>.
      </p>

      <p>
        Namun uang tersebut bukan penghasilan milikmu. Uang tersebut
        menjadi kewajiban yang harus dibayar kembali. Karena itu,
        nominalnya juga akan tercatat sebagai <strong>hutang</strong>
        pada Summary.
      </p>


      <h3>💵 Bayar Hutang</h3>

      <p>
        Saat kamu membayar hutang, uang keluar dari saldo actual.
        Karena itu, pembayaran hutang akan
        <strong>mengurangi saldo actual</strong>.
      </p>

      <p>
        Pada saat yang sama, catatan hutang akan berkurang karena
        sebagian atau seluruh kewajiban tersebut sudah dibayar.
      </p>

      <div class="doc-info-box">
        <strong>💡 Kenapa Hutang termasuk pemasukan?</strong>
        <p>
          Karena ketika hutang diterima, ada uang yang masuk sehingga
          saldo actual bertambah. Tetapi uang tersebut bukan penghasilan,
          melainkan dana yang menambah kewajiban hutang.
        </p>
      </div>


      <h2>📊 Summary dan Statistik</h2>

      <p>
        Data yang kamu masukkan di Financial akan digunakan untuk
        membantu melihat kondisi keuangan secara lebih menyeluruh.
      </p>

      <p>
        Pada <strong>Summary</strong>, selain pemasukan dan pengeluaran,
        kamu juga dapat melihat informasi <strong>tabungan</strong>
        dan <strong>hutang</strong> jika rule tersebut digunakan.
      </p>

      <p>
        Sementara itu, <strong>Statistik</strong> membantu melihat
        pola pemasukan dan pengeluaran berdasarkan periode tertentu.
        Kamu bisa menggunakan filter periode untuk melihat perubahan
        kondisi keuangan dari waktu ke waktu.
      </p>


      <div class="doc-highlight">
        <strong>✨ Financial bukan sekadar buku catatan</strong>
        <p>
          Dengan mencatat transaksi secara rutin, kamu bisa mengetahui
          ke mana uang pergi, berapa saldo actual yang tersedia,
          berapa dana yang sedang disimpan, dan berapa hutang yang
          masih menjadi kewajiban.
        </p>
      </div>

    </div>
  `
};
