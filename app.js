const express = require('express');
const bodyParser = require('body-parser');
const BigNumber = require('bignumber.js');
const path = require('path');

const app = express();
app.use(bodyParser.json());



app.set('view engine', 'ejs'); // Set EJS as the template engine
app.set('views', __dirname);



let numero_de_transacciones = 0;
let resumen_operaciones = {
          "monto_2200" : 0,
          "numero_2200" : 0,
          "monto_2400" : 0,
          "numero_2400" : 0
};

let histograma_transacciones = {
  "Menor_a_$10.000" : 0,
  "Entre_$10.000_y_$49.999" : 0,
  "Entre_$50.009_y_$99.999" : 0,
  "Entre_$100.000_y_$499.999" : 0,
  "Entre_$500.000_y_$999.999" : 0,
  "Entre_$1.000.000_y_$9.999.999" : 0,
  "Más_de_$9.999.999" : 0
}





const receivedTransactions = {};

app.post('', (req, res) => {
  const requestBody = req.body;
  const base64Number = requestBody["message"]["data"];

  function base64ToBase10(base64Number1) {
    const decodedString = Buffer.from(base64Number1, 'base64').toString('utf-8');
    const base10Number = BigInt(decodedString).toString();
    return base10Number;
  }

  const base10Number = base64ToBase10(base64Number);

  var tipo_operacion = base10Number.substring(0, 4);
  var id_mensaje = base10Number.substring(4, 14);
  var banco_origen = base10Number.substring(14, 21);
  var cuenta_origen = base10Number.substring(21, 31);
  var banco_destino = base10Number.substring(31, 38);
  var cuenta_destino = base10Number.substring(38, 48);
  var monto = base10Number.substring(48, 64);

  var nueva_transaccion = {
    "tipo_operacion": tipo_operacion,
    "banco_origen": banco_origen,
    "cuenta_origen": cuenta_origen,
    "banco_destino": banco_destino,
    "cuenta_destino" : cuenta_destino,
    "monto": parseInt(monto)
  };

  

  //console.log(histograma_transacciones)

  

  //console.log(receivedTransactions);
  console.log(nueva_transaccion);




  if (!receivedTransactions[id_mensaje]) {
    // La transacción es nueva
    receivedTransactions[id_mensaje] = nueva_transaccion;

    if (nueva_transaccion["tipo_operacion"] === "2200") {
      resumen_operaciones["monto_2200"] += nueva_transaccion["monto"];
      resumen_operaciones["numero_2200"] += 1;
    }
    if (nueva_transaccion["tipo_operacion"] === "2400") {
      resumen_operaciones["monto_2400"] += nueva_transaccion["monto"];
      resumen_operaciones["numero_2400"] += 1;
    }
    if (nueva_transaccion["monto"] < 10000) {
      histograma_transacciones["Menor_a_$10.000"] += 1
    } else if (nueva_transaccion["monto"] < 50000) {
      histograma_transacciones["Entre_$10.000_y_$49.999"] += 1
    } else if (nueva_transaccion["monto"] < 100000) {
      histograma_transacciones["Entre_$50.009_y_$99.999"] += 1
    } else if (nueva_transaccion["monto"] < 500000) {
      histograma_transacciones["Entre_$100.000_y_$499.999"] += 1
    } else if (nueva_transaccion["monto"] < 1000000) {
      histograma_transacciones["Entre_$500.000_y_$999.999"] += 1
    } else if (nueva_transaccion["monto"] < 10000000) {
      histograma_transacciones["Entre_$1.000.000_y_$9.999.999"] += 1
    } else {
      histograma_transacciones["Más_de_$9.999.999"] += 1
    }


  }

  // console.log(resumen_operaciones);
  numero_de_transacciones = Object.keys(receivedTransactions).length;
  res.status(200);
});

app.get('/', (req, res) => {
  res.render('index.ejs', { transactions: receivedTransactions , operaciones: numero_de_transacciones, resumen_operaciones: resumen_operaciones, histograma_transacciones: histograma_transacciones}); // Renderiza la plantilla y pasa los datos de receivedTransactions
});


const port = 3000;

app.listen(port, () => {
  console.log(`Servidor API escuchando en el puerto ${port}`);
});



