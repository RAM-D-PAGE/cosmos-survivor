@echo off
echo ===================================
echo   COSMOS SURVIVOR - GIT PUSH
echo ===================================
echo.

cd /d "%~dp0"

echo [1/4] Initializing git (if needed)...
git init

echo.
echo [2/4] Adding all files...
git add .

echo.
echo [3/4] Creating commit...
set /p COMMIT_MSG="Enter commit message : "
git commit -m "%COMMIT_MSG%"

echo.
echo [4/4] Pushing to origin...
git push -u origin main

echo.
echo ===================================
echo   Done! Check your GitHub repo.
echo ===================================
pause
