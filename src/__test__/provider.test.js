// @flow

import React from 'react';
import { mount } from 'enzyme';
import createStatefulComponent, { update, SideEffectProvider } from '../index';

jest.useFakeTimers();

describe('Provider', () => {
    it('it should render a stateful component without errors', () => {
        const MyStateFulComponent = createStatefulComponent(() => ({
            initialState: () => ({}),
            reducer: state => update(state),
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
                        return update(state, sideEffect);
                    case 'FINISH':
                        return update({ content: 'done' });
                    default:
                        return update(state);
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
});
