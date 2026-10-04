# Kelly App v2

Aplicación interna de Kelly Education Miami Dade para recepción, reclutadores,
Info Sessions y New Hire Orientation (NHO).

- [Reglas para agentes y colaboradores](AGENTS.md)
- [Memoria del proyecto y versiones](memory.md)
- [Arquitectura y protección del flujo semanal](docs/ARCHITECTURE.md)
- [Preparación y harness de verificación](docs/HARNESS.md)
- [Bitácora de cambios y pendientes](docs/CHANGELOG.md)

Backend: FastAPI + SQLAlchemy. Frontend: React + TypeScript + Vite.
El código vive en `kelly-app-v2/backend` y `kelly-app-v2/frontend`.

Para trabajar, preparar las dependencias según `docs/HARNESS.md`, ejecutar
`python scripts/verify.py` y documentar el resultado en la bitácora.
