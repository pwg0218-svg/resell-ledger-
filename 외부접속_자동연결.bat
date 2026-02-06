@echo off
chcp 65001 > nul
cls
echo ========================================================
echo   [ 외부 접속 자동 연결 (Cloudflare Tunnel) ]
echo   이 창을 닫으면 외부 접속이 끊깁니다!
echo   끊겨도 자동으로 다시 연결됩니다.
echo ========================================================
echo.

:loop
echo [%time%] 외부 접속 연결 시도 중...
"%LOCALAPPDATA%\Microsoft\WinGet\Packages\Cloudflare.cloudflared_Microsoft.Winget.Source_8wekyb3d8bbwe\cloudflared.exe" tunnel --url http://localhost:5173
echo.
echo [%time%] 연결이 끊겼습니다. 5초 후 자동 재연결...
timeout /t 5 /nobreak > nul
goto loop
