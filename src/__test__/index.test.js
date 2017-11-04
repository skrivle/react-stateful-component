// @flow

import React from 'react';
import ReactDOM from 'react-dom';
import { configure, shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import createStateFulComponent from '../index';

configure({ adapter: new Adapter() });

describe('createStateFulComponent', () => {
    it('it should create a stateful component without errors', () => {
        const MyStateFulComponent = createStateFulComponent(() => ({
            initialState: () => ({}),
            reducer: state => state,
            render: () => <div />
        }));

        const div = document.createElement('div');

        ReactDOM.render(<MyStateFulComponent />, div);
    });

    describe('initialState', () => {
        it('it should set the initialState', () => {
            const MyStateFulComponent = createStateFulComponent(() => ({
                initialState: () => ({ counter: 10 }),
                reducer: state => state,
                render: ({ state }) => <div>{state.counter}</div>
            }));

            const wrapper = shallow(<MyStateFulComponent />);

            expect(wrapper.find('div').text()).toBe('10');
        });

        it('it should take props into account', () => {
            const MyStateFulComponent = createStateFulComponent(() => ({
                initialState: props => ({ counter: props.counter }),
                reducer: state => state,
                render: ({ state }) => <div>{state.counter}</div>
            }));

            const wrapper = shallow(<MyStateFulComponent counter={20} />);

            expect(wrapper.find('div').text()).toBe('20');
        });
    });

    describe('render', () => {
        it('should take props into account', () => {
            const MyStateFulComponent = createStateFulComponent(() => ({
                initialState: () => ({ counter: 0 }),
                reducer: state => state,
                render: ({ props }) => <div>{props.message}</div>
            }));

            const wrapper = shallow(<MyStateFulComponent message={'Hello World'} />);

            expect(wrapper.find('div').text()).toBe('Hello World');
        });
    });

    describe('reducer', () => {
        it('should update the state', () => {
            const MyStateFulComponent = createStateFulComponent(() => ({
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
                render: ({ state, reduce }) => (
                    <div>
                        <button className="add" onClick={() => reduce({ type: 'ADD' })}>
                            add
                        </button>
                        <button className="subtract" onClick={() => reduce({ type: 'SUBTRACT' })}>
                            subtract
                        </button>
                        <div className="counter">{state.counter}</div>
                    </div>
                )
            }));

            const wrapper = shallow(<MyStateFulComponent />);

            expect(wrapper.find('.counter').text()).toBe('0');

            wrapper.find('.add').simulate('click');

            expect(wrapper.find('.counter').text()).toBe('1');

            wrapper.find('.subtract').simulate('click');

            expect(wrapper.find('.counter').text()).toBe('0');
        });
    });
});
