import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from './auth.service';

//Protege ruta admin: solo admin y vendedor
@Injectable({ providedIn: 'root' })
export class AdminGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}
  canActivate() {
    const user = this.auth.getSession();
    if (user?.role === 'admin' || user?.role === 'vendedor') return true;
    this.router.navigateByUrl('/login');
    return false;
  }
}
