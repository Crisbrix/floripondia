import { Component } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { NavbarComponent } from './navbar/navbar.component';
import { FooterComponent } from './footer/footer.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, FooterComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  pageAnim = false;

  constructor(public router: Router) {
    //Transicion de entrada al cambiar de pagina y scroll al inicio
    this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe(() => {
        this.pageAnim = false;
        window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
        setTimeout(() => {
          //Fuerza el recalculo sin la clase para reiniciar la animacion
          const main = document.querySelector('main');
          if (main) void main.offsetHeight;
          this.pageAnim = true;
        }, 0);
      });
  }
}
