// @flow

import { Component, Children, type Node } from 'react';
import PropTypes from 'prop-types';
import type { SideEffect, Reduce } from './types';

export const getChildContext = () => ({
    runSideEffect: (sideEffect: ?SideEffect<*>, reduce: Reduce<*>) => {
        if (!sideEffect) return;
        sideEffect(reduce);
    }
});

export default class SideEffectProvider extends Component<{ children: Node }> {
    static childContextTypes = {
        runSideEffect: PropTypes.func.isRequired
    };

    getChildContext() {
        return getChildContext();
    }

    render() {
        return Children.only(this.props.children);
    }
}
