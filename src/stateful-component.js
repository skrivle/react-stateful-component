// @flow

import { Component, type Node, type ComponentType } from 'react';
import PropTypes from 'prop-types';
import invariant from 'invariant';
import type { SideEffect, Reduce } from './types';
import type { Update } from './update';

type Action = {};

type Self<P, S, A> = {
    state: S,
    props: P,
    reduce: Reduce<A>
};

type StatefulComponentDef<P: {}, S: {}, A: Action> = {|
    initialState: (props: P) => S,
    reducer: (state: S, action: A) => Update<S, A>,
    render: (self: Self<P, S, A>) => Node,
    didMount?: (self: Self<P, S, A>) => void,
    willUnmount?: (self: Self<P, S, A>) => void,
    willReceiveProps?: (nextProps: P, self: Self<P, S, A>) => void,
    willUpdate?: (nextSelf: {| state: S, props: P |}, self: Self<P, S, A>) => void,
    didUpdate?: (prevSelf: {| state: S, props: P |}, self: Self<P, S, A>) => void,
    shouldUpdate?: (nextSelf: {| state: S, props: P |}, self: Self<P, S, A>) => boolean
|};

type GetDefinition<P, S, A> = () => StatefulComponentDef<P, S, A>;

export default function createStatefulComponent<P: {}, S: {}, A: Action>(
    getDefinition: GetDefinition<P, S, A>
): ComponentType<P> {
    const definition = getDefinition();

    return class extends Component<P, S> {
        definition: StatefulComponentDef<P, S, A>;
        reduce: Reduce<A>;
        runSideEffectFromProvider: (SideEffect: ?SideEffect<A>, reduce: Reduce<A>) => void;

        static contextTypes = {
            runSideEffect: PropTypes.func.isRequired
        };

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

            this.runSideEffectFromProvider = context.runSideEffect;

            invariant(
                this.runSideEffectFromProvider,
                'Could not find runSideEffect in context, please wrap the root component in a <Provider>.'
            );
        }

        runSideEffect(sideEffect: ?SideEffect<A>) {
            this.runSideEffectFromProvider(sideEffect, this.reduce);
        }

        getSelf() {
            return {
                state: this.state,
                props: this.props,
                reduce: this.reduce
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
            return definition.render({
                state: this.state,
                props: this.props,
                reduce: this.reduce
            });
        }
    };
}
