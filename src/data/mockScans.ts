import type {
  ComponentInfo,
  DamageAssessment,
  DamageFinding,
  Locale,
  RepairPlan,
  RepairStep,
  Scan,
  ScanAnalysis,
  SpecItem,
} from '@/types/scan';

type Localized = { en: string; es: string };

type LocalizedFinding = Omit<DamageFinding, 'description' | 'location'> & {
  description: Localized;
  location?: Localized;
};

type LocalizedStep = Omit<RepairStep, 'title' | 'detail' | 'safety'> & {
  title: Localized;
  detail: Localized;
  safety?: Localized;
};

type LocalizedPlan = Omit<
  RepairPlan,
  'tools' | 'steps' | 'warnings' | 'whenToSeekPro' | 'estimatedTime'
> & {
  estimatedTime?: Localized;
  tools: Localized[];
  steps: LocalizedStep[];
  warnings: Localized[];
  whenToSeekPro: Localized[];
};

type LocalizedAnalysis = {
  component: Omit<ComponentInfo, 'description'> & { description: Localized };
  damage: Omit<DamageAssessment, 'summary' | 'findings'> & {
    summary: Localized;
    findings: LocalizedFinding[];
  };
  repair: LocalizedPlan;
};

const L = (en: string, es: string): Localized => ({ en, es });
const pick = (value: Localized, locale: Locale) => value[locale] ?? value.en;
const pickList = (values: Localized[], locale: Locale) => values.map((value) => pick(value, locale));

const specs = (items: [string, string][]): SpecItem[] =>
  items.map(([label, value]) => ({ label, value }));

const analyses: LocalizedAnalysis[] = [
  {
    component: {
      name: 'GeForce RTX 4070 Ti',
      brand: 'ASUS',
      model: 'TUF Gaming OC 12GB',
      category: 'gpu',
      specs: specs([
        ['Memory', '12 GB GDDR6X'],
        ['Interface', 'PCIe 4.0 x16'],
        ['Power', '285 W TDP'],
        ['Outputs', '3× DisplayPort 1.4a, 1× HDMI 2.1'],
      ]),
      description: L(
        'Triple-fan Ada Lovelace card with a 2.9-slot heatsink and dual BIOS. The PCB and cooler appear original; the serial sticker is partly worn.',
        'Tarjeta Ada Lovelace de triple ventilador con disipador de 2.9 ranuras y doble BIOS. La PCB y la refrigeración parecen originales; la etiqueta del número de serie está parcialmente desgastada.',
      ),
      confidence: 0.94,
      identifiers: { partNumber: 'TUF-RTX4070TI-O12G-GAMING' },
    },
    damage: {
      detected: true,
      summary: L(
        'Dust buildup across the fin stack and a slightly bent PCIe bracket. No cracked PCB or burned traces are visible.',
        'Acumulación de polvo en el disipador y el soporte PCIe ligeramente doblado. No se ven grietas en la PCB ni rastros de quemadura.',
      ),
      severity: 'moderate',
      findings: [
        {
          type: 'dust',
          description: L(
            'Heavy dust between the fans and the heatsink reduces airflow.',
            'Hay mucho polvo entre los ventiladores y el disipador, lo que reduce el flujo de aire.',
          ),
          location: L('Fan and heatsink assembly', 'Conjunto de ventiladores y disipador'),
          confidence: 0.91,
        },
        {
          type: 'deformation',
          description: L(
            'The PCIe mounting bracket is bent outward by roughly 3 mm.',
            'El soporte de montaje PCIe está doblado hacia afuera unos 3 mm.',
          ),
          location: L('Rear I/O bracket', 'Soporte trasero de E/S'),
          confidence: 0.84,
        },
      ],
    },
    repair: {
      repairability: 'partial',
      difficulty: 'moderate',
      estimatedTime: L('45–60 min', '45–60 min'),
      estimatedCost: { min: 0, max: 35, currency: 'USD' },
      tools: [
        L('Phillips #2 screwdriver', 'Destornillador Phillips #2'),
        L('Anti-static wrist strap', 'Pulsera antiestática'),
        L('Compressed air', 'Aire comprimido'),
        L('Isopropyl alcohol 90%+', 'Alcohol isopropílico 90%+'),
        L('Soft brush', 'Cepillo suave'),
      ],
      steps: [
        {
          title: L('Power down safely', 'Apaga de forma segura'),
          detail: L(
            'Shut down, unplug the PC, and hold the power button for five seconds to discharge the PSU.',
            'Apaga el equipo, desconéctalo y mantén presionado el botón de encendido cinco segundos para descargar la fuente.',
          ),
          safety: L(
            'Never open the case while the PC is plugged in.',
            'Nunca abras el gabinete con el equipo conectado a la corriente.',
          ),
        },
        {
          title: L('Remove the card', 'Retira la tarjeta'),
          detail: L(
            'Unscrew the bracket, release the PCIe latch, and lift the card straight out.',
            'Desatornilla el soporte, libera el seguro PCIe y saca la tarjeta en línea recta.',
          ),
          safety: L(
            'Wear an anti-static strap or touch the bare metal case first.',
            'Usa una pulsera antiestática o toca primero el metal desnudo del gabinete.',
          ),
        },
        {
          title: L('Clean the cooler', 'Limpia el sistema de refrigeración'),
          detail: L(
            'Hold the fans still and blow compressed air through the fins. Brush loosened dust and wipe the shroud with isopropyl alcohol.',
            'Sujeta los ventiladores y sopla aire comprimido entre las aletas. Cepilla el polvo suelto y limpia la carcasa con alcohol isopropílico.',
          ),
        },
        {
          title: L('Straighten the bracket', 'Endereza el soporte'),
          detail: L(
            'Support the PCB and gently bend the bracket back in small increments. Stop if the PCB flexes.',
            'Sostén la PCB y dobla el soporte poco a poco. Detente si la PCB se flexiona.',
          ),
          safety: L(
            'Do not bend the card while it is installed.',
            'No dobles la tarjeta mientras está instalada.',
          ),
        },
        {
          title: L('Reseat and test', 'Reinstala y prueba'),
          detail: L(
            'Reinstall the card, reconnect the power cable, boot, and monitor temperatures and fan noise for 10 minutes.',
            'Reinstala la tarjeta, conecta el cable de poder, enciende y vigila temperaturas y ruido de ventiladores durante 10 minutos.',
          ),
        },
      ],
      warnings: [
        L(
          'Unplug the PC and discharge the PSU before opening the case.',
          'Desconecta el equipo y descarga la fuente antes de abrir el gabinete.',
        ),
        L(
          'Do not touch the GPU die or PCB traces with bare hands.',
          'No toques el die de la GPU ni las pistas de la PCB con las manos desnudas.',
        ),
        L(
          'Keep compressed air upright to avoid spraying liquid.',
          'Mantén el aire comprimido en posición vertical para evitar rociar líquido.',
        ),
      ],
      whenToSeekPro: [
        L('The card does not POST after reseating.', 'La tarjeta no arranca después de reinstalarla.'),
        L(
          'You see burn marks, a burnt smell or exposed traces.',
          'Ves marcas de quemadura, olor a quemado o pistas expuestas.',
        ),
        L(
          'The bracket is cracked or the PCB is visibly warped.',
          'El soporte está agrietado o la PCB está visiblemente deformada.',
        ),
      ],
    },
  },
  {
    component: {
      name: '980 PRO',
      brand: 'Samsung',
      model: '1 TB NVMe M.2',
      category: 'storage',
      specs: specs([
        ['Capacity', '1 TB'],
        ['Form factor', 'M.2 2280'],
        ['Interface', 'PCIe 4.0 x4'],
        ['Sequential read', 'Up to 7,000 MB/s'],
        ['Warranty', '5 years'],
      ]),
      description: L(
        "M.2 2280 PCIe 4.0 NVMe drive with Samsung's Elpis controller and 1 TB of V-NAND. The label and edge connector are clean.",
        'Unidad NVMe M.2 2280 PCIe 4.0 con controlador Elpis de Samsung y 1 TB de V-NAND. La etiqueta y el conector están limpios.',
      ),
      confidence: 0.97,
      identifiers: { partNumber: 'MZ-V8P1T0B/AM' },
    },
    damage: {
      detected: false,
      summary: L(
        'No physical damage detected. The edge connector, NAND packages and label are intact.',
        'No se detectaron daños físicos. El conector, los chips NAND y la etiqueta están intactos.',
      ),
      severity: 'none',
      findings: [],
    },
    repair: {
      repairability: 'not_needed',
      difficulty: 'easy',
      estimatedTime: L('10 min', '10 min'),
      estimatedCost: { min: 0, max: 0, currency: 'USD' },
      tools: [
        L('Soft brush', 'Cepillo suave'),
        L('Isopropyl alcohol 90%+', 'Alcohol isopropílico 90%+'),
      ],
      steps: [
        {
          title: L('Keep it cool', 'Mantenla fría'),
          detail: L(
            'Leave the motherboard heatsink installed and keep case airflow unobstructed.',
            'Deja instalado el disipador de la placa y mantén el flujo de aire del gabinete sin obstrucciones.',
          ),
        },
        {
          title: L('Monitor health', 'Vigila su salud'),
          detail: L(
            'Check SMART status occasionally; a healthy drive should stay below 70 °C under load.',
            'Revisa el estado SMART de vez en cuando; una unidad sana debe mantenerse bajo 70 °C con carga.',
          ),
        },
        {
          title: L('Handle by the edges', 'Tómala por los bordes'),
          detail: L(
            'If you move the drive, hold it by the sides and avoid touching the gold contacts.',
            'Si mueves la unidad, sujétala por los lados y evita tocar los contactos dorados.',
          ),
        },
      ],
      warnings: [],
      whenToSeekPro: [
        L('The drive disappears from BIOS or the OS.', 'La unidad desaparece del BIOS o del sistema operativo.'),
        L(
          'SMART reports reallocated sectors or critical warnings.',
          'SMART reporta sectores reasignados o advertencias críticas.',
        ),
      ],
    },
  },
  {
    component: {
      name: 'XPS 13 9310 battery',
      brand: 'Dell',
      model: '52 Wh 4-cell (0PN1VN)',
      category: 'battery',
      specs: specs([
        ['Capacity', '52 Wh'],
        ['Voltage', '7.6 V'],
        ['Cells', '4-cell lithium-ion'],
        ['Part number', '0PN1VN'],
        ['Compatible', 'XPS 13 9310'],
      ]),
      description: L(
        "52 Wh four-cell lithium-ion pack for the XPS 13 9310. The part number on the label matches Dell's OEM replacement.",
        'Batería de litio de cuatro celdas y 52 Wh para la XPS 13 9310. El número de parte de la etiqueta coincide con el repuesto OEM de Dell.',
      ),
      confidence: 0.93,
      identifiers: { partNumber: '0PN1VN', serial: 'DLL-9310-BAT-2291' },
    },
    damage: {
      detected: true,
      summary: L(
        'The battery pouch is visibly swollen and lifting the trackpad. This is a safety risk — stop using the laptop on AC power.',
        'La bolsa de la batería está visiblemente hinchada y levanta el trackpad. Es un riesgo de seguridad: deja de usar la laptop conectada a la corriente.',
      ),
      severity: 'severe',
      findings: [
        {
          type: 'swelling',
          description: L(
            'A pronounced bulge runs across the center cells and pushes against the trackpad.',
            'Hay un bulto pronunciado en las celdas centrales que empuja contra el trackpad.',
          ),
          location: L('Center cell stack', 'Celdas centrales'),
          confidence: 0.96,
        },
        {
          type: 'deformation',
          description: L(
            'The bottom chassis is bowed outward.',
            'La tapa inferior está abombada hacia afuera.',
          ),
          location: L('Lower chassis', 'Chasis inferior'),
          confidence: 0.89,
        },
      ],
    },
    repair: {
      repairability: 'yes',
      difficulty: 'moderate',
      estimatedTime: L('30–45 min', '30–45 min'),
      estimatedCost: { min: 60, max: 110, currency: 'USD' },
      tools: [
        L('Phillips #1 screwdriver', 'Destornillador Phillips #1'),
        L('Plastic pry tool', 'Herramienta plástica de palanca'),
        L('Anti-static wrist strap', 'Pulsera antiestática'),
        L('Replacement battery', 'Batería de repuesto'),
      ],
      steps: [
        {
          title: L('Back up and power off', 'Respalda y apaga'),
          detail: L(
            'Save your work, shut down, unplug the charger and disconnect external devices.',
            'Guarda tu trabajo, apaga la laptop, desconecta el cargador y los dispositivos externos.',
          ),
          safety: L(
            'Do not charge a swollen battery.',
            'No cargues una batería hinchada.',
          ),
        },
        {
          title: L('Open the bottom cover', 'Abre la tapa inferior'),
          detail: L(
            'Remove the eight screws and lift the cover with a plastic pry tool.',
            'Retira los ocho tornillos y levanta la tapa con una herramienta plástica.',
          ),
          safety: L(
            'Avoid metal tools near the battery.',
            'Evita herramientas metálicas cerca de la batería.',
          ),
        },
        {
          title: L('Disconnect the battery first', 'Desconecta la batería primero'),
          detail: L(
            'Unplug the battery connector from the motherboard before touching anything else.',
            'Desconecta el conector de la batería de la placa madre antes de tocar cualquier otra cosa.',
          ),
        },
        {
          title: L('Remove the pack', 'Retira el paquete'),
          detail: L(
            'Unscrew the battery rails and lift the pack by its edges. Never puncture, bend or compress it.',
            'Desatornilla los rieles y levanta la batería por los bordes. Nunca la perfores, dobles ni comprimas.',
          ),
          safety: L(
            'A swollen battery can catch fire if damaged.',
            'Una batería hinchada puede incendiarse si se daña.',
          ),
        },
        {
          title: L('Install the replacement', 'Instala el reemplazo'),
          detail: L(
            'Seat the new battery, reconnect the connector, and replace the cover.',
            'Coloca la batería nueva, reconecta el conector y vuelve a poner la tapa.',
          ),
        },
        {
          title: L('Calibrate', 'Calibra'),
          detail: L(
            'Charge to 100%, discharge to 5%, then charge again to calibrate the gauge.',
            'Carga al 100%, descarga hasta 5% y vuelve a cargar para calibrar el indicador.',
          ),
        },
      ],
      warnings: [
        L(
          'Swollen lithium batteries are a fire risk. Stop using the laptop and do not puncture the pack.',
          'Las baterías de litio hinchadas son un riesgo de incendio. Deja de usar la laptop y no perfores la batería.',
        ),
        L(
          'Dispose of the old battery at an e-waste or battery recycling point.',
          'Desecha la batería vieja en un punto de reciclaje de electrónicos o baterías.',
        ),
        L(
          'If the battery hisses, overheats or smells sweet, move away and call emergency services.',
          'Si la batería silba, se sobrecalienta o huele dulce, aléjate y llama a emergencias.',
        ),
      ],
      whenToSeekPro: [
        L(
          'The chassis is cracked or the battery is glued in place.',
          'El chasis está agrietado o la batería está pegada.',
        ),
        L(
          'The swelling returns after replacement.',
          'La hinchazón reaparece después del cambio.',
        ),
        L(
          'You are not comfortable handling a damaged lithium battery.',
          'No te sientes cómodo manipulando una batería de litio dañada.',
        ),
      ],
    },
  },
  {
    component: {
      name: 'Core i7-13700K',
      brand: 'Intel',
      model: 'LGA 1700 desktop processor',
      category: 'cpu',
      specs: specs([
        ['Cores', '16 (8 P + 8 E)'],
        ['Threads', '24'],
        ['Turbo clock', '5.4 GHz'],
        ['Power', '125 W base / 253 W turbo'],
        ['Socket', 'LGA 1700'],
      ]),
      description: L(
        '16-core LGA 1700 desktop processor. The heat spreader is clean; the pin-side land array is damaged.',
        'Procesador de escritorio LGA 1700 de 16 núcleos. El IHS está limpio; la cara de contactos está dañada.',
      ),
      confidence: 0.91,
      identifiers: { partNumber: 'BX8071513700K' },
    },
    damage: {
      detected: true,
      summary: L(
        'Two pins in the LGA 1700 land array are bent and one is misaligned. The CPU will not seat correctly and may short the socket.',
        'Dos pines de la cara LGA 1700 están doblados y uno está desalineado. El CPU no asentará correctamente y podría hacer corto en el socket.',
      ),
      severity: 'severe',
      findings: [
        {
          type: 'bent_pin',
          description: L(
            'Pins at the outer row of the land array are bent toward each other.',
            'Los pines de la fila exterior están doblados unos hacia otros.',
          ),
          location: L('Pin-side edge, row 2', 'Borde de pines, fila 2'),
          confidence: 0.92,
        },
        {
          type: 'deformation',
          description: L(
            'The substrate corner shows a small chip near the alignment notch.',
            'La esquina del sustrato muestra un pequeño desportillado cerca de la muesca de alineación.',
          ),
          location: L('Corner near the triangle marker', 'Esquina cerca del triángulo'),
          confidence: 0.81,
        },
      ],
    },
    repair: {
      repairability: 'no',
      difficulty: 'professional',
      estimatedTime: L('Replacement only', 'Solo reemplazo'),
      estimatedCost: { min: 220, max: 320, currency: 'USD' },
      tools: [
        L('Magnifying glass or macro lens', 'Lupa o lente macro'),
        L('Fine-tipped tweezers (only if attempting)', 'Pinzas de punta fina (solo si lo intentas)'),
      ],
      steps: [
        {
          title: L('Do not force it', 'No lo fuerces'),
          detail: L(
            'Stop seating the CPU. Forcing a bent pin can permanently damage the motherboard socket.',
            'Deja de asentar el CPU. Forzar un pin doblado puede dañar permanentemente el socket de la placa madre.',
          ),
          safety: L(
            'Bent pins can short the socket and kill the board.',
            'Los pines doblados pueden hacer corto en el socket y matar la placa.',
          ),
        },
        {
          title: L('Document the damage', 'Documenta el daño'),
          detail: L(
            'Take a sharp macro photo of the pin field and note which pins are affected.',
            'Toma una foto macro nítida de los pines y anota cuáles están afectados.',
          ),
        },
        {
          title: L('Contact Intel or the retailer', 'Contacta a Intel o al vendedor'),
          detail: L(
            'Check warranty coverage. Bent pins are often excluded, but a replacement may still be the safest option.',
            'Revisa la cobertura de garantía. Los pines doblados suelen quedar excluidos, pero un reemplazo sigue siendo la opción más segura.',
          ),
        },
        {
          title: L('Inspect the socket', 'Inspecciona el socket'),
          detail: L(
            'With the CPU removed, check the LGA socket for matching bent contacts. A damaged socket usually means a board replacement.',
            'Con el CPU retirado, revisa el socket LGA en busca de contactos doblados. Un socket dañado normalmente implica cambiar la placa.',
          ),
        },
        {
          title: L('Test in a known-good board', 'Prueba en una placa confiable'),
          detail: L(
            'If you replace the CPU, test it in a board you can afford to lose before installing it in your main system.',
            'Si reemplazas el CPU, pruébalo en una placa que puedas permitirte perder antes de instalarlo en tu equipo principal.',
          ),
        },
      ],
      warnings: [
        L(
          'Never straighten pins with the CPU installed.',
          'Nunca endereces pines con el CPU instalado.',
        ),
        L(
          'Do not install a CPU with bent pins — you risk destroying the motherboard.',
          'No instales un CPU con pines doblados: arriesgas destruir la placa madre.',
        ),
        L(
          'Handle the processor by the edges only.',
          'Manipula el procesador solo por los bordes.',
        ),
      ],
      whenToSeekPro: [
        L('Always, for bent pins or a damaged socket.', 'Siempre, para pines doblados o un socket dañado.'),
        L('If the motherboard socket has bent contacts.', 'Si el socket de la placa tiene contactos doblados.'),
        L(
          'If the system does not POST with a replacement CPU.',
          'Si el equipo no arranca con un CPU de reemplazo.',
        ),
      ],
    },
  },
  {
    component: {
      name: 'iPhone 13 display assembly',
      brand: 'Apple',
      model: '6.1″ OLED (OEM)',
      category: 'phone_part',
      specs: specs([
        ['Size', '6.1 in'],
        ['Panel', 'Super Retina XDR OLED'],
        ['Resolution', '2532 × 1170'],
        ['Refresh rate', '60 Hz'],
        ['Compatibility', 'iPhone 13'],
      ]),
      description: L(
        '6.1-inch Super Retina XDR OLED assembly for the iPhone 13. The flex cables and earpiece speaker are present; the frame is straight.',
        'Ensamblaje OLED Super Retina XDR de 6.1 pulgadas para iPhone 13. Los flex y el altavoz superior están presentes; el marco está recto.',
      ),
      confidence: 0.89,
      identifiers: { partNumber: 'OLED-IP13-OEM' },
    },
    damage: {
      detected: true,
      summary: L(
        'Spiderweb crack in the lower-right corner with two hairline cracks crossing the display. Touch and Face ID cannot be verified from a photo.',
        'Grieta en forma de telaraña en la esquina inferior derecha con dos grietas finas que cruzan la pantalla. El táctil y Face ID no se pueden verificar desde una foto.',
      ),
      severity: 'moderate',
      findings: [
        {
          type: 'crack',
          description: L(
            'Impact point at the lower-right corner with radiating cracks.',
            'Punto de impacto en la esquina inferior derecha con grietas radiales.',
          ),
          location: L('Lower-right corner', 'Esquina inferior derecha'),
          confidence: 0.95,
        },
        {
          type: 'scratch',
          description: L('Hairline scratches near the earpiece.', 'Rayones finos cerca del altavoz superior.'),
          location: L('Top edge', 'Borde superior'),
          confidence: 0.78,
        },
      ],
    },
    repair: {
      repairability: 'yes',
      difficulty: 'hard',
      estimatedTime: L('60–90 min', '60–90 min'),
      estimatedCost: { min: 120, max: 220, currency: 'USD' },
      tools: [
        L('Pentalobe P2 screwdriver', 'Destornillador Pentalobe P2'),
        L('Tri-point Y000 screwdriver', 'Destornillador Tri-point Y000'),
        L('Suction cup', 'Ventosa'),
        L('Plastic pry tool', 'Herramienta plástica de palanca'),
        L('Heat mat', 'Manta térmica'),
        L('Replacement display', 'Pantalla de repuesto'),
      ],
      steps: [
        {
          title: L('Back up the phone', 'Respalda el teléfono'),
          detail: L(
            'Create an iCloud or local backup. A display replacement should not erase data, but repairs can go wrong.',
            'Crea un respaldo en iCloud o local. Cambiar la pantalla no debería borrar datos, pero las reparaciones pueden salir mal.',
          ),
        },
        {
          title: L('Power off and heat the edges', 'Apaga y calienta los bordes'),
          detail: L(
            'Power down and warm the display edges to soften the adhesive. Keep heat away from the battery.',
            'Apaga el equipo y calienta los bordes de la pantalla para ablandar el adhesivo. Mantén el calor lejos de la batería.',
          ),
          safety: L(
            'Do not overheat the phone; lithium batteries are sensitive.',
            'No sobrecalientes el teléfono; las baterías de litio son sensibles.',
          ),
        },
        {
          title: L('Remove the pentalobe screws', 'Retira los tornillos pentalobe'),
          detail: L(
            'Open the bottom screws and use a suction cup to lift the display slightly.',
            'Abre los tornillos inferiores y usa una ventosa para levantar ligeramente la pantalla.',
          ),
        },
        {
          title: L('Disconnect the battery first', 'Desconecta la batería primero'),
          detail: L(
            'Remove the shield plate and disconnect the battery before the display flex cables.',
            'Retira la placa de protección y desconecta la batería antes de los flex de la pantalla.',
          ),
          safety: L(
            'Never disconnect the display while the battery is connected.',
            'Nunca desconectes la pantalla con la batería conectada.',
          ),
        },
        {
          title: L('Transfer the earpiece and sensors', 'Transfiere el altavoz y los sensores'),
          detail: L(
            'Move the earpiece speaker and ambient-light sensor to the new assembly. Preserve the Face ID flex.',
            'Mueve el altavoz superior y el sensor de luz ambiental al ensamblaje nuevo. Conserva el flex de Face ID.',
          ),
          safety: L(
            'Face ID will stop working if its flex or sensor is damaged.',
            'Face ID dejará de funcionar si se daña su flex o su sensor.',
          ),
        },
        {
          title: L('Test before sealing', 'Prueba antes de sellar'),
          detail: L(
            'Reconnect the display, power on, test touch, Face ID and True Tone, then apply new adhesive.',
            'Reconecta la pantalla, enciende, prueba táctil, Face ID y True Tone, y luego aplica adhesivo nuevo.',
          ),
        },
      ],
      warnings: [
        L(
          'Disconnect the battery before any display work.',
          'Desconecta la batería antes de cualquier trabajo en la pantalla.',
        ),
        L(
          'Keep heat away from the battery and do not pry near the battery pouch.',
          'Mantén el calor lejos de la batería y no hagas palanca cerca de ella.',
        ),
        L(
          'Face ID components are paired; damage cannot be repaired with software.',
          'Los componentes de Face ID están emparejados; el daño no se repara por software.',
        ),
      ],
      whenToSeekPro: [
        L('Face ID stops working after the repair.', 'Face ID deja de funcionar después de la reparación.'),
        L(
          'The frame is bent or the phone has water damage.',
          'El marco está doblado o el teléfono tiene daño por agua.',
        ),
        L(
          'You do not have the pentalobe and tri-point drivers.',
          'No tienes los destornilladores pentalobe y tri-point.',
        ),
      ],
    },
  },
];

const materialize = (analysis: LocalizedAnalysis, locale: Locale): ScanAnalysis => ({
  component: {
    ...analysis.component,
    description: pick(analysis.component.description, locale),
  },
  damage: {
    ...analysis.damage,
    summary: pick(analysis.damage.summary, locale),
    findings: analysis.damage.findings.map((finding) => ({
      ...finding,
      description: pick(finding.description, locale),
      location: finding.location ? pick(finding.location, locale) : undefined,
    })),
  },
  repair: {
    ...analysis.repair,
    estimatedTime: analysis.repair.estimatedTime
      ? pick(analysis.repair.estimatedTime, locale)
      : undefined,
    tools: pickList(analysis.repair.tools, locale),
    steps: analysis.repair.steps.map((step) => ({
      ...step,
      title: pick(step.title, locale),
      detail: pick(step.detail, locale),
      safety: step.safety ? pick(step.safety, locale) : undefined,
    })),
    warnings: pickList(analysis.repair.warnings, locale),
    whenToSeekPro: pickList(analysis.repair.whenToSeekPro, locale),
  },
});

export const DEMO_MODEL = 'llama-4-maverick (demo)';

export const getMockAnalyses = (locale: Locale): ScanAnalysis[] =>
  analyses.map((analysis) => materialize(analysis, locale));

export const getMockAnalysis = (locale: Locale, seed?: number): ScanAnalysis => {
  const index =
    seed === undefined ? Math.floor(Math.random() * analyses.length) : Math.abs(seed) % analyses.length;
  return materialize(analyses[index], locale);
};

const demoMeta = [
  { id: 'demo-gpu', hoursAgo: 2 },
  { id: 'demo-ssd', hoursAgo: 26 },
  { id: 'demo-battery', hoursAgo: 54 },
  { id: 'demo-cpu', hoursAgo: 120 },
  { id: 'demo-iphone', hoursAgo: 150 },
];

export const getMockScans = (locale: Locale): Scan[] => {
  const now = Date.now();
  return demoMeta.map((meta, index) => {
    const analysis = materialize(analyses[index], locale);
    return {
      id: meta.id,
      createdAt: new Date(now - meta.hoursAgo * 60 * 60 * 1000).toISOString(),
      isDemo: true,
      locale,
      model: DEMO_MODEL,
      ...analysis,
    };
  });
};
