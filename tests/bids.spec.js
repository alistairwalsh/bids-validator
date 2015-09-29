var assert = require('chai').assert
var validate = require('../index.js');
var BIDS   = require('../validators/bids');
var request = require('sync-request');
var fs = require('fs');
var AdmZip = require('adm-zip');
var path = require('path');
var Test = require("mocha/lib/test");

function getDirectories(srcpath) {
    return fs.readdirSync(srcpath).filter(function(file) {
        return fs.statSync(path.join(srcpath, file)).isDirectory();
    });
}



describe('BIDS', function(){

    it('should verify that NifTi files are compressed using gzip.', function () {
        var fileList = {
            '0': {
                name: 'sub-15_inplaneT2.nii.gz',
                path: '/sub-15/anat/sub-15_inplaneT2.nii.gz'
            },
            '1': {
                name: 'sub-15_inplaneT2.nii',
                path: '/sub-15/anat/sub-15_inplaneT2.nii'
            }
        };

        BIDS.fullTest(fileList, function (errors) {
            assert.equal(errors.length, 1);
        });
    });

});
var suite = describe('BIDS example datasets ', function() {
    this.timeout(100000);

    before(function(done) {
        if (!fs.existsSync("tests/data")) {
            console.log('downloading test data')
            response = request("GET", "http://github.com/INCF/BIDS-examples/archive/1.0.0-rc1u2.zip")
            fs.mkdirSync("tests/data")
            fs.writeFileSync("tests/data/examples.zip", response.body)
            var zip = new AdmZip("tests/data/examples.zip");
            console.log('unzipping test data')
            zip.extractAllTo("tests/data/", true);
        }

        datasetDirectories = getDirectories("tests/data/BIDS-examples-1.0.0-rc1u2/")

        datasetDirectories.forEach(function testDataset(path){
            suite.addTest(new Test(path, function (isdone){
                validate.BIDS("tests/data/BIDS-examples-1.0.0-rc1u2/" + path + "/", function (errors, warnings) {
                    assert.deepEqual(errors, []);
                    assert.deepEqual(warnings, []);
                    isdone();
                });
            }));
        });
        done();
    });

    // we need to have at least one non-dynamic test
    return it('dummy test', function() {
        require('assert').ok(true);
    });
});

var suiteAnat = describe('BIDS.isAnat', function(){
    before(function(done) {
        var goodFilenames = ["/sub-15/anat/sub-15_inplaneT2.nii.gz",
            "/sub-15/ses-12/anat/sub-15_ses-12_inplaneT2.nii.gz",
            "/sub-16/anat/sub-16_T1w.nii.gz",
            "/sub-16/anat/sub-16_T1w.json",
            "/sub-16/anat/sub-16_run-01_T1w.nii.gz",
            "/sub-16/anat/sub-16_acq-highres_T1w.nii.gz",
            "/sub-16/anat/sub-16_rec-mc_T1w.nii.gz",
        ];

        goodFilenames.forEach(function (path) {
            suiteAnat.addTest(new Test("isAnat('" + path + "') === true", function (isdone){
                assert.equal(BIDS.isAnat(path), true);
                isdone();
            }));
        });

        var badFilenames = ["/sub-1/anat/sub-15_inplaneT2.nii.gz",
            "/sub-15/ses-12/anat/sub-15_inplaneT2.nii.gz",
            "/sub-16/anat/sub-16_T1.nii.gz",
            "blaaa.nii.gz",
            "/sub-16/anat/sub-16_run-second_T1w.nii.gz",
            "/sub-16/anat/sub-16_run-01_rec-mc_T1w.nii.gz",];

        badFilenames.forEach(function (path) {
            suiteAnat.addTest(new Test("isAnat('" + path + "') === false", function (isdone){
                assert.equal(BIDS.isAnat(path), false);
                isdone();
            }));
        });
        done();
    });

    // we need to have at least one non-dynamic test
    return it('dummy test', function() {
        require('assert').ok(true);
    });
});


var suiteFunc = describe('BIDS.isFunc', function(){
    before(function(done) {
        var goodFilenames = ["/sub-15/func/sub-15_task-0back_bold.nii.gz",
            "/sub-15/ses-12/func/sub-15_ses-12_task-0back_bold.nii.gz",
            "/sub-16/func/sub-16_task-0back_bold.json",
            "/sub-16/func/sub-16_task-0back_run-01_bold.nii.gz",
            "/sub-16/func/sub-16_task-0back_acq-highres_bold.nii.gz",
            "/sub-16/func/sub-16_task-0back_rec-mc_bold.nii.gz",
        ];

        goodFilenames.forEach(function (path) {
            suiteFunc.addTest(new Test("isFunc('" + path + "') === true", function (isdone){
                assert.equal(BIDS.isFunc(path), true);
                isdone();
            }));
        });

        var badFilenames = ["/sub-1/func/sub-15_inplaneT2.nii.gz",
            "/sub-15/ses-12/func/sub-15_inplaneT2.nii.gz",
            "/sub-16/func/sub-16_T1.nii.gz",
            "blaaa.nii.gz",
            "/sub-16/func/sub-16_run-second_T1w.nii.gz",
            "/sub-16/func/sub-16_task-0-back_rec-mc_bold.nii.gz",
            "/sub-16/func/sub-16_run-01_rec-mc_T1w.nii.gz",];

        badFilenames.forEach(function (path) {
            suiteFunc.addTest(new Test("isFunc('" + path + "') === false", function (isdone){
                assert.equal(BIDS.isFunc(path), false);
                isdone();
            }));
        });
        done();
    });

    // we need to have at least one non-dynamic test
    return it('dummy test', function() {
        require('assert').ok(true);
    });
});


var suiteTop = describe('BIDS.isTopLevel', function(){
    before(function(done) {
        var goodFilenames = ["/README",
            "/CHANGES",
            "/dataset_description.json",
            "/ses-pre_task-rest_bold.json",
            "/dwi.bval",
            "/dwi.bvec"
        ];

        goodFilenames.forEach(function (path) {
            suiteTop.addTest(new Test("isTopLevel('" + path + "') === true", function (isdone){
                assert.equal(BIDS.isTopLevel(path), true);
                isdone();
            }));
        });

        var badFilenames = ["/readme.txt",
            "/changelog",
            "/dataset_description.yml",
            "/ses.json"];

        badFilenames.forEach(function (path) {
            suiteTop.addTest(new Test("isTopLevel('" + path + "') === false", function (isdone){
                assert.equal(BIDS.isTopLevel(path), false);
                isdone();
            }));
        });
        done();
    });

    // we need to have at least one non-dynamic test
    return it('dummy test', function() {
        require('assert').ok(true);
    });
});

var suiteSession = describe('BIDS.isSessionLevel', function(){
    before(function(done) {
        var goodFilenames = ["/sub-12/sub-12_scans.tsv",
            "/sub-12/ses-pre/sub-12_ses-pre_scans.tsv",
        ];

        goodFilenames.forEach(function (path) {
            suiteSession.addTest(new Test("isSessionLevel('" + path + "') === true", function (isdone){
                assert.equal(BIDS.isSessionLevel(path), true);
                isdone();
            }));
        });

        var badFilenames = ["/sub-12/sub-12.tsv",
            "/sub-12/ses-pre/sub-12_ses-pre_scan.tsv"];

        badFilenames.forEach(function (path) {
            suiteSession.addTest(new Test("isSessionLevel('" + path + "') === false", function (isdone){
                assert.equal(BIDS.isSessionLevel(path), false);
                isdone();
            }));
        });
        done();
    });

    // we need to have at least one non-dynamic test
    return it('dummy test', function() {
        require('assert').ok(true);
    });
});

var suiteDWI = describe('BIDS.isDWI', function(){
    before(function(done) {
        var goodFilenames = ["/sub-12/dwi/sub-12_dwi.nii.gz",
            "/sub-12/ses-pre/dwi/sub-12_ses-pre_dwi.nii.gz",
            "/sub-12/ses-pre/dwi/sub-12_ses-pre_dwi.bvec",
            "/sub-12/ses-pre/dwi/sub-12_ses-pre_dwi.bval",
        ];

        goodFilenames.forEach(function (path) {
            suiteDWI.addTest(new Test("isDWI('" + path + "') === true", function (isdone){
                assert.equal(BIDS.isDWI(path), true);
                isdone();
            }));
        });

        var badFilenames = ["/sub-12/sub-12.tsv",
            "/sub-12/ses-pre/sub-12_ses-pre_scan.tsv",
            "/sub-12/ses-pre/dwi/sub-12_ses-pre_dwi.bvecs",
            "/sub-12/ses-pre/dwi/sub-12_ses-pre_dwi.bvals"];

        badFilenames.forEach(function (path) {
            suiteDWI.addTest(new Test("isDWI('" + path + "') === false", function (isdone){
                assert.equal(BIDS.isDWI(path), false);
                isdone();
            }));
        });
        done();
    });

    // we need to have at least one non-dynamic test
    return it('dummy test', function() {
        require('assert').ok(true);
    });
});