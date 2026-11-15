/**
 * The usage page for a component: purpose, when to use it, live do and don't pairs,
 * keyboard (from checks/a11y/apg.ts), accessibility notes, props and tokens, all
 * rendered from the component's metadata so the page cannot drift from the code.
 * Each component's <id>.usage.stories.tsx supplies only the do and don't examples.
 */
import type { ReactNode } from 'react';
import { Icon } from '../../components/icon/icon';
import { APG_CONTRACT, isInteractive } from '../../checks/a11y/apg';
import './usage-page.css';

export interface UsageExample {
  caption: string;
  example: ReactNode;
}

export interface UsagePair {
  do: UsageExample;
  /** `antiPattern` quotes the metadata anti-pattern this example shows, word for word. */
  dont: UsageExample & { antiPattern: string };
}

export interface UsageSpec {
  pairs: UsagePair[];
  /** Anti-patterns described in words only, with the reason a live example would not help. */
  textOnly?: Record<string, string>;
}

export interface UsageMeta {
  id: string;
  purpose: string;
  whenToUse: string[];
  whenNotToUse: string[];
  related: string[];
  antiPatterns: string[];
  a11yNotes: string[];
  tokensUsed: string[];
  props: Array<{ name: string; type: string; required: boolean; description: string }>;
}

const pascal = (id: string) =>
  id
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join('');

function Example({ kind, item }: { kind: 'do' | 'dont'; item: UsageExample }) {
  return (
    <figure className="usage__example" data-kind={kind}>
      <div className="usage__stage">{item.example}</div>
      <figcaption className="usage__caption">
        <span className="usage__verdict">
          <Icon name={kind === 'do' ? 'check_circle' : 'cancel'} size="sm" />
          {kind === 'do' ? 'Do' : 'Don’t'}
        </span>
        <span>{item.caption}</span>
      </figcaption>
    </figure>
  );
}

export function UsagePage({ meta, spec }: { meta: UsageMeta; spec: UsageSpec }) {
  const contract = APG_CONTRACT[meta.id];
  const shown = new Set(spec.pairs.map((p) => p.dont.antiPattern));
  const alsoAvoid = meta.antiPatterns.filter((a) => !shown.has(a));
  return (
    <article className="usage" aria-labelledby="usage-title">
      <header className="usage__header">
        <p className="usage__overline">Usage</p>
        <h1 className="usage__title" id="usage-title">
          {pascal(meta.id)}
        </h1>
        <p className="usage__lead">{meta.purpose}</p>
      </header>

      <section className="usage__section usage__columns" aria-label="When to use it">
        <div>
          <h2 className="usage__heading">When to use</h2>
          <ul className="usage__list">
            {meta.whenToUse.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="usage__heading">When not to use</h2>
          <ul className="usage__list">
            {meta.whenNotToUse.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="usage__section" aria-labelledby="usage-dos">
        <h2 className="usage__heading" id="usage-dos">
          Do and don’t
        </h2>
        {spec.pairs.map((pair) => (
          <div className="usage__pair" key={pair.dont.antiPattern}>
            <Example kind="do" item={pair.do} />
            <Example kind="dont" item={pair.dont} />
          </div>
        ))}
        {alsoAvoid.length ? (
          <>
            <h3 className="usage__subheading">Also avoid</h3>
            <ul className="usage__list">
              {alsoAvoid.map((a) => (
                <li key={a}>{a}</li>
              ))}
            </ul>
          </>
        ) : null}
      </section>

      <section className="usage__section" aria-labelledby="usage-keyboard">
        <h2 className="usage__heading" id="usage-keyboard">
          Keyboard
        </h2>
        {contract && isInteractive(contract) ? (
          <>
            <p className="usage__note">
              Follows the WAI-ARIA <a href={contract.url}>{contract.pattern}</a> pattern.
            </p>
            <table className="usage__table">
              <thead>
                <tr>
                  <th scope="col">Key</th>
                  <th scope="col">What it does</th>
                </tr>
              </thead>
              <tbody>
                {contract.keys.map((k) => (
                  <tr key={k.key}>
                    <th scope="row">
                      <kbd className="usage__kbd">{k.key}</kbd>
                    </th>
                    <td>{k.does}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        ) : (
          <p className="usage__note">
            {contract && 'exempt' in contract ? contract.exempt : 'No keyboard interaction.'}
          </p>
        )}
      </section>

      <section className="usage__section" aria-labelledby="usage-a11y">
        <h2 className="usage__heading" id="usage-a11y">
          Accessibility
        </h2>
        <ul className="usage__list">
          {meta.a11yNotes.map((n) => (
            <li key={n}>{n}</li>
          ))}
        </ul>
      </section>

      <section className="usage__section" aria-labelledby="usage-props">
        <h2 className="usage__heading" id="usage-props">
          Props
        </h2>
        <table className="usage__table">
          <thead>
            <tr>
              <th scope="col">Name</th>
              <th scope="col">Type</th>
              <th scope="col">Description</th>
            </tr>
          </thead>
          <tbody>
            {meta.props.map((p) => (
              <tr key={p.name}>
                <th scope="row">
                  <code>{p.name}</code>
                  {p.required ? <span className="usage__required"> required</span> : null}
                </th>
                <td>
                  <code className="usage__type">{p.type}</code>
                </td>
                <td>{p.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="usage__section usage__columns" aria-label="Related components and tokens">
        <div>
          <h2 className="usage__heading">Related</h2>
          <ul className="usage__list">
            {meta.related.map((r) => (
              <li key={r}>{pascal(r)}</li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="usage__heading">Tokens</h2>
          <ul className="usage__tokens">
            {meta.tokensUsed.map((t) => (
              <li key={t}>
                <code>{t}</code>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </article>
  );
}
