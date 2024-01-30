export function copyToClipboard(
    text: string,
) {
    navigator.clipboard.writeText(text).then(() => {
        console.log('Copied to clipboard:', text);
    }, (err) => {
        console.error('Error copying to clipboard:', err);
    });
}
