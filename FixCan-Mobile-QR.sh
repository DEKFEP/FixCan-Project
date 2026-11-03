#!/usr/bin/env bash
# FixCan 1.0 - Abrir la app en el celular (Linux / macOS)
set -u

cd "$(dirname "$0")" || exit 1
if [ -f "fixcan/package.json" ]; then cd fixcan || exit 1; fi
if [ -f "FixCan-Project/package.json" ]; then cd FixCan-Project || exit 1; fi

if [ ! -f "package.json" ]; then
  echo "  [ERROR] No se encontro el proyecto FixCan."
  echo "  Coloca este archivo junto a la carpeta del proyecto o dentro de ella."
  exit 1
fi

cat <<'EOF'

 ============================================================
   FixCan 1.0  -  Abrir la app en tu celular
 ============================================================

  Requisitos:
    - Node.js 20 o superior en este equipo.
    - Expo Go instalado en el celular (App Store / Play Store).

  Al continuar se levanta el servidor de Expo y aparece un
  CODIGO QR en esta terminal. Escanealo con la camara del
  celular (Android) o con la app Camara (iPhone) para abrir
  FixCan en Expo Go.

  El celular y este equipo deben estar en la MISMA red Wi-Fi.
  Si no puedes conectarte, elige la opcion 2 (Tunnel).

EOF

if ! command -v node >/dev/null 2>&1; then
  echo "  [ERROR] Node.js no esta instalado. Descargalo en https://nodejs.org"
  exit 1
fi

if [ ! -d "node_modules" ]; then
  echo "  Instalando dependencias por primera vez..."
  npm install || { echo "  [ERROR] Fallo npm install."; exit 1; }
fi

printf '  Modo de conexion:\n    1) LAN     - mismo Wi-Fi (rapido, recomendado)\n    2) Tunnel  - redes distintas (mas lento, usa ngrok)\n\n  Opcion [1/2]: '
read -r option
echo

case "$option" in
  2)
    echo "  Iniciando Expo en modo Tunnel..."
    echo "  Usa ngrok anonimo: no necesita cuenta de Expo."
    echo "  Escanea el QR que aparece abajo con Expo Go."
    echo
    npx expo start --tunnel ngrok
    ;;
  *)
    echo "  Iniciando Expo en modo LAN..."
    echo "  Escanea el QR que aparece abajo con Expo Go."
    echo
    npx expo start --lan
    ;;
esac

echo
echo "  El servidor se detuvo."
