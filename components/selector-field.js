import { populateSelectorOptions } from '../helper/dom.js';
import styles from '../../styles/style.css?inline';
import defaultStyles from '../styles/selector-field.css?inline';

const template = document.createElement('template');

template.innerHTML = /*html*/`
<style>
  ${ styles }
  ${ defaultStyles }
</style>

<div class="flex-column">
  <label></label>
  <select></select>
</div>
`;

class Component extends HTMLElement {
  constructor() {
    super();
    this._shadow = this.attachShadow({ mode: 'closed' });
    // The mode can be set to 'open' if we need the document to be able to access the shadow-dom internals.
    // Access happens through ths `shadowroot` property in the host.
    this._shadow.appendChild(template.content.cloneNode(true));

    this.$container = this._shadow.querySelector("div");
    this.$label = this._shadow.querySelector("label");
    this.$selector = this._shadow.querySelector("select");
  }

  // Attributes need to be observed to be tied to the lifecycle change callback.
  static get observedAttributes() { return ['label', 'options', 'direction', 'initial-value', 'custom-styles']; }

  // Attribute values are always strings, so we need to convert them in their getter/setters as appropriate.
  get customStyles() { return this.getAttribute('custom-styles'); }
  get direction() { return this.getAttribute('direction'); }
  get initialValue() { return this.getAttribute('initial-value'); }
  get label() { return this.getAttribute('label'); }
  get options() { return JSON.parse(this.getAttribute('options')); }

  set customStyles(value) { this.setAttribute('custom-styles', value); }
  set direction(value) { this.setAttribute('direction', value); }
  set initialValue(value) { this.setAttribute('initial-value', value); }
  set label(value) { this.setAttribute('label', value); }
  set options(value) { this.setAttribute('options', value); }

  // A web component implements the following lifecycle methods.
  attributeChangedCallback(name, oldVal, newVal) {
    // Attribute value changes can be tied to any type of functionality through the lifecycle methods.
    if (oldVal == newVal) return;
    switch (name) {
      case 'custom-styles':
        this._loadCustomStyleSheet();
        break;
      case 'direction':
        this.$container.classList.toggle('flex-column', this.direction == 'column');
        this.$container.classList.toggle('flex-line', this.direction == 'line');
        break;
      case 'initial-value':
        this.$selector.value = this.initialValue;
        break;
      case 'label':
        this.$label.innerText = this.label;
        break;
      case 'options':
        populateSelectorOptions(this.$selector, this.options.options, this.options.valueKey, this.options.textKey);
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
  _loadCustomStyleSheet() {
    if (!this.customStyles) return;

    const linkElement = document.createElement('link');
    linkElement.setAttribute('rel', 'stylesheet');
    linkElement.setAttribute('href', this.customStyles);

    this._shadow.appendChild(linkElement);
  }

  getValue() {
    return this.$selector.value;
  }
}

window.customElements.define('selector-field', Component);