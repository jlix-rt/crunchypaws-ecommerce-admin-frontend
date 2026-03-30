import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';
import { OrdersAdminService } from '../../core/services/orders-admin.service';
import type {
  OrderAdminActionType,
  OrderAdminListItem,
  OrderPaymentFlowType,
  OrderStatusTransitionDto,
} from '../../core/models/admin.models';

const ACTION_LABELS: Record<OrderAdminActionType, string> = {
  REJECT: 'Rechazar',
  PREPARE: 'Preparar',
  SHIP: 'Enviar',
  FINALIZE: 'Finalizar',
};

@Component({
  selector: 'app-pedidos-admin',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pedidos-admin.component.html',
  styleUrl: './pedidos-admin.component.scss',
})
export class PedidosAdminComponent implements OnInit {
  private readonly ordersApi = inject(OrdersAdminService);

  rows = signal<OrderAdminListItem[]>([]);
  transitions = signal<OrderStatusTransitionDto[]>([]);
  err = signal<string | null>(null);
  busy = signal<string | null>(null);
  loading = signal(true);
  repairBusy = signal(false);

  private readonly actionOrder: OrderAdminActionType[] = ['REJECT', 'PREPARE', 'SHIP', 'FINALIZE'];

  ngOnInit(): void {
    this.reload();
  }

  reload(): void {
    this.err.set(null);
    this.loading.set(true);
    forkJoin({
      orders: this.ordersApi.listOrders(),
      transitions: this.ordersApi.listTransitions(),
    }).subscribe({
      next: ({ orders, transitions }) => {
        this.rows.set(orders);
        this.transitions.set(transitions);
        this.loading.set(false);
      },
      error: (e) => {
        this.loading.set(false);
        this.err.set(e.error?.error ?? 'No se pudieron cargar los pedidos');
      },
    });
  }

  /** Pedidos COD en estados del flujo anticipado → sin botones hasta corregir. */
  repairCodMisplaced(): void {
    if (!confirm('Se reasignarán los pedidos «contra entrega» que estén en estados de transferencia al equivalente correcto. ¿Continuar?')) {
      return;
    }
    this.repairBusy.set(true);
    this.err.set(null);
    this.ordersApi.repairCodStatuses().subscribe({
      next: (r) => {
        this.repairBusy.set(false);
        this.reload();
        if (r.updated > 0) {
          alert(`Se actualizaron ${r.updated} pedido(s).`);
        } else {
          alert('No había pedidos por corregir.');
        }
      },
      error: (e) => {
        this.repairBusy.set(false);
        this.err.set(e.error?.error ?? 'No se pudo corregir');
      },
    });
  }

  paymentFlowForOrder(pm: string): OrderPaymentFlowType {
    return pm === 'CASH_ON_DELIVERY' ? 'COD' : 'ADVANCE';
  }

  actionsForRow(row: OrderAdminListItem): { id: OrderAdminActionType; label: string }[] {
    const flow = this.paymentFlowForOrder(row.paymentMethod);
    const fromId = row.status.id;
    const allowed = new Set(
      this.transitions()
        .filter((t) => t.fromStatusId === fromId && t.paymentFlow === flow)
        .map((t) => t.action),
    );
    return this.actionOrder
      .filter((a) => allowed.has(a))
      .map((a) => ({ id: a, label: ACTION_LABELS[a] }));
  }

  doAction(row: OrderAdminListItem, action: OrderAdminActionType): void {
    if (!confirm(`¿Aplicar «${this.label(action)}» al pedido ${row.orderNumber}?`)) return;
    this.busy.set(row.id);
    this.err.set(null);
    this.ordersApi.applyAction(row.id, action).subscribe({
      next: () => {
        this.busy.set(null);
        this.reload();
      },
      error: (e) => {
        this.busy.set(null);
        this.err.set(e.error?.error ?? e.error?.message ?? 'No se pudo aplicar la acción');
      },
    });
  }

  label(a: OrderAdminActionType): string {
    return ACTION_LABELS[a] ?? a;
  }

  totalNum(row: OrderAdminListItem): number {
    const t = row.total as unknown;
    if (typeof t === 'number') return t;
    return Number(t);
  }
}
