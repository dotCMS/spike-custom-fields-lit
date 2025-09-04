import { html } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { DotCustomFieldBase } from '../base-wc';
import api from '../axios';


interface Template {
  inode: string;
  title: string;
  fullTitle: string;
}

@customElement('dot-template-selector')
export class DotTemplateSelector extends DotCustomFieldBase {

  @property({ type: Array })
  templates: Template[] = [];
  
  @property({ type: Object })
  selectedTemplate: Template | null = null;

  async firstUpdated() {
    await this.fetchTemplates();
  }

  async fetchTemplates() {
    try {
      const response = await api.get('/templates/');
      this.templates = response.data?.entity || [];
    } catch (error) {
      console.error('Error fetching templates:', error);
      this.templates = [];
    }
  }

  willUpdate(changedProperties: Map<string, unknown>) {
    super.willUpdate(changedProperties);
  }

  render() {
    return html`
      <select
        type="select"
        @change=${this.handleChange}
        .value=${this.selectedTemplate?.inode || ''}
        placeholder="Select a template"
        id="dot-template-selector"
      >
        <option value="">Select a template</option>
        ${this.templates.map(template => html`<option value="${template.inode}">${template.title}</option>`)}
      </select>
    `;
  }

  handleChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    const selectedInode = target.value;
    const selectedTemplate = this.templates.find(t => t.inode === selectedInode) || null;
    
    this.selectedTemplate = selectedTemplate;
    this.setValue(selectedTemplate ? selectedTemplate.inode : null);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'dot-template-selector': DotTemplateSelector
  }
}
