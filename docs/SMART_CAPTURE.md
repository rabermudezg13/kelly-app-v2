# Kelly Smart Capture — plan 2026-10-18

## Alcance y aceptación
- Pestaña independiente de reclutadores; preservar consultas semanales y permisos.
- Pegar, abrir PNG/JPEG/WebP o tomar captura con selector nativo del navegador.
- OCR y detección de rostros locales; recursos estáticos propios, sin API de imágenes ni almacenamiento de capturas/nombres.
- Nombre editable de First Name y Last Name; descarga `Nombre Apellido FP.png`.
- Cobertura opaca sugerida con X central y tamaño ajustables; revisión antes de descargar. X solo en editor.
- Detección no infalible: revisión visual de toda la foto y selección manual si falla.
- Limpiar workers, URLs y pistas al cerrar/reemplazar.

## Verificación prevista
Pruebas de nombre, límites del recuadro, exportación opaca, errores y reemplazo.
Harness completo y navegador con datos ficticios. Auditar que no se transmite contenido.

## Estado
Implementado en rama aislada. Pegado/apertura, OCR, cobertura automática del formato,
X/teclado, revisión y PNG final comprobados con datos ficticios. Pendiente comprobar
el selector nativo de ventana de getDisplayMedia. No integrado en producción.

## Operación y límites
- Navegadores con Clipboard API permiten el botón Pegar; Ctrl+V/⌘V y archivo son alternativas.
- Tomar captura requiere HTTPS y soporte/permisos de getDisplayMedia. El usuario elige
  la ventana y pulsa Usar esta captura; las pistas se detienen antes de procesar.
- Primera versión optimizada para la cabecera del formato proporcionado (foto arriba a la izquierda).
  Otras composiciones pueden requerir ajuste manual. OCR no determina identidad ni elegibilidad.
- No se promete ocultar otros datos personales: solo los rectángulos visibles en el editor.
- Recursos fijados: Tesseract.js 7.0.0, eng 1.0.0, MediaPipe Tasks Vision 1.1.1.
- Fuentes: https://github.com/naptha/tesseract.js/blob/master/docs/local-installation.md
  y https://ai.google.dev/edge/mediapipe/solutions/vision/face_detector/web_js.

Harness final PASS: 16 pruebas backend, 4 de captura, build y 21 diagnósticos TS previos/0 nuevos.
Prueba con servidor estático: solo GET de recursos propios; ninguna petición con contenido de imagen/nombre.

PR #13 en borrador; commit `1eaadeb0`. CI run `39139437093` PASS.
Vercel preview READY: `dpl_DhmmxCoTCzVKL3ikuEp4xU9dboaY`; HTML 200 y editor visible.
El selector nativo sigue pendiente; main no se modificó.

Verificación web adicional (2026-10-18): preview Vercel reconoció el nombre ficticio
y cubrió automáticamente el marco de foto. Solo falta la selección nativa de ventana.
