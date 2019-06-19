import { Injectable, InDiv } from '@indiv/core';
// import { Injectable, InDiv } from '../build/core';

@Injectable()
export class HeroSearchService1 {
  constructor(
    private indiv: InDiv,
  ) {}

  public test() {
    console.log('HeroSearchService !!!1111', this.indiv);
  }
}

@Injectable()
export class HeroSearchService2 {
  constructor(
    private indiv: InDiv,
  ) {}

  public test(): void {
    console.log('HeroSearchService !!!2222', this.indiv);
  }
}

@Injectable()
export class HeroSearchService {
  public hsr: HeroSearchService1;
  public testValue: number = 3;
  constructor(
    private heroSearchService1: HeroSearchService1,
    private indiv: InDiv,
  ) {
    console.log('检查 是否相等', heroSearchService1 === this.heroSearchService1);
    console.log('测试 ts 依赖注入', this.heroSearchService1, this.indiv);
    this.heroSearchService1.test();
  }

  public test(num?: number) {
    console.log('HeroSearchService !!!1111111111', this.testValue);
    this.testValue = num ? num : 4;
    console.log('HeroSearchService !!!000000000', this.testValue);
  }

  public showValue() {
    console.log(444422, 'this.testValue', this.testValue);
  }
}

@Injectable()
export class TestService {
  constructor(heroSearchService: HeroSearchService) {}
}
