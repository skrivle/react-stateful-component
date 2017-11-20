// @flow

import { Component, Children, type Node } from 'react';
import PropTypes from 'prop-types';
import {
    SIDE_EFFECT_RUNNER_CONTEXT_KEY,
    type SideEffect,
    type Reduce
} from 'react-stateful-component';

export class MockSideEffectProvider extends Component<{
    mockRunner?: (sideEffect: ?SideEffect<*>, reduce: Reduce<*>) => void,
    children: Node
}> {
    static childContextTypes = {
        [SIDE_EFFECT_RUNNER_CONTEXT_KEY]: PropTypes.func.isRequired
    };

    getChildContext() {
        const { mockRunner } = this.props;

        return {
            [SIDE_EFFECT_RUNNER_CONTEXT_KEY]: (sideEffect: ?SideEffect<*>, reduce: Reduce<*>) => {
                if (!mockRunner || !sideEffect) return;
                mockRunner(sideEffect, reduce);
            }
        };
    }

    render() {
        return Children.only(this.props.children);
    }
}
