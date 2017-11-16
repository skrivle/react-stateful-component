// @flow

import React from 'react';
import { storiesOf } from '@storybook/react';
import uuid from 'uuid/v1';
import createStatefulComponent, { update, SideEffectProvider } from '../src/';

const updateValue = (text: string) => ({
    type: 'UPDATE_VALUE',
    text
});

const addTodo = () => ({
    type: 'ADD_TODO_REQUESTED'
});

const addTodoReceived = todo => ({
    type: 'ADD_TODO_RECEIVED',
    todo
});

const saveTodo = text => reduce =>
    new Promise(resolve => {
        setTimeout(() => {
            resolve(text);
        }, 2000);
    }).then(text => {
        reduce(
            addTodoReceived({
                id: uuid(),
                text
            })
        );
    });

const Todos = createStatefulComponent(() => ({
    initialState: () => ({
        items: [
            {
                id: uuid(),
                text: 'item 1'
            }
        ],
        value: '',
        isPending: false
    }),
    reducer: (state, action) => {
        switch (action.type) {
            case 'UPDATE_VALUE':
                return update({
                    ...state,
                    value: action.text
                });
            case 'ADD_TODO_REQUESTED':
                return update(
                    {
                        ...state,
                        value: '',
                        isPending: true
                    },
                    saveTodo(state.value)
                );
            case 'ADD_TODO_RECEIVED':
                return update({
                    ...state,
                    isPending: false,
                    items: [...state.items, action.todo]
                });
            default:
                return update(state);
        }
    },
    render: ({ state: { items, value, isPending }, reduce }) => {
        const handleFormSubmit = e => {
            e.preventDefault();
            reduce(addTodo());
        };

        const handleInputChange = e => reduce(updateValue(e.target.value));

        return (
            <div>
                <ul>{items.map(item => <li key={item.id}>{item.text}</li>)}</ul>
                <form onSubmit={handleFormSubmit}>
                    <input
                        type="text"
                        value={value}
                        disabled={isPending}
                        onChange={handleInputChange}
                    />
                    <button disabled={isPending} type="submit">
                        add
                    </button>
                    {isPending ? <span>Processing ...</span> : null}
                </form>
            </div>
        );
    }
}));

storiesOf('Todo', module).add('Basic', () => (
    <div>
        <SideEffectProvider>
            <Todos />
        </SideEffectProvider>
    </div>
));
