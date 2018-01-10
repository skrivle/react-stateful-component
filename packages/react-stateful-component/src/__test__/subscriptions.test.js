import React from 'react';
import { mount } from 'enzyme';
import createStatefulComponent, { update, SideEffectProvider } from '../index';

describe('Subscriptions', () => {
    it('should initialize the subscription on componentDidMount', done => {
        let reduceFn;
        let componentRefs;

        const mySubscription = (reduce, refs) => {
            expect(reduce).toEqual(reduceFn);
            expect(refs).toEqual(componentRefs);
            done();
            return () => {};
        };

        const MyStateFulComponent = createStatefulComponent(() => ({
            displayName: 'MyComponent',
            subscriptions: [mySubscription],
            initialState: () => ({}),
            reducer: () => update.nothing(),
            render: ({ reduce, refs }) => {
                reduceFn = reduce;
                componentRefs = refs;
                return <div />;
            }
        }));

        mount(
            <SideEffectProvider>
                <MyStateFulComponent />
            </SideEffectProvider>
        );
    });

    it('should release the subscription on willUnmount', () => {
        const releaseSubscription = jest.fn();

        const mySubscription = () => releaseSubscription;

        const MyStateFulComponent = createStatefulComponent(() => ({
            displayName: 'MyComponent',
            subscriptions: [mySubscription],
            initialState: () => ({}),
            reducer: () => update.nothing(),
            render: () => <div />
        }));

        const wrapper = mount(
            <SideEffectProvider>
                <MyStateFulComponent />
            </SideEffectProvider>
        );
        wrapper.unmount();

        expect(releaseSubscription).toHaveBeenCalledTimes(1);
    });
});
