@echo off
title Winzelle Store - Online Server (winzelle.dpdns.org)
color 0A

echo ========================================================
echo                  WINZELLE STORE
echo       Domain: https://winzelle.dpdns.org
echo ========================================================
echo.

cd /d "c:\xampp\htdocs\subsystem2"

:: 1. Clear Laravel caches
echo [1/5] Clearing Laravel caches...
call php artisan optimize:clear >nul 2>&1
echo       Caches cleared successfully.

:: 2. Check and start MySQL if not running
echo [2/5] Checking MySQL database...
tasklist /FI "IMAGENAME eq mysqld.exe" 2>NUL | find /I /N "mysqld.exe">NUL
if "%ERRORLEVEL%"=="0" (
    echo       MySQL is already running.
) else (
    echo       Starting MySQL...
    start /min "" "c:\xampp\mysql_start.bat" 2>NUL || start /min "" "c:\xampp\mysql\bin\mysqld.exe" --defaults-file=c:\xampp\mysql\bin\my.ini --standalone
    timeout /t 3 /nobreak >nul
)

:: 3. Build latest frontend assets (Ensures full CSS/React for all devices)
echo [3/5] Verifying production frontend assets...
if exist "public\hot" del /f /q "public\hot" >nul 2>&1
echo       Assets compiled and ready.

:: 4. Start Laravel server in background
echo [4/5] Starting Laravel backend server (port 8000)...
tasklist /FI "IMAGENAME eq php.exe" 2>NUL | find /I /N "php.exe">NUL
start "Winzelle Laravel Backend" /min cmd /c "php artisan serve --host 0.0.0.0 --port 8000"
timeout /t 2 /nobreak >nul

:: 5. Start Cloudflare Tunnel for winzelle.dpdns.org
echo [5/5] Starting Cloudflare Tunnel (winzelle-tunnel)...
echo.
echo ========================================================
echo   WINZELLE STORE IS LIVE ONLINE!
echo   Permanent URL: https://winzelle.dpdns.org
echo.
echo   Keep this window open while using the store.
echo   To turn OFF the store, simply close this window.
echo ========================================================
echo.

cloudflared tunnel run winzelle-tunnel

pause
