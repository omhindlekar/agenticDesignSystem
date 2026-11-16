import { describe, it, expect } from 'vitest';
import { ComponentMetadataSchema } from '../src/component-metadata.js';

const validMetadata = {
  id: 'button',
  purpose: 'Triggers an action or submits a form',
  variants: ['primary', 'secondary', 'ghost'],
  states: ['default', 'hover', 'active', 'disabled', 'loading'],
  props: [
    { name: 'label', type: 'string', required: true, description: 'Button label text' },
    { name: 'disabled', type: 'boolean', required: false, description: 'Disables the button' },
  ],
  whenToUse: ['To trigger an action'],
  whenNotToUse: ['As a navigation link — use an anchor instead'],
  related: ['link', 'icon-button'],
  antiPatterns: ['Using Button for navigation'],
  tokensUsed: ['color-interactive-default', 'space-component-padding-sm'],
  a11yNotes: ['Must have a visible label or aria-label'],
};

describe('FR-3 ComponentMetadataSchema', () => {
  it('FR-3: accepts valid component metadata', () => {
    const result = ComponentMetadataSchema.safeParse(validMetadata);
    expect(result.success).toBe(true);
  });

  it('FR-3: rejects metadata missing id', () => {
    const { id: _id, ...noId } = validMetadata;
    expect(ComponentMetadataSchema.safeParse(noId).success).toBe(false);
  });

  it('FR-3: rejects metadata missing purpose', () => {
    const { purpose: _p, ...noPurpose } = validMetadata;
    expect(ComponentMetadataSchema.safeParse(noPurpose).success).toBe(false);
  });

  it('FR-3: rejects a prop with a missing required field', () => {
    const bad = {
      ...validMetadata,
      props: [{ name: 'label', type: 'string' }],
    };
    expect(ComponentMetadataSchema.safeParse(bad).success).toBe(false);
  });

  it('FR-3: requires at least one whenToUse entry', () => {
    const bad = { ...validMetadata, whenToUse: [] };
    expect(ComponentMetadataSchema.safeParse(bad).success).toBe(false);
  });

  it('FR-3: requires at least one whenNotToUse entry', () => {
    const bad = { ...validMetadata, whenNotToUse: [] };
    expect(ComponentMetadataSchema.safeParse(bad).success).toBe(false);
  });
});

describe('FR-3 ComponentMetadataSchema: layout and template kinds (phase 2c)', () => {
  it('FR-3: kind defaults to absent and accepts component, layout and template', () => {
    expect(ComponentMetadataSchema.safeParse(validMetadata).success).toBe(true);
    for (const kind of ['component', 'layout', 'template']) {
      expect(ComponentMetadataSchema.safeParse({ ...validMetadata, kind }).success).toBe(true);
    }
    expect(ComponentMetadataSchema.safeParse({ ...validMetadata, kind: 'page' }).success).toBe(false);
  });

  it('FR-3: a template declares named slots with what each accepts', () => {
    const template = {
      ...validMetadata,
      id: 'auth-page',
      kind: 'template',
      slots: [
        { name: 'title', required: true, accepts: ['text'], description: 'Page title, h1' },
        { name: 'form', required: true, accepts: ['input', 'checkbox'], description: 'The fields' },
      ],
    };
    expect(ComponentMetadataSchema.safeParse(template).success).toBe(true);
  });

  it('FR-3: rejects a slot with no name or an empty accepts list', () => {
    const slot = { name: 'form', required: true, accepts: ['input'], description: 'Fields' };
    expect(ComponentMetadataSchema.safeParse({ ...validMetadata, slots: [{ ...slot, name: '' }] }).success).toBe(false);
    expect(ComponentMetadataSchema.safeParse({ ...validMetadata, slots: [{ ...slot, accepts: [] }] }).success).toBe(false);
  });
});
