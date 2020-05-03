import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { Callback, DataPoint, LocalVariable } from './../interfaces/callback';
import { filter } from 'rxjs/operators';
import { map } from 'rxjs/operators';

interface CallBackServiceEvent {
  key: any;
  data?: any;
}

@Injectable()
export class CallbackDataServiceService {

  currentCallback: Callback;

  private _eventCallBack = new Subject<CallBackServiceEvent>();

  constructor() {

  }

  setCallback(cb: Callback) {
    this.currentCallback = cb;

    if (this.currentCallback !== null) {
      this.currentCallback.dirty = false;
      this.currentCallback.counter = this.currentCallback.counter || {
        api: 100,
        action: 100,
        condition: 100,
        trigger: 100
      };
    }

    console.log('setCallback called for - ', cb);
    this.broadcast('callbackChanged', this.currentCallback);
  }

  addDataPoint(dp: DataPoint, type): DataPoint[] {
    if (this.currentCallback) {
      console.log('dp : ', dp);
      if (type === 'submit') {
        this.currentCallback.dataPoints.push(dp);

      } else if (type === 'update') {
        for (let i = 0; i < this.currentCallback.dataPoints.length; i++) {
          if (this.currentCallback.dataPoints[i].name === dp.name) {
            this.currentCallback.dataPoints[i] = dp;
          }
        }
      }

      this.broadcast('addedDataPoint', this.currentCallback.dataPoints);
      return this.currentCallback.dataPoints;
    }
    return [];
  }

  getDataPoint() {
    if (this.currentCallback) {
      return this.currentCallback.dataPoints;
    }
    return [];
  }

  addLocalVar(local: LocalVariable): LocalVariable[] {
    if (this.currentCallback) {
      this.currentCallback.localVariables.push(local);
      this.broadcast('addedLocalVar', this.currentCallback.localVariables);
      return this.currentCallback.localVariables;
    }
    return [];
  }

  getLocalVar() {
    if (this.currentCallback) {
      return this.currentCallback.localVariables;
    }
    return [];
  }


  // TODO : Handling should be taken care of
  // ChangeLocalVariable(LocalVar : any){
  //   console.log("calling service localvar ngOn",LocalVar);
  //   this.localvarData.next(LocalVar);
  // }



  broadcast(key: any, data?: any) {
    console.log('BroadCast called');
    this._eventCallBack.next({ key, data });
  }

  on<T>(key: any): Observable<T> {
    return this._eventCallBack.asObservable()
      .pipe(filter(event => event.key === key))
      .pipe(map(event => event.data as T));
  }
}
