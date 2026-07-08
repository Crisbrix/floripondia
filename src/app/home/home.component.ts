import { Component, afterNextRender } from '@angular/core';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  categories = [
    { name: 'Chaquetas', desc: 'Abriga tu estilo con colores que alegran el día', image: 'assets/images/chaquetas/1.jpeg', color: '#FFF9C4' },
    { name: 'Pantalones', desc: 'Comodidad que se ve, desde el primer paso', image: 'assets/images/pantalones/1.jpg', color: '#BBDEFB' },
    { name: 'Básicas', desc: 'El lienzo perfecto para tu día a día', image: 'assets/images/basicas/1.jpg', color: '#FFFFFF' },
    { name: 'Blusas', desc: 'Femeninas, frescas y con personalidad', image: 'assets/images/blusas/1.jpg', color: '#F8BBD0' },
    { name: 'Zapatos', desc: 'El paso perfecto para cualquier ocasión', image: 'assets/images/zapatos/1.jpg', color: '#E1BEE7' },
    { name: 'Vestidos', desc: 'Gira, baila, vive — con el estilo que te mereces', image: 'assets/images/vestidos/1.jpg', color: '#FFF9C4' },
  ];

  constructor() {
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
}
