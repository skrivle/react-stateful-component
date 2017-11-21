# React Stateful Component

**warning**: This is work in progress, api's might still change.

React Stateful Component provides tools to create stateful React components using just functions.

features;
- Uses a reducer to manage state
- The reducer can schedule side effects following the same pattern as Elm and Reason-React
- Side effects are run outside of the component, meaning you can test your components without having to execute side effects
- Supports React lifeCycle hooks and instance variables
- Static type checking with flow-type

## Getting started

Install React Stateful Component using npm:

`npm i react-stateful-component --save`

Import React Stateful Component into your project:

```javascript
import createStatefulComponent, {update} from 'react-stateful-component';
```
Next, write your component:

```javascript
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
                return update.state({ counter: counter + 1 });
            case 'SUBTRACT':
                return update.state({ counter: counter - 1 });
            default:
                return update.nothing();
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
```

Wrap the component in a SideEffectProvider in order to use it:

```javascript
ReactDOM.render(
    <SideEffectProvider>
        <Counter />
    </SideEffectProvider>,
    document.getElementById('app')
)
```
