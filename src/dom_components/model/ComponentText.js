define(['./Component'],
	function (Component) {

		return Component.extend({

			defaults: _.extend({}, Component.prototype.defaults, {
					content 		: '',
					droppable		: false,
			}),

		});
});
