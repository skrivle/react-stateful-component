import React from 'react';
import { mount } from 'enzyme';
import createComponent, { update } from '../index';

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

        const MyStateFulComponent = createComponent(() => ({
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

        mount(<MyStateFulComponent />);
    });

    it('should release the subscription on willUnmount', () => {
        const releaseSubscription = jest.fn();

        const mySubscription = () => releaseSubscription;

        const MyStateFulComponent = createComponent(() => ({
            displayName: 'MyComponent',
            subscriptions: [mySubscription],
            initialState: () => ({}),
            reducer: () => update.nothing(),
            render: () => <div />
        }));

        const wrapper = mount(<MyStateFulComponent />);
        wrapper.unmount();

        expect(releaseSubscription).toHaveBeenCalledTimes(1);
    });
});
