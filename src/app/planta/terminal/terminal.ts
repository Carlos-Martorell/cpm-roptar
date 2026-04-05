// src/app/planta/terminal/terminal.component.ts
import { Component, signal, computed, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { DatosService } from '../../core/services/datos';
import { Pedido, OrdenFabricacion, Proceso, Operario, Maquina } from '../../core/models/models';

type Vista = 'operario' | 'pedidos' | 'ofs' | 'procesos' | 'activo';

@Component({
  selector: 'app-terminal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
  <div class="min-h-screen bg-steel-100 flex flex-col">

    <!-- CABECERA -->
    <header class="bg-rotpar-800 text-white px-6 py-4 flex items-center justify-between shadow-lg">
      <div class="flex items-center gap-3">
        <div class="w-8 h-8 bg-amber-500 rounded flex items-center justify-center font-bold text-rotpar-900 text-sm">R</div>
        <span class="font-display text-xl font-semibold tracking-wide">ROTPAR · Terminal Planta</span>
      </div>
      <div class="flex items-center gap-4 text-sm">
        <span class="text-rotpar-100 font-mono">{{ horaActual() }}</span>
        @if (operarioActual()) {
          <div class="flex items-center gap-2 bg-rotpar-700 rounded-full px-4 py-1">
            <span class="w-2 h-2 rounded-full bg-ok-600 inline-block"></span>
            <span>{{ operarioActual()!.nombre }}</span>
            @if (vista() !== 'operario') {
              <button (click)="cambiarOperario()" class="ml-2 text-rotpar-100 hover:text-white text-xs underline">cambiar</button>
            }
          </div>
        }
      </div>
    </header>

    <!-- BREADCRUMB -->
    @if (vista() !== 'operario') {
      <nav class="bg-white border-b border-steel-200 px-6 py-2 flex items-center gap-2 text-sm text-steel-600">
        <button (click)="irA('pedidos')" class="hover:text-rotpar-700 font-medium">Pedidos</button>
        @if (pedidoSeleccionado()) {
          <span class="text-steel-400">›</span>
          <button (click)="irA('ofs')" class="hover:text-rotpar-700">{{ pedidoSeleccionado()!.referencia }}</button>
        }
        @if (ofSeleccionada()) {
          <span class="text-steel-400">›</span>
          <button (click)="irA('procesos')" class="hover:text-rotpar-700">{{ ofSeleccionada()!.referencia }}</button>
        }
        @if (vista() === 'activo') {
          <span class="text-steel-400">›</span>
          <span class="text-amber-600 font-semibold">Proceso activo</span>
        }
      </nav>
    }

    <!-- CONTENIDO -->
    <main class="flex-1 px-6 py-6 max-w-4xl w-full mx-auto">

      <!-- PASO 1: SELECCIÓN DE OPERARIO -->
      @if (vista() === 'operario') {
        <div class="text-center mb-8">
          <h1 class="font-display text-4xl font-bold text-rotpar-800 mb-2">¿Quién trabaja hoy?</h1>
          <p class="text-steel-600">Selecciona tu nombre para comenzar</p>
        </div>
        <div class="grid grid-cols-2 gap-4 md:grid-cols-3">
          @for (op of datos.operarios; track op.id) {
            <button
              (click)="seleccionarOperario(op)"
              class="bg-white border-2 border-steel-200 rounded-2xl p-6 text-center hover:border-rotpar-500 hover:bg-rotpar-50 transition-all duration-150 group shadow-sm">
              <div class="w-16 h-16 rounded-full bg-rotpar-100 text-rotpar-700 flex items-center justify-center text-2xl font-bold mx-auto mb-3 group-hover:bg-rotpar-600 group-hover:text-white transition-colors">
                {{ iniciales(op.nombre) }}
              </div>
              <span class="font-semibold text-steel-800 text-lg">{{ op.nombre }}</span>
            </button>
          }
        </div>
      }

      <!-- PASO 2: LISTA DE PEDIDOS -->
      @if (vista() === 'pedidos') {
        <div class="mb-6">
          <h2 class="font-display text-3xl font-bold text-rotpar-800">Pedidos activos</h2>
          <p class="text-steel-500 mt-1">Selecciona el pedido en el que vas a trabajar</p>
        </div>
        <div class="space-y-3">
          @for (pedido of pedidosActivos(); track pedido.id) {
            <button
              (click)="seleccionarPedido(pedido)"
              class="w-full bg-white rounded-xl border border-steel-200 p-5 text-left hover:border-rotpar-400 hover:shadow-md transition-all duration-150 group">
              <div class="flex items-start justify-between">
                <div>
                  <div class="flex items-center gap-3 mb-1">
                    <span class="font-display text-xl font-bold text-rotpar-800">{{ pedido.referencia }}</span>
                    <span [class]="badgeEstado(pedido.estado)">{{ labelEstado(pedido.estado) }}</span>
                  </div>
                  <p class="text-steel-700 font-medium">{{ pedido.cliente }}</p>
                  <p class="text-steel-400 text-sm mt-1">{{ pedido.ofs.length }} OF{{ pedido.ofs.length > 1 ? 's' : '' }} · Entrega: {{ pedido.fechaEntrega }}</p>
                </div>
                <span class="text-rotpar-400 group-hover:text-rotpar-700 text-2xl mt-1 transition-colors">›</span>
              </div>
            </button>
          }
        </div>
      }

      <!-- PASO 3: LISTA DE OFs -->
      @if (vista() === 'ofs' && pedidoSeleccionado()) {
        <div class="mb-6">
          <h2 class="font-display text-3xl font-bold text-rotpar-800">{{ pedidoSeleccionado()!.referencia }}</h2>
          <p class="text-steel-500 mt-1">{{ pedidoSeleccionado()!.cliente }} · Selecciona la OF</p>
        </div>
        <div class="space-y-3">
          @for (of of pedidoSeleccionado()!.ofs; track of.id) {
            <button
              (click)="seleccionarOF(of)"
              class="w-full bg-white rounded-xl border border-steel-200 p-5 text-left hover:border-rotpar-400 hover:shadow-md transition-all duration-150 group">
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <div class="flex items-center gap-3 mb-1">
                    <span class="font-display text-lg font-bold text-rotpar-800">{{ of.referencia }}</span>
                    <span [class]="badgeEstadoOF(of.estado)">{{ labelEstadoOF(of.estado) }}</span>
                  </div>
                  <p class="text-steel-700">{{ of.descripcion }}</p>
                  <div class="flex gap-2 mt-3">
                    @for (proc of of.procesos; track proc.id) {
                      <span [class]="badgeMiniProceso(proc.estado)" class="text-xs px-2 py-0.5 rounded-full font-medium">
                        {{ proc.nombre }}
                      </span>
                    }
                  </div>
                </div>
                <span class="text-rotpar-400 group-hover:text-rotpar-700 text-2xl mt-1 transition-colors">›</span>
              </div>
            </button>
          }
        </div>
      }

      <!-- PASO 4: PROCESOS DE LA OF -->
      @if (vista() === 'procesos' && ofSeleccionada()) {
        <div class="mb-6">
          <h2 class="font-display text-3xl font-bold text-rotpar-800">{{ ofSeleccionada()!.referencia }}</h2>
          <p class="text-steel-500 mt-1">{{ ofSeleccionada()!.descripcion }}</p>
        </div>

        @if (!procesoParaIniciar()) {
          <div class="space-y-3">
            @for (proc of ofSeleccionada()!.procesos; track proc.id) {
              <div class="bg-white rounded-xl border border-steel-200 p-5">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-4">
                    <span class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                      [class]="circuloProceso(proc.estado)">
                      {{ proc.orden }}
                    </span>
                    <div>
                      <p class="font-semibold text-steel-800 text-lg">{{ proc.nombre }}</p>
                      <span [class]="badgeEstadoProceso(proc.estado)" class="text-xs">{{ labelEstadoProceso(proc.estado) }}</span>
                    </div>
                  </div>
                  @if (proc.estado === 'pendiente' || proc.estado === 'en_curso') {
                    <button
                      (click)="prepararInicio(proc)"
                      [class]="proc.estado === 'en_curso'
                        ? 'bg-amber-500 hover:bg-amber-600 text-white px-5 py-2.5 rounded-lg font-semibold transition-colors'
                        : 'bg-rotpar-700 hover:bg-rotpar-800 text-white px-5 py-2.5 rounded-lg font-semibold transition-colors'">
                      {{ proc.estado === 'en_curso' ? 'Unirme' : 'Iniciar' }}
                    </button>
                  }
                  @if (proc.estado === 'completado') {
                    <span class="text-ok-600 font-semibold text-sm">✓ Completado</span>
                  }
                </div>
              </div>
            }
          </div>
        }

        <!-- SELECTOR DE MÁQUINA (inline antes de iniciar) -->
        @if (procesoParaIniciar()) {
          <div class="bg-white rounded-xl border-2 border-amber-400 p-6 shadow-md">
            <h3 class="font-display text-xl font-bold text-rotpar-800 mb-1">Iniciar: {{ procesoParaIniciar()!.nombre }}</h3>
            <p class="text-steel-500 text-sm mb-5">Selecciona la máquina en la que vas a trabajar</p>
            <div class="grid grid-cols-2 gap-3 mb-6">
              @for (mq of datos.maquinas; track mq.id) {
                <button
                  (click)="seleccionarMaquina(mq)"
                  [class]="maquinaSeleccionada()?.id === mq.id
                    ? 'border-2 border-rotpar-600 bg-rotpar-50 rounded-lg p-3 text-left transition-all'
                    : 'border border-steel-200 bg-white rounded-lg p-3 text-left hover:border-rotpar-400 transition-all'">
                  <p class="font-semibold text-steel-800">{{ mq.nombre }}</p>
                  <p class="text-steel-400 text-xs">{{ mq.costePorHora }}€/h</p>
                </button>
              }
            </div>
            <div class="flex gap-3">
              <button (click)="cancelarInicio()" class="flex-1 border border-steel-300 text-steel-600 py-3 rounded-lg font-semibold hover:bg-steel-100 transition-colors">
                Cancelar
              </button>
              <button
                (click)="confirmarInicio()"
                [disabled]="!maquinaSeleccionada()"
                class="flex-1 bg-rotpar-700 text-white py-3 rounded-lg font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-rotpar-800 transition-colors">
                Confirmar inicio
              </button>
            </div>
          </div>
        }
      }

      <!-- PASO 5: PROCESO ACTIVO CON CRONÓMETRO -->
      @if (vista() === 'activo') {
        <div class="text-center">
          <div class="bg-white rounded-2xl border border-steel-200 shadow-sm p-8 mb-4">
            <div class="inline-flex items-center gap-2 bg-ok-50 text-ok-700 px-4 py-1.5 rounded-full text-sm font-semibold mb-6">
              <span class="w-2 h-2 rounded-full bg-ok-600 animate-pulse inline-block"></span>
              EN CURSO
            </div>
            <h2 class="font-display text-3xl font-bold text-rotpar-800 mb-1">{{ procesoActivo()?.nombre }}</h2>
            <p class="text-steel-500 mb-2">{{ ofSeleccionada()?.referencia }} · {{ ofSeleccionada()?.descripcion }}</p>
            <p class="text-steel-400 text-sm mb-8">
              {{ operarioActual()?.nombre }} · {{ maquinaActiva()?.nombre }}
            </p>

            <!-- CRONÓMETRO GRANDE -->
            <div class="font-mono text-7xl font-bold text-rotpar-800 tracking-tight mb-2">
              {{ tiempoFormateado() }}
            </div>
            <p class="text-steel-400 text-sm mb-10">Tiempo en este proceso</p>

            <!-- ACCIONES -->
            <div class="flex gap-4 justify-center">
              <button
                (click)="salirDelProceso()"
                class="border-2 border-steel-300 text-steel-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-steel-100 transition-colors">
                Salgo yo, sigue otro
              </button>
              <button
                (click)="finalizarProceso()"
                class="bg-ok-600 hover:bg-ok-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-colors shadow-md">
                ✓ Proceso terminado
              </button>
            </div>
          </div>

          <p class="text-steel-400 text-sm">
            "Proceso terminado" indica que el proceso físico ha finalizado para todos.<br>
            "Salgo yo" solo cierra tu sesión — otro puede continuar.
          </p>
        </div>
      }

    </main>
  </div>
  `
})
export class TerminalComponent implements OnDestroy {

  constructor(readonly datos: DatosService) {}

  // Estado de navegación
  vista = signal<Vista>('operario');
  operarioActual    = signal<Operario | null>(null);
  pedidoSeleccionado = signal<Pedido | null>(null);
  ofSeleccionada    = signal<OrdenFabricacion | null>(null);
  procesoActivo     = signal<Proceso | null>(null);
  maquinaActiva     = signal<Maquina | null>(null);

  // Selección antes de iniciar
  procesoParaIniciar = signal<Proceso | null>(null);
  maquinaSeleccionada = signal<Maquina | null>(null);

  // Cronómetro
  private _inicioTiempo: Date | null = null;
  private _intervalo: ReturnType<typeof setInterval> | null = null;
  segundos = signal(0);

  horaActual = signal(this._formatearHora(new Date()));
  private _reloj = setInterval(() => this.horaActual.set(this._formatearHora(new Date())), 1000);

  pedidosActivos = computed(() => this.datos.getPedidosActivos());

  tiempoFormateado = computed(() => {
    const s = this.segundos();
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`;
  });

  ngOnDestroy() {
    if (this._intervalo) clearInterval(this._intervalo);
    if (this._reloj) clearInterval(this._reloj);
  }

  // NAVEGACIÓN
  seleccionarOperario(op: Operario) {
    this.operarioActual.set(op);
    this.vista.set('pedidos');
  }

  cambiarOperario() {
    this.operarioActual.set(null);
    this.pedidoSeleccionado.set(null);
    this.ofSeleccionada.set(null);
    this.vista.set('operario');
  }

  seleccionarPedido(p: Pedido) {
    this.pedidoSeleccionado.set(p);
    this.vista.set('ofs');
  }

  seleccionarOF(of: OrdenFabricacion) {
    this.ofSeleccionada.set(of);
    this.procesoParaIniciar.set(null);
    this.maquinaSeleccionada.set(null);
    this.vista.set('procesos');
  }

  irA(v: Vista) {
    if (v === 'pedidos') { this.pedidoSeleccionado.set(null); this.ofSeleccionada.set(null); }
    if (v === 'ofs') { this.ofSeleccionada.set(null); }
    this.vista.set(v);
  }

  // INICIO DE PROCESO
  prepararInicio(proc: Proceso) {
    this.procesoParaIniciar.set(proc);
    this.maquinaSeleccionada.set(null);
  }

  seleccionarMaquina(mq: Maquina) {
    this.maquinaSeleccionada.set(mq);
  }

  cancelarInicio() {
    this.procesoParaIniciar.set(null);
    this.maquinaSeleccionada.set(null);
  }

  confirmarInicio() {
    const op = this.operarioActual();
    const mq = this.maquinaSeleccionada();
    const proc = this.procesoParaIniciar();
    const ped = this.pedidoSeleccionado();
    const of = this.ofSeleccionada();
    if (!op || !mq || !proc || !ped || !of) return;

    this.datos.iniciarProceso(ped.id, of.id, proc.id, op.id, mq.id);
    this.procesoActivo.set(proc);
    this.maquinaActiva.set(mq);
    this._inicioTiempo = new Date();
    this.segundos.set(0);
    this._intervalo = setInterval(() => {
      this.segundos.set(Math.floor((Date.now() - this._inicioTiempo!.getTime()) / 1000));
    }, 1000);
    this.vista.set('activo');
  }

  // FIN DE PROCESO
  salirDelProceso() {
    this._pararCronometro();
    this.procesoActivo.set(null);
    this.maquinaActiva.set(null);
    this.procesoParaIniciar.set(null);
    this.maquinaSeleccionada.set(null);
    this.vista.set('procesos');
  }

  finalizarProceso() {
    const ped = this.pedidoSeleccionado();
    const of = this.ofSeleccionada();
    const proc = this.procesoActivo();
    if (!ped || !of || !proc) return;
    this.datos.completarProceso(ped.id, of.id, proc.id);
    this._pararCronometro();
    this.procesoActivo.set(null);
    this.maquinaActiva.set(null);
    // Refrescar la OF desde el store
    const ofActualizada = this.datos.getOF(ped.id, of.id);
    if (ofActualizada) this.ofSeleccionada.set(ofActualizada);
    this.vista.set('procesos');
  }

  private _pararCronometro() {
    if (this._intervalo) { clearInterval(this._intervalo); this._intervalo = null; }
  }

  // UTILIDADES
  iniciales(nombre: string) {
    return nombre.split(' ').slice(0,2).map(n => n[0]).join('').toUpperCase();
  }

  private _formatearHora(d: Date) {
    return d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  }

  badgeEstado(estado: string) {
    const map: Record<string, string> = {
      pendiente:  'bg-steel-100 text-steel-600 px-2.5 py-0.5 rounded-full text-xs font-semibold',
      en_curso:   'bg-amber-100 text-amber-600 px-2.5 py-0.5 rounded-full text-xs font-semibold',
      finalizado: 'bg-ok-100 text-ok-700 px-2.5 py-0.5 rounded-full text-xs font-semibold',
    };
    return map[estado] ?? map['pendiente'];
  }

  badgeEstadoOF(estado: string) {
    const map: Record<string, string> = {
      pendiente:  'bg-steel-100 text-steel-600 px-2 py-0.5 rounded-full text-xs font-semibold',
      en_curso:   'bg-amber-100 text-amber-600 px-2 py-0.5 rounded-full text-xs font-semibold',
      finalizada: 'bg-ok-100 text-ok-700 px-2 py-0.5 rounded-full text-xs font-semibold',
    };
    return map[estado] ?? map['pendiente'];
  }

  badgeEstadoProceso(estado: string) {
    const map: Record<string, string> = {
      pendiente:  'bg-steel-100 text-steel-500 px-2 py-0.5 rounded-full font-medium',
      en_curso:   'bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium',
      completado: 'bg-ok-100 text-ok-700 px-2 py-0.5 rounded-full font-medium',
    };
    return map[estado] ?? map['pendiente'];
  }

  badgeMiniProceso(estado: string) {
    const map: Record<string, string> = {
      pendiente:  'bg-steel-100 text-steel-500',
      en_curso:   'bg-amber-100 text-amber-700',
      completado: 'bg-ok-100 text-ok-700',
    };
    return map[estado] ?? map['pendiente'];
  }

  circuloProceso(estado: string) {
    const map: Record<string, string> = {
      pendiente:  'bg-steel-100 text-steel-500',
      en_curso:   'bg-amber-400 text-rotpar-900',
      completado: 'bg-ok-100 text-ok-700',
    };
    return map[estado] ?? map['pendiente'];
  }

  labelEstado(e: string) {
    return { pendiente: 'Pendiente', en_curso: 'En curso', finalizado: 'Finalizado' }[e] ?? e;
  }
  labelEstadoOF(e: string) {
    return { pendiente: 'Pendiente', en_curso: 'En curso', finalizada: 'Finalizada' }[e] ?? e;
  }
  labelEstadoProceso(e: string) {
    return { pendiente: 'Pendiente', en_curso: 'En curso', completado: 'Completado' }[e] ?? e;
  }
}