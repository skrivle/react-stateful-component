// @flow

import createReactContext from 'create-react-context';
import type { Reduce, Refs, SideEffectWrapper } from './types';

export const runSideEffect = (
    sideEffectWrapper: SideEffectWrapper<*, *>,
    reduce: Reduce<*>,
    state: *,
    refs: Refs
) => {
    if (!sideEffectWrapper.sideEffect) return;
    sideEffectWrapper.sideEffect(reduce, state, refs);
};

const context = createReactContext(runSideEffect);

export default context;
