// ============================================================================
// CONFIGURACIÓN NUMÉRICA DEL JUEGO "TORRE QUE CRECE" (Stack Tower Deluxe)
// Todos los números se concentran aquí, con su unidad explícita en comentarios.
// ============================================================================

export const CONFIG = {
  // Ancho inicial de la plataforma base y del primer bloque móvil
  ANCHO_INICIAL: 200, // píxeles

  // Altura constante de cada bloque o piso de la torre
  ALTO_BLOQUE: 30, // píxeles

  // Ancho mínimo necesario para que un bloque cortado no caiga al vacío
  ANCHO_MINIMO: 5, // píxeles

  // Límite horizontal izquierdo del área de desplazamiento del bloque
  LIMITE_IZQUIERDO: 0, // píxeles

  // Límite horizontal derecho del área de desplazamiento del bloque
  LIMITE_DERECHO: 400, // píxeles

  // Velocidad de traslación horizontal base del bloque móvil
  VELOCIDAD_INICIAL: 180, // píxeles por segundo

  // Incremento de velocidad horizontal que se suma por cada piso colocado con éxito
  INCREMENTO_VELOCIDAD: 6, // píxeles por segundo por piso

  // Cantidad de pisos necesarios para romper el récord y superar el reto personal
  PISOS_OBJETIVO_RECORD: 20, // pisos

  // Umbral de probabilidad para decidir aleatoriamente si el bloque inicia a la izquierda o derecha
  UMBRAL_DIRECCION_AZAR: 0.5, // probabilidad (rango de 0 a 1)

  // Semilla numérica inicial por defecto para el generador determinista
  SEMILLA_PREDETERMINADA: 12345, // unidad adimensional
} as const;

// ============================================================================
// DEFINICIÓN DE TIPOS
// ============================================================================

export type ConfigJuego = typeof CONFIG;

export type FaseJuego = 'inicio' | 'jugando' | 'pausado' | 'terminado';

export type DireccionHorizontal = 1 | -1; // 1 = hacia la derecha, -1 = hacia la izquierda

export interface Bloque {
  x: number;
  ancho: number;
  piso: number;
}

export interface BloqueMovil extends Bloque {
  direccion: DireccionHorizontal;
}

export interface BloqueSobrante {
  x: number;
  ancho: number;
  piso: number;
  lado: 'izquierdo' | 'derecho';
}

export type GeneradorAzar = () => number;

export interface EstadoJuego {
  fase: FaseJuego;
  puntuacion: number;
  record: number;
  recordSuperado: boolean;
  velocidad: number;
  torre: Bloque[];
  bloqueMovil: BloqueMovil;
  ultimoSobrante: BloqueSobrante | null;
  aviso: string | null;
  semilla: number;
  azar: GeneradorAzar;
}

// ============================================================================
// GENERADOR PSEUDOALEATORIO CON SEMILLA (Mulberry32)
// Garantiza que la misma semilla produzca exactamente la misma secuencia.
// ============================================================================

export function crearGeneradorAzar(semilla: number): GeneradorAzar {
  let s = Math.floor(semilla) >>> 0;
  return function siguiente(): number {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ============================================================================
// FUNCIONES AUXILIARES INTERNAS
// ============================================================================

function crearBloqueBase(): Bloque {
  const xCentrado = (CONFIG.LIMITE_DERECHO - CONFIG.LIMITE_IZQUIERDO - CONFIG.ANCHO_INICIAL) / 2;
  return {
    x: xCentrado,
    ancho: CONFIG.ANCHO_INICIAL,
    piso: 0,
  };
}

function generarSiguienteBloqueMovil(ancho: number, piso: number, azar: GeneradorAzar): BloqueMovil {
  const iniciaPorIzquierda = azar() < CONFIG.UMBRAL_DIRECCION_AZAR;
  const direccion: DireccionHorizontal = iniciaPorIzquierda ? 1 : -1;
  const x = iniciaPorIzquierda ? CONFIG.LIMITE_IZQUIERDO : CONFIG.LIMITE_DERECHO - ancho;

  return {
    x,
    ancho,
    piso,
    direccion,
  };
}

// ============================================================================
// INICIALIZACIÓN DEL ESTADO
// ============================================================================

export function crearEstadoInicial(semilla: number = CONFIG.SEMILLA_PREDETERMINADA): EstadoJuego {
  const generador = crearGeneradorAzar(semilla);
  const base = crearBloqueBase();
  const primerMovil = generarSiguienteBloqueMovil(CONFIG.ANCHO_INICIAL, 1, generador);

  return {
    fase: 'inicio',
    puntuacion: 0,
    record: 0,
    recordSuperado: false,
    velocidad: CONFIG.VELOCIDAD_INICIAL,
    torre: [base],
    bloqueMovil: primerMovil,
    ultimoSobrante: null,
    aviso: null,
    semilla,
    azar: generador,
  };
}

// ============================================================================
// FUNCIONES DE MUTACIÓN DEL ESTADO (Devuelven true si la acción fue válida)
// ============================================================================

/**
 * Pasa de la pantalla de inicio a jugar activamente.
 */
export function iniciar(estado: EstadoJuego): boolean {
  if (estado.fase !== 'inicio') {
    return false;
  }
  estado.fase = 'jugando';
  return true;
}

/**
 * VERBO 1: SOLTAR
 * Suelta el bloque móvil sobre la plataforma superior de la torre.
 * Si no intercepta o el ancho resultante es menor al mínimo, la torre se derriba.
 * Si intercepta con éxito, recorta el sobrante y coloca el nuevo piso.
 */
export function soltar(estado: EstadoJuego): boolean {
  if (estado.fase !== 'jugando') {
    return false;
  }

  const plataformaActual = estado.torre[estado.torre.length - 1];
  const inicioInterseccion = Math.max(plataformaActual.x, estado.bloqueMovil.x);
  const finInterseccion = Math.min(
    plataformaActual.x + plataformaActual.ancho,
    estado.bloqueMovil.x + estado.bloqueMovil.ancho
  );
  const anchoInterseccion = finInterseccion - inicioInterseccion;

  // Si cae al vacío o queda por debajo del ancho mínimo permitido, termina mal
  if (anchoInterseccion <= 0 || anchoInterseccion < CONFIG.ANCHO_MINIMO) {
    estado.fase = 'terminado';
    estado.aviso = '¡Torre derribada!';
    estado.ultimoSobrante = {
      x: estado.bloqueMovil.x,
      ancho: estado.bloqueMovil.ancho,
      piso: estado.bloqueMovil.piso,
      lado: estado.bloqueMovil.x < plataformaActual.x ? 'izquierdo' : 'derecho',
    };
    return true;
  }

  // Se calcula el recorte sobrante
  if (estado.bloqueMovil.x < plataformaActual.x) {
    const anchoSobrante = plataformaActual.x - estado.bloqueMovil.x;
    estado.ultimoSobrante = {
      x: estado.bloqueMovil.x,
      ancho: anchoSobrante,
      piso: estado.bloqueMovil.piso,
      lado: 'izquierdo',
    };
  } else if (
    estado.bloqueMovil.x + estado.bloqueMovil.ancho >
    plataformaActual.x + plataformaActual.ancho
  ) {
    const anchoSobrante =
      estado.bloqueMovil.x + estado.bloqueMovil.ancho - (plataformaActual.x + plataformaActual.ancho);
    estado.ultimoSobrante = {
      x: plataformaActual.x + plataformaActual.ancho,
      ancho: anchoSobrante,
      piso: estado.bloqueMovil.piso,
      lado: 'derecho',
    };
  } else {
    estado.ultimoSobrante = null;
  }

  // Se añade el nuevo bloque recortado a la torre
  const nuevoPiso = estado.bloqueMovil.piso;
  const nuevoBloqueFijo: Bloque = {
    x: inicioInterseccion,
    ancho: anchoInterseccion,
    piso: nuevoPiso,
  };
  estado.torre.push(nuevoBloqueFijo);

  // Se actualiza la puntuación y récords
  estado.puntuacion += 1;
  if (estado.puntuacion > estado.record) {
    estado.record = estado.puntuacion;
  }
  if (estado.puntuacion > CONFIG.PISOS_OBJETIVO_RECORD) {
    estado.recordSuperado = true;
  }

  // Se incrementa la velocidad según los pisos construidos
  estado.velocidad = CONFIG.VELOCIDAD_INICIAL + estado.puntuacion * CONFIG.INCREMENTO_VELOCIDAD;

  // Se prepara el siguiente bloque móvil sobre la nueva plataforma
  estado.bloqueMovil = generarSiguienteBloqueMovil(anchoInterseccion, nuevoPiso + 1, estado.azar);

  return true;
}

/**
 * VERBO 2: REINICIAR
 * Restaura la torre y el puntaje actual manteniendo el récord máximo alcanzado.
 */
export function reiniciar(estado: EstadoJuego, nuevaSemilla?: number): boolean {
  const semillaUsada = nuevaSemilla !== undefined ? nuevaSemilla : estado.semilla;
  const nuevoAzar = crearGeneradorAzar(semillaUsada);
  const base = crearBloqueBase();
  const primerMovil = generarSiguienteBloqueMovil(CONFIG.ANCHO_INICIAL, 1, nuevoAzar);

  estado.fase = 'jugando';
  estado.puntuacion = 0;
  estado.recordSuperado = false;
  estado.velocidad = CONFIG.VELOCIDAD_INICIAL;
  estado.torre = [base];
  estado.bloqueMovil = primerMovil;
  estado.ultimoSobrante = null;
  estado.aviso = null;
  estado.semilla = semillaUsada;
  estado.azar = nuevoAzar;

  return true;
}

/**
 * VERBO 3: PAUSAR
 * Suspende temporalmente el juego si está en curso.
 */
export function pausar(estado: EstadoJuego): boolean {
  if (estado.fase !== 'jugando') {
    return false;
  }
  estado.fase = 'pausado';
  return true;
}

/**
 * Reanuda la partida si se encontraba en pausa.
 */
export function reanudar(estado: EstadoJuego): boolean {
  if (estado.fase !== 'pausado') {
    return false;
  }
  estado.fase = 'jugando';
  return true;
}

/**
 * Alterna entre jugando y pausado según el estado actual.
 */
export function alternarPausa(estado: EstadoJuego): boolean {
  if (estado.fase === 'jugando') {
    estado.fase = 'pausado';
    return true;
  }
  if (estado.fase === 'pausado') {
    estado.fase = 'jugando';
    return true;
  }
  return false;
}

/**
 * Actualiza el desplazamiento horizontal del bloque móvil según el tiempo transcurrido.
 */
export function actualizar(estado: EstadoJuego, deltaTiempoSegundos: number): boolean {
  if (estado.fase !== 'jugando' || deltaTiempoSegundos <= 0) {
    return false;
  }

  estado.bloqueMovil.x += estado.bloqueMovil.direccion * estado.velocidad * deltaTiempoSegundos;

  const maximoX = CONFIG.LIMITE_DERECHO - estado.bloqueMovil.ancho;

  if (estado.bloqueMovil.x >= maximoX) {
    estado.bloqueMovil.x = maximoX;
    estado.bloqueMovil.direccion = -1;
  } else if (estado.bloqueMovil.x <= CONFIG.LIMITE_IZQUIERDO) {
    estado.bloqueMovil.x = CONFIG.LIMITE_IZQUIERDO;
    estado.bloqueMovil.direccion = 1;
  }

  return true;
}
