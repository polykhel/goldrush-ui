import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnDestroy, OnInit, Renderer2, ViewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { AuthService } from '@auth0/auth0-angular';
import { filter, Subscription } from 'rxjs';
import { FooterComponent } from './layout/footer/footer.component';
import { LayoutService } from './layout/layout.service';
import { NavbarComponent } from './layout/navbar/navbar.component';
import { SidebarComponent } from './layout/sidebar/sidebar.component';
import { PageLoaderComponent } from './pages/page-loader/page-loader.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavbarComponent, SidebarComponent, PageLoaderComponent, SidebarComponent, PageLoaderComponent, NavbarComponent, PageLoaderComponent, FooterComponent],
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit, OnDestroy {
  isLoggedIn = false;

  overlayMenuOpenSubscription: Subscription;

  menuOutsideClickListener: any;

  @ViewChild('mainContent') mainContent!: ElementRef;
  showScrollButton = false;

  constructor(
    public auth: AuthService,
    public layoutService: LayoutService,
    public renderer: Renderer2,
    public router: Router,
  ) {
    this.overlayMenuOpenSubscription = this.layoutService.overlayOpen$
      .pipe(takeUntilDestroyed())
    .subscribe(() => {
      if (!this.menuOutsideClickListener) {
        this.menuOutsideClickListener = this.renderer.listen('document', 'click', (event) => {
          if (this.isOutsideClicked(event)) {
            this.hideMenu();
          }
        });
      }

      if (this.layoutService.layoutState().staticMenuMobileActive) {
        this.blockBodyScroll();
      }
    });

    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe(() => {
      this.hideMenu();
    });
  }

  get containerClass() {
    return {
      'layout-static': true,
      'layout-static-inactive': this.layoutService.layoutState().staticMenuDesktopInactive,
      'layout-overlay-active': this.layoutService.layoutState().overlayMenuActive,
      'layout-mobile-active': this.layoutService.layoutState().staticMenuMobileActive
    };
  }

  ngOnInit() {
    this.auth.isAuthenticated$.subscribe((authenticated) => {
      this.isLoggedIn = authenticated;
    });
  }

  isOutsideClicked(event: MouseEvent) {
    const sidebarEl = document.querySelector('.layout-sidebar');
    const topbarEl = document.querySelector('.layout-menu-button');
    const eventTarget = event.target as Node;

    return !(sidebarEl?.isSameNode(eventTarget) || sidebarEl?.contains(eventTarget) || topbarEl?.isSameNode(eventTarget) || topbarEl?.contains(eventTarget));
  }

  hideMenu() {
    this.layoutService.layoutState.update((prev) => ({
      ...prev,
      overlayMenuActive: false,
      staticMenuMobileActive: false,
      menuHoverActive: false
    }));
    if (this.menuOutsideClickListener) {
      this.menuOutsideClickListener();
      this.menuOutsideClickListener = null;
    }
    this.unblockBodyScroll();
  }

  blockBodyScroll(): void {
    if (document.body.classList) {
      document.body.classList.add('blocked-scroll');
    } else {
      document.body.className += ' blocked-scroll';
    }
  }

  unblockBodyScroll(): void {
    if (document.body.classList) {
      document.body.classList.remove('blocked-scroll');
    } else {
      document.body.className = document.body.className.replace(new RegExp('(^|\\b)' + 'blocked-scroll'.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
    }
  }

  onScroll(event: Event): void {
    const element = event.target as HTMLElement;
    this.showScrollButton = element.scrollTop > 300;
  }

  ngOnDestroy() {
    if (this.menuOutsideClickListener) {
      this.menuOutsideClickListener();
    }
  }
}
