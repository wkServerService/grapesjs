var path = 'ClassManager/view/';
define([path + 'ClassTagsView', 'ClassManager/model/ClassTags'],
  function(ClassTagsView, ClassTags) {

    return {
      run : function(){
          describe('ClassTagsView', function() {

            before(function () {
              this.$fixtures  = $("#fixtures");
              this.$fixture   = $('<div class="classtag-fixture"></div>');
            });

            beforeEach(function () {
              this.target = { get: function(){} };
              this.coll  = new ClassTags();
              _.extend(this.target, Backbone.Events);

              this.view = new ClassTagsView({
                config : { target: this.target },
                collection: this.coll
              });

              this.targetStub = {
                addClass: function(v){ return {name: v}; }
              };

              this.compTargetStub = {
                  get: function(){ return { add: function(){} }}
              };

              this.$fixture.empty().appendTo(this.$fixtures);
              this.$fixture.html(this.view.render().el);
              this.btnAdd = this.view.$el.find('#' + this.view.addBtnId);
              this.input = this.view.$el.find('input#' + this.view.newInputId);
              this.$tags = this.$fixture.find('#tags-c');
              this.$states = this.$fixture.find('#states');
              this.$statesC = this.$fixture.find('#input-c');
            });

            afterEach(function () {
              delete this.view.collection;
            });

            after(function () {
              this.$fixture.remove();
            });

            it('Object exists', function() {
              ClassTagsView.should.be.exist;
            });

            it('Not tags inside', function() {
              this.$tags.html().should.equal('');
            });

            it('Add new tag triggers correct method', function() {
              sinon.stub(this.view, "addToClasses");
              this.coll.add({ name: 'test' });
              this.view.addToClasses.calledOnce.should.equal(true);
            });

            it('Start new tag creation', function() {
              this.btnAdd.click();
              (this.btnAdd.css('display') == 'none').should.equal(true);
              (this.input.css('display') !== 'none').should.equal(true);
            });

            it('Stop tag creation', function() {
              this.btnAdd.click();
              this.input.val('test')
              this.input.blur();
              (this.btnAdd.css('display') !== 'none').should.equal(true);
              (this.input.css('display') == 'none').should.equal(true);
              this.input.val().should.equal('');
            });

            it('Check keyup of ESC on input', function() {
              this.btnAdd.click();
              sinon.stub(this.view, "addNewTag");
              this.input.trigger({
                type: 'keyup',
                keyCode: 13
               });
              this.view.addNewTag.calledOnce.should.equal(true);
            });

            it('Check keyup on ENTER on input', function() {
              this.btnAdd.click();
              sinon.stub(this.view, "endNewTag");
              this.input.trigger({
                type: 'keyup',
                keyCode: 27
               });
              this.view.endNewTag.calledOnce.should.equal(true);
            });

            it('Collection changes on update of target', function() {
              this.coll.add({ name: 'test' });
              this.target.trigger('change:selectedComponent');
              this.coll.length.should.equal(0);
            });

            it('Collection reacts on reset', function() {
              this.coll.add([{ name: 'test1' }, { name: 'test2' }]);
              sinon.stub(this.view, "addToClasses");
              this.coll.trigger('reset');
              this.view.addToClasses.calledTwice.should.equal(true);
            });

            it("Don't accept empty tags", function() {
              this.view.addNewTag('');
              this.$tags.html().should.equal('');
            });

            it("Accept new tags", function() {
              sinon.stub(this.target, "get").returns(this.targetStub);
              this.view.compTarget = this.compTargetStub;
              this.view.addNewTag('test');
              this.view.compTarget = this.compTargetStub;
              this.view.addNewTag('test2');
              this.$tags.children().length.should.equal(2);
            });

            it("New tag correctly added", function() {
              this.coll.add({ label: 'test' });
              this.$tags.children().first().find('#tag-label input').val().should.equal('test');
            });

            it("States are hidden in case no tags", function() {
              this.view.updateStateVis();
              this.$statesC.css('display').should.equal('none');
            });

            it("States are visible in case of more tags inside", function() {
              this.coll.add({ label: 'test' });
              this.view.updateStateVis();
              this.$statesC.css('display').should.equal('block');
            });

            it("Update state visibility on new tag", function() {
              sinon.stub(this.view, "updateStateVis");
              sinon.stub(this.target, "get").returns(this.targetStub);
              this.view.compTarget = this.compTargetStub;
              this.view.addNewTag('test');
              this.view.updateStateVis.called.should.equal(true);
            });

            it("Update state visibility on removing of the tag", function() {
              sinon.stub(this.target, "get").returns(this.targetStub);
              this.view.compTarget = this.compTargetStub;
              this.view.addNewTag('test');
              sinon.stub(this.view, "updateStateVis");
              this.coll.remove(this.coll.at(0));
              this.view.updateStateVis.calledOnce.should.equal(true);
            });

            it("Output correctly state options", function() {
              var view = new ClassTagsView({
                config : {
                  target: this.target,
                  states: [ { name: 'testName', label: 'testLabel' } ],
                },
                collection: this.coll
              });
              view.getStateOptions().should.equal('<option value="testName">testLabel</option>');
            });

            describe('Should be rendered correctly', function() {
              it('Has label', function() {
                this.view.$el.find('#label').should.have.property(0);
              });
              it('Has tags container', function() {
                this.view.$el.find('#tags-c').should.have.property(0);
              });
              it('Has add button', function() {
                this.view.$el.find('#add-tag').should.have.property(0);
              });
              it('Has states input', function() {
                this.view.$el.find('#states').should.have.property(0);
              });
            });

        });
      }
    };

});