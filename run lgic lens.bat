@echo off
cd "C:\Users\sa\Desktop\logic lens compiler"

start cmd /k "npm run dev"
start cmd /k "node pyright-service.cjs"

echo.
echo Logic Lens Pro started!
echo - Dev server: http://localhost:5173
echo - Pyright service: http://localhost:5000
pause