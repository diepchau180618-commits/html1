@echo off
chcp 65001 > nul
title Chay Web Jollibee Showcase & BeeBot AI Backend

echo ======================================================
echo    🍔 JOLLIBEE SHOWCASE & BEBOT AI BACKEND 🐝
echo ======================================================
echo.
echo Đang kiểm tra môi trường chạy...

:: Kiểm tra Python
where python >nul 2>nul
if %errorlevel% equ 0 (
    echo [1/3] Đã tìm thấy Python.
    echo [2/3] Đang khởi chạy Backend Flask & Web App tại http://localhost:5000...
    echo.
    echo 💡 Gợi ý: API Key được bảo vệ an toàn trong file .env
    echo Bấm Ctrl + C trong cửa sổ này nếu muốn dừng server.
    echo.
    timeout /t 2 >nul
    start "" http://localhost:5000
    python backend\app.py
    goto end
)

:: Kiểm tra Node / npx
where npx >nul 2>nul
if %errorlevel% equ 0 (
    echo [1/2] Đã tìm thấy Node.js. Đang khởi chạy tại http://localhost:5500...
    start "" http://localhost:5500
    npx -y serve -p 5500 .
    goto end
)

:: Mở trực tiếp index.html nếu không có Python
echo [Thông báo] Máy tính chưa cài sẵn Python.
echo Đang mở trực tiếp tệp index.html...
start "" "%~dp0index.html"

:end
pause
