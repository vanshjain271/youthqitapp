import apiClient from './api.service';
import { Customer, PaginatedResponse } from '../types/api.types';

class CustomerService {
  async getCustomers(page = 1, limit = 10, search?: string): Promise<PaginatedResponse<Customer>> {
    return apiClient.get('/customers', { page, limit, search });
  }

  async getCustomerById(id: string): Promise<Customer> {
    return apiClient.get(`/customers/${id}`);
  }

  async createCustomer(data: Partial<Customer>): Promise<Customer> {
    return apiClient.post('/customers', data);
  }

  async updateCustomer(id: string, data: Partial<Customer>): Promise<Customer> {
    return apiClient.patch(`/customers/${id}`, data);
  }

  async deleteCustomer(id: string): Promise<void> {
    return apiClient.delete(`/customers/${id}`);
  }
}

export default new CustomerService();
