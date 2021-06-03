const functions = require('firebase-functions');
var unirest = require('unirest');


exports.getCryptoData = functions.https.onCall((data, context) => {
    var assets = data.assets;
    var start = data.start;
    var end = data.end;
    var interval = data.interval;

    if(assests.length == 0){
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
});


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