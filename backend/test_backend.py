import sys
import os

sys.path.insert(0, os.path.dirname(__file__))

from app import app, kol_sesuai, kol_minat

client = app.test_client()

def test_health_check():
    res = client.get('/')
    print("Health check status:", res.status_code)
    data = res.get_json()
    print("Health check response:", data)
    assert res.status_code == 200
    assert data['model_loaded'] is True
    assert data['status'] == 'online'
    assert len(data['career_classes']) == 11

def test_predict_dummy1_iot():
    dummy1 = {'Q1': 'Teknik Komputer'}
    for k in kol_sesuai:
        dummy1[k] = 4
    for k in kol_minat:
        dummy1[k] = 3
    dummy1['Q22'] = 5
    dummy1['Q23'] = 5
    dummy1['Q24'] = 5

    res = client.post('/predict', json=dummy1)
    print("Dummy 1 status:", res.status_code)
    data = res.get_json()
    print("Dummy 1 prediction:", data.get('prediction'))
    print("Dummy 1 key:", data.get('prediction_key'))
    print("Dummy 1 top probabilities:")
    for p in data.get('probabilities', [])[:3]:
        print(f"  - {p['career_field']} ({p['key']}): {p['percentage']}%")

    assert res.status_code == 200
    assert data['prediction'] == 'IoT Developer/Engineer'
    assert data['prediction_key'] == 'io'
    assert data['probabilities'][0]['career_field'] == 'IoT Developer/Engineer'
    assert data['probabilities'][0]['percentage'] == 58.7

def test_predict_dummy2_uiux():
    dummy2 = {'Q1': 'Sistem Informasi'}
    for k in kol_sesuai:
        dummy2[k] = 4
    for k in kol_minat:
        dummy2[k] = 3
    dummy2['Q16'] = 5
    dummy2['Q17'] = 5
    dummy2['Q18'] = 5

    res = client.post('/predict', json=dummy2)
    print("Dummy 2 status:", res.status_code)
    data = res.get_json()
    print("Dummy 2 prediction:", data.get('prediction'))
    print("Dummy 2 key:", data.get('prediction_key'))
    print("Dummy 2 top probabilities:")
    for p in data.get('probabilities', [])[:3]:
        print(f"  - {p['career_field']} ({p['key']}): {p['percentage']}%")

    assert res.status_code == 200
    assert data['prediction'] == 'UI/UX Designer'
    assert data['prediction_key'] == 'ux'
    assert data['probabilities'][0]['career_field'] == 'UI/UX Designer'
    assert data['probabilities'][0]['percentage'] == 72.1

def test_missing_question():
    res = client.post('/predict', json={'Q1': 'Informatika', 'Q2': 3})
    assert res.status_code == 400
    data = res.get_json()
    assert 'belum diisi' in data['error']
    print("Missing question test passed:", data['error'][:60], "...")

def test_invalid_prodi():
    dummy = {'Q1': 'Biologi'}
    for i in range(2, 32):
        dummy[f'Q{i}'] = 3
    res = client.post('/predict', json=dummy)
    assert res.status_code == 400
    data = res.get_json()
    assert 'tidak valid' in data['error']
    print("Invalid prodi test passed:", data['error'])

def test_invalid_scale():
    dummy = {'Q1': 'Informatika'}
    for i in range(2, 32):
        dummy[f'Q{i}'] = 3
    dummy['Q5'] = 99
    res = client.post('/predict', json=dummy)
    assert res.status_code == 400
    data = res.get_json()
    assert 'rentang skala 1 hingga 5' in data['error']
    print("Invalid scale test passed:", data['error'])

def test_invalid_bool():
    dummy = {'Q1': 'Informatika'}
    for i in range(2, 32):
        dummy[f'Q{i}'] = 3
    dummy['Q5'] = True
    res = client.post('/predict', json=dummy)
    assert res.status_code == 400
    data = res.get_json()
    assert 'tidak valid' in data['error']
    print("Invalid bool test passed:", data['error'])

def test_text_scales():
    dummy = {'Q1': 'Informatika'}
    for k in kol_sesuai:
        dummy[k] = 'Sangat Sesuai'
    for k in kol_minat:
        dummy[k] = 'Biasa Saja'
    res = client.post('/predict', json=dummy)
    assert res.status_code == 200
    data = res.get_json()
    assert data['success'] is True
    print("Text scale test passed. Prediction:", data['prediction'])

if __name__ == '__main__':
    test_health_check()
    test_predict_dummy1_iot()
    test_predict_dummy2_uiux()
    test_missing_question()
    test_invalid_prodi()
    test_invalid_scale()
    test_invalid_bool()
    test_text_scales()
    print("\n>>> ALL BACKEND TESTS PASSED SUCCESSFULLY! <<<")

