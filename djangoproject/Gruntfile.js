/*global
    module: true
*/

var path = require('path');

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
                            - page0.js
                            - page1.js
                            .
                            .
                        - stylesheets
                            - page0.css
                            - page1.css
                            - page2.css
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

    var appNames = ['exampleapp'];

    var DJANGO_DEV_SETTINGS = 'config.settings.dev';
    var DJANGO_MANAGE_DEV = 'python manage.py test --settings=' + DJANGO_DEV_SETTINGS + '; ' + 
                            'python manage.py runserver --settings=' + DJANGO_DEV_SETTINGS + '';


    function paths(listOfApps) {
        
        function expand(location) {
            
            return {
                template: function (app) { 

                    if (!app) {
                        return location; 
                    } else {
                        return location.replace(/\%app/g, app);
                    }
                },

                strip: function(app, str) {

                    if (str.indexOf(this.template(app)) > -1) {
                        var ret = str.substring(this.template(app).length);
                        console.log('str', str);
                        console.log('temp', this.template(app));
                        console.log('ret', ret);
                        return ret;
                    } else {
                        return str;
                    }

                },

                directories: function() { 
                    var ret = [];
            
                    listOfApps.forEach(function(app) {
                        ret.push(location.replace(/\%app/g, app));
                    });
                    return ret; 
                },

                subdirectories: function(path) {
                    var subret = [];

                    this.directories().forEach(function(dir) {
                        subret.push(dir + path);
                    });

                    return subret;
                }
            };
        }

        return {
            assets: {
                root:               expand( '%app' + '/' + ASSETS ),

                bower:              expand( '%app' + '/' + ASSETS + '/' + BOWER ),
                javascripts:        expand( '%app' + '/' + ASSETS + '/' + JAVASCRIPTS ),
                tests:              expand( '%app' + '/' + ASSETS + '/' + TESTS ),

                stylesheets:        expand( '%app' + '/' + ASSETS + '/' + STYLESHEETS ),
                images:             expand( '%app' + '/' + ASSETS + '/' + IMAGES )
            },
            static: {
                root:               expand( '%app' + '/' + STATIC ),

                bower:              expand( '%app' + '/' + STATIC + '/' + BOWER ),

                app:                expand( '%app' + '/' + STATIC + '/' + '%app' ),
                javascripts:        expand( '%app' + '/' + STATIC + '/' + '%app' + '/' + JAVASCRIPTS ), 
                stylesheets:        expand( '%app' + '/' + STATIC + '/' + '%app' + '/' + STYLESHEETS ),
                images:             expand( '%app' + '/' + STATIC + '/' + '%app' + '/' + IMAGES )
            }
        };
    }


    function generateKarmaConfig(config, appNames) {
        var ret = {};
        
        appNames.forEach(function(app) {

            ret[app] = {
                configFile: paths().assets.tests.template().replace(/\%app/g, app) + '/karma.conf.js',
                singleRun: true, /* run the tests, and close the browser(s) */
                autowatch: false,
                browsers: ['PhantomJS'],
                runnerPort: 9999,
                //background: true
            };

        });

        config.karma = ret;
    }


    var config = {

        pkg: grunt.file.readJSON('package.json'),

        jshint: {
            all: {
                files: {
                    src: paths(appNames).assets.javascripts.subdirectories('/**/*.js')
                }
            }
        },

        concatinclude: {
            js: {
                files: [
                    {
                        /*
                        -app
                            - assets
                                - javascripts
                                    - page0
                                        - include.inc
                                        - a.js
                                        - b.js
                                    - page1
                                        - include.inc
                                        - a.js
                                        - b.js
                        >>>>>>>>>>>>>>>>> OUT
                        -app
                            - static
                                - app
                                    -javascripts
                                        - page0.js
                                        - page1.js
                        */
                        expand: true,
                        flatten: false,
                        src: paths(appNames).assets.javascripts.subdirectories('/**/*.inc'),
                        dest: ' ',

                        rename: function(dest, src) {
                            console.log('dest,src!' + dest + '||' + src);
                            
                            var currentApp = src.substring(0, src.indexOf('/'));
                            var filename = path.basename(path.dirname(src)) + '.js';

                            return paths().static.javascripts.template().replace(/\%app/g, currentApp) + '/' + filename;
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
                        -app
                            - assets
                                - stylesheets
                                    - layout
                                        - layout.less (imports a.less, b.less)
                                        - a.less
                                        - b.less
                                    - page0
                                        - page0.less (imports a.less, b.less)
                                        - a.less 
                                        - b.less
                        >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> OUT
                        -app
                            - static
                                -app
                                    - stylesheets
                                        - layout
                                            - layout.css
                                        - page0
                                            - page0.css
                        */
                        expand: true,
                        flatten: false,
                        src: ['**/stylesheets**/**/*.less'],
                        dest: 'change',
                        filter: function(src) {
                            
                            /*
                            Compile only the .less files that match the name
                            of the containing directory.
                            */

                            var directory = path.basename( path.dirname(src) );
                            var filenameWithoutExtension = path.basename(src).substring(0, path.basename(src).indexOf('.'));

                            if (directory === filenameWithoutExtension) {
                                return true;
                            }

                            return false;
                        },
                        rename: function(dest, src) {
                            //console.log('src', src); /* app/assets/stylesheets/page/file.css */
                            
                            var app = src.substring(0, src.indexOf('/'));
                            var filename = path.basename(src);
                            var ret = paths().static.stylesheets.template().replace(/\%app/g, app) + '/' + filename;

                            //console.log('ret', ret);
                            return ret;
                        },
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
                            -app
                                - assets
                                    - images
                                        - Page 0
                                            | jpg/png/bmp/svg
                                        - Page 1
                                            | ..
                            >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
                            -app
                                - static
                                    - appName
                                        - images
                                            - Page 0
                                                | images
                                            - Page 1
                                                | images
                        */
                        expand: true,
                        flatten: false,
                        src: paths(appNames).assets.images.subdirectories('/**/*.{jpg,png,bmp,svg,mpeg}'),
                        dest: '',
                        rename: function(dest, src) {
                            console.log('rel');

                            var app = src.substring(0, src.indexOf('/'));
                            var page = path.basename( path.dirname(src) );
                            var filename = path.basename(src);

                            var ret = paths(appNames).static.images.template(app) + '/' + page + '/' + filename;
                            console.log('Copying to...', ret);

                            return ret;
                        }
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
                        //cwd: paths(appNames).assets.bower,
                        flatten: false,

                        src: paths(appNames).assets.bower.subdirectories('/**/*{js,css}'),
                        dest: '',

                        rename: function(dest, src) {
                            var app = src.substring(0, src.indexOf('/'));
                            var ret = paths().static.bower.template(app) + '/' + paths().assets.bower.strip(app, src);

                            return ret;
                        }
                    },
                ]    
            }
        },

        clean: {
            staticfiles: {
                src: paths(appNames).static.root
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
                files: paths(appNames).assets.javascripts.subdirectories('/**/*.{js,inc}'),
                tasks: [
                    'javascripts'
                ]
            },
            less: {
                files: paths(appNames).assets.stylesheets.subdirectories('/**/*.less'),
                tasks: [
                    'less:build'
                ]
            },
            karma: {
                files: 
                    paths(appNames).assets.javascripts.subdirectories('/**/*.{js,inc}').concat(
                        paths(appNames).assets.tests.subdirectories('/**/*.js}'))
                ,
                tasks: ['karma'],
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
    };

    generateKarmaConfig(config, appNames);

    grunt.initConfig(config);
    
    require('load-grunt-tasks')(grunt);
    // grunt.loadNpmTasks('grunt-contrib-watch');
    // grunt.loadNpmTasks('grunt-contrib-concat');
    // grunt.loadNpmTasks('grunt-contrib-copy');
    // grunt.loadNpmTasks('grunt-contrib-clean');
    // grunt.loadNpmTasks('grunt-contrib-jshint');
    // grunt.loadNpmTasks('grunt-contrib-less');
    // grunt.loadNpmTasks('grunt-bg-shell');

    
    grunt.registerTask('django', ['karma', 'bgShell:runDjango']);
                    
    grunt.registerTask('javascripts', ['concatinclude:js', 'jshint:all', 'karma']);
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