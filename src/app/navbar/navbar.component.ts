import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink],
  template: `
    <nav>
      <div class="container nav-content">
        <a routerLink="/" class="logo">Floripondía</a>
        <div class="links">
          <a routerLink="/">Inicio</a>
          <a href="#">Catálogo</a>
          <a href="#">Nosotras</a>
          <a href="#">Contacto</a>
        </div>
      </div>
    </nav>
  `,
  styles: `
    nav {
      background: #fff;
      padding: 16px 0;
      position: sticky;
      top: 0;
      z-index: 100;
      border-bottom: 1px solid #f0f0f0;
    }
    .nav-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .logo {
      font-family: 'Pacifico', cursive;
      font-size: 1.8rem;
      color: #555;
      letter-spacing: 1px;
    }
    .links { display: flex; gap: 28px; }
    .links a {
      color: #999;
      font-weight: 600;
      font-size: 0.9rem;
      transition: color 0.2s;
    }
    .links a:hover { color: #555; }
  `
})
export class NavbarComponent {}
