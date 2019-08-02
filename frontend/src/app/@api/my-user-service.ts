import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse  } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/merge';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';


@Injectable()
export class MyUserServService {

  // ipStackAccessKey = '7b4b24af2160c6427e99bca1be105a49';

  constructor(private http: HttpClient) { }

 //Get IP Adress using http://freegeoip.net/json/?callback
  getIpAddress(ip) {
      return this.http
            .get('http://api.ipstack.com/' + ip + '?access_key=7b4b24af2160c6427e99bca1be105a49')
            .map(response => response || {})
            .catch(this.handleError);
  }

  private handleError(error: HttpErrorResponse):
      Observable<any> {
        //Log error in the browser console
        console.error('observable error: ', error);

        return Observable.throw(error);
    }
}