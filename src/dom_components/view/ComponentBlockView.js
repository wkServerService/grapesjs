define(['backbone', './ComponentView'],
	function (Backbone, ComponentView) {
	/**
	 * @class ComponentImageView
	 * */

	return ComponentView.extend({

		tagName		: 'div',

		events		: {
				'dblclick' 	: 'eventHandle',
		},

		initialize: function(o){
			ComponentView.prototype.initialize.apply(this, arguments);
			this.listenTo(this.model, 'change:content', this.updateContent);
			this.listenTo(this.model, 'dblclick', this.eventHandle);
			if(this.config.modal)
				this.modal		= this.config.modal;
		},

		eventHandle: function (e) {
			var f = BlockHook[e.type];
			if (f) {
				f(this, e);
			}
		},

		/**
		 * Update src attribute
		 *
		 * @return void
		 * */
		updateSrc: function(){
			this.$el.attr('src',this.model.get("src"));
		},

		updateContent: function () {
			this.$el.html(this.model.get('content'));
		},

		/**
		 * Open dialog for image changing
		 * @param	{Object}	e	Event
		 *
		 * @return void
		 * */
		openModal: function(e){
			var that	= this;
			if(this.modal){
				this.modal.setTitle('New Block');
				this.modal.setContent('hello world');
				this.modal.show();
			}
		},
	});
});
