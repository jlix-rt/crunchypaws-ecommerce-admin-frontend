import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { OrdersAdminService } from '../../core/services/orders-admin.service';
import type {
  OrderAdminActionType,
  OrderPaymentFlowType,
  OrderStatusDefinitionDto,
  OrderStatusTransitionDto,
} from '../../core/models/admin.models';

@Component({
  selector: 'app-pedidos-estados-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pedidos-estados-admin.component.html',
  styleUrl: './pedidos-estados-admin.component.scss',
})
export class PedidosEstadosAdminComponent implements OnInit {
  private readonly api = inject(OrdersAdminService);

  statuses = signal<OrderStatusDefinitionDto[]>([]);
  transitions = signal<OrderStatusTransitionDto[]>([]);
  err = signal<string | null>(null);
  busy = signal(false);

  newCode = '';
  newLabelAdmin = '';
  newLabelCustomer = '';
  newSort = 100;
  newPaymentFlow: OrderPaymentFlowType = 'ADVANCE';

  trFrom = '';
  trAction: OrderAdminActionType = 'PREPARE';
  trTo = '';
  trPaymentFlow: OrderPaymentFlowType = 'ADVANCE';

  cloneSourceId = '';
  cloneTargetFlow: OrderPaymentFlowType = 'COD';

  readonly actions: OrderAdminActionType[] = ['REJECT', 'PREPARE', 'SHIP', 'FINALIZE'];
  readonly transitionFlows: OrderPaymentFlowType[] = ['ADVANCE', 'COD'];
  readonly statusFlows: OrderPaymentFlowType[] = ['ADVANCE', 'COD', 'SHARED'];

  ngOnInit(): void {
    this.load();
  }

  flowLabel(f: OrderPaymentFlowType): string {
    if (f === 'ADVANCE') return 'Pago anticipado';
    if (f === 'COD') return 'Contra entrega';
    return 'Compartido';
  }

  load(): void {
    this.err.set(null);
    this.busy.set(true);
    forkJoin({ statuses: this.api.listStatuses(), transitions: this.api.listTransitions() }).subscribe({
      next: ({ statuses, transitions }) => {
        this.statuses.set(statuses);
        this.transitions.set(transitions);
        this.busy.set(false);
      },
      error: (e) => {
        this.busy.set(false);
        this.err.set(e.error?.error ?? 'No se pudieron cargar datos');
      },
    });
  }

  crearEstado(): void {
    const code = this.newCode.trim();
    if (!code || !this.newLabelAdmin.trim() || !this.newLabelCustomer.trim()) {
      this.err.set('Completa código y ambas etiquetas.');
      return;
    }
    this.busy.set(true);
    this.err.set(null);
    this.api
      .createStatus({
        code,
        labelAdmin: this.newLabelAdmin.trim(),
        labelCustomer: this.newLabelCustomer.trim(),
        sortOrder: Number(this.newSort) || 100,
        paymentFlow: this.newPaymentFlow,
      })
      .subscribe({
        next: () => {
          this.newCode = '';
          this.newLabelAdmin = '';
          this.newLabelCustomer = '';
          this.load();
        },
        error: (e) => {
          this.busy.set(false);
          this.err.set(e.error?.error ?? 'Error al crear estado');
        },
      });
  }

  eliminarEstado(s: OrderStatusDefinitionDto): void {
    if (!confirm(`¿Eliminar estado "${s.labelAdmin}"?`)) return;
    this.busy.set(true);
    this.api.deleteStatus(s.id).subscribe({
      next: () => this.load(),
      error: (e) => {
        this.busy.set(false);
        this.err.set(e.error?.error ?? 'No se pudo eliminar');
      },
    });
  }

  crearTransicion(): void {
    if (!this.trFrom || !this.trTo) {
      this.err.set('Elige estado origen y destino.');
      return;
    }
    this.busy.set(true);
    this.err.set(null);
    this.api
      .createTransition({
        fromStatusId: this.trFrom,
        action: this.trAction,
        toStatusId: this.trTo,
        paymentFlow: this.trPaymentFlow,
      })
      .subscribe({
        next: () => {
          this.trFrom = '';
          this.trTo = '';
          this.load();
        },
        error: (e) => {
          this.busy.set(false);
          this.err.set(e.error?.error ?? 'Error al crear transición');
        },
      });
  }

  clonarTransicion(): void {
    if (!this.cloneSourceId) {
      this.err.set('Elige una transición existente para copiar.');
      return;
    }
    this.busy.set(true);
    this.err.set(null);
    this.api
      .cloneTransition({ sourceId: this.cloneSourceId, paymentFlow: this.cloneTargetFlow })
      .subscribe({
        next: () => {
          this.cloneSourceId = '';
          this.load();
        },
        error: (e) => {
          this.busy.set(false);
          this.err.set(e.error?.error ?? 'Error al clonar transición');
        },
      });
  }

  eliminarTransicion(t: OrderStatusTransitionDto): void {
    if (!confirm('¿Eliminar esta transición?')) return;
    this.busy.set(true);
    this.api.deleteTransition(t.id).subscribe({
      next: () => this.load(),
      error: (e) => {
        this.busy.set(false);
        this.err.set(e.error?.error ?? 'Error al eliminar');
      },
    });
  }
}
