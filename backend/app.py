import os
import math
import joblib
import pandas as pd

from flask import Flask, request, jsonify
from flask_cors import CORS

# Inisialisasi aplikasi Flask
app = Flask(__name__)
CORS(app)

# Konfigurasi nama dan path file model Machine Learning
MODEL_FILENAME = 'model_karir.pkl'
CANDIDATE_PATHS = [
    os.path.join(os.path.dirname(__file__), MODEL_FILENAME),
    os.path.join(os.path.dirname(__file__), '..', MODEL_FILENAME),
    os.path.join(os.getcwd(), MODEL_FILENAME),
    os.path.join(os.getcwd(), 'backend', MODEL_FILENAME)
]

# Pemetaan nama kelas bidang karir ke kode internal frontend React (CAREERS)
CAREER_KEY_MAP = {
    'AI/Machine Learning Engineer': 'ai',
    'Application Developer': 'se',
    'Chip Design Engineer': 'ch',
    'Cybersecurity Analyst': 'cy',
    'Data Analyst': 'da',
    'Data Scientist': 'ds',
    'ERP Analyst/Consultant': 'en',
    'Embedded Systems Engineer': 'em',
    'IT Auditor': 'au',
    'IoT Developer/Engineer': 'io',
    'UI/UX Designer': 'ux'
}

# Daftar kode fitur kuesioner sesuai Tabel Pertanyaan Karir & Notebook ML (Q1 - Q31)
FEATURE_COLUMNS = [f'Q{i}' for i in range(1, 32)]
VALID_STUDY_PROGRAMS = ['Informatika', 'Sistem Informasi', 'Teknik Komputer']

# Skala default jika metadata model tidak ditemukan
DEFAULT_SKALA_SESUAI = {
    'sangat tidak sesuai': 1,
    'tidak sesuai': 2,
    'cukup sesuai': 3,
    'sesuai': 4,
    'sangat sesuai': 5
}
DEFAULT_SKALA_MINAT = {
    'sangat tidak tertarik': 1,
    'tidak tertarik': 2,
    'biasa saja': 3,
    'tertarik': 4,
    'sangat tertarik': 5
}
DEFAULT_KOL_SESUAI = [f'Q{i}' for i in list(range(2, 9)) + list(range(28, 32))]
DEFAULT_KOL_MINAT = [f'Q{i}' for i in range(9, 28)]

# Variabel global paket dan objek model Machine Learning
career_package = None
career_model = None
career_classes = None
feature_columns = FEATURE_COLUMNS
valid_study_programs = VALID_STUDY_PROGRAMS
skala_sesuai = DEFAULT_SKALA_SESUAI
skala_minat = DEFAULT_SKALA_MINAT
kol_sesuai = DEFAULT_KOL_SESUAI
kol_minat = DEFAULT_KOL_MINAT
active_model_path = None


def find_model_path():
    """Mencari path absolut file model dari beberapa kandidat lokasi."""
    for path in CANDIDATE_PATHS:
        normalized = os.path.normpath(path)
        if os.path.exists(normalized):
            return normalized
    return os.path.normpath(CANDIDATE_PATHS[0])


def load_model():
    """Memuat artefak paket model Machine Learning (.pkl) ke memori."""
    global career_package, career_model, career_classes, feature_columns
    global valid_study_programs, skala_sesuai, skala_minat, kol_sesuai, kol_minat, active_model_path

    model_path = find_model_path()
    active_model_path = model_path

    if not os.path.exists(model_path):
        print(f"[INFO] File model '{MODEL_FILENAME}' belum ditemukan di: {model_path}")
        career_package = None
        career_model = None
        career_classes = None
        return None

    try:
        paket = joblib.load(model_path)

        # File model dapat berupa paket dictionary (seperti hasil notebook final) atau objek model langsung
        if isinstance(paket, dict) and 'model' in paket:
            career_package = paket
            career_model = paket['model']
            career_classes = paket.get('kelas', list(CAREER_KEY_MAP.keys()))
            feature_columns = paket.get('kolom_input', FEATURE_COLUMNS)
            valid_study_programs = paket.get('pilihan_prodi', VALID_STUDY_PROGRAMS)
            skala_sesuai = paket.get('skala_sesuai', DEFAULT_SKALA_SESUAI)
            skala_minat = paket.get('skala_minat', DEFAULT_SKALA_MINAT)
            kol_sesuai = paket.get('kol_sesuai', DEFAULT_KOL_SESUAI)
            kol_minat = paket.get('kol_minat', DEFAULT_KOL_MINAT)
        else:
            career_package = None
            career_model = paket
            career_classes = getattr(paket, 'classes_', list(CAREER_KEY_MAP.keys()))

        if not hasattr(career_model, 'predict'):
            raise ValueError("Objek model tidak memiliki metode 'predict'.")

        print(f"[SUCCESS] Model berhasil dimuat dari {model_path}")
        print(f"[INFO] Jumlah kelas target: {len(career_classes) if career_classes is not None else 0}")
        print(f"[INFO] Jumlah fitur input: {len(feature_columns)}")
        return career_model

    except Exception as e:
        print(f"[ERROR] Gagal memuat model dari {model_path}: {e}")
        career_package = None
        career_model = None
        career_classes = None
        return None


# Muat model saat modul app.py diinisialisasi
load_model()


@app.route('/', methods=['GET'])
def index():
    """Endpoint cek status server API (Health Check)."""
    return jsonify({
        "status": "online",
        "service": "CareerPath - Rekomendasi Bidang Karir Mahasiswa API",
        "model_loaded": career_model is not None,
        "model_file": MODEL_FILENAME,
        "model_path": active_model_path,
        "classes_count": len(career_classes) if career_classes is not None else 0,
        "career_classes": career_classes,
        "expected_features": feature_columns
    })


@app.route('/predict', methods=['POST'])
def predict():
    """
    Endpoint inferensi rekomendasi bidang karir mahasiswa (Q1 - Q31).
    Menerima jawaban kuesioner dari frontend, memvalidasi input,
    menjalankan preprocessing serta prediksi model Machine Learning,
    dan mengembalikan peringkat rekomendasi bidang karir beserta distribusinya.
    """
    global career_model

    # Mekanisme lazy fallback jika model belum dimuat
    if career_model is None:
        career_model = load_model()
        if career_model is None:
            return jsonify({
                "success": False,
                "error": (
                    f"Model '{MODEL_FILENAME}' belum tersedia di server. "
                    "Pastikan file model .pkl sudah diletakkan pada folder backend."
                )
            }), 503

    try:
        data = request.get_json(force=True, silent=True)

        if not data or not isinstance(data, dict):
            return jsonify({
                "success": False,
                "error": "Tidak ada data JSON yang valid diterima oleh server."
            }), 400

        # Validasi kelengkapan seluruh fitur input (Q1 - Q31)
        missing_codes = [
            col for col in feature_columns
            if col not in data or data.get(col) is None or str(data.get(col)).strip() == ''
        ]
        if missing_codes:
            return jsonify({
                "success": False,
                "error": f"Masih ada pertanyaan yang belum diisi: {', '.join(missing_codes)}"
            }), 400

        # Validasi Q1 (Program Studi)
        study_program = str(data.get('Q1')).strip()
        if study_program not in valid_study_programs:
            return jsonify({
                "success": False,
                "error": (
                    f"Program studi '{study_program}' tidak valid. "
                    f"Pilihan yang diterima: {', '.join(valid_study_programs)}"
                )
            }), 400

        # Validasi dan pra-pemrosesan Q2 - Q31 (skala 1 - 5)
        row_dict = {'Q1': study_program}
        for code in feature_columns[1:]:
            raw_val = data.get(code)
            parsed_val = None

            # Penanganan jika input berupa angka langsung atau string angka (mendukung desimal titik/koma)
            if isinstance(raw_val, (int, float)):
                parsed_val = float(raw_val)
            elif isinstance(raw_val, str):
                cleaned_str = raw_val.strip().replace(',', '.')
                try:
                    parsed_val = float(cleaned_str)
                except ValueError:
                    # Penanganan jika input berupa teks skala deskriptif (misal 'Sesuai' / 'Tertarik')
                    text_lower = raw_val.strip().lower()
                    scale_map = skala_sesuai if code in kol_sesuai else skala_minat
                    if text_lower in scale_map:
                        parsed_val = float(scale_map[text_lower])
                    else:
                        return jsonify({
                            "success": False,
                            "error": f"Jawaban teks '{raw_val}' pada {code} tidak dikenali dalam skala Likert."
                        }), 400

            if parsed_val is None or not math.isfinite(parsed_val):
                return jsonify({
                    "success": False,
                    "error": f"Nilai jawaban pada {code} tidak valid atau bukan angka berhingga."
                }), 400

            int_val = int(round(parsed_val))
            if int_val < 1 or int_val > 5:
                return jsonify({
                    "success": False,
                    "error": f"Nilai jawaban pada {code} harus berada pada rentang skala 1 hingga 5 (diterima: {raw_val})."
                }), 400

            row_dict[code] = int_val

        # Bentuk pandas DataFrame dengan urutan kolom yang presisi sesuai tahap training
        input_data = pd.DataFrame([row_dict], columns=feature_columns)

        # Jalankan prediksi model
        pred = career_model.predict(input_data)
        raw_pred = pred[0]

        # Konversi hasil prediksi integer / numpy scalar ke nama kelas yang sesuai
        try:
            pred_idx = int(raw_pred)
            if career_classes and 0 <= pred_idx < len(career_classes):
                prediction_name = career_classes[pred_idx]
            else:
                prediction_name = str(raw_pred).strip()
        except (ValueError, TypeError):
            prediction_name = str(raw_pred).strip()

        prediction_key = CAREER_KEY_MAP.get(prediction_name, '')

        # Hitung distribusi probabilitas jika didukung oleh model
        probabilities = []
        if hasattr(career_model, 'predict_proba'):
            try:
                proba_arr = career_model.predict_proba(input_data)[0]

                for idx, p in enumerate(proba_arr):
                    cls_name = career_classes[idx] if career_classes and idx < len(career_classes) else f"Kelas {idx}"
                    probabilities.append({
                        "career_field": str(cls_name),
                        "key": CAREER_KEY_MAP.get(str(cls_name), ''),
                        "percentage": round(float(p) * 100, 1)
                    })

                probabilities.sort(key=lambda x: x["percentage"], reverse=True)
            except Exception as e_proba:
                print(f"[WARN] Gagal menghitung distribusi probabilitas: {e_proba}")

        return jsonify({
            "success": True,
            "prediction": prediction_name,
            "prediction_key": prediction_key,
            "probabilities": probabilities,
            "input": row_dict
        })

    except ValueError as ve:
        return jsonify({
            "success": False,
            "error": f"Format input jawaban tidak valid: {str(ve)}"
        }), 400

    except Exception as e:
        return jsonify({
            "success": False,
            "error": f"Terjadi kesalahan saat memproses prediksi: {str(e)}"
        }), 500


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    print(f"Server Flask berjalan di http://127.0.0.1:{port}")
    app.run(
        host='127.0.0.1',
        port=port,
        debug=True
    )
