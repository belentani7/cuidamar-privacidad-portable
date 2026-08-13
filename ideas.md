# CuidaMar Privacidad — dirección de diseño

## Tres enfoques considerados

### Enfoque 1: Archivo de Marea
Interfaz editorial serena, inspirada en archivos de papel, cartografía costera y señalética hospitalaria sobria. Comunica calma, orden y control sin parecer una historia clínica.

**Probability:** 0.07

### Enfoque 2: Sala de Control Clara
Dashboard operativo de alto contraste, modular y muy directo, con énfasis en estados, bloqueos preventivos y acciones rápidas. La personalidad es técnica y responsable, no fría.

**Probability:** 0.04

### Enfoque 3: Cuaderno de Guardia
Experiencia más cálida y personal, similar a una libreta de trabajo digital con notas breves y rituales de cierre. Refuerza la organización cotidiana sin solicitar identidad ni datos sensibles.

**Probability:** 0.06

## Enfoque elegido: Archivo de Marea

### Design Movement
Editorial modernism con referencias a la señalética suiza, al diseño de archivos y a la cultura mediterránea de la costa: preciso, silencioso y humano.

### Core Principles
1. **Privacy is visible:** los bloqueos de datos no se esconden; forman parte del producto y explican por qué existe cada límite.
2. **Calm operations:** la interfaz reduce ruido y permite actuar en menos pasos, con estados claros y lenguaje no alarmista.
3. **No clinical theatre:** nunca simula una historia clínica, un hospital oficial ni una identidad real; trabaja con plantillas y datos sintéticos.
4. **Evidence over decoration:** cada elemento debe ayudar a decidir, revisar o cerrar una tarea.

### Color Philosophy
El navy de tinta representa confianza y lectura prolongada; el sea-glass teal identifica acciones seguras y continuidad; el arena señala contexto y documentación; el coral apagado solo marca bloqueo o atención. No se usarán gradientes morados ni neón. La paleta debe recordar un archivo costero protegido de la exposición, no un producto clínico comercial.

### Layout Paradigm
Estructura de aplicación con una columna lateral estrecha para contexto y una superficie de trabajo asimétrica: una franja de estado, una lista priorizada y un panel de protección. No se centra todo en una tarjeta única. El espacio negativo y las líneas de archivo guían la lectura.

### Signature Elements
- Línea ondulada fina que conecta estados, sin parecer un electrocardiograma.
- Etiquetas de “bloqueado por privacidad” con icono de escudo y texto explicativo.
- Tarjetas tipo ficha de archivo con numeración, pequeños metadatos y bordes suaves, no grandes cápsulas.

### Interaction Philosophy
Cada acción debe confirmar qué se guarda y qué no. Los controles que podrían introducir información personal están desactivados o sustituidos por plantillas. Los estados se actualizan con transiciones cortas; no hay animaciones de celebración para tareas sanitarias.

### Animation
Entrada en cascada de 30–50 ms para grupos de fichas, transiciones de 180 ms para estados, y desplazamientos mínimos. No animar datos como si fueran alertas clínicas. Respetar `prefers-reduced-motion` y mantener el foco visible.

### Typography System
Titulares en **DM Serif Display** para dar sensación de archivo humano; interfaz y datos en **IBM Plex Sans** para legibilidad técnica. Jerarquía: display 48/52, heading 24/30, label 11/14 con tracking amplio, body 14/22, datos destacados 28/32.

### Brand Essence
Organización diaria para trabajadoras sanitarias que quieren planificar sin exponer identidades; se diferencia porque convierte la minimización de datos en una función visible. Personalidad: **serena, rigurosa, protectora**.

### Brand Voice
Los titulares son concretos y tranquilos. Los CTA describen la acción y sus límites. El microcopy explica sin culpabilizar.

- “Ordena tu jornada. No guardamos personas.”
- “Planificar sin identificar: ese es el límite.”

### Wordmark & Logo
La marca usa un símbolo abstracto de ola protegida por un escudo, sin cruz médica y sin nombre de persona. El logotipo tipográfico combina una serif editorial con sans técnica; no se utiliza el nombre de ninguna trabajadora.

### Signature Brand Color
**Sea-glass teal — #2B8C87**, un verde azulado sobrio que comunica continuidad, cuidado y control sin parecer clínico ni tecnológico en exceso.

## Style Decisions
- La aplicación se llamará **CuidaMar Privacidad**; no se utilizarán nombres de personas reales ni referencias que identifiquen a una trabajadora concreta.
- No habrá campos para nombres, correos, teléfonos, pacientes, habitaciones, camas, horarios asociados a pacientes, nóminas, documentos o texto libre clínico.
- La demostración será estática y local en el navegador; no habrá registro, backend ni almacenamiento remoto.
- Los datos de ejemplo serán sintéticos y genéricos.
- La interfaz mostrará de forma visible un perímetro de privacidad y un botón de “Bloquear entrada sensible”.
