# cuidamar-privacidad-portable

CuidaMar Privacidad es una demo independiente de organización de turnos con **plantillas sintéticas cerradas**. No es una herramienta sanitaria ni admite información personal o clínica. La API tRPC puede persistir tareas y preferencias genéricas en una base MySQL/TiDB **opcional**. No hay autenticación de usuario: **no desplegar con datos sensibles**. El servidor Express escucha únicamente en `127.0.0.1` por defecto; para enlazar una IP de red se requieren **ambas** variables `HOST=<IP>` y `ALLOW_NETWORK_BIND=true`. Esto expone una API sin autenticación: no habilitarlo en una red no confiable ni con datos reales.

## Stack

- Primary language: TypeScript
- Node project (`package.json` present)

## Getting started

```bash
git clone https://github.com/belentani7/cuidamar-privacidad-portable.git
```

```bash
corepack pnpm install --frozen-lockfile
corepack pnpm dev
```

---

License: MIT (véase `LICENSE`).

Para requisitos de base de datos, migraciones y limitaciones, consultar `PORTABILITY.md`. Los comandos de desarrollo usan sintaxis POSIX para variables de entorno; Windows PowerShell requiere adaptar la invocación. No se ha verificado despliegue de producción ni E2E en navegador.
