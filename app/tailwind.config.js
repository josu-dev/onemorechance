import flattenColorPalette from 'tailwindcss/lib/util/flattenColorPalette.js';
import plugin from 'tailwindcss/plugin.js';


/** @type {import('tailwindcss').Config} */
export default {
    content: ['./src/**/*.{html,js,svelte,ts}'],
    theme: {
        extend: {
            screens: {
                'xs': '360px',
            }
        }
    },
    plugins: [
        require('@tailwindcss/forms'),
        require('@tailwindcss/typography'),
        plugin(({ addComponents, matchUtilities, theme }) => {
            const utilities = {
                'square': (value) => {
                    return {
                        width: value,
                        height: value,
                    }
                },
                'scrollbar': (value) => {
                    return {
                        '&::-webkit-scrollbar': {
                            width: value,
                            height: value,
                        },
                    }
                },
                'scrollbar-x': (value) => {
                    return {
                        '&::-webkit-scrollbar': {
                            width: value,
                        },
                    }
                },
                'scrollbar-y': (value) => {
                    return {
                        '&::-webkit-scrollbar': {
                            height: value,
                        },
                    }
                },
            }
            matchUtilities(utilities, { values: theme('spacing') })

            const scrollbarColors = {
                'sb': (value) => {
                    return {
                        '&::-webkit-scrollbar': {
                            backgroundColor: value,
                        },
                    }
                },
                'sb-hover': (value) => {
                    return {
                        '&::-webkit-scrollbar:hover, &::-webkit-scrollbar:active': {
                            backgroundColor: value,
                        },
                    }
                },
                'sb-thumb': (value) => {
                    return {
                        '&::-webkit-scrollbar-thumb': {
                            backgroundColor: value,
                        },
                    }
                },
                'sb-thumb-hover': (value) => {
                    return {
                        '&::-webkit-scrollbar-thumb:hover, &::-webkit-scrollbar-thumb:active': {
                            backgroundColor: value,
                        },
                    }
                },
            }
            matchUtilities(scrollbarColors, {
                type: ['color'],
                values: flattenColorPalette(theme('colors'))
            })

            addComponents({
                '.ring-dev': {
                    '--tw-ring-opacity': '1',
                    '--tw-ring-color': 'rgb(217 70 239 / var(--tw-ring-opacity))',
                    '--tw-ring-offset-shadow': 'var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color)',
                    '--tw-ring-shadow': 'var(--tw-ring-inset) 0 0 0 calc(1px + var(--tw-ring-offset-width)) var(--tw-ring-color)',
                    'boxShadow': 'var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow, 0 0 #0000)',
                }
            })
        })
    ],
}
