import { Component, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Chart, BarController, DoughnutController, BarElement, ArcElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';
import { AuthService, User } from '../auth/auth.service';
import { ProductService, Product, Stats } from '../auth/product.service';

Chart.register(BarController, DoughnutController, BarElement, ArcElement, CategoryScale, LinearScale, Tooltip, Legend);

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css'
})
export class AdminComponent {
  sidebarOpen = true;
  tab: 'productos' | 'usuarios' | 'reportes' | 'ventas' | 'perfil' = 'productos';

  users: (User & { password?: string })[] = [];

  showProdModal = false;
  newName = '';
  newCat = '';
  newImg = '';
  newDesc = '';
  newStock = 0;
  editProd: Product | null = null;
  msg = '';
  err = '';

  uNombre = '';
  uEmail = '';
  uPass = '';
  uRole: 'vendedor' | 'admin' = 'vendedor';
  uMsg = '';
  uErr = '';

  constructor(
    private auth: AuthService,
    private productSvc: ProductService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    this.loadData();
    if (!this.isAdmin && (this.tab === 'reportes' || this.tab === 'usuarios')) {
      this.tab = 'productos';
    }
  }

  async loadData() {
    const tasks = [
      this.productSvc.fetchProducts(),
      this.productSvc.fetchSales(),
      this.productSvc.fetchInventory(),
    ];
    if (this.isAdmin) tasks.push(this.cargarUsuarios());
    await Promise.all(tasks);
  }

  get isAdmin() { return this.auth.getSession()?.role === 'admin'; }
  get products() { return this.productSvc.all; }
  get sales() { return this.productSvc.sales; }
  get totalVentas() { return this.productSvc.totalVentas; }
  get inventory() { return this.productSvc.inventory; }
  stats: Stats | null = null;
  get user() { return this.auth.getSession(); }

  chartInstances: Chart[] = [];
  pNombre = '';
  pPass = '';
  pMsg = '';
  pErr = '';

  async abrirReportes() {
    this.tab = 'reportes';
    await this.productSvc.fetchStats();
    this.stats = this.productSvc.stats;
    this.cdr.detectChanges();
    setTimeout(() => this.renderCharts());
  }

  private renderCharts() {
    this.destroyCharts();
    const s = this.stats;
    if (!s) return;

    const createChart = (id: string, config: any) => {
      const canvas = document.getElementById(id) as HTMLCanvasElement;
      if (!canvas) {
        console.warn(`Canvas #${id} no encontrado`);
        return;
      }
      try {
        this.chartInstances.push(new Chart(canvas, config));
      } catch (e) {
        console.error(`Error al crear chart #${id}:`, e);
      }
    };

    const colores: Record<string, string> = { efectivo: '#C8E6C9', tarjeta: '#BBDEFB', nequi: '#E1BEE7', daviplata: '#FFF9C4', addi: '#F8BBD0' };
    const dias = s.ventasDia.slice().reverse();

    createChart('chart-ventas', {
      type: 'bar',
      data: {
        labels: dias.map(d => d.fecha.slice(5)),
        datasets: [
          { label: 'Ventas', data: dias.map(d => d.cantidad), backgroundColor: '#BBDEFB', borderRadius: 4 },
          { label: 'Ingresos $', data: dias.map(d => d.ingresos), backgroundColor: '#FFF9C4', borderRadius: 4, yAxisID: 'y1' },
        ],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { position: 'top', labels: { boxWidth: 12, padding: 12 } } },
        scales: { y: { beginAtZero: true, grid: { color: '#f5f5f5' } }, y1: { position: 'right', beginAtZero: true, grid: { display: false } } },
      },
    });

    createChart('chart-metodos', {
      type: 'doughnut',
      data: {
        labels: s.metodos.map(m => m.metodo_pago),
        datasets: [{ data: s.metodos.map(m => m.cantidad), backgroundColor: s.metodos.map(m => colores[m.metodo_pago] || '#ddd'), borderWidth: 0 }],
      },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { boxWidth: 12, padding: 12 } } } },
    });

    createChart('chart-top', {
      type: 'bar',
      data: {
        labels: s.topProductos.map(p => p.producto),
        datasets: [{ label: 'Unidades vendidas', data: s.topProductos.map(p => p.vendidos), backgroundColor: '#F8BBD0', borderRadius: 4 }],
      },
      options: {
        responsive: true, maintainAspectRatio: false, indexAxis: 'y',
        plugins: { legend: { display: false } },
        scales: { x: { beginAtZero: true, grid: { color: '#f5f5f5' } }, y: { grid: { display: false } } },
      },
    });

    createChart('chart-inventario', {
      type: 'bar',
      data: {
        labels: s.inventario.slice(0, 10).map(i => i.nombre),
        datasets: [
          { label: 'Stock', data: s.inventario.slice(0, 10).map(i => i.stock), backgroundColor: '#BBDEFB', borderRadius: 4 },
          { label: 'Vendidos', data: s.inventario.slice(0, 10).map(i => i.vendidos), backgroundColor: '#F8BBD0', borderRadius: 4 },
        ],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { position: 'top', labels: { boxWidth: 12, padding: 12 } } },
        scales: { x: { grid: { display: false } }, y: { beginAtZero: true, grid: { color: '#f5f5f5' } } },
      },
    });
  }

  private destroyCharts() {
    for (const c of this.chartInstances) c.destroy();
    this.chartInstances = [];
  }

  async guardarProd() {
    if (!this.newName) { this.err = 'El nombre es obligatorio'; return; }
    try {
      const catName = this.newCat || this.editProd?.category || '';
      if (this.editProd) {
        await this.productSvc.update(this.editProd.id, this.newName, this.newCat, this.newImg || this.editProd.image);
        await this.productSvc.updateStock(this.editProd.name, this.newStock, this.newDesc || undefined);
        this.msg = 'Producto actualizado';
      } else {
        await this.productSvc.add(this.newName, this.newCat, this.newImg || '');
        if (catName) {
          await this.productSvc.updateStock(catName, 0, this.newDesc || undefined);
        }
        this.msg = 'Producto creado';
      }
      this.limpiarForm();
    } catch {
      this.err = 'Error al guardar el producto';
    }
  }

  nuevoProd() {
    this.editProd = null;
    this.newName = '';
    this.newCat = '';
    this.newImg = '';
    this.newDesc = '';
    this.newStock = 0;
    this.msg = '';
    this.err = '';
    this.showProdModal = true;
  }

  editar(p: Product) {
    const inv = this.inventory.find(i => i.name === p.name);
    this.editProd = p;
    this.newName = p.name;
    this.newCat = p.category;
    this.newImg = p.image;
    this.newDesc = inv?.descripcion || '';
    this.newStock = p.stock;
    this.msg = '';
    this.err = '';
    this.showProdModal = true;
  }

  async eliminar(id: number) {
    if (confirm('¿Eliminar este producto?')) {
      await this.productSvc.delete(id);
      if (this.editProd?.id === id) this.limpiarForm();
    }
  }

  limpiarForm() {
    this.editProd = null;
    this.newName = '';
    this.newCat = '';
    this.newImg = '';
    this.newDesc = '';
    this.newStock = 0;
    this.showProdModal = false;
  }

  async cargarUsuarios() {
    this.users = await this.auth.getAllUsers();
  }

  async crearUsuario() {
    if (!this.uNombre || !this.uEmail || !this.uPass) {
      this.uErr = 'Todos los campos son obligatorios'; return;
    }
    const ok = await this.auth.createUser(this.uEmail, this.uNombre, this.uPass, this.uRole);
    if (ok) {
      this.uMsg = `Usuario ${this.uRole} creado`;
      this.uErr = '';
      await this.cargarUsuarios();
      this.uNombre = ''; this.uEmail = ''; this.uPass = '';
    } else {
      this.uErr = 'Este correo ya existe';
      this.uMsg = '';
    }
  }

  vMsg = '';
  vErr = '';
  cartOpen = false;
  cart: { name: string; quantity: number; color: string }[] = [];
  paymentMethod: string = 'efectivo';
  vTotal = 0;
  vRecibido = 0;

  get cartTotal() {
    return this.cart.reduce((s, i) => s + i.quantity, 0);
  }

  get vCambio() {
    return this.vRecibido - this.vTotal;
  }
  get esTransferencia() {
    return ['nequi', 'daviplata', 'addi'].includes(this.paymentMethod);
  }

  seleccionarMetodo(m: string) {
    this.paymentMethod = m;
  }

  iconoProducto(nombre: string): string {
    const mapa: Record<string,string> = {
      Chaquetas:'🧥', Sacos:'👔', Jeanes:'👖', Pantalones:'👖',
      Pañoletas:'🧣', Pantalonetas:'🩳', 'Faldas / Vestidos':'👗',
      Corsés:'🫧', Blusas:'👚', Básicas:'👕', Bodies:'🩱',
      Tenis:'👟', Sombreros:'🎩', Camisetas:'👕', Gorras:'🧢',
      Medias:'🧦', Aretes:'💎', Collares:'📿', Bolsos:'👜',
      Caimanes:'👞', Pulseras:'📿', Correas:'🎀',
    };
    return mapa[nombre] || '✦';
  }

  agregarAlCarrito(itemName: string) {
    const inv = this.inventory.find(i => i.name === itemName);
    if (!inv || inv.stock <= 0) {
      this.vErr = `No hay stock de ${itemName}`;
      this.vMsg = ''; return;
    }
    const existing = this.cart.find(i => i.name === itemName);
    if (existing) {
      if (existing.quantity < inv.stock) {
        existing.quantity++;
      } else {
        this.vErr = `Stock insuficiente de ${itemName}`; return;
      }
    } else {
      this.cart.push({ name: itemName, quantity: 1, color: inv.color });
    }
    this.cartOpen = true;
    this.vMsg = `${itemName} +1`;
    this.vErr = '';
  }

  quitarDelCarrito(name: string) {
    const idx = this.cart.findIndex(i => i.name === name);
    if (idx !== -1) {
      if (this.cart[idx].quantity > 1) {
        this.cart[idx].quantity--;
      } else {
        this.cart.splice(idx, 1);
      }
    }
  }

  async finalizarVenta() {
    if (!this.cart.length) {
      this.vErr = 'Agrega productos al carrito'; return;
    }
    if (this.vTotal <= 0) {
      this.vErr = 'Ingresa el total de la venta'; return;
    }
    if (!this.esTransferencia) {
      if (this.vRecibido <= 0) {
        this.vErr = 'Ingresa cuánto pagaron'; return;
      }
      if (this.vRecibido < this.vTotal) {
        this.vErr = 'El pago no cubre el total'; return;
      }
    }
    const items = this.cart.map(i => ({ name: i.name, quantity: i.quantity }));
    const recibido = this.esTransferencia ? this.vTotal : this.vRecibido;
    const ok = await this.productSvc.sellCart(items, this.paymentMethod, this.vTotal, recibido);
    if (ok) {
      this.vMsg = `Venta finalizada — ${this.cartTotal} artículo(s)`;
      this.vErr = '';
      this.cart = [];
      this.vTotal = 0;
      this.vRecibido = 0;
    } else {
      this.vErr = 'Error al procesar la venta: ' + this.productSvc.lastError;
      this.vMsg = '';
    }
  }

  abrirPerfil() {
    this.tab = 'perfil';
    this.pNombre = this.user?.nombre || '';
    this.pPass = '';
    this.pMsg = '';
    this.pErr = '';
  }

  async guardarPerfil() {
    this.pMsg = '';
    this.pErr = '';
    const ok = await this.auth.updateProfile(this.pNombre, this.pPass || undefined);
    if (ok) {
      this.pMsg = 'Perfil actualizado correctamente';
    } else {
      this.pErr = 'Error al actualizar el perfil';
    }
  }

  cerrarSesion() {
    this.auth.logout();
    this.router.navigateByUrl('/');
  }
}
