// @flow

import React from 'react';
import { storiesOf } from '@storybook/react';
import createStatefulComponent, {
    update,
    SideEffectProvider
} from '../packages/react-stateful-component/src';

const outsideClickSubscription = (reduce, refs) => {
    const handler = (e: Event) => {
        if (!refs.container) return;
        if (!(e.target instanceof HTMLElement)) return;

        if (e.target !== refs.container && !refs.container.contains(e.target)) {
            reduce({ type: 'CLICK_OUTSIDE' });
        }
    };

    document.addEventListener('click', handler);

    return () => document.removeEventListener('click', handler);
};

const Dropdown = createStatefulComponent(() => ({
    initialState: () => ({
        isVisible: false
    }),
    subscriptions: [outsideClickSubscription],
    reducer: (state, action) => {
        switch (action.type) {
            case 'TOGGLE':
                return update.state({ isVisible: !state.isVisible });
            case 'CLICK_OUTSIDE':
                return update.state({ isVisible: false });
            default:
                return update.nothing();
        }
    },
    render: ({ state: { isVisible }, reduce, refs }) => (
        <div ref={ref => (refs.container = ref)}>
            <button onClick={() => reduce({ type: 'TOGGLE' })}>Toggle</button>
            {isVisible ? (
                <div style={{ position: 'relative' }}>
                    <div
                        style={{
                            position: 'absolute',
                            backgroundColor: '#ccc',
                            padding: 10,
                            width: 200
                        }}
                    >
                        content
                    </div>
                </div>
            ) : null}
        </div>
    )
}));

storiesOf('Refs', module).add('Basic', () => (
    <div>
        <SideEffectProvider>
            <Dropdown />
        </SideEffectProvider>
    </div>
));
