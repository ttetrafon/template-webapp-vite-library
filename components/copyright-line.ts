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
  private _shadow: ShadowRoot;
  private $copyrightYear: HTMLElement;
  private $currentYear: HTMLElement;
  private $copyrightHolder: HTMLElement;

  constructor() {
    super();
    this._shadow = this.attachShadow({ mode: 'closed' });
    this._shadow.appendChild(template.content.cloneNode(true));

    this.$copyrightYear = this._shadow.querySelector("#copyright-year")!;
    this.$currentYear = this._shadow.querySelector("#current-year")!;
    this.$copyrightHolder = this._shadow.querySelector("#copyright-holder")!;
  }

  static get observedAttributes() { return ['copyright-year', 'copyright-holder', 'custom-styles']; }

  get customStyles() { return this.getAttribute('custom-styles'); }
  get copyrightHolder() { return this.getAttribute('copyright-holder'); }
  get copyrightYear() { return this.getAttribute('copyright-year'); }

  set customStyles(value: string | null) { this.setAttribute('custom-styles', value!); }
  set copyrightHolder(value: string | null) { this.setAttribute('copyright-holder', value!); }
  set copyrightYear(value: string | null) { this.setAttribute('copyright-year', value!); }

  attributeChangedCallback(name: string, oldVal: string, newVal: string) {
    if (oldVal == newVal) return;
    switch (name) {
      case 'custom-styles':
        this._loadCustomStyleSheet();
        break;
      case 'copyright-holder':
        this.$copyrightHolder.innerText = this.copyrightHolder!;
        break;
      case 'copyright-year':
        this.$copyrightYear.innerText = this.copyrightYear!;
    }
  }
  connectedCallback() {
    const now = new Date();
    const year = now.getFullYear();
    this.$currentYear.innerText = String(year);
  }
  disconnectedCallback() {
  }
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
