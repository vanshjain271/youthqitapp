import apiClient from './api.service';
import { Order, PaginatedResponse, OrderStatus } from '../types/api.types';

class OrderService {
  async getOrders(page = 1, limit = 10, status?: OrderStatus): Promise<PaginatedResponse<Order>> {
    return apiClient.get('/orders', { page, limit, status });
  }

  async getOrderById(id: string): Promise<Order> {
    return apiClient.get(`/orders/${id}`);
  }
}

export default new OrderService();
