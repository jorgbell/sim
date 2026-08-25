# Simulador de Examen

Web estática (HTML + CSS + JS puro, sin frameworks ni build) para practicar
exámenes tipo test a partir de bancos de preguntas en `questions.json`.

La página principal ofrece **3 secciones** (exámenes distintos), cada una con
su propio banco de preguntas. Cada sección funciona de forma independiente.

## Cómo funciona

1. Al abrir la página principal (`index.html`), se muestran 3 botones, uno
   por sección. Cada botón lleva a su propio examen.
2. Dentro de una sección se carga su `questions.json` correspondiente.
3. Introduces cuántas preguntas quieres en el examen de prueba.
4. Se eligen esa cantidad de preguntas al azar del banco de esa sección.
5. Cada pregunta muestra el enunciado y 4 opciones con radio button (solo se
   puede marcar una).
6. Cada pregunta tiene su propio botón **"Revelar respuesta"**: al pulsarlo se
   marca en verde la opción correcta, en rojo la que marcaste si era
   incorrecta, y el título de la pregunta se pinta de verde o rojo según
   acertaste o no.
7. Arriba del examen hay un botón **"👁️ Revelar todas"** que corrige de golpe
   todas las preguntas que aún no se hayan revelado individualmente.
8. El botón **"Nuevo examen"** genera otro examen con el mismo número de
   preguntas, evitando repetir las que ya han salido en exámenes anteriores
   de la sesión actual dentro de esa misma sección (mientras el banco tenga
   preguntas nuevas suficientes; si se agotan, se reinicia el reparto).
9. Si recargas la página, todo vuelve al estado inicial (la "memoria" de
   preguntas usadas vive solo en la variable de JavaScript en memoria, no se
   guarda en ningún sitio).

## Formato de `questions.json`

Un array de objetos con esta forma:

```json
[
  {
    "pregunta": "¿Cuál es la capital de Francia?",
    "opciones": ["Madrid", "París", "Roma", "Berlín"],
    "correcta": 1
  }
]
```

- `pregunta`: texto del enunciado.
- `opciones`: array de exactamente 4 textos (el orden es el que se muestra).
- `correcta`: índice (0, 1, 2 o 3) de la opción correcta dentro de `opciones`.

Para usar tus propias preguntas, sustituye el contenido del `questions.json`
de la sección que quieras editar, manteniendo este formato (puedes tener
tantas preguntas como quieras en el banco).

## Estructura del proyecto

```
index.html                     → página principal con los 3 botones de acceso
style.css                      → estilos compartidos
script.js                      → lógica compartida: carga del JSON, selección aleatoria, corrección
secciones/
  examen1/
    index.html                 → pantalla de configuración + examen de esta sección
    questions.json             → banco de preguntas de esta sección
  examen2/
    index.html
    questions.json
  examen3/
    index.html
    questions.json
```

Cada `index.html` de sección enlaza al `style.css` y `script.js` compartidos
(en la raíz) y carga su propio `questions.json` (el que está en su misma
carpeta). Para añadir una sección nueva, duplica una de las carpetas de
`secciones/`, cambia su `questions.json` y añade un botón más en el
`index.html` de la raíz que apunte a la nueva carpeta.

## Probarlo en local

Como el JS usa `fetch()` para leer `questions.json`, algunos navegadores
bloquean esa petición si abres `index.html` directamente con `file://`.
Lo más sencillo es levantar un servidor local simple, por ejemplo:

```bash
# Python 3
python3 -m http.server 8000

# o con Node
npx serve .
```

y luego abrir `http://localhost:8000`.

## Publicar en GitHub Pages

1. Sube esta carpeta a un repositorio de GitHub.
2. Ve a **Settings → Pages**.
3. En "Source", elige la rama (por ejemplo `main`) y la carpeta raíz (`/`).
4. Guarda. En unos minutos la web estará disponible en
   `https://<tu-usuario>.github.io/<nombre-del-repo>/`.

No hace falta ningún paso de build: al ser HTML/CSS/JS/JSON planos, GitHub
Pages los sirve directamente.
