# Simulador de Examen

Web estática (HTML + CSS + JS puro, sin frameworks ni build) para practicar
exámenes tipo test a partir de un banco de preguntas en `questions.json`.

## Cómo funciona

1. Al abrir la página, se carga `questions.json`.
2. Introduces cuántas preguntas quieres en el examen de prueba.
3. Se eligen esa cantidad de preguntas al azar del banco.
4. Cada pregunta muestra el enunciado y 4 opciones con radio button (solo se
   puede marcar una).
5. Cada pregunta tiene su propio botón **"Revelar respuesta"**: al pulsarlo se
   marca en verde la opción correcta, en rojo la que marcaste si era
   incorrecta, y el título de la pregunta se pinta de verde o rojo según
   acertaste o no.
6. El botón **"Nuevo examen"** genera otro examen con el mismo número de
   preguntas, evitando repetir las que ya han salido en exámenes anteriores
   de la sesión actual (mientras el banco tenga preguntas nuevas suficientes;
   si se agotan, se reinicia el reparto).
7. Si recargas la página, todo vuelve al estado inicial (la "memoria" de
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

Para usar tus propias preguntas, sustituye el contenido de `questions.json`
manteniendo este formato (puedes tener tantas preguntas como quieras en el
banco).

## Estructura del proyecto

```
index.html      → estructura de la página (pantalla de configuración + examen)
style.css       → estilos
script.js       → lógica: carga del JSON, selección aleatoria, corrección
questions.json  → banco de preguntas (edítalo con las tuyas)
```

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
