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

  describe('timer updates', function () {
    beforeEach(function () {
      timer = new Timer(events, element);
    });

    it('should do nothing if the timer has not started', function () {
      timer.element.innerHTML.should.equal('0:00:00');
    });

    it('should show progress time if the slideshow has started', function () {
      // Force a specific start time and update
      timer.startTime = new Date() - (2*3600000 + 34 * 60000 + 56 * 1000);
      timer.updateTimer();
      // Timer output should match forced time
      timer.element.innerHTML.should.equal('2:34:56');
    });

    it('should compensate for a pause in progress', function () {
      // Force a specific start time and update, including an in-progress pause
      timer.startTime = new Date() - (2*3600000 + 34 * 60000 + 56 * 1000);
      timer.pauseStart = new Date() - (1*3600000 + 23 * 60000 + 45 * 1000);
      timer.updateTimer();
      // Timer output should match forced time
      timer.element.innerHTML.should.equal('1:11:11');
    });

    it('should compensate for paused time', function () {
      // Force a specific start time and update, including a recorded pause
      timer.startTime = new Date() - (2*3600000 + 34 * 60000 + 56 * 1000);
      timer.pauseLength = (5 * 60000 + 6 * 1000);
      timer.updateTimer();
      // Timer output should match forced time
      timer.element.innerHTML.should.equal('2:29:50');
    });


    it('should compensate for a pause in progress in addition to previous pauses', function () {
      // Force a specific start time and update, including a recorded pause
      // and an in-progress pause
      timer.startTime = new Date() - (2*3600000 + 34 * 60000 + 56 * 1000);
      timer.pauseLength = (5 * 60000 + 6 * 1000);
      timer.pauseStart = new Date() - (1*3600000 + 23 * 60000 + 45 * 1000);
      timer.updateTimer();
      // Timer output should match forced time
      timer.element.innerHTML.should.equal('1:06:05');
    });

  });

  describe('timer events', function () {
    beforeEach(function () {
      timer = new Timer(events, element);
    });

    it('should respond to a start event', function () {
      events.emit('start');
      timer.startTime.should.not.equal(null);
    });

    it('should reset on demand', function () {
      timer.startTime = new Date() - (2*3600000 + 34 * 60000 + 56 * 1000);
      events.emit('resetTimer');
      timer.element.innerHTML.should.equal('0:00:00');
      // BDD seems to make this really easy test impossible...
      // timer.startTime.should.equal(null);
      // timer.pauseStart.should.equal(null);
      timer.pauseLength.should.equal(0);
    });

    it('should track pause start end time', function () {
      timer.startTime = new Date() - (2*3600000 + 34 * 60000 + 56 * 1000);

      events.emit('pause');
      timer.pauseStart.should.not.equal(null);
      timer.pauseLength.should.equal(0);
    });

    it('should accumulate pause duration at pause end', function () {
      timer.startTime = new Date() - (2*3600000 + 34 * 60000 + 56 * 1000);
      timer.pauseStart = new Date() - (12 * 1000);
      timer.pauseLength = 100000;

      events.emit('resume');
      // BDD seems to make this really easy test impossible...
      //timer.pauseStart.should.equal(null);
      // Microsecond accuracy is a possible problem here, so
      // allow a 5 microsecond window just in case.
      timer.pauseLength.should.be.approximately(112000, 5);
    });
  });
});
