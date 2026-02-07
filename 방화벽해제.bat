@echo off
:: BatchGotAdmin
:-------------------------------------
REM  --> 권한 확인 (관리자 권한 없으면 요청)
    IF "%PROCESSOR_ARCHITECTURE%" EQU "amd64" (
>nul 2>&1 "%SYSTEMROOT%\SysWOW64\cacls.exe" "%SYSTEMROOT%\SysWOW64\config\system"
) ELSE (
>nul 2>&1 "%SYSTEMROOT%\system32\cacls.exe" "%SYSTEMROOT%\system32\config\system"
)

REM --> 권한이 없으면 UAC 요청 창 띄우기
if '%errorlevel%' NEQ '0' (
    echo 관리자 권한을 요청합니다...
    goto UACPrompt
) else ( goto gotAdmin )

:UACPrompt
    echo Set UAC = CreateObject^("Shell.Application"^) > "%temp%\getadmin.vbs"
    set params= %*
    echo UAC.ShellExecute "cmd.exe", "/c ""%~s0"" %params:"=""%", "", "runas", 1 >> "%temp%\getadmin.vbs"

    "%temp%\getadmin.vbs"
    del "%temp%\getadmin.vbs"
    exit /B

:gotAdmin
    pushd "%CD%"
    CD /D "%~dp0"
:--------------------------------------

echo ========================================================
echo  리셀 판매대장 방화벽 잠금 해제 중...
echo ========================================================
echo.

echo 1. 프론트엔드 포트 (5173) 개방 중...
netsh advfirewall firewall delete rule name="Allow Vite (Resell Ledger)" >nul
netsh advfirewall firewall add rule name="Allow Vite (Resell Ledger)" dir=in action=allow protocol=TCP localport=5173 profile=any

echo 2. 백엔드 포트 (3001) 개방 중...
netsh advfirewall firewall delete rule name="Allow API (Resell Ledger)" >nul
netsh advfirewall firewall add rule name="Allow API (Resell Ledger)" dir=in action=allow protocol=TCP localport=3001 profile=any

echo.
echo ========================================================
echo  [성공] 방화벽이 해제되었습니다!
echo  이제 핸드폰에서 다시 접속해 보세요.
echo ========================================================
echo.
pause
