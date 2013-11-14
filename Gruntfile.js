module.exports = function(grunt) {

	var pkg = grunt.file.readJSON('package.json');

	var config = {
		pkg: pkg,
		jshint: {
			options: {
				'-W030': true, // Expected an assignment or function call and instead saw an expression.
				globals: {
					jQuery: true,
					console: true,
					module: true,
					document: true
				}
			},
			dev: {
				src: ['src/**/*.js', 'test/**/*.js']
			}
		},
		karma: {
			dev: {
				configFile: 'karma.conf.dev.js',
				singleRun: true
			},
			tc: {
				configFile: 'karma.conf.js',
				singleRun: true,
				reporters: 'teamcity'
			}
		}
	};

	grunt.initConfig(config);

	// Load plugin tasks
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-karma');

	grunt.registerTask('test', ['jshint', 'karma:dev']);
	grunt.registerTask('build', ['test']);
	grunt.registerTask('default', ['test']);
};