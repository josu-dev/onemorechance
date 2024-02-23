export function copyToClipboard(
    text: string,
) {
    navigator.clipboard.writeText(text).catch(console['error']);
}


type AnyTuple = [] | [any, ...any[]];

export function debounced<A extends AnyTuple, EA extends AnyTuple>(
    fn: (...args: [...A, ...EA]) => void, delay: number, ...extraArgs: EA
) {
    let timeoutId: ReturnType<typeof setTimeout> | undefined = undefined;

    function _debounced(...args: A) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => fn(...args, ...extraArgs), delay);
    }

    _debounced.cancel = () => clearTimeout(timeoutId);

    return _debounced;
}
