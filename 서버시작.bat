@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo ==========================================
echo    🚀 리셀 관리대장 서버를 시작합니다
echo ==========================================

:: 1. 백엔드 서버 실행
echo [1/4] 백엔드 데이터 서버 실행 중...
start "Backend-Server" cmd /k "node server/index.js"

:: 2. 프론트엔드 서버 실행
echo [2/3] 프론트엔드 웹 서버 실행 중...
start "Frontend-Web" cmd /k "npm run dev -- --host"

:: 3. (터널링 제거 - 로컬 접속 권장)
echo [3/3] 브라우저 실행 준비 중...

:: 4. 크롬 브라우저로 실행
echo [3/3] 크롬 브라우저로 프로그램을 엽니다...
timeout /t 5 >nul
start chrome "http://localhost:5173"

echo.
echo ------------------------------------------
echo 모든 실행 명령을 완료했습니다.
echo 크롬 창이 뜨면 바로 사용 가능합니다.
echo.
echo ※ 검은색 서버 창 2개는 절대로 닫지 마세요!
echo ------------------------------------------
echo.
pause
