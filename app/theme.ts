
import type { CustomThemeConfig } from '@skeletonlabs/tw-plugin';

export const blackAndWhite: CustomThemeConfig = {
    name: 'one-more-chance',
    properties: {
        // =~= Theme Properties =~=
        "--theme-font-family-base": `system-ui`,
        "--theme-font-family-heading": `system-ui`,
        "--theme-font-color-base": "0 0 0",
        "--theme-font-color-dark": "255 255 255",
        "--theme-rounded-base": "9999px",
        "--theme-rounded-container": "8px",
        "--theme-border-base": "1px",
        // =~= Theme On-X Colors =~=
        "--on-primary": "0 0 0",
        "--on-secondary": "255 255 255",
        "--on-tertiary": "255 255 255",
        "--on-success": "255 255 255",
        "--on-warning": "255 255 255",
        "--on-error": "255 255 255",
        "--on-surface": "255 255 255",
        // =~= Theme Colors  =~=
        // primary | #ffffff 
        "--color-primary-50": "255 255 255", // #ffffff
        "--color-primary-100": "255 255 255", // #ffffff
        "--color-primary-200": "255 255 255", // #ffffff
        "--color-primary-300": "255 255 255", // #ffffff
        "--color-primary-400": "255 255 255", // #ffffff
        "--color-primary-500": "255 255 255", // #ffffff
        "--color-primary-600": "230 230 230", // #e6e6e6
        "--color-primary-700": "191 191 191", // #bfbfbf
        "--color-primary-800": "153 153 153", // #999999
        "--color-primary-900": "125 125 125", // #7d7d7d
        // secondary | #955e6b 
        "--color-secondary-50": "239 231 233", // #efe7e9
        "--color-secondary-100": "234 223 225", // #eadfe1
        "--color-secondary-200": "229 215 218", // #e5d7da
        "--color-secondary-300": "213 191 196", // #d5bfc4
        "--color-secondary-400": "181 142 151", // #b58e97
        "--color-secondary-500": "149 94 107", // #955e6b
        "--color-secondary-600": "134 85 96", // #865560
        "--color-secondary-700": "112 71 80", // #704750
        "--color-secondary-800": "89 56 64", // #593840
        "--color-secondary-900": "73 46 52", // #492e34
        // tertiary | #637267 
        "--color-tertiary-50": "232 234 232", // #e8eae8
        "--color-tertiary-100": "224 227 225", // #e0e3e1
        "--color-tertiary-200": "216 220 217", // #d8dcd9
        "--color-tertiary-300": "193 199 194", // #c1c7c2
        "--color-tertiary-400": "146 156 149", // #929c95
        "--color-tertiary-500": "99 114 103", // #637267
        "--color-tertiary-600": "89 103 93", // #59675d
        "--color-tertiary-700": "74 86 77", // #4a564d
        "--color-tertiary-800": "59 68 62", // #3b443e
        "--color-tertiary-900": "49 56 50", // #313832
        // success | #7f4f1a 
        "--color-success-50": "236 229 221", // #ece5dd
        "--color-success-100": "229 220 209", // #e5dcd1
        "--color-success-200": "223 211 198", // #dfd3c6
        "--color-success-300": "204 185 163", // #ccb9a3
        "--color-success-400": "165 132 95", // #a5845f
        "--color-success-500": "127 79 26", // #7f4f1a
        "--color-success-600": "114 71 23", // #724717
        "--color-success-700": "95 59 20", // #5f3b14
        "--color-success-800": "76 47 16", // #4c2f10
        "--color-success-900": "62 39 13", // #3e270d
        // warning | #4a0e4f 
        "--color-warning-50": "228 219 229", // #e4dbe5
        "--color-warning-100": "219 207 220", // #dbcfdc
        "--color-warning-200": "210 195 211", // #d2c3d3
        "--color-warning-300": "183 159 185", // #b79fb9
        "--color-warning-400": "128 86 132", // #805684
        "--color-warning-500": "74 14 79", // #4a0e4f
        "--color-warning-600": "67 13 71", // #430d47
        "--color-warning-700": "56 11 59", // #380b3b
        "--color-warning-800": "44 8 47", // #2c082f
        "--color-warning-900": "36 7 39", // #240727
        // error | #9227f5 
        "--color-error-50": "239 223 254", // #efdffe
        "--color-error-100": "233 212 253", // #e9d4fd
        "--color-error-200": "228 201 253", // #e4c9fd
        "--color-error-300": "211 169 251", // #d3a9fb
        "--color-error-400": "179 104 248", // #b368f8
        "--color-error-500": "146 39 245", // #9227f5
        "--color-error-600": "131 35 221", // #8323dd
        "--color-error-700": "110 29 184", // #6e1db8
        "--color-error-800": "88 23 147", // #581793
        "--color-error-900": "72 19 120", // #481378
        // surface | #1e1709 
        "--color-surface-50": "221 220 218", // #dddcda
        "--color-surface-100": "210 209 206", // #d2d1ce
        "--color-surface-200": "199 197 194", // #c7c5c2
        "--color-surface-300": "165 162 157", // #a5a29d
        "--color-surface-400": "98 93 83", // #625d53
        "--color-surface-500": "30 23 9", // #1e1709
        "--color-surface-600": "27 21 8", // #1b1508
        "--color-surface-700": "23 17 7", // #171107
        "--color-surface-800": "18 14 5", // #120e05
        "--color-surface-900": "15 11 4", // #0f0b04
    }
}