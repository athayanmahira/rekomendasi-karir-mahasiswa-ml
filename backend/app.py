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
# Catatan: Nama file model akan disesuaikan setelah proses training & testing model final selesai.
MODEL_FILENAME = 'career_recommendation_model.pkl'
MODEL_PATH = os.path.join(os.path.dirname(__file__), MODEL_FILENAME)

# Daftar kode fitur kuesioner sesuai Tabel_Pertanyaan_Karir_Draft_ML.docx (Q1 - Q31)
FEATURE_COLUMNS = [f'Q{i}' for i in range(1, 32)]
VALID_STUDY_PROGRAMS = ['Informatika', 'Sistem Informasi', 'Teknik Komputer']

# Variabel global objek model Machine Learning
career_model = None


def load_model():
    """Memuat artefak model Machine Learning (.pkl) ke memori jika sudah tersedia."""
    global career_model

    if not os.path.exists(MODEL_PATH):
        print(f"[INFO] File model '{MODEL_FILENAME}' belum tersedia (menunggu tahap integrasi model final).")
        career_model = None
        return None

    try:
        model = joblib.load(MODEL_PATH)

        if not hasattr(model, 'predict'):
            raise ValueError("Objek model tidak memiliki metode 'predict'.")

        career_model = model
        print(f"[SUCCESS] Model berhasil dimuat dari {MODEL_PATH}")
        return career_model

    except Exception as e:
        print(f"[ERROR] Gagal memuat model: {e}")
        career_model = None
        return None


# Mencoba memuat model saat server dijalankan
load_model()


@app.route('/', methods=['GET'])
def index():
    """Endpoint cek status server API (Health Check)."""
    return jsonify({
        "status": "online",
        "service": "CareerPath ML - Rekomendasi Bidang Karir Mahasiswa API",
        "model_loaded": career_model is not None,
        "model_file": MODEL_FILENAME,
        "expected_features": FEATURE_COLUMNS
    })


@app.route('/predict', methods=['POST'])
def predict():
    """
    Kerangka endpoint prediksi bidang karir mahasiswa (Q1 - Q31).
    Akan dihubungkan dengan frontend setelah proses pelatihan & evaluasi model final selesai.
    """
    global career_model

    if career_model is None:
        career_model = load_model()
        if career_model is None:
            return jsonify({
                "success": False,
                "error": (
                    f"Model '{MODEL_FILENAME}' belum tersedia. "
                    "Silakan selesaikan tahap training dan letakkan file model di folder backend."
                )
            }), 503

    try:
        data = request.get_json(force=True)

        if not data:
            return jsonify({
                "success": False,
                "error": "Tidak ada data JSON yang diterima."
            }), 400

        # Validasi kelengkapan Q1 - Q31
        missing_codes = [col for col in FEATURE_COLUMNS if col not in data or data.get(col) in (None, '')]
        if missing_codes:
            return jsonify({
                "success": False,
                "error": f"Masih ada pertanyaan yang belum diisi: {', '.join(missing_codes)}"
            }), 400

        # Validasi Q1 (Program Studi)
        study_program = str(data.get('Q1')).strip()
        if study_program not in VALID_STUDY_PROGRAMS:
            return jsonify({
                "success": False,
                "error": f"Program studi '{study_program}' tidak valid."
            }), 400

        # Validasi Q2 - Q31 (Skala 1 - 5)
        row_dict = {'Q1': study_program}
        for i in range(2, 32):
            code = f'Q{i}'
            val = float(data.get(code))
            if not math.isfinite(val) or val < 1 or val > 5:
                return jsonify({
                    "success": False,
                    "error": f"Nilai jawaban pada {code} harus berada pada rentang skala 1 hingga 5."
                }), 400
            row_dict[code] = int(val)

        # Konstruksi DataFrame sesuai urutan kolom Q1 - Q31
        input_data = pd.DataFrame([row_dict], columns=FEATURE_COLUMNS)

        # Pemanggilan prediksi model
        pred = career_model.predict(input_data)
        prediction_name = str(pred[0]).strip()

        # Distribusi probabilitas kelas jika didukung oleh model final
        probabilities = []
        if hasattr(career_model, 'predict_proba') and hasattr(career_model, 'classes_'):
            try:
                proba_arr = career_model.predict_proba(input_data)[0]
                classes = list(career_model.classes_)

                for cls, p in zip(classes, proba_arr):
                    probabilities.append({
                        "career_field": str(cls),
                        "percentage": round(float(p) * 100, 1)
                    })

                probabilities.sort(key=lambda x: x["percentage"], reverse=True)
            except Exception as e_proba:
                print(f"[WARN] Gagal menghitung distribusi probabilitas: {e_proba}")

        return jsonify({
            "success": True,
            "prediction": prediction_name,
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
