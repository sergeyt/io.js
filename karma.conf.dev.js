module.exports = function(config) {
	// apply base config
	require('./karma.conf.js')(config);

	config.set({
		coverageReporter: {
			type: 'html',
			dir: '.coverage'
		}
	});
};
