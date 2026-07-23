import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  email = '';
  password = '';
  error = '';

  constructor(private auth: AuthService, private router: Router) {}

  //Intenta iniciar sesion y redirige al admin
  async ingresar() {
    const user = await this.auth.login(this.email, this.password);
    if (user) {
      this.router.navigateByUrl('/admin');
    } else {
      this.error = 'Correo o contraseña incorrectos';
    }
  }
}
