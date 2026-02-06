@echo off
chcp 65001 > nul
echo ========================================================
echo   [ 리셀 관리대장 - 업데이트 스크립트 ]
echo   메인 PC에서 이 파일을 실행하면 서버용 파일이 업데이트됩니다.
echo ========================================================
echo.

:: 빌드
echo [1/2] 웹사이트 빌드 중...
call npm run build

:: release 폴더 업데이트
echo [2/2] 서버 배포 파일 업데이트 중...
if exist "release\dist" rmdir /s /q "release\dist"
robocopy dist release\dist /E /NFL /NDL /NJH /NJS /nc /ns /np > nul

echo.
echo ========================================================
echo   ✅ 업데이트 완료!
echo.
echo   이제 release 폴더를 서버 PC에 복사하세요.
echo   (USB로 복사하거나 네트워크 공유 사용)
echo ========================================================
pause
