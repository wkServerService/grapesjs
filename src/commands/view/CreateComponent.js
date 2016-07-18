define(['backbone','./SelectPosition'],
	function(Backbone, SelectPosition) {

		return _.extend({}, SelectPosition, {

			init: function(opt) {
				_.bindAll(this,'startDraw','draw','endDraw','rollback');
				this.config = opt || {};
				this.hType = this.config.newFixedH ? 'height' : 'min-height';
				this.allowDraw = 1;
			},

			/**
			 * Start with enabling to select position and listening to start drawning
			 * @private
			 * */
			enable: function() {
				SelectPosition.enable.apply(this, arguments);
				this.$wr.css('cursor','crosshair');
				if(this.allowDraw)
					this.$wr.on('mousedown', this.startDraw);
				this.ghost = this.canvas.getGhostEl();
			},

			/**
			 * Start drawing component
			 * @param 	{Object} e	Event
			 * @private
			 * */
			startDraw : function(e) {
				e.preventDefault();
				this.stopSelectPosition();
				this.ghost.style.display = 'block';
				this.frameOff = this.getOffsetDim();
				this.startPos = {
					top : e.pageY + this.frameOff.top,
					left: e.pageX + this.frameOff.left
				};
				this.isDragged = false;
				this.tempComponent = {style: {}};
				this.beforeDraw(this.tempComponent);
				this.updateSize(this.startPos.top, this.startPos.left, 0, 0);
				this.toggleEvents(1);
			},

			/**
			 * Enable/Disable events
			 * @param {Boolean} enable
			 */
			toggleEvents: function(enable) {
				var method = enable ? 'on' : 'off';
				this.$wr[method]('mousemove', this.draw);
				this.$wr[method]('mouseup', this.endDraw);
				this.$canvas[method]('mousemove', this.draw);
				$(document)[method]('mouseup', this.endDraw);
				$(document)[method]('keypress', this.rollback);
			},

			/**
			 * While drawing the component
			 * @param 	{Object}	e	Event
			 * @private
			 * */
			draw: function(e) {
				this.isDragged = true;
				this.updateComponentSize(e);
			},

			/**
			 * End drawing component
			 * @param 	{Object}	e Event
			 * @private
			 * */
			endDraw : function(e) {
				this.toggleEvents();
				var model = {};
				// Only if the mouse was moved
				if(this.isDragged){
					this.updateComponentSize(e);
					this.setRequirements(this.tempComponent);
					var lp = this.sorter.lastPos;
					model = this.create(this.sorter.target, this.tempComponent, lp.index, lp.method);
					this.sorter.prevTarget = null;
				}
				this.ghost.style.display = 'none';
				this.startSelectPosition();
				this.afterDraw(model);
			},

			/**
			 * Create new component inside the target
			 * @param	{Object} target Tha target collection
			 * @param {Object} component New component to create
			 * @param {number} index Index inside the collection, 0 if no children inside
			 * @param {string} method Before or after of the children
			 * @param {Object} opts Options
			 */
			create: function(target, component, index, method, opts) {
				index = method === 'after' ? index + 1 : index;
				var opt = opts || {};
				var $trg = $(target);
				var trgModel = $trg.data('model');
        var trgCollection = $trg.data('collection');
        var droppable = trgModel ? trgModel.get('droppable') : 1;
        opt.at = index;
        if(trgCollection && droppable){
        	return trgCollection.add(component, opt);
        }else
					console.warn("Invalid target position");
			},

			/**
			 * Check and set basic requirements for the component
			 * @param 	{Object}	component	New component to be created
			 * @return 	{Object} 	Component updated
			 * @private
			 * */
			setRequirements: function(component) {
				var c	= this.config;
				if(component.style.width.replace(/\D/g,'') < c.minComponentW)				//Check min width
					component.style.width = c.minComponentW +'px';
				if(component.style[this.hType].replace(/\D/g,'') < c.minComponentH)		//Check min height
					component.style[this.hType] = c.minComponentH +'px';
				if(c.newFixedH)															//Set overflow in case of fixed height
					component.style.overflow = 'auto';
				if(!this.absoluteMode){
					delete component.style.left;
					delete component.style.top;
				}else
					component.style.position = 'absolute';
				return component;
			},

			/**
			 * Update new component size while drawing
			 * @param 	{Object} 	e	Event
			 * @private
			 * */
			updateComponentSize : function (e) {
				var y = e.pageY + this.frameOff.top;
	     	var x = e.pageX + this.frameOff.left;
	      var start = this.startPos;
	      var top = start.top;
	      var left = start.left;
	      var height = y - top;
	     	var width = x - left;
	      if (x < left) {
	      	left = x;
					width = start.left - x;
	      }
	      if (y < top) {
	      	top = y;
					height = start.top - y;
	      }
	      this.updateSize(top, left, width, height);
			},

			/**
			 * Update size
			 * @private
			 */
			updateSize: function(top, left, width, height){
				var u = 'px';
				var ghStl = this.ghost.style;
				var compStl = this.tempComponent.style;
				ghStl.top = compStl.top = top + u;
				ghStl.left = compStl.left = left + u;
				ghStl.width = compStl.width = width + u;
				ghStl[this.hType] = compStl[this.hType] = height +  u;
			},

			/**
			 * Used to bring the previous situation before event started
			 * @param 	{Object}	e		Event
			 * @param 	{Boolean} 	forse	Indicates if rollback in anycase
			 * @private
			 * */
			rollback: function(e, force) {
				var key = e.which || e.keyCode;
				if(key == this.config.ESCAPE_KEY || force){
					this.isDragged = false;
					this.endDraw();
				}
				return;
			},

			/**
			 * This event is triggered at the beginning of a draw operation
			 * @param 	{Object}	component	Object component before creation
			 * @private
			 * */
			beforeDraw: function(component){
				component.editable = false;//set this component editable
			},

			/**
			 * This event is triggered at the end of a draw operation
			 * @param 	{Object}	model	Component model created
			 * @private
			 * */
			afterDraw: function(model){},


			run: function(editor, sender, opts){
				this.editor = editor;
				this.sender	= sender;
				this.$wr = this.$wrapper;
				this.enable();
			},

			stop: function(){
				this.stopSelectPosition();
				this.$wrapper.css('cursor','');
				this.$wrapper.unbind();
			}
		});
	});