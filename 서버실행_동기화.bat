@echo off
chcp 65001 > nul
cls
echo ========================================================
echo   [ 리셀 관리대장 - 데이터 동기화 서버 ]
echo.
echo   이 창을 닫으면 서버가 종료됩니다!
echo ========================================================
echo.

:: Node.js 설치 확인
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [오류] Node.js가 설치되지 않았습니다!
    echo https://nodejs.org 에서 LTS 버전을 설치해주세요.
    pause
    exit
)

:: 의존성 설치 확인
if not exist "node_modules" (
    echo [1/3] 필요한 프로그램 설치 중...
    call npm install
)

:: 백엔드 서버 시작 (백그라운드)
echo [2/3] 데이터 서버 시작 중...
start "데이터 서버" /min cmd /c "node server/index.js"

:: 잠시 대기 (서버 시작 시간)
timeout /t 2 /nobreak > nul

:: 프론트엔드 서버 시작
echo [3/3] 웹 서버 시작 중...
echo.
echo ========================================================
echo   ✅ 서버가 시작되었습니다!
echo.
echo   아래 Network 주소를 핸드폰에서 접속하세요.
echo ========================================================
echo.
call npm run dev -- --host
