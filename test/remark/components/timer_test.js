var EventEmitter = require('events').EventEmitter
  , Timer = require('components/timer')
  ;

describe('Timer', function () {
  var events
    , element
    , timer
    ;

  beforeEach(function () {
    events = new EventEmitter();
    element = document.createElement('div');
  });

  describe('timer events', function () {
    beforeEach(function () {
      timer = new Timer(events, element);
    });

    it('should be in an initial state', function(){
      timer.state.should.equal(timer.INITIAL);
    });

    it('should respond to a startTimer event', function () {
      events.emit('startTimer');

      timer.state.should.equal(timer.RUNNING);
    });

    it('should respond to a pauseTimer event', function () {
      events.emit('pauseTimer');

      timer.state.should.equal(timer.PAUSED);
    });

    it('should respond to a resetTimer event', function () {
      events.emit('resetTimer');

      timer.state.should.equal(timer.INITIAL);
    });

    describe('sequence of events', function(){
      it('should be in a correct state after startTimer, pauseTimer', function () {
        ['startTimer', 'pauseTimer'].forEach(function(event){
          events.emit(event);
        });

        timer.state.should.equal(timer.PAUSED);
      });

      it('should be in a correct state after startTimer, resetTimer', function () {
        ['startTimer', 'resetTimer'].forEach(function(event){
          events.emit(event);
        });

        timer.state.should.equal(timer.INITIAL);
      });

      it('should be in a correct state after startTimer, pauseTimer, startTimer', function () {
        ['startTimer', 'pauseTimer', 'startTimer'].forEach(function(event){
          events.emit(event);
        });

        timer.state.should.equal(timer.RUNNING);
      });

      it('should be in a correct state after startTimer, pauseTimer, resetTimer', function () {
        ['startTimer', 'pauseTimer', 'resetTimer'].forEach(function(event){
          events.emit(event);
        });

        timer.state.should.equal(timer.INITIAL);
      });
     });
   });
});
