// @flow

import React from 'react';
import ReactDOM from 'react-dom';
import { shallow, mount } from 'enzyme';
import createStatefulComponent from '../index';

describe('createStatefulComponent', () => {
    it('it should create a stateful component without errors', () => {
        const MyStateFulComponent = createStatefulComponent(() => ({
            initialState: () => ({}),
            reducer: state => state,
            render: () => <div />
        }));

        const div = document.createElement('div');

        ReactDOM.render(<MyStateFulComponent />, div);
    });

    describe('initialState', () => {
        it('it should set the initialState', () => {
            const MyStateFulComponent = createStatefulComponent(() => ({
                initialState: () => ({ counter: 10 }),
                reducer: state => state,
                render: ({ state }) => <div>{state.counter}</div>
            }));

            const wrapper = shallow(<MyStateFulComponent />);

            expect(wrapper.find('div')).toHaveText('10');
        });

        it('it should take props into account', () => {
            const MyStateFulComponent = createStatefulComponent(() => ({
                initialState: props => ({ counter: props.counter }),
                reducer: state => state,
                render: ({ state }) => <div>{state.counter}</div>
            }));

            const wrapper = shallow(<MyStateFulComponent counter={20} />);

            expect(wrapper.find('div')).toHaveText('20');
        });
    });

    describe('render', () => {
        it('should take props into account', () => {
            const MyStateFulComponent = createStatefulComponent(() => ({
                initialState: () => ({ counter: 0 }),
                reducer: state => state,
                render: ({ props }) => <div>{props.message}</div>
            }));

            const wrapper = shallow(<MyStateFulComponent message={'Hello World'} />);

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
                            return { counter: counter + 1 };
                        case 'SUBTRACT':
                            return { counter: counter - 1 };
                        default:
                            return state;
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

            const wrapper = shallow(<MyStateFulComponent />);

            expect(wrapper.find('.counter')).toHaveText('0');

            wrapper.find('.add').simulate('click');

            expect(wrapper.find('.counter')).toHaveText('1');

            wrapper.find('.subtract').simulate('click');

            expect(wrapper.find('.counter')).toHaveText('0');
        });
    });

    describe('didMount', () => {
        it('should be called on mount', () => {
            const didMount = jest.fn();

            const MyStateFulComponent = createStatefulComponent(() => ({
                initialState: () => ({}),
                reducer: state => state,
                render: () => <div />,
                didMount
            }));

            shallow(<MyStateFulComponent />);

            expect(didMount).toHaveBeenCalledTimes(1);
        });

        it('should have access to reduce', done => {
            const MyStateFulComponent = createStatefulComponent(() => ({
                initialState: () => ({ counter: 0 }),
                reducer: state => state,
                render: () => <div />,
                didMount: ({ reduce }) => {
                    expect(reduce).toBeDefined();
                    done();
                }
            }));

            shallow(<MyStateFulComponent />);
        });
    });

    describe('unMount', () => {
        it('should be called on unmount', () => {
            const willUnmount = jest.fn();

            const MyStateFulComponent = createStatefulComponent(() => ({
                initialState: () => ({}),
                reducer: state => state,
                render: () => <div />,
                willUnmount
            }));

            const wrapper = shallow(<MyStateFulComponent />);

            wrapper.unmount();

            expect(willUnmount).toHaveBeenCalledTimes(1);
        });
    });

    describe('willReceiveProps', () => {
        it('should be called when the component receives new props', () => {
            const willReceiveProps = jest.fn();

            const MyStateFulComponent = createStatefulComponent(() => ({
                initialState: () => ({}),
                reducer: state => state,
                render: () => <div />,
                willReceiveProps
            }));

            const wrapper = shallow(<MyStateFulComponent />);

            wrapper.setProps({ value: 'new value' });

            expect(willReceiveProps).toHaveBeenCalledTimes(1);
        });

        it('should have access to nextProps and self', done => {
            const MyStateFulComponent = createStatefulComponent(() => ({
                initialState: props => ({
                    value: props.value
                }),
                reducer: state => state,
                render: () => <div />,
                willReceiveProps: (nextProps, { state, props, reduce }) => {
                    expect(nextProps.value).toBe('new value');

                    expect(state).toBeDefined();
                    expect(props).toBeDefined();
                    expect(reduce).toBeDefined();

                    done();
                }
            }));

            const wrapper = shallow(<MyStateFulComponent value="initial" />);

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
                reducer: (state, action) => ({ value: action.value }),
                render: ({ state: { value }, reduce }) => (
                    <div>
                        <button className="update" onClick={() => reduce(setValue('new value'))} />
                        <div className="value">{value}</div>
                    </div>
                ),
                didUpdate: (oldSelf, { state, props, reduce }) => {
                    expect(oldSelf.state).toEqual({ value: 'initial' });
                    expect(oldSelf.props).toEqual({ myProp: 'test' });

                    expect(state).toEqual({ value: 'new value' });
                    expect(props).toEqual({ myProp: 'test' });
                    expect(reduce).toBeDefined();

                    done();
                }
            }));

            const wrapper = mount(<MyStateFulComponent myProp="test" />);

            expect(wrapper.find('.value')).toHaveText('initial');

            wrapper.find('.update').simulate('click');
        });
    });
});
