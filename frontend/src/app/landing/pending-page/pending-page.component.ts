import { Component, OnInit } from '@angular/core';
import { LoaderService } from "../../@services/loader.service";
import { AuthService } from "../../@services/auth.service";
import { ApiService } from "../../@api/api.service";
import { ActivatedRoute, Router } from "@angular/router";
import { FormBuilder } from "@angular/forms";
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { MyUserServService } from '../../@api/my-user-service';
import { DeviceDetectorService } from 'ngx-device-detector';

@Component({
  selector: 'app-pending-page',
  templateUrl: './pending-page.component.html',
  styleUrls: ['./pending-page.component.scss']
})
export class PendingPageComponent implements OnInit {
  hostname: string;
  // ipAddress: string;
  deviceInfo = null;

  constructor(
    private auth: AuthService,
    private api: ApiService,
    private loaderService: LoaderService,
    private router: Router,
    private route: ActivatedRoute,
    private http: HttpClient,
    private userService: MyUserServService,
    private deviceService: DeviceDetectorService
  ) {

    // get ip address
    // this.http.get<{ip:string}>('https://jsonip.com')
    // .subscribe( data => {
    //   this.ipAddress = data['ip'];
    // })
    this.epicFunction();

    this.hostname = window.location.hostname;
    if (this.hostname !== 'account.dropify.net' && this.hostname !== 'dropify.net') {
      this.loaderService.display(true);
      const token = this.route.snapshot.queryParams['token'];
      this.auth.rememberToken(token);
      this.auth.autoLogin().then(resp => {
        this.router.navigate(['store']);
        this.loaderService.display(false);
        this.http.get<{ip:string}>('https://jsonip.com')
        .subscribe( data => {
          const ipAddress = data['ip'];
          this.userService.getIpAddress(ipAddress).subscribe(resp => {
            this.api.me.location({'data': resp, 'device': this.deviceInfo}).promise().then(resp => {
              console.log("success log");
            })
          })
        })
      }).catch( e => {
        this.auth.logout();
        this.router.navigate(['login']);
        this.loaderService.display(false);
      });
    }
  }
  ngOnInit() {
  }

  epicFunction() {
      this.deviceInfo = this.deviceService.getDeviceInfo();
      const isMobile = this.deviceService.isMobile();
      const isTablet = this.deviceService.isTablet();
      const isDesktopDevice = this.deviceService.isDesktop();
      // console.log(this.deviceInfo);
      // console.log(isMobile);  // returns if the device is a mobile device (android / iPhone / windows-phone etc)
      // console.log(isTablet);  // returns if the device us a tablet (iPad etc)
      // console.log(isDesktopDevice); // returns if the app is running on a Desktop browser.
    }

}
