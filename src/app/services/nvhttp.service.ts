import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
// import 'rxjs/add/operator/map';
@Injectable({
  providedIn: 'root'
})
export class NvhttpService {

  constructor(http: HttpClient) {
    console.log('httppppp', this.http);
    this.http = http;
  }

  static apiUrls: any = {
    callbacks: '/netvision/rest/webapi/getcallbacks?access_token=563e412ab7f5a282c15ae5de1732bfd1',
    addcallback: '/netvision/rest/webapi/addCallback?access_token=563e412ab7f5a282c15ae5de1732bfd1',
    updatecallback: '/netvision/rest/webapi/updateCallback?access_token=563e412ab7f5a282c15ae5de1732bfd1',
    UpdateAgentProfile: '/netvision/rest/webapi/updateagentprofile?access_token=563e412ab7f5a282c15ae5de1732bfd1',
    showAgentDBData: '/netvision/rest/webapi/getAgentProfiles?access_token=563e412ab7f5a282c15ae5de1732bfd1',
    deletecallback: '/netvision/rest/webapi/deleteCallback?access_token=563e412ab7f5a282c15ae5de1732bfd1',
    metadata: '/netvision/reports/nvMetadataAjaxController.jsp?metadata=metadata'
  };


  // for testing set machine ip,port,protocol
  ip = '10.20.0.66';
  port = '8443';
  // ip = '10.20.0.64';
  // port = '8005';
  protocol = 'https';

  http: HttpClient;
  // TODO: Move this in a seperate file and add as provider.
  getRequestUrl(path) {
    // uncomment for testing.
    return this.protocol + '://' + this.ip + ':' + this.port + path;
    // return path;
  }

  getCallbacks() {
    const url = this.getRequestUrl(NvhttpService.apiUrls.callbacks);
    return this.http.get(url).pipe(map((response: Response) => response));
  }

  addCallbacks(filter) {
    const url = this.getRequestUrl(NvhttpService.apiUrls.addcallback) + '&filterCriteria=' + JSON.stringify(filter);
    return this.http.get(url).pipe(map((response: Response) => response));
  }


  // getCallbackFromLocalStorage() {
  //   let callbacks: any = localStorage.getItem('callbacks');
  //   if (callbacks != null) {
  //     callbacks = JSON.parse(callbacks);
  //   } else {
  //     callbacks = [];
  //   }
  //   return callbacks;
  // }


  // getCallbacks() {
  //   return Observable.create(observer => {
  //     observer.next(this.getCallbackFromLocalStorage());
  //     observer.complete();
  //   });
  // }


  // addCallbacks(callback) {
  //   const callbacks = this.getCallbackFromLocalStorage();

  //   callbacks.push(callback);

  //   localStorage.setItem('callbacks', JSON.stringify(callbacks));

  //   return Observable.create(observer => {
  //     observer.next(callback);
  //     observer.complete();
  //   });
  // }


  // updateCallback(callback) {
  //   const callbacks: any[] = this.getCallbackFromLocalStorage();

  //   // Check if matched with existing then update that entry.
  //   const ret = callbacks.some(cb => {
  //     if (cb.name === callback.name) {
  //       cb.jsondata = callback.jsondata;
  //       return true;
  //     }
  //     return false;
  //   });

  //   if (ret === false) {
  //     callbacks.push(callback);
  //   }

  //   localStorage.setItem('callbacks', JSON.stringify(callbacks));
  // }

  updateCallback(callback) {
    const url = this.getRequestUrl(NvhttpService.apiUrls.updatecallback);

    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    const options = {
      headers
    };

    const data = JSON.stringify(callback);

    return this.http.post(url, data, options).pipe(map((response: Response) => response));
  }


  deleteCallback(callbackId) {
    let url = this.getRequestUrl(NvhttpService.apiUrls.deletecallback);
    url += '&callbackId=' + callbackId;

    return this.http.get(url).pipe(map((response: boolean) => response));
  }

  getAgentDBData() {
    const url = this.getRequestUrl(NvhttpService.apiUrls.showAgentDBData);
    return this.http.get(url).pipe(map((response: Response) => response));
  }

  UpdateAgentProfile(profiledata, profilename) {
    let url = this.getRequestUrl(NvhttpService.apiUrls.UpdateAgentProfile);
    url += '&name=' + profilename;
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    const options = {
      headers
    };
    const data = JSON.stringify(profiledata);
    return this.http.post(url, data, options).pipe(map((response: Response) => response));
  }

  getMetaData(): Observable<any> {
    return this.http.get(this.getRequestUrl(NvhttpService.apiUrls.metadata)).pipe(map((response: Response) => response));
  }
}
