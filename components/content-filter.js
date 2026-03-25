import styles from '../../styles/style.css?inline';
import defaultStyles from '../styles/---.css?inline';

const _name = 'content-filter';
const template = document.createElement('template');

template.innerHTML = /*html*/`
<style>
  ${ styles }
  ${ defaultStyles }

  :host {
    display: block;
    width: 100%;
  }

  details {
    align-items: flex-start;
  }

  summary {
    cursor: pointer;
    font-size: 1em;
    color: var(--colour-tertiary);
  }

  @media (prefers-color-scheme: light) {
    summary {
      color: var(--colour-secondary);
    }
  }
</style>

<details class="flex-column">
  <summary></summary>
</details>
`;

class Component extends HTMLElement {
  constructor() {
    super();
    this._shadow = this.attachShadow({ mode: 'closed' });
    // The mode can be set to 'open' if we need the document to be able to access the shadow-dom internals.
    // Access happens through ths `shadowroot` property in the host.
    this._shadow.appendChild(template.content.cloneNode(true));

    this.$details = this._shadow.querySelector('details');
    this.$title = this._shadow.querySelector('summary');
    this.$content = null; // this._shadow.querySelector('div');
    this.$entries = [];
  }

  // Attributes need to be observed to be tied to the lifecycle change callback.
  static get observedAttributes() { return ['filter-id', 'label', 'type', 'data', 'custom-styles']; }

  // Attribute values are always strings, so we need to convert them in their getter/setters as appropriate.
  get customStyles() { return this.getAttribute('custom-styles'); }
  get data() { return JSON.parse(this.getAttribute('data')); }
  get filterId() { return this.getAttribute('filter-id'); }
  get label() { return this.getAttribute('label'); }
  get type() { return this.getAttribute('type'); }

  set customStyles(value) { this.setAttribute('custom-styles', value); }
  set data(value) { this.setAttribute('data', value); }
  set filterId(value) { this.setAttribute('filter-id', value); }
  set label(value) { this.setAttribute('label', value); }
  set type(value) { this.setAttribute('type', value); }

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
      case 'data':
        this.createEntries();
        break;
      case 'filter-id':
        // TODO: pass it to all entries for events reference
        break;
      case 'label':
        this.$title.innerText = this.label;
        break;
      case 'type':
        this.createEntries();
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

  async createEntries() {
    if (!this.type || !this.data) return;

    // TODO...
  }
}

window.customElements.define(_name, Component);