define(['backbone','./Components', 'ClassManager/model/ClassTags'],
	function (Backbone, Components, ClassTags) {

		return Backbone.Model.extend({

			defaults: {
				tagName: 'div',
				type: '',
				editable: false,
				removable: true,
				draggable: true,
				droppable: true,
				badgable: true,
				stylable: true,
				copyable: true,
				void: false,
				state: '',
				status: '',
				previousModel: '',
				content: '',
				style: {},
				attributes: {},
			},

			initialize: function(o, opt) {
				// Check void elements
				if(opt && opt.config && opt.config.voidElements.indexOf(this.get('tagName')) >= 0)
					this.set('void', true);

				this.sm = opt ? opt.sm || {} : {};
				this.config 	= o || {};
				this.defaultC = this.config.components || [];
				this.defaultCl = this.normalizeClasses(this.config.classes || []);
				this.components	= new Components(this.defaultC, opt);
				this.set('components', this.components);
				this.set('classes', new ClassTags(this.defaultCl));
			},

			/**
			 * Normalize input classes from array to array of objects
			 * @param {Array} arr
			 * @return {Array}
			 * @private
			 */
			normalizeClasses: function(arr){
				var res = [];

				if(!this.sm.get)
					return;

				var clm = this.sm.get('ClassManager');
				if(!clm)
					return;

				arr.forEach(function(val){
					var name = '';

					if(typeof val === 'string')
						name = val;
					else
						name = val.name;

					var model = clm.addClass(name);
					res.push(model);
				});
				return res;
			},

			/**
			 * Override original clone method
			 * @private
			 */
	    clone: function()
	    {
	    	var attr = _.clone(this.attributes),
	    			comp = this.get('components'),
	    			cls = this.get('classes');
	    	attr.components = [];
	    	attr.classes 	= [];
	    	if(comp.length){
					comp.each(function(md,i){
							attr.components[i]	= md.clone();
					});
	    	}
	    	if(cls.length){
					cls.each(function(md,i){
							attr.classes[i]	= md.get('name');
					});
	    	}
	    	attr.status = '';
	      return new this.constructor(attr, {sm: this.sm});
	    },

			/**
			 * Get name of the component
			 *
			 * @return {String}
			 * @private
			 * */
			getName: function(){
				if(!this.name){
					var id = this.cid.replace(/\D/g,''),
						type = this.get('type');
					var tag = this.get('tagName');
					tag = tag == 'div' ? 'box' : tag;
					tag = type ? type : tag;
					this.name 	= tag.charAt(0).toUpperCase() + tag.slice(1) + ' ' + id;
				}
				return this.name;
			},

		});
});
