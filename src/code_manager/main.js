/**
 * - [addGenerator](#addgenerator)
 * - [getGenerator](#getgenerator)
 * - [getGenerators](#getgenerators)
 * - [addViewer](#addviewer)
 * - [getViewer](#getviewer)
 * - [getViewers](#getviewers)
 * - [updateViewer](#updateviewer)
 * - [getCode](#getcode)
 *
 *
 * Before using methods you should get first the module from the editor instance, in this way:
 *
 * ```js
 * var codeManager = editor.CodeManager;
 * ```
 *
 * @module CodeManager
 */
define(function(require) {

	var CodeManager = function(config) {

		var c = config || {},
		defaults = require('./config/config'),
		gHtml = require('./model/HtmlGenerator'),
		gCss = require('./model/CssGenerator'),
		gJson = require('./model/JsonGenerator'),
		eCM = require('./model/CodeMirrorEditor'),
		editorView = require('./view/EditorView');

		for (var name in defaults) {
			if (!(name in c))
				c[name] = defaults[name];
		}

		var generators = {},
		defGenerators	= {},
		viewers = {},
		defViewers = {};

		defGenerators.html = new gHtml();
		defGenerators.css	= new gCss();
		defGenerators.json = new gJson();

		defViewers.CodeMirror = new eCM();

		return {

			config: c,

			EditorView: editorView,

			/**
			 * Add new code generator to the collection
			 * @param	{string} id Code generator ID
			 * @param	{Object} generator Code generator wrapper
			 * @param {Function} generator.build Function that builds the code
			 * @return {this}
			 * @example
			 * codeManager.addGenerator('html7',{
			 * 	build: function(model){
			 * 	 return 'myCode';
			 * 	}
			 * });
			 * */
			addGenerator: function(id, generator) {
				generators[id] = generator;
				return this;
			},

			/**
			 * Get code generator by id
			 * @param	{string} id Code generator ID
			 * @return {Object|null}
			 * @example
			 * var generator = codeManager.getGenerator('html7');
			 * generator.build = function(model){
			 * 	//extend
			 * };
			 * */
			getGenerator: function(id) {
				return generators[id] || null;
			},

			/**
			 * Returns all code generators
			 * @return {Array<Object>}
			 * */
			getGenerators: function() {
				return generators;
			},

			/**
			 * Add new code viewer
			 * @param	{string} id Code viewer ID
			 * @param	{Object} viewer Code viewer wrapper
			 * @param {Function} viewer.init Set element on which viewer will be displayed
			 * @param {Function} viewer.setContent Set content to the viewer
			 * @return {this}
			 * @example
			 * codeManager.addViewer('ace',{
			 * 	init: function(el){
			 * 	  var ace = require('ace-editor');
			 * 		this.editor	= ace.edit(el.id);
			 * 	},
			 * 	setContent: function(code){
			 * 	 this.editor.setValue(code);
			 * 	}
			 * });
			 * */
			addViewer: function(id, viewer) {
				viewers[id] = viewer;
				return this;
			},

			/**
			 * Get code viewer by id
			 * @param	{string} id Code viewer ID
			 * @return {Object|null}
			 * @example
			 * var viewer = codeManager.getViewer('ace');
			 * */
			getViewer: function(id) {
				return viewers[id] || null;
			},

			/**
			 * Returns all code viewers
			 * @return {Array<Object>}
			 * */
			getViewers: function() {
				return viewers;
			},

			/**
			 * Update code viewer content
			 * @param	{Object} viewer Viewer instance
			 * @param	{string} code	Code string
			 * @example
			 * var AceViewer = codeManager.getViewer('ace');
			 * // ...
			 * var viewer = AceViewer.init(el);
			 * // ...
			 * codeManager.updateViewer(AceViewer, 'code');
			 * */
			updateViewer: function(viewer, code) {
				viewer.setContent(code);
			},

			/**
			 * Get code from model
			 * @param	{Object} model Any kind of model that will be passed to the build method of generator
			 * @param	{string} genId Code generator id
			 * @param	{Object} [opt] Options
			 * @return {string}
			 * @example
			 * var codeStr = codeManager.getCode(model, 'html');
			 * */
			getCode: function(model, genId, opt) {
				var generator	= this.getGenerator(genId);
				return generator ? generator.build(model, opt) : '';
			},

			/**
			 * Load default code generators
			 * @return {this}
			 * @private
			 * */
			loadDefaultGenerators: function() {
				for (var id in defGenerators)
					this.addGenerator(id, defGenerators[id]);

				return this;
			},

			/**
			 * Load default code viewers
			 * @return {this}
			 * @private
			 * */
			loadDefaultViewers: function() {
				for (var id in defViewers)
					this.addViewer(id, defViewers[id]);

				return this;
			},

		};

	};

	return CodeManager;

});