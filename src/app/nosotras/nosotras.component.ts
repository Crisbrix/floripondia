import { Component } from '@angular/core';
import { RevealDirective } from '../shared/reveal.directive';

@Component({
  selector: 'app-nosotras',
  standalone: true,
  imports: [RevealDirective],
  templateUrl: './nosotras.component.html',
  styleUrl: './nosotras.component.css'
})
export class NosotrasComponent {}
