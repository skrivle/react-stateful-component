// @flow

import React, { type Node } from 'react';
import { context, type SideEffectWrapper, type Reduce, type Refs } from 'react-stateful-component';

export type Props = {
    mockRunner?: (
        sideEffectWrapper: SideEffectWrapper<*, *>,
        reduce: Reduce<*>,
        state: *,
        refs: Refs
    ) => void,
    children: Node
};

export const MockSideEffectProvider = ({ children, mockRunner = () => {} }: Props) => (
    <context.Provider value={mockRunner}>{children}</context.Provider>
);

export default MockSideEffectProvider;
