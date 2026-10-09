# TORRE QUE CRECE

## 1. Nombre y frase

**Nombre:** Stack Tower Deluxe - Torre que crece

**En una frase:** Es un juego donde apilas bloques que se mueven de lado a lado para construir la torre más alta posible, pero lo que sobresale del bloque anterior se corta y se cae.

## 2. Qué hace y cómo se usa

Apilá los bloques móviles para construir una torre y sumar pisos.
Tocá el área de juego o presioná **Espacio** para soltar cada bloque; también podés pausar y reiniciar.
Superá los 20 pisos para romper el récord personal; si el bloque no queda sobre la plataforma, termina la partida.

## 3. Enlace para abrirlo

[Abrir Torre que crece](http://localhost:5173/) (con el servidor local en ejecución).

## 4. Cómo correrlo en otra máquina y en celular 

Requisitos: Node.js y npm instalados.

Desde la carpeta del proyecto, ejecutá:

```sh
npm install
npm run dev
```

Luego abrí en el navegador la dirección que indique Vite, normalmente `http://localhost:5173/`.

En caso de hacerlo en celular hacelo desde esta url: `https://sixty-wasps-kiss.loca.lt/`.

## 5. Qué dirigí yo y qué error encontré probando

Dirigí la estructuración del proyecto separando completamente la lógica en src/logica.ts (manejando las coordenadas del bloque móvil, la velocidad de desplazamiento, el cálculo matemático del ancho restante al cortar el bloque, y el estado de la torre) de la interfaz visual en src/main.ts. Además, guié al agente para establecer los límites de tamaño en pantallas táctiles (mínimo 44px) y asegurar que el diseño cumpliera estrictamente  mi ficha inicial.

## 6. Declaración de autoría

Al realizar la prueba del recorrido completo (la prueba número 5), me percaté de que al cortar un bloque muy pequeño de forma consecutiva, el cálculo del ancho llegaba a números decimales negativos o cercanos a cero que rompían la animación y no disparaban el estado de "Game Over" correctamente. Tuve que indicarle al agente mediante un prompt específico de corrección que añadiera un límite mínimo de tolerancia (minWidth) en la lógica para que la torre se derrumbara formalmente al fallar el cálculo por completo.
