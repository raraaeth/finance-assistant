export default {
  title: "Pengenalan",

  content: `

    <h1>Selamat datang di Finance Assistant 👋</h1>

    <p>
      Finance Assistant dibuat untuk membantu kamu mengelola
      berbagai aktivitas keuangan dalam satu tempat.
      Mulai dari tabungan, kas bersama, perhitungan gaji,
      sampai pengingat airdrop.
    </p>

    <p>
      Tujuannya sederhana: supaya kamu bisa lebih mudah
      melihat, mencatat, dan memahami apa yang sedang terjadi
      dengan keuanganmu tanpa harus berpindah-pindah tempat.
    </p>


    <h2>Apa yang bisa kamu lakukan?</h2>

    <p>
      Finance Assistant terdiri dari beberapa module yang
      masing-masing punya tugasnya sendiri.
      Kamu bisa menggunakan module yang memang sesuai
      dengan kebutuhanmu.
    </p>


    <!-- =========================================
         MODULE OVERVIEW
         ========================================= -->

    <div class="module-overview">

      <div class="module-overview-header">

        <span class="module-overview-icon">
          ✨
        </span>

        <div>

          <h3>
            Kenali module di Finance Assistant
          </h3>

          <p>
            Setiap module dibuat untuk membantu kebutuhan
            yang berbeda.
          </p>

        </div>

      </div>


      <div class="module-list">


        <!-- Tabungan -->

        <a
          href="?doc=saving"
          class="module-card"
          data-doc="saving"
        >

          <div class="module-icon">
            💰
          </div>

          <div class="module-info">

            <h3>
              Tabungan
            </h3>

            <p>
              Digunakan untuk membantu mencatat dan memantau
              aktivitas tabungan yang kamu miliki.
            </p>

          </div>

        </a>


        <!-- Kas Bersama -->

        <a
          href="?doc=kas"
          class="module-card"
          data-doc="kas"
        >

          <div class="module-icon">
            🤝
          </div>

          <div class="module-info">

            <h3>
              Kas Bersama
            </h3>

            <p>
              Untuk mengelola keuangan yang digunakan bersama,
              sehingga pemasukan dan pengeluaran bisa lebih
              mudah dipantau.
            </p>

          </div>

        </a>


        <!-- Financial -->

        <a
          href="?doc=financial"
          class="module-card"
          data-doc="financial"
        >

          <div class="module-icon">
            💵
          </div>

          <div class="module-info">

            <h3>
              Financial
            </h3>

            <p>
              Tempat untuk mengelola aktivitas keuangan dan
              melihat bagaimana kondisi keuanganmu dari waktu
              ke waktu.
            </p>

          </div>

        </a>


        <!-- Payroll Monthly -->

        <a
          href="?doc=monthly"
          class="module-card"
          data-doc="monthly"
        >

          <div class="module-icon">
            📅
          </div>

          <div class="module-info">

            <h3>
              Perhitungan Gaji Bulanan
            </h3>

            <p>
              Membantu menghitung gaji bulanan berdasarkan data
              yang digunakan oleh sistem payroll bulanan berdasar data kehadiran.
            </p>

          </div>

        </a>


        <!-- Payroll Daily -->

        <a
          href="?doc=daily"
          class="module-card"
          data-doc="daily"
        >

          <div class="module-icon">
            🕐
          </div>

          <div class="module-info">

            <h3>
              Perhitungan Gaji Harian
            </h3>

            <p>
              Digunakan untuk perhitungan gaji berdasarkan
              pendapatan harian, dan aturan yang berlaku.
            </p>

          </div>

        </a>


        <!-- Airdrop -->

        <a
          href="?doc=airdrop"
          class="module-card"
          data-doc="airdrop"
        >

          <div class="module-icon">
            🔔
          </div>

          <div class="module-info">

            <h3>
              Pengingat Airdrop
            </h3>

            <p>
              Membantu kamu mengingat aktivitas atau deadline
              airdrop yang sedang kamu ikuti.
            </p>

          </div>

        </a>


      </div>


      <!-- Footer Card -->

      <div class="module-overview-footer">

        <span>
          💡
        </span>

        <p>
          Kamu tidak harus menggunakan semua module.
          Gunakan yang memang kamu butuhkan.
        </p>

      </div>

    </div>


    <h2>Semua dimulai dari Workspace</h2>

    <p>
      Finance Assistant menggunakan konsep
      <strong>Workspace</strong> sebagai tempat berbagai
      data dan pengaturan aplikasi kamu berada.
    </p>

    <p>
      Sebelum mulai menggunakan module yang ada,
      kamu akan terlebih dahulu menyiapkan Workspace.
      Setelah itu, kamu bisa mengatur data dan mulai
      menggunakan fitur yang kamu butuhkan.
    </p>


    <h2>Bagaimana cara kerjanya?</h2>

    <p>
      Secara sederhana, alurnya seperti ini:
    </p>


    <pre><code>
Kamu
  ↓
Input / aktivitas
  ↓
Finance Assistant
  ↓
Data Workspace
  ↓
Module memproses data
  ↓
Hasil &amp; ringkasan
    </code></pre>


    <p>
      Kamu tidak perlu memahami proses teknis di baliknya
      untuk menggunakan Finance Assistant. Cukup masukkan
      data yang diperlukan, dan biarkan sistem membantu
      mengolahnya.
    </p>


    <h2>Siap mulai?</h2>

    <p>
      Kalau ini pertama kalinya kamu menggunakan
      Finance Assistant, sebaiknya mulai dari panduan
      berikut.
    </p>

    <p>
      <a
        href="?doc=mulai"
        data-doc="mulai"
      >
        Mulai menggunakan Finance Assistant →
      </a>
    </p>

  `
};
