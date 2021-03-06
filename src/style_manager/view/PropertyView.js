define(['backbone', 'text!./../templates/propertyLabel.html'],
	function (Backbone, propertyTemplate) {
	/**
	 * @class PropertyView
	 * */
	return Backbone.View.extend({

		template: _.template(propertyTemplate),
		templateLabel: _.template(propertyTemplate),

		events:			{
				'change' : 'valueChanged',
		},

		initialize: function(o) {
			this.config = o.config;
			this.pfx = this.config.stylePrefix || '';
			this.target = o.target || {};
			this.propTarget = o.propTarget || {};
			this.onChange = o.onChange || {};
			this.onInputRender = o.onInputRender	|| {};
			this.customValue	= o.customValue	|| {};
			this.func = this.model.get('functionName');
			this.defaultValue = this.model.get('defaults');
			this.property = this.model.get('property');
			this.units = this.model.get('units');
			this.min = this.model.get('min') || this.model.get('min')===0 ? this.model.get('min') : -5000;
			this.max = this.model.get('max') || this.model.get('max')===0 ? this.model.get('max') : 5000;
			this.unit = this.model.get('unit') ? this.model.get('unit') : (this.units.length ? this.units[0] : '');
			this.list = this.model.get('list');
			this.input = this.$input = null;
			this.className = this.pfx  + 'property';
			this.listenTo( this.propTarget, 'update', this.targetUpdated);
			this.listenTo( this.model ,'change:value', this.valueChanged);
		},

		/**
		 * Fired when the target is updated
		 * */
		targetUpdated: function(){
			this.selectedComponent = this.propTarget.model;
			if(this.selectedComponent){
				if(!this.sameValue())
					this.renderInputRequest();
			}
		},

		/**
		 * Checks if the value from selected component is the
		 * same of the value of the model
		 *
		 * @return {Boolean}
		 * */
		sameValue: function(){
			return this.getComponentValue() == (this.model.get('value') + this.model.get('unit'));
		},


		/**
		 * Get the value from the selected component of this property
		 *
		 * @return {String}
		 * */
		getComponentValue: function(){
			if(!this.selectedComponent)
				return;

			if(this.selectedComponent.get('style')[this.property])
				this.componentValue = this.selectedComponent.get('style')[this.property];
			else
				this.componentValue = this.defaultValue + (this.unit || '');

			// Check if wrap inside function is required
			if(this.func){
				var v = this.fetchFromFunction(this.componentValue);
				if(v)
					this.componentValue = v;
			}

			// This allow to ovveride the normal flow of selecting component value,
			// useful in composite properties
			if(this.customValue && typeof this.customValue === "function"){
				var index = this.model.collection.indexOf(this.model);
				var t = this.customValue(this, index);
				if(t)
					this.componentValue = t;
			}

			return this.componentValue;
		},

		/**
		 * Fetch the string from function type value
		 * @param {String} v Function type value
		 *
		 * @return {String}
		 * */
		fetchFromFunction: function(v){
			return v.substring(v.indexOf("(") + 1, v.lastIndexOf(")"));
		},

		/**
		 * Property was changed, so I need to update the component too
		 * @param 	{Object}	e	Events
		 * @param		{Mixed}		val	Value
		 * @param		{Object}	opt	Options
		 * */
		valueChanged: function(e, val, opt){
			if(!this.selectedComponent)
				return;

			// Check if component is allowed to be styled
			var stylable	= this.selectedComponent.get('stylable');
			if( (stylable instanceof Array && _.indexOf(stylable, this.property) < 0) || !stylable )
				return;
			var v			= e && e.currentTarget ? this.$input.val() : this.model.get('value'),
					u 		= this.$unit ? this.$unit.val() : '',
					value	= v + u,
					avSt	= opt ? opt.avoidStore : 0;

			//The easiest way to deal with radio inputs
			if(this.model.get('type') == 'radio')
				value = this.$el.find('input:checked').val();

			if(this.$input)
				this.$input.val(v);
			this.model.set({ value : v, unit: u },{ silent : true });

			if(this.func)
				value =  this.func + '(' + value + ')';

			if( !this.model.get('doNotStyle') ){
				var componentCss = _.clone( this.selectedComponent.get('style') );
				componentCss[this.property] = value;
				this.selectedComponent.set('style', componentCss, { avoidStore : avSt});
			}
			this.selectedValue = value;

			if(this.onChange && typeof this.onChange === "function"){
				this.onChange(this.selectedComponent, this.model);
			}
		},

		/**
		 * Set value to the input
		 * @param 	{String}	value
		 * @param 	{Boolean}	force
		 * */
		setValue: function(value, force){
			var f	= force===0 ? 0 : 1;
			var v 	= this.model.get('value') || this.defaultValue;
			if(value || f){
				v		= value;
			}
			if(this.$input)
				this.$input.val(v);
			this.model.set({value: v}, {silent: true});
		},

		/**
		 * Render label
		 * */
		renderLabel: function(){
			this.$el.html( this.templateLabel({
				pfx		: this.pfx,
				icon	: this.model.get('icon'),
				info	: this.model.get('info'),
				label	: this.model.get('name'),
			}) );
		},

		/**
		 * Render field property
		 * */
		renderField : function() {
			this.renderTemplate();
			this.renderInput();
			delete this.componentValue;
		},

		/**
		 * Render loaded template
		 * */
		renderTemplate: function(){
			this.$el.append( this.template({
				pfx		: this.pfx,
				icon	: this.model.get('icon'),
				info	: this.model.get('info'),
				label	: this.model.get('name'),
			}));
		},

		/**
		 * Renders input, to override
		 * */
		renderInput: function(){
			console.warn("No render input implemented for '"+this.model.get('type')+"'");
		},

		/**
		 * Request to render input of the property
		 * */
		renderInputRequest: function(){
			this.renderInput();
			if(this.onInputRender && typeof this.onInputRender === "function"){
				var index =  this.model.collection.indexOf(this.model);
				this.onInputRender(this, index);
			}
		},

		/**
		 * Clean input
		 * */
		cleanValue: function(){
			this.setValue('');
		},

		render : function(){
			this.renderLabel();
			this.renderField();
			this.$el.attr('class', this.className);
			return this;
		},

	});
});
