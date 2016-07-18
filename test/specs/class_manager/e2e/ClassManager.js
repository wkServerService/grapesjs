
define(['GrapesJS'],
	function(GrapesJS) {

    return {
      run : function(){
          describe('E2E tests', function() {

            /**
             * Create tags viewer
             * @param  {Object} ctx
             */
            var instClassTagViewer = function(ctx){
              var $clm;
              var clm = ctx.gjs.editor.get('ClassManager');
              clm.config.target = ctx.gjs.editor;
              if(clm){
                $clm = new clm.ClassTagsView({
                  collection: new clm.ClassTags([]),
                  config: clm.config,
                }).render();
                ctx.$fixture.append($clm.el);
              }
              return $clm;
            };

            before(function () {
              this.$fixtures  = $("#fixtures");
              this.$fixture   = $('<div id="ClassManager-fixture"></div>');
            });

            beforeEach(function () {
              var Grapes = GrapesJS;
              this.gjs = Grapes.init({
                stylePrefix: '',
                storage: { autoload: 0, type:'none' },
                assetManager: {
                  storageType: 'none',
                },
                container: '#ClassManager-fixture',
              });
              this.$fixture.empty().appendTo(this.$fixtures);
              this.gjs.render();
            });

            afterEach(function () {
              delete this.gjs;
            });

            after(function () {
              this.$fixture.remove();
            });

            describe('Interaction with Components', function() {

              beforeEach(function () {
                this.wrapper = this.gjs.editor.get('Components').getWrapper().get('components');
                this.$clm = instClassTagViewer(this);
              });

              afterEach(function () {
                delete this.wrapper;
                delete this.$clm;
              });

              it('Assign correctly new class to component', function() {
                var model = this.wrapper.add({});
                model.get('classes').length.should.equal(0);
                this.gjs.editor.set('selectedComponent', model);
                this.$clm.addNewTag('test');
                model.get('classes').length.should.equal(1);
                model.get('classes').at(0).get('name').should.equal('test');
              });

              it('Classes from components are correctly imported inside main container', function() {
                var model = this.wrapper.add([
                  { classes: ['test11', 'test12', 'test13'] },
                  { classes: ['test11', 'test22', 'test22'] },
                ]);
                this.gjs.editor.get('ClassManager').getClasses().length.should.equal(4);
              });

              it('Class imported into component is the same model from main container', function() {
                var model = this.wrapper.add({ classes: ['test1'] });
                var clModel = model.get('classes').at(0);
                var clModel2 = this.gjs.editor.get('ClassManager').getClasses().at(0);
                clModel.should.deep.equal(clModel2);
              });

              it('Can assign only one time the same class on selected component and the class viewer', function() {
                var model = this.wrapper.add({});
                this.gjs.editor.set('selectedComponent', model);
                this.$clm.addNewTag('test');
                this.$clm.addNewTag('test');
                model.get('classes').length.should.equal(1);
                model.get('classes').at(0).get('name').should.equal('test');
                this.$clm.collection.length.should.equal(1);
                this.$clm.collection.at(0).get('name').should.equal('test');
              });

              it('Removing from container removes also from selected component', function() {
                var model = this.wrapper.add({});
                this.gjs.editor.set('selectedComponent', model);
                this.$clm.addNewTag('test');
                this.$clm.collection.at(0).destroy();
                model.get('classes').length.should.equal(0);
              });

              it("Trigger correctly event on target with new class add", function() {
                var spy = sinon.spy();
                var model = this.wrapper.add({});
                this.gjs.editor.set('selectedComponent', model);
                this.$clm.addNewTag('test');
                this.gjs.editor.on("targetClassAdded", spy);
                this.$clm.addNewTag('test');
                spy.called.should.equal(false);
                this.$clm.addNewTag('test2');
                spy.called.should.equal(true);
              });

            });

        });
      }
    };

});