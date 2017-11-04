// @flow

import React from 'react';
import { storiesOf } from '@storybook/react';
import createStatefulComponent from '../src/';

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
                return { counter: counter + 1 };
            case 'SUBTRACT':
                return { counter: counter - 1 };
            default:
                return state;
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
        <Counter />
    </div>
));
