var express = require("express");
var mysql = require('mysql');
var app = express();
var bp = require('body-parser');
const cors = require('cors');
app.use(cors());
app.options('*', cors());
app.use(bp.json());
//http://51.254.143.229/phpmyadmin
//wget https://raw.githubusercontent.com/MCheca/DISM/master/Ejemplo3.js
var connection = mysql.createConnection({
host : '51.254.143.229', //51.254.143.229
port : '3306', //3306
user : 'root', //root
password : 'root', //root
database : 'dism'
});

var key = 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJtYXJjb3NjaGVjYTFAaG90bWFpbC5jb20iLCJqdGkiOiIwZDk1YzgxZi1hNjc5LTQwYzEtYTVhZS03ZTM1YWE1MDhmNzAiLCJpc3MiOiJBRU1FVCIsImlhdCI6MTUzNzQ0NTY1MSwidXNlcklkIjoiMGQ5NWM4MWYtYTY3OS00MGMxLWE1YWUtN2UzNWFhNTA4ZjcwIiwicm9sZSI6IiJ9.8KSLXTe58-f7hTXvTdT5SnwYZIMAKypYsTccVmbHsuc';

//Ejemplo: GET http://localhost:8080/usuarios
app.get('/municipios', function(req, resp) {
connection.query('select * from municipios', function(err, rows) {
if (err) {
console.log('Error en /municipios '+err);
resp.status(500);
resp.send({message: "Error al obtener usuarios"});
}
else {
console.log('/municipios');
resp.status(200);
resp.send(rows);
}
})
});

app.get('/estaciones', function(req, resp) {
connection.query('select * from estaciones', function(err, rows) {
if (err) {
console.log('Error en /estaciones '+err);
resp.status(500);
resp.send({message: "Error al obtener usuarios"});
}
else {
console.log('/estaciones');
resp.status(200);
resp.send(rows);
}
})
});

app.get('/observacion', function(req, resp) {
connection.query('select * from observacion', function(err, rows) {
if (err) {
console.log('Error en /observacion '+err);
resp.status(500);
resp.send({message: "Error al obtener observacion"});
}
else {
console.log('/observacion');
resp.status(200);
resp.send(rows);
}
})
});

app.get('/observacion/:id', function(req, resp, next) {
var itemId = req.params.id;
connection.query('select * from observacion where idema="'+itemId+'"', function(err, rows) {
if (err) {
console.log('Error en /observacion/'+itemId+' Error: '+err);
resp.status(500);
resp.send({message: "Error al obtener observacion"});
}
else {
console.log('/observacion');
resp.status(200);
resp.send(rows);
}
})

});

app.get('/datosEstaciones', function(req, resp) {
var http = require("https");
var pathname= "";
 var optionsEstaciones = {
  "method": "GET",
  "hostname": "opendata.aemet.es",
  "path": "/opendata/api/valores/climatologicos/inventarioestaciones/todasestaciones?api_key="+key, 
  "json":true,
  "encoding": null,
  "headers": {
    "cache-control": "no-cache"
 }

};

var reqEstaciones = http.request(optionsEstaciones, function (res) {
  var chunks = [];

  res.on("data", function (chunk) {
    chunks.push(chunk);
  });

  res.on("end", function () {
    var body = Buffer.concat(chunks);
    var datos = JSON.parse(body);
    pathname=datos.datos;
    
	resp.send(datos);

});




  });


reqEstaciones.end();

resp.status(200);
console.log("/datosEstaciones")
});

app.get('/datosObservacion', function(req, resp) {
var http = require("https");
var pathname= "";
 var optionsObservacion = {
  "method": "GET",
  "hostname": "opendata.aemet.es",
  "path": "/opendata/api/observacion/convencional/todas?api_key="+key, 
  "json":true,
  "encoding": null,
  "headers": {
    "cache-control": "no-cache"
 }

};

var reqEstaciones = http.request(optionsObservacion, function (res) {
  var chunks = [];

  res.on("data", function (chunk) {
    chunks.push(chunk);
  });

  res.on("end", function () {
    var body = Buffer.concat(chunks);
    var datos = JSON.parse(body);
    pathname=datos.datos;
    console.log(datos.datos);
    
	resp.send(datos);

});




  });


reqEstaciones.end();

resp.status(200);
console.log("/datosObservacion")
});


app.get('/introducirDatos', function(req, resp) {

var http = require("https");
var pathname= "";
var idema="";
var datosfiltrados = [];
var j=0;
var sql = "";

connection.query('DELETE FROM municipios');
connection.query('DELETE FROM estaciones');
connection.query('DELETE FROM observacion');




var optionsMunicipios = {
  "method": "GET",
  "hostname": "opendata.aemet.es",
  "path": "/opendata/api/maestro/municipios?api_key="+key, 
  "json":true,
  "encoding": "text/html; charset=utf-8",
  "headers": {
    "cache-control": "no-cache"
  }
};


var url = "";


var reqMunicipios = http.request(optionsMunicipios, function (res) {
  var chunks = [];

  res.on("data", function (chunk) {
    chunks.push(chunk);
  });

  res.on("end", function () {
    var body = Buffer.concat(chunks);
    var datos = JSON.parse(body);
    datos.forEach(function (entry) {
        if (entry.num_hab > 50000) {
				datosfiltrados[j] = entry;
				sql = "INSERT INTO municipios (nombre, latitud,longitud,num_hab) VALUES ('"+entry.nombre.replace("'","''")+"','"+ entry.latitud.replace("'","''") +"','"+ entry.longitud.replace("'","''")+"','"+entry.num_hab+"')";

				connection.query(sql, function(err, rows) {
			if (err) {
				console.log('Error en /introducirDatos al añadir: '+entry.nombre+" ------------------- "+err);
				resp.status(500);
				resp.send({message: "Error al insertar municipios"});
			}
			else {
				console.log('Añadido: '+entry.nombre);
				resp.status(200);
			}
	})
                j = j + 1;
            }
	});
  });
});

reqMunicipios.end();


const request = require('request');

request('http://vps481071.ovh.net:8080/datosEstaciones', { json: true }, (err, res, body) => {
  if (err) { return console.log(err); }
  url = body.datos;

request(url, { json: true }, (err, res, body) => {

var datos = body;

datos.forEach(function (entry){
	sql = "INSERT INTO estaciones (nombre, latitud,longitud,indicativo) VALUES ('"+entry.nombre.replace("'","''")+"','"+ entry.latitud.replace("'","''") +"','"+ entry.longitud.replace("'","''")+"','"+entry.indicativo+"')";
		connection.query(sql, function(err, rows) {
			if (err) {
				console.log('Error en /introducirDatos al añadir la estacion: '+entry.indicativo+" ------------------- "+err);
				resp.status(500);
				resp.send({message: "Error al insertar estaciones"});
			}
			else {
				console.log('Añadida estacion: '+entry.indicativo);
				resp.status(200);
			}
	})
});

});

});

request('http://vps481071.ovh.net:8080/datosObservacion', { json: true }, (err, res, body) => {
  if (err) { return console.log(err); }
  url = body.datos;

request(url, { json: true }, (err, res, body) => {

var datos = body;

datos.forEach(function (entry){
	sql = "INSERT INTO observacion (idema, ubi,fint,ta) VALUES ('"+entry.idema.replace("'","''")+"','"+ entry.ubi.replace("'","''") +"','"+ entry.fint.replace("'","''")+"','"+entry.ta+"')";
		connection.query(sql, function(err, rows) {
			if (err) {
				console.log('Error en /introducirDatos al añadir la observacion: '+entry.idema+" ------------------- "+err);
				resp.status(500);
				resp.send({message: "Error al insertaciar observacion"});
			}
			else {
				console.log('Añadida observacion: '+entry.idema);
				resp.status(200);
			}
	})
});

});

});


  resp.send("DATOS INTRODUCIDOS CORRECTAMENTE");


});



var server = app.listen(8080, function () {
console.log('Servidor iniciado en puerto 8080…');
});

function segundaEstaciones(datos){
	var datos=datos;
	
}
