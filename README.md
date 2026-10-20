# Sasaki Stopped a Bullet · fan blog

Fan blog semi-wiki untuk one-shot Tatsuki Fujimoto **佐々木くんが銃弾止めた** (*Sasaki Stopped a Bullet*) dan episode 2 anime *藤本タツキ 17-26*.

Konsepnya **"Satu Peluru"**: seluruh halaman adalah lintasan sebutir peluru. Gulir = waktu berjalan.
Babak I kelas remedial (papan tulis) → Babak II tembakan (layar gelap, kilat moncong) → Babak III waktu berhenti
(bagian di-*pin*, gulir menggerakkan peluru frame demi frame dengan HUD balistik) → Babak IV langit oranye dan bulan.
Setelah itu arsip: manga, anime, garis waktu, dan jaringan "Dunia Fujimoto". Wiki ada di halaman terpisah.

- Vanilla HTML/CSS/JS (ES modules), tanpa build, sama seperti blog Fujimoto lainnya. Spesifikasi desain: `DESIGN.md`
  (basis SpaceX: kanvas hitam, tipografi kondensasi kapital, satu tombol pill; palet dari cover 17-21).
- Dua bahasa (ID/EN) tanpa reload, semua teks di `i18n/*.json`.
- Filter spoiler tiga level dengan sensor tinta. Ending dan twist hanya bisa dibuka dengan "tahan untuk menghentikan peluru".
- Tidak ada aset yang dimuat dari pihak ketiga kecuali Google Fonts dan iframe YouTube (baru dimuat saat tombol putar diklik).

## Jalankan lokal

```bash
python -m http.server 5540
```

Buka http://localhost:5540. Harus lewat server (bukan `file://`) karena teks dimuat dengan `fetch()`.

Deploy: GitHub Pages (branch `main`, folder root) atau Vercel (static, tanpa build command). Tidak ada langkah build.
Setelah mengubah CSS/JS, naikkan query `?v=N` di `index.html` dan `wiki.html`.

## Struktur

```
index.html            halaman cerita (hero → babak I-IV → arsip → Dunia Fujimoto)
wiki.html             wiki: tema, simbolisme, trivia, karya lain, produksi + pencarian & filter
css/style.css         semua gaya (token di :root, sesuai DESIGN.md)
js/main.js            entry point kedua halaman
js/core.js            helper, i18n, level spoiler, suara (WebAudio, default mati)
js/chrome.js          header, dialog spoiler, footer (dipakai kedua halaman)
js/spoiler.js         sensor tinta untuk [data-sp], tombol tahan untuk level 2
js/story.js           render data + scroll story (rail, freeze, kartu, trailer, slider)
js/lightbox.js        lightbox: zoom, geser, swipe, mode baca
js/wiki.js            halaman wiki
js/fx.js              intro, reveal, lubang peluru + gelombang klik
js/data.js            data non-teks: gambar, ID video, tautan
i18n/id.json, en.json semua teks yang terlihat
assets/img/           gambar WebP
assets/assets-manifest.json  sumber, kredit, dan lisensi tiap aset
tools/img.py          konversi gambar mentah (assets/raw/, tidak di-commit) ke WebP
```

## Menambah konten / terjemahan

- **Teks biasa:** ubah nilainya di `i18n/id.json` dan `i18n/en.json` (kunci harus sama di kedua file).
  Di HTML, elemen memakai `data-i18n="kunci.anak"` (isi) atau `data-i18n-attr="alt:kunci;aria-label:kunci"` (atribut).
- **Bahasa baru:** salin `i18n/en.json` ke `i18n/xx.json`, terjemahkan, tambahkan `'xx'` ke `LANGS` di `js/core.js`
  dan tombolnya di `js/chrome.js`.
- **Artikel wiki:** tambahkan objek ke `articles` di kedua file i18n:
  `{ "id", "cat": "theme|symbol|trivia|link|prod", "sp": 0|1|2, "title", "body" (HTML), "src": [[nama, url]], "tags": [] }`.
- **Spoiler di HTML:** bungkus dengan `<div class="sp" data-sp="1"><div class="sp__body">…</div></div>`
  (`1` = ringan, `2` = twist/ending). Untuk teks yang dirender JS pakai `spText(teks, level)` dari `js/spoiler.js`.
- **Gambar:** taruh file mentah di `assets/raw/`, tambahkan baris di `JOBS` pada `tools/img.py`, jalankan
  `python tools/img.py`, lalu catat sumbernya di `assets/assets-manifest.json`.
- **Strip adegan:** berisi 5 still resmi anime (`assets/img/panels/scene-*.webp`). Untuk mengganti dengan potongan panel
  manga, taruh WebP di `assets/img/panels/` dan ubah `src` pada `PANELS` di `js/data.js`. Kutipan pendek saja.

## Aset yang perlu diisi manual

Lihat `todo_manual` di `assets/assets-manifest.json`: cover VIZ edisi Inggris, dan (opsional) potongan panel manga
pengganti still anime di strip adegan serta screenshot adegan tambahan.

## Jaringan blog

[Fujimoto Archive](https://dans-vsa.github.io/fujimoto-archive/) ·
[Tatsuki Fujimoto Before Chainsaw Man](https://dans-vsa.github.io/before-chainsaw-man-fanblog/) ·
[Niwatori](https://dans-vsa.github.io/niwatori-fanblog/) ·
[Goodbye, Eri](https://dans-vsa.github.io/goodbye-eri-fanblog/)

## Legal

Fan project non-komersial dan tidak resmi. Cover © Tatsuki Fujimoto / Shueisha. Key visual, desain karakter, dan
cuplikan anime © 藤本タツキ／集英社・「藤本タツキ 17-26」製作委員会. Gambar dipakai terbatas untuk ulasan.
Baca dan tonton secara legal: [Shōnen Jump+](https://shonenjumpplus.com/episode/17107094912077655847),
[VIZ Media](https://www.viz.com/read/manga/tatsuki-fujimoto-before-chainsaw-man/product/7330), Prime Video.
Aturan teks: tanpa em/en dash.
