import {Component, EventEmitter, Input, OnInit, Output, ViewEncapsulation} from '@angular/core';
import {Customer} from "../../../models/customer";
import {Product} from "../../../models/product";
import {Variation} from "../../../models/variation";
import {MeService} from "../../../@services/me.service";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {ApiService} from "../../../@api/api.service";


@Component({
  selector: 'app-product-form',
  templateUrl: './product-form.component.html',
  styleUrls: ['./product-form.component.scss']
})
export class ProductFormComponent implements OnInit {
registerForm: FormGroup;
  @Input() product: Product;
  submitted = false;
  disabled = false;
  customer: Customer;
  file: any = null;
  editable: boolean = true;
  variation_index: number = 1;
  options: Array<any> = [];

  variations: any = [
    {name: 'option', value: null}
  ];
  dropzoneConfig = {
    url: '/api/v1.0/upload/avatar',
    headers: {
         'Authorization':  "JWT "+ localStorage.getItem('dropify.token')
      },
    parallelUploads: 2,
    maxFilesize:     50000,
    filesizeBase:    1000,
    acceptedFiles: 'image/*',
    addRemoveLinks:  true,
    previewTemplate: `
      <div class="dz-preview dz-file-preview" style="text-align: center">
        <div class="dz-thumbnail" style="margin: auto">
          <img data-dz-thumbnail style="width: 118px; height: 118px; border-radius: 5px;">
        </div>
      </div>`
  };

  @Output() closeForm = new EventEmitter<any>();
  @Output() createForm = new EventEmitter<Product>();
  @Output() updateForm = new EventEmitter<Product>();

  constructor(
    private me: MeService,
    private formBuilder: FormBuilder,
    private api: ApiService,
  ) { }

  ngOnInit() {
    // this.product.variations = this.product.variations;
    // this.product.price = 0.00;
    this.product.company = this.me.user.company_id;
    this.customer = new Customer();

    this.registerForm = this.formBuilder.group({
      file: [''],
      name: ['', [Validators.required]],
      description: ['', [Validators.required]],
      product_sku: ['', [Validators.required]],
      product_price: ['', [Validators.required]],
    });

    if (this.product.status == "view") {
      this.editable = false;
    }

    if (this.product.variation_type) {
      for (let i = 0; i < this.product.variation_type.length; i++) {
        let typeId = this.product.variation_type[i].id;
        this.api.variationAttribute.get(typeId).promise().then(attr => {
          let values = [];
          for (let j = 0; j < attr.length; j++) {
            let value = JSON.parse(attr[j].attribute.replace(/'/g,'"'));
            values.push(value);
          }
          let option = {
            name: this.product.variation_type[i].type,
            value: values
          }
          this.variations.unshift(option);
        }).catch(error => {
          console.log(error);
        })
      }
    }

  }

  get f() { return this.registerForm.controls; }

  onUploadSuccess(file) {
    this.product.image = file[1];
  }

  remove(e) {
    this.product.image = null;
  }

  addVariation(i) {
    this.variation_index++;
    this.variations.push({name: 'option'+ this.variation_index, value: null});
  }

  updateVariation() {
    let that = this;
    setTimeout(function (){
      that.defineVariations(that);
    }, 300);
  }

  defineVariations(that) {
    let allArrays = [];
      for (let i=0; i<that.variations.length; i++) {
        let variation_value = [];
        if(that.variations[i].value) {
          for (let j=0; j<that.variations[i].value.length; j++) {
            variation_value.push(that.variations[i].value[j].value);
          }
          if (variation_value.length != 0) {
            allArrays.push(variation_value);
          }
        }
      }
      that.product.variations = [];
      let varation_titles = that.allPossibleCases(allArrays);
      for (let k=0; k<varation_titles.length; k++) {  
        let variation = new Variation();
        variation.title = varation_titles[k];
        that.product.variations.push(variation);
      }
  }


  allPossibleCases(arr) {
    if (arr.length == 0) {
      return [];
    } else if (arr.length == 1) {
      return arr[0];
    } else {
      var result = [];
      var allCasesOfRest = this.allPossibleCases(arr.slice(1));  // recur with the rest of array
      for (var i = 0; i < allCasesOfRest.length; i++) {
        for (var j = 0; j < arr[0].length; j++) {
          result.push(arr[0][j] + '/' + allCasesOfRest[i]);
        }
      }
      return result;
    }
  }

  deleteVariation(index) {
    this.variations.splice(index,1);
    this.defineVariations(this);
  }

  close() {
    this.closeForm.emit();
  }

  submit() {
    this.submitted = true;
    if (this.registerForm.invalid) {
      return;
    }
    this.product.variation_type = this.variations;
    if(this.product.id) {
      this.updateForm.emit(this.product);
    } else {
      this.createForm.emit(this.product);
    }
  }

}
