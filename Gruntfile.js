module.exports = function (grunt) {

    /*
        Grunt installation:
        -------------------
            npm install -g grunt-cli
            npm install -g grunt-init
            npm init (creates a `package.json` file)

        Project Dependencies:
        ---------------------
            npm install grunt --save-dev
            npm install grunt-contrib-watch --save-dev
            npm install grunt-contrib-jshint --save-dev
            npm install grunt-contrib-uglify --save-dev
            npm install grunt-contrib-imagemin --save-dev
            npm install grunt-contrib-htmlmin --save-dev
            npm install grunt-contrib-connect --save-dev
            npm install load-grunt-tasks --save-dev
            npm install time-grunt --save-dev

        Simple Dependency Install:
        --------------------------
            npm install (from the same root directory as the `package.json` file)

        Gem Dependencies:
        -----------------
            gem install image_optim
    */

    // Displays the elapsed execution time of grunt tasks
    require('time-grunt')(grunt);

    // Load NPM Tasks
    require('load-grunt-tasks')(grunt, ['grunt-*']);

    // Project configuration.
    grunt.initConfig({

        // Store your Package file so you can reference its specific data whenever necessary
        pkg: grunt.file.readJSON('package.json'),

        /*
        uglify: {
            options: {
              banner: '/*! <%= pkg.name %> | <%= pkg.version %> | <%= grunt.template.today("yyyy-mm-dd") %> /\n'
            },
            dist: {
                src: './<%= pkg.name %>.js',
                dest: './<%= pkg.name %>.min.js'
            }
        },
        */

        // Used to connect to a locally running web server (so Jasmine can test against a DOM)
        connect: {
            test: {
                port: 8000
            }
        },

        jshint: {
            /*
                Note:
                In case there is a /release/ directory found, we don't want to lint that
                so we use the ! (bang) operator to ignore the specified directory
            */
            files: ['Gruntfile.js', 'app/**/*.js', '!app/release/**', 'modules/**/*.js', 'specs/**/*Spec.js'],
            options: {
                curly:   true,
                eqeqeq:  true,
                immed:   true,
                latedef: true,
                newcap:  true,
                noarg:   true,
                sub:     true,
                undef:   true,
                boss:    true,
                eqnull:  true,
                browser: true,

                globals: {
                    // AMD
                    module:     true,
                    require:    true,
                    define:     true,

                    // Environments
                    console:    true,

                    // General Purpose Libraries
                    $:          true,
                    jQuery:     true,

                    // Testing
                    sinon:      true,
                    describe:   true,
                    it:         true,
                    expect:     true,
                    beforeEach: true,
                    afterEach:  true
                }
            }
        },

        // `optimizationLevel` is only applied to PNG files (not JPG)
        imagemin: {
            png: {
                options: {
                    optimizationLevel: 7
                },
                files: [
                    {
                        expand: true,
                        cwd: './app/images/',
                        src: ['**/*.png'],
                        dest: './app/images/compressed/',
                        ext: '.png'
                    }
                ]
            },
            jpg: {
                options: {
                    progressive: true
                },
                files: [
                    {
                        expand: true,
                        cwd: './app/images/',
                        src: ['**/*.jpg'],
                        dest: './app/images/compressed/',
                        ext: '.jpg'
                    }
                ]
            }
        },

        htmlmin: {
            dist: {
                options: {
                    removeComments: true,
                    collapseWhitespace: true,
                    removeEmptyAttributes: true,
                    removeCommentsFromCDATA: true,
                    removeRedundantAttributes: true,
                    collapseBooleanAttributes: true
                },
                files: {
                    // Destination : Source
                    './index-min.html': './index.html'
                }
            }
        },

        // Run: `grunt watch` from command line for this section to take effect
        watch: {
            files: ['<%= jshint.files %>'],
            tasks: 'default'
        }

    });

    // Default Task
    grunt.registerTask('default', ['jshint', 'connect', 'watch']);

    // Unit Testing Task
    grunt.registerTask('test', ['connect', 'watch']);

    // Release Task
    grunt.registerTask('release', ['jshint', 'test', 'imagemin', 'htmlmin']);

};
