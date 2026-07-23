import { Component, ElementRef, ViewChildren, QueryList, AfterViewInit } from '@angular/core';
import { ProductService } from '../auth/product.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements AfterViewInit {
  @ViewChildren('poster', { read: ElementRef }) posters!: QueryList<ElementRef>;

  constructor(private productSvc: ProductService) {
    this.productSvc.fetchProducts();
  }

  //Activa animacion de aparicion con IntersectionObserver
  ngAfterViewInit() {
    this.observePosters();
    this.posters.changes.subscribe(() => this.observePosters());
  }

  private observePosters() {
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
    this.posters.forEach(p => observer.observe(p.nativeElement));
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
