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
  private _shadow: ShadowRoot;
  private $link: HTMLAnchorElement;
  private $span: HTMLSpanElement;
  private $svg: HTMLElement;

  constructor() {
    super();
    this._shadow = this.attachShadow({ mode: 'closed' });
    this._shadow.appendChild(template.content.cloneNode(true));

    this.$link = this._shadow.querySelector('a')!;
    this.$span = this._shadow.querySelector('span')!;
    this.$svg = this._shadow.querySelector('svg-wrapper')!;
  }

  static get observedAttributes() { return ['label', 'custom-styles', 'target', 'href']; }

  get customStyles() { return this.getAttribute('custom-styles'); }
  get label() { return this.getAttribute('label'); }
  get target() { return this.getAttribute('target'); }
  get href() { return this.getAttribute('href'); }

  set customStyles(value: string | null) { this.setAttribute('custom-styles', value!); }
  set label(value: string | null) { this.setAttribute('label', value!); }
  set target(value: string | null) { this.setAttribute('target', value!); }
  set href(value: string | null) { this.setAttribute('href', value!); }

  attributeChangedCallback(name: string, oldVal: string, newVal: string) {
    if (oldVal == newVal) return;
    switch (name) {
      case 'custom-styles':
        this._loadCustomStyleSheet();
        break;
      case 'label':
        this.$span.innerText = newVal;
        break;
      case 'target':
        this.$link.setAttribute('target', this.target!);
        this.$svg.classList.toggle("hidden", this.target != "_blank");
        break;
      case 'href':
        this.$link.setAttribute('href', this.href!);
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
