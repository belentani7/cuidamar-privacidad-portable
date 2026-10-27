# PROJECT MASTER PROMPT — CuidaMar Privacidad (repo canónico #188)

## Identidad, público y límites
CuidaMar Privacidad es una **demo independiente y portable de organización genérica**, no una aplicación oficial de un hospital ni un sistema clínico. Público: personas que desean organizar bloques, pausas y tareas **sintéticas** sin nombres, pacientes, habitaciones, horarios asistenciales, archivos o texto libre. No atribuir afiliación institucional, certificación sanitaria, privacidad auditada ni puntuaciones de seguridad ficticias.

## Fuente de verdad
Leer en este orden: `README.md`, `PORTABILITY.md`, `SECURITY.md`, `client/src/pages/Home.tsx`, `server/routers.ts`, `server/db.ts`, `drizzle/schema.ts`, migración real `drizzle/0000_sudden_logan.sql`, `package.json`, `pnpm-lock.yaml` y CI. La documentación no reemplaza la ejecución. Preservar la historia y la identidad de este repo; no crear un repositorio paralelo.

## Arquitectura actual y límites reales
- React 19 + Vite 7, interfaz española; UI local y estado de demostración.
- Express + tRPC, procedimientos públicos sin autenticación real. No exponer datos personales ni bases de datos sensibles.
- Drizzle + MySQL/TiDB **opcional**; tablas `generic_tasks` y `generic_preferences`. No hay cuentas ni perfiles.
- Identificador aleatorio por instalación: separa plantillas, **no es autorización**. Si el navegador bloquea almacenamiento, la clave solo persiste en memoria hasta recargar.
- Sin almacenamiento de voz, documentos, información clínica o contenido de terceros. No añadirlo por inferencia.
- Publicación restringida: repositorio **público** según GitHub el 27-10-2026; producto sin destino de hosting ni validación de seguridad. No cambiar visibilidad ni desplegar automáticamente. Express escucha en loopback por defecto; la exposición de red exige `HOST=<IP>` y `ALLOW_NETWORK_BIND=true`, sin que eso proporcione autenticación.

## Visión de máximo potencial útil
Experiencia local-first clara, accesible y responsive; plantillas genéricas cerradas, límites explícitos, estado de sincronización verdadero, restauración segura, preferencia de movimiento, navegación funcional, teclado y foco, errores recuperables, carga/empty/error honestos. Mejorar estabilidad, rendimiento y pruebas antes de nuevas funciones. Si se desea gestión de pacientes o colaboración entre usuarios, **detener y exigir un producto nuevo con diseño de seguridad/privacidad y autorización específica**, no ampliar esta demo silenciosamente.

## Gates por cada cambio
1. Fijar ID GitHub, rama y SHA; leer PRs/ramas y riesgos de privacidad, licencias, datos, LFS y backups. Un bundle Git no acredita restauración completa.
2. Contrastar frontend, rutas, API, migraciones, dependencias, lockfile, textos y claims. Hallazgos deben citar archivo/línea y distinguir bug reproducido de discrepancia documental.
3. Cambios mínimos en rama aislada reutilizando PR existente. No publicar, mergear ni cambiar autenticación/visibilidad sin seguridad, revisión y pruebas suficientes.
4. Ejecutar realmente `pnpm install --frozen-lockfile`, `pnpm run check`, `pnpm run test`, `pnpm run test:installation-key`, `pnpm run build` y smoke/E2E de flujos. Probar 320/375/768/1280, teclado, foco, lector, zoom, `prefers-reduced-motion`, carga/vacío/error. Si faltan dependencias, runner o navegador, marcar **PENDIENTE**.
5. Escanear secretos, dependencias, fuente, workflows e historial con herramientas autorizadas y disponibles; documentar `not_run` si no se ejecutaron. Verificar rollback y respaldo cifrado/restaurado antes de cualquier acción destructiva.
6. Usar Impeccable (Apache-2.0, verificar versión/licencia antes de instalar) y guías oficiales React/WCAG 2.2 como referencias; no instalar herramientas sin comprobar seguridad/compatibilidad.
7. Estado final `VERIFIED`, `PARTIAL` o `BLOCKED` con SHA, pruebas ejecutadas, CI runner real, revisión independiente, privacidad y despliegue verificado. No confundir tests aislados con suite completa ni `READY` con release seguro.

## Prompt operativo reutilizable
«Trabaja exclusivamente en `belentani7/cuidamar-privacidad-portable` (#188), conserva su propósito de demo genérica sin PII, inspecciona archivos y PR existentes, encuentra un fallo funcional reproducible, corrígelo en la rama aislada, añade regresión ejecutable, contrasta el diff y documenta SHA/CI/pruebas reales. No alteres la visibilidad pública actual, sin despliegue ni gastos mientras no se cumplan los gates; no inventes datos, cumplimiento ni respaldos».
