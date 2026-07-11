import { Component, afterNextRender } from '@angular/core';
import { ProductService } from '../auth/product.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  constructor(private productSvc: ProductService) {
    this.productSvc.fetchProducts();
    afterNextRender(() => {
      const posters = document.querySelectorAll<HTMLElement>('.poster');
      const observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              (entry.target as HTMLElement).classList.add('reveal');
            }
          }
        },
        { threshold: 0.2 }
      );
      posters.forEach(p => observer.observe(p));
    });
  }

  get categories() {
    return this.productSvc.all.map(p => ({
      name: p.name,
      desc: `Stock: ${p.stock} — Encuentra la mejor ${p.name.toLowerCase()} para ti`,
      image: p.image || '',
      color: p.color,
    }));
  }
}
