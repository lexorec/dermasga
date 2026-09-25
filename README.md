# Dra. Marcela Astudillo G. — sitio web

Sitio de una sola página de la Dra. Marcela Astudillo G., dermatóloga en Machala, Ecuador.
Publicado en **https://dermasga.com**.

Es un sitio Jekyll servido por GitHub Pages desde la rama `main`. Todo el contenido editable está en
`_data/site.yml` y se puede cambiar desde el navegador con [Pages CMS](https://app.pagescms.org).

```
_config.yml              URL del sitio, plugins y archivos excluidos
_data/site.yml           Todo el contenido: portada, especialidades, trayectoria, contacto,
                         horario, testimonios, textos para buscadores…
_includes/               Íconos SVG
index.html               Plantilla de la página (Liquid)
404.html                 Página "Página no encontrada"
assets/css/style.css     Estilos (colores y medidas de la marca al inicio)
assets/js/main.js        Menú móvil, animaciones al hacer scroll, botón flotante de WhatsApp
assets/img/              Logo, marca, retrato (las fotos subidas desde el CMS llegan aquí)
assets/img/og-image.jpg  Imagen 1200×630 para vistas previas al compartir (WhatsApp, Facebook, X…)
favicon.ico, assets/img/favicon-*, icon-*, apple-touch-icon.png, site.webmanifest   Íconos
robots.txt               Reglas para buscadores (sitemap.xml lo genera jekyll-sitemap)
.pages.yml               Formularios de Pages CMS
EDITAR.md                Guía de edición para la doctora
CNAME                    Dominio propio (dermasga.com)
```

## Editar el contenido (Pages CMS)

1. Entrar a <https://app.pagescms.org> con la cuenta de GitHub `lexorec`
   (o con una cuenta que tenga permiso de escritura en el repositorio:
   **Settings → Collaborators → Add people**).
2. Elegir el repositorio `dermasga` y abrir **Contenido del sitio**.
3. Editar y pulsar **Save**. Cada guardado es un commit; el sitio se actualiza en un minuto aproximadamente.

`EDITAR.md` es una guía corta que se le puede enviar a la doctora.

## Dominio y publicación

- GitHub Pages publica desde `main`, carpeta `/` (raíz). Dominio: `dermasga.com`, con HTTPS obligatorio.
- DNS en Namecheap (Advanced DNS):
  - `A @` → 185.199.108.153, 185.199.109.153, 185.199.110.153, 185.199.111.153
  - `AAAA @` → 2606:50c0:8000::153, 2606:50c0:8001::153, 2606:50c0:8002::153, 2606:50c0:8003::153
  - `CNAME www` → `lexorec.github.io.`
- El certificado HTTPS lo emite y renueva GitHub automáticamente.

## Vista previa local (opcional)

Requiere Ruby 3.3 (`brew install ruby@3.3`):

```bash
bundle install
bundle exec jekyll serve
```

Luego abrir http://localhost:4000.

## Estilo de redacción

Español de Ecuador, de la Costa (Machala): formal pero cercano, sin caer en modismos ni estereotipos.

- Tratar al paciente de **usted**, de forma consistente ("Agende su cita", "su piel", "Le respondemos"). No mezclar con *tú*.
- Vocabulario local: **cita** (no "hora"), **celular**, **consultorio**, **agendar**, **brindar**, **carnet**.
  Evitar giros de otros países ("que te acomode", "turno", "móvil", "vale"…).
- Horas en formato de 12 h: **8:30 a. m.**, **6:30 p. m.** (en los datos del CMS se guardan en 24 h y la
  página las convierte).
- Teléfonos como se escriben en Ecuador: **099 976 9176**, **(07) 364 2883**.
- Textos médicos: solo información confirmada por la doctora; sin promesas de curación ni resultados garantizados.

## Notas

- **Mapa**: el mapa incrustado usa las coordenadas de `contact.maps_query`; el botón
  "Cómo llegar" abre `contact.maps_url`, la ficha del consultorio en Google Maps.
- **Horario y dirección**: copiados de la ficha de Google (Google Business Profile). Si cambian allí,
  hay que cambiarlos también aquí para que coincidan; los buscadores confían más cuando los datos son iguales.
- **Testimonios**: textos copiados tal cual de reseñas de Google (se pueden recortar con "…"),
  con nombre e inicial del apellido. No usar reseñas que prometan curas o resultados garantizados.
  La calificación y el número de reseñas se actualizan a mano en el CMS.
- **SEO**: meta descripción, Open Graph y Twitter con `og-image.jpg`, datos estructurados JSON-LD
  (`Physician`, `Person`, `WebSite`, con coordenadas, horario y contacto), `sitemap.xml` y `robots.txt`.
  No se incluyen estrellas de reseñas en los datos estructurados: Google no las muestra para reseñas
  publicadas por el propio negocio.
- **Accesibilidad**: pares de color con contraste WCAG AA, enlace "Saltar al contenido", foco visible,
  menú operable con teclado (Esc lo cierra) y sin animaciones con `prefers-reduced-motion`.
- **Analítica**: Teradive (script al final de `index.html`).
