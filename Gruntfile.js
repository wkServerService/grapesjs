module.exports = function(grunt) {

  var	appPath 	  = 'src',
  	  buildPath 	= 'dist',
      stylePath   = 'styles',
  	  configPath  = 'config/require-config.js',
      port        = grunt.option('port') || 8000;

  grunt.loadNpmTasks('grunt-contrib-requirejs');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-bowercopy');
  grunt.loadNpmTasks('grunt-mocha');
  grunt.loadNpmTasks('grunt-sass');

  grunt.initConfig({
    appDir: appPath,
    builtDir: buildPath,
    styleDir: stylePath,
    pkg: grunt.file.readJSON("package.json"),

    requirejs:{
    	compile:{
    		options: {
    			mainConfigFile: 		     '<%= appDir %>/' + configPath,
    			appDir: 				         '<%= appDir %>',
    			dir: 					           '<%= builtDir %>',
    			baseUrl: 				         './',
    			name: 					         'main',
          include:                 ["./../vendor/almond/almond"],
    			removeCombined: 		     true,
    			findNestedDependencies:  true,
    			keepBuildDir: 			     true,
    			inlineText: 			       true,
    			optimize: 				       'none',
          wrap: {
              start: "(function (root, factory) {"+
                          "if (typeof define === 'function' && define.amd)"+
                              "define([], factory);"+
                          "else if(typeof exports === 'object' && typeof module === 'object')"+
                              "module.exports = mod();"+
                          "else "+
                              "root.<%= pkg.name %> = root.GrapesJS = factory();"+
                      "}(this, function () {",
              end: "return require('grapesjs/main'); }));"
          },

          paths: {
            "jquery": "wrappers/jquery",
          }

    		}
    	}
    },

    jshint: {
    	all: [
    		'Gruntfile.js',
    		'<%= appDir %>/**/*.js',
    	]
    },

    uglify: {
    	options: {
    	      banner: 	'/*! <%= pkg.name %> - v<%= pkg.version %> */\n'
            },
    	build:{
    		files: {
    	        '<%= builtDir %>/grapes.min.js': ['<%= builtDir %>/main.js']
    	      }
    	}
    },

    sass: {
        dist: {
          files: [{
              expand: true,
              cwd: '<%= styleDir %>/scss',
              src: ['**/*.scss'],
              dest: '<%= styleDir %>/css',
              ext: '.css'
          }]
        }
    },

    cssmin: {
      target: {
        files: [{
          expand: true,
          flatten: true,
          src: [
            '<%= styleDir %>/css/main.css',
            'vendor/codemirror/lib/codemirror.css',
            'vendor/codemirror/theme/hopscotch.css'
          ],
          dest: '<%= builtDir %>',
          ext: '.min.css'
        }]
      }
    },

    concat: {
      css: {
        src: ['<%= builtDir %>/*.min.css'],
        dest: '<%= builtDir %>/css/grapes.min.css'
      }
    },

    mocha: {
    	  test: {
    	    src: ['test/index.html'],
    	    options: {  log: true, },
    	  },
    },

    connect: {
      server: {
          options: {
            port: port,
            open: true
          }
      },
    },

    bowercopy: {
        options: {
          srcPrefix: 'bower_components'
        },
        scripts: {
            options: {
              destPrefix: 'vendor'
            },
            files: {
                'almond/almond.js'                : 'almond/almond.js',
                'jquery/jquery.js'                : 'jquery/dist/jquery.min.js',
                'underscore/underscore.js'        : 'underscore/underscore-min.js',
                'backbone/backbone.js'            : 'backbone/backbone-min.js',
                'backbone-undo/backbone-undo.js'  : 'Backbone.Undo/Backbone.Undo.js',
                'keymaster/keymaster.js'          : 'keymaster/keymaster.js',
                'require/require.js'              : 'requirejs/require.js',
                'require-text/text.js'            : 'requirejs-text/text.js',
                'spectrum/spectrum.js'            : 'spectrum/spectrum.js',
                'codemirror'                      : 'codemirror',
                'codemirror-formatting'           : 'codemirror-formatting/formatting.js',
                'mocha'                           : 'mocha',
                'chai'                            : 'chai/chai.js',
                'sinon'                           : 'sinonjs/sinon.js',
            },
        }
    },

    watch: {
    	script: {
    		files: [ '<%= appDir %>/**/*.js' ],
    		tasks: ['jshint']
    	},
    	css: {
    		files: '**/*.scss',
    		tasks: ['sass']
    	},
    	test: {
    		files: ['test/specs/**/*.js'],
    		tasks: ['mocha'],
    		//options: { livereload: true }, //default port 35729
    	}
    },

    clean: {
      all: ["<%= builtDir %>/*", "!<%= builtDir %>/grapes.min.js", "!<%= builtDir %>/css"]
    },

    copy: {
      fonts: {
        cwd: '<%= styleDir %>/fonts',
        src: '**/*',
        dest: '<%= builtDir %>/fonts',
        expand: true
      }
    }

  });

  /**
   * Have to copy require configs cause r.js will try to load them from the path indicated inside
   * main.js file. This is the only way I have found to do it
   * */
  grunt.registerTask('before-rjs', function() {
	    if(grunt.file.exists(buildPath))
	    	grunt.file.delete(buildPath);
	    grunt.file.mkdir(buildPath);
	    grunt.file.copy(appPath + '/' + configPath, buildPath + '/' + appPath + '/' + configPath);
  });

  grunt.registerTask('bower', ['bowercopy']);

  grunt.registerTask('dev', ['bowercopy', 'connect', 'watch']);

  grunt.registerTask('test', ['jshint', 'mocha']);

  grunt.registerTask('build', ['bowercopy', 'jshint', 'sass', 'before-rjs', 'requirejs', 'uglify', 'cssmin', 'concat', 'clean', 'copy']);

  grunt.registerTask('default', ['dev']);

};