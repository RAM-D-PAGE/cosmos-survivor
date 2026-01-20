@echo off
echo ===================================
echo   COSMOS SURVIVOR - DEV SERVER
echo ===================================
echo.

cd /d "%~dp0"

echo Starting development server...
echo Press Ctrl+C to stop.
echo.

call npm run dev

pause
