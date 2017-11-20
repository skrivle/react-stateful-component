// @flow

import { Component, Children, type Node } from 'react';
import PropTypes from 'prop-types';
import type { SideEffect, Reduce } from './types';

export const SIDE_EFFECT_RUNNER_CONTEXT_KEY = 'runSideEffect';

export const getChildContext = () => ({
    [SIDE_EFFECT_RUNNER_CONTEXT_KEY]: (sideEffect: ?SideEffect<*>, reduce: Reduce<*>) => {
        if (!sideEffect) return;
        sideEffect(reduce);
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
