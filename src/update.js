// @flow

import type { SideEffect } from './types';

export type Update<S, A> = {
    state: S,
    sideEffect: ?SideEffect<A>
};

export default <S, A>(state: S, sideEffect: ?SideEffect<A> = null): Update<S, A> => ({
    state,
    sideEffect
});
