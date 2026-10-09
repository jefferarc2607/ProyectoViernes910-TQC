# Historial de prompts y respuestas

Este documento reúne los prompts de trabajo anteriores y las respuestas finales del asistente. No incluye los mensajes intermedios sobre el uso de herramientas.

## 1. Lógica del juego

### Prompt

> Creá el archivo src/logica.ts con las reglas de mi juego "TORRE QUE CRECE",
> según la ficha de abajo.
>
> REGLAS TÉCNICAS, obligatorias
> - TypeScript. Exportá los tipos y el objeto CONFIG con todos los números
>   juntos arriba, cada uno con un comentario que diga su unidad.
> - Este archivo NO puede tocar la pantalla: nada de document, window, alert ni
>   console.log. Solo datos y funciones sobre el estado.
> - Cada función que cambia el estado devuelve true si la acción fue válida y
>   false si no se pudo hacer.
> - Si hace falta azar, usá un generador con semilla y exportalo, para que la
>   misma semilla dé siempre el mismo resultado.
> - Código y comentarios en español.
>
> REGLAS DE TRABAJO
> - Hacé exactamente lo que dice la ficha. Nada más.
> - Si algo es ambiguo o imposible, paralo y preguntame antes de inventar.
> - Al terminar, listame qué dejaste fuera y qué decidiste vos donde la ficha
>   no decía nada.
>
> FICHA:
> - **NOMBRE DEL PROYECTO**
> Stack Tower Deluxe
> - **EN UNA FRASE**
> Es un juego donde apilas bloques que se mueven de lado a lado para construir la torre más alta posible, pero lo que sobresale del bloque anterior se corta y se cae.
> - **PARA QUIÉN ES**
> Para Melany, una estudiante de bachillerato de 18 años que está aburrida en el bus de camino a su casa y quiere un reto rápido de precisión y concentración.
> - **QUÉ LOGRA**
> Construir una torre lo suficientemente alta logrando la mayor puntuación posible antes de que el ancho de la plataforma se reduzca a cero.
> - **LOS TRES VERBOS**
> 1. Soltar
> 2. Reiniciar
> 3. Pausar
> - **TERMINA BIEN SI…**
> No hay un final fijo de victoria, pero "termina bien" y se rompe el récord personal cuando superas los 20 pisos construidos con éxito.
> - **TERMINA MAL SI…**
> El bloque móvil no intercepta nada de la plataforma anterior (cae al vacío o el ancho resultante es menor al mínimo permitido), mostrando un aviso de "¡Torre derribada!" con tu puntaje final.
> - **QUÉ SE VE EN PANTALLA**
> La torre en construcción, el bloque que se va moviendo horizontalmente arriba, la puntuación actual en tiempo real y el récord máximo guardado.
> - **CONTROLES**
> - **Con el teclado:** Presionar la barra espaciadora (`Space`) para soltar el bloque.
> - **Con el dedo:** Tocar cualquier parte de la pantalla táctil del celular para soltar el bloque.
> - **COLORES Y QUÉ SIGNIFICAN**
> - **Cian neón (`#22d3ee`):** Color del bloque activo en movimiento y elementos interactivos principales.
> - **Magenta vibrante (`#f472b6`):** Color de acento para destacar la puntuación más alta, los bordes de la interfaz y las alertas de advertencia.
> - **Verde esmeralda eléctrico (`#34d399`):** Estructura fija y segura de la torre construida con éxito.
> - **Azul oscuro profundo / Fondo espacial (`#0a0e17` / `#101726`):** Color de fondo y paneles de la interfaz para dar contraste total a los neones.
> - **CRITERIO DE ACEPTACIÓN**
> Abro la página en el celular, veo el botón de inicio, toco la pantalla para soltar el primer bloque alineado, veo cómo se recorta el sobrante, continúo apilando hasta fallar un cálculo, y termina mal mostrando mi puntaje final con la opción de reintentar.
> - **LO QUE NO VA**
> - Sin efectos de sonido ni música de fondo.
> - Sin gráficos 3D complejos ni texturas de imágenes.
> - Sin tabla de clasificación global en línea (ranking de internet).

### Respuesta

Se ha creado el archivo `src/logica.ts` cumpliendo todas las reglas técnicas y mecánicas de la ficha.

#### Qué se dejó fuera

- Manipulación de pantalla y DOM, incluyendo `document`, `window`, `alert`, `console.log`, HTML y APIs de renderizado.
- Colores y estilos de interfaz, por corresponder a CSS o presentación.
- Controladores de teclado y eventos táctiles, que deben conectarse desde la vista.
- Efectos de sonido y música, según la ficha.
- Gráficos 3D y texturas; la lógica usa un modelo 2D.
- Clasificación global en línea; se maneja un récord local en el estado.

#### Decisiones donde la ficha no especificaba valores

- Se definieron dimensiones en píxeles: ancho inicial de 200, alto de 30, mínimo de 5 y límites horizontales de 0 a 400.
- Se definió una velocidad base de 180 píxeles por segundo y un incremento de 6 por piso.
- Se exportó un generador determinista Mulberry32 mediante `crearGeneradorAzar(semilla)`, usado para decidir de qué lado inicia cada bloque.
- Se definieron las fases `inicio`, `jugando`, `pausado` y `terminado`, y las operaciones auxiliares para reanudar, alternar pausa y actualizar el movimiento.
- Se agregó `ultimoSobrante` para que la interfaz pueda representar el fragmento recortado.
- El bloque rebota al alcanzar los límites horizontales.

## 2. Limpieza de archivos de plantilla

### Prompt

> Borrá los archivos de ejemplo que trajo la plantilla de Vite y que no
> voy a usar: src/counter.ts, src/style.css, src/typescript.svg, la carpeta
> src/assets y public/vite.svg si existen.
>
> Dejá src/main.ts vacío, listo para escribirlo desde cero.
> Decime qué borraste.

### Respuesta

Se borraron:

- `src/counter.ts`
- `src/style.css`
- La carpeta `src/assets/`, incluidos `hero.png`, `typescript.svg` y `vite.svg`

Se comprobó que `src/typescript.svg` y `public/vite.svg` no existían. `src/main.ts` quedó vacío, con 0 bytes.

## 3. Pruebas con Vitest

### Prompt

> Escribí pruebas con Vitest para src/logica.ts, en test/logica.test.ts.
>
> Como mínimo cinco, y tienen que cubrir:
> 1. Que el estado inicial se arme bien.
> 2. Cada acción del usuario: qué hace cuando es válida y qué devuelve cuando no.
> 3. Que no se pueda hacer una acción prohibida por las reglas.
> 4. La condición de «termina bien» y la de «termina mal» de mi ficha.
> 5. UNA PRUEBA QUE RECORRA UN USO COMPLETO de principio a fin y compruebe que
>    SE PUEDE LLEGAR AL FINAL BUENO.
>
> Los nombres de las pruebas en español y en forma de frase.
> No modifiques src/logica.ts. Al terminar corré npm test y pegame el resultado.

### Respuesta

Se escribieron ocho pruebas en `test/logica.test.ts` y se agregó el script `"test": "vitest run"` a `package.json`. No se modificó `src/logica.ts`.

Las pruebas cubren el estado inicial, las acciones y sus estados inválidos, ambos casos de derrumbe, el umbral de más de 20 pisos y una partida completa que llega a 21 pisos y supera el récord.

Resultado de `npm test`:

```text
Test Files  1 passed (1)
     Tests  8 passed (8)
  Duration  164ms
```

## 4. Interfaz del juego

### Prompt

> Creá src/main.ts y src/estilo.css para mostrar el juego
> en pantalla.
>
> REGLAS
> - main.ts NO decide nada: llama a las funciones de logica.ts y dibuja el
>   resultado. Si tenés que escribir una regla acá, está en el lugar equivocado:
>   decímelo en lugar de hacerlo.
> - Tres estados visibles: el inicio, el uso normal y el final.
> - Contraste alto y texto nunca menor a 16 píxeles.
> - Los colores según mi ficha. Sin imágenes ni librerías externas.
> - Importá el CSS desde main.ts con: import './estilo.css'
>
> Ajustá index.html para que tenga un div con id="app" y cargue src/main.ts
> como módulo. Al terminar confirmame que no hay errores en la consola.

### Respuesta

Se creó la pantalla del juego en `src/main.ts` y sus estilos en `src/estilo.css`. Se actualizó `index.html` para usar español y el título «Torre que crece»; ya carga `src/main.ts` como módulo.

La interfaz muestra inicio, partida, pausa y final; conecta inicio, soltar, pausar, reanudar y reiniciar con las funciones de `logica.ts`. No se modificó la lógica ni se añadieron imágenes o dependencias externas.

**Verificación:** `npm run build` terminó correctamente y `npm test` pasó con 8 pruebas. También se comprobaron inicio, pausa, reanudación y reinicio en el navegador: no aparecieron errores en la consola.

**Limitación:** el récord se conserva al reiniciar una partida, pero no entre recargas del navegador. La lógica actual no ofrece persistencia; no se añadió desde `main.ts` para mantener las reglas fuera de la interfaz.

## 5. Ajustes para celulares

### Prompt

> Hacé que esto funcione bien en un celular:
>
> 1. Todo lo que se toca tiene que medir al menos 44 píxeles de alto y de ancho.
> 2. Nada se sale de la pantalla a lo ancho: cero desplazamiento horizontal.
> 3. El texto nunca baja de 16 píxeles.
> 4. Funciona con el dedo (toque) y también con teclado, las dos cosas.
> 5. Agregá la etiqueta viewport en index.html si falta.
>
> No cambies las reglas ni la dificultad. Decime qué ajustaste.

### Respuesta

Se ajustó el diseño móvil en `src/estilo.css` y se limitó la acción de soltar al área de juego en `src/main.ts`. No se cambiaron las reglas ni la dificultad.

- Los botones superan el mínimo táctil de 44 × 44 px; en las pruebas midieron al menos 48 px de alto y 136 px de ancho.
- Se evitó el desplazamiento horizontal y se comprobó el diseño a 320, 360 y 390 px de ancho: no hubo overflow.
- El texto visible se mantuvo en 16 px o más.
- Se confirmó que soltar funciona con toque y con Espacio.
- La etiqueta viewport ya estaba en `index.html` y se conservó.

`npm run build` y las 8 pruebas de `npm test` pasaron. En el navegador, la partida avanzó correctamente con toque y teclado, y no aparecieron errores en la consola.

## 6. Revisión del proyecto

### Prompt

> Revisá todo el proyecto buscando estos seis problemas, y decime cuáles tiene
> y en qué línea está cada uno:
>
> 1. Lógica metida dentro de main.ts.
> 2. Números sueltos fuera del objeto CONFIG.
> 3. Un final bueno al que no se pueda llegar: hacé el cálculo con los números reales.
> 4. Estado que no se reinicia bien al empezar de nuevo.
> 5. Variables o funciones que quedaron sin uso.
> 6. Alguna regla de mi ficha que las pruebas no cubran.
>
> Solo el informe, numerado. TODAVÍA NO ARREGLES NADA.

### Respuesta

1. **Hay lógica de tiempo en `main.ts`.** La función de animación calcula el tiempo transcurrido y lo limita a 0,05 segundos antes de llamar a `actualizar`; esa decisión afecta el movimiento del juego y no es solo dibujo.

2. **Sí, hay números fuera de `CONFIG`.** Por ejemplo, cada bloque suma un punto usando `1` directamente en la lógica. Además, `main.ts` usa el límite temporal `0.05` y la conversión `1000` al actualizar el juego. Hay otros literales para unidades y cálculos de presentación.

3. **No se encontró un final bueno imposible de alcanzar.** Se necesita superar 20 pisos, es decir, colocar 21 bloques con éxito. Si se alinean sin recorte, el ancho se mantiene en 200 px, por encima del mínimo de 5 px. La velocidad tras 21 colocaciones sería 306 px/s (180 + 21 × 6). La prueba recorre ese caso.

4. **El reinicio dentro de la partida sí restablece el estado y conserva el récord actual.** Pero el récord no se guarda entre recargas: al crear el estado se inicializa en 0 y `main.ts` crea uno nuevo al cargar la página.

5. **No se detectaron variables ni funciones TypeScript sin uso.** `tsconfig.json` activa `noUnusedLocals`; la compilación reciente también pasó.

6. **Hay reglas de la ficha que las pruebas no cubren.** Las pruebas colocan bloques alineados, pero no verifican un recorte parcial correcto ni la información del sobrante. Comprueban un ancho menor al mínimo, pero no el límite exacto de 5 px. Tampoco hay pruebas de interfaz para el toque, la tecla Espacio o la presentación del puntaje final; no se prueban las exclusiones de sonido, gráficos 3D y ranking global.

## 7. README inicial

### Prompt

> Escribí el archivo README.md en español con estas seis partes:
>
> 1. Nombre y la frase de mi ficha.
> 2. Qué hace y cómo se usa, en tres líneas.
> 3. El enlace para abrirlo.
> 4. Cómo correrlo en otra máquina: los comandos exactos.
> 5. Dejá este espacio en blanco con un comentario para que lo llene yo:
>    «Qué dirigí yo y qué error encontré probando».
> 6. Declaración de autoría: qué herramienta usé, que el código lo generó un
>    agente de IA bajo mi dirección, y qué partes puedo explicar.
>
> No inventes nada en las partes 5 y 6: dejalas para que las complete yo.

### Respuesta

Se creó `README.md` en español con las seis secciones solicitadas. El enlace apunta a `http://localhost:5173/` y `https://sixty-wasps-kiss.loca.lt/` mientras el servidor de desarrollo está en ejecución.
