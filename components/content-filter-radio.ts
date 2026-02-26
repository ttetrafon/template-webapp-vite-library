import styles from '../../styles/style.css?inline';
import defaultStyles from '../styles/---.css?inline';
import { clearChildren } from '../helper/dom.ts';

const _name = 'content-filter-radio';
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


`;

class Component extends HTMLElement {
  private _shadow: ShadowRoot;

  constructor() {
    super();
    this._shadow = this.attachShadow({ mode: 'closed' });
    this._shadow.appendChild(template.content.cloneNode(true));
  }

  static get observedAttributes() { return ['group-id', 'data', 'custom-styles']; }

  get customStyles() { return this.getAttribute('custom-styles'); }
  get data() { return JSON.parse(this.getAttribute('data')!); }
  get groupId() { return this.getAttribute('group-id'); }

  set customStyles(value: string | null) { this.setAttribute('custom-styles', value!); }
  set data(value: unknown) { this.setAttribute('data', value as string); }
  set groupId(value: string | null) { this.setAttribute('group-id', value!); }

  attributeChangedCallback(name: string, oldVal: string, newVal: string) {
    if (oldVal == newVal) return;
    switch (name) {
      case 'custom-styles':
        this._loadCustomStyleSheet();
        break;
      case 'data':
        clearChildren(this._shadow as unknown as HTMLElement);

        let d = this.data;
        console.log("d:", d);
        for (let i = 0; i < d.length; i++) {
          let div = document.createElement("div");

          let input = document.createElement("input");
          input.setAttribute("type", "radio");
          input.setAttribute("id", d[i].id);
          input.setAttribute("name", this.groupId!);
          input.setAttribute("value", d[i].id);
          div.appendChild(input);

          let label = document.createElement("label");
          label.setAttribute("for", d[i].id);
          label.innerText = d[i].display;
          div.appendChild(label);

          this._shadow.appendChild(div);
        }
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

window.customElements.define(_name, Component);
