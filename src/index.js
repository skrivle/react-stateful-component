// @flow

import { Component, type Node, type ComponentType } from 'react';

type Action = {};

export type Reduce<A> = (action: A) => void;

type Self<P, S, A> = {
    state: S,
    props: P,
    reduce: Reduce<A>
};

type SideEffect<A> = (reduce: Reduce<A>) => any;

type Update<S, A> = {
    state: S,
    sideEffect: ?SideEffect<A>
};

export type StatefulComponentDef<P: {}, S: {}, A: Action> = {|
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

export type GetDefinition<P, S, A> = () => StatefulComponentDef<P, S, A>;

export const update = <S, A>(state: S, sideEffect: ?SideEffect<A> = null): Update<S, A> => ({
    state,
    sideEffect
});

export default function createStatefulComponent<P: {}, S: {}, A: Action>(
    getDefinition: GetDefinition<P, S, A>
): ComponentType<P> {
    const definition = getDefinition();

    return class extends Component<P, S> {
        definition: StatefulComponentDef<P, S, A>;
        reduce: Reduce<A>;

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

        runSideEffect(sideEffect: ?SideEffect<A>) {
            if (!sideEffect) return;
            sideEffect(this.reduce);
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
