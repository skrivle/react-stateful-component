// @flow

import React from 'react';
import { mount } from 'enzyme';
import createStatefulComponent, { update, SideEffectProvider } from '../index';

jest.useFakeTimers();

describe('Provider', () => {
    it('it should render a stateful component without errors', () => {
        const MyStateFulComponent = createStatefulComponent(() => ({
            initialState: () => ({}),
            reducer: () => update.nothing(),
            render: () => <div />
        }));

        mount(
            <SideEffectProvider>
                <MyStateFulComponent />
            </SideEffectProvider>
        );
    });

    it('it should execute sideEffects while providing the sideEffect with access to reduce', () => {
        const sideEffect = reduce => {
            setTimeout(() => {
                reduce({ type: 'FINISH' });
            }, 1000);
        };

        const MyStateFulComponent = createStatefulComponent(() => ({
            initialState: () => ({
                content: 'initial'
            }),
            reducer: (state, action) => {
                switch (action.type) {
                    case 'START':
                        return update.stateAndSideEffect(state, sideEffect);
                    case 'FINISH':
                        return update.state({ content: 'done' });
                    default:
                        return update.nothing();
                }
            },
            render: ({ reduce, state }) => (
                <div>
                    <button onClick={() => reduce({ type: 'START' })}>Hit me!</button>
                    <div className="content">{state.content}</div>
                </div>
            )
        }));

        const wrapper = mount(
            <SideEffectProvider>
                <MyStateFulComponent />
            </SideEffectProvider>
        );

        wrapper.find('button').simulate('click');

        jest.runAllTimers();

        expect(wrapper.find('.content')).toHaveText('done');
    });

    it('should provide the state to the sideEffect function', done => {
        const sideEffect = (reduce, state) => {
            expect(state).toEqual({
                content: 'pending'
            });

            done();
        };

        const MyStateFulComponent = createStatefulComponent(() => ({
            initialState: () => ({
                content: 'initial'
            }),
            reducer: (state, action) => {
                switch (action.type) {
                    case 'START':
                        return update.stateAndSideEffect({ content: 'pending' }, sideEffect);
                    case 'FINISH':
                        return update.state({ content: 'done' });
                    default:
                        return update.nothing();
                }
            },
            render: ({ reduce, state }) => (
                <div>
                    <button onClick={() => reduce({ type: 'START' })}>Hit me!</button>
                    <div className="content">{state.content}</div>
                </div>
            )
        }));

        const wrapper = mount(
            <SideEffectProvider>
                <MyStateFulComponent />
            </SideEffectProvider>
        );

        wrapper.find('button').simulate('click');
    });
});
