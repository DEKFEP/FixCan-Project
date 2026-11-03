#!/usr/bin/env node
/**
 * Waits for the Expo dev server, detects the real URL it is serving
 * (LAN IP or ngrok tunnel host) and renders a large PNG QR code so the
 * terminal QR is no longer required.
 *
 * Usage: node scripts/mobile-qr.mjs <lan|tunnel> [port] [output.png]
 * Set FIXCAN_QR_NO_OPEN=1 to skip opening the image (useful for tests).
 */
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';

import QRCode from 'qrcode';

const mode = (process.argv[2] ?? 'lan').toLowerCase();
const port = process.argv[3] ?? '8081';
const outFile = path.resolve(process.argv[4] ?? 'FixCan-QR.png');
const timeoutMs = Number(process.env.FIXCAN_QR_TIMEOUT_MS ?? 180000);
const startedAt = Date.now();

function preferredLanAddress() {
  const candidates = [];

  for (const [name, addresses] of Object.entries(os.networkInterfaces())) {
    for (const address of addresses ?? []) {
      if (address.family !== 'IPv4' || address.internal) {
        continue;
      }
      candidates.push({ name, address: address.address });
    }
  }

  const rank = (name) => {
    if (/^(wl|wlan|wifi|en|eth)/i.test(name)) return 0;
    if (/^(docker|br-|veth|virbr|vmnet|vbox|tun|tap|utun)/i.test(name)) return 2;
    return 1;
  };

  candidates.sort((a, b) => rank(a.name) - rank(b.name));
  return candidates[0]?.address ?? null;
}

async function readHostUri() {
  try {
    const response = await fetch(`http://localhost:${port}/`, {
      headers: { 'expo-platform': 'android' },
      signal: AbortSignal.timeout(4000),
    });

    if (!response.ok) {
      return null;
    }

    const manifest = await response.json();
    return (
      manifest?.extra?.expoClient?.hostUri ??
      manifest?.extra?.expoGo?.debuggerHost ??
      null
    );
  } catch {
    return null;
  }
}

async function resolveHost() {
  while (Date.now() - startedAt < timeoutMs) {
    const hostUri = await readHostUri();
    const isLocal = /^(localhost|127\.0\.0\.1)(:|$)/.test(hostUri ?? '');

    if (hostUri && !isLocal) {
      return hostUri;
    }

    if (mode === 'lan' && hostUri) {
      const lan = preferredLanAddress();
      if (lan) {
        return `${lan}:${port}`;
      }
    }

    await new Promise((resolve) => setTimeout(resolve, 1500));
  }

  return null;
}

const host = await resolveHost();

if (!host) {
  console.error(
    `[FixCan] No se pudo detectar la URL de Expo en el puerto ${port} tras ${Math.round(
      timeoutMs / 1000,
    )}s.`,
  );
  process.exit(1);
}

const url = `exp://${host}`;

await QRCode.toFile(outFile, url, {
  width: 900,
  margin: 2,
  errorCorrectionLevel: 'M',
  color: { dark: '#080A0B', light: '#FFFFFF' },
});

console.log('');
console.log('  ============================================================');
console.log('   ESCANEA ESTE QR CON EXPO GO (Projects -> Scan QR code)');
console.log('  ============================================================');
console.log(`   URL:    ${url}`);
console.log(`   Imagen: ${outFile}`);
console.log('');
console.log('   Si el QR no escanea, escribe la URL a mano en Expo Go:');
console.log('   Projects -> Enter URL manually');
console.log('');

if (process.env.FIXCAN_QR_NO_OPEN !== '1') {
  const opener =
    process.platform === 'win32' ? 'cmd' : process.platform === 'darwin' ? 'open' : 'xdg-open';
  const args = process.platform === 'win32' ? ['/c', 'start', '', outFile] : [outFile];
  const child = spawn(opener, args, { detached: true, stdio: 'ignore' });
  child.on('error', (error) => {
    console.warn('[FixCan] No se pudo abrir la imagen del QR:', error.message);
  });
  child.unref();
}
