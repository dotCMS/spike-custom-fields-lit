import { LitElement } from "lit";
import { property, state } from "lit/decorators.js";

export abstract class DotCustomFieldBase extends LitElement {
    @property({ type: Object })
    protected context: Record<string, unknown> = {};

    @property({ type: String })
    protected variableId: string = '';

    @state()
    private values: Map<string, unknown> = new Map();

    getValueByField(field: string) {
        return this.values.get(field) || null;
    }

    private setValueByField(field: string, value: unknown) {
        if (this.values.has(field)) {
            this.values.set(field, value);
        }
    }

    setValue(value: unknown) {
        this.setValueByField(this.variableId, value);
        this.dispatchValueChanged();
    }

    getValue() {
        return this.getValueByField(this.variableId);
    }

    setAllValues(values: Record<string, unknown>) {
        const filteredValues = Object.entries(values).filter(([field]) => this.values.has(field));
        this.values = new Map([...this.values, ...filteredValues]);
        this.dispatchValuesChanged();
    }

    willUpdate(changedProperties: Map<string, unknown>) {
        if (changedProperties.has('context')) {
            this.values = new Map(Object.entries(this.context || {}));
        }
    }

    protected dispatchValueChanged() {
        const event = new CustomEvent('dotChangeValue', {
            bubbles: true,
            composed: true,
            detail: {
                value: this.getValue(),
                variableId: this.variableId || '',
            },
        });
        this.dispatchEvent(event);
    }

    protected dispatchValuesChanged() {
        const event = new CustomEvent('dotChangeValues', {
            bubbles: true,
            composed: true,
            detail: {
                value: { ...Object.fromEntries(this.values) },
                variableId: this.variableId || '',
            },
        });
        this.dispatchEvent(event);
    }
}