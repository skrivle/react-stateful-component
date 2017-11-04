// @flow

import { Component, type Node, type ComponentType } from 'react';

type Action = { type: string };

type Reduce<A> = (action: A) => void;

export type StatefulComponentDef<P: {}, S: {}, A: Action> = {|
    initialState: (props: P) => S,
    reducer: (state: S, action: A) => S,
    render: (args: { state: S, props: P, reduce: Reduce<A> }) => Node,
    didMount?: (args: { reduce: Reduce<A> }) => void,
    willUnmount?: () => void,
    willReceiveProps?: (nextProps: P, { state: S, props: P, reduce: Reduce<A> }) => S
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

            this.state = {
                ...this.definition.initialState(this.props)
            };

            this.reduce = action => {
                this.setState(prevState => this.definition.reducer(prevState, action));
            };
        }

        componentDidMount() {
            if (!this.definition.didMount) return;
            this.definition.didMount({ reduce: this.reduce });
        }

        componentWillUnmount() {
            if (!this.definition.willUnmount) return;
            this.definition.willUnmount();
        }

        componentWillReceiveProps(nextProps: P) {
            const { willReceiveProps } = this.definition;

            if (!willReceiveProps) return;

            this.setState(prevState =>
                willReceiveProps(nextProps, {
                    state: prevState,
                    props: this.props,
                    reduce: this.reduce
                })
            );
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
