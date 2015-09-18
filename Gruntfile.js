/**
 * Created by Jerico on 26/08/2015.
 */
/**
 * Created by jerico on 4/17/2015.
 */
module.exports = function (grunt) {
    grunt.initConfig({
            pkg: grunt.file.readJSON("package.json"),
            bower: {
                install: {
                    options: {
                        install: true,
                        copy: false,
                        targetDir: './libs',
                        cleanTargetDir: true
                    }
                }
            },
            jshint: {
                all: ['Gruntfile.js', 'src/js/**/*.js', '**/*.js']
            },
            karma: {
                options: {
                    configFile: 'test/config/karma.conf.js'
                },
                unit: {
                    singleRun: true
                },

                continuous: {
                    singleRun: false,
                    autoWatch: true
                }
            },
            html2js: {
                options: {
                    module: 'wcTemplates',
                    htmlmin: {
                        collapseBooleanAttributes: true,
                        collapseWhitespace: true,
                        removeComments: true,
                    }
                },
                dist: {
                    src: ['src/templates/**/*.html'],
                    dest: 'tmp/templates.js'
                }
            },
            concat: {
                options: {
                    separator: ';'
                },
                dist: {
                    src: ['src/js/**/*.js', 'tmp/*.js'],
                    dest: 'dist/js/web-components.js'
                }
            },
            uglify: {
                dist: {
                    files: [
                        {
                            'dist/js/web-components.min.js': ['dist/js/web-components.js'],
                        }
                    ],
                    options: {
                        mangle: false
                    }
                }
            },
            cssmin: {
                target: {
                    files: [
                        {
                            expand: true,
                            cwd: 'dist/css',
                            src: ['**/*.css'],
                            dest: 'dist/css',
                            ext: '.min.css'
                        }]
                }
            },
            concat_css: {
                options: {},
                all: {
                    src: ["src/css/**/*.css", "css/**/*.min.css"],
                    dest: "dist/css/web-components.css"
                }
            }
            , clean: {
                temp: {
                    src: ['tmp', 'dist/css/*.css']
                }
            },
            watch: {
                dev: {
                    files: ['Gruntfile.js', 'src/js/**/*.js', 'src/templates/**/*.html'],
                    tasks: ['jshint', 'karma:unit', 'html2js:dist', 'concat:dist', 'clean:temp'],
                    options: {
                        atBegin: true
                    }
                }
                ,
                min: {
                    files: ['Gruntfile.js', 'app/*.js', '*.html'],
                    tasks: ['jshint', 'karma:unit', 'html2js:dist', 'concat:dist', 'clean:temp', 'uglify:dist'],
                    options: {
                        atBegin: true
                    }
                }
            }
            ,
            compress: {
                dist: {
                    options: {
                        archive: 'dist/<%= pkg.name %>-<%= pkg.version %>.zip'
                    }
                    ,
                    files: [{
                        src: ['dist/**'],
                        dest: 'dist/'
                    }]
                }
            },
            strip: {
                main: {
                    src: 'dist/js/rex.js',
                    dest: 'dist/js/rex.js',
                    nodes: ['console', 'debug', 'info', 'log']
                }
            },
            sass: {
                dist: {
                    options: {
                        style: 'expanded'
                    },
                    files: {
                        'src/css/sass.css': 'src/sass/**/*.scss'
                    }
                }
            }

        }
    );

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-compress');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-concat-css');
    grunt.loadNpmTasks('grunt-html2js');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-bower-task');
    grunt.loadNpmTasks('grunt-karma');
    grunt.loadNpmTasks('grunt-strip');
    grunt.loadNpmTasks('grunt-contrib-sass');

    /*
     grunt.registerTask('dev', ['bower', 'connect:server', 'watch:dev']);
     grunt.registerTask('test', ['bower', 'jshint', 'karma:continuous']);
     grunt.registerTask('minified', ['bower', 'connect:server', 'watch:min']);
     grunt.registerTask('package', ['bower', 'jshint', 'karma:unit', 'html2js:dist', 'concat:dist', 'uglify:dist',
     'clean:temp', 'compress:dist']);*/
    grunt.registerTask('dev-package', ['bower', 'html2js:dist', 'concat:dist', 'uglify:dist',
        'clean:temp', 'compress:dist', 'sass', 'concat_css', 'cssmin']);
    grunt.registerTask('package', ['bower', 'html2js:dist', 'concat:dist', 'strip', 'uglify:dist',
        'clean:temp', 'compress:dist', 'sass', 'concat_css', 'cssmin']);
}