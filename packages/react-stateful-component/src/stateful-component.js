// @flow

import React, { Component, type Node, type ComponentType } from 'react';
import type {
    SideEffect,
    SideEffectWrapper,
    Reduce,
    Subscription,
    ReleaseSubscription,
    Refs
} from './types';
import { type Update, getSideEffect, getState } from './update';
import context from './context';

type Action = {};

type Me<P, S, A> = {|
    state: S,
    props: P,
    refs: Refs,
    reduce: Reduce<A>
|};

type ComponentDef<P: {}, S: {}, A: Action> = {|
    displayName?: string,
    initialState: (props: P) => S,
    reducer: (state: S, action: A) => Update<S, A>,
    subscriptions?: Array<Subscription<A>>,
    render: (me: Me<P, S, A>) => Node,
    didMount?: (me: Me<P, S, A>) => void,
    willUnmount?: (me: Me<P, S, A>) => void,
    willReceiveProps?: (nextProps: P, me: Me<P, S, A>) => void,
    willUpdate?: (nextMe: {| state: S, props: P |}, me: Me<P, S, A>) => void,
    didUpdate?: (prevMe: {| state: S, props: P |}, me: Me<P, S, A>) => void,
    shouldUpdate?: (nextMe: {| state: S, props: P |}, me: Me<P, S, A>) => boolean
|};

export type ComponentDefinition<P, S, A> = (() => ComponentDef<P, S, A>) | ComponentDef<P, S, A>;

export default function createStatefulComponent<P: {}, S: {}, A: Action>(
    definition: ComponentDefinition<P, S, A>
): ComponentType<P> {
    definition = typeof definition === 'function' ? definition() : definition;

    return class extends Component<P, S> {
        reduce: Reduce<A>;
        sideEffectRunner: (
            SideEffect: SideEffectWrapper<A, S>,
            reduce: Reduce<A>,
            state: S,
            refs: Refs
        ) => void;
        subscriptions: Array<ReleaseSubscription>;
        myRefs: Refs;

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

            this.subscriptions = [];
            this.myRefs = {};
        }

        runSideEffect(sideEffect: ?SideEffect<A, S>, isSubscription: boolean = false) {
            const sideEffectWrapper = isSubscription
                ? {
                      type: 'sideEffectSupscription',
                      sideEffect
                  }
                : {
                      type: 'sideEffectDefault',
                      sideEffect
                  };

            this.sideEffectRunner(sideEffectWrapper, this.reduce, this.state, this.myRefs);
        }

        getMe(): Me<P, S, A> {
            return {
                state: this.state,
                props: this.props,
                reduce: this.reduce,
                refs: this.myRefs
            };
        }

        subscribe() {
            const { subscriptions } = definition;

            const subscriptionSideEffect = (reduce, state, refs) => {
                if (!subscriptions) return;

                subscriptions.forEach(subscription => {
                    this.subscriptions = [...this.subscriptions, subscription(reduce, refs)];
                });
            };

            this.runSideEffect(subscriptionSideEffect, true);
        }

        unsubscribe() {
            const subscriptionSideEffect = () => {
                this.subscriptions.forEach(unsubscribe => {
                    unsubscribe();
                });
            };

            this.runSideEffect(subscriptionSideEffect, true);
        }

        componentDidMount() {
            const { didMount } = definition;

            this.subscribe();

            if (!didMount) return;
            didMount(this.getMe());
        }

        componentWillUnmount() {
            const { willUnmount } = definition;

            this.unsubscribe();

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
            return (
                <context.Consumer>
                    {value => {
                        this.sideEffectRunner = value;
                        return definition.render(this.getMe());
                    }}
                </context.Consumer>
            );
        }
    };
}
