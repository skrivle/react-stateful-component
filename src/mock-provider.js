// @flow

import { Component, Children, type Node } from 'react';
import PropTypes from 'prop-types';
import type { SideEffect, Reduce } from './types';

export class MockSideEffectProvider extends Component<{
    mockRunner?: (sideEffect: ?SideEffect<*>, reduce: Reduce<*>) => void,
    children: Node
}> {
    static childContextTypes = {
        runSideEffect: PropTypes.func.isRequired
    };

    getChildContext() {
        const { mockRunner } = this.props;

        return {
            runSideEffect: (sideEffect: ?SideEffect<*>, reduce: Reduce<*>) => {
                if (!mockRunner || !sideEffect) return;
                mockRunner(sideEffect, reduce);
            }
        };
    }

    render() {
        return Children.only(this.props.children);
    }
}
