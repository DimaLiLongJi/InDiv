class Component {
  constructor() {
    this.declareTemplate = '';
    this.state = {};
  }

  $beforeInit() {
    console.log('is $beforeInit 22222');
    console.log('this.state', this.state);
    this.watcher = new Watcher(this.state, this.$watchState);
  }

  $watchState(oldData, newData) {
    console.log('oldData Component:', oldData);
    console.log('newData Component:', newData);
  }

  $onInit() {
    // this.console.innerText = 'is $onInit';
    // console.log('is $onInit');
  }

  $beforeMount() {
    // this.console.innerText = 'is $beforeMount';
    // console.log('is $beforeMount');
  }

  $afterMount() {
    // this.console.innerText = 'is $afterMount';
    // console.log('is $afterMount');
  }

  $onDestory() {
    // this.console.innerText = 'is $onDestory';
    // console.log('is $onDestory');
  }

  setState(newState) {
    if (newState && newState instanceof Function) {
      const _newState = newState();
      if (_newState && _newState instanceof Object) {
        for (var key in _newState) {
          if (this.state[key] && this.state[key] !== _newState[key]) {
            this.state[key] = _newState[key];
          }
        }
      }
    }
    if (newState && newState instanceof Object) {
      for (var key in newState) {
        if (this.state[key] && this.state[key] !== newState[key]) {
          this.state[key] = newState[key];
        }
      }
    }
  }
}
