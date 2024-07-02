import { Injectable, EventEmitter } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class FormModalService {

  constructor() { }
  $modal = new EventEmitter<any>(); 
}
