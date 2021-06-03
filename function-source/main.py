import flask
import googleapiclient.discovery
import requests
import pandas as pd
import json
import numpy as np
import concurrent.futures


def getPredictions(request):
    r = json.loads(request.data)
    cryptos = r["cryptos"]

    if(len(cryptos) == 0):
        return json.dumps({"results": []})

    results = []
    with concurrent.futures.ThreadPoolExecutor(max_workers=len(cryptos)) as executor:
        tasks = {executor.submit(get_crypto_predictions, crypto): crypto for crypto in cryptos}
        for future in concurrent.futures.as_completed(tasks):
            results.append(future.result())

    return json.dumps({"results": results})  


def get_crypto_predictions(crypto):
    endpoint = 'https://min-api.cryptocompare.com/data/histoday'
    res = requests.get(endpoint + '?fsym=' + crypto + '&tsym=USD&limit=100')
    hist = pd.DataFrame(json.loads(res.content)['Data'])
    hist = hist.set_index('time')
    hist.index = pd.to_datetime(hist.index, unit='s')
    target_col = 'close'
    hist=pd.DataFrame(hist[target_col])

    last_value = hist.tail(1).iloc[0]['close']

    input_data=extract_window_data(hist,5,True)
    input_data = input_data.tolist()

    rawPredictions = predict('cryptosimulator-2020', 'model_1', input_data)

    predictions = []
    predictions.append((1 + rawPredictions[0]['activation_2'][0]) * last_value)

    for i in range(1,len(rawPredictions)):
        value = 1 + rawPredictions[i]['activation_2'][0]
        predictions.append(last_value * value)

    return {"crypto": crypto, "predictions": predictions}  


def normalise_zero_base(df):
    return df / df.iloc[0] - 1


def extract_window_data(df, window_len=5, zero_base=False):
    window_data = []
    for idx in range(len(df) - window_len):
        tmp = df[idx: (idx + window_len)].copy()
        if zero_base:
            tmp = normalise_zero_base(tmp)
        window_data.append(tmp.values)
    return np.array(window_data)


def predict(project, model, instances, version=None):
    service = googleapiclient.discovery.build('ml', 'v1')
    name = 'projects/{}/models/{}'.format(project, model)

    if version is not None:
        name += '/versions/{}'.format(version)

    response = service.projects().predict(
        name=name,
        body={'instances': instances}
    ).execute()

    if 'error' in response:
        raise RuntimeError(response['error'])

    return response['predictions']