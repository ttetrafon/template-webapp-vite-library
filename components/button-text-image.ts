import { emitCustomEvent } from '../helper/dom.ts';
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
  private _shadow: ShadowRoot;
  private $button: HTMLButtonElement;
  private $label: HTMLSpanElement;
  private $image: HTMLElement;
  private clickEventBound!: (e: Event) => void;

  constructor() {
    super();
    this._shadow = this.attachShadow({ mode: 'closed' });
    this._shadow.appendChild(template.content.cloneNode(true));

    this.$button = this._shadow.querySelector("button")!;
    this.$label = this._shadow.querySelector("span")!;
    this.$image = this._shadow.querySelector("svg-wrapper")!;
  }

  static get observedAttributes() { return ['label', 'hide-text', 'image', 'event-name', 'custom-styles']; }

  get customStyles() { return this.getAttribute('custom-styles'); }
  get eventName() { return this.getAttribute('event-name'); }
  get hideText() { return Boolean(this.getAttribute('hide-text')); }
  get image() { return this.getAttribute('image'); }
  get label() { return this.getAttribute('label'); }

  set customStyles(value: string | null) { this.setAttribute('custom-styles', value!); }
  set eventName(value: string | null) { this.setAttribute('event-name', value!); }
  set hideText(value: boolean) { this.setAttribute('hide-text', String(value)); }
  set image(value: string | null) { this.setAttribute('image', value!); }
  set label(value: string | null) { this.setAttribute('label', value!); }

  attributeChangedCallback(name: string, oldVal: string, newVal: string) {
    if (oldVal == newVal) return;
    switch (name) {
      case 'custom-styles':
        this._loadCustomStyleSheet();
        break;
      case 'hide-text':
        this.$label.classList.toggle("hidden", this.hideText);
        break;
      case 'image':
        this.$image.setAttribute('image', this.image!);
        break;
      case 'label':
        this.$label.innerText = this.label!;
        this.$button.setAttribute("title", this.label!);
        this.$image.setAttribute("label", this.label!);
        break;
      default:
        break;
    }
  }
  connectedCallback() {
    this.clickEventBound = this.clickEvent.bind(this);
    this.$button.addEventListener("click", this.clickEventBound);
  }
  disconnectedCallback() {
    this.$button.removeEventListener("click", this.clickEventBound);
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

  clickEvent(event: Event) {
    event.stopImmediatePropagation();
    if (!this.eventName) return;
    emitCustomEvent(this.$button, this.eventName, {});
  }
}

window.customElements.define('button-text-image', Component);
