import styles from '../../styles/style.css?inline';
import { eventNames } from '../data/enums';
import defaultStyles from '../styles/content-filters.css?inline';

const _name = 'content-filters';
const template = document.createElement('template');

template.innerHTML = /*html*/`
<style>
  ${ styles }
  ${ defaultStyles }

  :host {
    display: flex;
    flex-flow: column nowrap;
    align-items: stretch;
    width: 100%;
  }

  h3 {
    position: relative;
    justify-content: space-between;
    width: 100%;
  }

  h3 span {
    font-size: 1em;
    font-style: italic;
  }

  h3 .flex-separator {
    min-width: 16px;
  }

  h3 button-text-image {
    height: 1.2em;
    font-size: 0.85em;
  }
</style>

<h3 class="flex-line">
  <span id="label">Filters?!</span>
  <span class="flex-separator"></span>
  <button-text-image
    image="close_small"
    label="clear"
    event-name=${ eventNames.CONTENT_FILTER_CLEAR.description }
  ></button-text-image>
</h3>

<div id="filters-container"></div>
`;

class Component extends HTMLElement {
  constructor() {
    super();
    this._shadow = this.attachShadow({ mode: 'closed' });
    // The mode can be set to 'open' if we need the document to be able to access the shadow-dom internals.
    // Access happens through ths `shadowroot` property in the host.
    this._shadow.appendChild(template.content.cloneNode(true));

    this.$label = this._shadow.getElementById("label");
    this.$filtersContainer = this._shadow.getElementById("filters-container");
  }

  // Attributes need to be observed to be tied to the lifecycle change callback.
  static get observedAttributes() { return ['label', 'data', 'custom-styles']; }

  // Attribute values are always strings, so we need to convert them in their getter/setters as appropriate.
  get customStyles() { return this.getAttribute('custom-styles'); }
  get data() { return JSON.parse(this.getAttribute('data')); }
  get label() { return this.getAttribute('label'); }

  set customStyles(value) { this.setAttribute('custom-styles', value); }
  set data(value) { this.setAttribute('data', value); }
  set label(value) { this.setAttribute('label', value); }

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
        this.loadFilterData();
        break;
      case 'label':
        this.$label.innerText = this.label;
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

  async loadFilterData() {
    this.data.forEach(filter => {
      // console.log("... filter:", filter);
      let f = document.createElement(`content-filter`);
      // TODO: should also accept and pass a map (type -> component-name) for population of custom components as filters
      f.setAttribute("filter-id", filter.id);
      f.setAttribute("label", filter.display);
      f.setAttribute("type", filter.type);
      f.setAttribute("data", JSON.stringify(filter.values));
      if (filter.defaultOpen) {
        f.setAttribute("open", true);
      }
      this.$filtersContainer.appendChild(f);
    });
  }
}

window.customElements.define(_name, Component);