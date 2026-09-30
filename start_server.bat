@echo off
title VUO CSC Help Desk Local Web Server
echo =================================================================
echo        VUO CSC HELP DESK - LOCAL WEB SERVER LAUNCHER
echo =================================================================
echo.
cd /d "%~dp0"

echo Opening http://localhost:3000 in your browser...
start http://localhost:3000

echo Starting Python Multi-Threaded Server on Port 3000...
echo.
python server.py 3000

if errorlevel 1 (
    echo.
    echo Python failed or not found in PATH. Trying fallback...
    pause
)
