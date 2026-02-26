import { populateSelectorOptions } from '../helper/dom.ts';
import styles from '../../styles/style.css?inline';
import defaultStyles from '../styles/selector-field.css?inline';

const template = document.createElement('template');

template.innerHTML = /*html*/`
<style>
  ${ styles }
  ${ defaultStyles }
</style>

<div class="flex-column">
  <label></label>
  <select></select>
</div>
`;

class Component extends HTMLElement {
  private _shadow: ShadowRoot;
  private $container: HTMLDivElement;
  private $label: HTMLLabelElement;
  private $selector: HTMLSelectElement;

  constructor() {
    super();
    this._shadow = this.attachShadow({ mode: 'closed' });
    this._shadow.appendChild(template.content.cloneNode(true));

    this.$container = this._shadow.querySelector("div")!;
    this.$label = this._shadow.querySelector("label")!;
    this.$selector = this._shadow.querySelector("select")!;
  }

  static get observedAttributes() { return ['label', 'options', 'direction', 'initial-value', 'custom-styles']; }

  get customStyles() { return this.getAttribute('custom-styles'); }
  get direction() { return this.getAttribute('direction'); }
  get initialValue() { return this.getAttribute('initial-value'); }
  get label() { return this.getAttribute('label'); }
  get options() { return JSON.parse(this.getAttribute('options')!); }

  set customStyles(value: string | null) { this.setAttribute('custom-styles', value!); }
  set direction(value: string | null) { this.setAttribute('direction', value!); }
  set initialValue(value: string | null) { this.setAttribute('initial-value', value!); }
  set label(value: string | null) { this.setAttribute('label', value!); }
  set options(value: unknown) { this.setAttribute('options', value as string); }

  attributeChangedCallback(name: string, oldVal: string, newVal: string) {
    if (oldVal == newVal) return;
    switch (name) {
      case 'custom-styles':
        this._loadCustomStyleSheet();
        break;
      case 'direction':
        this.$container.classList.toggle('flex-column', this.direction == 'column');
        this.$container.classList.toggle('flex-line', this.direction == 'line');
        break;
      case 'initial-value':
        this.$selector.value = this.initialValue!;
        break;
      case 'label':
        this.$label.innerText = this.label!;
        break;
      case 'options':
        populateSelectorOptions(this.$selector, this.options.options, this.options.valueKey, this.options.textKey);
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

  getValue() {
    return this.$selector.value;
  }
}

window.customElements.define('selector-field', Component);
