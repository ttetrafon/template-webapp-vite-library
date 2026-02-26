import styles from '../../styles/style.css?inline';
import defaultStyles from '../styles/input-field.css?inline';
import { eventNames } from '../data/enums.ts';
import { emitCustomEvent } from '../helper/dom.ts';

const template = document.createElement('template');

template.innerHTML = /*html*/`
<style>
  ${ styles }
  ${ defaultStyles }
</style>

<div class="flex-column">
  <label>Label</label>
  <input id="" type="text">
</div>
`;

class Component extends HTMLElement {
  private _shadow: ShadowRoot;
  private $container: HTMLDivElement;
  private $label: HTMLLabelElement;
  private $field: HTMLInputElement;
  private fieldKeyEventBound!: (e: Event) => void;

  constructor() {
    super();
    this._shadow = this.attachShadow({ mode: 'closed' });
    this._shadow.appendChild(template.content.cloneNode(true));

    this.$container = this._shadow.querySelector("div")!;
    this.$label = this._shadow.querySelector("label")!;
    this.$field = this._shadow.querySelector("input")!;
  }

  static get observedAttributes() { return ['label', 'id', 'hint', 'type', 'required', 'validationFailureMsg', 'direction', 'initial-value', 'custom-styles']; }

  get customStyles() { return this.getAttribute('custom-styles'); }
  get direction() { return this.getAttribute('direction'); }
  get hint() { return this.getAttribute('hint'); }
  get id() { return this.getAttribute('id'); }
  get initialValue() { return JSON.parse(this.getAttribute('initial-value')!); }
  get label() { return this.getAttribute('label'); }
  get required() { return this.getAttribute('required'); }
  get type() { return this.getAttribute('type'); }
  get validationFailureMsg() { return this.getAttribute('validationFailureMsg'); }

  set customStyles(value: string | null) { this.setAttribute('custom-styles', value!); }
  set direction(value: string | null) { this.setAttribute('direction', value!); }
  set hint(value: string | null) { this.setAttribute('hint', value!); }
  set id(value: string) { this.setAttribute('id', value); }
  set initialValue(value: unknown) { this.setAttribute('initial-value', value as string); }
  set label(value: string | null) { this.setAttribute('label', value!); }
  set required(value: string | null) { this.setAttribute('required', value!); }
  set type(value: string | null) { this.setAttribute('type', value!); }
  set validationFailureMsg(value: string | null) { this.setAttribute('validationFailureMsg', value!); }

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
      case 'hint':
        this.$field.setAttribute("placeholder", this.hint!);
        break;
      case 'id':
        this.$label.setAttribute("for", this.id!);
        this.$field.setAttribute("id", this.id!);
        break;
      case 'initial-value':
        this.$field.value = this.initialValue;
        break;
      case 'label':
        this.$label.innerText = this.label!;
        break;
      case 'required':
        if (this.required == 'yes') {
          this.$field.setAttribute("required", "");
        }
        else {
          this.$field.removeAttribute("required");
        }
        break;
      case 'type':
        this.$field.setAttribute("type", this.type!);
        break;
    }
  }
  connectedCallback() {
    this.fieldKeyEventBound = this.fieldKeyEvent.bind(this);
    this.$field.addEventListener("keyup", this.fieldKeyEventBound);
  }
  disconnectedCallback() {
    this.$field.removeEventListener("keyup", this.fieldKeyEventBound);
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

  fieldKeyEvent(event: Event) {
    const ke = event as KeyboardEvent;
    if (["Enter", "NumpadEnter"].includes(ke.code)) {
      emitCustomEvent(this.$field, eventNames.INPUT_CONTROL.description!, {
        keyCode: ke.code
      });
      this.$field.blur();
    }
  }

  getValue() {
    return this.$field.value;
  }

  validateValue() {
    console.log(`---> validateValue(${ this.id })`);
    this.$field.checkValidity();
    this.$field.setCustomValidity(this.validationFailureMsg!);
    return this.$field.reportValidity();
  }
}

window.customElements.define('input-field', Component);
