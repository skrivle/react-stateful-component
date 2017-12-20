// @flow

import { Component, type Node, type ComponentType } from 'react';
import PropTypes from 'prop-types';
import invariant from 'invariant';
import { SIDE_EFFECT_RUNNER_CONTEXT_KEY } from './provider';
import type { SideEffect, Reduce } from './types';
import { type Update, getSideEffect, getState } from './update';

type Action = {};

type Me<P, S, A, V> = {
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
    render: (me: Me<P, S, A, V>) => Node,
    didMount?: (me: Me<P, S, A, V>) => void,
    willUnmount?: (me: Me<P, S, A, V>) => void,
    willReceiveProps?: (nextProps: P, me: Me<P, S, A, V>) => void,
    willUpdate?: (nextMe: {| state: S, props: P |}, me: Me<P, S, A, V>) => void,
    didUpdate?: (prevMe: {| state: S, props: P |}, me: Me<P, S, A, V>) => void,
    shouldUpdate?: (nextMe: {| state: S, props: P |}, me: Me<P, S, A, V>) => boolean
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
                    const newState = getState(update);

                    sideEffect = getSideEffect(update);

                    return newState ? newState : prevState;
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

        getMe(): Me<P, S, A, V> {
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
            didMount(this.getMe());
        }

        componentWillUnmount() {
            const { willUnmount } = definition;
            if (!willUnmount) return;
            willUnmount(this.getMe());
        }

        componentWillReceiveProps(nextProps: P) {
            const { willReceiveProps } = definition;

            if (!willReceiveProps) return;
            willReceiveProps(nextProps, this.getMe());
        }

        componentWillUpdate(nextProps: P, nextState: S) {
            const { willUpdate } = definition;
            if (!willUpdate) return;

            const nextMe = {
                state: nextState,
                props: nextProps
            };

            willUpdate(nextMe, this.getMe());
        }

        componentDidUpdate(prevProps: P, prevState: S) {
            const { didUpdate } = definition;

            if (!didUpdate) return;

            const prevMe = {
                state: prevState,
                props: prevProps
            };

            didUpdate(prevMe, this.getMe());
        }

        shouldComponentUpdate(nextProps: P, nextState: S) {
            const { shouldUpdate } = definition;

            if (!shouldUpdate) return true;

            const nextMe = {
                state: nextState,
                props: nextProps
            };

            return shouldUpdate(nextMe, this.getMe());
        }

        render() {
            return definition.render(this.getMe());
        }
    };
}
