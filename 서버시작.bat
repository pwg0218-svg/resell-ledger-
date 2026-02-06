@echo off
chcp 65001 > nul
title 리셀 관리대장 서버 (닫지 마세요!)

echo.
echo ========================================
echo    리셀 관리대장 서버
echo ========================================
echo.
echo    이 창을 닫으면 서버가 종료됩니다!
echo.
echo ========================================
echo.

cd /d "%~dp0"

echo [1/2] 백엔드 서버 시작...
start /B cmd /c "node server/index.js"

timeout /t 2 /nobreak > nul

echo [2/2] 프론트엔드 서버 시작...
echo.
echo ----------------------------------------
echo   접속 주소: http://localhost:5173
echo ----------------------------------------
echo.

call npm run dev
