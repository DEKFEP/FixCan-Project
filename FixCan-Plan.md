# FixCan — Plan de acción

> Hackathon global de Meta · App móvil de diagnóstico de hardware por foto
> Decisiones cerradas: **tercer tab = Assistant** · **UI en inglés por defecto, con selector EN/ES en Settings**
> Estado actual: `/home/decker/Work` está vacío (solo `tries/`). Se arranca desde cero.

---

## 1. Resumen ejecutivo

FixCan convierte la cámara del teléfono en un técnico de hardware: el usuario fotografía un componente, Llama multimodal lo identifica (marca, modelo, specs), evalúa daños visibles y devuelve un plan de reparación. El historial guarda cada escaneo y el **Assistant** permite conversar sobre el último componente o sobre cualquier escaneo pasado.

El loop del producto es:

**Scan → Identify → Diagnose → Repair → Ask → Save**

La propuesta de Cursor es correcta en lo esencial (tabs, detalle con daño integrado, Asistente como tercer tab). Este plan corrige y completa lo que faltaba: persistencia, manejo de imágenes, contrato estructurado de IA, modo demo offline, i18n real, auth, seguridad de API keys, disclaimers y plan de demo para jueces.

### Cambios respecto al plan de Cursor

| Punto | Plan de Cursor | Decisión final |
|---|---|---|
| Tercer tab | Asistente / Guías / Piezas | **Assistant** (chat con Llama, contexto del escaneo) |
| Idioma | Español | **Inglés por defecto**, selector EN/ES persistido; la IA responde en el idioma activo |
| Auth | "Auth simple" sin definir | **Auth liviana**: perfil local + opción Supabase magic link / Facebook Login si sobra tiempo |
| Datos | "Locales primero" | **SQLite + filesystem** para imágenes; Supabase opcional para sync |
| IA | "Llama multimodal" sin contrato | **JSON schema estricto** + confidence + fallback mock |
| Demo | No contemplada | **Modo mock determinista** para el pitch, con datos sembrados |
| Recomendaciones | Solo dentro del detalle | Correcto: el detalle es la fuente; el Assistant es el canal conversacional |

---

## 2. Alcance

### MVP (obligatorio para competir)

1. **Onboarding / Auth liviana** — pantalla de bienvenida, "Continue with email" (mock o magic link), "Continue with Facebook" opcional.
2. **History** — lista de escaneos con thumbnail, nombre, fecha, badge de daño; búsqueda y filtros; estado vacío.
3. **Camera** — full-screen, permisos, flash, flip, galería, shutter central, preview, estado "Analyzing…".
4. **Scan Detail** — foto, marca/modelo/categoría, confidence, specs, descripción, alerta de daño con severidad, plan de reparación paso a paso, herramientas, advertencias, acciones.
5. **Assistant** — chat con Llama, contexto del escaneo activo, streaming, sugerencias, disclaimer.
6. **Profile & Settings** — datos del usuario, selector EN/ES, tema, privacidad (borrar historial), acerca de, sign out.
7. **i18n EN/ES** — sin strings hardcodeados; inglés por defecto.
8. **Persistencia** — los escaneos sobreviven al cierre de la app; imágenes en almacenamiento local.
9. **Modo mock** — app 100% navegable sin red/API para ensayar y para el pitch.

### Stretch (solo si el MVP está cerrado)

- Facebook/Instagram Login real.
- Sync en la nube + compartir escaneo por link.
- "Pieces" (recambios compatibles) como CTA dentro del detalle.
- Historial de conversaciones del Assistant.
- Exportar reporte PDF.
- Detección de número de serie / OCR.
- Comparador de precios de reparación.

### Fuera de alcance

- Reparación real, marketplace, pagos, multi-dispositivo, web app, backend complejo.

---

## 3. Stack y arquitectura

| Capa | Elección | Motivo |
|---|---|---|
| Framework | **Expo SDK (última estable) + React Native + TypeScript strict** | Velocidad, cámara nativa, OTA para el demo |
| Navegación | **Expo Router** (file-based) | Tabs + modales + deep links simples |
| Estado | **Zustand** + persistencia | Menos boilerplate que Redux |
| DB local | **expo-sqlite** | Historial consultable, migraciones simples |
| Imágenes | **expo-image-picker / expo-camera**, `expo-file-system`, `expo-image-manipulator` | Captura, compresión y cache local |
| Auth | **Supabase Auth** (magic link) o perfil local mock | Login creíble sin backend propio |
| IA | **Llama multimodal (Meta)** vía API, con proxy serverless | Identificación + daño + reparación |
| Proxy | **Cloudflare Worker / Vercel Function** | Nunca exponer la API key en el bundle |
| i18n | **i18next + react-i18next + expo-localization** | EN/ES, persistencia, interpolación |
| UI | Design system propio (tokens) + `expo-google-fonts` | Consistencia y velocidad |
| Animación | **Reanimated 3** + `expo-haptics` | Feedback de cámara y transiciones |
| Calidad | ESLint, Prettier, `expo-doctor`, TypeScript strict | Evitar bugs de último día |

### Flujo de datos

```
Camera / Gallery
   → comprimir imagen (max ~1280px, JPEG 0.8)
   → guardar archivo local (documentDirectory/scans/{id}.jpg)
   → INSERT scan (status=analyzing)
   → POST /analyze { image, locale }
        → proxy → Llama multimodal (JSON schema)
   → UPDATE scan (status=complete, component, damage, repair)
   → navegar a Detail
   → Assistant lee el scan por id desde SQLite
```

Si la API falla: `status=failed`, botón **Retry**, y opción de usar **demo result** (modo juez).

### Modo dual de IA

```
EXPO_PUBLIC_AI_MODE=mock | live
```

- `mock`: responde con fixtures realistas por categoría (GPU con coil whine, laptop con batería hinchada, etc.) tras 1.5 s simulados. **Siempre disponible**, aunque haya red.
- `live`: llama al proxy. Timeout 20 s, 1 reintento, validación de JSON.

Esto protege el demo en vivo: si el Wi-Fi del venue falla, la app sigue funcionando.

---

## 4. Pantallas y UX

### 4.1 Auth / Welcome

- Logo + tagline: *"Point. Scan. Fix."*
- `Continue with email`, `Continue with Facebook`, `Continue as guest`.
- Guest crea perfil local; se puede migrar después.
- Sin fricción: el juez debe entrar en <10 s.

### 4.2 History (tab 1)

- Header: "History" + avatar (→ Profile).
- Buscador y chips: **All / Damaged / Repairable**.
- Cards: thumbnail 1:1, nombre del componente, `brand · model`, fecha relativa, badge de severidad (`Healthy`, `Minor`, `Moderate`, `Severe`).
- Agrupación por fecha (Today, Yesterday, Earlier).
- Empty state: ilustración + "Scan your first component" + CTA a Camera.
- Long-press: delete, share (stretch).
- Pull-to-refresh no aplica (local); sí skeleton loader al cargar.

### 4.3 Camera (tab 2)

- Full-screen dark, estilo Instagram/Snapchat.
- Visor con overlay de encuadre y hint: *"Center the component. Good light helps."*
- Controles: flash, flip, gallery import, shutter grande central, close.
- Post-captura: preview con **Retake** / **Use photo**.
- Al confirmar: overlay "Analyzing…" con pasos animados (*Detecting component → Reading labels → Checking for damage → Building repair plan*), cancelable.
- Permiso denegado: pantalla explicativa con botón a Settings.
- Haptics en shutter y éxito.

### 4.4 Scan Detail

Orden visual:

1. **Hero photo** (zoomable, pinch).
2. **Identity**: nombre, marca · modelo, categoría, chip de confidence (`High confidence` ≥85%, `Likely` 60–84%, `Low confidence` <60%).
3. **Specs**: grid/tabla label→value (VRAM, socket, wattage, capacity…).
4. **Description**: 2–4 frases.
5. **Damage card** (si `damage.detected`):
   - Severidad con color: green/amber/orange/red.
   - Findings con icono, ubicación y confidence.
   - *"Repairable: yes / partially / no / unknown"*.
6. **Repair plan**:
   - Dificultad, tiempo estimado, costo estimado (rango).
   - Herramientas necesarias.
   - Pasos numerados (expandibles).
   - Warnings de seguridad (ej. batería hinchada, condensadores, descarga estática).
   - *When to see a professional*.
7. **CTA**: `Ask Assistant about this` → abre tab Assistant con contexto.
8. **Actions**: Share, Delete, Rescan.

Si no hay daño: card verde *"No visible damage detected"* + tips de mantenimiento.

Disclaimer persistente y discreto: *"Visual inspection only. Not a substitute for professional diagnosis."* (obligatorio por seguridad y credibilidad).

### 4.5 Assistant (tab 3)

- Empty state: "Ask about your last scan" + 3 suggested prompts + selector de escaneo.
- Header con chip del escaneo activo (nombre + thumbnail).
- Chat: burbujas, streaming token a token, markdown básico, code/tablas no necesarios.
- El system prompt incluye el JSON del escaneo + idioma activo.
- Acciones rápidas: "Is it worth repairing?", "What tools do I need?", "Find compatible parts" (stretch).
- Disclaimer: *"AI guidance can be wrong. Verify before repairing."*
- Persistencia de la conversación por scan (stretch; en MVP se puede mantener en memoria).

### 4.6 Profile & Settings

- Avatar, nombre, email, tipo de cuenta.
- **Language**: English / Español (default English, persiste, cambia toda la UI y la IA).
- Appearance: System / Dark / Light (MVP puede ser solo dark).
- Units: Metric / Imperial.
- Data & privacy: Delete all scans, Export data (stretch).
- About: versión, licencias, créditos de Llama.
- Sign out.

### 4.7 Navegación

```
Root
├── (auth)/welcome
└── (tabs)/
    ├── history/index → history/[id]
    ├── scan (camera)
    ├── assistant
    └── profile (modal o stack)
```

El detalle se abre como stack sobre History para permitir volver a la lista y al Assistant.

---

## 5. Modelo de datos

```ts
type ScanCategory =
  | 'gpu' | 'cpu' | 'ram' | 'storage' | 'psu' | 'motherboard'
  | 'cooling' | 'phone_part' | 'laptop_part' | 'other';

type Severity = 'none' | 'minor' | 'moderate' | 'severe';
type Repairability = 'yes' | 'partial' | 'no' | 'unknown';
type Difficulty = 'easy' | 'moderate' | 'hard' | 'professional';

interface Scan {
  id: string;
  createdAt: string;          // ISO
  imageUri: string;           // file:// local
  thumbnailUri?: string;
  status: 'analyzing' | 'complete' | 'failed';
  locale: 'en' | 'es';
  model: string;              // ej. llama-4-maverick
  component: ComponentInfo | null;
  damage: DamageAssessment | null;
  repair: RepairPlan | null;
  error?: string;
}

interface ComponentInfo {
  name: string;
  brand: string;
  model: string;
  category: ScanCategory;
  specs: { label: string; value: string }[];
  description: string;
  confidence: number;         // 0..1
  identifiers?: { serial?: string; partNumber?: string };
}

interface DamageAssessment {
  detected: boolean;
  summary: string;
  severity: Severity;
  findings: {
    type: 'corrosion' | 'crack' | 'burn' | 'bent_pin' | 'missing'
        | 'dust' | 'swelling' | 'wear' | 'other';
    description: string;
    location?: string;
    confidence: number;
  }[];
}

interface RepairPlan {
  repairability: Repairability;
  difficulty: Difficulty;
  estimatedTime?: string;
  estimatedCost?: { min: number; max: number; currency: string };
  tools: string[];
  steps: { title: string; detail: string; safety?: string }[];
  warnings: string[];
  whenToSeekPro: string[];
}
```

Tablas SQLite: `scans`, `chat_messages` (stretch), `settings` (o AsyncStorage). Índices por `createdAt` y `status`.

---

## 6. Contrato de IA

**Endpoint proxy**: `POST /analyze` → `{ imageBase64, locale }` → `ScanResult`.

Reglas del prompt:

- Rol: técnico de hardware senior + inspector visual.
- Responder **solo JSON válido**, sin markdown.
- Si no puede identificar: `confidence < 0.5`, `name: "Unknown component"`, no inventar marca/modelo.
- No afirmar daños que no sean visibles; distinguir "visible" de "possible".
- Specs solo si son deducibles del componente o de su etiqueta; si no, `specs: []`.
- Plan de reparación conservador; incluir warnings de seguridad.
- Idioma de todos los textos = `locale`.
- Temperatura ~0.2, `response_format` JSON schema si el proveedor lo soporta.

**Validación en cliente** con Zod: si falla, reintentar 1 vez; si vuelve a fallar, `status=failed` con Retry.

**Assistant**: system prompt = instrucciones + scan JSON + locale; historial de mensajes; streaming SSE; límite de tokens.

**Privacidad**: avisar que la foto se envía al modelo; no subir imágenes a almacenamiento público; borrar archivos al eliminar un scan.

---

## 7. i18n

- `en` = idioma por defecto (independiente del locale del dispositivo).
- `es` = traducción completa.
- Persistencia en AsyncStorage; se aplica antes del primer render (evitar flash).
- Archivos: `src/i18n/locales/en.json`, `es.json`.
- Reglas:
  - Cero strings hardcodeados en componentes.
  - Fechas/números con `Intl` y el locale activo.
  - La IA recibe `locale` y responde en ese idioma.
  - Specs y taxonomía de daño también traducidas.
- QA: revisar que ningún texto se corte en ES (suele ser 15–20% más largo).

---

## 8. Diseño

- **Estética**: tech, oscura, precisa; acento verde eléctrico/cian; fotos protagonistas.
- **Tokens**: color, spacing 4/8/12/16/24/32, radius 12/20/28, tipografía (Inter o Space Grotesk + system fallback).
- **Componentes base**: `Screen`, `Card`, `Button`, `Chip`, `Badge`, `SectionHeader`, `EmptyState`, `Skeleton`, `Sheet`, `IconButton`.
- **Accesibilidad**: contraste AA, tap targets ≥44 px, labels en iconos, respeto a reduced motion.
- **Estados**: loading, empty, error, offline, permission denied — todos diseñados, no improvisados.

---

## 9. Estructura del repo

```
fixcan/
├── app/
│   ├── (auth)/welcome.tsx
│   ├── (tabs)/
│   │   ├── _layout.tsx
│   │   ├── history/index.tsx
│   │   ├── scan.tsx
│   │   ├── assistant.tsx
│   │   └── profile.tsx
│   ├── history/[id].tsx
│   └── _layout.tsx
├── src/
│   ├── components/
│   ├── features/
│   │   ├── auth/
│   │   ├── scans/
│   │   ├── camera/
│   │   ├── assistant/
│   │   └── settings/
│   ├── db/            # schema, migrations, queries
│   ├── ai/            # client, schemas, prompts, mock fixtures
│   ├── i18n/
│   ├── store/
│   ├── theme/
│   ├── lib/           # image, dates, ids
│   └── types/
├── server/            # proxy serverless (opcional en el mismo repo)
├── assets/
└── docs/
```

---

## 10. Plan de ejecución (hackathon ~48 h)

| Bloque | Horas | Entregable |
|---|---|---|
| **0. Setup** | 0–2 | Expo + TS + Router + ESLint + tema + fuentes; corre en iOS y Android |
| **1. Navegación y shell** | 2–5 | Tabs History / Scan / Assistant + Profile; i18n base EN/ES; tokens |
| **2. History con mocks** | 5–9 | Cards, filtros, empty state, detalle navegable con fixtures |
| **3. Cámara** | 9–14 | Permisos, captura, galería, compresión, preview, estados |
| **4. Persistencia** | 14–18 | SQLite + filesystem; crear/leer/borrar scans; sobrevive reinicio |
| **5. IA live** | 18–26 | Proxy + Llama multimodal + Zod + prompts + manejo de errores |
| **6. Detalle completo** | 26–31 | Damage card, repair plan, seguridad, confidence, CTA Assistant |
| **7. Assistant** | 31–37 | Chat con contexto del scan, streaming, sugerencias, disclaimer |
| **8. Profile/Settings** | 37–40 | Idioma, tema, borrar historial, about, sign out |
| **9. Pulido** | 40–44 | Animaciones, haptics, skeletons, estados de error, ES QA |
| **10. Demo** | 44–48 | Fixtures sembrados, guion, video backup, pitch deck |

**Regla de oro**: al final del bloque 6 debe existir un demo end-to-end aunque el Assistant sea mock. Nunca dejar la integración de IA para el final.

### Reparto sugerido (si son 2–4 personas)

- **A — Product/UI**: shell, design system, History, Detail, Profile, i18n.
- **B — Camera/Data**: cámara, imágenes, SQLite, estados, performance.
- **C — AI**: proxy, prompts, schema, Assistant, mock fixtures, evaluación.
- **D — Pitch/Demo**: narrativa, video, datos, pruebas en dispositivos, QA final.

Con 1–2 personas: seguir el orden de la tabla y recortar stretch sin piedad.

---

## 11. Riesgos y mitigaciones

| Riesgo | Impacto | Mitigación |
|---|---|---|
| API lenta o caída en el venue | Demo roto | Modo mock + fixtures + video backup |
| Alucinación de marca/modelo | Credibilidad | Confidence visible + "likely" + disclaimers + validación |
| API key expuesta | Seguridad | Proxy serverless; key solo en el servidor |
| Fotos oscuras o borrosas | Mala identificación | Hints de encuadre/luz + retake + compresión controlada |
| Permisos de cámara denegados | Bloqueo | Pantalla explicativa + importar desde galería |
| i18n incompleto | Mala impresión | QA ES bloque 9; fallback a EN |
| Scope creep (piezas, pagos, PDF) | No terminar MVP | Congelar alcance al inicio del bloque 5 |
| Costos de inferencia | — | Limitar tamaño de imagen, tokens y reintentos; cachear resultados |
| Privacidad de fotos | Reputación | Borrado local real, aviso claro, no almacenamiento público |

---

## 12. Demo y pitch (3 minutos)

1. **0:00–0:20** — Problema: diagnosticar hardware requiere tiempo, dinero y expertos; la mayoría no sabe qué pieza falla.
2. **0:20–0:40** — FixCan: una foto → identificación + diagnóstico + reparación.
3. **0:40–1:40** — Demo en vivo:
   - Escanear una GPU (o usar fixture si falla la red).
   - Mostrar identificación, specs y confidence.
   - Mostrar daño detectado y plan de reparación.
   - Preguntar al Assistant: *"Can I fix this at home?"*
4. **1:40–2:10** — Historial: el valor acumulado; escaneos previos y seguimiento.
5. **2:10–2:35** — Por qué Meta/Llama: visión + razonamiento técnico + conversación, en el dispositivo del usuario.
6. **2:35–3:00** — Impacto, siguiente paso (piezas compatibles, técnicos cercanos) y cierre.

**Métricas para mencionar**: tiempo de diagnóstico <15 s, 3–5 componentes de demo, 2 idiomas, 100% local-first.

**Criterios de jueces a cubrir**: uso profundo de Llama, originalidad, utilidad real, calidad de UX, completitud técnica, claridad del pitch.

---

## 13. Backlog post-hackathon

- Piezas compatibles con links de compra (afiliados).
- Directorio de técnicos cercanos.
- OCR de etiquetas y números de serie.
- Historial de conversaciones y memoria por dispositivo.
- Reportes PDF para talleres.
- Sync multi-dispositivo y cuenta real.
- Modelo fine-tuneado con fotos etiquetadas de daños.
- Modo offline con modelo on-device (si es viable).

---

## 14. Próximos pasos inmediatos

1. Confirmar nombre del paquete, bundle IDs y cuenta de Expo.
2. Crear repo `fixcan` + scaffold Expo Router + TypeScript strict.
3. Implementar shell de tabs + tema + i18n (EN default, ES).
4. Cargar 4–6 fixtures de escaneos realistas (GPU, RAM, laptop battery, phone screen, PSU, motherboard).
5. Construir History + Detail con esos fixtures.
6. Cámara + persistencia.
7. Proxy + Llama + Assistant.
8. Congelar alcance y ensayar el demo.

**Definition of Done del MVP**: un usuario nuevo puede registrarse, escanear un componente, ver identificación + daño + reparación, preguntar al Assistant, cerrar la app y encontrar el escaneo en History, todo en inglés y en español, con o sin red.
