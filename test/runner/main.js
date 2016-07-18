require(['../src/config/require-config.js', 'config/config.js'], function() {

	require(['chai',
					 'sinon',
	         'specs/main.js',
	         'specs/asset_manager/main.js',
	         'specs/asset_manager/model/Asset.js',
	         'specs/asset_manager/model/AssetImage.js',
	         'specs/asset_manager/model/Assets.js',
	         'specs/asset_manager/view/AssetsView.js',
	         'specs/asset_manager/view/AssetView.js',
	         'specs/asset_manager/view/AssetImageView.js',
	         'specs/asset_manager/view/FileUploader.js',
	         'specs/dom_components/main.js',
	         'specs/class_manager/main.js',
	         'specs/css_composer/main.js',
	         'specs/code_manager/main.js',
	         'specs/panels/main.js',
	         'specs/commands/main.js',
	         'specs/style_manager/main.js',
	         'specs/storage_manager/main.js',
	         'specs/plugin_manager/main.js',
	         'specs/parser/main.js',
	         'specs/grapesjs/main.js',
	         'specs/utils/main.js'
	     ], function(chai)
	     {
				var should 	= chai.should(),
						expect 	= chai.expect;

	     	mocha.run();
	     });
});