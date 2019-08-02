import { Component, OnInit } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {ApiService} from "../../@api/api.service";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {LoaderService} from "../../@services/loader.service";
import {Customer} from "../../models/customer";
import {Product} from "../../models/product";
import {MeService} from "../../@services/me.service";
import {HandleSocketService} from "../../@services/handle-socket.service";
import * as io from "socket.io-client";
import {SocketNotification} from "../../models/notification";
import * as $ from 'jquery';

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss']
})
export class ProductsComponent implements OnInit {
  filterStatus = 'Any';

  dataUrl = 'assets/json/pages_e-commerce_product-list.json';
  searchKeys = ['title', 'id', 'price'];
  sortBy = 'id';
  sortDesc = true;
  perPage = 10;

  filterVal = '';
  currentPage = 1;
  totalItems = 0;

  productsData: Object[] = [];
  originalProductsData: Object[] = [];
  products: Product[];
  product: Product;
  company: any;
  selectedProduct: any;

  private  socket: SocketIOClient.Socket;
  private namespace = '';
  private base_url = 'http://localhost:8000';

  constructor(
    private api: ApiService,
    private modalService: NgbModal,
    private loaderService: LoaderService,
    private http: HttpClient,
    private me: MeService,
    private handleSocket: HandleSocketService
  ) {
    this.loadData();
    this.base_url = this.handleSocket.getBaseUrl();
    this.namespace = this.handleSocket.getNameSpace();

    this.socket = io.connect(this.base_url + this.namespace);
    handleSocket.productReceiver.subscribe( (product: Product) => {
      if(product.id) {
        this.products = this.products.filter(this_product => {
          return this_product.id !== product.id;
        });
        if(product.socket_state !== 'deleted') {
          this.products.push(product);
        }
      }
    })
  }

  ngOnInit(): void {
    this.getProduct();
    $(document)
      .off("keyup", "#searchbox")
      .on("keyup", "#searchbox", function() {
        let value = $(this).val().toLowerCase();
        $("table tbody tr").filter(function() {
          $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
        });
    });
  }

  getProduct() {
    this.api.product.get().promise().then(resp => {
      this.products = resp;
    })
  }

  loadData() {
    this.http.get(this.dataUrl)
      .subscribe((data: any) => {
        this.originalProductsData = data.slice(0);
        this.update();
      });
  }

  get totalPages() {
    return Math.ceil(this.totalItems / this.perPage);
  }

  update() {
    const data = this.filter(this.originalProductsData);

    this.totalItems = data.length;

    this.sort(data);
    this.productsData = this.paginate(data);
  }

  filter(data) {
    const filter = this.filterVal.toLowerCase();
    return !filter ?
      data.slice(0) :
      data.filter(d => {
        return Object.keys(d)
          .filter(k => this.searchKeys.includes(k))
          .map(k => String(d[k]))
          .join('|')
          .toLowerCase()
          .indexOf(filter) !== -1 || !filter;
      });
  }

  sort(data) {
    data.sort((a: any, b: any) => {
      a = typeof(a[this.sortBy]) === 'string' ? a[this.sortBy].toUpperCase() : a[this.sortBy];
      b = typeof(b[this.sortBy]) === 'string' ? b[this.sortBy].toUpperCase() : b[this.sortBy];

      if (a < b) { return this.sortDesc ? 1 : -1; }
      if (a > b) { return this.sortDesc ? -1 : 1; }
      return 0;
    });
  }

  paginate(data) {
    const perPage = parseInt(String(this.perPage), 10);
    const offset = (this.currentPage - 1) * perPage;

    return data.slice(offset, offset + perPage);
  }

  setSort(key) {
    if (this.sortBy !== key) {
      this.sortBy = key;
      this.sortDesc = false;
    } else {
      this.sortDesc = !this.sortDesc;
    }

    this.currentPage = 1;
    this.update();
  }

  edit(content, product, options = {}) {
    this.product = product;
    this.product.status = "edit";
    this.api.variation.get(product.id).promise().then(resp => {
       this.product.variations = resp;
    });
    this.modalService.open(content, options).result.then((result) => {

    }, (reason) => {
      // console.log('rejected');
    });
  }

  view(content, product, options = {}) {
    this.product = product;
    this.product.status = "view";
    this.api.variation.get(product.id).promise().then(resp => {
       this.product.variations = resp;
    });
    this.modalService.open(content, options).result.then((result) => {

    }, (reason) => {
      // console.log('rejected');
    });
  }

  delete(content, product, options = {}) {
    this.product = product;
    this.selectedProduct = product;
    this.api.variation.get(product.id).promise().then(resp => {
       this.product.variations = resp;
    });
    this.modalService.open(content, options).result.then((result) => {
    }, (reason) => {
      // console.log('rejected');
    });
  }

  submit() {
    let productId = this.selectedProduct.id;
    this.loaderService.display(true);
    this.api.product.delete(productId).promise().then(resp => {
      this.products = this.products.filter(product => {
        return product.id !== productId;
      });
      this.modalService.dismissAll();
      this.loaderService.display(false);
    }).catch( e => {
      this.loaderService.display(false);
    })
  }


  open(content, options = {}) {
    this.product = new Product();
    this.product.image = '';
    this.modalService.open(content, options).result.then((result) => {
      // successDialog.show();
    }, (reason) => {
      // console.log('rejected');
    });
  }

  close(c) {
    c('Cross click');
  }

  createProduct(product: Product, c) {
    this.loaderService.display(true);
    let formdata = new FormData();
    formdata.append('name', product.name);
    formdata.append('description', product.description);
    formdata.append('image', product.image);
    formdata.append('sku', product.sku);
    formdata.append('price', product.price.toString());
    formdata.append('company', product.company.toString());
    formdata.append('variations', JSON.stringify(product.variations));
    formdata.append('variation_type', JSON.stringify(product.variation_type));
    this.api.product.post(formdata).promise().then(resp => {
      this.loaderService.display(false);
      this.products.push(resp);
      c('Cross click');
    }).catch( e => {
      this.loaderService.display(false);
      c('Cross click');
    })
  }

  updateProduct(product: Product, c) {
    this.loaderService.display(true);
    let formdata = new FormData();
    formdata.append('id', product.id.toString());
    formdata.append('name', product.name);
    formdata.append('description', product.description);
    formdata.append('image', product.image);
    formdata.append('sku', product.sku);
    formdata.append('price', product.price.toString());
    formdata.append('company', product.company.toString());
    formdata.append('variations', JSON.stringify(product.variations));
    formdata.append('variation_type', JSON.stringify(product.variation_type));
    this.api.product.update(formdata, product.id).promise().then(resp => {
      window.location.reload();
      c('Cross click');
    }).catch( e => {
      this.loaderService.display(false);
      c('Cross click');
    })
  }

  closeModal() {
    this.modalService.dismissAll();
  }

}

