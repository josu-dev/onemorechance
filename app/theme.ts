
import type { CustomThemeConfig } from '@skeletonlabs/tw-plugin';

export const blackAndWhite: CustomThemeConfig = {
    name: 'one-more-chance',
    properties: {
        // =~= Theme Properties =~=
		"--theme-font-family-base": `system-ui`,
		"--theme-font-family-heading": `system-ui`,
		"--theme-font-color-base": "0 0 0",
		"--theme-font-color-dark": "255 255 255",
		"--theme-rounded-base": "8px",
		"--theme-rounded-container": "8px",
		"--theme-border-base": "1px",
		// =~= Theme On-X Colors =~=
		"--on-primary": "var(--color-secondary-900)",
		"--on-secondary": "var(--color-primary-50)",
		"--on-tertiary": "255 255 255",
		"--on-success": "0 0 0",
		"--on-warning": "0 0 0",
		"--on-error": "255 255 255",
		"--on-surface": "255 255 255",
		// =~= Theme Colors  =~=
		// primary | #e6e2e9 
		"--color-primary-50": "251 251 252", // #fbfbfc
		"--color-primary-100": "250 249 251", // #faf9fb
		"--color-primary-200": "249 248 250", // #f9f8fa
		"--color-primary-300": "245 243 246", // #f5f3f6
		"--color-primary-400": "238 235 240", // #eeebf0
		"--color-primary-500": "230 226 233", // #e6e2e9
		"--color-primary-600": "207 203 210", // #cfcbd2
		"--color-primary-700": "173 170 175", // #adaaaf
		"--color-primary-800": "138 136 140", // #8a888c
		"--color-primary-900": "113 111 114", // #716f72
		// secondary | #1a161d 
		"--color-secondary-50": "221 220 221", // #dddcdd
		"--color-secondary-100": "209 208 210", // #d1d0d2
		"--color-secondary-200": "198 197 199", // #c6c5c7
		"--color-secondary-300": "163 162 165", // #a3a2a5
		"--color-secondary-400": "95 92 97", // #5f5c61
		"--color-secondary-500": "26 22 29", // #1a161d
		"--color-secondary-600": "23 20 26", // #17141a
		"--color-secondary-700": "20 17 22", // #141116
		"--color-secondary-800": "16 13 17", // #100d11
		"--color-secondary-900": "13 11 14", // #0d0b0e
		// tertiary | #700de7 
		"--color-tertiary-50": "234 219 251", // #eadbfb
		"--color-tertiary-100": "226 207 250", // #e2cffa
		"--color-tertiary-200": "219 195 249", // #dbc3f9
		"--color-tertiary-300": "198 158 245", // #c69ef5
		"--color-tertiary-400": "155 86 238", // #9b56ee
		"--color-tertiary-500": "112 13 231", // #700de7
		"--color-tertiary-600": "101 12 208", // #650cd0
		"--color-tertiary-700": "84 10 173", // #540aad
		"--color-tertiary-800": "67 8 139", // #43088b
		"--color-tertiary-900": "55 6 113", // #370671
		// success | #54d90d 
		"--color-success-50": "229 249 219", // #e5f9db
		"--color-success-100": "221 247 207", // #ddf7cf
		"--color-success-200": "212 246 195", // #d4f6c3
		"--color-success-300": "187 240 158", // #bbf09e
		"--color-success-400": "135 228 86", // #87e456
		"--color-success-500": "84 217 13", // #54d90d
		"--color-success-600": "76 195 12", // #4cc30c
		"--color-success-700": "63 163 10", // #3fa30a
		"--color-success-800": "50 130 8", // #328208
		"--color-success-900": "41 106 6", // #296a06
		// warning | #d9d20d 
		"--color-warning-50": "249 248 219", // #f9f8db
		"--color-warning-100": "247 246 207", // #f7f6cf
		"--color-warning-200": "246 244 195", // #f6f4c3
		"--color-warning-300": "240 237 158", // #f0ed9e
		"--color-warning-400": "228 224 86", // #e4e056
		"--color-warning-500": "217 210 13", // #d9d20d
		"--color-warning-600": "195 189 12", // #c3bd0c
		"--color-warning-700": "163 158 10", // #a39e0a
		"--color-warning-800": "130 126 8", // #827e08
		"--color-warning-900": "106 103 6", // #6a6706
		// error | #d90d2b 
		"--color-error-50": "249 219 223", // #f9dbdf
		"--color-error-100": "247 207 213", // #f7cfd5
		"--color-error-200": "246 195 202", // #f6c3ca
		"--color-error-300": "240 158 170", // #f09eaa
		"--color-error-400": "228 86 107", // #e4566b
		"--color-error-500": "217 13 43", // #d90d2b
		"--color-error-600": "195 12 39", // #c30c27
		"--color-error-700": "163 10 32", // #a30a20
		"--color-error-800": "130 8 26", // #82081a
		"--color-error-900": "106 6 21", // #6a0615
		// surface | #352442 
		"--color-surface-50": "225 222 227", // #e1dee3
		"--color-surface-100": "215 211 217", // #d7d3d9
		"--color-surface-200": "205 200 208", // #cdc8d0
		"--color-surface-300": "174 167 179", // #aea7b3
		"--color-surface-400": "114 102 123", // #72667b
		"--color-surface-500": "53 36 66", // #352442
		"--color-surface-600": "48 32 59", // #30203b
		"--color-surface-700": "40 27 50", // #281b32
		"--color-surface-800": "32 22 40", // #201628
		"--color-surface-900": "26 18 32", // #1a1220
    }
}
