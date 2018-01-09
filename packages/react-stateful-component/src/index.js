// @flow

import * as update from './update';
import createStatefulComponent, { type ComponentDefinition } from './stateful-component';

export {
    default as SideEffectProvider,
    getChildContext,
    SIDE_EFFECT_RUNNER_CONTEXT_KEY
} from './provider';

export * from './types';
export { update };
export type { ComponentDefinition };
export default createStatefulComponent;
