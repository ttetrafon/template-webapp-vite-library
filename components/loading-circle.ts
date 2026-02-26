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
  private _shadow: ShadowRoot;

  constructor() {
    super();
    this._shadow = this.attachShadow({ mode: 'closed' });
    this._shadow.appendChild(template.content.cloneNode(true));
  }

  static get observedAttributes() { return ['lang', 'custom-styles']; }

  get customStyles() { return this.getAttribute('custom-styles'); }
  get lang() { return this.getAttribute("lang"); }

  set customStyles(value: string | null) { this.setAttribute('custom-styles', value!); }
  set lang(value: string | null) { this.setAttribute("lang", value!); }

  attributeChangedCallback(property: string, oldValue: string, newValue: string) {
    if (oldValue === newValue) return;
    switch(property) {
      case 'custom-styles':
        this._loadCustomStyleSheet();
        break;
    }
  }
  connectedCallback() {
  }
  disconnectedCallback() {
  }
  adoptedCallback() {
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
