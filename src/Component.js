const Lifecycle = require('./Lifecycle');
const Compile = require('./Compile');
const Watcher = require('./Watcher');

class Component extends Lifecycle {
  constructor(declareTemplateName, props) {
    super();
    this.declareTemplateName = declareTemplateName;
    if (props) {
      this.preProps = props;
      this.props = {};
    }
    this.declareTemplate = '';
    this.state = {};
    this.fatherController = {};
    // this.compile = new Compile(`#component_${this.declareTemplateName}`, this);
  }

  $initProps(preProps) {
    if (preProps) {
      this.preProps = preProps;
      this.props = {};
      this.fatherController = window.routerController.declareComponents[this.declareTemplateName].preProps;
      for (let key in this.fatherController) {
        if (typeof this.preProps[key] === 'string') this.props[key] = window.routerController.state[this.fatherController[key]];
        if (this.utils.isFunction(this.preProps[key])) this.props[key] = this.preProps[key];
      }
    }
  }

  $beforeInit() {
    if (this.preProps) {
      this.$initProps(this.preProps);
      this.propsWatcher = new Watcher(this.props, this.$watchState.bind(this), this.$updateProps.bind(this), this.$reRender.bind(this));
    }
    this.stateWatcher = new Watcher(this.state, this.$watchState.bind(this), null, this.$reRender.bind(this));
  }

  $updateProps(key, newVal) {
    const controllerStateKey = this.preProps[key];
    window.routerController.state[controllerStateKey] = newVal;
  }

  $render() {
    const dom = document.getElementById(`component_${this.declareTemplateName}`);
    if (dom && dom.hasChildNodes()) {
      let childs = dom.childNodes;
      for (let i = childs.length - 1; i >= 0; i--) {
        dom.removeChild(childs.item(i));
      }
    }
    this.compile = new Compile(`#component_${this.declareTemplateName}`, this);
    if (this.$hasRender) this.$hasRender();
  }

  $reRender() {
    const dom = document.getElementById(`component_${this.declareTemplateName}`);
    if (dom && dom.hasChildNodes()) {
      let childs = dom.childNodes;
      for (let i = childs.length - 1; i >= 0; i--) {
        dom.removeChild(childs.item(i));
      }
    }
    if (this.$onDestory) this.$onDestory();
    this.compile = new Compile(`#component_${this.declareTemplateName}`, this);
    if (this.$hasRender) this.$hasRender();
  }

  setProps(newProps) {
    if (!this.preProps) return;
    if (newProps && this.utils.isFunction(newProps)) {
      const _newProps = newProps();
      if (_newProps && _newProps instanceof Object) {
        for (let key in _newProps) {
          if (this.props.hasOwnProperty(key) && this.props[key] !== _newProps[key]) this.props[key] = _newProps[key];
        }
      }
    }
    if (newProps && newProps instanceof Object) {
      for (let key in newProps) {
        if (this.props.hasOwnProperty(key) && this.props[key] !== newProps[key]) {
          this.props[key] = newProps[key];
        }
      }
    }
  }
}

module.exports = Component;
