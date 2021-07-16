import { Injectable } from '@indiv/di';
// import { Injectable } from '../build/core';
import { SharedModule } from '../modules/share.module';

@Injectable({
  isSingletonMode: true,
  providedIn: SharedModule,
})
export class PrivateService {
  public isPrivate: boolean = true;

  public change() {
    this.isPrivate = false;
  }
}
