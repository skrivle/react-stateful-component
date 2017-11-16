// @flow

import React from 'react';
import { storiesOf } from '@storybook/react';
import createStatefulComponent, { update, SideEffectProvider } from '../src/';

const add = () => ({ type: 'ADD' });

const subtract = () => ({ type: 'SUBTRACT' });

const Counter = createStatefulComponent(() => ({
    initialState: () => ({
        counter: 0
    }),
    reducer: (state, action) => {
        const { counter } = state;

        switch (action.type) {
            case 'ADD':
                return update({ counter: counter + 1 });
            case 'SUBTRACT':
                return update({ counter: counter - 1 });
            default:
                return update(state);
        }
    },
    render: ({ state, reduce }) => (
        <div>
            <button onClick={() => reduce(add())}>+</button>
            <span>{state.counter}</span>
            <button onClick={() => reduce(subtract())}>-</button>
        </div>
    )
}));

storiesOf('Counter', module).add('Basic', () => (
    <div>
        <SideEffectProvider>
            <Counter />
        </SideEffectProvider>
    </div>
));
