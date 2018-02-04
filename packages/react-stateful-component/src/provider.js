// @flow

import { Component, Children, type Node } from 'react';
import PropTypes from 'prop-types';
import type { Reduce, Refs, SideEffectWrapper } from './types';

export const SIDE_EFFECT_RUNNER_CONTEXT_KEY = 'runSideEffect';

export const getChildContext = () => ({
    [SIDE_EFFECT_RUNNER_CONTEXT_KEY]: (
        sideEffectWrapper: SideEffectWrapper<*, *>,
        reduce: Reduce<*>,
        state: *,
        refs: Refs
    ) => {
        if (!sideEffectWrapper.sideEffect) return;
        sideEffectWrapper.sideEffect(reduce, state, refs);
    }
});

export default class SideEffectProvider extends Component<{ children: Node }> {
    static childContextTypes = {
        [SIDE_EFFECT_RUNNER_CONTEXT_KEY]: PropTypes.func.isRequired
    };

    getChildContext() {
        return getChildContext();
    }

    render() {
        return Children.only(this.props.children);
    }
}
