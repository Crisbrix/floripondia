import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';

function paramsCon(sucursal?: string, extra?: { [k: string]: string | undefined }) {
  let p = new HttpParams();
  if (sucursal) p = p.set('sucursal', sucursal);
  if (extra) for (const [k, v] of Object.entries(extra)) if (v) p = p.set(k, v);
  return p;
}

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
  grupoId?: string;
  sucursal?: string;
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

  async fetchProducts(sucursal?: string) {
    try {
      const res: any = await firstValueFrom(this.http.get(`${this.api}/productos`, { params: paramsCon(sucursal) }));
      this.all = res;
    } catch { this.all = []; }
  }

  async fetchSales(sucursal?: string) {
    try {
      const res: any = await firstValueFrom(this.http.get(`${this.api}/ventas`, { params: paramsCon(sucursal) }));
      this.sales = res;
    } catch { this.sales = []; }
  }

  async fetchInventory(sucursal?: string) {
    try {
      const res: any = await firstValueFrom(this.http.get(`${this.api}/inventario`, { params: paramsCon(sucursal) }));
      this.inventory = res;
    } catch { this.inventory = []; }
  }

  async fetchStats(sucursal?: string) {
    try {
      const res: any = await firstValueFrom(this.http.get(`${this.api}/ventas/stats`, { params: paramsCon(sucursal) }));
      if (!res.ventasPorVendedor) res.ventasPorVendedor = [];
      this.stats = res;
    } catch { this.stats = null; }
  }

  //CRUD productos (stock, color y descripcion propios)
  async add(name: string, image: string, color: string, stock: number, descripcion?: string, sucursal?: string) {
    await firstValueFrom(
      this.http.post(`${this.api}/productos`, { nombre: name, imagen: image, color, stock, descripcion, sucursal })
    );
    await this.fetchProducts(sucursal);
  }

  async update(id: number, name: string, image: string, color: string, stock: number, descripcion?: string, sucursal?: string) {
    await firstValueFrom(
      this.http.put(`${this.api}/productos/${id}`, { nombre: name, imagen: image, color, stock, descripcion, sucursal })
    );
    await this.fetchProducts(sucursal);
  }

  async delete(id: number, sucursal?: string) {
    await firstValueFrom(this.http.delete(`${this.api}/productos/${id}`));
    await this.fetchProducts(sucursal);
  }

  //Actualiza stock de inventario
  async updateStock(name: string, stock: number, descripcion?: string, sucursal?: string) {
    const body: any = {};
    if (stock >= 0) body.stock = stock;
    if (descripcion !== undefined) body.descripcion = descripcion;
    body.sucursal = sucursal;
    await firstValueFrom(this.http.patch(`${this.api}/inventario/${encodeURIComponent(name)}`, body));
    await this.fetchInventory(sucursal);
    await this.fetchProducts(sucursal);
  }

  lastError = '';

  //Confirma cierre de caja
  async confirmarCierre(sucursal?: string) {
    try {
      await firstValueFrom(this.http.post(`${this.api}/ventas/cierre/confirmar`, { sucursal }));
      return true;
    } catch { return false; }
  }

  //Historial de cierres
  async fetchCierres(sucursal?: string): Promise<any[]> {
    try {
      const res: any = await firstValueFrom(this.http.get(`${this.api}/ventas/cierres`, { params: paramsCon(sucursal) }));
      return res;
    } catch { return []; }
  }

  //CRUD ventas
  async deleteSale(id: number, sucursal?: string) {
    await firstValueFrom(this.http.delete(`${this.api}/ventas/${id}`));
    await this.fetchSales(sucursal);
    await this.fetchInventory(sucursal);
  }

  async updateSale(id: number, data: any, sucursal?: string) {
    await firstValueFrom(this.http.put(`${this.api}/ventas/${id}`, data));
    await this.fetchSales(sucursal);
  }
  cierre: any = null;

  //Ventas por vendedor y fecha (modal vendedor)
  async fetchVendorSalesByDate(nombre: string, fecha: string, sucursal?: string): Promise<Sale[]> {
    try {
      return await firstValueFrom(
        this.http.get<Sale[]>(`${this.api}/ventas/vendedor`, { params: paramsCon(sucursal, { nombre, fecha }) })
      );
    } catch { return []; }
  }

  //Ventas filtradas por fecha
  async fetchSalesByDate(fecha: string, sucursal?: string): Promise<any[]> {
    try {
      return await firstValueFrom(this.http.get<any[]>(`${this.api}/ventas`, { params: paramsCon(sucursal, { fecha }) }));
    } catch { return []; }
  }

  //Estado del cierre actual
  async fetchCierre(sucursal?: string) {
    try {
      const res: any = await firstValueFrom(this.http.get(`${this.api}/ventas/cierre`, { params: paramsCon(sucursal) }));
      this.cierre = res;
    } catch { this.cierre = null; }
  }

  //Abre caja
  async abrirCaja(sucursal?: string) {
    try {
      await firstValueFrom(this.http.post(`${this.api}/ventas/caja/abrir`, { sucursal }));
      return true;
    } catch { return false; }
  }

  //Venta multiple con carrito
  async sellCart(items: { name: string; quantity: number; comentario?: string }[], metodo_pago: string, total: number = 0, recibido: number = 0, pagos?: { metodo: string; monto: number }[], sucursal?: string): Promise<boolean> {
    try {
      this.lastError = '';
      await firstValueFrom(
        this.http.post(`${this.api}/inventario/sell-cart`, { items, metodo_pago, total, recibido, pagos, sucursal })
      );
      await this.fetchInventory(sucursal);
      await this.fetchSales(sucursal);
      return true;
    } catch (err: any) {
      this.lastError = err.error?.error || err.message || 'Error desconocido';
      return false;
    }
  }

  //CRUD categorias
  async fetchAllCategories(sucursal?: string) {
    try {
      return await firstValueFrom(this.http.get<any[]>(`${this.api}/categorias`, { params: paramsCon(sucursal) }));
    } catch { return []; }
  }

  async createCategory(data: { nombre: string; stock?: number; color?: string; descripcion?: string; sucursal?: string }) {
    await firstValueFrom(this.http.post(`${this.api}/categorias`, data));
  }

  async updateCategory(id: number, data: { nombre: string; color?: string; descripcion?: string }) {
    await firstValueFrom(this.http.put(`${this.api}/categorias/${id}`, data));
  }

  async deleteCategory(id: number) {
    await firstValueFrom(this.http.delete(`${this.api}/categorias/${id}`));
  }

  //CRUD apartados
  async fetchApartados(sucursal?: string): Promise<any[]> {
    try {
      return await firstValueFrom(this.http.get<any[]>(`${this.api}/apartados`, { params: paramsCon(sucursal) }));
    } catch { return []; }
  }

  async createApartado(data: any) {
    await firstValueFrom(this.http.post(`${this.api}/apartados`, data));
  }

  async updateApartado(id: number, data: any) {
    await firstValueFrom(this.http.put(`${this.api}/apartados/${id}`, data));
  }

  async deleteApartado(id: number) {
    await firstValueFrom(this.http.delete(`${this.api}/apartados/${id}`));
  }

  //Registra un abono (pago) sobre un apartado
  async abonarApartado(id: number, data: { monto: number; metodoPago: string; sucursal?: string }) {
    await firstValueFrom(this.http.post(`${this.api}/apartados/${id}/abono`, data));
  }

  //Informe mensual
  async fetchInformeMensual(mes: string, sucursal?: string): Promise<any> {
    try {
      return await firstValueFrom(this.http.get(`${this.api}/ventas/informe-mensual`, { params: paramsCon(sucursal, { mes }) }));
    } catch { return null; }
  }

  //Ventas Melsus (marca separada)
  async fetchMelsus(): Promise<any[]> {
    try { return await firstValueFrom(this.http.get<any[]>(`${this.api}/melsus`)); }
    catch { return []; }
  }
  async createMelsus(data: { producto: string; metodo_pago: string; total: number; comentario?: string }) {
    await firstValueFrom(this.http.post(`${this.api}/melsus`, data));
  }
  async deleteMelsus(id: number) {
    await firstValueFrom(this.http.delete(`${this.api}/melsus/${id}`));
  }

  //Contabilidad
  async fetchContabilidad(mes?: string, sucursal?: string): Promise<any> {
    try {
      return await firstValueFrom(this.http.get(`${this.api}/contabilidad`, { params: paramsCon(sucursal, { mes }) }));
    } catch (e: any) {
      console.error('fetchContabilidad error:', e?.status, '| body:', JSON.stringify(e?.error ?? e?.message));
      return null;
    }
  }
  async createMovimiento(data: any) {
    await firstValueFrom(this.http.post(`${this.api}/contabilidad`, data));
  }
  async updateMovimiento(id: number, data: any) {
    await firstValueFrom(this.http.put(`${this.api}/contabilidad/${id}`, data));
  }
  async deleteMovimiento(id: number) {
    await firstValueFrom(this.http.delete(`${this.api}/contabilidad/${id}`));
  }
  async createCategoriaContable(data: { nombre: string; tipo: string; color?: string }) {
    await firstValueFrom(this.http.post(`${this.api}/contabilidad/categorias`, data));
  }
  async deleteCategoriaContable(id: number) {
    await firstValueFrom(this.http.delete(`${this.api}/contabilidad/categorias/${id}`));
  }

  //Sube imagen a Vercel Blob y devuelve URL
  async uploadImage(data: string, filename: string): Promise<string> {
    try {
      const res: any = await firstValueFrom(
        this.http.post(`${this.api}/upload`, { data, filename })
      );
      return res.url;
    } catch { return ''; }
  }

  //Analytics global
  async fetchAnalytics(sucursal?: string): Promise<any> {
    try {
      return await firstValueFrom(this.http.get(`${this.api}/ventas/analytics`, { params: paramsCon(sucursal) }));
    } catch (e: any) {
      return null;
    }
  }
}
