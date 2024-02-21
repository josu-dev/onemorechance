import flattenColorPalette from 'tailwindcss/lib/util/flattenColorPalette.js';
import plugin from 'tailwindcss/plugin.js';


/** @type {import('tailwindcss').Config} */
export default {
    content: ['./src/**/*.{html,js,svelte,ts}'],
    theme: {
        extend: {
            screens: {
                'xs': '360px',
            },
        },
    },
    plugins: [
        require('@tailwindcss/forms'),
        require('@tailwindcss/typography'),
        plugin(({ matchUtilities, theme }) => {
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
        })
    ],
}
