# React Stateful Component

**warning**: This is work in progress, api's might still change.

React Stateful Component provides tools to create stateful React components using just functions.

Features:

* Uses a reducer to manage state
* The reducer can schedule side effects following the same pattern as Elm and Reason-React
* Side effects are run outside of the component, meaning you can test your components without having
  to execute side effects
* Supports React lifeCycle hooks and instance variables
* Static type checking with flow type

#### > [TodoMVC example](https://github.com/vejersele/react-stateful-component-todo)

## Getting started

Install React Stateful Component using npm:

`npm i react-stateful-component --save`

Import React Stateful Component into your project:

```javascript
import createStatefulComponent, { update } from 'react-stateful-component';
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
import { SideEffectProvider } from 'react-stateful-component';
import Counter from './counter';

ReactDOM.render(
    <SideEffectProvider>
        <Counter />
    </SideEffectProvider>,
    document.getElementById('app')
);
```

## Creating a component

### Component definition

A component definition is a function that returns an object describing your component. The most
basic component definition would look something like this:

```javascript
const myComponentDefinition = () => ({
    initialState: () => ({ counter: 0 }),
    reducer: state => update.nothing(),
    render: ({ state }) => <div>{state.counter}</div>
});
```

A component definition should define at least an initialState, reducer, and render function. At
first sight this might look pretty similar to defining a class based component. There is an
important difference though. All of these functions can be run in isolation because they can not use
`this` and their output is based in their input parameters.

Once you have your component definition, you can use the `createStatefulComponent` function to
actually create the Component.

```javascript
import createStatefulComponent, { update, SideEffectProvider } from 'react-stateful-component';

const myComponentDefinition = () => ({
    initialState: () => ({ counter: 0 }),
    reducer: state => update.nothing(),
    render: ({ state }) => <div>{state.counter}</div>
});

const MyComponent = createStatefulComponent(myComponentDefinition);

ReactDOM.render(
    <SideEffectProvider>
        <MyComponent />
    </SideEffectProvider>,
    document.getElementById('app')
);
```

## Managing state with a reducer

React Stateful Component uses a reducer to manage the component's state. Since all state updates
happen in one place, it'll be easier to understand the state of the component, compared to having
setState calls spread across multiple methods.

Because the reducer is just a function, it can be extracted and unit tested separately. For example
you could put your reducer into a separate file, if your component has a lot of state interactions,
that might be a good approach. With smaller components you might want to keep the reducer in the
same file but export it separately.

```javascript
import { update } from 'react-stateful-component';

export const myReducer = (state, action) => {
    switch (action.type) {
        case 'ADD':
            return update.state({ counter: state.counter + 1 });
        case 'SUBTRACT':
            return update.state({ counter: state.counter - 1 });
        default:
            return update.nothing();
    }
};

const myComponentDefinition = () => ({
    initialState: () => ({ counter: 0 }),
    reducer,
    render: ({ state }) => <div>{state.counter}</div>
});

export default createStatefulComponent(myComponentDefinition);
```

Just like in Redux the reducer works with State and Actions. However, you might have noticed a
difference between a Redux reducer and the reducers used in the examples above. The reducers in
these examples aren't just returning state. Instead they are return an `Update<S, A>`. The next
section will explain these updates in more detail.

## Update types

Since the reducer is not only responsible for updating the state but can also schedule side effects,
only returning the state from the reducer wouldn't be really useful. Instead we will return an
`Update<S, A>`. You should look at an Update as an instruction for the component. It can either
update the state, schedule a side effect, do both or instruct the component to just do nothing.

Example:

```javascript
import { update } from 'react-stateful-component';

const myReducer = (state, action) => {
    switch (action.type) {
        case 'ADD':
            return update.state({ counter: state.counter + 1 });
        case 'SUBTRACT':
            return update.state({ counter: state.counter - 1 });
        default:
            return update.nothing();
    }
};
```

### update.state(state)

`<S>(state: S) => UpdateState<S>`

### update.sideEffect(sideEffect)

`<A, S>(sideEffect: SideEffect<A, S>) => UpdateSideEffect<A, S>`

### update.stateAndSideEffect(state, sideEffect)

`<S, A>(state: S, sideEffect: SideEffect<A, S>) => UpdateStateAndSideEffect<S, A>`

### update.nothing()

`() => UpdateNothing`

## Render

The render function that is part of the definition works almost the same as a stateless React
component. It will receive an object with the properties reduce, state and props as an input
parameter.

The type signature of the render function:

`<S, P, A>(me: {reduce: Reduce<A>, state: S, props: P}) => React.Node`

### Rendering state and properties

```javascript
const render = ({ state, props }) => (
    <div>
        <div>{props.name}</div>
        <div>{state.counter}</div>
    </div>
);
```

### Triggering state changes

To trigger a state change you will need to call `reduce()` with an action, this will cause the
components reducer to be invoked with the specified action. Your reducer can then calculate the new
state which will cause the component the re-render with the new state.

```javascript
const render = ({ state, reduce }) => (
    <div>
        <button onClick={() => reduce({ type: 'ADD' })} />
        <div>{state.counter}</div>
        <button onClick={() => reduce({ type: 'SUBTRACT' })} />
    </div>
);
```

## Working with side effects

In order to keep a component clean and testable we try to push everything that isn't directly
related to reducing actions outside of the component. This can be done by using side effects.

Side effects are functions that have access to `reduce()`. This means they can reduce actions and by
doing so trigger state changes within the component.

For example, a side effect can be used for async tasks like fetching data from an api or to start
timers, but also to read from or write to localStorage.

The type signature of a side effect looks like this:

```javascript
type SideEffect<A, S> = (reduce: Reduce<A>, state: S) => any;
```

All side effects are executed outside of the component, a reducer will only schedule a side effect,
it will not execute it. This enables us to unit test component without having to worry about side
effects.

Example of a side effect function:

```javascript
const fetchUsersReceived = users => ({
    type: 'FETCH_USERS_RECEIVED',
    users
});

const fetchUserFailed = err => ({
    type: 'FETCH_USERS_FAILED',
    err
});

const mySideEffect = reduce =>
    fetch('http://myapp.com/api/users')
        .then(user => {
            reduce(fetchUsersReceived(users));
            return users;
        })
        .catch(err => {
            reduce(fetchUserFailed(err));
        });
```

Side effects can be scheduled from within the reducer using either `update.sideEffect(sideEffect)`
or `update.stateAndSideEffect(state, sideEffect)`. The first update type will only schedule a side
effect, while you can use the second one to both update the state and then schedule a side effect.

Example of a reducer scheduling a side effect:

```javascript
const myReducer = (state, action) => {
    switch (action.type) {
        case 'FETCH_USERS':
            return update.stateAndSideEffect(
                { ...state, isPending: true },
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
};
```

## API

A component definition has a required and optional properties. `initialState`, `reducer` and
`render` are required. Just like class based components a definition can specify certain lifeCycle
hooks. All standard React lifecycle hooks are available except for `willMount`. Please note
lifecycle hooks are **not** prefixed with "component", so instead of `componentDidMount` you can
just use `didMount`.

### Me

Almost all of the functions that are part of the definition (except for initialState and the
reducer) will receive object of the type `Me<P, S, A, V>` as parameter. This object contains data
and functions to work with the component. It contains the state, props, vars and the reduce
function.

```javascript
type Me<P, S, A, V> = {
    state: S,
    props: P,
    reduce: Reduce<A>,
    vars: V
};
```

A component definition can have the following properties defined:

### initialState

`<S, P>(props: P) => S`

### reducer

`<S, A>(state: S, action: A) => Update<S, A>`

### render

`<S, P, A, V>(me: Me<P, S, A, V>) => React.Node`

### displayName (optional)

`string`

### didMount (optional)

`<S, P, A, V>(me: Me<P, S, A, V>) => void`

### willUnmount (optional)

`<S, P, A, V>(me: Me<P, S, A, V>) => void`

### willReceiveProps (optional)

`<S, P, A, V>(nextProps: P, me: Me<P, S, A, V>) => void`

### willUpdate (optional)

`<S, P, A, V>(nextMe: { state: S, props: P }, me: Me<P, S, A, V>) => void`

### didUpdate (optional)

`<S, P, A, V>(prevMe: { state: S, props: P }, me: Me<P, S, A, V>) => void`

### shouldUpdate

`<S, P, A, V>(nextMe: { state: S, props: P }, me: Me<P, S, A, V>) => boolean`

## Instance variables

[TODO]
