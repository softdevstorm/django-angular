import { Component, OnInit } from '@angular/core';
import { ApiService } from "../../@api/api.service";
import { MeService } from "../../@services/me.service";
import { LoaderService } from "../../@services/loader.service";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { Feature } from "../../models/feature";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import * as $ from "jquery";


@Component({
  selector: 'app-features',
  templateUrl: './features.component.html',
  styleUrls: ['./features.component.scss']
})
export class FeaturesComponent implements OnInit {
  registerForm: FormGroup;
	features: Feature[];
  feature: Feature;
  installFeatureName: string = null;
  submitted = false;

  constructor(
  	private api: ApiService,
  	private me: MeService,
  	private loaderService: LoaderService,
    private modalService: NgbModal,
    private formBuilder: FormBuilder,
  ) { }

  ngOnInit() {
    this.registerForm = this.formBuilder.group({
      store_address: ['', [Validators.required]]
    });
    this.loadFeatures();
    $(document).off("click", ".install-feature-btn").on("click", ".install-feature-btn", function() {
      $(".modal-dialog").addClass("modal-dialog-centered");
    })
  }

  get f() { return this.registerForm.controls; }

  loadFeatures() {
  	this.loaderService.display(true);
    this.api.feature.get().promise().then(resp => {
      this.loaderService.display(false);
      this.features = resp;
    }).catch(e => {
      this.loaderService.display(false);
    })
  }

  create(content, name, options = {}) {
    this.installFeatureName = name;
    this.modalService.open(content, options).result.then((result) => {

    }, (reason) => {
      // console.log('rejected');
    });
  }

  closeModal() {
    this.modalService.dismissAll();
  }

  submit() {
    this.submitted = true;
    if (this.registerForm.invalid) {
      return;
    }
    console.log(this.registerForm.value.store_address);
    console.log(this.installFeatureName);
    this.closeModal();
  }

}
