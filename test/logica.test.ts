import { describe, expect, it } from 'vitest';
import {
  actualizar,
  alternarPausa,
  CONFIG,
  crearEstadoInicial,
  iniciar,
  pausar,
  reanudar,
  reiniciar,
  soltar,
} from '../src/logica.ts';

describe('reglas de TORRE QUE CRECE', () => {
  it('arma el estado inicial con una base y el primer bloque móvil', () => {
    const estado = crearEstadoInicial(42);
    const repetido = crearEstadoInicial(42);

    expect(estado.fase).toBe('inicio');
    expect(estado.puntuacion).toBe(0);
    expect(estado.record).toBe(0);
    expect(estado.recordSuperado).toBe(false);
    expect(estado.velocidad).toBe(CONFIG.VELOCIDAD_INICIAL);
    expect(estado.torre).toEqual([
      { x: 100, ancho: CONFIG.ANCHO_INICIAL, piso: 0 },
    ]);
    expect(estado.bloqueMovil).toEqual(repetido.bloqueMovil);
    expect(estado.bloqueMovil.ancho).toBe(CONFIG.ANCHO_INICIAL);
    expect(estado.bloqueMovil.piso).toBe(1);
    expect(estado.ultimoSobrante).toBeNull();
    expect(estado.aviso).toBeNull();
  });

  it('inicia, pausa, reanuda y alterna la pausa solo en las fases permitidas', () => {
    const estado = crearEstadoInicial();

    expect(iniciar(estado)).toBe(true);
    expect(estado.fase).toBe('jugando');
    expect(iniciar(estado)).toBe(false);

    expect(pausar(estado)).toBe(true);
    expect(estado.fase).toBe('pausado');
    expect(pausar(estado)).toBe(false);
    expect(reanudar(estado)).toBe(true);
    expect(estado.fase).toBe('jugando');

    expect(alternarPausa(estado)).toBe(true);
    expect(estado.fase).toBe('pausado');
    expect(alternarPausa(estado)).toBe(true);
    expect(estado.fase).toBe('jugando');

    estado.fase = 'terminado';
    expect(reanudar(estado)).toBe(false);
    expect(alternarPausa(estado)).toBe(false);
  });

  it('mueve el bloque y rechaza actualizar fuera de una partida activa o con tiempo inválido', () => {
    const estado = crearEstadoInicial();
    const xInicial = estado.bloqueMovil.x;

    expect(actualizar(estado, 1)).toBe(false);
    expect(estado.bloqueMovil.x).toBe(xInicial);
    expect(iniciar(estado)).toBe(true);
    expect(actualizar(estado, 1)).toBe(true);
    expect(estado.bloqueMovil.x).not.toBe(xInicial);

    const xActualizado = estado.bloqueMovil.x;
    expect(actualizar(estado, 0)).toBe(false);
    expect(actualizar(estado, -1)).toBe(false);
    expect(estado.bloqueMovil.x).toBe(xActualizado);

    expect(pausar(estado)).toBe(true);
    expect(actualizar(estado, 1)).toBe(false);
    expect(estado.bloqueMovil.x).toBe(xActualizado);
  });

  it('coloca un bloque alineado, suma puntos y rechaza soltar en fases prohibidas', () => {
    const estado = crearEstadoInicial();
    const plataforma = estado.torre[0];

    expect(soltar(estado)).toBe(false);
    expect(iniciar(estado)).toBe(true);
    estado.bloqueMovil.x = plataforma.x;

    expect(soltar(estado)).toBe(true);
    expect(estado.puntuacion).toBe(1);
    expect(estado.record).toBe(1);
    expect(estado.torre).toHaveLength(2);
    expect(estado.torre[1]).toEqual({
      x: plataforma.x,
      ancho: plataforma.ancho,
      piso: 1,
    });
    expect(estado.bloqueMovil.piso).toBe(2);
    expect(soltar(estado)).toBe(true);
    expect(estado.puntuacion).toBe(2);

    expect(pausar(estado)).toBe(true);
    expect(soltar(estado)).toBe(false);
    expect(estado.puntuacion).toBe(2);
  });

  it('termina mal cuando el bloque no intercepta la plataforma y muestra el aviso final', () => {
    const estado = crearEstadoInicial();

    iniciar(estado);
    estado.bloqueMovil.x = CONFIG.LIMITE_DERECHO;

    expect(soltar(estado)).toBe(true);
    expect(estado.fase).toBe('terminado');
    expect(estado.aviso).toBe('¡Torre derribada!');
    expect(estado.puntuacion).toBe(0);
    expect(estado.ultimoSobrante).toMatchObject({
      ancho: CONFIG.ANCHO_INICIAL,
      lado: 'derecho',
    });
    expect(soltar(estado)).toBe(false);

    const bloqueDemasiadoAngosto = crearEstadoInicial();
    iniciar(bloqueDemasiadoAngosto);
    bloqueDemasiadoAngosto.bloqueMovil.x =
      bloqueDemasiadoAngosto.torre[0].x +
      bloqueDemasiadoAngosto.torre[0].ancho -
      (CONFIG.ANCHO_MINIMO - 1);

    expect(soltar(bloqueDemasiadoAngosto)).toBe(true);
    expect(bloqueDemasiadoAngosto.fase).toBe('terminado');
    expect(bloqueDemasiadoAngosto.puntuacion).toBe(0);
  });

  it('permite reiniciar una partida terminada y conserva el récord personal', () => {
    const estado = crearEstadoInicial();

    iniciar(estado);
    estado.bloqueMovil.x = estado.torre[0].x;
    soltar(estado);
    estado.record = 7;
    estado.fase = 'terminado';
    estado.puntuacion = 3;
    estado.aviso = '¡Torre derribada!';

    expect(reiniciar(estado, 99)).toBe(true);
    expect(estado.fase).toBe('jugando');
    expect(estado.puntuacion).toBe(0);
    expect(estado.record).toBe(7);
    expect(estado.recordSuperado).toBe(false);
    expect(estado.velocidad).toBe(CONFIG.VELOCIDAD_INICIAL);
    expect(estado.torre).toEqual([
      { x: 100, ancho: CONFIG.ANCHO_INICIAL, piso: 0 },
    ]);
    expect(estado.semilla).toBe(99);
    expect(estado.aviso).toBeNull();
  });

  it('marca el récord superado únicamente después de construir más de veinte pisos', () => {
    const estado = crearEstadoInicial();

    iniciar(estado);
    for (let piso = 0; piso < CONFIG.PISOS_OBJETIVO_RECORD; piso += 1) {
      estado.bloqueMovil.x = estado.torre[estado.torre.length - 1].x;
      expect(soltar(estado)).toBe(true);
    }
    expect(estado.puntuacion).toBe(20);
    expect(estado.recordSuperado).toBe(false);

    estado.bloqueMovil.x = estado.torre[estado.torre.length - 1].x;
    expect(soltar(estado)).toBe(true);
    expect(estado.puntuacion).toBe(21);
    expect(estado.recordSuperado).toBe(true);
  });

  it('completa una partida desde el inicio hasta superar el récord con movimientos válidos', () => {
    const estado = crearEstadoInicial(314159);

    expect(iniciar(estado)).toBe(true);
    for (let piso = 0; piso <= CONFIG.PISOS_OBJETIVO_RECORD; piso += 1) {
      const plataforma = estado.torre[estado.torre.length - 1];
      const distancia = Math.abs(plataforma.x - estado.bloqueMovil.x);
      expect(estado.bloqueMovil.direccion).toBe(
        plataforma.x >= estado.bloqueMovil.x ? 1 : -1,
      );
      expect(actualizar(estado, distancia / estado.velocidad)).toBe(true);
      expect(estado.bloqueMovil.x).toBeCloseTo(plataforma.x);
      expect(soltar(estado)).toBe(true);
      expect(estado.fase).toBe('jugando');
    }

    expect(estado.puntuacion).toBe(CONFIG.PISOS_OBJETIVO_RECORD + 1);
    expect(estado.record).toBe(CONFIG.PISOS_OBJETIVO_RECORD + 1);
    expect(estado.recordSuperado).toBe(true);
    expect(estado.aviso).toBeNull();
    expect(estado.torre).toHaveLength(CONFIG.PISOS_OBJETIVO_RECORD + 2);
  });
});
