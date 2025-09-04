import { css, html } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import { DotCustomFieldBase } from '../base-wc';


@customElement('dot-url-slug')
export class DotUrlSlug extends DotCustomFieldBase {

  static styles = css`
    input {
        width: 100%;
        padding: 8px;
        border: 1px solid #ccc;
        border-radius: 4px;
        box-sizing: border-box;
        height: 100px;
        background-color: gray;
    }
  `;

  @state()
  private slugValue: string = '';

  willUpdate(changedProperties: Map<string, unknown>) {
    super.willUpdate(changedProperties);
    this.slugValue = this.transformValueToSlug();
  }

  render() {
    return html`
      <input
        type="text"
        .value=${this.slugValue}
        placeholder="URL Title"
        id="dot-url-slug"
      />
    `;
  }

  transformValueToSlug() {
    const currentTitle = this.getValueByField('title');
    if (!currentTitle) return '';
    return this.slugify(currentTitle as string);
  }

  private slugify(text: string): string {
    if (!text) return '';
    return text.toString().toLowerCase()
      .replace(/\s+/g, '-').replace(/[^\w-]+/g, '')
      .replace(/--+/g, '-').replace(/^-+/, '').replace(/-+$/, '');
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'dot-url-slug': DotUrlSlug
  }
}
