django-grunt-boilerplate-v1
===========================

Django Example Layout using Grunt for asset preprocessing.
    
Compiles the **assets** folder to the **static** folder for specified apps. 

You might need **two** terminals when developing. One terminal is for watching js/less files,
the other terminal for running the django dev runserver.


Using Grunt
============

Add your app to the Gruntfile by adding it to the `appNames` array if you want it to be managed by Grunt commands.

### Workflow Example:

Add files to assets/ folder in accordance to directory structure.

When developing:
- Terminal 1: `grunt django`  > Occasionally restart this command to run tests and run server
- Terminal 2: `grunt dev`  > This watches js/less files and recompiles whenever changes are made

**Occasionally**:
If you added images to your assets/images/**/ folder:
- Terminal 1: Don't touch
- Terminal 2: `grunt images` 
- Terminal 2: `grunt dev`

**Optionally**:
If you downloaded some new bower_components:
- Terminal 1: Don't touch
- Terminal 2: `grunt bower`
- Terminal 2: `grunt dev`

To download bower components, run `bower init` inside the assets folder. This will download
files to assets/bower_components which the grunt file expects.


#### Grunt Commands

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

Both a `secret.key` and `db.key` file must be added to the settings folder. The files correspond
to django SECRET_KEY and the database password and are kept outside version control. The `secret.key` file should contain a long string of random characters ~64+ characters. The `db.key` file may be empty.

The django settings are split across multiple settings files.
Wsgi.py, manage.py are both set to use production level settings.

To start a django server for development testing, you run
`python manage.py runserver --settings=config.settings.dev`

Multiple people working on the same django project might have different dev files so shortcuts to run the server under different environments should be added to the gruntfile.


Directory structure
--------------------

Directory structure assumes certain Ruby on Rails conventions. This may result in **fat apps**. 

A view.py file named X that contains a function Y uses the template in folder X which contains a page called Y.

###### Django related directory structure is optional!

The gruntfile only cares about what is inside the **assets** folder for the apps it is set for.


```
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
    - assets <<<<<<<<<<<<<<<<<<<< IN 
        - bower
        - javascripts
            - Page 0
                - a.js
                - b.js
                - c.js
                - *page0.inc* (inclusion file determines the order of concatenation!)
            - Page 1
                - x.js
                - y.js
                - page1.inc
            .
            .
        - tests
            - Page 0
                - abc.spec.js  (These tests run on the concatenated version of the scripts)
            - Page 1
                - somespec.spec.js
                .
                .
            - karma.conf.js
            - test-results.xml (not in version control)
        -stylesheets
            - Layout
                - layout.less (imports other .less files)
                - components.less
                - variables.less
            - Page 1
                - page1.less (can import layout.less/components.less/etc)
                .
                .
        - images
            - Page 0
                - images .jpg, .png, .bmp, .svg (may include photoshop files)
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
                .
                .
            -images
                - Page 0 
                    - images.. (.jpg, .png, .bmp, .svg)
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
```




Notes
--------------
In progress: 

- This script will not download bower_components

Not sure where to put bower.json file yet. Should it be in assets folder or top
level directory where gruntfile is?
