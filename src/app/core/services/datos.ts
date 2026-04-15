// src/app/core/services/datos.service.ts
import { Injectable, signal } from '@angular/core';
import {
  Pedido, Operario, Maquina,
  EstadoProceso, EstadoOF, EstadoPedido
} from '../models/models';

@Injectable({ providedIn: 'root' })
export class DatosService {

  readonly operarios: Operario[] = [
    { id: 'op1', nombre: 'Juan García' },
    { id: 'op2', nombre: 'Pedro Martínez' },
    { id: 'op3', nombre: 'María López' },
    { id: 'op4', nombre: 'Antonio Ruiz' },
    { id: 'op5', nombre: 'Carlos Fernández' },
  ];

  readonly maquinas: Maquina[] = [
    { id: 'mq1', nombre: 'Torno CNC-1',    costePorHora: 45 },
    { id: 'mq2', nombre: 'Fresadora CNC-2', costePorHora: 55 },
    { id: 'mq3', nombre: 'Soldadura MIG-1', costePorHora: 30 },
    { id: 'mq4', nombre: 'Rectificadora',   costePorHora: 40 },
    { id: 'mq5', nombre: 'Taladro columna', costePorHora: 20 },
  ];

  private readonly _pedidos = signal<Pedido[]>([
    {
      id: 'p1',
      referencia: 'PED-2024-0142',
      cliente: 'Industrias Metálicas SA',
      fechaEntrega: '2025-04-10',
      estado: 'en_curso',
      ofs: [
        {
          id: 'of1',
          referencia: 'OF-0142-A',
          descripcion: 'Rótula esférica M24 — 50 uds',
          estado: 'en_curso',
          procesos: [
            { id: 'pr1', nombre: 'Torneado exterior', estado: 'completado', sesiones: [], orden: 1, maquinaId: 'mq1' },
            { id: 'pr2', nombre: 'Fresado de ranuras', estado: 'en_curso',  sesiones: [], orden: 2, maquinaId: 'mq2' },
            { id: 'pr3', nombre: 'Rectificado',        estado: 'pendiente', sesiones: [], orden: 3, maquinaId: 'mq4' },
            { id: 'pr4', nombre: 'Control calidad',    estado: 'pendiente', sesiones: [], orden: 4 },
          ]
        },
        {
          id: 'of2',
          referencia: 'OF-0142-B',
          descripcion: 'Articulación doble M16 — 30 uds',
          estado: 'pendiente',
          procesos: [
            { id: 'pr5', nombre: 'Torneado',           estado: 'pendiente', sesiones: [], orden: 1, maquinaId: 'mq1' },
            { id: 'pr6', nombre: 'Soldadura',           estado: 'pendiente', sesiones: [], orden: 2, maquinaId: 'mq3' },
            { id: 'pr7', nombre: 'Acabado superficial', estado: 'pendiente', sesiones: [], orden: 3, maquinaId: 'mq4' },
          ]
        }
      ]
    },
    {
      id: 'p2',
      referencia: 'PED-2024-0143',
      cliente: 'Automoción Levante SL',
      fechaEntrega: '2025-04-08',
      estado: 'en_curso',
      ofs: [
        {
          id: 'of3',
          referencia: 'OF-0143-A',
          descripcion: 'Rótula dirección M20 — 100 uds',
          estado: 'en_curso',
          procesos: [
            { id: 'pr8',  nombre: 'Torneado CNC',   estado: 'en_curso',  sesiones: [], orden: 1, maquinaId: 'mq1' },
            { id: 'pr9',  nombre: 'Taladrado',       estado: 'pendiente', sesiones: [], orden: 2, maquinaId: 'mq5' },
            { id: 'pr10', nombre: 'Fosfatado',       estado: 'pendiente', sesiones: [], orden: 3 },
          ]
        }
      ]
    },
    {
      id: 'p3',
      referencia: 'PED-2024-0140',
      cliente: 'Maquinaria Agrícola Norte',
      fechaEntrega: '2025-04-05',
      estado: 'finalizado',
      ofs: [
        {
          id: 'of4',
          referencia: 'OF-0140-A',
          descripcion: 'Rótula articulada 5/8" — 200 uds',
          estado: 'finalizada',
          procesos: [
            { id: 'pr11', nombre: 'Torneado',    estado: 'completado', sesiones: [], orden: 1, maquinaId: 'mq1' },
            { id: 'pr12', nombre: 'Rectificado', estado: 'completado', sesiones: [], orden: 2, maquinaId: 'mq4' },
            { id: 'pr13', nombre: 'Inspección',  estado: 'completado', sesiones: [], orden: 3 },
          ]
        }
      ]
    },
    {
      id: 'p4',
      referencia: 'PED-2024-0144',
      cliente: 'Ferroviaria del Norte SL',
      fechaEntrega: '2025-04-15',
      estado: 'pendiente',
      ofs: [
        {
          id: 'of5',
          referencia: 'OF-0144-A',
          descripcion: 'Rótula de suspensión M30 — 20 uds',
          estado: 'pendiente',
          procesos: [
            { id: 'pr14', nombre: 'Torneado',  estado: 'pendiente', sesiones: [], orden: 1, maquinaId: 'mq1' },
            { id: 'pr15', nombre: 'Fresado',   estado: 'pendiente', sesiones: [], orden: 2, maquinaId: 'mq2' },
            { id: 'pr16', nombre: 'Soldadura', estado: 'pendiente', sesiones: [], orden: 3, maquinaId: 'mq3' },
          ]
        }
      ]
    }
  ]);

  readonly pedidos = this._pedidos.asReadonly();

  getPedidosActivos() {
    return this._pedidos().filter(p => p.estado !== 'finalizado');
  }

  getTodosPedidos() {
    return this._pedidos();
  }

  getPedido(id: string) {
    return this._pedidos().find(p => p.id === id);
  }

  getOF(pedidoId: string, ofId: string) {
    return this.getPedido(pedidoId)?.ofs.find(o => o.id === ofId);
  }

  getMaquina(id: string) {
    return this.maquinas.find(m => m.id === id);
  }

  getOperario(id: string) {
    return this.operarios.find(o => o.id === id);
  }

  /** Sesión activa en una máquina concreta (para saber si está ocupada) */
  getSesionActivaEnMaquina(maquinaId: string): { operarioId: string } | null {
    for (const p of this._pedidos()) {
      for (const o of p.ofs) {
        for (const pr of o.procesos) {
          if (pr.estado === 'en_curso') {
            const sesionAbierta = pr.sesiones.find(s => s.maquinaId === maquinaId && !s.fin);
            if (sesionAbierta) return { operarioId: sesionAbierta.operarioId };
          }
        }
      }
    }
    return null;
  }

  iniciarProceso(
    pedidoId: string, ofId: string, procesoId: string,
    operarioId: string, maquinaId: string
  ) {
    this._pedidos.update(pedidos =>
      pedidos.map(p => p.id !== pedidoId ? p : {
        ...p,
        estado: 'en_curso' as EstadoPedido,
        ofs: p.ofs.map(o => o.id !== ofId ? o : {
          ...o,
          estado: 'en_curso' as EstadoOF,
          procesos: o.procesos.map(pr => pr.id !== procesoId ? pr : {
            ...pr,
            estado: 'en_curso' as EstadoProceso,
            sesiones: [...pr.sesiones, { operarioId, maquinaId, inicio: new Date() }]
          })
        })
      })
    );
  }

  cambiarOperarioEnProceso(
    pedidoId: string, ofId: string, procesoId: string,
    nuevoOperarioId: string, maquinaId: string
  ) {
    this._pedidos.update(pedidos =>
      pedidos.map(p => p.id !== pedidoId ? p : {
        ...p,
        ofs: p.ofs.map(o => o.id !== ofId ? o : {
          ...o,
          procesos: o.procesos.map(pr => {
            if (pr.id !== procesoId) return pr;
            // Cierra sesión anterior
            const sesiones = pr.sesiones.map((s, i) =>
              i === pr.sesiones.length - 1 && !s.fin ? { ...s, fin: new Date() } : s
            );
            // Abre nueva sesión
            return {
              ...pr,
              sesiones: [...sesiones, { operarioId: nuevoOperarioId, maquinaId, inicio: new Date() }]
            };
          })
        })
      })
    );
  }

  completarProceso(pedidoId: string, ofId: string, procesoId: string) {
    this._pedidos.update(pedidos =>
      pedidos.map(p => p.id !== pedidoId ? p : {
        ...p,
        ofs: p.ofs.map(o => o.id !== ofId ? o : {
          ...o,
          procesos: o.procesos.map(pr => pr.id !== procesoId ? pr : {
            ...pr,
            estado: 'completado' as EstadoProceso,
            sesiones: pr.sesiones.map((s, i) =>
              i === pr.sesiones.length - 1 && !s.fin ? { ...s, fin: new Date() } : s
            )
          })
        })
      })
    );
    this._recalcularEstados(pedidoId, ofId);
  }

  private _recalcularEstados(pedidoId: string, ofId: string) {
    this._pedidos.update(pedidos =>
      pedidos.map(p => {
        if (p.id !== pedidoId) return p;
        const ofs = p.ofs.map(o => {
          if (o.id !== ofId) return o;
          const todas = o.procesos.every(pr => pr.estado === 'completado');
          return { ...o, estado: (todas ? 'finalizada' : o.estado) as EstadoOF };
        });
        const todasOFs = ofs.every(o => o.estado === 'finalizada');
        return { ...p, ofs, estado: (todasOFs ? 'finalizado' : p.estado) as EstadoPedido };
      })
    );
  }
}
