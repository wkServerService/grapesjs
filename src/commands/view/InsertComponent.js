define(['backbone', './InsertCustom'],
	function(Backbone, InsertCustom) {
		/**
		 * @class ImageComponent
		 * */
		return _.extend({}, InsertCustom, {

			/**
			 * Run method
			 * */
			run: function(em, sender){
				this.enable();
				this.em				= em;
				this.sender		= sender;
				this.opt 			= sender.get('options') || {};
				this.type	= this.opt.type||'div';
				this.content	= this.opt.content;
				this.style	= this.opt.style||{'width':'90%','max-width':'1100px','min-height':'75px','padding':'7px 7px 7px 7px','margin':'0 auto'};
				this.attributes	= this.opt.attributes||{};
			},

			/**
			 * Trigger before insert
			 * @param 	{Object}	object
			 *
			 * */
			beforeInsert: function(object){
				object.type 			= this.type;
				object.style			= this.style;
				object.attributes = this.attributes;
				if (!this.nearToFloat()) {
					object.style.display	= 'block';
				}
				// This allow to avoid 'ghosts' on drag
				object.attributes.onmousedown = 'return false';
				if (this.config.firstCentered && (this.$wp.get(0) == this.posTargetEl.get(0)) ) {
					object.style.margin 	= '0 auto';
				}
			},

			/**
			 * Trigger after insert
			 * @param	{Object}	model	Model created after insert
			 *
			 * */
			afterInsert: function(model){
				alert('after');
				model.trigger('dblclick');
				if(this.sender)
					this.sender.set('active', false);
			},

			/**
			 * Create different object, based on content, to insert inside canvas
			 *
			 * @return 	{Object}
			 * */
			buildContent: function(){
				var result = {};
				if(typeof this.content === 'string'){
					result = {
						content	: this.content,
						tagName	: 'div',
					};
				}else if(typeof this.content === 'object'){
					result = this.content;
				}
				return result;
			}


		});
	});