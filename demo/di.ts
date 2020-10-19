import { Inject, Injectable, NvInstanceFactory, rootInjector } from "@indiv/di";

// @Injectable({
//   providedIn: 'root',
// })
// class TestService3 {
// }

// @Injectable({
//   providedIn: 'root',
// })
// class TestService2 {
//   @Inject() public aaa: TestService3;
//   public fuck: string = 'fuck';
// }

// // const otherInjector = new Injector();
const otherInjector = rootInjector.fork();
// @Injectable({
//   providedIn: 'root',
// })
// class AA {
//   public aaa: string;
// }
// // otherInjector.setInstance(AA, {aaa: '123'});

// class TestService5Type {}

@Injectable({
  injector: otherInjector,
  // provide: TestService5Type,
  // providedIn: 
})
class TestService5 {}

// @Injectable()
// class TestService4 {
//   @Inject() public aaa: TestService5Type;
// }

class TestService {
  // @Inject() public aaa: TestService2;
  // @Inject() public aaa2: TestService4;
  // @Inject() public aaab: AA;
  @Inject({ injector: otherInjector }) public testService5: TestService5;
  constructor(private a: string) {
    console.log('aaaa =>>', this.testService5);
  }
}

// const aaa = new TestService();
const aaa2 = NvInstanceFactory<TestService>(TestService, [1]);
// console.log(55555555, aaa);
console.log(66666666, aaa2, aaa2.testService5);
