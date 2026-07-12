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
  descripcion?: string;
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
  comentario?: string;
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
  ventasPorVendedor: { vendedor: string; ventas: number; total: number }[];
}

export interface InventoryItem {
  name: string;
  stock: number;
  color: string;
  descripcion?: string;
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
      if (!res.ventasPorVendedor) res.ventasPorVendedor = [];
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

  async updateStock(name: string, stock: number, descripcion?: string) {
    const body: any = {};
    if (stock >= 0) body.stock = stock;
    if (descripcion !== undefined) body.descripcion = descripcion;
    await firstValueFrom(this.http.patch(`${this.api}/inventario/${encodeURIComponent(name)}`, body));
    await this.fetchInventory();
    await this.fetchProducts();
  }

  lastError = '';
  cierre: any = null;

  async fetchCierre() {
    try {
      const res: any = await firstValueFrom(this.http.get(`${this.api}/ventas/cierre`));
      this.cierre = res;
    } catch { this.cierre = null; }
  }

  async sellCart(items: { name: string; quantity: number; comentario?: string }[], metodo_pago: string, total: number = 0, recibido: number = 0): Promise<boolean> {
    try {
      this.lastError = '';
      await firstValueFrom(
        this.http.post(`${this.api}/inventario/sell-cart`, { items, metodo_pago, total, recibido })
      );
      await this.fetchInventory();
      await this.fetchSales();
      return true;
    } catch (err: any) {
      this.lastError = err.error?.error || err.message || 'Error desconocido';
      return false;
    }
  }
}
