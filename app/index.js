'use strict';
var util = require('util');
var exec = require('child_process').exec;
var yeoman = require('yeoman-generator');
var chalk = require('chalk');

var PlaygroundGenerator = module.exports = function PlaygroundGenerator(args, options) {
  yeoman.generators.Base.apply(this, arguments);

  this.on('end', function installDependencies() {
    this.installDependencies({
      skipInstall: options['skip-install']
    });
  });
};

util.inherits(PlaygroundGenerator, yeoman.generators.Base);

PlaygroundGenerator.prototype.promptForConfiguration = function promptForConfiguration() {

  var done = this.async();

  var prompts = [{
    type: 'confirm',
    name: 'includeNormalize',
    message: 'Would you like to include normalize.css?',
    default: true
  }, {
    type: 'confirm',
    name: 'includeJQuery',
    message: 'Would you like to include jQuery?',
    default: true
  }, {
    type: 'confirm',
    name: 'includeBootstrap',
    message: 'Would you like to include Bootstrap?',
    default: false
  }];

  this.prompt(prompts, function processAnswers(answers) {

    this.includeNormalize = answers.includeNormalize;
    this.includeJQuery = answers.includeJQuery;
    this.includeBootstrap = answers.includeBootstrap;

    done();
  }.bind(this));
};

PlaygroundGenerator.prototype.createProjectFiles = function createProjectFiles() {

  this.template('_index.html', 'index.html', this);
  this.copy('js/app.js');
  this.copy('css/style.css');
  this.copy('Gruntfile.js');
  this.copy('package.json');
  this.template('_bower.json', 'bower.json', this);
  this.copy('gitignore', '.gitignore');
  this.copy('gitattributes', '.gitattributes');
};

PlaygroundGenerator.prototype.gitCommit = function gitCommit() {
  var done = this.async();

  this.log('\n\nInitializing Git repository. If this fail, try running ' +
           chalk.yellow.bold('git init') +
           ' and make a first commit manually');
  var async = require('async');
  async.series([
    function (taskDone) {
      exec('git init', taskDone);
    },
    function (taskDone) {
      exec('git add . --all', taskDone);
    },
    function (taskDone) {
      exec('git commit -m "Created playground"', taskDone);
    }
  ], function (err) {

    console.log(err);
    if (err === 127) {
      this.log('Could not find the ' + chalk.yellow.bold('git') + ' command. Make sure Git is installed on this machine');
      return;
    }

    this.log(chalk.green('complete') + ' Git repository has been setup');
    done();
  }.bind(this));
};