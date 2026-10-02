@echo off
title Winzelle System - Online Launcher
color 0A

echo ========================================================
echo       STARTING WINZELLE SYSTEM + CLOUD TUNNEL
echo ========================================================
echo.

cd /d "c:\xampp\htdocs\subsystem2"

:: Check and start MySQL if not running
echo [1/3] Checking MySQL database...
tasklist /FI "IMAGENAME eq mysqld.exe" 2>NUL | find /I /N "mysqld.exe">NUL
if "%ERRORLEVEL%"=="0" (
    echo       MySQL is already running.
) else (
    echo       Starting MySQL...
    start /min "" "c:\xampp\mysql_start.bat" 2>NUL || start /min "" "c:\xampp\mysql\bin\mysqld.exe" --defaults-file=c:\xampp\mysql\bin\my.ini --standalone
    timeout /t 3 /nobreak >nul
)

:: Start Laravel server in separate minimized window
echo [2/3] Starting Laravel backend server (port 8000)...
start "Winzelle Laravel Backend" /min cmd /c "php artisan serve --host 0.0.0.0 --port 8000"
timeout /t 2 /nobreak >nul

:: Start Cloudflare Tunnel
echo [3/3] Starting Cloudflare Tunnel...
echo.
echo ========================================================
echo   SYSTEM IS NOW ONLINE!
echo   Keep this window open to stay connected.
echo   To turn OFF the online site, simply close this window.
echo ========================================================
echo.

"C:\Program Files (x86)\cloudflared\cloudflared.exe" tunnel --url http://localhost:8000

pause
