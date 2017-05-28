const { mix } = require('laravel-mix');

// mix.browserSync({
//     proxy: 'vue-bootstrapper.dev',
//     files: ["public/*"]
// });

mix.setPublicPath('static');

/*
 |--------------------------------------------------------------------------
 | Mix Asset Management
 |--------------------------------------------------------------------------
 |
 | Mix provides a clean, fluent API for defining some Webpack build steps
 | for your Laravel application. By default, we are compiling the Sass
 | file for the application as well as bundling up all the JS files.
 |
 */

mix.js('build/js/app.js', 'static/js')
   .sass('build/sass/styles.scss', 'static/css');
