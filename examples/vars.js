// @flow

import React from 'react';
import { storiesOf } from '@storybook/react';
import createStatefulComponent, { update, SideEffectProvider } from '../src/';

const add = () => ({ type: 'ADD' });

const Counter = createStatefulComponent(() => ({
    vars: () => ({}),
    initialState: () => ({
        counter: 0
    }),
    reducer: (state, action) => {
        const { counter } = state;

        switch (action.type) {
            case 'ADD':
                return update({ counter: counter + 1 });
            default:
                return update(state);
        }
    },
    didMount({ reduce, vars }) {
        vars.timer = setInterval(() => {
            reduce(add());
        }, 1000);
    },
    willUnmount({ vars }) {
        if (typeof vars.timer !== 'undefined') {
            clearInterval(vars.timer);
        }
    },
    render: ({ state }) => (
        <div>
            <span>{state.counter}</span>
        </div>
    )
}));

const Controller = createStatefulComponent(() => ({
    // vars: () => ({}),
    initialState: () => ({
        isCounterVisible: false
    }),
    reducer: (state, action) => {
        switch (action.type) {
            case 'TOGGLE_COUNTER':
                return update({ isCounterVisible: !state.isCounterVisible });
            default:
                return update(state);
        }
    },
    render: ({ state, reduce }) => (
        <div>
            <div>{state.isCounterVisible ? <Counter /> : null}</div>
            <button onClick={() => reduce({ type: 'TOGGLE_COUNTER' })}>Toggle</button>
        </div>
    )
}));

storiesOf('Instance Variables', module).add('Basic', () => (
    <div>
        <SideEffectProvider>
            <Controller />
        </SideEffectProvider>
    </div>
));
