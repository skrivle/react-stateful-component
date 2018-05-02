// @flow

import React from 'react';
import { storiesOf } from '@storybook/react';
import createComponent, {
    update,
    SideEffectProvider
} from '../packages/react-stateful-component/src';

const add = () => ({ type: 'ADD' });

const intervalSubscription = reduce => {
    const timer = setInterval(() => {
        reduce(add());
    }, 1000);

    return () => clearInterval(timer);
};

const Counter = createComponent(() => ({
    subscriptions: [intervalSubscription],
    initialState: () => ({
        counter: 0
    }),
    reducer: (state, action) => {
        const { counter } = state;

        switch (action.type) {
            case 'ADD':
                return update.state({ counter: counter + 1 });
            default:
                return update.nothing();
        }
    },
    render: ({ state }) => (
        <div>
            <span>{state.counter}</span>
        </div>
    )
}));

const Controller = createComponent(() => ({
    initialState: () => ({
        isCounterVisible: false
    }),
    reducer: (state, action) => {
        switch (action.type) {
            case 'TOGGLE_COUNTER':
                return update.state({ isCounterVisible: !state.isCounterVisible });
            default:
                return update.nothing();
        }
    },
    render: ({ state, reduce }) => (
        <div>
            <div>{state.isCounterVisible ? <Counter /> : null}</div>
            <button onClick={() => reduce({ type: 'TOGGLE_COUNTER' })}>Toggle</button>
        </div>
    )
}));

storiesOf('Subscriptions', module).add('Basic', () => (
    <div>
        <SideEffectProvider>
            <Controller />
        </SideEffectProvider>
    </div>
));
