import { Component, ChangeDetectorRef } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
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
  tab: 'productos' | 'usuarios' | 'reportes' | 'ventas' | 'perfil' | 'cierre' = 'productos';

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
    private cdr: ChangeDetectorRef,
    private sanitizer: DomSanitizer
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

  verVentasVendedor(vendedor: string) {
    this.selectedVendor = vendedor;
    this.vendorSales = this.productSvc.sales.filter(s => s.vendedor === vendedor);
  }

  cerrarVentasVendedor() {
    this.selectedVendor = '';
    this.vendorSales = [];
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
  vComentario = '';
  selectedVendor = '';
  vendorSales: any[] = [];
  get vendorTotal() { return this.vendorSales.reduce((s, v) => s + v.total, 0); }
  cierreLoading = false;
  cierreSales: any[] = [];
  get cierreTotal() { return this.cierreSales.reduce((s, v) => s + v.total, 0); }
  get cierrePorMetodo() {
    const map = new Map<string, { metodo: string; ventas: number; total: number }>();
    for (const s of this.cierreSales) {
      const m = s.paymentMethod;
      if (!map.has(m)) map.set(m, { metodo: m, ventas: 0, total: 0 });
      map.get(m)!.ventas += s.quantity;
      map.get(m)!.total += s.total;
    }
    return [...map.values()];
  }
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

  iconoProducto(nombre: string): SafeHtml {
    const svg = (path: string, vb = '0 0 24 24') =>
      `<svg viewBox="${vb}" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${path}</svg>`;
    const mapa: Record<string,SafeHtml> = {
      Chaquetas:  svg('<path d="M7 5l-5 4v14h8v-6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v6h8V9l-5-4"/><path d="M7 5V3a2 2 0 0 1 2-2h2"/><path d="M17 5V3a2 2 0 0 0-2-2h-2"/>'),
      Sacos:      svg('<path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>'),
      Jeanes:     svg('<path d="M6 2L4 6v16h7V10h2v12h7V6l-2-4"/><line x1="4" y1="10" x2="20" y2="10"/>'),
      Pantalones: svg('<path d="M6 2L4 6v16h7V10h2v12h7V6l-2-4"/><line x1="4" y1="10" x2="20" y2="10"/>'),
      Pañoletas:  svg('<path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>'),
      Pantalonetas: svg('<path d="M6 2l-2 6v8h6V8h4v8h6V8l-2-6"/><circle cx="9" cy="4" r="1"/><circle cx="15" cy="4" r="1"/>'),
      'Faldas / Vestidos': svg('<path d="M6 2l-3 6a4 4 0 0 0 4 4h10a4 4 0 0 0 4-4l-3-6"/><line x1="12" y1="12" x2="12" y2="22"/><path d="M9 22h6"/>'),
      Corsés:     svg('<path d="M8 2l-2 4v3c0 4 3 7 6 9 3-2 6-5 6-9V6l-2-4"/><path d="M8 9h8"/><path d="M8 13h8"/>'),
      Blusas:     svg('<path d="M4 8V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2"/><path d="M4 8v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8"/><path d="M8 2v4"/><path d="M16 2v4"/>'),
      Básicas:    svg('<path d="M4 8V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2"/><path d="M4 8v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8"/>'),
      Bodies:     svg('<path d="M6 2L3 6v3a5 5 0 0 0 5 5h8a5 5 0 0 0 5-5V6l-3-4"/><line x1="12" y1="14" x2="12" y2="22"/><path d="M9 22h6"/>'),
      Tenis:      svg('<path d="M4 12a8 8 0 0 1 16 0"/><path d="M4 12a4 4 0 0 0 8 0"/><path d="M16 12a4 4 0 0 0 8 0"/><line x1="8" y1="16" x2="16" y2="16"/><line x1="10" y1="18" x2="14" y2="18"/>'),
      Sombreros:  svg('<ellipse cx="12" cy="6" rx="8" ry="3"/><path d="M6 6v3a6 6 0 0 0 12 0V6"/><line x1="9" y1="6" x2="9" y2="15"/><line x1="15" y1="6" x2="15" y2="15"/>'),
      Camisetas:  svg('<path d="M4 8V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2"/><path d="M4 8v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8"/>'),
      Gorras:     svg('<path d="M12 3a9 9 0 0 1 9 9v3h-2v-3a7 7 0 0 0-14 0v3H3v-3a9 9 0 0 1 9-9z"/><path d="M3 15h18v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-2z"/>'),
      Medias:     svg('<path d="M8 2v12l-3 4a3 3 0 0 0 6 0l-3-4V2"/><path d="M16 2v12l-3 4a3 3 0 0 0 6 0l-3-4V2"/>'),
      Aretes:     svg('<circle cx="12" cy="4" r="3"/><circle cx="6" cy="16" r="4"/><circle cx="18" cy="16" r="4"/><line x1="9" y1="6" x2="6" y2="12"/><line x1="15" y1="6" x2="18" y2="12"/>'),
      Collares:   svg('<path d="M6 20L4 8a4 4 0 0 1 8 0l-2 12"/><path d="M18 20l-2-12a4 4 0 0 1 8 0l-2 12"/><path d="M10 14h4"/><circle cx="12" cy="18" r="3"/>'),
      Bolsos:     svg('<rect x="4" y="8" width="16" height="14" rx="3"/><path d="M8 8V6a4 4 0 0 1 8 0v2"/><line x1="12" y1="14" x2="12" y2="18"/>'),
      Caimanes:   svg('<path d="M4 16l3-3 5 3 5-3 3 3"/><path d="M4 20V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v14"/>'),
      Pulseras:   svg('<circle cx="16" cy="12" r="5"/><circle cx="8" cy="12" r="3"/><line x1="11" y1="12" x2="13" y2="12"/>'),
      Correas:    svg('<rect x="3" y="10" width="18" height="4" rx="2"/><circle cx="7" cy="12" r="1.5" fill="currentColor"/><circle cx="17" cy="12" r="1.5" fill="currentColor"/>'),
    };
    const svgStr = mapa[nombre] || svg('<circle cx="12" cy="12" r="6"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>');
    return this.sanitizer.bypassSecurityTrustHtml(svgStr as string);
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
    const ok = await this.productSvc.sellCart(items, this.paymentMethod, this.vTotal, recibido, this.vComentario);
    if (ok) {
      this.vMsg = `Venta finalizada — ${this.cartTotal} artículo(s)`;
      this.vErr = '';
      this.cart = [];
      this.vTotal = 0;
      this.vRecibido = 0;
      this.vComentario = '';
    } else {
      this.vErr = 'Error al procesar la venta: ' + this.productSvc.lastError;
      this.vMsg = '';
    }
  }

  async abrirCierre() {
    this.tab = 'cierre';
    this.cierreLoading = true;
    await this.productSvc.fetchSales();
    const hoy = new Date().toISOString().slice(0, 10);
    this.cierreSales = this.productSvc.sales.filter(s => s.date === hoy);
    this.cierreLoading = false;
  }

  async confirmarCierre() {
    if (confirm('¿Confirmar el cierre de caja del día de hoy?')) {
      alert('Cierre de caja confirmado. Puedes imprimir o guardar esta pantalla como registro.');
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
