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

## 2026-10-18 — Smart Capture en inglés
- Solicitud: toda la interfaz del módulo en inglés.
- Cambios: botones, instrucciones, estados, errores, etiquetas accesibles, placeholder, nombre de archivo vacío y atributo lang. Se conserva el sufijo FP y la lógica.
- Verificación: harness PASS (16 backend, 4 Smart Capture, build, 0 errores TS nuevos). Preview Vercel READY y pantalla en inglés comprobada. Commit `6039538`, PR #13. Continúa pendiente la selección nativa de ventana; no integrado en producción.

## 2026-10-18 — Prueba solicitada con captura proporcionada
- Autorización: el usuario solicitó expresamente probar su imagen real en la preview.
- Resultado: OCR reconoció nombre/apellido; cobertura automática completa sin ajuste manual; descarga con sufijo FP.
- Verificación: PNG de 1555×679, foto opaca al 100%, sin X exportada, comparación RGB confirmó que el resto permanece igual.
- Privacidad: archivo abierto y procesado en navegador; resultado guardado solo en Descargas del usuario. Sin nombres, imagen ni datos personales en Git, fixtures o bitácora.
- Código: sin cambios; preview `6039538`, PR #13. La selección nativa de ventana sigue pendiente; producción no modificada.

## 2026-10-18 — Publicación y protección ante fallo de carga OCR
- Plan: verificar producción; resolver espera indefinida si falla la descarga de datos OCR antes de dar por terminada la publicación.
- PR #13 integrado (`3d7d2e3`), Vercel producción READY y backend health 200.
- Hallazgo: fallo de red en carga interna de idioma podía dejar pendiente la inicialización de Tesseract.
- Corrección: capturar errores de inicialización y limitar la espera a 30 segundos; un fallo ofrece ajuste manual en vez de bloquear la interfaz. No se envían imágenes ni nombres.
- Usuario autorizó explícitamente publicación tras probar su captura. Selección nativa de ventana sigue sin verificar por automatización.
- Estado: corrección en rama aislada. Harness PASS (16 backend, 4 de captura, build, 0 TS nuevos). Fallo HTTP 503 simulado: editor muestra aviso y habilita ajustes manuales, sin espera indefinida.

- Verificación adicional del inicio acotado: OCR recuperado con nombre ficticio y cubierta automática; HTTP 503 vuelve a edición manual. No cambia consultas semanales, permisos ni base de datos.

## Cierre de publicación — 2026-10-18
- PR #14 integrado: `8efc03b5053971840ab6a0649d9990b96d757cce`. Vercel producción READY (`dpl_6u13dLyPPLQtwtwyBzPheXYRT62j`).
- URL: https://kelly-app-v2.vercel.app/smart-capture.html
- Navegador de producción: pegado de captura ficticia, nombre y cubierta automática correctos; interfaz en inglés.
- Harness local y CI run `39170009560` PASS: 16 backend, 4 captura, build, 21 diagnósticos TS conocidos y 0 nuevos.
- Selector nativo de pantalla sigue pendiente de validación manual. No se modificó la consulta semanal.

## 2026-10-18 — Simplificar Smart Capture
- Plan: retirar captura mediante Share screen, conservar pegar/abrir y mover la pestaña después de New Hire Orientation. Verificar build, harness y navegador sin cambiar consultas.
- Estado: implementación aislada en `codex/smart-capture-simplify`.

- Cambios: retirados botón, video, getDisplayMedia y permiso del iframe; pestaña movida inmediatamente después de New Hire Orientation.
- Validación: harness PASS (16 backend, 4 captura, build, 0 TS nuevos); navegador confirma solo Paste image/Open image. Consultas semanales sin cambios.

- Publicación completada: PR #15, commit `5b2cbc9309abea58600eb72cd25705a845ddf121`, Vercel READY `dpl_HLe9jmTuct9GAShV7oZHwZNs3ue3`; CI run `39171766776` PASS. Navegador de producción confirma ausencia de Take screenshot y botones Paste image/Open image. Orden de pestañas comprobado en diff; no se probó dashboard autenticado en producción.

## 2026-10-19 — Smart Capture Ctrl+V (plan)
- Causa probable: el evento paste del dashboard padre no llega al listener del iframe cuando el foco permanece en la pestaña.
- Plan: escuchar pegado en editor y padre del mismo origen, retirar ambos listeners al desmontar; admitir items y files del portapapeles. No interceptar texto ni depender de permisos clipboard.read para Ctrl+V.
- Validar foco fuera/dentro del marco, limpieza al salir y OCR/descarga conservados. Harness completo y prueba web con imagen ficticia antes de publicar.

- Reproducción confirmada con iframe local y captura ficticia: pegado con foco en botón padre no carga imagen. Corrección: listener de paste en padre del mismo origen, fallback files, limpieza al desmontar y área de pegado enfocable. No cambia OCR, cobertura ni exportación. Pruebas de comportamiento añadidas; harness en curso.

- Validación local: harness completo PASS (16 backend, 8 Smart Capture, 11 Tracker, build; 21 diagnósticos TS conocidos, 0 nuevos). Navegador con captura ficticia: pegado nativo con foco en padre y dentro del editor carga imagen y reconoce ANA PEREZ; texto normal conserva su pegado y la descarga se habilita tras revisión. Pruebas unitarias confirman limpieza y aislamiento de origen. Prueba nativa realizada en macOS, no en Windows. Publicación pendiente.

## Cierre — Smart Capture Ctrl+V, 2026-10-19
- PR #18 integrado: `9f00e301574ba8b151e598b2b5cf0228a727f565`; CI run `39291180526` PASS. Vercel producción READY `dpl_GXJXa9K3UysqZw1ZJCXV1W8aYoPZ`, alias kelly-app-v2.vercel.app asignado; backend health 200.
- Archivo JS de producción coincide por SHA-256 con build local verificado. Navegador de producción: pegado nativo de imagen ficticia, OCR ANA PEREZ, cubierta sugerida y descarga habilitada tras revisión correctos.
- Foco del padre y texto normal comprobados en iframe local del mismo origen. No se ejercitó dashboard autenticado en producción ni teclado nativo de Windows; pruebas realizadas en macOS. No se cambió backend ni datos.
- Código, pruebas y plan documentados en PR #18. Este cierre posterior al despliegue queda guardado localmente para la próxima sincronización documental.

## 2026-10-19 — Reconocimiento tras pegado (plan)
- Usuario informa imagen pegada sin nombre ni cuadro. Revisar lectura limitada al 55% superior, dependencia del cuadro respecto del nombre y esperas sin límite en reconocimiento/detector.
- Criterios: aceptar perfil desplazado dentro de una captura de pantalla completa; sugerir cuadro aunque OCR falle; mostrar resultados parciales y liberar modo manual si falla un recurso. Mantener procesamiento local, revisión y formato de descarga.
- Implementar en rama aislada, reproducir con perfil ficticio desplazado, probar regresiones y harness antes de publicar. No asumir que la causa local confirma todavía el mensaje concreto del usuario.

- Reproducción confirmada en producción anterior con perfil ficticio reducido y desplazado dentro de pantalla 1920×1300: aparecen exactamente los avisos de nombre vacío y foto ausente. Nueva versión local encuentra el cuadro antes del OCR; verificación de nombre en curso. Harness completo PASS (16 backend, 9 captura, 11 tracker, build, 0 TS nuevos).

- Verificación completada: misma captura completa que fallaba reconoce ANA PEREZ y ubica cuadro en (596,758); recorte original conserva nombre y cuadro. En origen local nuevo con idioma OCR forzado a HTTP 503, la cubierta permanece y se habilita nombre manual con aviso claro. Harness final PASS (16 backend, 9 Smart Capture, 11 Tracker, build; 21 TS conocidos/0 nuevos). Pendiente publicación.
