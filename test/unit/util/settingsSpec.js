'use strict';

var expect = chai.expect;

describe('settings utils', function() {

  it('should check invalid', function(done) {
    expect(cbcclient.settingsUtils.blobIsValid({})).to.be.false;
    done();
  });

  it('should be false', function(done) {
    expect(cbcclient.settingsUtils.hasSetting()).to.be.false;
    done();
  });

  it('should be false 2', function(done) {
    expect(cbcclient.settingsUtils.hasSetting({}, 's')).to.be.false;
    done();
  });

  it('should be false 3', function(done) {
    expect(cbcclient.settingsUtils.hasSetting({ data : {} }, 's')).to.be.false;
    done();
  });

  it('should be false 4', function(done) {
    expect(cbcclient.settingsUtils.hasSetting({ data : { clients : {} } }, 's')).to.be.false;
    done();
  });

  it('should be false 4', function(done) {
    expect(cbcclient.settingsUtils.hasSetting({ data : { clients : false } }, 's')).to.be.false;
    done();
  });

  it('should be false 5', function(done) {
    expect(cbcclient.settingsUtils.hasSetting({ data : { clients : { cbctradecom : {} } } }, 's')).to.be.false;
    done();
  });

  it('should be false 6', function(done) {
    expect(cbcclient.settingsUtils.hasSetting({ data : { clients : { cbctradecom : { s: { } } } } }, 's.x')).to.be.false;
    done();
  });

  it('should be true', function(done) {
    expect(cbcclient.settingsUtils.hasSetting({ data : { clients : { cbctradecom : { s: false } } } }, 's')).to.be.true;
    done();
  });

  it('should be true 2', function(done) {
    expect(cbcclient.settingsUtils.hasSetting({ data : { clients : { cbctradecom : { s: { x : 'f' } } } } }, 's.x')).to.be.true;
    done();
  });

  it('should be true 3', function(done) {
    expect(cbcclient.settingsUtils.hasSetting({ data : { clients : { cbctradecom : { s: { x : undefined } } } } }, 's.x')).to.be.true;
    done();
  });

  it('should get settings', function(done) {
    expect(cbcclient.settingsUtils.getSetting({ data : { clients : { cbctradecom : { s: 'got it' } } } }, 's')).to.equal('got it');
    done();
  });

  it('should get settings 2', function(done) {
    expect(cbcclient.settingsUtils.getSetting({ data : { clients : { cbctradecom : { s: { x : 'got it'} } } } }, 's.x')).to.equal('got it');
    done();
  });

  it('should get settings 3', function(done) {
    expect(cbcclient.settingsUtils.getSetting({ data : { clients : { cbctradecom : { s: { x : 'got it'} } } } }, 's.x', 'it is default')).to.equal('got it');
    done();
  });

  it('should get settings 4', function(done) {
    expect(cbcclient.settingsUtils.getSetting({ data : { clients : { cbctradecom : { s: { y : 'got it'} } } } }, 's.x', 'it is default')).to.equal('it is default');
    done();
  });
});
