# React Stateful Component

**warning**: This is work in progress, api's might still change.

React Stateful Component provides tools to create stateful React components using just functions.

Features:
- Uses a reducer to manage state
- The reducer can schedule side effects following the same pattern as Elm and Reason-React
- Side effects are run outside of the component, meaning you can test your components without having to execute side effects
- Supports React lifeCycle hooks and instance variables
- Static type checking with flow type

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
import {SideEffectProvider} from 'react-stateful-component';
import Counter from './counter';

ReactDOM.render(
    <SideEffectProvider>
        <Counter />
    </SideEffectProvider>,
    document.getElementById('app')
)
```

## Managing state

React Stateful Component uses a reducer to manage the component's state. Since all state updates
happen in one place, it'll be easier to understand the state of the component, compared to having setState calls spread across multiple methods.

Because the reducer is just a function, it can be extracted and unit tested separately.

Just like in Redux the reducer works with State and Actions, the only difference is the return type of the reducer.

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
            return update.nothing();
    }
}
```

### update.state(state)
`<S>(state: S) => UpdateState<S>`

### update.sideEffect(sideEffect)
`<A>(sideEffect: SideEffect<A>) => UpdateSideEffect<A>`

### update.stateAndSideEffect(state, sideEffect)
`<S, A>(state: S, sideEffect: SideEffect<A>) => UpdateStateAndSideEffect<S, A>`

### update.nothing()
`() => UpdateNothing`


## Working with side effects

In order to keep a component clean and testable we try to push everything that isn't directly related to reducing actions outside of the component. This can be done by using side effects.

Side effects are functions that have access to `reduce()`. This means they can reduce actions and by doing so trigger state changes within the component.

For example, a side effect can be used for async tasks like fetching data from an api or to start timers, but also to read from or write to localStorage.

The type signature of a side effect looks like this:
```javascript
type SideEffect<A> = (reduce: Reduce<A>) => any;
```

All side effects are executed outside of the component, a reducer will only schedule a side effect, it will not execute it. This enables us to unit test component without having to worry about side effects.

Example of a side effect function:
```javascript
const fetchUsersReceived = (users) => ({
    type: 'FETCH_USERS_RECEIVED',
    users
});

const fetchUserFailed = (err) => ({
    type: 'FETCH_USERS_FAILED',
    err
})

const mySideEffect = (reduce) =>
    fetch('http://myapp.com/api/users')
        .then((user) => {
            reduce(fetchUsersReceived(users));
            return users;
        })
        .catch((err) => {
            reduce(fetchUserFailed(err));
        });
```

Side effects can be scheduled from within the reducer using either `update.sideEffect(sideEffect)` or `update.stateAndSideEffect(state, sideEffect)`. The first update type will only schedule a side effect, while you can use the second one to both update the state and then schedule a side effect.

Example of a reducer scheduling a side effect:

```javascript
const myReducer = (state, action) => {
    switch(action.type) {
        case 'FETCH_USERS':
            return update.stateAndSideEffect(
                {...state, isPending: true},
                fetchUsers // Note that we only pass the sideEffect, and not execute it here
            );
        case 'FETCH_USERS_RECEIVED':
            return update.state({
                ...state,
                isPending: false,
                users: action.users
            });
        default:
            return update.nothing();
    }
}
```

## Lifecycle hooks

[TODO]

## Instance variables

[TODO]
