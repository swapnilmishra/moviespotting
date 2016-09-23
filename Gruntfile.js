module.exports = function(grunt) {

  var jsFiles = [
    'public/js/jquery.min.js',
    'public/js/handlebars.runtime.js',
    'public/templates/handlebars.autocomplete.js',
    'public/js/typeahead.js',
    'public/js/bootstrap.min.js',
    'public/js/moviespotting.js',
    'public/js/selectize.min.js',
    'public/js/toastr.min.js',
    'public/js/twitter-bootstrap-hover-dropdown.min.js'
  ];

  var cssFiles = [
    'public/css/bootstrap.min.css',
    'public/css/font-awesome.css',
    'public/css/style.css',
    'public/css/selectize.css',
    'public/css/toastr.min.css'
  ];

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
      },
      my_target: {
        files: {
          'public/js/<%= pkg.name %>.min.js' : jsFiles
        }
      }
    },

    cssmin: {
      options:{
        keepSpecialComments: 0,
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
      },
      combine: {
        files: {
          'public/css/<%= pkg.name %>.min.css': cssFiles
        }
      }
    },

    handlebars: {
      compile: {
        options: {
          namespace: "templates"
        },
        files: {
          "public/templates/handlebars.autocomplete.js": "public/templates/autocomplete",
          "public/templates/handlebars.createmovie.js": "public/templates/createmovie",
          "public/templates/handlebars.comment.js": "public/templates/comment"

        }
      }
    },

    autoprefixer: {
      dist: {
        options: {
          browsers: ['last 1 version', '> 1%', 'ie 8', 'ie 7']
        },
        files: {
          'public/css/style-prefixed.css': ['public/css/style.css']
        }
      }
    },

    replace: {
      example: {
        src: ['views/build/uiscripts.ejs','views/build/header.ejs','views/build/login.ejs','views/build/signup.ejs'],
        dest: 'views/',// destination directory or file
        replacements: [{ 
          from: 'version_stamp',                   // string replacement
          to: function(){
            return Math.floor(new Date().getTime()/3600);
          } 
        }]
      }
    }

  });

  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-contrib-uglify');
  // Load the plugin that provides the "cssmin" task.
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  // load task for compiling handlebar templates
  grunt.loadNpmTasks('grunt-contrib-handlebars');
  // autoprefix css
  grunt.loadNpmTasks('grunt-autoprefixer');

  grunt.loadNpmTasks('grunt-text-replace');

  // Default task(s).
  grunt.registerTask('default', ['uglify','cssmin','replace']);
  // uglify task
  grunt.registerTask('buildjs', ['uglify']);
  // cssmin task
  grunt.registerTask('buildcss', ['cssmin']);
  grunt.registerTask('prefixcss', ['autoprefixer']);
  // compile templates
  grunt.registerTask('buildtemplates', ['handlebars']);

  grunt.registerTask('buildversion',['replace']);

};