import styles from '../../styles/style.css?inline';

const template = document.createElement('template');

template.innerHTML = /*html*/`
<style>
  ${styles}

  :host {
    display: block;
  }
</style>

<h1>Page not found</h1>
`;

class Component extends HTMLElement {
  private _shadow: ShadowRoot;

  constructor() {
    super();
    this._shadow = this.attachShadow({ mode: 'closed' });
    this._shadow.appendChild(template.content.cloneNode(true));
  }

  static get observedAttributes() { return ['label', 'data', 'custom-styles']; }

  get customStyles() { return this.getAttribute('custom-styles'); }
  get data() { return JSON.parse(this.getAttribute('data')!); }
  get label() { return this.getAttribute('label'); }

  set customStyles(value: string | null) { this.setAttribute('custom-styles', value!); }
  set data(value: unknown) { this.setAttribute('data', value as string); }
  set label(value: string | null) { this.setAttribute('label', value!); }

  attributeChangedCallback(name: string, oldVal: string, newVal: string) {
    if (oldVal == newVal) return;
    switch(name) {
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

window.customElements.define('page-404', Component);
