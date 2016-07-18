define(['backbone','require'],
function(Backbone, require) {
	/**
	 * @class ButtonView
	 * */
	return Backbone.View.extend({

		tagName: 'span',

		initialize: function(o){
			_.bindAll(this, 'startTimer', 'stopTimer', 'showButtons', 'hideButtons','closeOnKeyPress','onDrop');
			var cls = this.model.get('className');
			this.config = o.config || {};
			this.em = this.config.em || {};
			this.pfx = this.config.stylePrefix || '';
			this.ppfx = this.config.pStylePrefix || '';
			this.id = this.pfx + this.model.get('id');
			this.activeCls = this.pfx + 'active';
			this.btnsVisCls = this.pfx + 'visible';
			this.parentM = o.parentM || null;
			this.className = this.pfx + 'btn' + (cls ? ' ' + cls : '');
			this.listenTo(this.model, 'change:active updateActive', this.updateActive);
			this.listenTo(this.model, 'checkActive', this.checkActive);
			this.listenTo(this.model, 'change:bntsVis', this.updateBtnsVis);
			this.listenTo(this.model, 'change:attributes', this.updateAttributes);
			this.listenTo(this.model, 'change:className', this.updateClassName);

			if(this.model.get('buttons').length){
				this.$el.on('mousedown', this.startTimer);
				this.$el.append($('<div>',{class: this.pfx + 'arrow-rd'}));
			}

			if(this.em && this.em.get)
				this.commands	= this.em.get('Commands');

			this.events = {};

			if(this.model.get('dragDrop'))
				this.events.mousedown = 'initDrag';
			else
				this.events.click = 'clicked';
			this.delegateEvents();

			if(this.em.Canvas){
				this.canvasEl = this.em.Canvas.getElement();
				this.sorter = new this.em.Utils.Sorter({
					container: this.canvasEl,
					containerSel: '*',
					itemSel: '*',
					pfx: this.ppfx,
					onMove: this.onDrag,
					onEndMove: this.onDrop,
					direction: 'auto',
					nested: 1,
				});
			}
		},

		/**
		 * Init dragging element
		 * @private
		 */
		initDrag: function(){
			this.model.collection.deactivateAll(this.model.get('context'));
			this.sorter.startSort(this.el);
			this.sorter.setDropContent(this.model.get('options').content);
			this.canvasEl.style.cursor = 'grabbing';
		},

		/**
		 * During drag method
		 * @private
		 */
		onDrag: function(e){},

		/**
		 * During drag method
		 * @private
		 */
		onDrop: function(e){
			this.canvasEl.style.cursor = 'default';
		},

		/**
		 * Updates class name of the button
		 *
		 * @return 	void
		 * */
		updateClassName: function()
		{
			var cls = this.model.get('className');
			this.$el.attr('class', this.pfx + 'btn' + (cls ? ' ' + cls : ''));
		},

		/**
		 * Updates attributes of the button
		 *
		 * @return 	void
		 * */
		updateAttributes: function()
		{
			this.$el.attr(this.model.get("attributes"));
		},

		/**
		 * Updates visibility of children buttons
		 *
		 * @return	void
		 * */
		updateBtnsVis: function()
		{
			if(!this.$buttons)
				return;

			if(this.model.get('bntsVis'))
				this.$buttons.addClass(this.btnsVisCls);
			else
				this.$buttons.removeClass(this.btnsVisCls);
		},

		/**
		 * Start timer for showing children buttons
		 *
		 * @return	void
		 * */
		startTimer: function()
		{
			this.timeout = setTimeout(this.showButtons, this.config.delayBtnsShow);
			$(document).on('mouseup', 	this.stopTimer);
		},

		/**
		 * Stop timer for showing children buttons
		 *
		 * @return	void
		 * */
		stopTimer: function()
		{
			$(document).off('mouseup', 	this.stopTimer);
			if(this.timeout)
				clearTimeout(this.timeout);
		},

		/**
		 * Show children buttons
		 *
		 * @return 	void
		 * */
		showButtons: function()
		{
			clearTimeout(this.timeout);
			this.model.set('bntsVis', true);
			$(document).on('mousedown',	this.hideButtons);
			$(document).on('keypress',	this.closeOnKeyPress);
		},

		/**
		 * Hide children buttons
		 *
		 * @return 	void
		 * */
		hideButtons: function(e)
		{
			if(e){ $(e.target).trigger('click'); }
			this.model.set('bntsVis', false);
			$(document).off('mousedown',	this.hideButtons);
			$(document).off('keypress', 	this.closeOnKeyPress);
		},

		/**
		 * Close buttons on ESC key press
		 * @param 	{Object}	e	Event
		 *
		 * @return 	void
		 * */
		closeOnKeyPress: function(e)
		{
			var key = e.which || e.keyCode;
			if(key == 27)
				this.hideButtons();
		},

		/**
		 * Update active status of the button
		 *
		 * @return 	void
		 * */
		updateActive: function(){
			var command	= null;
			var editor = this.em && this.em.get ? this.em.get('Editor') : null;

			if(this.commands)
				command	= this.commands.get(this.model.get('command'));

			if(this.model.get('active')){

				this.model.collection.deactivateAll(this.model.get('context'));
				this.model.set('active', true, { silent: true }).trigger('checkActive');

				if(this.parentM)
					this.parentM.set('active', true, { silent: true }).trigger('checkActive');

				if(command)
					command.run(editor, this.model, this.model.get('options'));
			}else{
				this.$el.removeClass(this.activeCls);

				this.model.collection.deactivateAll(this.model.get('context'));

				if(this.parentM)
					this.parentM.set('active', false, { silent: true }).trigger('checkActive');

				if(command)
					command.stop(editor, this.model, this.model.get('options'));
			}
		},

		/**
		 * Update active style status
		 *
		 * @return 	void
		 * */
		checkActive: function(){
			if(this.model.get('active'))
				this.$el.addClass(this.activeCls);
			else
				this.$el.removeClass(this.activeCls);
		},

		/**
		 * Triggered when button is clicked
		 * @param	{Object}	e	Event
		 *
		 * @return 	void
		 * */
		clicked: function(e)
		{
			if(this.model.get('bntsVis') )
				return;

			if(this.parentM)
				this.swapParent();

			this.model.set('active', !this.model.get('active'));
		},

		/**
		 * Updates parent model swapping properties
		 *
		 * @return	void
		 * */
		swapParent: function()
		{
			this.parentM.collection.deactivateAll(this.model.get('context'));
			this.parentM.set('attributes', 	this.model.get('attributes'));
			this.parentM.set('options', 	this.model.get('options'));
			this.parentM.set('command', 	this.model.get('command'));
			this.parentM.set('className', 	this.model.get('className'));
			this.parentM.set('active', true, { silent: true }).trigger('checkActive');
		},

		render: function()
		{
			this.updateAttributes();
			this.$el.attr('class', this.className);

			if(this.model.get('buttons').length){
				var btnsView = require('./ButtonsView');								//Avoid Circular Dependencies
				var view = new btnsView({
						collection 	: this.model.get('buttons'),
						config		: this.config,
						parentM		: this.model
				});
				this.$buttons	= view.render().$el;
				this.$buttons.append($('<div>',{class: this.pfx + 'arrow-l'}));
				this.$el.append(this.$buttons);											//childNodes avoids wrapping 'div'
			}

			return this;
		},

	});
});