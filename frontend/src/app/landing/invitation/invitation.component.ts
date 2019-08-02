import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ApiService} from '../../@api/api.service';
import {LoaderService} from '../../@services/loader.service';
import {AuthService} from '../../@services/auth.service';
import {ScriptLoaderService} from "../../@services/script-loader.service";

@Component({
  selector: 'app-invitation',
  templateUrl: './invitation.component.html',
  styleUrls: ['./invitation.component.scss']
})
export class InvitationComponent implements OnInit {

  registerForm: FormGroup;
  token: string;
  hostname: string;
  store: string;
  submitted = false;
  error: Array<any> = [];
  store_info = {
    password: null,
  };

  status: string = 'signup';
  content: string = null;

  constructor(
    private api: ApiService,
    private loaderService: LoaderService,
    private router: Router,
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
  ) {
    this.store = this.route.snapshot.queryParams['store'];
    this.token = this.route.snapshot.queryParams['token'];
    // this.hostname = window.location.hostname;

    this.registerForm = this.formBuilder.group({
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  ngOnInit() {
    this.registerForm = this.formBuilder.group({
      password: ['', [Validators.required, Validators.minLength(6)]],
    });

    this.api.checkActiveUser.post(this.token).promise().then(resp => {
      this.loaderService.display(true);
      if (resp.status) {
        this.status = resp.status;
        this.content = resp.success
        this.loaderService.display(false);
      }
    }).catch(e => {
      this.error['password'] = e.error.password? e.error.password[0] : '';
      this.loaderService.display(false);
    });
  }

  get f() { return this.registerForm.controls; }

  // gotoLogin() {
  //   if (this.hostname == 'localhost') {
  //     this.route.navigate(['login']);
  //   } else {
  //     this.loaderService.display(true);
  //     window.location.replace('http://account.dropify.net/login');
  //   }
  // }

  createPassword() {
    this.submitted = true;
    if (this.registerForm.invalid) {
      return;
    }
    this.loaderService.display(true);
    this.api.createPassword.post(this.token, this.store_info.password, this.store).promise().then(resp => {
      this.loaderService.display(true);
      if (resp.status == "success") {
        this.status = resp.status;
        this.content = resp.success
        // this.router.navigate(['dashboard']);
        this.loaderService.display(false);
        console.log(resp);
      } 
      // else if (resp.status == "expired") {
      //   this.status = resp.status;
      // }
    }).catch(e => {
      this.error['password'] = e.error.password? e.error.password[0] : '';
      this.loaderService.display(false);
    });
  }
  back() {
    window.location.replace('http://dropify.net');
  }

}
