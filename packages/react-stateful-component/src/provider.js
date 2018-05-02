// @flow

import React, { type Node } from 'react';
import context, { runSideEffect } from './context';

const SideEffectProvider = ({ children }: { children: Node }) => (
    <context.Provider value={runSideEffect}>{children}</context.Provider>
);

export default SideEffectProvider;
