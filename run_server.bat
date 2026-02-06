@echo off
echo [INFO] 리셀 관리대장 서버를 시작합니다...
echo [INFO] Node.js가 설치되어 있어야 합니다.

:: node_modules 확인
if not exist "node_modules" (
    echo [INFO] 필요한 프로그램을 설치 중입니다 (최초 1회)...
    call npm install
)

:: 빌드 폴더 확인
if not exist "dist" (
    echo [INFO] 웹사이트를 빌드 중입니다...
    call npm run build
)

echo.
echo ========================================================
echo   [서버 실행 중]
echo   이 창을 끄지 마세요.
echo.
echo   접속 주소(Network)를 확인하여 핸드폰에서 접속하세요.
echo ========================================================
echo.

:: 서버 실행 (외부 접속 허용)
call npx serve dist -l 5173

pause
