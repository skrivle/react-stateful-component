import React, { Component } from 'react';
import { mount } from 'enzyme';
import PropTypes from 'prop-types';
import { SIDE_EFFECT_RUNNER_CONTEXT_KEY } from 'react-stateful-component';
import { MockSideEffectProvider } from '../index';

describe('MockSideEffectProvider', () => {
    let runSideEffect;

    class MockComponent extends Component {
        static contextTypes = { [SIDE_EFFECT_RUNNER_CONTEXT_KEY]: PropTypes.func.isRequired };
        constructor(props, context) {
            super(props);
            runSideEffect = context[SIDE_EFFECT_RUNNER_CONTEXT_KEY];
        }
        render() {
            return <div />;
        }
    }

    it('Should not throw any errors', () => {
        mount(
            <MockSideEffectProvider>
                <MockComponent />
            </MockSideEffectProvider>
        );
    });

    it('Should be able to intercept sideEffects', () => {
        const sideEffect = jest.fn();
        const mockSideEffect = jest.fn();

        const mockSideEffectRunner = (sideEffectToRun, reduce) => {
            if (sideEffectToRun === sideEffect) {
                mockSideEffect(reduce);
            }
        };

        mount(
            <MockSideEffectProvider mockRunner={mockSideEffectRunner}>
                <MockComponent />
            </MockSideEffectProvider>
        );

        runSideEffect(sideEffect);

        expect(sideEffect).not.toHaveBeenCalled();
        expect(mockSideEffect).toHaveBeenCalled();
    });

    it('Should have access to the state within the sideEffect', done => {
        const mySideEffect = jest.fn();
        const reduce = jest.fn();
        const myState = { content: 'initial' };

        const mockSideEffectRunner = (sideEffectToRun, reduce, state) => {
            expect(state).toEqual(myState);
            done();
        };

        mount(
            <MockSideEffectProvider mockRunner={mockSideEffectRunner}>
                <MockComponent />
            </MockSideEffectProvider>
        );

        runSideEffect(mySideEffect, reduce, myState);
    });
});
