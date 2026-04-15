// src/app/core/models/models.ts

export type EstadoProceso = 'pendiente' | 'en_curso' | 'completado';
export type EstadoOF      = 'pendiente' | 'en_curso' | 'finalizada';
export type EstadoPedido  = 'pendiente' | 'en_curso' | 'finalizado';

export interface Operario {
  id: string;
  nombre: string;
}

export interface Maquina {
  id: string;
  nombre: string;
  costePorHora: number;
}

export interface SesionTrabajo {
  operarioId: string;
  maquinaId:  string;
  inicio:     Date;
  fin?:       Date;
}

export interface Proceso {
  id:          string;
  nombre:      string;
  estado:      EstadoProceso;
  sesiones:    SesionTrabajo[];
  orden:       number;
  maquinaId?:  string; // máquina asignada a este proceso
}

export interface OrdenFabricacion {
  id:          string;
  referencia:  string;
  descripcion: string;
  estado:      EstadoOF;
  procesos:    Proceso[];
}

export interface Pedido {
  id:           string;
  referencia:   string;
  cliente:      string;
  fechaEntrega: string;
  estado:       EstadoPedido;
  ofs:          OrdenFabricacion[];
}
