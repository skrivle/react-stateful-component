// @flow

export type Reduce<A> = (action: A) => void;

export type SideEffect<A> = (reduce: Reduce<A>) => any;
