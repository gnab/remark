/* global module:false */
module.exports = function(grunt) {
  var port = grunt.option('port') || 8000;
  // Project configuration
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    connect: {
      server: {
        options: {
          port: port,
          base: '.',
          livereload: true,
          open: {
            target: 'http://localhost:' + port + '/boilerplate-local.html'
          },
        }
      }
    },
    watch: {
      options: {
        livereload: true
      },
      js: {
        files: [ 'Gruntfile.js', 'out/remark.js', 'out/remark.min.js' ]
      },
      html: {
        files: [ '*.html']
      }
    }

  });

  // Dependencies
  grunt.loadNpmTasks( 'grunt-contrib-watch' );
  grunt.loadNpmTasks( 'grunt-contrib-connect' );

  // Serve presentation locally
  grunt.registerTask( 'serve', [ 'connect', 'watch' ] );

};
