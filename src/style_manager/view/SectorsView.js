define(['backbone', './SectorView'],
	function (Backbone, SectorView) {

	return Backbone.View.extend({

		initialize: function(o) {
			this.config = o.config || {};
			this.pfx = this.config.stylePrefix || '';
			this.target = o.target || {};

			// The taget that will emit events for properties
			this.propTarget	 = {};
			_.extend(this.propTarget, Backbone.Events);
			this.listenTo( this.collection, 'add', this.addTo);
			this.listenTo( this.collection, 'reset', this.render);
			this.listenTo( this.target, 'change:selectedComponent targetClassAdded targetClassRemoved targetClassUpdated ' +
				'targetStateUpdated', this.targetUpdated);

		},

		/**
		 * Add to collection
		 * @param {Object} model Model
		 * @return {Object}
		 * @private
		 * */
		addTo: function(model){
			this.addToCollection(model);
		},

		/**
		 * Fired when target is updated
		 * @private
		 */
		targetUpdated: function() {
			var el = this.target.get('selectedComponent');

			if(!el)
				return;

			var classes = el.get('classes');
			var state = el.get('state');
			var pt = this.propTarget;
			pt.helper = null;

			if(classes.length){
				var cssC = this.target.get('CssComposer');
				var valid = _.filter(classes.models, function(item){
					return item.get('active');
				});
				var iContainer = cssC.getRule(valid, state, '');

				if(!iContainer){
					iContainer = cssC.newRule(valid, state, '');
					// Hydrate styles from component element
					iContainer.set('style', el.get('style'));
					cssC.addRule(iContainer);
					el.set('style', {});
				}else{
					// Ensure to clean element
					if(classes.length == 1)
						el.set('style', {});
				}

				// If the state is not empty, there is should be a helper rule in play
				// The helper rule will get the same style of the iContainer
				if(state){
					var clm = this.target.get('ClassManager');
					var helperClass = clm.addClass('hc-state');
					var helperRule = cssC.getRule([helperClass],'','');
					if(!helperRule){
						helperRule = cssC.newRule([helperClass],'','');
						cssC.addRule(helperRule);
					}else{
						// I will make it last again, otherwise it could be overridden
						helperRule = cssC.getRules().remove(helperRule);
						cssC.getRules().add(helperRule);
					}
					helperRule.set('style', iContainer.get('style'));
					pt.helper = helperRule;
				}

				pt.model = iContainer;
				pt.trigger('update');
				return;
			}

			pt.model = el;
			pt.trigger('update');
		},


		/**
		 * Add new object to collection
		 * @param {Object} model Model
		 * @param	{Object} fragmentEl collection
		 * @return {Object} Object created
		 * @private
		 * */
		addToCollection: function(model, fragmentEl){
			var fragment = fragmentEl || null;
			var viewObject = SectorView;

			var view = new viewObject({
				model: model,
				id: this.pfx + model.get('name').replace(' ','_').toLowerCase(),
				name: model.get('name'),
				properties: model.get('properties'),
				target: this.target,
				propTarget: this.propTarget,
				config: this.config,
			});
			var rendered = view.render().el;

			if(fragment){
				fragment.appendChild(rendered);
			}else{
				this.$el.append(rendered);
			}

			return rendered;
		},

		render: function() {
			var fragment = document.createDocumentFragment();
			this.$el.empty();

			this.collection.each(function(model){
				this.addToCollection(model, fragment);
			}, this);

			this.$el.attr('id', this.pfx + 'sectors');
			this.$el.append(fragment);
			return this;
		}
	});
});
