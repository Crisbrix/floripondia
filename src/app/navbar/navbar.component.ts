import { Component, HostListener } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {
  menuOpen = false;
  isScrolled = false;

  constructor(private auth: AuthService, private router: Router) {}

  //Sombra suave cuando la barra se despeg al hacer scroll
  @HostListener('window:scroll')
  onScroll() {
    this.isScrolled = window.scrollY > 6;
  }

  //Retorna sesion activa del usuario
  get user() { return this.auth.getSession(); }

  //Cierra sesion y redirige al inicio
  logout() {
    this.auth.logout();
    this.menuOpen = false;
    this.router.navigateByUrl('/');
  }
}
