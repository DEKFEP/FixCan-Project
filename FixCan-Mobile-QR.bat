@echo off
setlocal EnableExtensions EnableDelayedExpansion
chcp 65001 >nul
title FixCan 1.0 - Abrir en el celular
cd /d "%~dp0"
if exist "%~dp0fixcan\package.json" cd /d "%~dp0fixcan"
if exist "%~dp0FixCan-Project\package.json" cd /d "%~dp0FixCan-Project"
if not exist "package.json" (
  echo  [ERROR] No se encontro el proyecto FixCan.
  echo  Coloca este archivo junto a la carpeta del proyecto o dentro de ella.
  echo.
  pause
  exit /b 1
)

if "%FIXCAN_PORT%"=="" (set PORT=8081) else (set PORT=%FIXCAN_PORT%)

echo.
echo  ============================================================
echo    FixCan 1.0  -  Abrir la app en tu celular
echo  ============================================================
echo.
echo   Requisitos:
echo     - Node.js 20 o superior instalado en este PC.
echo     - Expo Go instalado en el celular (App Store / Play Store).
echo.
echo   Al continuar se levanta el servidor de Expo y se abre una
echo   IMAGEN con un QR grande en la pantalla. Escanealo desde
echo   Expo Go (Projects -^> Scan QR code) o escribe la URL a mano
echo   en Projects -^> Enter URL manually.
echo.
echo   Modo 1 (LAN): celular y PC en la MISMA red Wi-Fi.
echo   Modo 2 (Tunnel): funciona en redes distintas, usa ngrok.
echo.

where node >nul 2>&1
if errorlevel 1 (
  echo  [ERROR] Node.js no esta instalado.
  echo  Descargalo en https://nodejs.org y vuelve a ejecutar este archivo.
  echo.
  pause
  exit /b 1
)

if not exist "node_modules" (
  echo  Instalando dependencias por primera vez...
  echo.
  call npm install
  if errorlevel 1 (
    echo.
    echo  [ERROR] Fallo npm install. Revisa tu conexion e intentalo de nuevo.
    pause
    exit /b 1
  )
)

echo.
echo  Selecciona el modo de conexion:
echo    1) LAN     - mismo Wi-Fi (mas rapido, recomendado)
echo    2) Tunnel  - redes distintas (ngrok anonimo, sin cuenta)
echo.
choice /c 12 /n /m "  Opcion [1/2]: "
if errorlevel 2 goto tunnel

:lan
set MODE=lan
set EXPO_ARGS=--lan
goto start

:tunnel
set MODE=tunnel
set EXPO_ARGS=--tunnel ngrok
goto start

:start
echo.
echo  Iniciando Expo (puerto %PORT%)...
echo  El QR grande se abrira automaticamente cuando el servidor responda.
echo.
start "FixCan QR" /min cmd /c "node scripts\mobile-qr.mjs %MODE% %PORT% FixCan-QR.png"
call npx expo start %EXPO_ARGS% --port %PORT%
echo.
echo  El servidor se detuvo.
pause
endlocal
