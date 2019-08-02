import { Component, Input, ChangeDetectionStrategy, AfterViewInit, HostBinding } from '@angular/core';
import { Router } from '@angular/router';
import { StoreService } from '../../store.service';
import { LayoutService } from '../layout.service';
import {ApiService} from "../../../@api/api.service";
import {MeService} from "../../../@services/me.service";
import {User} from "../../../models/user";

@Component({
  selector: 'app-layout-sidenav',
  templateUrl: './layout-sidenav.component.html',
  styles: [':host { display: block; }'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LayoutSidenavComponent implements AfterViewInit {
  currentUser: User;
  baseUrl = "http://localhost:8000";
  @Input() orientation = 'vertical';
  @Input() orderAmount: number;

  @HostBinding('class.layout-sidenav') private hostClassVertical = false;
  @HostBinding('class.layout-sidenav-horizontal') private hostClassHorizontal = false;
  @HostBinding('class.flex-grow-0') private hostClassFlex = false;

  constructor(
    private router: Router,
    private storeService: StoreService,
    private layoutService: LayoutService,
    private me: MeService
  ) {
    // Set host classes
    this.hostClassVertical = this.orientation !== 'horizontal';
    this.hostClassHorizontal = !this.hostClassVertical;
    this.hostClassFlex = this.hostClassHorizontal;
  }

  ngOnInit() {
    this.setUser(this.me.user);
  }

  setUser(user) {
    this.currentUser = user;
    this.currentUser.name = this.currentUser.first_name + (this.currentUser.last_name !== "" ? (' ' + this.currentUser.last_name) : '');
    this.currentUser.website = user.website;
    // this.user.photo = '5-small.png';
    this.currentUser.verified = true;

  }

  ngAfterViewInit() {
    // Safari bugfix
    this.layoutService._redrawLayoutSidenav();
  }
  getClasses() {
    let bg = this.storeService.layoutSidenavBg;

    if (this.orientation === 'horizontal' && (bg.indexOf(' sidenav-dark') !== -1 || bg.indexOf(' sidenav-light') !== -1)) {
      bg = bg
        .replace(' sidenav-dark', '')
        .replace(' sidenav-light', '')
        .replace('-darker', '')
        .replace('-dark', '');
    }

    return `${this.orientation === 'horizontal' ? 'container-p-x ' : ''} bg-${bg}`;
  }

  isActive(url) {
    return this.router.isActive(url, true);
  }

  isMenuActive(url) {
    return this.router.isActive(url, false);
  }

  isMenuOpen(url) {
    return this.router.isActive(url, false) && this.orientation !== 'horizontal';
  }

  toggleSidenav() {
    this.layoutService.toggleCollapsed();
  }
}
