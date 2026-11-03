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

PORT="${FIXCAN_PORT:-8081}"

cat <<'EOF'

 ============================================================
   FixCan 1.0  -  Abrir la app en tu celular
 ============================================================

  Requisitos:
    - Node.js 20 o superior en este equipo.
    - Expo Go instalado en el celular (App Store / Play Store).

  Al continuar se levanta el servidor de Expo y se abre una
  IMAGEN con un QR grande en la pantalla. Escanealo desde
  Expo Go (Projects -> Scan QR code) o escribe la URL a mano
  en Projects -> Enter URL manually.

  Modo 1 (LAN): celular y PC en la MISMA red Wi-Fi.
  Modo 2 (Tunnel): funciona en redes distintas, usa ngrok.

EOF

if ! command -v node >/dev/null 2>&1; then
  echo "  [ERROR] Node.js no esta instalado. Descargalo en https://nodejs.org"
  exit 1
fi

if [ ! -d "node_modules" ]; then
  echo "  Instalando dependencias por primera vez..."
  npm install || { echo "  [ERROR] Fallo npm install."; exit 1; }
fi

printf '  Modo de conexion:\n    1) LAN     - mismo Wi-Fi (rapido, recomendado)\n    2) Tunnel  - redes distintas (ngrok anonimo, sin cuenta)\n\n  Opcion [1/2]: '
read -r option
echo

MODE="lan"
EXPO_ARGS=(--lan)

if [ "$option" = "2" ]; then
  MODE="tunnel"
  EXPO_ARGS=(--tunnel ngrok)
fi

echo "  Iniciando Expo (puerto ${PORT})..."
echo "  El QR grande se abrira automaticamente cuando el servidor responda."
echo

node scripts/mobile-qr.mjs "$MODE" "$PORT" FixCan-QR.png &
QR_PID=$!
trap 'kill "$QR_PID" 2>/dev/null' EXIT INT TERM

npx expo start "${EXPO_ARGS[@]}" --port "$PORT"

echo
echo "  El servidor se detuvo."
