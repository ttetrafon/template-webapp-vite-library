import { emitCustomEvent } from '../helper/dom.js';
import styles from '../../styles/style.css?inline';
import defaultStyles from '../styles/button-text-image.css?inline';

const template = document.createElement('template');

template.innerHTML = /*html*/`
<style>
  ${ styles }
  ${ defaultStyles }
</style>

<button class="flex-line">
  <svg-wrapper></svg-wrapper>
  <span></span>
</button>
`;

class Component extends HTMLElement {
  constructor() {
    super();
    this._shadow = this.attachShadow({ mode: 'closed' });
    // The mode can be set to 'open' if we need the document to be able to access the shadow-dom internals.
    // Access happens through ths `shadowroot` property in the host.
    this._shadow.appendChild(template.content.cloneNode(true));

    this.$button = this._shadow.querySelector("button");
    this.$label = this._shadow.querySelector("span");
    this.$image = this._shadow.querySelector("svg-wrapper");
  }

  // Attributes need to be observed to be tied to the lifecycle change callback.
  static get observedAttributes() { return ['label', 'hide-text', 'image', 'event-name', 'custom-styles']; }

  // Attribute values are always strings, so we need to convert them in their getter/setters as appropriate.
  get customStyles() { return this.getAttribute('custom-styles'); }
  get eventName() { return this.getAttribute('event-name'); }
  get hideText() { return Boolean(this.getAttribute('hide-text')); }
  get image() { return this.getAttribute('image'); }
  get label() { return this.getAttribute('label'); }

  set customStyles(value) { this.setAttribute('custom-styles', value); }
  set eventName(value) { this.setAttribute('event-name', value); }
  set hideText(value) { this.setAttribute('hide-text', value); }
  set image(value) { this.setAttribute('image', value); }
  set label(value) { this.setAttribute('label', value); }

  // A web component implements the following lifecycle methods.
  attributeChangedCallback(name, oldVal, newVal) {
    // Attribute value changes can be tied to any type of functionality through the lifecycle methods.
    if (oldVal == newVal) return;
    switch (name) {
      case 'custom-styles':
        this._loadCustomStyleSheet();
        break;
      case 'hide-text':
        this.$label.classList.toggle("hidden", this.hideText);
        break;
      case 'image':
        this.$image.setAttribute('image', this.image);
        break;
      case 'label':
        this.$label.innerText = this.label;
        this.$button.setAttribute("title", this.label);
        this.$image.setAttribute("label", this.label);
        break;
      default:
        break;
    }
  }
  connectedCallback() {
    // Triggered when the component is added to the DOM.
    this.clickEventBound = this.clickEvent.bind(this);

    this.$button.addEventListener("click", this.clickEventBound);
  }
  disconnectedCallback() {
    // Triggered when the component is removed from the DOM.
    // Ideal place for cleanup code.
    // Note that when destroying a component, it is good to also release any listeners.
    this.$button.removeEventListener("click", this.clickEventBound);
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

  /**
   * @param {Event} event
   */
  clickEvent(event) {
    event.stopImmediatePropagation();
    if (!this.eventName) return;
    emitCustomEvent(this.$button, this.eventName, {});
  }
}

window.customElements.define('button-text-image', Component);