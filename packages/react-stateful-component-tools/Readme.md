# React Stateful Component tools

Testing tools for [React Stateful Component](https://github.com/vejersele/react-stateful-component)

## Getting started

`npm i react-stateful-component-tools --save-dev`


## MockSideEffectProvider

Can be used to intercept sideEffect schedule from within stateful components.

Basic Example:
```javascript
ReactDOM.render(
    <MockSideEffectProvider>
        <MyStatefulComponent />
    </MockSideEffectProvider>,
    document.getElementById('app')
)

```

Example using a mockRunner:
```javascript
const mockSideEffectRunner = (sideEffect, reduce) => {
    if (sideEffect === mySideEffect) {
        reduce({
            type: 'FETCH_USERS_RECEIVED',
            users: [
                {id: 1, name: 'John'},
                {id: 2, name: 'Jeff'}
            ]
        })
    }
};

ReactDOM.render(
    <MockSideEffectProvider mockRunner={mockSideEffectRunner}>
        <MockComponent />
    </MockSideEffectProvider>,
    document.getElementById('app')
);
```
