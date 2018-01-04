// @flow

import type { SideEffect } from './types';

export type UpdateState<S> = {
    type: 'UPDATE_STATE',
    state: S
};

export type UpdateSideEffect<A, S> = {
    type: 'UPDATE_SIDE_EFFECT',
    sideEffect: SideEffect<A, S>
};

export type UpdateStateAndSideEffect<S, A> = {
    type: 'UPDATE_STATE_AND_SIDE_EFFECT',
    state: S,
    sideEffect: SideEffect<A, S>
};

export type UpdateNothing = {
    type: 'UPDATE_NOTHING'
};

export type Update<S: {}, A> =
    | UpdateState<S>
    | UpdateSideEffect<A, S>
    | UpdateStateAndSideEffect<S, A>
    | UpdateNothing;

export const state = <S>(state: S): UpdateState<S> => ({
    type: 'UPDATE_STATE',
    state
});

export const sideEffect = <A, S>(sideEffect: SideEffect<A, S>): UpdateSideEffect<A, S> => ({
    type: 'UPDATE_SIDE_EFFECT',
    sideEffect
});

export const stateAndSideEffect = <S, A>(
    state: S,
    sideEffect: SideEffect<A, S>
): UpdateStateAndSideEffect<S, A> => ({
    type: 'UPDATE_STATE_AND_SIDE_EFFECT',
    state,
    sideEffect
});

export const nothing = (): UpdateNothing => ({
    type: 'UPDATE_NOTHING'
});

export const getSideEffect = <S: {}, A>(update: Update<S, A>): ?SideEffect<A, S> =>
    update.type === 'UPDATE_SIDE_EFFECT' || update.type === 'UPDATE_STATE_AND_SIDE_EFFECT'
        ? update.sideEffect
        : null;

export const getState = <S: {}, A>(update: Update<S, A>): ?S =>
    update.type === 'UPDATE_STATE' || update.type === 'UPDATE_STATE_AND_SIDE_EFFECT'
        ? update.state
        : null;
