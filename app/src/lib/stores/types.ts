import type { Readable, Writable } from 'svelte/store';


export type { Readable, Writable };

export type InferStoreValue<T> = T extends Readable<infer V> ? V : never;

/** Readable with its value exposed. */
export interface ExposedReadable<T> extends Readable<T> {
    /**
     * Exposed value.
     */
    get value(): T;

    /**
     * Manually sync the value with the store to trigger updates.
     */
    sync(): void;

    /**
     * Manually set the value of the store.
     * @param value New value.
     */
    mset(value: T): void;
}

/** Readable with its value exposed. */
export interface ExposedReadablePartial<T> extends Readable<T> {
    /**
     * Exposed value.
     */
    value: T;

    /**
     * Manually set the value of the store.
     * @param value New value.
     */
    mset(value: T extends (infer V)[] ? Partial<V>[] : Partial<T>): void;

    /**
     * Manually sync the value with the store to trigger updates.
     */
    sync(): void;
}

/** Writable with its value exposed. */
export interface ExposedWritable<T> extends Writable<T> {
    /**
     * Exposed value.
     */
    get value(): T;

    /**
     * Manually sync the value with the store to trigger updates.
     */
    sync(): void;
}

/**
 * Store that persists its value to local storage.
 */
export interface LocalPersistedStore<T> extends Writable<T> {
    /**
     * Get the current value of the store.
     */
    get(): T;

    /**
     * Manually reset the value to the default value and persist it.
     */
    reset(): void;
}
