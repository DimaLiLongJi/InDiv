const Utils = require('./Utils');

class Lifecycle {
  constructor() {
    this.declareTemplate = '';
    this.state = {};
    this.utils = new Utils();
  }

  $onInit() {}

  $beforeMount() {}

  $afterMount() {}

  $onDestory() {}

  $hasRender() {}

  $watchState(oldData, newData) {}

  setState(newState) {
    if (newState && this.utils.isFunction(newState)) {
      const _newState = newState();
      if (_newState && _newState instanceof Object) {
        for (let key in _newState) {
          if (this.state.hasOwnProperty(key) && this.state[key] !== _newState[key]) this.state[key] = _newState[key];
        }
      }
    }
    if (newState && newState instanceof Object) {
      for (let key in newState) {
        if (this.state.hasOwnProperty(key) && this.state[key] !== newState[key]) this.state[key] = newState[key];
      }
    }
  }
}

module.exports = Lifecycle;
