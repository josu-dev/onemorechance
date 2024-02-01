import type { Readable, Writable } from 'svelte/store';


export type { Readable, Writable };

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
