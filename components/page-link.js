import styles from '../../styles/style.css?inline';
import defaultStyles from '../styles/page-link.css?inline';

const template = document.createElement('template');

template.innerHTML = /*html*/`
<style>
  ${ styles }
  ${ defaultStyles }
</style>

<a href=".">
  <span></span>
  <svg-wrapper class="hidden"
    image="open_in_new"
  ></svg-wrapper>
</a>
`;

class Component extends HTMLElement {
  constructor() {
    super();
    this._shadow = this.attachShadow({ mode: 'closed' });
    // The mode can be set to 'open' if we need the document to be able to access the shadow-dom internals.
    // Access happens through ths `shadowroot` property in the host.
    this._shadow.appendChild(template.content.cloneNode(true));

    this.$link = this._shadow.querySelector('a');
    this.$span = this._shadow.querySelector('span');
    this.$svg = this._shadow.querySelector('svg-wrapper');
  }

  // Attributes need to be observed to be tied to the lifecycle change callback.
  static get observedAttributes() { return ['label', 'custom-styles', 'target', 'href']; }

  // Attribute values are always strings, so we need to convert them in their getter/setters as appropriate.
  get customStyles() { return this.getAttribute('custom-styles'); }
  get label() { return this.getAttribute('label'); }
  get target() { return this.getAttribute('target'); }
  get href() { return this.getAttribute('href'); }

  set customStyles(value) { this.setAttribute('custom-styles', value); }
  set label(value) { this.setAttribute('label', value); }
  set target(value) { this.setAttribute('target', value); }
  set href(value) { this.setAttribute('href', value); }

  // A web component implements the following lifecycle methods.
  /**
   * Attribute value changes can be tied to any type of functionality through the lifecycle methods.
   * @param {String} name
   * @param {Object} oldVal
   * @param {Object} newVal
   * @returns
   */
  attributeChangedCallback(name, oldVal, newVal) {
    // console.log(`--> attributeChangedCallback(${name}, ${JSON.stringify(oldVal)}, ${JSON.stringify(newVal)})`);
    if (oldVal == newVal) return;
    switch (name) {
      case 'custom-styles':
        this._loadCustomStyleSheet();
        break;
      case 'label':
        this.$span.innerText = newVal;
        break;
      case 'target':
        this.$link.setAttribute('target', this.target);
        this.$svg.classList.toggle("hidden", this.target != "_blank");
        break;
      case 'href':
        this.$link.setAttribute('href', this.href);
        break;
    }
  }
  /**
   * Triggered when the component is added to the DOM.
   */
  connectedCallback() {
  }
  /**
   * Triggered when the component is removed from the DOM.
   * - Ideal place for cleanup code.
   * - Note that when destroying a component, it is good to also release any listeners.
   */
  disconnectedCallback() {
  }
  /**
   * Triggered when the element is adopted through `document.adoptElement()` (like when using an <iframe/>).
   * Note that adoption does not trigger the constructor again.
   */
  adoptedCallback() {
  }
  _loadCustomStyleSheet() {
    if (!this.customStyles) return;

    try {
      const linkElement = document.createElement('link');
      linkElement.setAttribute('rel', 'stylesheet');
      linkElement.setAttribute('href', this.customStyles);

      this._shadow.appendChild(linkElement);
    }
    catch (err) { }
  }
}

window.customElements.define('page-link', Component);