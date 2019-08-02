import { Component, OnInit } from '@angular/core';
import {AppService} from "../../app.service";
import {ApiService} from '../../@api/api.service';
import {LoaderService} from '../../@services/loader.service';
import {MeService} from "../../@services/me.service";
import {User} from "../../models/user";
import {AuthService} from "../../@services/auth.service";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {Member} from "../../models/member";
import {Company} from "../../models/company";
import * as $ from "jquery";

@Component({
  selector: 'app-general-setting',
  templateUrl: './general-setting.component.html',
  styleUrls: [
    '../../../vendor/libs/ng-select/ng-select.scss',
    '../../../vendor/styles/pages/account.scss',
    './general-setting.component.scss'
  ]
})
export class GeneralSettingComponent implements OnInit {
  user: User;
  userTempData: User;
  editable: boolean;
  teamMembers: Array<any>;
  curTab = 'overview';
  company: Company;
  deletedMemberId: any;

  baseUrl = "http://localhost:8000";

  constructor(
    private appService: AppService,
    private api: ApiService,
    private me: MeService,
    private auth: AuthService,
    private loaderService: LoaderService,
    private modalService: NgbModal,
  ) {
    this.appService.pageTitle = 'Account settings - Pages';
  }

  ngOnInit() {
    this.editable = false;
    this.setUser(this.me.user);
    this.api.member.get().promise()
    .then(resp => {
      this.teamMembers = resp;
    }).catch(error => {
      console.dir("update user error=>", error);
    });
    let company_id = this.user.company_id;
    this.getCompany(company_id);
    let that = this;
    this.company = new Company;
    $(document).off('click', '#upload_btn').on('click', '#upload_btn', function() {
      $('#imageInput').click();
    });

    // $(document).off('click', '.team_members').on('click', '.team_members', function() {
    //   let userId = that.me.user.id;
    //   $('#' + userId).hide();
    // });
  }

  setUser(user) {
    this.user = user;
    this.user.name = this.user.first_name + (this.user.last_name !== "" ? (' ' + this.user.last_name) : '');
    this.user.website = user.website;
    this.user.verified = false;

    this.userTempData = Object.assign({}, this.user);
  }

  getCompany(company_id) {
    let self = this;
    this.api.company.getCompanyById(company_id).get().promise()
      .then(resp => {
        self.company = resp;
      }).catch(error => {
        console.log(error);
    })
  }

  onEdit() {
    if (this.editable) {
      console.log("update=>", '~~~~~~~~~~~~~~~~');
      this.updateCompanyProfile();
    } else {
      this.editable = true;
    }
  }

  onCancelEdit() {
    this.editable = false;
    this.userTempData = Object.assign({}, this.user);
  }

  onChange() {
    this.company.name = this.company.name;
    this.company.website = this.company.website;
    this.company.email = this.company.email;
    this.company.phone = this.company.phone;
    // let name_array = this.userTempData.name.trim().replace(/ +(?= )/g, '').split(' ');
    // this.userTempData.first_name = name_array[0] || "";
    // this.userTempData.last_name = name_array[1] || "";
  }

  updateCompanyProfile() {
    this.loaderService.display(true);
    this.api.company.update(this.company).promise()
      .then(resp => {
        this.editable = false;
        this.loaderService.display(false);
        return true;
      })
      .catch((error) => {
        this.loaderService.display(false);
        console.dir("update user error=>", error);
      });
  }

  openAddMemberModal(content, options = {}) {
    this.modalService.open(content, options);
  }
  close(c) {
    c('Cross click');
  }

  inviteMember(new_member: Member, c) {
    this.loaderService.display(true);
    let inviteString = {email: new_member.email};
    this.api.company.invite(inviteString).promise().then(resp => {
      console.log('invite resp=>', resp);
      this.loaderService.display(false);
      c('Cross click');
    }).catch( e => {
      this.loaderService.display(false);
      c('Cross click');
    })
  }

  onFileUpload(e) {
    this.loaderService.display(true);
    const formData = new FormData();
    const file = e.target.files[0];
    const fileType = file['type'].replace('image/', '');
    const company_id = this.company.id;
    if (fileType.includes('jpeg') || fileType.includes('jpeg') || fileType.includes('gif') || fileType.includes('png')) {
      formData.append('file', file);
      this.api.uploadCompanyAvatar.post(formData, company_id).promise()
        .then(res => 
        {
          if (res['success']) {
            this.getCompany(company_id);
            this.loaderService.display(false);
          }
        }).catch(error => {
          console.log(error);
          this.loaderService.display(false);
        })
    } else {
      alert('Invalid format');
      return false;
    }
  }

  delete(content, memberId, options = {}) {
    this.deletedMemberId = memberId;
    this.modalService.open(content, options).result.then((result) => {
    }, (reason) => {
      console.log('rejected');
    });
  }

  submit() {
    this.loaderService.display(true);
    this.api.member.delete(this.deletedMemberId).promise()
      .then(res => {
        if (res == null) {
          this.api.member.get().promise()
            .then(resp => {
              this.teamMembers = resp;
              this.closeModal();
              this.loaderService.display(false);
              $('.team_members').click();
            }).catch(error => {
              this.loaderService.display(false);
              console.dir("update user error=>", error);
          });
        }
      }).catch(err => {
        console.log(err);
      })
  }

  closeModal() {
    this.modalService.dismissAll();
  }


}
