@echo off
chcp 65001 > nul
title 관리대장 업데이트 및 배포

echo.
echo ========================================
echo    [관리대장] 업데이트 배포
echo ========================================
echo.
echo    수정한 내용을 인터넷(Vercel)에 반영합니다.
echo    잠시만 기다려주세요...
echo.

cd /d "%~dp0"

echo [1/3] 변경 사항 확인 중...
git add .

echo [2/3] 업데이트 기록 저장 중...
set "timestamp=%date% %time%"
git commit -m "Update: %timestamp%"

echo [3/3] 서버(GitHub)로 전송 중...
echo.
git push

if %errorlevel% neq 0 (
    echo.
    echo ❌ 오류가 발생했습니다!
    echo    인터넷 연결을 확인하거나, 화면의 내용을 캡처해서 문의해주세요.
    pause
    exit /b
)

echo.
echo ========================================
echo    ✅ 배포 완료!
echo ========================================
echo.
echo    Vercel에서 자동으로 새 버전을 만들고 있습니다.
echo    약 2분 뒤에 웹사이트에서 새로고침하세요.
echo.
pause
