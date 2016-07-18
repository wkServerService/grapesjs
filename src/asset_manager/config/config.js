define(function () {
	return {
		// Indicates if try to load data from the selected storage
    autoload: 1,

		// Style prefix
		stylePrefix			: 'am-',

		// Default assets
		assets				: [],

		// Indicates which storage to use. Available: local | remote
		storageType			: 'local',

		// The name that will be used to identify assets inside storage.
		//	If empty will be used: prefix + 'assets'
		storageName			: 'assets',

		// Where store remote assets
		urlStore			: 'http://localhost/assets/store',

		// Where fetch remote assets
		urlLoad				: 'http://localhost/assets/load',

		// Custom parameters to pass with set request
		paramsStore			: {},

		// Custom parameters to pass with get request
		paramsLoad			: {},

		// Callback before request
		beforeSend			: function(jqXHR,settings){},

		// Callback after request
		onComplete			: function(jqXHR,status){},

		// Url where uploads will be send
		urlUpload				: 'http://localhost/assets/upload',

		// Text on upload input
		uploadText			: 'Drop files here or click to upload',

		// Disable upload input
		disableUpload		: false,

		// Store assets data where the new one is added or deleted
		storeOnChange		: true,

		// It could be useful to avoid send other requests for saving assets,
		// as after upload the script may have already done it
		storeAfterUpload	: false,

	};
});