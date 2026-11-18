@echo off
cd /d "%~dp0"
echo Menjalankan Backend Flask Rekomendasi Karir Mahasiswa...
if exist "venv\Scripts\python.exe" (
    venv\Scripts\python.exe app.py
) else if exist "%LOCALAPPDATA%\Programs\Python\Python313\python.exe" (
    "%LOCALAPPDATA%\Programs\Python\Python313\python.exe" app.py
) else (
    python app.py
)
pause

