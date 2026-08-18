# CuidaMar Privacidad — guía de portabilidad

## Alcance

CuidaMar Privacidad está preparado como una aplicación React/Vite con servidor Express y API tRPC. La única persistencia funcional de producto corresponde a `generic_tasks`, una tabla que contiene una clave aleatoria de instalación, una clave fija de plantilla, un estado y un orden. No existe ningún campo para nombres, correos, teléfonos, pacientes, camas, habitaciones, diagnósticos, nóminas, texto libre o documentos.

La aplicación no utiliza OAuth, almacenamiento gestionado ni cabeceras de sesión de un proveedor concreto para su funcionamiento. Los recursos visuales son parte de la interfaz y el servidor solo necesita una base de datos compatible si se desea persistencia.

## Requisitos externos

Se necesita Node.js 20 o superior, pnpm 10 o npm equivalente, y una base MySQL/TiDB compatible con Drizzle. La variable `DATABASE_URL` debe configurarse fuera del repositorio. Nunca se debe escribir una contraseña dentro del código, en GitHub ni en un archivo `.env` versionado.

Para una publicación con otro proveedor, se deben configurar al menos:

| Variable | Uso | Obligatoria |
|---|---|---|
| `DATABASE_URL` | Conexión a MySQL/TiDB compatible | Para persistencia |
| `NODE_ENV` | `production` en despliegue | Sí |
| `PORT` | Puerto que expone el proveedor | Normalmente sí |

## Ejecución local

```bash
pnpm install
pnpm drizzle-kit generate
pnpm check
pnpm test
pnpm build
NODE_ENV=production PORT=3000 pnpm start
```

El script `pnpm dev` ejecuta el servidor Express y Vite. La API portable se expone en `/api/trpc` y el cliente usa únicamente `fetch` same-origin.

## Base de datos

La migración inicial se encuentra en `drizzle/0000_sweet_silver_sable.sql`. En una base nueva, se debe ejecutar mediante el flujo de migraciones del proveedor o con el comando documentado por Drizzle. La migración crea `generic_tasks` y la tabla técnica `users` del template; CuidaMar no usa `users` para sus funciones genéricas.

Antes de activar persistencia, debe hacerse una copia de seguridad de la base y verificarse que el proveedor no comparte la base con datos hospitalarios. La base debe ser exclusiva para esta aplicación y debe tener cifrado en tránsito, copias de seguridad y control de acceso según el proveedor elegido.

## Modelo de seguridad

La clave `installationKey` se crea aleatoriamente en el navegador y solo sirve para separar una instalación anónima de otra. La API valida el formato de esa clave y permite únicamente las tres plantillas fijas: `ronda_inicio`, `confort_material` y `cierre_turno`. No hay endpoint de texto libre ni de archivos.

Esta arquitectura reduce el riesgo, pero no constituye una certificación legal ni permite tratar datos de pacientes. Si el uso cambia y se pretende registrar información asistencial real, hay que detener esta versión y realizar una evaluación formal con el responsable de protección de datos y el centro sanitario.

## Publicación externa

Un proveedor externo necesita recibir el repositorio, instalar dependencias, ejecutar las migraciones y configurar `DATABASE_URL`. El proceso es portable entre proveedores Node/Express, pero las pantallas de publicación, los nombres de variables, el comando de arranque y la configuración de red pueden variar. La base de datos no se exporta automáticamente con el código: debe migrarse de manera separada y controlada.

No se debe publicar esta aplicación como si fuera oficial de un hospital ni asociarla a la identidad de una trabajadora concreta. Debe mantenerse la indicación de que es un proyecto independiente y de demostración.
