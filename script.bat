@echo off
cd /d"%~dp0"

cd src
start /b cmd /c "call venv\Scripts\activate && pip install -r ..\requirements.txt && uvicorn main.main:app --reload"

cd ../view
npm run dev
