import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import type {
  OrderAdminActionType,
  OrderAdminListItem,
  OrderPaymentFlowType,
  OrderStatusDefinitionDto,
  OrderStatusTransitionDto,
} from '../models/admin.models';

@Injectable({ providedIn: 'root' })
export class OrdersAdminService {
  private readonly http = inject(HttpClient);

  private api(path: string): string {
    const base = environment.apiUrl.replace(/\/$/, '');
    const p = path.startsWith('/') ? path : `/${path}`;
    return `${base}${p}`;
  }

  listOrders(): Observable<OrderAdminListItem[]> {
    return this.http.get<OrderAdminListItem[]>(this.api('/orders'));
  }

  /** Reasigna pedidos contra entrega que quedaron en estados del flujo transferencia. */
  repairCodStatuses(): Observable<{ updated: number }> {
    return this.http.post<{ updated: number }>(this.api('/orders/repair-cod-statuses'), {});
  }

  applyAction(orderId: string, action: OrderAdminActionType): Observable<OrderAdminListItem> {
    return this.http.post<OrderAdminListItem>(this.api(`/orders/${orderId}/actions`), { action });
  }

  listStatuses(): Observable<OrderStatusDefinitionDto[]> {
    return this.http.get<OrderStatusDefinitionDto[]>(this.api('/order-statuses'));
  }

  createStatus(body: Partial<OrderStatusDefinitionDto> & { code: string; labelAdmin: string; labelCustomer: string }) {
    return this.http.post<OrderStatusDefinitionDto>(this.api('/order-statuses'), body);
  }

  updateStatus(id: string, body: Partial<OrderStatusDefinitionDto>) {
    return this.http.patch<OrderStatusDefinitionDto>(this.api(`/order-statuses/${id}`), body);
  }

  deleteStatus(id: string) {
    return this.http.delete<void>(this.api(`/order-statuses/${id}`));
  }

  listTransitions(paymentFlow?: OrderPaymentFlowType): Observable<OrderStatusTransitionDto[]> {
    const q =
      paymentFlow != null ? `?paymentFlow=${encodeURIComponent(paymentFlow)}` : '';
    return this.http.get<OrderStatusTransitionDto[]>(this.api(`/order-status-transitions${q}`));
  }

  createTransition(body: {
    fromStatusId: string;
    action: OrderAdminActionType;
    toStatusId: string;
    paymentFlow: OrderPaymentFlowType;
  }) {
    return this.http.post<OrderStatusTransitionDto>(this.api('/order-status-transitions'), body);
  }

  cloneTransition(body: { sourceId: string; paymentFlow: OrderPaymentFlowType }) {
    return this.http.post<OrderStatusTransitionDto>(this.api('/order-status-transitions/clone'), body);
  }

  updateTransition(id: string, body: { toStatusId?: string }) {
    return this.http.patch<OrderStatusTransitionDto>(this.api(`/order-status-transitions/${id}`), body);
  }

  deleteTransition(id: string) {
    return this.http.delete<void>(this.api(`/order-status-transitions/${id}`));
  }
}
