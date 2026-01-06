import apiClient from './api.service';
import { Product, PaginatedResponse } from '../types/api.types';

class ProductService {
  async getProducts(page = 1, limit = 10, search?: string): Promise<PaginatedResponse<Product>> {
    return apiClient.get('/products', { page, limit, search });
  }

  async getProductById(id: string): Promise<Product> {
    return apiClient.get(`/products/${id}`);
  }
}

export default new ProductService();
