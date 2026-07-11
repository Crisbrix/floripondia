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
    this.productSvc.fetchProducts();
  }

  get categories() {
    const cats = this.products
      .map(p => p.category)
      .filter((c, i, a) => a.indexOf(c) === i);
    return [{ key: 'todas', name: 'Todas', color: '#F8BBD0' }, ...cats.map(c => ({ key: c, name: c, color: '#F8BBD0' }))];
  }

  get products() { return this.productSvc.all; }

  get filtered() {
    if (this.activeFilter === 'todas') return this.products;
    return this.products.filter(p => p.category === this.activeFilter);
  }

  filterBy(key: string) {
    this.activeFilter = key;
  }
}
