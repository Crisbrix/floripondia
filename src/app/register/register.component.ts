import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  nombre = '';
  email = '';
  password = '';
  confirmar = '';
  error = '';
  ok = false;

  constructor(private auth: AuthService, private router: Router) {}

  //Valida campos, registra usuario y redirige al login
  async registrarse() {
    if (!this.nombre || !this.email || !this.password) {
      this.error = 'Todos los campos son obligatorios';
      return;
    }
    if (this.password !== this.confirmar) {
      this.error = 'Las contraseñas no coinciden';
      return;
    }
    const exito = await this.auth.register(this.email, this.nombre, this.password);
    if (exito) {
      this.ok = true;
      setTimeout(() => this.router.navigateByUrl('/login'), 2000);
    } else {
      this.error = 'Este correo ya está registrado';
    }
  }
}
