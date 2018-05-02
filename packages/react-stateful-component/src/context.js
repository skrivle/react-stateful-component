// @flow

import React from 'react';
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

const context = React.createContext(runSideEffect);

export default context;
