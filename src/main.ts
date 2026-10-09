import './estilo.css';
import {
  actualizar,
  CONFIG,
  crearEstadoInicial,
  iniciar,
  reanudar,
  reiniciar,
  soltar,
  alternarPausa,
  type Bloque,
  type EstadoJuego,
} from './logica.ts';

const elementoRaiz = document.querySelector<HTMLDivElement>('#app');

if (!elementoRaiz) {
  throw new Error('No se encontró el contenedor principal del juego.');
}

const contenedor: HTMLDivElement = elementoRaiz;

function obtenerElemento<T extends Element>(selector: string): T {
  const elemento = contenedor.querySelector<T>(selector);
  if (!elemento) {
    throw new Error(`No se encontró el elemento requerido: ${selector}`);
  }
  return elemento;
}

contenedor.innerHTML = `
  <main class="juego">
    <header class="encabezado">
      <div class="marca">
        <p class="sobre-titulo">RETO DE PRECISIÓN - TORRE QUE CRECE</p>
        <h1>STACK TOWER<span>DELUXE</span></h1>
      </div>
      <div class="marcadores" aria-live="polite">
        <div class="marcador">
          <span class="etiqueta">PUNTAJE</span>
          <strong id="puntuacion">0</strong>
        </div>
        <div class="marcador marcador-record">
          <span class="etiqueta">RÉCORD</span>
          <strong id="record">0</strong>
        </div>
      </div>
    </header>

    <section class="panel-juego" aria-label="Área de juego">
      <div class="barra-estado">
        <span id="estado-texto">LISTA PARA EMPEZAR</span>
        <span id="pisos-texto">0 pisos</span>
      </div>
      <div id="campo" class="campo" aria-label="Torre en construcción">
        <div class="rejilla" aria-hidden="true"></div>
        <div id="torre" class="torre"></div>
        <div id="sobrante" class="bloque sobrante" hidden></div>
        <div id="bloque-movil" class="bloque bloque-movil"></div>
        <div class="linea-base" aria-hidden="true"></div>
        <div id="superado" class="insignia" hidden>¡RÉCORD SUPERADO!</div>

        <div id="pantalla-inicio" class="capa">
          <div class="tarjeta">
            <p class="sobre-titulo">APILÁ CON PRECISIÓN</p>
            <h2>Construí tu torre</h2>
            <p>Soltá cada bloque sobre el anterior. El sobrante se recorta.</p>
            <button class="boton boton-principal" data-accion="iniciar" type="button">Empezar</button>
            <p class="ayuda">Tocá la pantalla o presioná ESPACIO para soltar.</p>
          </div>
        </div>

        <div id="pantalla-pausa" class="capa" hidden>
          <div class="tarjeta">
            <p class="sobre-titulo">JUEGO EN PAUSA</p>
            <h2>Tomate un respiro</h2>
            <button class="boton boton-principal" data-accion="reanudar" type="button">Continuar</button>
          </div>
        </div>

        <div id="pantalla-final" class="capa" hidden>
          <div class="tarjeta tarjeta-final">
            <p class="sobre-titulo">FIN DE LA PARTIDA</p>
            <h2 id="aviso-final">¡Torre derribada!</h2>
            <p>Puntaje final: <strong id="puntaje-final">0</strong></p>
            <button class="boton boton-principal" data-accion="reiniciar" type="button">Intentar de nuevo</button>
          </div>
        </div>
      </div>
    </section>

    <footer class="controles">
      <p class="instruccion">TOCÁ LA PANTALLA O PRESIONÁ <kbd>ESPACIO</kbd> PARA SOLTAR</p>
      <div class="acciones">
        <button class="boton boton-secundario" id="boton-pausa" data-accion="pausar" type="button">Pausar</button>
        <button class="boton boton-secundario" data-accion="reiniciar" type="button">Reiniciar</button>
      </div>
    </footer>
    <p class="nota">Sin apuro. Un bloque a la vez.</p>
  </main>
`;

const campo = obtenerElemento<HTMLDivElement>('#campo');
const torreElemento = obtenerElemento<HTMLDivElement>('#torre');
const bloqueMovilElemento = obtenerElemento<HTMLDivElement>('#bloque-movil');
const sobranteElemento = obtenerElemento<HTMLDivElement>('#sobrante');
const puntuacionElemento = obtenerElemento<HTMLElement>('#puntuacion');
const recordElemento = obtenerElemento<HTMLElement>('#record');
const pisosElemento = obtenerElemento<HTMLElement>('#pisos-texto');
const estadoTextoElemento = obtenerElemento<HTMLElement>('#estado-texto');
const puntuacionFinalElemento = obtenerElemento<HTMLElement>('#puntaje-final');
const avisoFinalElemento = obtenerElemento<HTMLElement>('#aviso-final');
const pantallaInicio = obtenerElemento<HTMLDivElement>('#pantalla-inicio');
const pantallaPausa = obtenerElemento<HTMLDivElement>('#pantalla-pausa');
const pantallaFinal = obtenerElemento<HTMLDivElement>('#pantalla-final');
const insignia = obtenerElemento<HTMLDivElement>('#superado');
const botonPausa = obtenerElemento<HTMLButtonElement>('#boton-pausa');

const estado: EstadoJuego = crearEstadoInicial();
let cantidadBloquesDibujados = -1;
let tiempoAnterior = 0;

function posicionarBloque(elemento: HTMLElement, bloque: Bloque, pisoBase: number): void {
  const anchoCampo = CONFIG.LIMITE_DERECHO - CONFIG.LIMITE_IZQUIERDO;
  const porcentajeIzquierdo = ((bloque.x - CONFIG.LIMITE_IZQUIERDO) / anchoCampo) * 100;
  const porcentajeAncho = (bloque.ancho / anchoCampo) * 100;

  elemento.style.left = `${porcentajeIzquierdo}%`;
  elemento.style.width = `${porcentajeAncho}%`;
  elemento.style.bottom = `${(bloque.piso - pisoBase) * CONFIG.ALTO_BLOQUE}px`;
}

function dibujarTorre(): void {
  const pisoSuperior = estado.torre[estado.torre.length - 1]?.piso ?? 0;
  const pisosVisibles = Math.max(
    1,
    Math.floor(campo.clientHeight / CONFIG.ALTO_BLOQUE) - 1,
  );
  const pisoBase = Math.max(0, pisoSuperior - pisosVisibles + 1);

  torreElemento.replaceChildren();
  for (const bloque of estado.torre) {
    if (bloque.piso < pisoBase) {
      continue;
    }

    const elemento = document.createElement('div');
    elemento.className = 'bloque bloque-fijo';
    elemento.setAttribute('aria-hidden', 'true');
    posicionarBloque(elemento, bloque, pisoBase);
    torreElemento.append(elemento);
  }

  const bloqueActual = estado.bloqueMovil;
  if (bloqueActual.piso >= pisoBase) {
    posicionarBloque(bloqueMovilElemento, bloqueActual, pisoBase);
  }

  if (estado.ultimoSobrante && estado.ultimoSobrante.piso >= pisoBase) {
    posicionarBloque(sobranteElemento, estado.ultimoSobrante, pisoBase);
    sobranteElemento.hidden = false;
  } else {
    sobranteElemento.hidden = true;
  }

  cantidadBloquesDibujados = estado.torre.length;
}

function mostrarFase(): void {
  pantallaInicio.hidden = estado.fase !== 'inicio';
  pantallaPausa.hidden = estado.fase !== 'pausado';
  pantallaFinal.hidden = estado.fase !== 'terminado';
  botonPausa.disabled = estado.fase !== 'jugando';
  estadoTextoElemento.textContent = {
    inicio: 'LISTA PARA EMPEZAR',
    jugando: 'TORRE EN CONSTRUCCIÓN',
    pausado: 'JUEGO EN PAUSA',
    terminado: 'PARTIDA TERMINADA',
  }[estado.fase];

  if (estado.fase === 'terminado') {
    avisoFinalElemento.textContent = estado.aviso ?? 'Fin de la partida';
    puntuacionFinalElemento.textContent = String(estado.puntuacion);
  }
}

function dibujar(): void {
  puntuacionElemento.textContent = String(estado.puntuacion);
  recordElemento.textContent = String(estado.record);
  pisosElemento.textContent = `${estado.puntuacion} ${estado.puntuacion === 1 ? 'piso' : 'pisos'}`;
  insignia.hidden = !estado.recordSuperado;
  mostrarFase();

  if (cantidadBloquesDibujados !== estado.torre.length) {
    dibujarTorre();
    return;
  }

  const pisoSuperior = estado.torre[estado.torre.length - 1]?.piso ?? 0;
  const pisosVisibles = Math.max(1, Math.floor(campo.clientHeight / CONFIG.ALTO_BLOQUE) - 1);
  const pisoBase = Math.max(0, pisoSuperior - pisosVisibles + 1);
  posicionarBloque(bloqueMovilElemento, estado.bloqueMovil, pisoBase);
}

function manejarAccion(accion: string): void {
  switch (accion) {
    case 'iniciar':
      iniciar(estado);
      break;
    case 'reanudar':
      reanudar(estado);
      break;
    case 'pausar':
      alternarPausa(estado);
      break;
    case 'reiniciar':
      reiniciar(estado);
      break;
    default:
      return;
  }
  dibujar();
}

contenedor.addEventListener('click', (evento: MouseEvent) => {
  const objetivo = evento.target;
  if (!(objetivo instanceof Element)) {
    return;
  }

  const boton = objetivo.closest<HTMLButtonElement>('[data-accion]');
  if (boton) {
    manejarAccion(boton.dataset.accion ?? '');
    return;
  }

  if (campo.contains(objetivo) && estado.fase === 'jugando') {
    soltar(estado);
    dibujar();
  }
});

document.addEventListener('keydown', (evento: KeyboardEvent) => {
  if (evento.code !== 'Space' || evento.repeat) {
    return;
  }

  if (evento.target instanceof HTMLButtonElement) {
    return;
  }

  evento.preventDefault();
  if (estado.fase === 'jugando') {
    soltar(estado);
    dibujar();
  }
});

function animar(tiempo: number): void {
  if (tiempoAnterior !== 0 && estado.fase === 'jugando') {
    actualizar(estado, Math.min((tiempo - tiempoAnterior) / 1000, 0.05));
    posicionarBloque(
      bloqueMovilElemento,
      estado.bloqueMovil,
      Math.max(
        0,
        (estado.torre[estado.torre.length - 1]?.piso ?? 0) -
          Math.floor(campo.clientHeight / CONFIG.ALTO_BLOQUE) +
          2,
      ),
    );
  }

  tiempoAnterior = tiempo;
  requestAnimationFrame(animar);
}

window.addEventListener('resize', dibujar);
dibujar();
requestAnimationFrame(animar);
