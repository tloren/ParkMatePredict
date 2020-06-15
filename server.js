var express = require("express");
var app = express();
var cfenv = require("cfenv");
var request = require("request");
const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
const btoa = require("btoa");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
dotenv.config()
app.use(bodyParser.urlencoded({
    extended: false
}));
// parse application/json
app.use(bodyParser.json())

const wml_credentials = new Map();

// -------------------Prediction--------------------
function apiPost(scoring_url, token, mlInstanceID, payload, loadCallback, errorCallback){
    const oReq = new XMLHttpRequest();
    oReq.addEventListener("load", loadCallback);
    oReq.addEventListener("error", errorCallback);
    oReq.open("POST", scoring_url);
    oReq.setRequestHeader("Accept", "application/json");
    oReq.setRequestHeader("Authorization", token);
    oReq.setRequestHeader("ML-Instance-ID", mlInstanceID);
    oReq.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    oReq.send(payload);
}

processResponse = function(response) {
    results = []
    column_headers = ['-37.795,144.96', '-37.8,144.96', '-37.8,144.965', '-37.805,144.94',
       '-37.805,144.945', '-37.805,144.95', '-37.805,144.955',
       '-37.805,144.965', '-37.81,144.945', '-37.81,144.95', '-37.81,144.955',
       '-37.81,144.96', '-37.81,144.965', '-37.81,144.97', '-37.81,144.975',
       '-37.81,144.98', '-37.815,144.935', '-37.815,144.94', '-37.815,144.945',
       '-37.815,144.95', '-37.815,144.955', '-37.815,144.96',
       '-37.815,144.965', '-37.815,144.97', '-37.815,144.975',
       '-37.815,144.98', '-37.82,144.935', '-37.82,144.94', '-37.82,144.945',
       '-37.82,144.95', '-37.82,144.955', '-37.82,144.96', '-37.82,144.965',
       '-37.82,144.97', '-37.82,144.975', '-37.82,144.98', '-37.825,144.94',
       '-37.825,144.945', '-37.825,144.95', '-37.825,144.955',
       '-37.825,144.96', '-37.825,144.965', '-37.83,144.96', '-37.83,144.965',
       '-37.83,144.97', '-37.835,144.965', '-37.835,144.97']
    var header;
    for ( i=0; i<column_headers.length; i++){
        loc = column_headers[i].split(",");
        lat = loc[0];
        lon = loc[1];
        temp = {"lat":lat, "lon":lon, "val":response[i]}
        results.push(temp)
    }
    console.log(results)
    return results
}


app.get('/api/predict', function(req, res, next) {
    var apikey = process.env.apikey

    // Get an access token from IBM Cloud REST API
    var options = { url     : "https://iam.bluemix.net/oidc/token",
                    headers : { "Content-Type"  : "application/x-www-form-urlencoded" },
                    body    : "apikey=" + apikey + "&grant_type=urn:ibm:params:oauth:grant-type:apikey" };
    request.post( options, ( error, response, body ) => {
        var iam_token = JSON.parse( body )["access_token"];
        const wmlToken = "Bearer " + iam_token;
        const mlInstanceId = process.env.ml_instance_id
        values = JSON.stringify([[0.85714286, 1.        , 1.        , 0.76923077, 0.92957746,0.99186992, 0.99193548, 0.91428571, 0.42857143, 0.66779661,0.91262136, 0.875     , 0.95238095, 0.97794118, 0.94736842,1.        , 1.        , 0.97368421, 1.        , 0.89690722,0.97747748, 0.98717949, 0.97647059, 0.97916667, 0.87012987,0.97468354, 0.94444444, 0.98412698, 0.99186992, 0.9375    ,0.98305085, 0.95081967, 0.92307692, 1.        , 0.85714286,0.98666667, 0.97014925, 0.96666667, 0.93333333, 1.        ,0.83333333, 0.94117647, 0.95652174, 0.82325581, 0.87096774,1.        , 0.88888889],[0.85714286, 0.91666667, 0.95238095, 0.76923077, 0.91549296,1.        , 0.99193548, 0.91428571, 0.42857143, 0.66440678,0.88834951, 0.8125    , 0.98412698, 0.94852941, 0.94736842,1.        , 0.90909091, 0.97368421, 1.        , 0.8556701 ,0.98198198, 0.97435897, 0.97647059, 1.        , 0.86363636,0.97468354, 1.        , 1.        , 0.96747967, 0.9375    ,0.94915254, 0.96721311, 1.        , 1.        , 0.85714286,0.98666667, 0.91044776, 0.93333333, 1.        , 1.        ,0.91666667, 0.94117647, 0.91304348, 0.82790698, 0.85483871,0.98214286, 1.        ],[0.85714286, 1.        , 1.        , 0.76923077, 0.91549296,1.        , 0.99193548, 0.91428571, 0.42857143, 0.67118644,0.86893204, 0.9375    , 0.96825397, 0.93382353, 0.89473684,0.91666667, 1.        , 0.94736842, 1.        , 0.88659794,0.92792793, 0.88461538, 0.92941176, 0.9375    , 0.85714286,0.97468354, 1.        , 0.98412698, 0.98373984, 0.875     ,0.84745763, 0.93442623, 0.92307692, 0.93548387, 0.85714286,0.98666667, 0.95522388, 0.95      , 0.93333333, 1.        ,1.        , 0.88235294, 0.95652174, 0.82325581, 0.85483871,0.96428571, 1.        ]]);
        const payload = '{"fields": [], "values": ['+values+']}';
        const scoring_url = "https://us-south.ml.cloud.ibm.com/v3/wml_instances/"+mlInstanceId+"/deployments/51217d31-8eb7-4dfc-9eb4-69ba1550a131/online";
        apiPost(scoring_url, wmlToken, mlInstanceId, payload, function (resp) {
            let parsedPostResponse;
            try {
                parsedPostResponse = JSON.parse(this.responseText);
            } catch (ex) {
                throw ex
            }
            console.log("Scoring response");
            console.log(parsedPostResponse);
            res.json(processResponse(parsedPostResponse.values[0][0]))
        }, function (error) {
            throw error;
        });

    });
})

var port = process.env.PORT || 3000
app.listen(port, function() {
    console.log("To view your app, open this link in your browser: http://localhost:" + port);
});


