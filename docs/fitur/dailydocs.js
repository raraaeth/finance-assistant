export default {
    title: "Payroll Daily",
    content: `

    <div class="doc-article">

        <p class="doc-lead">
            Payroll Daily membantu menghitung penghasilan berdasarkan
            jumlah pekerjaan yang kamu selesaikan setiap hari.
            Berbeda dengan Payroll Monthly yang menggunakan attendance,
            Payroll Daily menggunakan data pekerjaan sebagai dasar
            perhitungan gaji.
        </p>


        <div class="doc-image-card">
            <img
                src="/docs/images/daily_view.webp"
                alt="Tampilan Payroll Daily"
            >
        </div>


        <h2>🏠 Home</h2>

        <p>
            Home menampilkan gambaran penghasilan Payroll Daily
            berdasarkan pekerjaan yang sudah kamu catat.
        </p>

        <p>
            Di sini kamu bisa melihat hasil pekerjaan dan penghasilan
            yang sedang berjalan, sehingga kamu dapat mengetahui
            perkembangan penghasilan tanpa harus menghitungnya sendiri.
        </p>


        <h2>📊 Statistik</h2>

        <p>
            Statistik digunakan untuk melihat perkembangan penghasilan
            berdasarkan periode yang kamu pilih.
        </p>

        <p>
            Di dalamnya terdapat <strong>Ringkasan</strong>,
            <strong>Filter</strong>, <strong>Grafik</strong>, dan
            <strong>Rincian Transaksi</strong>.
        </p>

        <p>
            Ringkasan menampilkan perhitungan penghasilan,
            sedangkan Filter digunakan untuk menentukan periode data
            yang ingin dilihat. Grafik membantu melihat perkembangan
            penghasilan secara visual, dan Rincian Transaksi
            menampilkan pekerjaan yang membentuk penghasilan tersebut.
        </p>

        <div class="doc-info-box">
            <strong>💡 Insight</strong>
            <p>
                Karena Payroll Daily dihitung berdasarkan pekerjaan,
                Statistik tidak hanya menunjukkan berapa penghasilanmu,
                tetapi juga membantu melihat hasil pekerjaan yang
                menghasilkan penghasilan tersebut.
            </p>
        </div>


        <h2>📋 Ringkasan</h2>

        <p>
            Ringkasan pada Payroll Daily berfokus pada
            <strong>perhitungan penghasilan</strong>.
        </p>

        <p>
            Bagian paling atas menampilkan <strong>Gaji Periode Sebelumnya</strong>.
            Dari bagian ini kamu dapat melihat hasil gaji dari periode
            yang telah selesai dan mengekspornya dalam bentuk PNG.
        </p>

        <p>
            Di bawahnya terdapat <strong>Estimasi Gaji Bulan Ini</strong>,
            yaitu perhitungan penghasilan dari periode yang sedang berjalan.
            Nilainya akan terus mengikuti pekerjaan yang kamu input.
        </p>

        <div class="doc-highlight">
            <strong>📌 Jadi, penghasilanmu terus mengikuti pekerjaan.</strong>
            <p>
                Semakin banyak pekerjaan yang dicatat,
                semakin besar pula penghasilan yang dihitung
                selama periode tersebut.
            </p>
        </div>


        <h2>⚙️ Pengaturan Payroll Daily</h2>

        <div class="doc-image-card">
            <img
                src="/docs/images/daily_setting.webp"
                alt="Pengaturan Payroll Daily"
            >
        </div>

        <p>
            Sebelum mulai mencatat pekerjaan, Payroll Daily perlu
            dikonfigurasi terlebih dahulu. Pengaturan inilah yang
            menjadi dasar bagaimana penghasilan akan dihitung.
        </p>


        <h3>📅 Periode Gaji</h3>

        <p>
            Periode Gaji menentukan <strong>kapan satu periode
            perhitungan dimulai dan berakhir</strong>, sekaligus
            menentukan masa aktif Payroll Daily.
        </p>

        <p>
            Bagian ini merupakan konfigurasi penting karena seluruh
            perhitungan penghasilan akan mengikuti periode yang telah
            ditentukan.
        </p>


        <h3>🧰 Rule Work</h3>

        <p>
            Rule Work digunakan untuk menentukan
            <strong>nama pekerjaan dan nominal penghasilannya</strong>.
        </p>

        <p>
            Nama pekerjaan merupakan bagian yang wajib diisi.
            Jika pekerjaan memiliki variasi, kamu dapat menambahkan
            <strong>Grade 1</strong> dan <strong>Grade 2</strong>.
        </p>

        <p>
            Grade 1 bersifat opsional. Grade 2 juga bersifat opsional
            dan digunakan jika Grade 1 masih membutuhkan variasi lanjutan.
        </p>

        <div class="doc-info-box">
            <strong>💡 Contoh Rule Work</strong>
            <p>
                Nama: <strong>PM</strong><br>
                Grade 1: <strong>RED</strong><br>
                Grade 2: <strong>XL</strong>
            </p>
            <p>
                Dengan konfigurasi tersebut, pilihan pekerjaan pada
                saat input akan mengikuti struktur yang sudah dibuat.
            </p>
        </div>


        <h3>➕ Rule Tambah</h3>

        <p>
            Rule Tambah digunakan untuk mengatur
            <strong>tambahan penghasilan</strong> yang dapat diberikan
            pada hari atau kondisi tertentu.
        </p>

        <p>
            Aturan yang dibuat di sini nantinya dapat digunakan
            sebagai bagian dari perhitungan penghasilan Payroll Daily.
        </p>


        <h3>➖ Rule Potong</h3>

        <p>
            Rule Potong digunakan untuk mengatur
            <strong>potongan penghasilan</strong> yang mengikuti
            periode gaji.
        </p>

        <p>
            Dengan adanya Rule Potong, pengurangan penghasilan
            dapat mengikuti aturan yang sudah dikonfigurasi sebelumnya.
        </p>


        <h3>⏱️ Lembur</h3>

        <p>
            Payroll Daily memiliki dua bentuk lembur yang perlu
            dibedakan.
        </p>

        <p>
            <strong>Lembur pada status</strong> merupakan kondisi
            lembur yang dicatat sebagai bagian dari status pekerjaan
            pada hari tersebut.
        </p>

        <p>
            Sedangkan <strong>Lembur pada kondisi tambahan</strong>
            digunakan untuk menghitung lembur berdasarkan jumlah jam
            setelah waktu kerja normal.
        </p>

        <div class="doc-info-box">
            <strong>💡 Bedanya sederhana</strong>
            <p>
                Lembur pada <strong>status</strong> = kondisi lembur harian.
                <br>
                Lembur pada <strong>kondisi tambahan</strong> =
                perhitungan lembur berdasarkan jam setelah waktu kerja normal.
            </p>
        </div>


        <h2>✍️ Input Payroll Daily</h2>

        <div class="doc-image-card">
            <img
                src="/docs/images/daily_input.webp"
                alt="Input Payroll Daily"
            >
        </div>

        <p>
            Setelah pengaturan selesai, kamu bisa mulai mencatat
            pekerjaan yang dilakukan setiap hari.
        </p>


        <h3>🟢 Status Masuk</h3>

        <p>
            Pada Payroll Daily, status secara otomatis menggunakan
            <strong>Masuk</strong>.
        </p>

        <p>
            Hal ini karena Payroll Daily berfokus pada pekerjaan
            yang dilakukan sebagai dasar perhitungan penghasilan.
        </p>


        <h3>🧰 Pilih pekerjaan</h3>

        <p>
            Pilihan pekerjaan yang tersedia pada Input mengikuti
            <strong>Rule Work</strong> yang sudah dibuat di Pengaturan.
        </p>

        <p>
            Jika sebuah pekerjaan memiliki Grade 1 atau Grade 2,
            pilihan tersebut juga akan muncul sesuai konfigurasi
            yang telah dibuat.
        </p>


        <h3>🔢 Masukkan Qty</h3>

        <p>
            Setelah memilih pekerjaan, masukkan jumlah pekerjaan
            yang sudah kamu selesaikan pada hari tersebut.
        </p>

        <p>
            Jumlah ini disebut <strong>Qty</strong>.
            Sistem kemudian akan menggunakan Qty tersebut untuk
            menghitung penghasilan berdasarkan nominal per PCS
            yang sudah ditentukan pada Rule Work.
        </p>

        <div class="doc-highlight">
            <strong>🧮 Cara menghitungnya</strong>
            <p>
                <strong>Qty × Nominal per PCS = Penghasilan</strong>
            </p>
        </div>

        <p>
            Contohnya, jika pekerjaan memiliki nominal
            <strong>Rp 405 per PCS</strong> dan kamu menyelesaikan
            <strong>300 PCS</strong>, maka penghasilan dari pekerjaan
            tersebut adalah:
        </p>

        <div class="doc-step">
            <strong>300 PCS × Rp 405 = Rp 121.500</strong>
        </div>


        <h3>➕ Bisa mencatat beberapa pekerjaan</h3>

        <p>
            Jika dalam satu hari kamu mengerjakan beberapa jenis
            pekerjaan, kamu dapat menambahkan semuanya dalam input.
        </p>

        <p>
            Setiap pekerjaan akan dihitung menggunakan nominal
            masing-masing sesuai Rule Work, kemudian seluruhnya
            akan menjadi bagian dari perhitungan penghasilanmu.
        </p>


        <div class="doc-next-card">
            <strong>🎯 Catat pekerjaannya, biarkan sistem menghitung.</strong>
            <p>
                Payroll Daily dibuat untuk mempermudah pencatatan
                pekerjaan sekaligus menghitung penghasilan berdasarkan
                hasil kerja yang kamu lakukan setiap hari.
            </p>
        </div>

    </div>

    `
};
