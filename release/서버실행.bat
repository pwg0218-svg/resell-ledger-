@echo off
chcp 65001
cls
echo ========================================================
echo   [ 리셀 관리대장 - 미니 PC 서버 실행 ]
echo.
echo   1. 이 창을 닫으면 서버가 종료됩니다.
echo   2. 핸드폰에서 아래 'Network' 주소로 접속하세요.
echo ========================================================
echo.

:: Node.js 설치 확인
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [오류] Node.js가 설치되지 않았습니다!
    echo 네이버에 'Node.js 다운로드' 검색해서 설치해주세요.
    pause
    exit
)

:: 서버 실행 (-y 옵션으로 serve 패키지 자동 설치)
call npx -y serve dist -l 5173

pause
