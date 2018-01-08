// @flow

import { Component, Children, type Node } from 'react';
import PropTypes from 'prop-types';
import {
    SIDE_EFFECT_RUNNER_CONTEXT_KEY,
    type SideEffect,
    type Reduce
} from 'react-stateful-component';

export type Props = {
    mockRunner?: (sideEffect: ?SideEffect<*, *>, reduce: Reduce<*>, state: *) => void,
    children: Node
};

export class MockSideEffectProvider extends Component<Props> {
    static childContextTypes = {
        [SIDE_EFFECT_RUNNER_CONTEXT_KEY]: PropTypes.func.isRequired
    };

    getChildContext() {
        const { mockRunner } = this.props;

        return {
            [SIDE_EFFECT_RUNNER_CONTEXT_KEY]: (
                sideEffect: ?SideEffect<*, *>,
                reduce: Reduce<*>,
                state: *
            ) => {
                if (!mockRunner || !sideEffect) return;
                mockRunner(sideEffect, reduce, state);
            }
        };
    }

    render() {
        return Children.only(this.props.children);
    }
}
