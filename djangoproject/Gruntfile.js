/*global
    module: true
*/

module.exports = function(grunt) {

    /* Inspired by https://github.com/pydanny/cookiecutter-django/blob/master/%7B%7Bcookiecutter.repo_name%7D%7D/Gruntfile.js */
    
    /*
        Compiles the **assets** folder to the **static** folder for specified apps

        Uses following directory structure
        - Gruntfile
        - config
            - settings
        - django-app 0
        - django-app 1
            - appName
                - assets <<<<<<<<<<<<<<<<<<<< IN 
                    - bower
                    - javascripts
                        - Page 0
                            | a.js
                            | b.js
                            | c.js
                        - Page 1
                        .
                        .
                    - tests
                        | Test files for angular w/not
                    -stylesheets
                        - Layout
                            | layout.less (imports a.less, b.less)
                            | a.less 
                            | b.less
                        - Page 1
                            | page1.less (imports layout.less if req'd, x.less, y.less)
                            | x.less
                            | y.less
                        .
                        .
                    - images
                        - Page 0
                            | images .jpg, .png, .bmp, .svg
                        - Page 1
                        .
                        .
                - static >>>>>>>>>>>>>>>>>>>> OUT
                    -bower (this goes on the top level so all apps can share it)
                    - appName (to avoid collisions with other static)
                        - javascripts
                            - Page 0
                                | page0.js 
                            - Page 1
                                | page1.js
                            - Page 2
                            .
                            .
                        - stylesheets
                            - Layout
                                | page0.css
                            - Page 1
                                | page1.css
                            - Page 2
                            .
                            .
                        -images
                            - Page 0 
                                | images..
                            - Page 1
                                | images..
                            - Page 2
                            .
                            .
                - templates
                    - appName
                        - Page0
                            | *.html
                        - Page 1
                            | *.html
                        - Page 2
                        .
                        .
                - views
                    | __init__.py
                    | Page0.py 
                        > functions map to templates using an MVC convention
                    | Page1.py
                    | Page2.py
                    .
                    .
                - tests (Django tests)
                - models
    */
    
    var ASSETS = 'assets';
    var STATIC = 'static';

    var TESTS = 'tests';

    var BOWER = 'bower_components';
    var JAVASCRIPTS = 'javascripts';
    var STYLESHEETS = 'stylesheets';
    var IMAGES = 'images';

    var appName = 'main';

    var DJANGO_DEV_SETTINGS = 'config.settings.dev';
    var DJANGO_MANAGE_DEV = 'python manage.py test --settings=' + DJANGO_DEV_SETTINGS + '; ' + 
                            'python manage.py runserver --settings=' + DJANGO_DEV_SETTINGS + '';


    function paths(appName) {
        
        return {
            assets: {
                root:               appName + '/' + ASSETS,

                bower:              appName + '/' + ASSETS + '/' + BOWER,
                javascripts:        appName + '/' + ASSETS + '/' + JAVASCRIPTS,
                tests:              appName + '/' + ASSETS + '/' + TESTS,

                stylesheets:        appName + '/' + ASSETS + '/' + STYLESHEETS,
                images:             appName + '/' + ASSETS + '/' + IMAGES
            },
            static: {
                root:               appName + '/' + STATIC,

                bower:              appName + '/' + STATIC + '/' + BOWER,

                app:                appName + '/' + STATIC + '/' + appName,
                javascripts:        appName + '/' + STATIC + '/' + appName + '/' + JAVASCRIPTS, 
                stylesheets:        appName + '/' + STATIC + '/' + appName + '/' + STYLESHEETS,
                images:             appName + '/' + STATIC + '/' + appName + '/' + IMAGES
            }
        };
    }
    
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        jshint: {
            all: {
                files: paths(appName).assets.javascripts + '/**.js'
            }
        },
        concat: {
            js: {
                files: [
                    {
                        /*
                        - assets
                            - javascripts
                                - page0
                                    - a.js
                                    - b.js
                                - page1
                                    - a.js
                                    - b.js
                        >>>>>>>>>>>>>>>>> OUT
                        - static
                            - appName
                                -javascripts
                                    - page0
                                        - page0.js
                                    - page1
                                        - page1.js
                        */
                        expand: true,
                        cwd: paths(appName).assets.javascripts,
                        flatten: false,
                        src: ['**/*.js'],
                        dest: paths(appName).static.javascripts,

                        rename: function(dest, src) {
                            //console.log('dest,src!' + dest + '||' + src);
                            var jsContainingDirectory = src.substring(0, src.indexOf('/'));
                            return dest + '/' +
                                jsContainingDirectory + '/' + 
                                jsContainingDirectory + '.js';
                        }
                    },
                ]
            }
        },
        less: {
            build: {
                files: [
                    {
                        /*
                        - assets
                            - stylesheets
                                - layout
                                    - layout.less
                                    - a.less
                                    - b.less
                                - page0
                                    - page0.less 
                                    - a.less 
                                    - b.less
                        >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> OUT
                        - static
                            - stylesheets
                                - layout
                                    - layout.css
                                - page0
                                    - page0.css
                        */
                        expand: true,
                        cwd: paths(appName).assets.stylesheets,
                        flatten: false,
                        src: ['**/*.less'],
                        dest: paths(appName).static.stylesheets,
                        ext: '.css'
                    },
                ]    
            }
        },
        copy: {
            images: {
               files: [
                    {
                        /*
                            - assets
                                - images
                                    - Layout
                                        | jpg/png/bmp/svg
                                    - Page 0
                                        | ..
                            >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
                            - static
                                - appName
                                    - images
                                        - Layout
                                            | images
                                        - Page 0
                                            | images
                        */
                        expand: true,
                        cwd: paths(appName).assets.images,
                        flatten: false,
                        src: ['**/*.{jpg,png,bmp,svg,mpeg}'],
                        dest: paths(appName).static.images
                    },
                ]              
            },
            bower: {
               files: [
                    {
                        /*
                        - assets
                            - bower
                        >>>>>>>>>>>>>>>>>>>
                        - static 
                            - bower
                        */
                        expand: true,
                        cwd: paths(appName).assets.bower,
                        flatten: false,
                        src: ['**/*.*'],
                        dest: paths(appName).static.bower
                    },
                ]    
            }
        },
        clean: {
            staticfiles: {
                src: paths(appName).static.root
            }
        },
        karma: {
            unit: {
                configFile: paths(appName).assets.tests + '/karma.conf.js',
                singleRun: true, /* run the tests, and close the browser(s) */
                autowatch: false,
                browsers: ['PhantomJS'],
                runnerPort: 9999,
                //background: true
            }
        },
        bgShell: {
            runDjango: {
                _defaults: {
                    bg: true
                },
                cmd: DJANGO_MANAGE_DEV
            }
        },
        watch: {
            // WATCH DOESN'T WORK............
            //options: {
                //spawn: false,
                //interrupt: true
            //},
            js: {
                files: [paths(appName).assets.javascripts + '/**/*.js'],
                tasks: [
                    'compile'
                ]
            },
            less: {
                files: [paths(appName).assets.stylesheets + '/**/*.less'],
                tasks: [
                    'less:build'
                ]
            },
            karma: {
                files: [
                    paths(appName).assets.javascripts + '/**/*.{js,less}',
                    paths(appName).assets.tests + '/**/*.{js,less}'
                ],
                tasks: ['karma:unit:run'],
            },
            django: {
                // This cannot cancel already running runservers :\
                files: ['**/**/*.py'],
                tasks: ['bgShell:runDjango']
            }
        },
        concurrent: {
            activeDevelopment: {
                tasks: ['watch:js', 'watch:less'],
                options: {
                    logConcurrentOutput: true
                }
            }
        }
    });
    
    require('load-grunt-tasks')(grunt);
    // grunt.loadNpmTasks('grunt-contrib-watch');
    // grunt.loadNpmTasks('grunt-contrib-concat');
    // grunt.loadNpmTasks('grunt-contrib-copy');
    // grunt.loadNpmTasks('grunt-contrib-clean');
    // grunt.loadNpmTasks('grunt-contrib-jshint');
    // grunt.loadNpmTasks('grunt-contrib-less');
    // grunt.loadNpmTasks('grunt-bg-shell');

    
    grunt.registerTask('django', ['karma', 'bgShell:runDjango']);
                    
    grunt.registerTask('javascripts', ['jshint:all', 'karma:unit', 'concat:js']);
    grunt.registerTask('stylesheets', ['less:build']);
    grunt.registerTask('dev', ['concurrent']);
    
    grunt.registerTask('images', ['copy:images']);
    grunt.registerTask('bower', ['copy:bower']);

    grunt.registerTask('django', ['bgShell:runDjango']);

    grunt.registerTask('default', ['clean:staticfiles', 
                                    'stylesheets', 'javascripts', 
                                    'bower', 'images',
                                    'django']);

};