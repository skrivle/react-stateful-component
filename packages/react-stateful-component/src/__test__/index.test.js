// @flow

import React from 'react';
import { shallow, mount } from 'enzyme';
import createStatefulComponent, { update, SIDE_EFFECT_RUNNER_CONTEXT_KEY } from '../index';

describe('createStatefulComponent', () => {
    let context;

    beforeEach(() => {
        context = {
            [SIDE_EFFECT_RUNNER_CONTEXT_KEY]: jest.fn()
        };
    });

    describe('initialState', () => {
        it('it should set the initialState', () => {
            const MyStateFulComponent = createStatefulComponent(() => ({
                initialState: () => ({ counter: 10 }),
                reducer: () => update.nothing(),
                render: ({ state }) => <div>{state.counter}</div>
            }));

            const wrapper = shallow(<MyStateFulComponent />, { context });

            expect(wrapper.find('div')).toHaveText('10');
        });

        it('it should take props into account', () => {
            const MyStateFulComponent = createStatefulComponent(() => ({
                initialState: props => ({ counter: props.counter }),
                reducer: () => update.nothing(),
                render: ({ state }) => <div>{state.counter}</div>
            }));

            const wrapper = shallow(<MyStateFulComponent counter={20} />, { context });

            expect(wrapper.find('div')).toHaveText('20');
        });
    });

    describe('render', () => {
        it('should take props into account', () => {
            const MyStateFulComponent = createStatefulComponent(() => ({
                initialState: () => ({ counter: 0 }),
                reducer: () => update.nothing(),
                render: ({ props }) => <div>{props.message}</div>
            }));

            const wrapper = shallow(<MyStateFulComponent message={'Hello World'} />, { context });

            expect(wrapper.find('div')).toHaveText('Hello World');
        });
    });

    describe('reducer', () => {
        it('should update the state', () => {
            const MyStateFulComponent = createStatefulComponent(() => ({
                initialState: () => ({ counter: 0 }),
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
                render: ({ reduce }) => (
                    <div>
                        <button className="add" onClick={() => reduce({ type: 'ADD' })}>
                            add
                        </button>
                        <button className="subtract" onClick={() => reduce({ type: 'SUBTRACT' })}>
                            subtract
                        </button>
                        <button className="nothing" onClick={() => reduce({ type: 'DO_NOTHING' })}>
                            nothing
                        </button>
                    </div>
                )
            }));

            const wrapper = shallow(<MyStateFulComponent />, { context });

            expect(wrapper.state()).toEqual({ counter: 0 });

            wrapper.find('.add').simulate('click');
            expect(wrapper.state()).toEqual({ counter: 1 });

            wrapper.find('.subtract').simulate('click');
            expect(wrapper.state()).toEqual({ counter: 0 });

            wrapper.find('.nothing').simulate('click');
            expect(wrapper.state()).toEqual({ counter: 0 });
        });

        it('should schedule sideEffects', () => {
            let reduceFn;
            let componentState;

            const sideEffect = () => {};

            const MyStateFulComponent = createStatefulComponent(() => ({
                initialState: () => ({}),
                reducer: (state, action) => {
                    switch (action.type) {
                        case 'TEST':
                            return update.sideEffect(sideEffect);
                        default:
                            return update.nothing();
                    }
                },
                render: ({ reduce, state }) => {
                    reduceFn = reduce;
                    componentState = state;

                    return (
                        <div>
                            <button onClick={() => reduce({ type: 'TEST' })}>click</button>
                        </div>
                    );
                }
            }));

            const wrapper = shallow(<MyStateFulComponent />, { context });

            wrapper.find('button').simulate('click');

            expect(context[SIDE_EFFECT_RUNNER_CONTEXT_KEY]).toBeCalledWith(
                sideEffect,
                reduceFn,
                componentState
            );
        });

        it('should update state and schedule sideEffects', () => {
            let reduceFn;
            let componentState;

            const sideEffect = () => {};

            const MyStateFulComponent = createStatefulComponent(() => ({
                initialState: () => ({ value: 'initial' }),
                reducer: (state, action) => {
                    switch (action.type) {
                        case 'TEST':
                            return update.stateAndSideEffect({ value: 'updated' }, sideEffect);
                        default:
                            return update.nothing();
                    }
                },
                render: ({ state, reduce }) => {
                    reduceFn = reduce;
                    componentState = state;
                    return (
                        <div>
                            <button onClick={() => reduce({ type: 'TEST' })}>click</button>
                            <div className="value">{state.value}</div>
                        </div>
                    );
                }
            }));

            const wrapper = shallow(<MyStateFulComponent />, { context });

            wrapper.find('button').simulate('click');

            expect(wrapper.state()).toEqual({ value: 'updated' });
            expect(context[SIDE_EFFECT_RUNNER_CONTEXT_KEY]).toBeCalledWith(
                sideEffect,
                reduceFn,
                componentState
            );
        });
    });

    describe('didMount', () => {
        it('should have access to Me', done => {
            const MyStateFulComponent = createStatefulComponent(() => ({
                initialState: () => ({}),
                reducer: () => update.nothing(),
                render: () => <div />,
                didMount: ({ state, props, reduce }) => {
                    expect(state).toBeDefined();
                    expect(props).toBeDefined();
                    expect(reduce).toBeDefined();
                    done();
                }
            }));

            shallow(<MyStateFulComponent />, { context });
        });
    });

    describe('unMount', () => {
        it('should have access to Me', done => {
            const MyStateFulComponent = createStatefulComponent(() => ({
                initialState: () => ({}),
                reducer: () => update.nothing(),
                render: () => <div />,
                willUnmount: ({ state, props, reduce }) => {
                    expect(state).toBeDefined();
                    expect(props).toBeDefined();
                    expect(reduce).toBeDefined();

                    done();
                }
            }));

            const wrapper = shallow(<MyStateFulComponent />, { context });

            wrapper.unmount();
        });
    });

    describe('willReceiveProps', () => {
        it('should have access to nextProps and Me', done => {
            const MyStateFulComponent = createStatefulComponent(() => ({
                initialState: props => ({
                    value: props.value
                }),
                reducer: () => update.nothing(),
                render: () => <div />,
                willReceiveProps: (nextProps, { state, props, reduce }) => {
                    expect(nextProps.value).toBe('new value');

                    expect(state).toBeDefined();
                    expect(props).toBeDefined();
                    expect(reduce).toBeDefined();

                    done();
                }
            }));

            const wrapper = shallow(<MyStateFulComponent value="initial" />, { context });

            wrapper.setProps({ value: 'new value' });
        });
    });

    describe('didUpdate', () => {
        it('should be called when the component has been updated', done => {
            const setValue = value => ({
                type: 'SET_VALUE',
                value
            });

            const MyStateFulComponent = createStatefulComponent(() => ({
                initialState: () => ({
                    value: 'initial'
                }),
                reducer: (state, action) => update.state({ value: action.value }),
                render: ({ state: { value }, reduce }) => (
                    <div>
                        <button className="update" onClick={() => reduce(setValue('new value'))} />
                        <div className="value">{value}</div>
                    </div>
                ),
                didUpdate: (prevMe, { state, props, reduce }) => {
                    expect(prevMe.state).toEqual({ value: 'initial' });
                    expect(prevMe.props).toEqual({ myProp: 'test' });

                    expect(state).toEqual({ value: 'new value' });
                    expect(props).toEqual({ myProp: 'test' });
                    expect(reduce).toBeDefined();

                    done();
                }
            }));

            const wrapper = mount(<MyStateFulComponent myProp="test" />, { context });

            expect(wrapper.find('.value')).toHaveText('initial');

            wrapper.find('.update').simulate('click');
        });
    });

    describe('willUpdate', () => {
        it('should be called before the component has been updated', done => {
            const setValue = value => ({
                type: 'SET_VALUE',
                value
            });

            const MyStateFulComponent = createStatefulComponent(() => ({
                initialState: () => ({
                    value: 'initial'
                }),
                reducer: (state, action) => update.state({ value: action.value }),
                render: ({ state: { value }, reduce }) => (
                    <div>
                        <button className="update" onClick={() => reduce(setValue('new value'))} />
                        <div className="value">{value}</div>
                    </div>
                ),
                willUpdate: (nextMe, { state, props, reduce }) => {
                    expect(nextMe.state).toEqual({ value: 'new value' });
                    expect(nextMe.props).toEqual({ myProp: 'test' });

                    expect(state).toEqual({ value: 'initial' });
                    expect(props).toEqual({ myProp: 'test' });
                    expect(reduce).toBeDefined();

                    done();
                }
            }));

            const wrapper = mount(<MyStateFulComponent myProp="test" />, { context });

            expect(wrapper.find('.value')).toHaveText('initial');

            wrapper.find('.update').simulate('click');
        });
    });

    describe('shouldUpdate', () => {
        it('should prevent the component from updating when new props are passed and shouldUpdate is returning false', () => {
            const MyStateFulComponent = createStatefulComponent(() => ({
                initialState: () => ({}),
                reducer: () => update.nothing(),
                render: ({ props: { value } }) => <div className="value">{value}</div>,
                shouldUpdate: () => false
            }));

            const wrapper = mount(<MyStateFulComponent value="initial" />, { context });

            expect(wrapper.find('.value')).toHaveText('initial');

            wrapper.setProps({
                value: 'new value'
            });

            expect(wrapper.find('.value')).toHaveText('initial');
        });

        it('should prevent the component from updating when the state is updated and shouldUpdate is returning false', () => {
            const setValue = value => ({
                type: 'SET_VALUE',
                value
            });

            const MyStateFulComponent = createStatefulComponent(() => ({
                initialState: () => ({ value: 'initial' }),
                reducer: (state, action) => update.state({ value: action.value }),
                render: ({ state: { value }, reduce }) => (
                    <div>
                        <button className="update" onClick={() => reduce(setValue('new value'))} />
                        <div className="value">{value}</div>
                    </div>
                ),
                shouldUpdate: () => false
            }));

            const wrapper = mount(<MyStateFulComponent />, { context });

            expect(wrapper.find('.value')).toHaveText('initial');

            wrapper.find('.update').simulate('click');

            expect(wrapper.find('.value')).toHaveText('initial');
        });

        it('should have access to nextMe and Me when props are updated', done => {
            const MyStateFulComponent = createStatefulComponent(() => ({
                initialState: () => ({}),
                reducer: () => update.nothing(),
                render: ({ props: { value } }) => <div className="value">{value}</div>,
                shouldUpdate: (nextMe, { state, props, reduce }) => {
                    expect(nextMe.state).toBeDefined();
                    expect(nextMe.props).toEqual({ value: 'new value' });

                    expect(state).toBeDefined();
                    expect(props).toEqual({ value: 'initial' });
                    expect(reduce).toBeDefined();

                    done();
                    return true;
                }
            }));

            const wrapper = mount(<MyStateFulComponent value="initial" />, { context });

            wrapper.setProps({
                value: 'new value'
            });
        });

        it('should have access to nextMe and Me when the state is updated', done => {
            const setValue = value => ({
                type: 'SET_VALUE',
                value
            });

            const MyStateFulComponent = createStatefulComponent(() => ({
                initialState: () => ({ value: 'initial' }),
                reducer: (state, action) => update.state({ value: action.value }),
                render: ({ state: { value }, reduce }) => (
                    <div>
                        <button className="update" onClick={() => reduce(setValue('new value'))} />
                        <div className="value">{value}</div>
                    </div>
                ),
                shouldUpdate: (nextMe, { state, props, reduce }) => {
                    expect(nextMe.state).toEqual({ value: 'new value' });
                    expect(nextMe.props).toBeDefined();

                    expect(state).toEqual({ value: 'initial' });
                    expect(props).toBeDefined();
                    expect(reduce).toBeDefined();

                    done();
                    return true;
                }
            }));

            const wrapper = mount(<MyStateFulComponent />, { context });

            expect(wrapper.find('.value')).toHaveText('initial');

            wrapper.find('.update').simulate('click');
        });
    });

    describe('displayName', () => {
        it('should set the displayName', () => {
            const MyStateFulComponent = createStatefulComponent(() => ({
                displayName: 'MyComponent',
                initialState: () => ({}),
                reducer: () => update.nothing(),
                render: () => <div />
            }));

            const wrapper = mount(<MyStateFulComponent />, { context });
            expect(wrapper.find('MyComponent').length).toEqual(1);
        });
    });
});
