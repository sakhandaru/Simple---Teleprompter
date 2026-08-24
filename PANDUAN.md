# 📖 Panduan Menulis Naskah Teleprompter (.md)

Simpan naskah sebagai file `.md` atau `.txt`, lalu upload lewat tombol **📂 Impor**.
Semua marker bersifat opsional — naskah tanpa marker tetap bisa dibaca dengan kecepatan normal.

---

## Aturan Dasar

- Tulis naskah seperti biasa (plain text / Markdown).
- **Satu baris = satu blok teks** di layar. Baris kosong diabaikan.
- Baris yang diakhiri `. ! ?` diberi jarak ekstra dari blok berikutnya (mata lebih mudah menangkap akhir kalimat).
- Tanda `. ! ?` otomatis dirender warna **amber** agar batas kalimat terlihat jelas.
- Semua marker boleh huruf besar/kecil: `[slow]` sama dengan `[SLOW]`.

---

## 1. Tempo — `[slow]` `[normal]` `[fast]`

Mengubah kecepatan scroll **mulai titik marker itu** sampai diganti marker lain.

| Marker | Kecepatan |
|---|---|
| `[slow]` | ~½ kecepatan (bagian emosional) |
| `[normal]` | kecepatan dasar |
| `[fast]` | ~1,5× (bagian pengantar) |

Posisinya bebas — boleh sendirian di satu baris (paling rapi):

```
[normal]
Bapak-bapak, ibu-ibu, terima kasih atas kehadiran kalian.

[slow]
Tiga tahun ini... bukan sekadar angka.
```

Transisi antar-tempo meluncur halus ±0,5 detik, tidak mendadak.
Indikator strip warna di tepi kiri layar saat membaca: abu-abu = normal, biru = slow, oranye = fast.

---

## 2. Penekanan Kata

| Ditulis | Hasil di layar |
|---|---|
| `==kata==` | **highlight kuning** + bold (penekanan emosi) |
| `**kata**` | tebal putih |
| `*kata*` | miring |

```
Ada ==tawa==, ada ==air mata==, ada nama-nama yang tak akan kita lupakan.
```

Tip: cukup 1–2 kata kunci per kalimat. Kalau semua ditekankan, tidak ada yang menonjol.

---

## 3. Intonasi — `[naik]` `[turun]`

Ikon panah muncul tepat setelah kata yang ditandai.

| Marker | Tampil | Arti |
|---|---|---|
| `[naik]` | ↗ hijau | nada naik — pertanyaan, harapan |
| `[turun]` | ↘ merah | nada turun — yakin, penutup |

Tempelkan langsung di belakang kata/kalimat:

```
Apakah kita akan menyerah?[naik]
Tidak. ==Tidak akan pernah.==[turun]
```

---

## 4. Tanda Jeda Manual — `//`

`//` **tidak mengubah kecepatan apa pun** — murni catatan visual untukmu.
Saat mode baca, tanda ini tampil sebagai `//` abu-abu miring di antara kata,
sebagai pengingat: *"di sini aku biasanya mampir sejenak"* — lalu kamu
melambatkan dengan `[slow]`, atau tap layar kalau memang mau berhenti.

```
Tarik napas dalam-dalam... // lalu mulai bicara.
Jadi terima kasih... // untuk semuanya.
```

Kalau tidak ingin tandanya terlihat sama sekali, tulis saja tanpa `//`
atau sembunyikan dengan `<!-- // -->`.

---

## 5. Komentar / Catatan Panggung — `#`

Baris yang **dimulai dengan `#`** tetap tampil saat mode baca, tapi berbeda jelas dari naskah:
**warna abu-abu, miring, dengan tanda `#`-nya**, dan tidak dihitung dalam estimasi waktu.
Cocok untuk catatan panggung yang perlu kamu lihat sambil bicara.

```
# tarik napas dalam-dalam
# senyum dulu
Selamat pagi semuanya.
```

Kalau mau catatan yang **benar-benar tersembunyi**, pakai `<!-- ... -->`:
```
<!-- draft belum final, jangan tampil -->
Tarik napas dulu. <!-- eye contact ke kiri-kanan -->
```

---

## Contoh Lengkap Siap Pakai

```markdown
# contoh naskah — baris ini tampil abu-abu miring saat membaca

Assalamualaikum wr. wb., selamat pagi bapak ibu guru dan teman-teman sekalian.

[slow]
Hari ini... kita benar-benar sudah sampai di sini. //
Tiga tahun terasa seperti ==sekejap==.

Apakah kita akan melupakan masa ini?[naik]
Tidak. ==Tidak akan pernah.==[turun]

[normal]
Terima kasih untuk ==semua kenangan==, teman-teman.
Selamat tinggal, dan ==semoga sukses== untuk kita semua.[turun]

Wassalamualaikum wr. wb.
```

---

## Pengaturan & Mode Baca

**Di editor (sebelum membaca):**
- Toolbar di atas textarea menyisipkan marker langsung di posisi kursor (`[slow]`, `==teks==`, dll).
- Slider **Kecepatan** = pengali global (semua tempo `[slow/normal/fast]` ikut berlipat).
- Tombol `A` / `A+` = ukuran font.
- Naskah & pengaturan **tersimpan otomatis** di HP (localStorage) — tidak perlu simpan manual.
- Tombol **📂 Impor** mengganti naskah dengan isi file `.md` / `.txt`.
- Tombol **❓** menampilkan ringkasan panduan ini langsung di app.

**Saat mode baca:**
1. Muncul **countdown 3‑2‑1**, lalu scroll mulai.
2. **Tap layar** = pause / lanjut.
3. Tombol **`−` / `+`** = ubah kecepatan di tengah jalan.
4. **`A−` / `A+`** = ukuran font.
5. Panel atas menampilkan **progress bar + sisa waktu + persentase** — berguna untuk pacing latihan. Panel kontrol & info selalu tampil, tidak tersembunyi.
6. **Keluar** = tekan dan **tahan ±1 detik** sampai tombol terisi merah — sengaja dibuat begini supaya tidak terklik tak sengaja di tengah pidato.

---

## Hal Kecil yang Perlu Diketahui

- Marker harus dieja benar. Kalau typo (`[slaw]`, `[naek]`), teksnya akan **tampil apa adanya** di layar.
- Naskah kosong → tombol "Mulai Baca" tidak aktif.
- Layar HP dikunci tetap menyala otomatis selama mode baca.
- **Install ke home screen**: buka app di Chrome/Safari HP → menu → *"Add to Home Screen"*. Setelah itu app bisa dibuka seperti aplikasi biasa dan **jalan offline** tanpa internet.
