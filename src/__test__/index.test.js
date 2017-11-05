// @flow

import React from 'react';
import ReactDOM from 'react-dom';
import { shallow } from 'enzyme';
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
        it('should update the state', () => {
            const MyStateFulComponent = createStatefulComponent(() => ({
                initialState: props => ({
                    value: props.value
                }),
                reducer: state => state,
                render: ({ state: { value } }) => <div>{value}</div>,
                willReceiveProps: (nextProps, { state }) => {
                    if (nextProps.value === state.value) return state;
                    return {
                        value: nextProps.value
                    };
                }
            }));

            const wrapper = shallow(<MyStateFulComponent value="initial" />);

            expect(wrapper.find('div')).toHaveText('initial');

            wrapper.setProps({ value: 'new value' });

            expect(wrapper.find('div')).toHaveText('new value');
        });
    });
});
