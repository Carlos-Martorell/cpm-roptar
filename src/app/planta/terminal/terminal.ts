// src/app/planta/terminal/terminal.component.ts
import {
  Component, signal, computed, OnDestroy,
  ChangeDetectionStrategy
} from '@angular/core';
import { DatosService } from '../../core/services/datos';
import { Pedido, OrdenFabricacion, Proceso, Operario, Maquina } from '../../core/models/models';

type Vista = 'pedidos' | 'ofs' | 'procesos';

interface ProcesoActivo {
  pedidoId: string;
  ofId:     string;
  proceso:  Proceso;
  maquina:  Maquina;
  operario: Operario;
  inicio:   Date;
}

@Component({
  selector: 'app-terminal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [`
    @keyframes pulseAmber {
      0%, 100% { opacity: 1; }
      50%       { opacity: 0.35; }
    }
    .pulse { animation: pulseAmber 2s ease-in-out infinite; }
  `],
  template: `
  <div class="min-h-screen bg-slate-100 flex flex-col font-sans">

    <!-- ══════════════════ CABECERA ══════════════════ -->
    <header class="bg-[#1e2d5a] text-white px-5 py-3 flex items-center justify-between shadow-lg">
      <div class="flex items-center gap-3">
        <div class="w-7 h-7 bg-amber-400 rounded flex items-center justify-center font-bold text-[#1e2d5a] text-xs select-none">R</div>
        <span class="text-base font-semibold tracking-wide">ROTPAR · Terminal Planta</span>
      </div>
      <span class="font-mono text-sm text-blue-200">{{ horaActual() }}</span>
    </header>

    <!-- ══════════════════ BREADCRUMB ══════════════════ -->
    @if (vista() !== 'pedidos') {
      <nav class="bg-white border-b border-slate-200 px-4 py-2 flex items-center gap-1 text-sm">
        <button (click)="irA('pedidos')"
          class="flex items-center gap-1 text-[#1e2d5a] font-semibold hover:underline">
          ← Pedidos
        </button>
        @if (pedidoSel()) {
          <span class="text-slate-300 mx-1">›</span>
          <span class="text-slate-500">{{ pedidoSel()!.referencia }}</span>
        }
        @if (ofSel() && vista() === 'procesos') {
          <span class="text-slate-300 mx-1">›</span>
          <span class="text-slate-500">{{ ofSel()!.referencia }}</span>
        }
      </nav>
    }

    <!-- ══════════════════ CONTENIDO ══════════════════ -->
    <main class="flex-1 px-4 py-5 max-w-3xl w-full mx-auto pb-32">

      <!-- ── VISTA 1: PEDIDOS ── -->
      @if (vista() === 'pedidos') {
        <h1 class="text-2xl font-bold text-[#1e2d5a] mb-1">Pedidos activos</h1>
        <p class="text-slate-500 text-sm mb-5">Selecciona el pedido en el que vas a trabajar</p>

        <div class="space-y-3">
          @for (p of todosPedidos(); track p.id) {
            <button
              (click)="p.estado !== 'finalizado' && selPedido(p)"
              [class]="cardPedido(p.estado)">
              <div class="flex items-center justify-between gap-3">
                <div class="text-left flex-1 min-w-0">
                  <div class="flex items-center gap-2 mb-0.5 flex-wrap">
                    <span class="font-bold text-lg text-[#1e2d5a]">{{ p.referencia }}</span>
                    <span [class]="badge(p.estado)">{{ labelEstado(p.estado) }}</span>
                  </div>
                  <p class="text-slate-600 text-sm">{{ p.cliente }}</p>
                  <div class="flex items-center gap-3 mt-2 flex-wrap">
                    <span class="text-slate-400 text-xs">{{ p.ofs.length }} OF{{ p.ofs.length > 1 ? 's' : '' }} · Entrega: {{ p.fechaEntrega }}</span>
                    <!-- Avatares operarios activos en el pedido -->
                    @if (operariosActivosEnPedido(p).length > 0) {
                      <div class="flex items-center gap-1">
                        @for (op of operariosActivosEnPedido(p).slice(0,3); track op.id) {
                          <div class="w-6 h-6 rounded-full bg-amber-400 text-[#1e2d5a] flex items-center justify-center text-xs font-bold"
                            [title]="op.nombre">
                            {{ iniciales(op.nombre) }}
                          </div>
                        }
                        @if (operariosActivosEnPedido(p).length > 3) {
                          <span class="text-xs text-slate-400 font-medium">+{{ operariosActivosEnPedido(p).length - 3 }}</span>
                        }
                        <span class="text-xs text-amber-600 font-medium ml-1">trabajando</span>
                      </div>
                    }
                  </div>
                </div>
                @if (p.estado !== 'finalizado') {
                  <span class="text-2xl text-slate-300 shrink-0">›</span>
                }
              </div>
            </button>
          }
        </div>
      }

      <!-- ── VISTA 2: OFs ── -->
      @if (vista() === 'ofs' && pedidoSel()) {
        <div class="mb-5">
          <h2 class="text-2xl font-bold text-[#1e2d5a]">OFs del pedido</h2>
          <p class="text-slate-500 text-sm">{{ pedidoSel()!.referencia }} · {{ pedidoSel()!.cliente }}</p>
        </div>

        <div class="space-y-3">
          @for (of of pedidoSel()!.ofs; track of.id) {
            <button
              (click)="of.estado !== 'finalizada' && selOF(of)"
              [class]="cardOF(of.estado)">
              <div class="flex items-center justify-between gap-3">
                <div class="text-left flex-1 min-w-0">
                  <div class="flex items-center gap-2 mb-0.5 flex-wrap">
                    <span class="font-bold text-base text-[#1e2d5a]">{{ of.referencia }}</span>
                    <span [class]="badgeOF(of.estado)">{{ labelEstadoOF(of.estado) }}</span>
                  </div>
                  <p class="text-slate-600 text-sm">{{ of.descripcion }}</p>

                  <!-- Operarios activos en esta OF -->
                  @if (operariosActivosEnOF(of).length > 0) {
                    <div class="flex items-center gap-1.5 mt-2">
                      @for (op of operariosActivosEnOF(of); track op.id) {
                        <div class="flex items-center gap-1 bg-amber-50 border border-amber-200 rounded-full pl-1 pr-2 py-0.5">
                          <div class="w-5 h-5 rounded-full bg-amber-400 text-[#1e2d5a] flex items-center justify-center text-xs font-bold shrink-0">
                            {{ iniciales(op.nombre) }}
                          </div>
                          <span class="text-xs text-amber-700 font-medium">{{ nombreCorto(op.nombre) }}</span>
                        </div>
                      }
                    </div>
                  }

                  <!-- Chips de procesos -->
                  <div class="flex gap-1.5 mt-2 flex-wrap">
                    @for (pr of of.procesos; track pr.id) {
                      <span [class]="chipProceso(pr.estado)" class="text-xs px-2 py-0.5 rounded-full font-medium">
                        {{ pr.orden }}. {{ pr.nombre }}
                      </span>
                    }
                  </div>
                </div>
                @if (of.estado !== 'finalizada') {
                  <span class="text-2xl text-slate-300 shrink-0">›</span>
                }
              </div>
            </button>
          }
        </div>
      }

      <!-- ── VISTA 3: PROCESOS ── -->
      @if (vista() === 'procesos' && ofSel()) {
        <div class="mb-5">
          <h2 class="text-2xl font-bold text-[#1e2d5a]">{{ ofSel()!.referencia }}</h2>
          <p class="text-slate-500 text-sm">{{ ofSel()!.descripcion }}</p>
        </div>

        <div class="space-y-3">
          @for (pr of ofSel()!.procesos; track pr.id) {
            <div class="bg-white rounded-xl border border-slate-200 p-4">

              <!-- Fila superior: número + nombre + máquina -->
              <div class="flex items-start justify-between gap-3">
                <div class="flex items-center gap-3">
                  <span [class]="circulo(pr.estado)"
                    class="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0">
                    @if (pr.estado === 'completado') { ✓ } @else { {{ pr.orden }} }
                  </span>
                  <div>
                    <p class="font-semibold text-slate-800">{{ pr.nombre }}</p>
                    @if (pr.maquinaId) {
                      <p class="text-xs text-slate-400">{{ datos.getMaquina(pr.maquinaId)?.nombre }}</p>
                    }
                  </div>
                </div>

                <!-- Acciones -->
                @if (pr.estado === 'completado') {
                  <span class="text-green-600 text-sm font-semibold shrink-0">✓ Completado</span>
                } @else if (pr.estado === 'en_curso') {
                  <div class="flex items-center gap-2 shrink-0">
                    <button (click)="abrirPopup(pr, 'cambiar')"
                      class="text-xs border border-slate-300 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-colors font-medium">
                      Cambiar operario
                    </button>
                    <button (click)="abrirPopup(pr, 'finalizar')"
                      class="text-xs bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700 transition-colors font-medium">
                      Finalizar
                    </button>
                  </div>
                } @else {
                  <button (click)="abrirPopup(pr, 'iniciar')"
                    class="bg-[#1e2d5a] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#243572] transition-colors shrink-0">
                    Iniciar
                  </button>
                }
              </div>

              <!-- Fila inferior: operario activo + tiempo (solo si en_curso) -->
              @if (pr.estado === 'en_curso') {
                @let sesion = sesionActivaDeProceso(pr);
                @if (sesion) {
                  <div class="mt-3 pt-3 border-t border-slate-100 flex items-center gap-3">
                    <span class="pulse inline-block w-2 h-2 rounded-full bg-amber-400 shrink-0"></span>
                    <div class="flex items-center gap-2">
                      <div class="w-7 h-7 rounded-full bg-amber-400 text-[#1e2d5a] flex items-center justify-center text-xs font-bold shrink-0">
                        {{ iniciales(sesion.operario.nombre) }}
                      </div>
                      <span class="text-sm font-medium text-slate-700">{{ sesion.operario.nombre }}</span>
                    </div>
                    <span class="text-slate-300">·</span>
                    <span class="font-mono text-sm font-semibold text-amber-600">{{ tiempoDesdeFecha(sesion.inicio) }}</span>
                    <span class="text-xs text-slate-400">en este proceso</span>
                  </div>
                }
              }

            </div>
          }
        </div>
      }

    </main>

    <!-- ══════════════════ BANNER INFERIOR ══════════════════ -->
    @if (procesosActivos().length > 0) {
      <div class="fixed bottom-0 left-0 right-0 bg-[#1e2d5a] text-white shadow-2xl z-10">
        <div class="max-w-3xl mx-auto px-4 py-3">
          <p class="text-xs text-blue-300 font-semibold uppercase tracking-wide mb-2">En curso ahora</p>
          <div class="flex gap-3 flex-wrap">
            @for (pa of procesosActivos(); track pa.proceso.id) {
              <div class="flex items-center gap-3 bg-[#243572] rounded-lg px-3 py-2">
                <span class="pulse inline-block w-2 h-2 rounded-full bg-amber-400 shrink-0"></span>
                <div class="w-6 h-6 rounded-full bg-amber-400 text-[#1e2d5a] flex items-center justify-center text-xs font-bold shrink-0">
                  {{ iniciales(pa.operario.nombre) }}
                </div>
                <div class="text-sm leading-tight">
                  <span class="font-semibold">{{ pa.maquina.nombre }}</span>
                  <span class="text-blue-300 mx-1">·</span>
                  <span class="text-blue-200">{{ pa.proceso.nombre }}</span>
                  <span class="text-blue-300 mx-1">·</span>
                  <span class="font-mono text-amber-300">{{ tiempoDesdeFecha(pa.inicio) }}</span>
                </div>
              </div>
            }
          </div>
        </div>
      </div>
    }

    <!-- ══════════════════ POPUP ══════════════════ -->
    @if (popup()) {
      <div class="fixed inset-0 bg-black/40 z-20 flex items-center justify-center p-4"
        (click)="cerrarPopup()">
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6"
          (click)="$event.stopPropagation()">

          <div class="flex items-start justify-between mb-4">
            <div>
              <h3 class="font-bold text-lg text-[#1e2d5a]">
                @if (popup()!.modo === 'iniciar')   { Iniciar proceso }
                @if (popup()!.modo === 'cambiar')   { Cambiar operario }
                @if (popup()!.modo === 'finalizar') { Confirmar finalización }
              </h3>
              <p class="text-slate-500 text-sm">{{ popup()!.proceso.nombre }}</p>
            </div>
            <button (click)="cerrarPopup()"
              class="text-slate-400 hover:text-slate-600 text-2xl leading-none mt-0.5">×</button>
          </div>

          <!-- Finalizar -->
          @if (popup()!.modo === 'finalizar') {
            <p class="text-slate-600 text-sm mb-6">
              ¿El proceso físico ha terminado? Esta acción lo marcará como completado para todos.
            </p>
            <div class="flex gap-3">
              <button (click)="cerrarPopup()"
                class="flex-1 border border-slate-300 text-slate-600 py-3 rounded-xl font-semibold hover:bg-slate-50 transition-colors">
                Cancelar
              </button>
              <button (click)="confirmarFinalizar()"
                class="flex-1 bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition-colors">
                Sí, finalizar
              </button>
            </div>
          }

          <!-- Iniciar / Cambiar -->
          @if (popup()!.modo === 'iniciar' || popup()!.modo === 'cambiar') {
            <div class="mb-4">
              <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                {{ popup()!.modo === 'cambiar' ? 'Nuevo operario' : 'Operario' }}
              </label>
              <div class="grid grid-cols-2 gap-2">
                @for (op of datos.operarios; track op.id) {
                  <button (click)="popupOperario.set(op)"
                    [class]="popupOperario()?.id === op.id
                      ? 'border-2 border-[#1e2d5a] bg-blue-50 rounded-lg px-3 py-2 text-left transition-all'
                      : 'border border-slate-200 rounded-lg px-3 py-2 text-left hover:border-slate-400 transition-all'">
                    <div class="flex items-center gap-2">
                      <div class="w-7 h-7 rounded-full bg-blue-100 text-[#1e2d5a] flex items-center justify-center text-xs font-bold shrink-0">
                        {{ iniciales(op.nombre) }}
                      </div>
                      <span class="text-sm font-medium text-slate-800 leading-tight">{{ op.nombre }}</span>
                    </div>
                  </button>
                }
              </div>
            </div>

            @if (popup()!.modo === 'iniciar' && !popup()!.proceso.maquinaId) {
              <div class="mb-4">
                <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Máquina</label>
                <div class="grid grid-cols-2 gap-2">
                  @for (mq of datos.maquinas; track mq.id) {
                    <button (click)="popupMaquina.set(mq)"
                      [class]="popupMaquina()?.id === mq.id
                        ? 'border-2 border-[#1e2d5a] bg-blue-50 rounded-lg px-3 py-2 text-left transition-all'
                        : 'border border-slate-200 rounded-lg px-3 py-2 text-left hover:border-slate-400 transition-all'">
                      <p class="text-sm font-medium text-slate-800">{{ mq.nombre }}</p>
                      <p class="text-xs text-slate-400">{{ mq.costePorHora }}€/h</p>
                    </button>
                  }
                </div>
              </div>
            }

            @if (popup()!.modo === 'iniciar' && popup()!.proceso.maquinaId) {
              <div class="mb-4 bg-slate-50 rounded-lg px-3 py-2 flex items-center gap-2">
                <span class="text-xs text-slate-500 font-semibold uppercase tracking-wide">Máquina:</span>
                <span class="text-sm font-semibold text-[#1e2d5a]">
                  {{ datos.getMaquina(popup()!.proceso.maquinaId!)?.nombre }}
                </span>
              </div>
            }

            <button
              (click)="confirmarAccion()"
              [disabled]="!popupOperario() || (popup()!.modo === 'iniciar' && !popup()!.proceso.maquinaId && !popupMaquina())"
              class="w-full bg-[#1e2d5a] text-white py-3 rounded-xl font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#243572] transition-colors mt-2">
              @if (popup()!.modo === 'iniciar') { Confirmar inicio }
              @if (popup()!.modo === 'cambiar') { Cambiar operario }
            </button>
          }

        </div>
      </div>
    }

  </div>
  `
})
export class TerminalComponent implements OnDestroy {

  constructor(readonly datos: DatosService) {}

  // ── Navegación ──────────────────────────────────────────────────
  vista     = signal<Vista>('pedidos');
  pedidoSel = signal<Pedido | null>(null);
  ofSel     = signal<OrdenFabricacion | null>(null);

  todosPedidos = computed(() => this.datos.getTodosPedidos());

  // ── Popup ────────────────────────────────────────────────────────
  popup         = signal<{ proceso: Proceso; modo: 'iniciar' | 'cambiar' | 'finalizar' } | null>(null);
  popupOperario = signal<Operario | null>(null);
  popupMaquina  = signal<Maquina | null>(null);

  // ── Sesiones activas (banner) ────────────────────────────────────
  private _activos = signal<ProcesoActivo[]>([]);
  procesosActivos  = this._activos.asReadonly();

  // ── Reloj — actualiza hora Y fuerza refresco de tiempos ──────────
  horaActual = signal(this._fmtHora(new Date()));
  private _tick = signal(0); // incrementa cada segundo para que computed() reaccione
  private _reloj = setInterval(() => {
    this.horaActual.set(this._fmtHora(new Date()));
    this._tick.update(t => t + 1);
  }, 1000);

  ngOnDestroy() { clearInterval(this._reloj); }

  // ── Helpers de visibilidad ───────────────────────────────────────

  /** Operarios con sesión abierta en cualquier proceso de un pedido */
  operariosActivosEnPedido(p: Pedido): Operario[] {
    this._tick(); // dependencia reactiva
    const ids = new Set<string>();
    for (const of_ of p.ofs)
      for (const pr of of_.procesos)
        for (const s of pr.sesiones)
          if (!s.fin) ids.add(s.operarioId);
    return [...ids].map(id => this.datos.getOperario(id)!).filter(Boolean);
  }

  /** Operarios con sesión abierta en cualquier proceso de una OF */
  operariosActivosEnOF(of: OrdenFabricacion): Operario[] {
    this._tick();
    const ids = new Set<string>();
    for (const pr of of.procesos)
      for (const s of pr.sesiones)
        if (!s.fin) ids.add(s.operarioId);
    return [...ids].map(id => this.datos.getOperario(id)!).filter(Boolean);
  }

  /** Sesión activa de un proceso concreto (operario + inicio) */
  sesionActivaDeProceso(pr: Proceso): { operario: Operario; inicio: Date } | null {
    this._tick();
    const s = [...pr.sesiones].reverse().find(x => !x.fin);
    if (!s) return null;
    const operario = this.datos.getOperario(s.operarioId);
    if (!operario) return null;
    return { operario, inicio: s.inicio };
  }

  /** Formatea segundos desde una fecha — reactivo al tick */
  tiempoDesdeFecha(inicio: Date): string {
    this._tick();
    const s = Math.floor((Date.now() - inicio.getTime()) / 1000);
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`;
  }

  // ── Navegación ───────────────────────────────────────────────────
  selPedido(p: Pedido) {
    this.pedidoSel.set(p);
    this.ofSel.set(null);
    this.vista.set('ofs');
  }

  selOF(of: OrdenFabricacion) {
    this.ofSel.set(of);
    this.vista.set('procesos');
  }

  irA(v: Vista) {
    this.vista.set(v);
    if (v === 'pedidos') { this.pedidoSel.set(null); this.ofSel.set(null); }
    if (v === 'ofs')     { this.ofSel.set(null); }
  }

  // ── Popup ────────────────────────────────────────────────────────
  abrirPopup(pr: Proceso, modo: 'iniciar' | 'cambiar' | 'finalizar') {
    this.popup.set({ proceso: pr, modo });
    this.popupOperario.set(null);
    this.popupMaquina.set(null);
  }

  cerrarPopup() {
    this.popup.set(null);
    this.popupOperario.set(null);
    this.popupMaquina.set(null);
  }

  confirmarAccion() {
    const p   = this.popup();
    const op  = this.popupOperario();
    const ped = this.pedidoSel();
    const of  = this.ofSel();
    if (!p || !op || !ped || !of) return;

    const maquinaId = p.proceso.maquinaId ?? this.popupMaquina()?.id;
    if (!maquinaId) return;
    const maquina = this.datos.getMaquina(maquinaId)!;

    if (p.modo === 'iniciar') {
      this.datos.iniciarProceso(ped.id, of.id, p.proceso.id, op.id, maquinaId);
      this._activos.update(a => [...a, {
        pedidoId: ped.id, ofId: of.id,
        proceso: { ...p.proceso, estado: 'en_curso' },
        maquina, operario: op, inicio: new Date()
      }]);
    }

    if (p.modo === 'cambiar') {
      this.datos.cambiarOperarioEnProceso(ped.id, of.id, p.proceso.id, op.id, maquinaId);
      this._activos.update(a => a.map(x =>
        x.proceso.id === p.proceso.id ? { ...x, operario: op } : x
      ));
    }

    const ofActualizada = this.datos.getOF(ped.id, of.id);
    if (ofActualizada) this.ofSel.set(ofActualizada);
    this.cerrarPopup();
  }

  confirmarFinalizar() {
    const p   = this.popup();
    const ped = this.pedidoSel();
    const of  = this.ofSel();
    if (!p || !ped || !of) return;

    this.datos.completarProceso(ped.id, of.id, p.proceso.id);
    this._activos.update(a => a.filter(x => x.proceso.id !== p.proceso.id));

    const ofActualizada = this.datos.getOF(ped.id, of.id);
    if (ofActualizada) this.ofSel.set(ofActualizada);
    this.cerrarPopup();
  }

  // ── Utilidades ───────────────────────────────────────────────────
  iniciales(nombre: string) {
    return nombre.split(' ').slice(0,2).map(n => n[0]).join('').toUpperCase();
  }

  nombreCorto(nombre: string) {
    const partes = nombre.split(' ');
    return partes[0]; // solo el primer nombre
  }

  private _fmtHora(d: Date) {
    return d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  }

  // ── Clases CSS ───────────────────────────────────────────────────
  cardPedido(estado: string) {
    const base = 'w-full bg-white rounded-xl border p-4 text-left transition-all duration-150 shadow-sm ';
    if (estado === 'finalizado') return base + 'border-slate-100 opacity-60 cursor-default';
    return base + 'border-slate-200 hover:border-[#2b3d8a] hover:shadow-md cursor-pointer';
  }

  cardOF(estado: string) {
    const base = 'w-full bg-white rounded-xl border p-4 text-left transition-all duration-150 shadow-sm ';
    if (estado === 'finalizada') return base + 'border-slate-100 opacity-60 cursor-default';
    return base + 'border-slate-200 hover:border-[#2b3d8a] hover:shadow-md cursor-pointer';
  }

  badge(estado: string) {
    const map: Record<string,string> = {
      pendiente:  'bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full text-xs font-semibold',
      en_curso:   'bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full text-xs font-semibold',
      finalizado: 'bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs font-semibold',
    };
    return map[estado] ?? map['pendiente'];
  }

  badgeOF(estado: string) {
    const map: Record<string,string> = {
      pendiente:  'bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full text-xs font-semibold',
      en_curso:   'bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full text-xs font-semibold',
      finalizada: 'bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs font-semibold',
    };
    return map[estado] ?? map['pendiente'];
  }

  chipProceso(estado: string) {
    const map: Record<string,string> = {
      pendiente:  'bg-slate-100 text-slate-400',
      en_curso:   'bg-amber-100 text-amber-700',
      completado: 'bg-green-100 text-green-700',
    };
    return map[estado] ?? map['pendiente'];
  }

  circulo(estado: string) {
    const map: Record<string,string> = {
      pendiente:  'bg-slate-100 text-slate-400',
      en_curso:   'bg-amber-400 text-white',
      completado: 'bg-green-100 text-green-700',
    };
    return map[estado] ?? map['pendiente'];
  }

  labelEstado(e: string) {
    return ({ pendiente: 'Pendiente', en_curso: 'En curso', finalizado: 'Finalizado' } as Record<string,string>)[e] ?? e;
  }

  labelEstadoOF(e: string) {
    return ({ pendiente: 'Pendiente', en_curso: 'En curso', finalizada: 'Finalizada' } as Record<string,string>)[e] ?? e;
  }
}
