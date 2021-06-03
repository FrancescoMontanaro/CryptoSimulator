var assert = require('assert');
var unirest = require('unirest');

describe('getCryptoData integrity test 1', function() {
  describe('#getCryptoData()', function() {
    it('should return [] when the assets list is empty', function() {
      assert.equal(getCryptoData({assets: [], start: "", end: "", interval: ""}), "");
    });
  });
});

describe('getCryptoData integrity test 2', function() {
    describe('#getCryptoData()', function() {
      it('should return [] when the start period list is not a valid date', function() {
        assert.equal(getCryptoData({assets: ["BTC"], start: "", end: "", interval: ""}), "");
      });
    });
});


describe('getCryptoData integrity test 3', function() {
    describe('#getCryptoData()', function() {
      it('should return [] when the end period list is not a valid date', function() {
        assert.equal(getCryptoData({assets: ["BTC"], start: "2020-02-01", end: null, interval: ""}), "");
      });
    });
});

describe('getCryptoData integrity test 4', function() {
    describe('#getCryptoData()', function() {
      it('should return [] when the selected interval list is null', function() {
        assert.equal(getCryptoData({assets: ["BTC"], start: "2020-02-01", end: null, interval: null}), "");
      });
    });
});

describe('getCryptoData result test', function() {
    describe('#getCryptoData()', function() {
      it('should return a 200 statusCode if all the input arguments are corrected', function() {
        assert.equal(getCryptoData({assets: ["BTC"], start: "2020-02-01", end: "2020-01-01", interval: '1d'}), 200);
      });
    });
});


function getCryptoData(data){
    var assets = data.assets;
    var start = data.start;
    var end = data.end;
    var interval = data.interval;

    if(assets.length == 0){
        return [];
    }
    if(start == null || start == "" || end == null || end == ""){
        return [];
    }
    if(interval == null || interval == ""){
        return [];
    }

    promises = [];
    for(asset of assets){
        promises.push(getAssetData(asset, start, end, interval));
    }

    return Promise.all(promises).then(responses =>{
        var data = [];
        responses.forEach(response =>{
            data.push(response.body);
        })
        return {statusCode: 200, body: data};
    }).catch(error =>{
        return {error};
    })
}

function getAssetData(asset, start, end, interval){
    var requestUrl = 'https://data.messari.io/api/v1/assets/' + asset + '/metrics/price/time-series?start=' + start + '&end=' + end + '&interval=' + interval;
    return new Promise((resolve, reject) =>{
        unirest.get(requestUrl).then(response => {
            if(response.statusCode === 200){
                return resolve({statusCode: 200, body: response.body.data});
            }
            else{
                return reject(response);
            }
        }).catch(error =>{
            reject(error);
        })

    })
}