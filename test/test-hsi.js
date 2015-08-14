var expect    = require("chai").expect;
var hpss = require("../app.js");
var hsi = hpss.hsi;

describe("HSI Tests", function() {
    describe("#basic", function() {
        it("version", function(done) {
            hsi.version(function(err, out){
                console.dir(out);
                done();
            });
        });
        it("help", function(done) {
            hsi.help(function(err, lines){
                expect(lines).to.have.length.above(100);
                //console.log(out);
                done();
            });
        });
    });

    describe("#ls", function() {
        it("ls(missing)", function(done) {
            hsi.ls('_missing_', function(err, out){
                expect(err.code).to.equal(64);
                done();
            });
        });
        /*
        it("ls(valid)", function(done) {
            hsi.ls('intopo/historic/geopdf/250k/in_evansville_156913_1957_250000_geo.zip', function(err, files){
                expect(err).to.be.a('null');
                expect(files).to.have.length(3);
                console.dir(files);
                done();
            });
        });
        */
        it("ls(valid)", function(done) {
            hsi.ls('isos', function(err, files){
                expect(err).to.be.a('null');
                expect(files).to.have.length(3);
                console.dir(files);
                done();
            });
        });
    });

    describe("#touch", function() {
        it("touch a directory /hpss (should be no-op)", function(done) {
            hsi.touch('/hpss', function(err, out) {
                expect(err).to.be.a('null');
                console.dir(out);
                done();
            });
        });
        it("touch in a non-accessible directory", function(done) {
            hsi.touch('/hpss/_test.txt', function(err, out) {
                expect(err).to.be.a('null');
                done();
            });
        });
        it("touch a missing location /hoge/something", function(done) {
            hsi.touch('/hoge/something', function(err) {
                expect(err.code).to.equal(72);
                done();
            });
        });
        it("touch _testfile", function(done) {
            hsi.touch('_testfile', function(err) {
                expect(err).to.be.a('null');
                done();
            });
        });
    });

    describe("#rm", function() {
        it("rm non-existing file should return HPSS_EACCESS:72", function(done) {
            hsi.rm('_noexist', function(err, out) {
                expect(err.code).to.equal(72);
                done();
            });
        });
        /*
        it("rm non-existing file should return HPSS_EACCESS:72", function(done) {
            hsi.rm('', function(err, out) {
                expect(err.code).to.equal(72);
                done();
            });
        });
        */
        it("rm directory is no-op", function(done) {
            hsi.rm('/hpss/h/a/hayashis', function(err, out) {
                expect(err).to.be.a('null');
                done();
            });
        });
        it("rm _testfile", function(done) {
            hsi.rm('_testfile', function(err, out) {
                expect(err).to.be.a('null');
                done();
            });
        });
    });

    describe("#mkdir", function() {
        it("non existing path - should cause HPSS_EACCES", function(done) {
            hsi.mkdir('/nogo', function(err, files){
                expect(err.code).to.equal(72);
                done();
            });
        });
        it("existing path - should be no-op", function(done) {
            hsi.mkdir('test', function(err, files){
                expect(err).to.be.a('null');
                done();
            });
        });
        it("should create dir", function(done) {
            hsi.mkdir('_test', function(err, files){
                expect(err).to.be.a('null');
                done();
            });
        });
    });

    describe("#rmdir", function() {
        it("invalid path - hsi skips non-existing dir instead of reportint error - WHY?", function(done) {
            hsi.rmdir('/_bogus_', function(err, files){
                expect(err).to.be.a('null');
                done();
            });
        });
        it("non accessible path - should report 'Search or write permission denied: /hpss/h/a/hacker'", function(done) {
            hsi.rmdir('/hpss/h/a/hacker', function(err, files){
                expect(err.code).to.equal(64);
                done();
            });
        });
        it("non-empty dir", function(done) {
            hsi.rmdir('isos', function(err, files){
                expect(err.code).to.equal(64);
                done();
            });
        });
        it("should remove empty dir", function(done) {
            hsi.rmdir('_test', function(err, files){
                expect(err).to.be.a('null');
                done();
            });
        });
    });


    describe("#put", function() {
        it("put-missing", function(done) {
            hsi.put('/usr/local/tmp/_missing', 'test', function(err) {
                expect(err.code).to.equal('ENOENT');  //spawn chould generate error event
                done();
            });
        });
        it("put-remotemissing", function(done) {
            hsi.put('/usr/local/tmp/node-v0.10.29-linux-x64.tar.gz', '_missing_/filename', function(err, lines) {
                expect(err.code).to.be.equal(72); 
                done();
            });
        });
        it("put-small", function(done) {
            hsi.put('/usr/local/tmp/node-v0.10.29-linux-x64.tar.gz', 'test/node-v0.10.29-linux-x64.tar.gz', function(err, lines) {
                expect(err).to.be.a('null');
                console.dir(lines);
                done();
            });
        });
        it("put-medium", function(done) {
            this.timeout(30*1000); //30 seconds should be enough
            hsi.put('/usr/local/tmp/git.tar.gz', 'test/git.tar.gz', function(err, lines) {
                expect(err).to.be.a('null');
                console.dir(lines);
                done();
            }, function(progress) {
                console.dir(progress);
            });
        });
    });

    describe("#get", function() {
        it("get-wronglocal", function(done) {
            hsi.get('isos/CentOS-7-x86_64-Everything-1503-01.iso', '/usr/local/__noexists__', function(err) {
                expect(err.code).to.equal('ENOENT');  //spawn chould generate error event
                done();
            });
        });
        it("get-localnonaccessible", function(done) {
            hsi.get('isos/CentOS-7-x86_64-Everything-1503-01.iso', '/root', function(err) {
                expect(err.code).to.equal('EACCES');  //spawn chould generate error event
                done();
            });
        });
        it("get-wrongremote", function(done) {
            hsi.get('isos/__nonexist', '/usr/local/tmp', function(err) {
                expect(err.code).to.be.equal(64); // can't ls before get
                done();
            });
        });

        it("get-small", function(done) {
            //hsi.get('isos/CentOS-7-x86_64-Everything-1503-01.iso', '/usr/local/tmp', function(err) {
            hsi.get('test/node-v0.10.29-linux-x64.tar.gz', '/usr/local/tmp', function(err, lines) {
                expect(err).to.be.a('null');
                console.dir(lines);
                done();
            }, function(progress) {
                console.dir(progress);
            });
        });

        it("get-medium", function(done) {
            this.timeout(30*1000); //30 seconds should be enough
            hsi.get('test/git.tar.gz', '/usr/local/tmp', function(err, lines) {
                expect(err).to.be.a('null');
                console.dir(lines);
                done();
            }, function(progress) {
                console.dir(progress);
            });
        });
/*
        it("get-bigish", function(done) {
            this.timeout(600*1000); //5 minutes should be enough
            hsi.get('isos/CentOS-7-x86_64-Everything-1503-01.iso', '/usr/local/tmp', function(err, lines) {
                expect(err).to.be.a('null');
                done();
            }, function(progress) {
                console.dir(progress);
            });
        });
*/
    });

    describe("#lastly", function() {
        /*
        it("quit", function(done) {
            hsi.quit(function(code, signal) {
                console.log("quit with code:"+code);
                done();
            });
        });
        */
    });
});