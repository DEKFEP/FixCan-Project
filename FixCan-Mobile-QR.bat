@echo off
setlocal EnableExtensions EnableDelayedExpansion
chcp 65001 >nul
title FixCan 1.0 - Abrir en el celular
cd /d "%~dp0"

echo.
echo  ============================================================
echo    FixCan 1.0  -  Abrir la app en tu celular
echo  ============================================================
echo.
echo   Requisitos:
echo     - Node.js 20 o superior instalado en este PC.
echo     - Expo Go instalado en el celular (App Store / Play Store).
echo.
echo   Al continuar se levanta el servidor de Expo y aparece un
echo   CODIGO QR en esta ventana. Escanealo con la camara del
echo   celular (Android) o con la app Camara (iPhone) para abrir
echo   FixCan en Expo Go.
echo.
echo   El celular y este PC deben estar en la MISMA red Wi-Fi.
echo   Si no puedes conectarte, elige la opcion 2 (Tunnel).
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
echo    2) Tunnel  - redes distintas (mas lento, usa ngrok)
echo.
choice /c 12 /n /m "  Opcion [1/2]: "
if errorlevel 2 goto tunnel
goto lan

:lan
echo.
echo  Iniciando Expo en modo LAN...
echo  Escanea el QR que aparece abajo con Expo Go.
echo.
call npx expo start --lan
goto finish

:tunnel
echo.
echo  Iniciando Expo en modo Tunnel...
echo  Usa ngrok anonimo: no necesita cuenta de Expo.
echo  Escanea el QR que aparece abajo con Expo Go.
echo.
call npx expo start --tunnel ngrok
goto finish

:finish
echo.
echo  El servidor se detuvo.
pause
endlocal
