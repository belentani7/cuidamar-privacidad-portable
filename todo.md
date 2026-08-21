# Plan de portabilidad CuidaMar Privacidad

- [x] Definir un modelo de datos mínimo para tareas, plantillas, estados y preferencias no identificables.
- [x] Prohibir en esquema y API nombres, correos, teléfonos, pacientes, habitaciones, camas, diagnósticos, nóminas y texto libre.
- [x] Elegir una base portable basada en SQL estándar y documentar variables de entorno.
- [x] Añadir backend/API propia con operaciones CRUD genéricas y validación estricta.
- [x] Mantener una opción local para desarrollo sin credenciales externas.
- [x] Sustituir referencias exclusivas de Manus en la aplicación portable.
- [x] Añadir migraciones y documentación de instalación/exportación.
- [x] Ejecutar pruebas de tipos, compilación, contrato de persistencia y verificación de tablas sin insertar datos de prueba.
- [x] Guardar un checkpoint portable antes de entregar.

## Orden de ejecución final

- [x] Eliminar restos de apuntes y artefactos no necesarios para la aplicación portable.
- [x] Vaciar y aislar la tabla heredada de identidad; el sistema bloquea su eliminación física y la aplicación no la utiliza.
- [x] Revisar que el repositorio no contenga secretos, nombres reales, datos sanitarios ni referencias institucionales no autorizadas.
- [x] Completar la integración de preferencias y persistencia genérica sin texto libre.
- [x] Ejecutar auditoría técnica, pruebas, build y revisión visual final.
- [x] Crear checkpoint final y exportar el proyecto a un repositorio privado de GitHub.

## Correcciones finales de auditoría

- [x] Eliminar el archivo residual de configuración del entorno anterior.
- [x] Conectar la UI a listar, crear, completar y limpiar tareas persistidas, con estados de carga y error.
- [x] Repetir la búsqueda final de referencias residuales y secretos.
- [x] Capturar la revisión visual posterior a todas las limpiezas.
- [x] Añadir estados visibles de carga, error y vacío para la lista portable de tareas.
- [x] Verificar visualmente esos estados antes de cerrar la auditoría.
- [x] Forzar y revisar visualmente el estado de carga de la lista portable.
- [x] Forzar y revisar visualmente el estado de error de la lista portable.
- [x] Forzar y revisar visualmente el estado vacío de la lista portable.

## Máquina organizativa de máxima capacidad

- [x] Definir un catálogo cerrado de operaciones genéricas, sin texto libre ni identidad.
- [x] Construir una consola de capacidad con flujos, carga y progreso agregados.
- [x] Añadir ejecución por lotes de plantillas seguras y recuperación controlada.
- [x] Incorporar límites de capacidad, cola local y bloqueo preventivo permanente.
- [x] Conectar el motor de máquina a persistencia exclusivamente genérica.
- [x] Añadir pruebas de contrato para operaciones por lotes y controles de seguridad.
- [x] Validar la máquina en escritorio y móvil y guardar un checkpoint de máxima capacidad.
