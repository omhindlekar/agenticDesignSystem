// Fixture: stories cover only one variant and one state.
import { BadWidget } from './bad-widget';

export default { component: BadWidget, args: { label: 'Widget' } };

export const Primary = { args: { variant: 'primary' }, parameters: { ads: { variant: 'primary', state: 'default' } } };
