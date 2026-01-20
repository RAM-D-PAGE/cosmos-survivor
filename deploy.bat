@echo off
echo ===================================
echo   COSMOS SURVIVOR - DEPLOY SCRIPT
echo ===================================
echo.

cd /d "%~dp0"

echo [1/3] Installing dependencies...
call npm install
if errorlevel 1 (
    echo ERROR: npm install failed!
    pause
    exit /b 1
)
echo.

echo [2/3] Building production bundle...
call npm run build
if errorlevel 1 (
    echo ERROR: Build failed!
    pause
    exit /b 1
)
echo.

echo [3/3] Build complete!
echo.
echo ===================================
echo   OUTPUT: ./dist folder
echo ===================================
echo.
echo Deploy the 'dist' folder to your web server.
echo Or run 'npm run preview' to preview locally.
echo.

pause
