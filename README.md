# CareerPath — Sistem Rekomendasi Bidang Karir Mahasiswa

Aplikasi web berbasis Machine Learning untuk merekomendasikan bidang karir teknologi bagi mahasiswa berdasarkan program studi, karakteristik pribadi, minat aktivitas teknologi, serta cara belajar dan *problem solving*.

Model prediksi menggunakan **Support Vector Machine (SVC)** yang dilatih pada 31 fitur kuesioner (`Q1`–`Q31`) dan diintegrasikan melalui arsitektur *decoupled client-server* (**Flask** + **React Vite**).

---

## Teknologi yang Digunakan

- **Backend & Machine Learning:**
  - Python 3.12+
  - Flask & Flask-CORS
  - Pandas
  - scikit-learn (`1.8.0`) & imbalanced-learn
  - joblib (`model_karir.pkl`)
- **Frontend:**
  - React (`19`)
  - Vite (`8`)
  - JavaScript (ES Modules), HTML5, CSS3

---

## Struktur Folder Proyek

```text
rekomendasi-karir-mahasiswa-ml/
├── .gitignore
├── README.md
├── backend/
│   ├── app.py                # Server REST API Flask & logika inferensi model ML
│   ├── model_karir.pkl       # Artefak model ML terlatih (Pipeline + SVC)
│   ├── requirements.txt      # Daftar dependensi Python backend
│   ├── run_backend.bat       # Skrip peluncur backend untuk Windows
│   └── test_backend.py       # Skrip pengujian endpoint backend
└── frontend/
    ├── src/
    │   ├── App.css           # Stylesheet komponen UI
    │   ├── App.jsx           # Komponen utama kuesioner & tampilan hasil
    │   ├── index.css         # Stylesheet global & CSS variables
    │   └── main.jsx          # Entry point React
    ├── .gitignore
    ├── index.html            # Entry point HTML Vite
    ├── package.json          # Manifes dependensi & skrip npm
    ├── package-lock.json
    └── vite.config.js        # Konfigurasi dev server Vite (port 5173)
```

---

## Fitur Utama & 11 Bidang Karir Target

- **Asesmen Bertahap (31 Pertanyaan):**
  - `Q1`: Pilihan Program Studi (`Informatika`, `Sistem Informasi`, `Teknik Komputer`).
  - `Q2`–`Q31`: Skala Likert `1`–`5` yang terbagi menjadi *Karakteristik Pribadi*, *Minat terhadap Aktivitas Teknologi*, dan *Cara Belajar dan Problem Solving*.
- **Deteksi Status Backend Otomatis (`GET /`):** Memberi peringatan di antarmuka apabila server Flask belum dijalankan atau model belum termuat.
- **Hasil Rekomendasi & Peringkat:** Menampilkan 1 rekomendasi utama, deskripsi bidang, ringkasan skor jawaban per kategori, serta peringkat probabilitas kecocokan untuk seluruh **11 bidang karir**:
  1. AI/Machine Learning Engineer
  2. Application Developer
  3. Chip Design Engineer
  4. Cybersecurity Analyst
  5. Data Analyst
  6. Data Scientist
  7. ERP Analyst/Consultant
  8. Embedded Systems Engineer
  9. IT Auditor
  10. IoT Developer/Engineer
  11. UI/UX Designer

---

## Cara Instalasi & Menjalankan di Lokal

### Prasyarat
- **Python 3.12+**
- **Node.js & npm**

### 1. Setup & Jalankan Backend (Port `5000`)

```powershell
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

*(Pada Windows, setelah `venv` dan dependensi terpasang, backend juga dapat dijalankan langsung melalui `backend/run_backend.bat`.)*

Server backend akan berjalan di `http://127.0.0.1:5000`.

### 2. Setup & Jalankan Frontend (Port `5173`)

Buka terminal baru:

```powershell
cd frontend
npm install
npm run dev
```

Buka `http://localhost:5173` di browser (pastikan server backend tetap menyala).

---

## Dokumentasi Singkat API

### `GET /`
Endpoint *health check* untuk memeriksa status server API dan kesiapan model `model_karir.pkl`.

### `POST /predict`
Menerima payload JSON berisi jawaban `Q1`–`Q31`:

```json
{
  "Q1": "Informatika",
  "Q2": 4,
  "Q3": 4,
  "...": "...",
  "Q31": 5
}
```

Mengembalikan respons JSON:

```json
{
  "success": true,
  "prediction": "Data Scientist",
  "prediction_key": "ds",
  "probabilities": [
    {
      "career_field": "Data Scientist",
      "key": "ds",
      "percentage": 42.5
    }
  ],
  "input": {
    "Q1": "Informatika",
    "Q2": 4
  }
}
```

---

## Identitas Kelompok

1. **Mutiara Ayudya Ramadhani** — `2411523008`
2. **Athaya Nasywa Mahira** — `2411523028`
3. **Naila Muthia Danisha** — `2411523029`
