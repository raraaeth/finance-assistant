/* =====================================================
   Finance Assistant
   Documentation : Payroll Monthly
   File          : monthlydocs.js
===================================================== */

export default {

    title: "Payroll Monthly",

    content: `

        <article class="doc-article">

            <h2>Hitung Gaji Bulananmu</h2>

            <p class="doc-lead">
                Payroll Monthly membantu mencatat kehadiran setiap hari
                sekaligus menghitung perkiraan gaji berdasarkan data
                attendance dan aturan payroll yang sudah kamu atur.
            </p>

            <p>
                Berbeda dengan pencatatan keuangan biasa, setiap data
                kehadiran yang kamu masukkan dapat memengaruhi perhitungan
                gaji. Mulai dari status masuk, keterlambatan, izin,
                ketidakhadiran, hingga lembur.
            </p>

            <p>
                Dengan begitu, kamu tidak perlu menghitung ulang kehadiran
                dan gaji secara manual setiap periode.
            </p>


            <div class="doc-info-box">
                <strong>💡 Cara kerjanya sederhana</strong>
                <p>
                    Catat kondisi kehadiran setiap hari.
                    Payroll Monthly akan menggunakan data tersebut
                    untuk membantu menghitung gaji berdasarkan aturan
                    yang sudah kamu atur.
                </p>
            </div>


            <!-- =================================================
                 HOME
            ================================================== -->

            <h2>🏠 Home</h2>

            <p>
                Home menjadi halaman utama untuk melihat perkembangan
                kehadiran dan informasi payroll.
            </p>

            <p>
                Di sini kamu dapat melihat data attendance untuk
                <strong>bulan ini</strong> dan
                <strong>bulan sebelumnya</strong>.
            </p>

            <p>
                Informasi tersebut membantu kamu melihat kondisi
                kehadiran tanpa harus membuka detail transaksi
                satu per satu.
            </p>


            <div class="doc-image-card">
                <img
                    src="/docs/images/monthly_view.webp"
                    alt="Tampilan Home Payroll Monthly"
                    loading="lazy"
                >
            </div>


            <!-- =================================================
                 STATISTIK
            ================================================== -->

            <h2>📊 Statistik</h2>

            <p>
                Statistik digunakan untuk melihat data attendance
                dengan lebih terperinci berdasarkan periode yang
                kamu pilih.
            </p>

            <p>
                Pada bagian ini terdapat beberapa informasi yang
                membantu kamu memahami kondisi kehadiran.
            </p>

            <h3>🔎 Filter</h3>

            <p>
                Gunakan filter untuk menentukan periode data yang
                ingin dilihat.
            </p>

            <p>
                Dengan memilih periode tertentu, kamu dapat melihat
                grafik dan detail attendance berdasarkan rentang
                waktu tersebut.
            </p>


            <h3>📈 Grafik</h3>

            <p>
                Grafik memberikan gambaran visual mengenai data
                attendance pada periode yang dipilih.
            </p>

            <p>
                Bagian ini memudahkan kamu melihat perkembangan
                kehadiran tanpa harus membaca seluruh transaksi
                satu per satu.
            </p>


            <h3>📋 Detail Attendance</h3>

            <p>
                Jika membutuhkan informasi yang lebih rinci,
                Detail Attendance menampilkan catatan kehadiran
                yang sudah dimasukkan.
            </p>


            <h3>📊 Ringkasan Attendance</h3>

            <p>
                Payroll Monthly juga menyediakan Ringkasan Attendance
                untuk melihat gambaran umum kondisi kehadiran dalam
                periode yang dipilih.
            </p>

            <p>
                Dari sini kamu dapat melihat jumlah atau total
                kondisi seperti masuk, telat, lembur, dan kondisi
                attendance lainnya.
            </p>


            <h3>💡 Insight Attendance</h3>

            <p>
                Insight Attendance memberikan gambaran tambahan
                berdasarkan data kehadiran yang sudah tercatat.
            </p>

            <p>
                Jadi, Statistik bukan hanya digunakan untuk melihat
                angka, tetapi juga membantu memahami kondisi
                attendance selama periode tertentu.
            </p>


            <!-- =================================================
                 SUMMARY
            ================================================== -->

            <h2>💰 Ringkasan</h2>

            <p>
                Pada workspace lain, Summary biasanya digunakan
                untuk merangkum data transaksi.
            </p>

            <p>
                Namun pada Payroll Monthly, bagian Ringkasan memiliki
                fungsi yang berbeda. Bagian ini digunakan untuk
                menampilkan <strong>perhitungan gaji</strong>.
            </p>


            <h3>💵 Gaji Periode Sebelumnya</h3>

            <p>
                Bagian paling atas menampilkan detail gaji dari
                periode sebelumnya yang sudah selesai.
            </p>

            <p>
                Kamu dapat melihat periode gaji beserta hasil
                perhitungannya.
            </p>

            <p>
                Tersedia juga tombol <strong>Export PNG</strong>
                untuk menyimpan hasil gaji periode sebelumnya
                dalam bentuk gambar.
            </p>

            <div class="doc-info-box">
                <strong>💡 Cocok untuk dokumentasi</strong>
                <p>
                    Hasil gaji periode sebelumnya dapat diekspor
                    sebagai PNG sehingga lebih mudah disimpan
                    atau digunakan sebagai dokumentasi.
                </p>
            </div>


            <h3>📅 Perhitungan Gaji Bulan Ini</h3>

            <p>
                Di bawah gaji periode sebelumnya terdapat
                perhitungan gaji untuk periode bulan ini yang
                sedang berjalan.
            </p>

            <p>
                Perhitungan tersebut mengikuti data attendance
                yang sudah dimasukkan selama periode berjalan
                dan aturan payroll yang digunakan.
            </p>

            <p>
                Artinya, ketika data attendance bertambah atau
                terdapat kondisi tertentu seperti telat maupun
                lembur, hasil perhitungan gaji dapat ikut berubah.
            </p>


            <div class="doc-highlight">
                <strong>💡 Gaji dihitung dari data kehadiran</strong>
                <p>
                    Payroll Monthly menghubungkan data attendance
                    dengan perhitungan gaji. Karena itu, pencatatan
                    kehadiran setiap hari menjadi bagian penting
                    untuk mendapatkan hasil perhitungan yang sesuai.
                </p>
            </div>


            <!-- =================================================
                 SETTING
            ================================================== -->

            <h2>⚙️ Setting</h2>

            <p>
                Sebelum menggunakan Payroll Monthly, aturan payroll
                perlu disiapkan terlebih dahulu.
            </p>

            <p>
                Setting digunakan untuk menentukan bagaimana sistem
                menghitung gaji berdasarkan aturan yang berlaku.
            </p>


            <div class="doc-image-card">
                <img
                    src="/docs/images/monthly_setting.webp"
                    alt="Pengaturan Payroll Monthly"
                    loading="lazy"
                >
            </div>


            <h3>📅 Periode Gaji</h3>

            <p>
                Periode gaji merupakan bagian paling penting dalam
                pengaturan Payroll Monthly.
            </p>

            <p>
                Di sini kamu menentukan masa berlaku dan masa aktif
                periode perhitungan gaji.
            </p>

            <p>
                Pengaturan ini menjadi dasar kapan sebuah periode
                gaji dimulai, kapan berakhir, dan periode mana yang
                sedang digunakan untuk perhitungan.
            </p>


            <h3>💰 Rule Gaji</h3>

            <p>
                Rule Gaji digunakan untuk menentukan gaji pokok
                yang menjadi dasar perhitungan payroll.
            </p>


            <h3>➕ Rule Tambah</h3>

            <p>
                Rule Tambah digunakan untuk mengatur komponen yang
                menambah hasil perhitungan gaji.
            </p>

            <p>
                Misalnya tunjangan, uang makan, transport,
                lembur, atau komponen tambahan lainnya sesuai
                kebutuhan payroll.
            </p>


            <h3>➖ Rule Potong</h3>

            <p>
                Rule Potong digunakan untuk mengatur komponen
                yang mengurangi hasil perhitungan gaji.
            </p>

            <p>
                Aturan ini dapat digunakan untuk berbagai jenis
                pemotongan sesuai dengan kebijakan payroll yang
                digunakan.
            </p>


            <h3>⚙️ Rule Attendance</h3>

            <p>
                Rule Attendance digunakan untuk mengaktifkan
                aturan attendance yang digunakan dalam Payroll Monthly.
            </p>

            <p>
                Aktifkan hanya jika perusahaan menggunakan aturan
                tersebut.
            </p>

            <p>
                Ketika sebuah aturan attendance diaktifkan,
                kondisi tersebut akan tersedia pada bagian
                input attendance.
            </p>

            <div class="doc-info-box">
                <strong>💡 Setting menentukan pilihan Input</strong>
                <p>
                    Kondisi attendance yang muncul saat input
                    mengikuti rule yang sudah diaktifkan pada
                    Setting. Jadi, cukup aktifkan aturan yang
                    memang digunakan dalam sistem payroll.
                </p>
            </div>


            <!-- =================================================
                 INPUT
            ================================================== -->

            <h2>📝 Input Attendance</h2>

            <p>
                Input digunakan untuk mencatat kondisi kehadiran
                setiap hari.
            </p>

            <p>
                Alurnya tetap sederhana dan bertahap seperti
                input pada workspace lainnya.
            </p>

            <p>
                Pilih status terlebih dahulu, kemudian pilih shift
                jika diperlukan, lalu tambahkan kondisi yang terjadi
                pada hari tersebut.
            </p>


            <div class="doc-image-card">
                <img
                    src="/docs/images/monthly_input.webp"
                    alt="Input Attendance Payroll Monthly"
                    loading="lazy"
                >
            </div>


            <h3>📌 Status Kehadiran</h3>

            <p>
                Status menunjukkan kondisi utama pada hari tersebut.
            </p>


            <h3>🟢 Masuk</h3>

            <p>
                Status <strong>Masuk</strong> digunakan untuk
                mencatat hari ketika karyawan bekerja.
            </p>


            <h3>🌴 Cuti</h3>

            <p>
                Status <strong>Cuti</strong> digunakan ketika
                karyawan sedang mengambil cuti.
            </p>

            <p>
                Cuti tetap dihitung sebagai kondisi masuk dalam
                perhitungan attendance karena pada umumnya cuti
                merupakan ketidakhadiran yang telah mendapatkan izin.
            </p>


            <h3>🤒 Sakit</h3>

            <p>
                Status <strong>Sakit</strong> digunakan ketika
                karyawan tidak masuk karena sakit.
            </p>

            <p>
                Sama seperti cuti, sakit tetap dihitung sebagai
                kondisi masuk sesuai aturan payroll karena
                ketidakhadiran tersebut memiliki alasan yang
                diperbolehkan.
            </p>


            <h3>❌ Absen</h3>

            <p>
                Status <strong>Absen</strong> menunjukkan bahwa
                karyawan tidak masuk kerja tanpa kondisi yang
                dihitung sebagai kehadiran.
            </p>

            <p>
                Status ini menjadi kondisi pemotongan karena
                hari kerja tersebut tidak dijalani.
            </p>

            <p>
                Nantinya kondisi tersebut dapat memengaruhi
                perhitungan gaji sesuai Rule Potong yang digunakan.
            </p>


            <h3>🎉 Libur</h3>

            <p>
                Status <strong>Libur</strong> digunakan untuk
                mencatat hari libur, termasuk hari libur nasional.
            </p>

            <p>
                Jika libur berada pada hari kerja, pada umumnya
                hari tersebut tetap dianggap sebagai hari yang
                dihitung masuk sesuai aturan payroll.
            </p>


            <h3>⏱️ Lembur</h3>

            <p>
                Status <strong>Lembur</strong> digunakan untuk
                mencatat kondisi lembur harian.
            </p>

            <p>
                Status ini menjadi kondisi penambahan dalam
                perhitungan gaji.
            </p>


            <!-- =================================================
                 TAMBAHKAN KONDISI
            ================================================== -->

            <h2>➕ Tambahkan Kondisi</h2>

            <p>
                Selain status utama, Payroll Monthly dapat mencatat
                kondisi tambahan yang terjadi pada hari tersebut.
            </p>

            <p>
                Kondisi yang tersedia mengikuti Rule Attendance
                yang sudah diaktifkan pada Setting.
            </p>

            <p>
                Jika sebuah kondisi dicentang, kamu perlu mengisi
                nilai yang diperlukan sebelum transaksi dapat
                ditambahkan sebagai data attendance yang utuh.
            </p>


            <h3>⏰ Telat</h3>

            <p>
                Jika kondisi Telat diaktifkan dan terjadi
                keterlambatan, masukkan jumlah menit keterlambatan.
            </p>


            <h3>🕐 Izin Telat</h3>

            <p>
                Izin Telat digunakan ketika keterlambatan terjadi
                dengan izin.
            </p>


            <h3>🚪 Izin Pulang</h3>

            <p>
                Izin Pulang digunakan ketika karyawan perlu
                meninggalkan pekerjaan lebih awal sesuai kondisi
                yang berlaku.
            </p>


            <h3>⏱️ Lembur Per Jam</h3>

            <p>
                Lembur pada bagian Tambahkan Kondisi memiliki
                fungsi yang berbeda dengan Lembur pada Status.
            </p>

            <p>
                Lembur di sini digunakan untuk menghitung
                <strong>tambahan waktu kerja setelah waktu kerja normal</strong>.
            </p>

            <p>
                Contohnya, jika waktu kerja normal selesai pukul
                17.00 dan pekerjaan dilanjutkan sampai pukul 19.00,
                maka tambahan lemburnya adalah 2 jam.
            </p>


            <div class="doc-info-box">
                <strong>💡 Jangan tertukar</strong>
                <p>
                    <strong>Lembur pada Status</strong> =
                    kondisi lembur harian.
                    <br><br>
                    <strong>Lembur pada Tambahkan Kondisi</strong> =
                    tambahan jam kerja setelah waktu kerja normal.
                </p>
            </div>


            <!-- =================================================
                 ALUR
            ================================================== -->

            <h2>🎯 Dari Attendance Menjadi Gaji</h2>

            <p>
                Payroll Monthly dibuat dengan alur yang saling
                terhubung:
            </p>

            <div class="doc-step">
                <strong>1. ⚙️ Setting</strong>
                <p>
                    Tentukan periode, gaji pokok, rule tambah,
                    rule potong, dan aturan attendance yang
                    digunakan.
                </p>
            </div>

            <div class="doc-step">
                <strong>2. 📝 Input Attendance</strong>
                <p>
                    Catat status dan kondisi kehadiran yang
                    terjadi setiap hari.
                </p>
            </div>

            <div class="doc-step">
                <strong>3. 💰 Perhitungan Gaji</strong>
                <p>
                    Data attendance digunakan dalam perhitungan
                    gaji pada Ringkasan Payroll Monthly.
                </p>
            </div>


            <div class="doc-highlight">
                <strong>✨ Catat kehadiran dengan benar,
                biarkan Payroll Monthly menghitung sisanya.</strong>

                <p>
                    Semakin konsisten data attendance dicatat,
                    semakin mudah melihat perkembangan kehadiran
                    dan hasil perhitungan gaji pada periode berjalan.
                </p>
            </div>

        </article>

    `
};
