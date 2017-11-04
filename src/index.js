// @flow

import { Component, type Node, type ComponentType } from 'react';

type Action = { type: string };

type Reducer<S, A> = (state: S, action: A) => S;

type Reduce<A> = (action: A) => void;

type Render<P, S, A> = (args: { state: S, props: P, reduce: Reduce<A> }) => Node;

export type StatefulComponentDef<P: {}, S: {}, A: Action> = {|
    initialState: (props: P) => S,
    reducer: Reducer<S, A>,
    render: Render<P, S, A>
|};

export type Make<P, S, A> = () => StatefulComponentDef<P, S, A>;

export default function createStatefulComponent<P: {}, S: {}, A: Action>(
    make: Make<P, S, A>
): ComponentType<P> {
    return class extends Component<P, S> {
        instance: StatefulComponentDef<P, S, A>;

        reduce: Reduce<A>;

        constructor(props: P) {
            super(props);

            this.instance = make();

            this.state = {
                ...this.instance.initialState(this.props)
            };

            this.reduce = action => {
                this.setState(prevState => this.instance.reducer(prevState, action));
            };
        }
        render() {
            return this.instance.render({
                state: this.state,
                props: this.props,
                reduce: action => this.reduce(action)
            });
        }
    };
}
