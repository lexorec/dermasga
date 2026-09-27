# Anuncios en video

Herramienta interna (Jekyll no publica esta carpeta). Convierte una animación de los avatares en anuncios
MP4 para Instagram, TikTok y Facebook, con su portada, y los deja en `assets/video/`.

- `pediatria.js`: el anuncio de Dermatología pediátrica, en dos versiones (`nina` y `nino`, una por cada animación).
  Textos, tiempos, chips de afecciones, tarjeta final y la medida de cada red (zonas libres de los botones de cada app).
  Los archivos salen como `anuncio-pediatria-nina-instagram.mp4`, `anuncio-pediatria-nino-tiktok.mp4`, etc.
- `render.html`: dibuja cada cuadro con el mismo motor de avatares del sitio.
- `render.py`: abre esa página en Chrome sin ventana y arma los MP4 con ffmpeg (H.264, 30 cuadros por segundo).

Uso, desde la carpeta del repositorio:

```bash
python3 _tools/anuncios/render.py pediatria
```

Otras opciones: `--formatos tiktok` (una sola red), `--variantes nino` (una sola versión), `--portadas` (solo portadas) y
`--cuadros 1,6.5,15 --salida /tmp/prueba` (imágenes sueltas para revisar antes de generar los videos).
