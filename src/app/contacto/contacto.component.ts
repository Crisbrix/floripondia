import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RevealDirective } from '../shared/reveal.directive';

@Component({
  selector: 'app-contacto',
  standalone: true,
  imports: [FormsModule, RevealDirective],
  templateUrl: './contacto.component.html',
  styleUrl: './contacto.component.css'
})
export class ContactoComponent {
  nombre = '';
  correo = '';
  mensaje = '';

  //Canales de contacto mostrados en tarjetas
  readonly channels = [
    {
      href: 'https://wa.me/573134834606',
      bg: '#FFF9C4',
      icon: 'fa-brands fa-whatsapp',
      title: 'WhatsApp:',
      link: '313 483 4606'
    },
    {
      href: 'https://instagram.com/floripondia_boutique',
      bg: '#FCE4EC',
      icon: 'fa-brands fa-instagram',
      title: 'Instagram',
      link: '@floripondia_boutique'
    },
    {
      href: 'mailto:hola@floripondia.co',
      bg: '#E3F2FD',
      icon: 'fa-solid fa-envelope',
      title: 'Email',
      link: 'hola@floripondia.co'
    }
  ];

  //Abre WhatsApp con el mensaje del formulario
  enviarWhatsApp() {
    const texto = `Hola! Soy ${this.nombre || '...'}. ${this.mensaje || 'Quiero información'}`;
    window.open(`https://wa.me/573134834606?text=${encodeURIComponent(texto)}`, '_blank');
  }
}
