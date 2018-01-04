// @flow

export type Reduce<A> = (action: A) => void;

export type SideEffect<A, S> = (reduce: Reduce<A>, state: S) => any;
