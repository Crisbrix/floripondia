import { Component } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {
  menuOpen = false;

  constructor(private auth: AuthService, private router: Router) {}

  get user() { return this.auth.getSession(); }

  logout() {
    this.auth.logout();
    this.menuOpen = false;
    this.router.navigateByUrl('/');
  }
}
