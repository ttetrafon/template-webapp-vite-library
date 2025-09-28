import styles from '../../styles/style.css?inline';
import defaultStyles from '../styles/loading-circle.css?inline';

const template = document.createElement('template');

template.innerHTML = /*html*/`
<style>
  ${ styles }
  ${ defaultStyles }
</style>

<div id="spinner-parent" class="spinner-parent">
  <div id="spinner"></div>
</div>
`;

class LoadingCircle extends HTMLElement {
  constructor() {
    super();
    this._shadow = this.attachShadow({ mode: 'closed' });
    this._shadow.appendChild(template.content.cloneNode(true));
  }

  static get observedAttributes() { return ['lang', 'custom-styles']; }

  get customStyles() { return this.getAttribute('custom-styles'); }
  get lang() { return this.getAttribute("lang"); }

  set customStyles(value) { this.setAttribute('custom-styles', value); }
  set lang(value) { this.setAttribute("lang", value); }

  attributeChangedCallback(property, oldValue, newValue) {
    if (oldValue === newValue) return;
    switch(property) {
      case 'custom-styles':
        this._loadCustomStyleSheet();
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
}

window.customElements.define('loading-circle', LoadingCircle);