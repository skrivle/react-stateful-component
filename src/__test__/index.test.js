// @flow

import React from 'react';
import ReactDOM from 'react-dom';
import { shallow, mount } from 'enzyme';
import createStatefulComponent, { update, getChildContext, SideEffectProvider } from '../index';

const context = getChildContext();

describe('createStatefulComponent', () => {
    it('it should create a stateful component without errors', () => {
        const MyStateFulComponent = createStatefulComponent(() => ({
            initialState: () => ({}),
            reducer: state => update(state),
            render: () => <div />
        }));

        const div = document.createElement('div');

        ReactDOM.render(
            <SideEffectProvider>
                <MyStateFulComponent />
            </SideEffectProvider>,
            div
        );
    });

    describe('initialState', () => {
        it('it should set the initialState', () => {
            const MyStateFulComponent = createStatefulComponent(() => ({
                initialState: () => ({ counter: 10 }),
                reducer: state => update(state),
                render: ({ state }) => <div>{state.counter}</div>
            }));

            const wrapper = shallow(<MyStateFulComponent />, { context });

            expect(wrapper.find('div')).toHaveText('10');
        });

        it('it should take props into account', () => {
            const MyStateFulComponent = createStatefulComponent(() => ({
                initialState: props => ({ counter: props.counter }),
                reducer: state => update(state),
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
                reducer: state => update(state),
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
                            return update({ counter: counter + 1 });
                        case 'SUBTRACT':
                            return update({ counter: counter - 1 });
                        default:
                            return update(state);
                    }
                },
                render: ({ state: { counter }, reduce }) => (
                    <div>
                        <button className="add" onClick={() => reduce({ type: 'ADD' })}>
                            add
                        </button>
                        <button className="subtract" onClick={() => reduce({ type: 'SUBTRACT' })}>
                            subtract
                        </button>
                        <div className="counter">{counter}</div>
                    </div>
                )
            }));

            const wrapper = shallow(<MyStateFulComponent />, { context });

            expect(wrapper.find('.counter')).toHaveText('0');

            wrapper.find('.add').simulate('click');

            expect(wrapper.find('.counter')).toHaveText('1');

            wrapper.find('.subtract').simulate('click');

            expect(wrapper.find('.counter')).toHaveText('0');
        });
    });

    describe('didMount', () => {
        it('should have access to self', done => {
            const MyStateFulComponent = createStatefulComponent(() => ({
                initialState: () => ({}),
                reducer: state => update(state),
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
        it('should have access to self', done => {
            const MyStateFulComponent = createStatefulComponent(() => ({
                initialState: () => ({}),
                reducer: state => update(state),
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
        it('should have access to nextProps and self', done => {
            const MyStateFulComponent = createStatefulComponent(() => ({
                initialState: props => ({
                    value: props.value
                }),
                reducer: state => update(state),
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
                reducer: (state, action) => update({ value: action.value }),
                render: ({ state: { value }, reduce }) => (
                    <div>
                        <button className="update" onClick={() => reduce(setValue('new value'))} />
                        <div className="value">{value}</div>
                    </div>
                ),
                didUpdate: (prevSelf, { state, props, reduce }) => {
                    expect(prevSelf.state).toEqual({ value: 'initial' });
                    expect(prevSelf.props).toEqual({ myProp: 'test' });

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
                reducer: (state, action) => update({ value: action.value }),
                render: ({ state: { value }, reduce }) => (
                    <div>
                        <button className="update" onClick={() => reduce(setValue('new value'))} />
                        <div className="value">{value}</div>
                    </div>
                ),
                willUpdate: (nextSelf, { state, props, reduce }) => {
                    expect(nextSelf.state).toEqual({ value: 'new value' });
                    expect(nextSelf.props).toEqual({ myProp: 'test' });

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
                reducer: state => update(state),
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
                reducer: (state, action) => update({ value: action.value }),
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

        it('should have access to nextSelf and self when props are updated', done => {
            const MyStateFulComponent = createStatefulComponent(() => ({
                initialState: () => ({}),
                reducer: state => update(state),
                render: ({ props: { value } }) => <div className="value">{value}</div>,
                shouldUpdate: (nextSelf, { state, props, reduce }) => {
                    expect(nextSelf.state).toBeDefined();
                    expect(nextSelf.props).toEqual({ value: 'new value' });

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

        it('should have access to nextSelf and self when the state is updated', done => {
            const setValue = value => ({
                type: 'SET_VALUE',
                value
            });

            const MyStateFulComponent = createStatefulComponent(() => ({
                initialState: () => ({ value: 'initial' }),
                reducer: (state, action) => update({ value: action.value }),
                render: ({ state: { value }, reduce }) => (
                    <div>
                        <button className="update" onClick={() => reduce(setValue('new value'))} />
                        <div className="value">{value}</div>
                    </div>
                ),
                shouldUpdate: (nextSelf, { state, props, reduce }) => {
                    expect(nextSelf.state).toEqual({ value: 'new value' });
                    expect(nextSelf.props).toBeDefined();

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
});
