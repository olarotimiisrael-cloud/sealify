/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: 'class',
    content: [
        './resources/views/**/*.blade.php',
        './resources/js/**/*.js',
        './app/**/*.php',
    ],
    safelist: [
        // Dynamic category/listing accent colors built via {{ $color }}-NN in Blade.
        // Families limited to those used by category color values + emerald default.
        {
            pattern: /^(bg|text|border|from|to|shadow)-(emerald|teal|cyan|blue|indigo|purple|pink|rose|amber)-(50|100|200|300|400|500|600)$/,
        },
        {
            pattern: /^(hover:|group-hover:)?(bg|text|border|shadow)-(emerald|teal|cyan|blue|indigo|purple|pink|rose|amber)-(200|300|400|500|600)$/,
        },
    ],
    theme: {
        extend: {},
    },
    plugins: [],
};