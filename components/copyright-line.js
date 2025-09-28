import styles from '../../styles/style.css?inline';
import defaultStyles from '../styles/copyright-line.css?inline';

const template = document.createElement('template');

template.innerHTML = /*html*/`
<style>
  ${ styles }
  ${ defaultStyles }

  :host {
    display: block;
    width: 100%;
  }
</style>

&copy; <span id="copyright-year">0</span>-<span id="current-year">0</span> <span id="copyright-holder">ttetrafon</span>
`;

class Component extends HTMLElement {
  constructor() {
    super();
    this._shadow = this.attachShadow({ mode: 'closed' });
    // The mode can be set to 'open' if we need the document to be able to access the shadow-dom internals.
    // Access happens through ths `shadowroot` property in the host.
    this._shadow.appendChild(template.content.cloneNode(true));

    this.$copyrightYear = this._shadow.querySelector("#copyright-year");
    this.$currentYear = this._shadow.querySelector("#current-year");
    this.$copyrightHolder = this._shadow.querySelector("#copyright-holder");
  }

  // Attributes need to be observed to be tied to the lifecycle change callback.
  static get observedAttributes() { return ['copyright-year', 'copyright-holder', 'custom-styles']; }

  // Attribute values are always strings, so we need to convert them in their getter/setters as appropriate.
  get customStyles() { return this.getAttribute('custom-styles'); }
  get copyrightHolder() { return this.getAttribute('copyright-holder'); }
  get copyrightYear() { return this.getAttribute('copyright-year'); }

  set customStyles(value) { this.setAttribute('custom-styles', value); }
  set copyrightHolder(value) { this.setAttribute('copyright-holder', value); }
  set copyrightYear(value) { this.setAttribute('copyright-year', value); }

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
      case 'copyright-holder':
        this.$copyrightHolder.innerText = this.copyrightHolder;
        break;
      case 'copyright-year':
        this.$copyrightYear.innerText = this.copyrightYear;
    }
  }
  /**
   * Triggered when the component is added to the DOM.
   */
  connectedCallback() {
    const now = new Date();
    const year = now.getFullYear();
    this.$currentYear.innerText = year;
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

window.customElements.define('copyright-line', Component);