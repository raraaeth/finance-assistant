export default {
    title: "Pengingat Airdrop",

    content: `
    
      <h2>Catat Airdrop dan Reward Yang Didapat</h2>
        <p class="doc-lead">
            Airdrop membantu kamu mencatat campaign, memantau statusnya,
            dan mencatat hasil reward yang didapat. Berbeda dari workspace
            lainnya, Airdrop memiliki fitur khusus untuk mengisi reward
            setelah hasil campaign diketahui.
        </p>


        <!-- =====================================================
             1. TAMPILAN
        ====================================================== -->

        <h2>1. 🏠 Tampilan Airdrop</h2>

        <p>
            Tampilan Airdrop dibuat untuk membantu kamu melihat aktivitas
            campaign dan hasilnya dalam satu tempat.
        </p>

        <div class="doc-image-card">
            <img
                src="/docs/images/airdrop_view.webp"
                alt="Tampilan Airdrop Finance Assistant"
            >
        </div>

        <p>
            Pada <strong>Beranda</strong>, kamu dapat melihat ringkasan
            aktivitas Airdrop, termasuk jumlah campaign, campaign yang
            masih berjalan, dan hasil yang sudah didapatkan.
        </p>

        <p>
            Airdrop juga memiliki bagian <strong>Statistik</strong> untuk
            melihat data dalam bentuk grafik dan rincian transaksi.
            Kamu dapat menggunakan filter untuk melihat data sesuai
            kebutuhan.
        </p>

        <p>
            Bagian <strong>Ringkasan</strong> memiliki tampilan khusus
            untuk Airdrop. Di sini data campaign dikelompokkan berdasarkan
            status seperti <strong>Ongoing</strong>, <strong>Win</strong>,
            <strong>Not Win</strong>, dan <strong>Ended</strong>, termasuk
            distribusi berdasarkan wallet.
        </p>

        <div class="doc-info-box">
            <strong>💡 Tips</strong>
            <p>
                Gunakan Ringkasan untuk melihat perkembangan seluruh
                campaign tanpa harus membuka data satu per satu.
            </p>
        </div>


        <!-- =====================================================
             2. PENGATURAN
        ====================================================== -->

        <h2>2. ⚙️ Pengaturan Airdrop</h2>

        <p>
            Sebelum mulai mencatat campaign, sebaiknya konfigurasi
            Airdrop terlebih dahulu. Pengaturan menentukan pilihan yang
            nantinya tersedia saat melakukan input.
        </p>

        <div class="doc-image-card">
            <img
                src="/docs/images/airdrop_setting.webp"
                alt="Pengaturan Airdrop Finance Assistant"
            >
        </div>

        <h3>🔔 Rule Reminder</h3>

        <p>
            Rule Reminder digunakan untuk menentukan batas waktu pengingat
            campaign. Kamu dapat mengatur berapa hari sebelum campaign
            berakhir agar campaign tersebut mulai muncul pada bagian
            <strong>Reminder</strong>.
        </p>

        <h3>⬛ Rule Ended</h3>

        <p>
            Rule Ended digunakan untuk mengaktifkan perubahan status
            campaign secara otomatis.
        </p>

        <p>
            Jika Rule Ended diaktifkan, campaign dengan tipe
            <strong>Campaign</strong> yang sudah melewati tanggal
            <strong>End</strong> dapat otomatis berubah dari
            <strong>Ongoing</strong> menjadi <strong>Ended</strong>.
        </p>

        <p>
            Pengaturan ini hanya berkaitan dengan tipe
            <strong>Campaign</strong>, karena tipe tersebut memiliki
            tanggal <strong>Start</strong> dan <strong>End</strong>.
        </p>

        <h3>👛 Option Wallet</h3>

        <p>
            Option Wallet digunakan untuk menentukan wallet yang tersedia
            pada saat melakukan input Airdrop.
        </p>

        <p>
            Hanya wallet yang diaktifkan pada pengaturan yang akan muncul
            sebagai pilihan ketika kamu membuat data Airdrop.
        </p>

        <h3>🏷️ Option Type</h3>

        <p>
            Option Type digunakan untuk menentukan jenis Airdrop yang
            tersedia pada input.
        </p>

        <p>
            Tipe seperti <strong>Campaign</strong>, <strong>Testnet</strong>,
            <strong>Retro</strong>, dan tipe lainnya dapat dipilih sesuai
            kebutuhan.
        </p>

        <p>
            Khusus tipe <strong>Campaign</strong>, setiap data yang dibuat
            akan memiliki tambahan tanggal <strong>Start</strong> dan
            <strong>End</strong>. Tanggal inilah yang digunakan sebagai
            dasar pengaturan periode campaign dan otomatisasi
            <strong>Ended</strong>.
            Maka dari itu, type <strong>Campaign</strong> ini otomatis sudah dibuat
            tanpa harus kamu memilih di konfigurasi setting.
        </p>

        <div class="doc-info-box">
            <strong>💡 Tips</strong>
            <p>
                Konfigurasi terlebih dahulu Wallet dan Type yang memang
                ingin kamu gunakan. Pilihan pada form Input nantinya akan
                mengikuti konfigurasi yang sudah dibuat.
            </p>
        </div>


        <!-- =====================================================
             3. INPUT
        ====================================================== -->

        <h2>3. ✍️ Input Airdrop</h2>

        <p>
            Setelah pengaturan selesai, kamu dapat mulai mencatat campaign
            Airdrop. Input Airdrop terdiri dari dua bagian, yaitu
            <strong>Input Normal</strong> dan <strong>Input Reward</strong>.
        </p>

        <div class="doc-image-card">
            <img
                src="/docs/images/airdrop_input.webp"
                alt="Input Airdrop Finance Assistant"
            >
        </div>


        <h3>📝 Input Normal</h3>

        <p>
            Input Normal digunakan untuk mencatat data Airdrop baru,
            seperti tipe, wallet, nama atau project, dan informasi lainnya
            sesuai konfigurasi.
        </p>

        <p>
            Pilihan <strong>Type</strong> dan <strong>Wallet</strong> yang
            tersedia pada form akan mengikuti pengaturan yang sebelumnya
            sudah dibuat.
        </p>

        <p>
            Jika memilih tipe <strong>Campaign</strong>, input akan
            memiliki tambahan <strong>Start</strong> dan <strong>End</strong>.
            Tipe Airdrop lainnya tidak memiliki kedua tanggal tersebut.
        </p>

        <h3>⏳ Status Ongoing Otomatis</h3>

        <p>
            Saat data Airdrop baru dibuat, status awalnya otomatis
            menggunakan <strong>Ongoing</strong>.
        </p>

        <p>
            Jadi kamu tidak perlu menentukan status saat pertama kali
            mencatat campaign. Sistem menganggap campaign tersebut masih
            berjalan sampai ada perubahan status berikutnya.
        </p>

        <h3>🏁 Status Ended Otomatis</h3>

        <p>
            Untuk tipe <strong>Campaign</strong>, status
            <strong>Ongoing</strong> dapat berubah menjadi
            <strong>Ended</strong> secara otomatis apabila Rule Ended
            sudah diaktifkan pada Pengaturan dan tanggal End campaign
            telah terlewati.
        </p>


        <h3>🎁 Input Reward</h3>

        <p>
            Berbeda dari workspace lainnya, hasil reward Airdrop tidak
            diisi ketika membuat data melalui Input Normal.
        </p>

        <p>
            Reward diisi melalui <strong>Input Reward</strong> setelah
            campaign sudah memiliki hasil.
        </p>

        <p>
            Pilih project Airdrop yang sudah tersimpan, kemudian tentukan
            hasilnya:
        </p>

        <div class="doc-step">
            <strong>🏆 Win</strong>
            <p>
                Jika mendapatkan reward, pilih <strong>Win</strong> dan
                masukkan nominal reward dalam <strong>USD</strong>.
            </p>
        </div>

        <div class="doc-step">
            <strong>❌ Not Win</strong>
            <p>
                Jika tidak mendapatkan reward, pilih <strong>Not Win</strong>.
                Nominal reward tidak perlu diisi.
            </p>
        </div>

        <p>
            Input Reward hanya dapat digunakan untuk data dengan status
            <strong>Ongoing</strong> atau <strong>Ended</strong>.
            Status hasil reward yang tersedia hanya <strong>Win</strong>
            dan <strong>Not Win</strong>.
        </p>

        <div class="doc-highlight">
            <strong>🎯 Alur Airdrop</strong>
            <p>
                Atur konfigurasi → catat campaign → status otomatis
                <strong>Ongoing</strong> → campaign selesai atau berakhir →
                isi hasil melalui <strong>Input Reward</strong> → pilih
                <strong>Win</strong> atau <strong>Not Win</strong>.
            </p>
        </div>

        <div class="doc-info-box">
            <strong>💡 Tips</strong>
            <p>
                Jangan mencari kolom reward pada Input Normal. Data reward
                memang dipisahkan agar pencatatan campaign dan hasilnya
                tetap jelas serta mudah diperbarui setelah campaign
                menghasilkan keputusan.
            </p>
        </div>

    `
};
