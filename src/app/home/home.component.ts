import { Component } from '@angular/core';
import { ProductService } from '../auth/product.service';
import { RevealDirective } from '../shared/reveal.directive';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RevealDirective],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  //Petalo decorativos del hero
  readonly petals = [
    { glyph: '❀', left: '8%', delay: 0, size: '1.6rem', color: '#F8BBD0' },
    { glyph: '✿', left: '22%', delay: 2.4, size: '1.1rem', color: '#CE93D8' },
    { glyph: '❁', left: '45%', delay: 4.1, size: '1.4rem', color: '#90CAF9' },
    { glyph: '❀', left: '63%', delay: 1.3, size: '1rem', color: '#FFF176' },
    { glyph: '✿', left: '78%', delay: 3.2, size: '1.7rem', color: '#F48FB1' },
    { glyph: '❁', left: '91%', delay: 5, size: '1.2rem', color: '#B39DDB' }
  ];

  constructor(private productSvc: ProductService) {
    this.productSvc.fetchProducts();
  }

  //Mapea productos a categorias para la vista
  get categories() {
    return this.productSvc.all.map(p => ({
      name: p.name,
      desc: `Stock: ${p.stock} — Encuentra la mejor ${p.name.toLowerCase()} para ti`,
      image: p.image || '',
      color: p.color,
    }));
  }
}
