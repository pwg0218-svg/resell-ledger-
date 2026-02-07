@echo off
chcp 65001 >nul
echo ==========================================
echo    🚀 리셀 관리대장 서버를 시작합니다
echo ==========================================

:: 1. 백엔드 서버 실행
echo [1/4] 백엔드 데이터 서버 실행 중...
start "Backend-Server" cmd /k "node server/index.js"

:: 2. 프론트엔드 서버 실행
echo [2/4] 프론트엔드 웹 서버 실행 중...
start "Frontend-Web" cmd /k "npm run dev"

:: 3. 외부 접속 터널 실행 (모바일 접속용)
echo [3/4] 외부 접속 주소 생성 중...
echo.
echo ⚠️ [중요] 핸드폰에서 접속할 때 '기능'을 사용하려면 
echo    터미널 창에 나오는 URL 주소로 접속해 주세요.
echo    (패스워드 입력창이 뜨면 컴퓨터의 IP: 172.30.1.79 를 입력하면 됩니다)
echo.
start "External-Tunnel" cmd /k "npx localtunnel --port 5173"

:: 4. 크롬 브라우저로 실행
echo [4/4] 크롬 브라우저로 프로그램을 엽니다...
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
