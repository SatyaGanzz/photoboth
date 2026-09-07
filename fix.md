Kamu adalah senior engineer yang akan memperbaiki repository photoboth ini.

Tujuan utama:
Membuat aplikasi photobooth lebih siap dipakai secara nyata, terutama untuk kamera, printer, keamanan, dan konsistensi arsitektur.

Konteks proyek:
- Frontend utama: public/app.js dan public/index.html
- Backend utama yang sedang dipakai frontend: server.js
- Backend Express kedua ada di folder backend/
- Storage saat ini menggunakan folder photos/ dan photos/metadata.json
- Test integrasi tersedia di tests/test_server.js
- Test terakhir berhasil 14/14, jadi jangan merusak alur yang sudah bekerja.

Masalah utama:
1. Ada dua backend:
   - server.js menggunakan native Node HTTP
   - backend/server.js menggunakan Express
   Jadikan server.js sebagai backend utama untuk saat ini karena frontend dan test menggunakannya. Jangan melakukan migrasi besar ke Express kecuali benar-benar diperlukan.

2. Credential masih hardcoded di server.js.
   - Pindahkan username dan password ke environment variable.
   - Tambahkan .env.example.
   - Berikan fallback yang aman untuk development tanpa mengekspos credential production.
   - Pastikan test tetap dapat menjalankan login.

3. Status kamera, printer, dan Google Drive masih simulasi.
   - Bedakan status simulated, browser-camera, dan hardware nyata.
   - Jangan mengembalikan connected/authorized/printing jika perangkat atau integrasi sebenarnya belum aktif.
   - Response API harus menjelaskan mode simulasi dengan jelas.

4. Kamera DSLR belum memakai gphoto2 atau adapter hardware nyata.
   - Buat abstraction/interface camera provider.
   - Pertahankan browser camera sebagai fallback.
   - Jangan membuat aplikasi crash jika DSLR tidak tersedia.
   - Capture harus tetap bekerja dengan browser camera atau simulator.

5. Printer belum benar-benar mengirim job.
   - Buat abstraction printer provider.
   - Pertahankan mock printer untuk development.
   - Tambahkan status print job: queued, printing, completed, failed.
   - Jangan mengklaim job berhasil jika provider gagal.

6. Endpoint Google Drive masih placeholder.
   - Jangan mengklaim authorized atau upload berhasil jika belum ada konfigurasi.
   - Kembalikan status not_configured secara jujur.

7. Validasi upload image masih lemah.
   - Validasi ukuran payload.
   - Validasi MIME dan isi image.
   - Gunakan sharp jika tersedia.
   - Tolak data invalid dengan response error yang jelas.
   - Pastikan path traversal tetap dicegah.

8. Metadata JSON masih rawan untuk penulisan bersamaan.
   - Tambahkan mekanisme write yang lebih aman atau locking sederhana.
   - Jangan menghapus data existing.
   - Tangani metadata yang corrupt tanpa membuat server langsung crash.

Keamanan minimum:
- Gunakan environment variable untuk credential.
- Tambahkan rate limit sederhana untuk login.
- Batasi CORS melalui environment variable.
- Jangan expose credential atau token di log.
- Ganti url.parse() dengan URL API modern jika tidak mengganggu kompatibilitas.
- Pertahankan proteksi path traversal.
- Jangan menambahkan dependency besar tanpa alasan.

Aturan implementasi:
- Baca file yang relevan sebelum mengubahnya.
- Buat perubahan kecil dan bertahap.
- Jangan mengubah desain frontend yang sudah ada kecuali diperlukan.
- Jangan menghapus fitur capture, gallery, editor, template, download, atau session.
- Jangan membuat arsitektur baru yang berlebihan.
- Gunakan pola yang konsisten dengan codebase sekarang.
- Jangan commit perubahan.
- Jangan memperbaiki bug yang tidak berhubungan.

Test dan acceptance criteria:
1. Jalankan node tests/test_server.js.
2. Semua test existing harus tetap pass.
3. Tambahkan test untuk:
   - Credential dari environment
   - Login rate limit
   - Status kamera simulator
   - Print job failure/success
   - Google Drive not_configured
   - Invalid image upload
   - Path traversal
4. Pastikan server dapat dijalankan tanpa kamera DSLR, printer, atau Google Drive.
5. Pastikan frontend tetap bisa:
   - Login
   - Membuat session
   - Capture dengan simulator/browser camera
   - Melihat gallery
   - Mengedit foto
   - Membuat layout
   - Download hasil
6. Di akhir, tampilkan:
   - Daftar file yang diubah
   - Ringkasan perubahan
   - Test yang dijalankan
   - Hal yang masih memerlukan konfigurasi hardware nyata

Mulai dengan audit singkat terhadap server.js, public/app.js, tests/test_server.js, dan backend/server.js. Setelah menemukan implementasi yang mengontrol behavior, langsung lakukan perubahan paling kecil yang dapat diuji.