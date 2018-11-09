var express = require("express");
var mysql = require('mysql');
var app = express();
var bp = require('body-parser');
const cors = require('cors');
app.use(cors());
app.options('*', cors());
app.use(bp.json());
//http://51.254.143.229/phpmyadmin
var connection = mysql.createConnection({
host : '51.254.143.229', //single2480a.banahosting.com
port : '3306', //3306
user : 'root', //tmggnocf_usuario
password : 'root', //MNOUuU5xmiqA
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
resp.send({message: "Error al obtener usuarios"});
}
else {
console.log('/observacion');
resp.status(200);
resp.send(rows);
}
})
});

app.get('/datosEstaciones', function(req, resp) {

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
    console.log(datos.datos);
    

    var reg = /.+?\:\/\/.+?(\/.+?)(?:#|\?|$)/;
	pathname = reg.exec(datos.datos)[1];
	//var path = datos.pathname;
	console.log("PATH "+pathname);
	segundaEstaciones.pathname=pathname;
	console.log("PATH SETTINGS: "+segundaEstaciones.pathname);

});

console.log('/datosEstaciones');
resp.status(200);
resp.send(pathname);

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


var segundaEstaciones = {
	"method": "GET",
	"hostname": "opendata.aemet.es",
	"path": "/opendata/sh/f46e22f2",
	"json":true,
	"encoding": null,
	"headers": {
		"cache-control": "no-cache"
	}
};





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

				//strSQL = "INSERT INTO MITABLA (CODIGO,NOMBRES) VALUES (1," & _"'" & replace("PEDRITO'S","'","''") & "Ž)"
				connection.query(sql, function(err, rows) {
			if (err) {
				console.log('Error en /introducirDatos al añadir: '+entry.nombre+" ------------------- "+err);
				resp.status(500);
				resp.send({message: "Error al obtener usuarios"});
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







  });
	segundaEstaciones.pathname=pathname;
			var reqSegunda = http.request(segundaEstaciones, function (res) {
				console.log("Peticion realizada");
				console.log("************************"+pathname+"************************");
				var chunks2 = [];

			res.on("data", function (chunk) {
    		chunks2.push(chunk);
  			});

  			res.on("end", function () {
    			var body = Buffer.concat(chunks2);
    			var datosE = JSON.parse(body);
    		datosE.forEach(function (entry) {
					sql = "INSERT INTO estaciones (nombre, latitud,longitud,indicativo) VALUES ('"+entry.nombre.replace("'","''")+"','"+ entry.latitud.replace("'","''") +"','"+ entry.longitud.replace("'","''")+"','"+entry.indicativo+"')";
					connection.query(sql, function(err, rows) {
					if (err) {
						console.log('Error en /introducirDatos al añadir: '+entry.indicativo+" ------------------- "+err);
						resp.status(500);
						resp.send({message: "Error al obtener usuarios"});
					}
					else {
						console.log('Añadido: '+entry.indicativo);
						resp.status(200);
					}
					});
	                j = j + 1;
				});
			});


			});

reqSegunda.end();
reqEstaciones.end();



resp.send("TODO BIEN TODO CORRECTO");

});



var server = app.listen(8080, function () {
console.log('Servidor iniciado en puerto 8080…');
});

function segundaEstaciones(datos){
	var datos=datos;
	
}
