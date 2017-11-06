// @flow

import { Component, type Node, type ComponentType } from 'react';

type Action = { type: string };

type Reduce<A> = (action: A) => void;

type Self<P, S, A> = {
    state: S,
    props: P,
    reduce: Reduce<A>
};

export type StatefulComponentDef<P: {}, S: {}, A: Action> = {|
    initialState: (props: P) => S,
    reducer: (state: S, action: A) => S,
    render: (self: Self<P, S, A>) => Node,
    didMount?: (self: Self<P, S, A>) => void,
    willUnmount?: (self: Self<P, S, A>) => void,
    willReceiveProps?: (nextProps: P, self: Self<P, S, A>) => void,
    willUpdate?: (nextSelf: {| state: S, props: P |}, self: Self<P, S, A>) => void,
    didUpdate?: (prevSelf: {| state: S, props: P |}, self: Self<P, S, A>) => void,
    shouldUpdate?: (nextSelf: {| state: S, props: P |}, self: Self<P, S, A>) => boolean
|};

export type GetDefinition<P, S, A> = () => StatefulComponentDef<P, S, A>;

export default function createStatefulComponent<P: {}, S: {}, A: Action>(
    getDefinition: GetDefinition<P, S, A>
): ComponentType<P> {
    return class extends Component<P, S> {
        definition: StatefulComponentDef<P, S, A>;

        reduce: Reduce<A>;

        constructor(props: P) {
            super(props);

            this.definition = getDefinition();

            this.state = this.definition.initialState(this.props);

            this.reduce = action => {
                this.setState(prevState => this.definition.reducer(prevState, action));
            };
        }

        _getSelf() {
            return {
                state: this.state,
                props: this.props,
                reduce: this.reduce
            };
        }

        componentDidMount() {
            const { didMount } = this.definition;
            if (!didMount) return;
            didMount(this._getSelf());
        }

        componentWillUnmount() {
            const { willUnmount } = this.definition;
            if (!willUnmount) return;
            willUnmount(this._getSelf());
        }

        componentWillReceiveProps(nextProps: P) {
            const { willReceiveProps } = this.definition;

            if (!willReceiveProps) return;
            willReceiveProps(nextProps, this._getSelf());
        }

        componentWillUpdate(nextProps: P, nextState: S) {
            const { willUpdate } = this.definition;
            if (!willUpdate) return;

            const nextSelf = {
                state: nextState,
                props: nextProps
            };

            willUpdate(nextSelf, this._getSelf());
        }

        componentDidUpdate(prevProps: P, prevState: S) {
            const { didUpdate } = this.definition;

            if (!didUpdate) return;

            const prevSelf = {
                state: prevState,
                props: prevProps
            };

            didUpdate(prevSelf, this._getSelf());
        }

        shouldComponentUpdate(nextProps: P, nextState: S) {
            const { shouldUpdate } = this.definition;

            if (!shouldUpdate) return true;

            const nextSelf = {
                state: nextState,
                props: nextProps
            };

            return shouldUpdate(nextSelf, this._getSelf());
        }

        render() {
            return this.definition.render({
                state: this.state,
                props: this.props,
                reduce: this.reduce
            });
        }
    };
}
