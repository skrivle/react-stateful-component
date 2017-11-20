import ReactDOM from 'react-dom';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { SIDE_EFFECT_RUNNER_CONTEXT_KEY } from 'react-stateful-component';
import { MockSideEffectProvider } from '../index';

describe('MockSideEffectProvider', () => {
    it('Should be able to intercept sideEffects', () => {
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

        const sideEffect = jest.fn();
        const mockSideEffect = jest.fn();

        const mockSideEffectRunner = (sideEffectToRun, reduce) => {
            if (sideEffectToRun === sideEffect) {
                mockSideEffect(reduce);
            }
        };

        const div = document.createElement('div');

        ReactDOM.render(
            <MockSideEffectProvider mockRunner={mockSideEffectRunner}>
                <MockComponent />
            </MockSideEffectProvider>,
            div
        );

        runSideEffect(sideEffect);

        expect(sideEffect).not.toHaveBeenCalled();
        expect(mockSideEffect).toHaveBeenCalled();
    });
});
