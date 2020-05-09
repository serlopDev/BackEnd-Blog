'use strict'

// Cargaremos los módulos necesarios para crear el servidor

var express = require('express');
var bodyParser =  require ('body-parser');

// Ejecutar express (http)

var app = express();

// Cargar ficheros de rutas

var article_routes = require('./routes/article');

// Cargar Middlewares

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

// Activar el CORS para permitir peticiones desde el Front End

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');
    next();
});


// Añadir prefijos a Rutas

app.use('/api', article_routes);




// Ruta o método para el API REST


// Exportar el Módulo (es el fichero actual) así podremos utilizarlo en otros módulos

module.exports = app;