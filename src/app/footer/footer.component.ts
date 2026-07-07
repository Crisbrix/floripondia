import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  imports: [],
  template: `
    <footer>
      <div class="container footer-content">
        <div class="footer-brand">
          <h3>Floripondía</h3>
          <p>Grandiosamente Floripondia</p>
        </div>
        <div class="footer-links">
          <h4>Enlaces</h4>
          <a href="#">Inicio</a>
          <a href="#">Catálogo</a>
          <a href="#">Nosotras</a>
          <a href="#">Contacto</a>
        </div>
        <div class="footer-social">
          <h4>Síguenos</h4>
          <p>Instagram &bull; TikTok &bull; Facebook</p>
        </div>
      </div>
      <div class="footer-bottom">
        <p>&copy; 2026 Floripondía &mdash; Todos los derechos reservados</p>
      </div>
    </footer>
  `,
  styles: `
    footer {
      background: linear-gradient(135deg, var(--violet-soft), var(--pink-soft));
      padding: 40px 0 0;
      margin-top: 60px;
    }
    .footer-content {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 40px;
      padding-bottom: 30px;
    }
    .footer-brand h3 {
      font-size: 1.4rem;
      color: var(--text);
      margin-bottom: 8px;
    }
    .footer-brand p { color: var(--text-light); }
    .footer-links h4, .footer-social h4 {
      font-size: 1rem;
      margin-bottom: 12px;
      color: var(--text);
    }
    .footer-links a {
      display: block;
      color: var(--text-light);
      margin-bottom: 6px;
      transition: color 0.2s;
    }
    .footer-links a:hover { color: var(--text); }
    .footer-social p { color: var(--text-light); }
    .footer-bottom {
      text-align: center;
      padding: 16px 0;
      border-top: 1px solid rgba(0,0,0,0.06);
      font-size: 0.85rem;
      color: var(--text-light);
    }

    @media (max-width: 600px) {
      footer { margin-top: 40px; padding: 30px 0 0; }
      .footer-content {
        grid-template-columns: 1fr;
        gap: 28px;
        text-align: center;
      }
    }
  `
})
export class FooterComponent {}
