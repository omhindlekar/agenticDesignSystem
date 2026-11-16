import { describe, it, expect } from 'vitest';
import { ScreenSpecSchema } from '../src/screen-spec.js';

const validSpec = {
  taskId: 'task-001',
  tree: {
    component: 'Card',
    props: { elevation: 'md' },
    tokenRefs: ['color-background-surface'],
    states: ['default'],
    children: [
      {
        component: 'Button',
        props: { label: 'Submit', variant: 'primary' },
        tokenRefs: ['color-interactive-default', 'space-component-padding-sm'],
        states: ['default', 'hover', 'disabled'],
      },
    ],
  },
  statesCovered: ['default', 'hover', 'disabled'],
};

describe('FR-6 ScreenSpecSchema', () => {
  it('FR-6: accepts a valid screen spec', () => {
    expect(ScreenSpecSchema.safeParse(validSpec).success).toBe(true);
  });

  it('FR-6: accepts a spec with no children on the root node', () => {
    const noChildren = {
      ...validSpec,
      tree: {
        component: 'Button',
        props: { label: 'Go' },
        tokenRefs: [],
        states: ['default'],
      },
    };
    expect(ScreenSpecSchema.safeParse(noChildren).success).toBe(true);
  });

  it('FR-6: rejects a spec missing taskId', () => {
    const { taskId: _t, ...noTask } = validSpec;
    expect(ScreenSpecSchema.safeParse(noTask).success).toBe(false);
  });

  it('FR-6: rejects a tree node missing component', () => {
    const bad = {
      ...validSpec,
      tree: { props: {}, tokenRefs: [], states: [] },
    };
    expect(ScreenSpecSchema.safeParse(bad).success).toBe(false);
  });

  it('FR-6: accepts deeply nested trees', () => {
    const deep = {
      taskId: 'task-deep',
      tree: {
        component: 'Modal',
        props: {},
        tokenRefs: [],
        states: ['open'],
        children: [
          {
            component: 'Card',
            props: {},
            tokenRefs: [],
            states: ['default'],
            children: [
              {
                component: 'Button',
                props: {},
                tokenRefs: [],
                states: ['default'],
              },
            ],
          },
        ],
      },
      statesCovered: ['open', 'default'],
    };
    expect(ScreenSpecSchema.safeParse(deep).success).toBe(true);
  });
});

describe('FR-6 ScreenSpecSchema: page layer (phase 2c)', () => {
  const page = {
    taskId: 'task-002',
    screenType: 'auth',
    template: 'auth-page',
    dossierId: 'dossier-login-1',
    tree: {
      component: 'AuthPage',
      props: { variant: 'centred' },
      tokenRefs: [],
      states: ['default'],
      children: [
        {
          component: 'Input',
          slot: 'form',
          part: 'email-field',
          props: { label: 'Email address' },
          tokenRefs: [],
          states: ['default'],
        },
        {
          component: 'Checkbox',
          slot: 'form',
          part: 'remember-me',
          deviation: 'innovation-1',
          props: { label: 'Keep me signed in' },
          tokenRefs: [],
          states: ['default'],
        },
      ],
    },
    statesCovered: ['default'],
  };

  it('FR-6: accepts screenType, template, dossierId, and slot, part and deviation on nodes', () => {
    const r = ScreenSpecSchema.safeParse(page);
    expect(r.success).toBe(true);
    expect(r.success && r.data.tree.children?.[1]?.deviation).toBe('innovation-1');
  });

  it('FR-6: specs without the page-layer fields stay valid (additive change)', () => {
    expect(ScreenSpecSchema.safeParse(validSpec).success).toBe(true);
  });

  it('FR-6: rejects an empty slot name', () => {
    const bad = structuredClone(page);
    bad.tree.children[0]!.slot = '';
    expect(ScreenSpecSchema.safeParse(bad).success).toBe(false);
  });
});
