# React Stateful Component

React Stateful Component provides tools to create stateful React components using just functions.

## Getting started

Install React Stateful Component using npm:

`npm i react-stateful-component --save`

Import React Stateful Component into your project:

```
import createStatefulComponent, {update} from 'react=stateful-component';
```
Next, write your component:

```
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
            <button onClick={() => reduce({type: 'ADD'}}>
                +
            </button>
            <span>{state.counter}</span>
            <button onClick={() => reduce({type: 'SUBTRACT'})}>
                -
            </button>
        </div>
    )
}));
```
