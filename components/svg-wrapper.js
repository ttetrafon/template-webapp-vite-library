import styles from '../../styles/style.css?inline';
import defaultStyles from '../styles/svg-wrapper.css?inline';

const template = document.createElement('template');

template.innerHTML = /*html*/`
<style>
  ${ styles }
  ${ defaultStyles }
</style>

<div id="svg-container" class="flex-column"></div>
`;

class Component extends HTMLElement {
  constructor() {
    super();
    this._shadow = this.attachShadow({ mode: 'closed' });
    this._shadow.appendChild(template.content.cloneNode(true));

    this.$svgContainer = this._shadow.querySelector("div");
    this.$svg = null;
    this.$path = null;
  }

  static get observedAttributes() { return ['background', 'label', 'image', 'pointer', 'custom-styles']; }

  get background() { return this.getAttribute('background'); }
  get customStyles() { return this.getAttribute('custom-styles'); }
  get image() { return this.getAttribute('image'); }
  get label() { return this.getAttribute('label'); }
  get pointer() { return JSON.parse(this.getAttribute('pointer')); }

  set background(value) { this.setAttribute('background', value); }
  set customStyles(value) { this.setAttribute('custom-styles', value); }
  set image(value) { this.setAttribute('image', value); }
  set label(value) { this.setAttribute('label', value); }
  set pointer(value) { this.setAttribute('pointer', value); }

  // Lifecycle methods
  attributeChangedCallback(name, oldVal, newVal) {
    if (oldVal == newVal) return;
    switch (name) {
      case 'custom-styles':
        this._loadCustomStyleSheet();
        break;
      case "image":
        this.createSvg();
        break;
      case "label":
        this.$svgContainer.setAttribute("title", this.label);
        this.setAlt();
        break;
      case "background":
        this.setBackground();
        break;
      case "pointer":
        this.setPointer();
        break;
    }
  }
  connectedCallback() {
    // Triggered when the component is added to the DOM.
  }
  disconnectedCallback() {
    // Triggered when the component is removed from the DOM.
    // Ideal place for cleanup code.
    // Note that when destroying a component, it is good to also release any listeners.
  }
  adoptedCallback() {
    // Triggered when the element is adopted through `document.adoptElement()` (like when using an <iframe/>).
    // Note that adoption does not trigger the constructor again.
  }

  async _loadCustomStyleSheet() {
    if (!this.customStyles) return;

    try {
      const customStyleModule = await import(`../styles/${this.customStyles}.css?inline`);
      const styleElement = document.createElement('style');
      styleElement.textContent = customStyleModule.default;
      this._shadow.appendChild(styleElement);
    } catch (err) {
      console.error(`Failed to load custom stylesheet: '/src/styles/${this.customStyles}.css'`, err);
    }
  }

  async createSvg() {
    try {
      let svg = await import(`../assets/ui/${ this.image }.svg?raw`);
      this.$svgContainer.innerHTML = svg.default;
      this.$svg = this._shadow.querySelector("svg");
      this.$svg.removeAttribute("height");
      this.$svg.removeAttribute("width");
      this.$svg.removeAttribute("fill");
      this.$path = this._shadow.querySelector("path");
      this.setAlt();
      this.setBackground();
      this.setPointer();
    } catch (err) {
      console.error(`Failed to load SVG image: ${this.image}`, err);
    }
  }

  setAlt() {
    if (this.$svg && this.label) {
      this.$svg.setAttribute("alt", this.label);
    }
  }

  setBackground() {
    if (this.$svgContainer && this.background) {
      this.$svgContainer.style.backgroundColor = this.background;
    }
  }

  setPointer() {
    if (this.$svg && this.pointer != null) {
      this.$svg.classList.toggle("pointer", this.pointer);
      this.$path.classList.toggle("pointer", this.pointer);
    }
  }
}

window.customElements.define('svg-wrapper', Component);