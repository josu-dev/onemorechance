import { PUBLIC_SK_LOG_LEVEL, PUBLIC_SK_LOG_LEVEL_CLIENT } from '$env/static/public';


const DEFAULT_LOG_LEVEL = 3;

function getLogLevel(level: string): number {
    const value = parseInt(level);
    return isNaN(value) ? DEFAULT_LOG_LEVEL : value;
}

export const logLevel = getLogLevel(PUBLIC_SK_LOG_LEVEL);

export const logLevelClient = getLogLevel(PUBLIC_SK_LOG_LEVEL_CLIENT);

export const openGraph = {
    siteName: 'One More Chance',
    image: '/logo/og-1200x630.png',
    imageAlt: 'Logo de One More Chance',
    imageWidth: '1200',
    imageHeight: '630',
};
