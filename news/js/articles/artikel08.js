/* =====================================================
   FINANCE ASSISTANT
   NEWS & UPDATE

   Article 08
   File    : /news/js/articles/artikel08.js
===================================================== */

const artikel08 = {

    slug: "payroll-monthly-menghitung-gaji-dari-data-kehadiran",

    title: "Payroll Monthly: Cara Saya Menghitung Gaji dari Data Kehadiran",

    date: "2026-09-22",

    image: "/news/images/artikel08.webp",

    seo: {

        title: "Payroll Monthly: Cara Saya Menghitung Gaji dari Data Kehadiran | Finance Assistant",

        description:
            "Cerita tentang Payroll Monthly di Finance Assistant untuk membantu menghitung gaji dari data kehadiran, termasuk kondisi dirumahkan dengan potongan yang dapat diatur.",

        keywords:
            "Payroll Monthly, cara menghitung gaji bulanan, menghitung gaji dari attendance, perhitungan gaji bulanan, data kehadiran, absensi karyawan, dirumahkan, potongan gaji, aplikasi payroll, Finance Assistant"

    },

    content: `

        <p>
            Sebelumnya saya pernah bercerita tentang bagaimana saya
            membuat <a href="/news/apa-itu-payroll-daily">Payroll Daily</a>
            untuk membantu istri saya menghitung penghasilannya.
        </p>

        <p>
            Istri saya bekerja sebagai karyawan borongan.
        </p>

        <p>
            Jadi penghasilannya tidak dihitung hanya berdasarkan gaji
            tetap setiap bulan, tetapi juga berdasarkan jumlah pekerjaan
            yang diselesaikan.
        </p>

        <p>
            Karena itu, Payroll Daily dibuat untuk mencatat pekerjaan
            yang dilakukan setiap hari dan menghitung penghasilannya.
        </p>

        <p>
            Tapi ternyata, cara menghitung gaji saya sendiri berbeda.
        </p>

        <p>
            Kalau istri saya menggunakan Payroll Daily,
            <strong>saya justru membutuhkan Payroll Monthly.</strong>
        </p>


        <h2>Cara menghitung gaji saya berbeda</h2>

        <p>
            Gaji saya memiliki <strong>gaji pokok yang sudah pasti</strong>.
        </p>

        <p>
            Jadi saya tidak perlu menghitung berapa banyak pekerjaan
            yang saya selesaikan setiap hari untuk mengetahui nilai
            dasar gaji.
        </p>

        <p>
            Yang menjadi bagian penting justru adalah
            <strong>attendance atau kehadiran</strong>.
        </p>

        <p>
            Ada hari masuk.
        </p>

        <p>
            Ada keterlambatan.
        </p>

        <p>
            Ada izin.
        </p>

        <p>
            Ada cuti.
        </p>

        <p>
            Ada sakit.
        </p>

        <p>
            Ada absen.
        </p>

        <p>
            Dan ada juga kondisi lain yang perlu dicatat dalam
            kehadiran.
        </p>

        <p>
            Karena itu, saya membutuhkan sistem yang bisa mengumpulkan
            data tersebut dalam satu periode dan kemudian menggunakannya
            untuk membantu menghitung gaji bulanan.
        </p>

        <p>
            Dari situlah Payroll Monthly di Finance Assistant dibuat.
        </p>


        <h2>Kalau Daily menghitung pekerjaan, Monthly menghitung kehadiran</h2>

        <p>
            Kalau dibandingkan, perbedaan antara Payroll Daily dan
            Payroll Monthly sebenarnya cukup mudah dipahami.
        </p>

        <p>
            Payroll Daily berangkat dari pertanyaan:
        </p>

        <p>
            <strong>
                “Hari ini saya mengerjakan berapa pekerjaan?”
            </strong>
        </p>

        <p>
            Sedangkan Payroll Monthly lebih berangkat dari:
        </p>

        <p>
            <strong>
                “Bagaimana kehadiran saya selama satu periode gaji?”
            </strong>
        </p>

        <p>
            Karena sumber perhitungannya berbeda, cara pencatatannya
            juga berbeda.
        </p>

        <p>
            Untuk Payroll Daily, pekerjaan menjadi data utama.
        </p>

        <p>
            Untuk Payroll Monthly, <strong>attendance</strong> menjadi
            bagian penting dalam perhitungan.
        </p>


        <h2>Tidak perlu menghitung ulang dari awal setiap kali</h2>

        <p>
            Salah satu alasan saya membuat Payroll Monthly adalah
            supaya pencatatan kehadiran tidak berhenti sebagai daftar
            absensi saja.
        </p>

        <p>
            Data kehadiran tersebut kemudian bisa digunakan untuk
            melihat kondisi selama periode berjalan.
        </p>

        <p>
            Saya bisa melihat bagaimana kehadiran saya dalam satu periode.
        </p>

        <p>
            Berapa kali masuk.
        </p>

        <p>
            Apakah ada keterlambatan.
        </p>

        <p>
            Apakah ada izin.
        </p>

        <p>
            Apakah ada cuti atau sakit.
        </p>

        <p>
            Dan berbagai kondisi kehadiran lainnya.
        </p>

        <p>
            Dengan begitu, ketika ingin melihat kembali perhitungan gaji,
            datanya sudah tersedia dari pencatatan yang dilakukan
            sebelumnya.
        </p>


        <h2>Ada satu kondisi khusus: dirumahkan</h2>

        <p>
            Ada satu status yang kemudian saya tambahkan secara khusus
            ke Payroll Monthly.
        </p>

        <p>
            Status tersebut adalah <strong>dirumahkan</strong>.
        </p>

        <p>
            Alasan saya menambahkan status ini sebenarnya cukup personal.
        </p>

        <p>
            Kondisi perusahaan tempat saya bekerja sedang cukup labil.
            Dalam kondisi seperti ini, ada kemungkinan karyawan tetap
            diliburkan atau dirumahkan oleh perusahaan.
        </p>

        <p>
            Dalam kondisi yang saya alami, karyawan tetap yang dirumahkan
            masih mendapatkan gaji, tetapi proporsi gajinya berbeda
            dibandingkan ketika bekerja seperti biasa.
        </p>

        <p>
            Karena itu, status dirumahkan tidak bisa saya perlakukan
            sama seperti absen biasa.
        </p>

        <p>
            Saya membutuhkan cara supaya kondisi tersebut tetap tercatat
            dalam attendance, tetapi perhitungannya bisa memberikan
            pengaruh terhadap gaji.
        </p>


        <h2>Dirumahkan dihitung melalui Rule Potong</h2>

        <p>
            Untuk mengatasinya, saya memasukkan perhitungan dirumahkan
            ke dalam <strong>Rule Potong</strong>.
        </p>

        <p>
            Jadi saya bisa menentukan terlebih dahulu nilai potongan
            untuk status dirumahkan melalui rule yang sudah dibuat.
        </p>

        <p>
            Ketika dalam satu periode terdapat status
            <strong>dirumahkan</strong>, sistem kemudian menghitung
            jumlah status tersebut dan mengalikannya dengan nilai
            potongan yang sudah saya tentukan.
        </p>

        <p>
            Misalnya saya memiliki nilai potongan tertentu untuk satu
            hari dirumahkan.
        </p>

        <p>
            Kalau dalam satu periode terdapat beberapa hari dirumahkan,
            jumlah tersebut akan menjadi dasar perhitungan potongan.
        </p>

        <p>
            Dengan cara seperti ini, saya tidak perlu menghitungnya
            secara manual setiap kali kondisi tersebut terjadi.
        </p>

        <p>
            Cukup mencatat status kehadirannya sebagai
            <strong>dirumahkan</strong>, kemudian sistem menggunakan
            rule potongan yang sudah saya atur.
        </p>


        <h2>Kenapa tidak dibuat sebagai absen biasa?</h2>

        <p>
            Karena bagi saya, dirumahkan memiliki kondisi yang berbeda.
        </p>

        <p>
            Ketika seseorang tidak masuk karena absen tanpa keterangan,
            tentu konteksnya berbeda dengan ketika perusahaan memang
            meminta karyawan untuk tidak bekerja.
        </p>

        <p>
            Dalam kasus saya, karyawan tetap masih mendapatkan bagian
            gaji, hanya saja proporsinya berbeda.
        </p>

        <p>
            Karena itu saya ingin status tersebut terlihat jelas di
            dalam data attendance.
        </p>

        <p>
            Dengan adanya status khusus, saya juga bisa melihat kembali
            berapa kali kondisi dirumahkan terjadi selama satu periode.
        </p>

        <p>
            Jadi data attendance tidak hanya berisi informasi hadir atau
            tidak hadir, tetapi juga menggambarkan kondisi yang memang
            terjadi selama periode kerja.
        </p>


        <h2>Attendance menjadi bagian penting dalam gaji bulanan</h2>

        <p>
            Untuk gaji bulanan dengan gaji pokok yang sudah ditentukan,
            kehadiran bisa menjadi bagian penting dari perhitungan.
        </p>

        <p>
            Karena itu, Payroll Monthly tidak hanya menyimpan status
            hadir atau tidak hadir.
        </p>

        <p>
            Data attendance bisa menjadi dasar untuk melihat berbagai
            kondisi selama periode payroll.
        </p>

        <p>
            Misalnya ketika terjadi keterlambatan, izin, cuti, sakit,
            absen, ataupun dirumahkan.
        </p>

        <p>
            Bahkan waktu kerja tambahan juga dapat dicatat sebagai bagian
            dari data kehadiran.
        </p>

        <p>
            Dengan begitu, data yang awalnya hanya terlihat seperti
            catatan absensi bisa menjadi bagian dari proses perhitungan
            payroll.
        </p>


        <h2>Dari catatan kehadiran menjadi ringkasan</h2>

        <p>
            Saya juga ingin Payroll Monthly tidak hanya menampilkan
            data mentah.
        </p>

        <p>
            Setelah data attendance dicatat, saya ingin bisa melihat
            <strong>ringkasannya</strong>.
        </p>

        <p>
            Bukan hanya melihat satu per satu tanggal dan status
            kehadiran, tetapi juga mendapatkan gambaran selama satu
            periode.
        </p>

        <p>
            Berapa hari masuk.
        </p>

        <p>
            Berapa kali terlambat.
        </p>

        <p>
            Berapa lama keterlambatannya.
        </p>

        <p>
            Berapa kali izin.
        </p>

        <p>
            Berapa kali cuti atau sakit.
        </p>

        <p>
            Berapa kali dirumahkan.
        </p>

        <p>
            Dan kondisi lainnya.
        </p>

        <p>
            Dengan ringkasan seperti ini, saya tidak perlu menghitung
            semuanya secara manual dari daftar attendance.
        </p>

        <p>
            Data yang sudah dicatat bisa langsung digunakan untuk melihat
            kondisi periode tersebut.
        </p>


        <h2>Payroll Monthly juga berawal dari kebutuhan pribadi</h2>

        <p>
            Kalau dipikir-pikir, sebenarnya pola pembuatannya sama
            dengan fitur-fitur Finance Assistant lainnya.
        </p>

        <p>
            Saya tidak membuat Payroll Monthly karena ingin membuat
            aplikasi payroll untuk perusahaan besar.
        </p>

        <p>
            Saya membuatnya karena <strong>saya sendiri membutuhkan
            alat untuk membantu menghitung gaji saya</strong>.
        </p>

        <p>
            Sebelumnya saya sudah membuat Payroll Daily untuk kebutuhan
            istri.
        </p>

        <p>
            Kemudian saya melihat bahwa kebutuhan saya sendiri berbeda.
        </p>

        <p>
            Daripada menggunakan cara yang berbeda-beda untuk menghitung
            dan mencatatnya, akhirnya saya membuat Payroll Monthly
            sebagai bagian dari Finance Assistant.
        </p>

        <p>
            Jadi sekarang ada dua jenis payroll dengan kebutuhan yang
            berbeda.
        </p>

        <p>
            Istri saya dengan Payroll Daily.
        </p>

        <p>
            Saya dengan Payroll Monthly.
        </p>


        <h2>Daily untuk istri, Monthly untuk saya</h2>

        <p>
            Kalau kembali ke cerita awal, mungkin ini bagian yang
            paling menarik.
        </p>

        <p>
            Saya membuat dua fitur payroll bukan karena ingin membuat
            dua fitur yang berbeda tanpa alasan.
        </p>

        <p>
            Keduanya muncul karena <strong>kebutuhan kami memang
            berbeda</strong>.
        </p>

        <p>
            Istri saya membutuhkan pencatatan berdasarkan pekerjaan
            yang diselesaikan.
        </p>

        <p>
            Saya membutuhkan pencatatan berdasarkan kehadiran dengan
            gaji pokok yang sudah pasti.
        </p>

        <p>
            Akhirnya:
        </p>

        <p>
            <strong>
                Payroll Daily untuk menghitung penghasilan berdasarkan
                pekerjaan.
            </strong>
        </p>

        <p>
            <strong>
                Payroll Monthly untuk membantu menghitung gaji
                berdasarkan attendance.
            </strong>
        </p>

        <p>
            Dari dua kebutuhan tersebut, Finance Assistant akhirnya
            memiliki dua pendekatan payroll yang berbeda.
        </p>


        <h2>Payroll bukan hanya untuk perusahaan</h2>

        <p>
            Bagi saya, payroll tidak selalu harus berarti sistem yang
            digunakan perusahaan untuk banyak karyawan.
        </p>

        <p>
            Dalam kasus saya, justru dimulai dari kebutuhan pribadi.
        </p>

        <p>
            Saya ingin mengetahui perhitungan penghasilan saya sendiri.
        </p>

        <p>
            Saya juga ingin membantu istri menghitung penghasilannya
            sendiri.
        </p>

        <p>
            Karena itu, Payroll di Finance Assistant dibuat sebagai
            alat pribadi untuk membantu pencatatan dan perhitungan
            tersebut.
        </p>

        <p>
            Dan mungkin justru karena dibuat dari kebutuhan nyata,
            fitur yang muncul menjadi lebih sesuai dengan masalah yang
            memang saya hadapi.
        </p>


        <h2>Dari Payroll Daily ke Payroll Monthly</h2>

        <p>
            Kalau Payroll Daily adalah cerita tentang bagaimana saya
            membantu istri supaya tidak perlu lagi menghitung pekerjaan
            setiap hari secara manual, maka Payroll Monthly adalah
            cerita tentang kebutuhan saya sendiri untuk mengelola
            perhitungan gaji berdasarkan attendance.
        </p>

        <p>
            Dua cara kerja yang berbeda.
        </p>

        <p>
            Dua kebutuhan yang berbeda.
        </p>

        <p>
            Tetapi keduanya memiliki tujuan yang sama:
        </p>

        <p>
            <strong>
                membuat perhitungan penghasilan menjadi lebih mudah
                dicatat, dilihat, dan ditinjau kembali.
            </strong>
        </p>

        <p>
            Dan itulah alasan kenapa Payroll Monthly akhirnya menjadi
            salah satu bagian dari Finance Assistant.
        </p>

    `
};

export default artikel08;
