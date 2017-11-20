// @flow

import { Component, type Node, type ComponentType } from 'react';
import PropTypes from 'prop-types';
import invariant from 'invariant';
import { SIDE_EFFECT_RUNNER_CONTEXT_KEY } from './provider';
import type { SideEffect, Reduce } from './types';
import type { Update } from './update';

type Action = {};

type Self<P, S, A, V> = {
    state: S,
    props: P,
    reduce: Reduce<A>,
    vars: V
};

type StatefulComponentDef<P: {}, S: {}, A: Action, V> = {|
    displayName?: string,
    initialState: (props: P) => S,
    vars?: (props: P) => V,
    reducer: (state: S, action: A) => Update<S, A>,
    render: (self: Self<P, S, A, V>) => Node,
    didMount?: (self: Self<P, S, A, V>) => void,
    willUnmount?: (self: Self<P, S, A, V>) => void,
    willReceiveProps?: (nextProps: P, self: Self<P, S, A, V>) => void,
    willUpdate?: (nextSelf: {| state: S, props: P |}, self: Self<P, S, A, V>) => void,
    didUpdate?: (prevSelf: {| state: S, props: P |}, self: Self<P, S, A, V>) => void,
    shouldUpdate?: (nextSelf: {| state: S, props: P |}, self: Self<P, S, A, V>) => boolean
|};

type GetDefinition<P, S, A, V> = () => StatefulComponentDef<P, S, A, V>;

export default function createStatefulComponent<P: {}, S: {}, A: Action, V>(
    getDefinition: GetDefinition<P, S, A, V>
): ComponentType<P> {
    const definition = getDefinition();

    return class extends Component<P, S> {
        reduce: Reduce<A>;
        sideEffectRunner: (SideEffect: ?SideEffect<A>, reduce: Reduce<A>) => void;
        vars: V;

        static contextTypes = { [SIDE_EFFECT_RUNNER_CONTEXT_KEY]: PropTypes.func.isRequired };
        static displayName = definition.displayName;

        definition = definition;
        state = definition.initialState(this.props);

        reduce = (action: A) => {
            let sideEffect;

            this.setState(
                prevState => {
                    const update = definition.reducer(prevState, action);

                    sideEffect = update.sideEffect;

                    return update.state;
                },
                () => this.runSideEffect(sideEffect)
            );
        };

        constructor(props: P, context: Object) {
            super(props, context);

            this.sideEffectRunner = context[SIDE_EFFECT_RUNNER_CONTEXT_KEY];

            invariant(
                this.sideEffectRunner,
                'Could not find runSideEffect in context, please wrap the root component in a <SideEffectProvider>.'
            );

            if (definition.vars) this.vars = definition.vars(this.props);
        }

        runSideEffect(sideEffect: ?SideEffect<A>) {
            this.sideEffectRunner(sideEffect, this.reduce);
        }

        getSelf(): Self<P, S, A, V> {
            return {
                state: this.state,
                props: this.props,
                reduce: this.reduce,
                vars: this.vars
            };
        }

        componentDidMount() {
            const { didMount } = definition;
            if (!didMount) return;
            didMount(this.getSelf());
        }

        componentWillUnmount() {
            const { willUnmount } = definition;
            if (!willUnmount) return;
            willUnmount(this.getSelf());
        }

        componentWillReceiveProps(nextProps: P) {
            const { willReceiveProps } = definition;

            if (!willReceiveProps) return;
            willReceiveProps(nextProps, this.getSelf());
        }

        componentWillUpdate(nextProps: P, nextState: S) {
            const { willUpdate } = definition;
            if (!willUpdate) return;

            const nextSelf = {
                state: nextState,
                props: nextProps
            };

            willUpdate(nextSelf, this.getSelf());
        }

        componentDidUpdate(prevProps: P, prevState: S) {
            const { didUpdate } = definition;

            if (!didUpdate) return;

            const prevSelf = {
                state: prevState,
                props: prevProps
            };

            didUpdate(prevSelf, this.getSelf());
        }

        shouldComponentUpdate(nextProps: P, nextState: S) {
            const { shouldUpdate } = definition;

            if (!shouldUpdate) return true;

            const nextSelf = {
                state: nextState,
                props: nextProps
            };

            return shouldUpdate(nextSelf, this.getSelf());
        }

        render() {
            return definition.render(this.getSelf());
        }
    };
}
