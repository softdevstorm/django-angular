import {Component, HostBinding, OnInit} from '@angular/core';
import {ApiService} from "../../@api/api.service";
import {Customer} from "../../models/customer";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {LoaderService} from "../../@services/loader.service";
import {MeService} from "../../@services/me.service";
import {HandleSocketService} from "../../@services/handle-socket.service";
import * as io from "socket.io-client";
import * as $ from "jquery";

@Component({
  selector: 'app-customers',
  templateUrl: './customers.component.html',
  styleUrls: ['./customers.component.scss']
})
export class CustomersComponent implements OnInit {

  @HostBinding('class') private hostClasses = 'd-flex flex-grow-1 align-items-stretch';
  selected: any = null;
  sideboxOpened = false;
  customers: Customer[];
  customer: Customer; //selected customer for edit/update
  selectedCustomer: any = null;

  private socket: SocketIOClient.Socket;
  private namespace = '';
  private base_url = 'http://localhost:8000';

  constructor(
    private api: ApiService,
    private modalService: NgbModal,
    private loaderService: LoaderService,
    private me: MeService,
    private handleSocket: HandleSocketService
  ) {
    this.base_url = this.handleSocket.getBaseUrl();
    this.namespace = this.handleSocket.getNameSpace();

    this.socket = io.connect(this.base_url + this.namespace);
    handleSocket.customerReceiver.subscribe( (customer: Customer) => {
      if(customer.id) {
        this.customers = this.customers.filter(this_customer => {
          return this_customer.id !== customer.id;
        });
        if(customer.socket_state !== 'deleted') {
          this.customers.push(customer);
        }
      }
    })
  }

  ngOnInit() {
    this.getCustomers();
    $(document)
      .off("keyup", "#customer_searchbox")
      .on("keyup", "#customer_searchbox", function() {
        let value = $(this).val().toLowerCase();
        $("table tbody tr").filter(function() {
          $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
        });
    });
  }

  getCustomers() {
    this.loaderService.display(true);
    this.api.customer.get().promise().then(resp => {
      this.loaderService.display(false);
      this.customers = resp;
    }).catch(e => {
      this.loaderService.display(false);
    })
  }

  view(content, customer, options = {}) {
    this.customer = customer;
    this.customer.status = "view";
    this.modalService.open(content, options).result.then((result) => {

    }, (reason) => {
      // console.log('rejected');
    });
  }

  edit(content, customer, options = {}) {
    this.customer = customer;
    this.customer.status = "edit";
    this.modalService.open(content, options).result.then((result) => {

    }, (reason) => {
      // console.log('rejected');
    });
  }

  open(content, options = {}) {
    this.customer = new Customer();
    this.modalService.open(content, options).result.then((result) => {

    }, (reason) => {
      // console.log('rejected');
    });
  }

  delete(content, customer, options = {}) {
    this.selectedCustomer = customer;
    this.modalService.open(content, options).result.then((result) => {
    }, (reason) => {
      // console.log('rejected');
    });
  }

  close(c) {
    c('Cross click');
  }

  updateCustomer(customer: Customer, c) {
    this.loaderService.display(true);
    customer.owner = this.me.user.company_id;
    let formdata = new FormData();
    formdata.append('owner', customer.owner.toString());
    formdata.append('first_name', customer.first_name);
    formdata.append('last_name', customer.last_name);
    formdata.append('email', customer.email);
    formdata.append('company', customer.company);
    formdata.append('phone', customer.phone);
    formdata.append('address', customer.address);
    formdata.append('city', customer.city);
    formdata.append('country', customer.country);
    formdata.append('image', customer.image);
    this.api.customer.update(customer).promise().then(resp => {
      this.loaderService.display(false);
      console.dir('update custoemr=> ', resp);
      c('Cross click');
      window.location.reload();
    }).catch(e => {
      this.loaderService.display(false);
      c('Cross click');
    })
  }

  createCustomer(customer: Customer, c) {
    this.loaderService.display(true);
    customer.owner = this.me.user.company_id;
    let formdata = new FormData();
    formdata.append('owner', customer.owner.toString());
    formdata.append('first_name', customer.first_name);
    formdata.append('last_name', customer.last_name);
    formdata.append('email', customer.email);
    formdata.append('company', customer.company);
    formdata.append('phone', customer.phone);
    formdata.append('address', customer.address);
    formdata.append('city', customer.city);
    formdata.append('country', customer.country);
    formdata.append('image', customer.image);
    this.api.customer.post(formdata).promise().then(resp => {
      this.loaderService.display(false);
      if (resp['status'] == 'failed') {
        $('.failed-customer').click();
      } else {
        this.customers.push(resp);
        window.location.reload();
      }
      c('Cross click');
    }).catch(e => {
      this.loaderService.display(false);
      c('Cross click');
    })
  }

  selectClient(customer) {
    this.selected = customer;
    this.sideboxOpened = true;
  }

  submit() {
    let customerId = this.selectedCustomer.id;
    this.loaderService.display(true);
    this.api.customer.delete(customerId).promise().then(resp => {
      this.customers = this.customers.filter(customer => {
        return customer.id !== customerId;
      });
      this.modalService.dismissAll();
      this.loaderService.display(false);
    }).catch( e => {
      this.loaderService.display(false);
    })
  }

  openFailedModal(content, options = {}) {
    this.modalService.open(content, options).result.then((result) => {
    }, (reason) => {
      // console.log('rejected');
    });
  }

  closeModal() {
    this.modalService.dismissAll();
  }

}
