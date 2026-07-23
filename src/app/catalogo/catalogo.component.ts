import { Component } from '@angular/core';
import { ProductService } from '../auth/product.service';

@Component({
  selector: 'app-catalogo',
  standalone: true,
  imports: [],
  templateUrl: './catalogo.component.html',
  styleUrl: './catalogo.component.css'
})
export class CatalogoComponent {
  activeFilter = 'todas';

  constructor(private productSvc: ProductService) {
    //Carga productos al iniciar
    this.productSvc.fetchProducts();
  }

  //Retorna lista de categorias unicas mas "Todas"
  get categories() {
    const cats = this.products
      .map(p => p.category)
      .filter((c, i, a) => a.indexOf(c) === i);
    return [{ key: 'todas', name: 'Todas', color: '#F8BBD0' }, ...cats.map(c => ({ key: c, name: c, color: '#F8BBD0' }))];
  }

  //Retorna todos los productos
  get products() { return this.productSvc.all; }

  //Filtra productos por categoria activa
  get filtered() {
    if (this.activeFilter === 'todas') return this.products;
    return this.products.filter(p => p.category === this.activeFilter);
  }

  //Cambia el filtro activo
  filterBy(key: string) {
    this.activeFilter = key;
  }
}
