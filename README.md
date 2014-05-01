django-grunt-boilerplate-v1
===========================

Django Example Layout using Grunt for asset preprocessing
    
Compiles the **assets** folder to the **static** folder for specified apps


You might need two terminals when developing. One terminal is for watching js/less files,
the other terminal for running the django dev runserver.

-`grunt django` to run js tests, django tests, and django dev runserver                    

-`grunt javascripts` to run jshint, karma, and concatenation

-`grunt stylesheets` to build less files

-`grunt dev` to watch for changes for either js/less and compile them 

-`grunt images` to copy images from assets folder to static folder. Can be configured to ignore photoshop files, etc.

-`grunt bower` to copy bower_components into the static folder

-`grunt django` to run django tests and start a dev runserver

-`grunt` to clean static folder and start the whole build, compiling all scripts, copying
all images, copying bower files, and finally running django tests and a dev runserver.


Starting up
-------------

The django settings are split across multiple settings files.
Wsgi.py, manage.py are both set to use production level settings.

To start a django server for development testing, you run
`python manage.py runserver --settings=config.settings.dev`

Multiple people working on the same django project might have different dev files so shortcuts to run
the server under different environments should be added to the gruntfile.

Finally, both a `secret.key` and `db.key` file must be in the settings folder. These files correspond
to django SECRET_KEY and the database password and are kept outside version control.



Uses following directory structure
----------------------------------

Directory structure assumes certain Ruby on Rails conventions. This may result in fat apps. 

A view.py file named X that contains a function Y uses the template in folder X which contains a page called Y.


- Gruntfile
- config
    - settings
        - dev.py 
        - . (example: audrey_dev.py)
        - . (example: danny_dev.py)
        - production.py
        - **secret.key** (both kept outside version control)
        - **db.key**
- django-app 0
    - (another app)
- django-app 1
    - config
    - appName
        - assets <<<<<<<<<<<<<<<<<<<< IN 
            - bower
            - javascripts
                - Page 0
                    - a.js
                    - b.js
                    - c.js
                - Page 1
                .
                .
            - tests
                - Test files for angular w/not
            -stylesheets
                - Layout
                    - layout.less (imports a.less, b.less)
                    - a.less 
                    - b.less
                - Page 1
                    - page1.less (imports layout.less if req'd, x.less, y.less)
                    - x.less
                    - y.less
                .
                .
            - images
                - Page 0
                    - images .jpg, .png, .bmp, .svg
                - Page 1
                .
                .
        - static >>>>>>>>>>>>>>>>>>>> OUT
            -bower (this goes on the top level so all apps can share it)
            - appName (to avoid collisions with other static)
                - javascripts
                    - Page 0
                        - page0.js 
                    - Page 1
                        - page1.js
                    - Page 2
                    .
                    .
                - stylesheets
                    - Layout
                        - page0.css
                    - Page 1
                        - page1.css
                    - Page 2
                    .
                    .
                -images
                    - Page 0 
                        - images..
                    - Page 1
                        - images..
                    - Page 2
                    .
                    .
        - templates
            - appName
                - Page0
                    - *.html
                - Page 1
                    - *.html
                - Page 2
                .
                .
        - views
            - __init__.py
            - Page0.py 
                > functions map to templates using an MVC convention
            - Page1.py
            - Page2.py
            .
            .
        - tests (Django tests)
        - models.py





Notes
--------------
In progress: 

- This script only runs for a single app. Will run for a list of apps later.
- This script will not download bower_components

Not sure where to put bower.json file yet. Should it be in assets folder or top
level directory where gruntfile is?
