# React Stateful Component

**warning**: This is work in progress, api's might still change.

React Stateful Component provides tools to create stateful React components using just functions.

Features:
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

## Managing state

React Stateful Component uses a reducer to manage the component's state. Since all state updates
happen in one place, it'll help you understand the state of the component. Because the reducer
is just a function, it can easily be extracted and unit tested separately.

Just like in Redux the reducer works with State and Actions, the only difference is the return type
of the reducer.

## Update types
Since the reducer is not only responsible for updating the state but can also schedule side effects,
only returning the state from the reducer wouldn't be really useful. Instead we will return an
`Update<S, A>`. You should look at an Update as an instruction for the component. It can either update
the state, schedule a side effect, do both or instruct the component to just do nothing.

Example:
```javascript
import {update} from 'react-stateful-component';

const myReducer = (state, action) => {
    switch(action.type) {
        case 'ADD':
            return update.state({counter: state.counter + 1});
        case 'SUBTRACT':
            return update.state({counter: state.counter - 1});
        default:
            update.nothing();
    }
}
```

### update.state(state)
`<S>(state: S): UpdateState<S>`

### update.sideEffect(sideEffect)
`<A>(sideEffect: SideEffect<A>): UpdateSideEffect<A>`

### update.stateAndSideEffect(state, sideEffect)
`<S, A>(state: S, sideEffect: SideEffect<A>): UpdateStateAndSideEffect<S, A>`

### update.nothing()
`(): UpdateNothing`
