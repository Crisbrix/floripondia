import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Product {
  id: number;
  name: string;
  category: string;
  image: string;
  color: string;
  stock: number;
}

export interface Sale {
  id: number;
  productName: string;
  customer: string;
  quantity: number;
  total: number;
  recibido: number;
  cambio: number;
  paymentMethod: string;
  date: string;
  vendedor: string;
}

export interface CartItem {
  name: string;
  quantity: number;
  color: string;
}

export interface Stats {
  resumen: {
    ventas: number; monto: number; productos: number; usuarios: number;
    categorias: number; stockBajo: number; ventasHoy: number; ingresosHoy: number;
  };
  ventasDia: { fecha: string; cantidad: number; ingresos: number }[];
  metodos: { metodo_pago: string; cantidad: number; total: number }[];
  topProductos: { producto: string; vendidos: number }[];
  inventario: { nombre: string; stock: number; vendidos: number }[];
}

export interface InventoryItem {
  name: string;
  stock: number;
  color: string;
}

@Injectable({ providedIn: 'root' })
export class ProductService {
  private api = environment.apiUrl;

  all: Product[] = [];
  sales: Sale[] = [];
  inventory: InventoryItem[] = [];
  stats: Stats | null = null;

  constructor(private http: HttpClient) {}

  get totalVentas() {
    return this.sales.reduce((s, v) => s + v.total, 0);
  }

  async fetchProducts() {
    try {
      const res: any = await firstValueFrom(this.http.get(`${this.api}/productos`));
      this.all = res;
    } catch { this.all = []; }
  }

  async fetchSales() {
    try {
      const res: any = await firstValueFrom(this.http.get(`${this.api}/ventas`));
      this.sales = res;
    } catch { this.sales = []; }
  }

  async fetchInventory() {
    try {
      const res: any = await firstValueFrom(this.http.get(`${this.api}/inventario`));
      this.inventory = res;
    } catch { this.inventory = []; }
  }

  async fetchStats() {
    try {
      const res: any = await firstValueFrom(this.http.get(`${this.api}/ventas/stats`));
      this.stats = res;
    } catch { this.stats = null; }
  }

  async add(name: string, category: string, image: string) {
    await firstValueFrom(
      this.http.post(`${this.api}/productos`, { nombre: name, categoria: category, imagen: image })
    );
    await this.fetchProducts();
  }

  async update(id: number, name: string, category: string, image: string) {
    await firstValueFrom(
      this.http.put(`${this.api}/productos/${id}`, { nombre: name, categoria: category, imagen: image })
    );
    await this.fetchProducts();
  }

  async delete(id: number) {
    await firstValueFrom(this.http.delete(`${this.api}/productos/${id}`));
    await this.fetchProducts();
  }

  async updateStock(name: string, stock: number) {
    await firstValueFrom(this.http.patch(`${this.api}/inventario/${encodeURIComponent(name)}`, { stock }));
    await this.fetchInventory();
    await this.fetchProducts();
  }

  async sellCart(items: { name: string; quantity: number }[], metodo_pago: string, total: number = 0, recibido: number = 0): Promise<boolean> {
    try {
      await firstValueFrom(
        this.http.post(`${this.api}/inventario/sell-cart`, { items, metodo_pago, total, recibido })
      );
      await this.fetchInventory();
      await this.fetchSales();
      return true;
    } catch {
      return false;
    }
  }
}
