const DEFAULT_LOG_LEVEL = 3;

function getLogLevel(level?: string): number {
    if (!level) return DEFAULT_LOG_LEVEL;
    const value = parseInt(level);
    return isNaN(value) ? DEFAULT_LOG_LEVEL : value;
}

export const logLevel = getLogLevel(process.env.SK_LOG_LEVEL);

export const logLevelClient = getLogLevel(process.env.SK_LOG_LEVEL_CLIENT);

export const openGraph = {
    siteName: 'One More Chance',
    image: '/logo/og-1200x630.png',
    imageAlt: 'Logo de One More Chance',
    imageWidth: '1200',
    imageHeight: '630',
};
