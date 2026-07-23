import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-contacto',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './contacto.component.html',
  styleUrl: './contacto.component.css'
})
export class ContactoComponent {
  nombre = '';
  correo = '';
  mensaje = '';

  //Abre WhatsApp con el mensaje del formulario
  enviarWhatsApp() {
    const texto = `Hola! Soy ${this.nombre || '...'}. ${this.mensaje || 'Quiero información'}`;
    window.open(`https://wa.me/573134834606?text=${encodeURIComponent(texto)}`, '_blank');
  }
}
