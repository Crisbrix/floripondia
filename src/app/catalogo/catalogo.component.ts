import { Component } from '@angular/core';

@Component({
  selector: 'app-catalogo',
  standalone: true,
  imports: [],
  templateUrl: './catalogo.component.html',
  styleUrl: './catalogo.component.css'
})
export class CatalogoComponent {
  activeFilter = 'todas';

  categories = [
    { key: 'todas', name: 'Todas', color: '#F8BBD0' },
    { key: 'chaquetas', name: 'Chaquetas', color: '#FFF9C4' },
    { key: 'pantalones', name: 'Pantalones', color: '#BBDEFB' },
    { key: 'basicas', name: 'Básicas', color: '#FFFFFF' },
    { key: 'blusas', name: 'Blusas', color: '#F8BBD0' },
    { key: 'zapatos', name: 'Zapatos', color: '#E1BEE7' },
    { key: 'vestidos', name: 'Vestidos', color: '#FFF9C4' },
  ];

  products = [
    { name: 'Chaqueta Otoño', cat: 'chaquetas', image: 'assets/images/chaquetas/1.jpg', color: '#FFF9C4' },
    { name: 'Chaqueta Brisa', cat: 'chaquetas', image: 'assets/images/chaquetas/2.jpg', color: '#FFF9C4' },
    { name: 'Chaqueta Nube', cat: 'chaquetas', image: 'assets/images/chaquetas/3.jpg', color: '#FFF9C4' },
    { name: 'Pantalón Suelto', cat: 'pantalones', image: 'assets/images/pantalones/1.jpg', color: '#BBDEFB' },
    { name: 'Pantalón Cargo', cat: 'pantalones', image: 'assets/images/pantalones/2.jpg', color: '#BBDEFB' },
    { name: 'Pantalón Lino', cat: 'pantalones', image: 'assets/images/pantalones/3.jpg', color: '#BBDEFB' },
    { name: 'Camiseta Algodón', cat: 'basicas', image: 'assets/images/basicas/1.jpg', color: '#FFFFFF' },
    { name: 'Top Cropped', cat: 'basicas', image: 'assets/images/basicas/2.jpg', color: '#FFFFFF' },
    { name: 'Blusa Flores', cat: 'blusas', image: 'assets/images/blusas/1.jpg', color: '#F8BBD0' },
    { name: 'Blusa Seda', cat: 'blusas', image: 'assets/images/blusas/2.jpg', color: '#F8BBD0' },
    { name: 'Blusa Volantes', cat: 'blusas', image: 'assets/images/blusas/3.jpg', color: '#F8BBD0' },
    { name: 'Zapatillas Pastel', cat: 'zapatos', image: 'assets/images/zapatos/1.jpg', color: '#E1BEE7' },
    { name: 'Bailarinas', cat: 'zapatos', image: 'assets/images/zapatos/2.jpg', color: '#E1BEE7' },
    { name: 'Vestido Girasol', cat: 'vestidos', image: 'assets/images/vestidos/1.jpg', color: '#FFF9C4' },
    { name: 'Vestido Vuelo', cat: 'vestidos', image: 'assets/images/vestidos/2.jpg', color: '#FFF9C4' },
    { name: 'Vestido Largo', cat: 'vestidos', image: 'assets/images/vestidos/3.jpg', color: '#FFF9C4' },
  ];

  get filtered() {
    if (this.activeFilter === 'todas') return this.products;
    return this.products.filter(p => p.cat === this.activeFilter);
  }

  filterBy(key: string) {
    this.activeFilter = key;
  }
}
