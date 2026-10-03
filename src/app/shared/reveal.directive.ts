import { Directive, ElementRef, Input, AfterViewInit, OnDestroy } from '@angular/core';

export type RevealType = 'up' | 'down' | 'left' | 'right' | 'zoom' | 'flip';

/**
 * Aparicion animada al hacer scroll.
 * Uso: <div appReveal> o <div [appReveal]="'left'" [revealDelay]="120">
 * La animacion se retira al terminar para no interferir con los hovers.
 */
@Directive({
  selector: '[appReveal]',
  standalone: true
})
export class RevealDirective implements AfterViewInit, OnDestroy {
  @Input() appReveal: RevealType = 'up';
  @Input() revealDelay = 0;

  private observer?: IntersectionObserver;
  private timer?: ReturnType<typeof setTimeout>;
  private readonly duration = 850;

  private readonly onAnimEnd = (e: AnimationEvent) => {
    if (e.target === this.el.nativeElement) this.cleanup();
  };

  constructor(private el: ElementRef<HTMLElement>) {}

  ngAfterViewInit() {
    const n = this.el.nativeElement;
    n.classList.add('anim-reveal', `anim-${this.appReveal}`);
    n.style.setProperty('--reveal-delay', `${this.revealDelay}ms`);
    n.addEventListener('animationend', this.onAnimEnd);

    this.observer = new IntersectionObserver(
      entries => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            n.classList.add('revealed');
            this.observer?.disconnect();
            this.timer = setTimeout(
              () => this.cleanup(),
              this.duration + this.revealDelay + 200
            );
          }
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );
    this.observer.observe(n);
  }

  //Quita las clases para que el elemento vuelva a sus estilos normales
  private cleanup() {
    clearTimeout(this.timer);
    const n = this.el.nativeElement;
    n.removeEventListener('animationend', this.onAnimEnd);
    n.classList.remove('anim-reveal', `anim-${this.appReveal}`, 'revealed');
    n.style.removeProperty('--reveal-delay');
  }

  ngOnDestroy() {
    this.observer?.disconnect();
    clearTimeout(this.timer);
  }
}
