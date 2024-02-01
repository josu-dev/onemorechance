export function copyToClipboard(
    text: string,
) {
    navigator.clipboard.writeText(text).then(() => {
        console.log('Copied to clipboard:', text);
    }, (err) => {
        console.error('Error copying to clipboard:', err);
    });
}


type AnyTuple = [] | [any, ...any[]];

export function debounced<A extends AnyTuple, EA extends AnyTuple>(
    fn: (...args: [...A, ...EA]) => void, delay: number, ...extraArgs: EA
) {
    let timeoutId: ReturnType<typeof setTimeout> | undefined = undefined;

    return function (...args: A) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => fn(...args, ...extraArgs), delay);
    };
}
