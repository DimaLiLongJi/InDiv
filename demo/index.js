import { Component, Controller, Router } from '../src';

class PComponent extends Component {
  constructor(name, props) {
    super(name, props);
    this.declareTemplate = `
      <div>
        <p es-if="this.state.e" es-class="this.state.a" es-repeat="let a in this.state.d"  es-on:click="this.componentClick($event, this.state.b, '111', 1, false, true, a, this.aaa)">{{a.z}}</p>
        <input es-repeat="let a in this.state.d" es-model="a.z" />
      </div>
    `;
    this.state = {
      a: 'a',
      b: 100,
      c: '<p>1111</p>',
      d: [
        {
          z: 111111111111111,
          b: 'a',
        },
        {
          z: 33333333333333,
          b: 'a',
        },
      ],
      e: false,
    };
  }
  $onInit() {
    console.log('props', this.props);
  }
  componentClick(e) {
    alert('点击了组件');
    this.setState({ b: 2 });
    this.setProps({ ax: 5 });
    this.props.b(3);
  }
  $watchState(oldData, newData) {
    console.log('oldData Component:', oldData);
    console.log('newData Component:', newData);
  }
}

class R1 extends Controller {
  constructor() {
    super();
    this.state = {
      a: 'a',
      b: 2,
      d: [{
        z: 111111111111111,
        b: 'a',
        show: true,
      },
      {
        z: 33333333333333,
        b: 'a',
        show: true,
      }],
      e: [{
        z: 232323,
        b: 'a',
      },
      {
        z: 1111,
        b: 'a',
      }],
      f: true,
    };
    // <pComponent2/>
    // <p es-on:click="this.showAlert()">R1 点我然后打开控制台看看</p>
    //   <pComponent1/>
    //   <pComponent2/>
    //   <p>{{this.state.b}}</p>
    // <p es-on:click="this.showAlert()">{{this.state.b}}</p>
    // <p es-repeat="let a in this.state.d">{{a.z}}</p>
    // <input es-repeat="let a in this.state.d" es-model="a.z" />
    // <p es-repeat="let a in this.state.d">{{a.z}}</p>
    this.declareTemplate = (`
      <div>
        <pComponent1/>
        <div es-if="this.state.f">
          <input es-repeat="let a in this.state.e" es-model="a.b" />
        </div>
        <p es-class="this.state.a" es-if="a.show" es-repeat="let a in this.state.d" es-text="a.z"></p>
      </div>
    `);
    this.declareComponents = {
      pComponent1: new PComponent('pComponent1', {
        ax: 'a', // key in this.state
        b: this.getProps.bind(this), // action in this
      }),
    // pComponent2: new PComponent('pComponent2', {
    //   ax: 'a', // key in this.state
    //   b: this.getProps.bind(this), // action in this
    // }),
    };
  }
  $onInit() {
    // console.log('is $onInit');
  }
  $beforeMount() {
    // console.log('is $beforeMount');
  }
  $afterMount() {
    // console.log('is $afterMount');
  }
  $onDestory() {
    // console.log('is $onDestory');
  }
  $watchState(oldData, newData) {
    console.log('oldData Controller:', oldData);
    console.log('newData Controller:', newData);
  }
  showAlert(a) {
    alert('我错了 点下控制台看看吧');
    console.log('aa', a);
    console.log('!this.state.f', !this.state.f);
    this.setState({
      a: 'a',
      b: 100,
      f: !this.state.f,
    });
    console.log('state', this.state.f);
  }
  getProps(a) {
    alert('里面传出来了');
    this.setState({ a: a });
  }
}

class R2 extends Controller {
  constructor() {
    super();
    this.state = { a: 1 };
    this.declareTemplate = '<p es-on:click="this.showAlert()">R2 点我然后打开控制台看看</p>';
    this.declareComponents = {
      pComponent1: new PComponent('pComponent1', {
        a: this.state.a,
      }),
    };
  }
  $onInit() {
    // console.log('is $onInit');
  }
  $beforeMount() {
    // console.log('is $beforeMount');
  }
  $afterMount() {
    // console.log('is $afterMount');
  }
  $onDestory() {
    // console.log('is $onDestory');
  }
  $watchState(oldData, newData) {
    console.log('oldData Controller:', oldData);
    console.log('newData Controller:', newData);
  }
  showAlert() {
    alert('我错了 点下控制台看看吧');
    this.setState(() => ({ a: 2 }));
  }
}

const router = new Router();
const routes = [
  {
    path: 'R1',
    controller: R1,
  },
  {
    path: 'R2',
    controller: R2,
  },
];
router.init(routes);
router.$routeChange = function (old, next) {
  console.log('$routeChange', old, next);
};
