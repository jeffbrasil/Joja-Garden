@echo off
cd /d"%~dp0"

cd src
start /b cmd /c "call venv\Scripts\activate && uvicorn main.main:app --reload"

cd ../view
npm run dev
