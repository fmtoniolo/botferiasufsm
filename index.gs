var API_KEY = '';
var API_SECRET_KEY = '';
var ACCESS_TOKEN = '';
var ACCESS_TOKEN_SECRET = '';
var WEATHER_API_KEY = '';
var CITY_ID = '3450083'; 


var ferias = new Date("2024-08-24"); // yyyy/mm/dd
var aulas = new Date("2024-03-11"); // yyyy/mm/dd
var hoje = new Date();
var dias = 86400000;
var diasParaFerias = Math.ceil((ferias - hoje) / dias);
var diasParaAulas = Math.ceil((aulas - hoje) / dias);
var weatherInfo = getWeatherInfo();

function contarDias(ehPeriodoDeAula) {
  return ehPeriodoDeAula ? diasParaFerias : diasParaAulas;
}

function send(message) {
  try {
    postTweet(weatherInfo + message);
    Logger.log("SUCCESS! MESSAGE:\n" + weatherInfo + message);
  } catch (e) {
    Logger.log(e);
  }
}

var estamosEmAula = contarDias(true);
var estamosEmFerias = contarDias(false);

if (estamosEmAula >= 0) {
  switch (estamosEmAula) {
    case 30:
      send("Já tá contando quanto falta pra não pegar exame? \nFalta um meszinho só!");
      break;
    case 15:
      send("Dentro de 15 dias estaremos oficialmente em férias.");
      break;
    case 7:
      send("Contagem regressiva, é a última semana!");
      break;
    case 1:
      send("Falta 1 (uma) unidade de dia para o fim do semestre na UFSM.");
      break;
    case 0:
      send("CHEGA! Tamo de férias.");
      break;
    default:
      send("Faltam " + estamosEmAula + " dias para as férias na UFSM.");
      break;
  }
} else {
  if (estamosEmFerias < 0) {
    send("Estamos em férias! Aguardando o calendário acadêmico. \n Ou estou bugado.");
  } else {
    switch (estamosEmFerias) {
      case 30:
        send("Falta um mês para as aulas na UFSM 👀");
        break;
      case 15:
        send("Faltam 15 dias para as aulas na UFSM 👀");
        break;
      case 7:
        send("Última semana de férias 🥺. Faltam 7 dias para as aulas na UFSM.");
        break;
      case 1:
        send("Falta 1 dia para as aulas na UFSM. Aproveitaram as férias?");
        break;
      case 0:
        send("Hoje começam as aulas na UFSM 😎 \n #voltamos");
        break;
      default:
        send("Faltam " + estamosEmFerias + " dias para as aulas na UFSM.");
        break;
    }
  }
}

function getWeatherInfo() {
  var url = 'http://api.openweathermap.org/data/2.5/weather?id=' + CITY_ID + '&lang=pt_br&appid=' + WEATHER_API_KEY + '&units=metric';
  var response = UrlFetchApp.fetch(url);
  var weatherData = JSON.parse(response.getContentText());

  var temperature = Math.floor(weatherData.main.temp);
  var weatherDescription = weatherData.weather[0].description;

  return 'Bom dia! Temperatura agora em Santa Maria: ' + temperature + ' °C, ' + weatherDescription + '.\n\n';
}


function postTweet(status) {
  var url = 'https://api.twitter.com/2/tweets';
  var oauthParams = {
    'oauth_consumer_key': API_KEY,
    'oauth_token': ACCESS_TOKEN,
    'oauth_signature_method': 'HMAC-SHA1',
    'oauth_timestamp': Math.floor(new Date().getTime() / 1000).toString(),
    'oauth_nonce': Math.random().toString(36).substring(2),
    'oauth_version': '1.0'
  };

  var parameterString = 'oauth_consumer_key=' + oauthParams.oauth_consumer_key +
                        '&oauth_nonce=' + oauthParams.oauth_nonce +
                        '&oauth_signature_method=' + oauthParams.oauth_signature_method +
                        '&oauth_timestamp=' + oauthParams.oauth_timestamp +
                        '&oauth_token=' + oauthParams.oauth_token +
                        '&oauth_version=' + oauthParams.oauth_version;

  var signatureBaseString = 'POST&' + encodeURIComponent(url) + '&' + encodeURIComponent(parameterString);
  var signingKey = encodeURIComponent(API_SECRET_KEY) + '&' + encodeURIComponent(ACCESS_TOKEN_SECRET);
  var oauthSignature = Utilities.base64Encode(Utilities.computeHmacSignature(Utilities.MacAlgorithm.HMAC_SHA_1, signatureBaseString, signingKey));
  oauthParams.oauth_signature = oauthSignature;

  var authHeader = 'OAuth ' + Object.keys(oauthParams).map(function(key) {
    return key + '="' + encodeURIComponent(oauthParams[key]) + '"';
  }).join(', ');

  var options = {
    'method': 'post',
    'headers': {
      'Authorization': authHeader,
      'Content-Type': 'application/json'
    },
    'payload': JSON.stringify({ 'text': status })
  };

  var response = UrlFetchApp.fetch(url, options);
  Logger.log(response.getContentText());
}
