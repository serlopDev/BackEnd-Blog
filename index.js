'use strict'

var moongose = require('mongoose');
var app = require('./app');
var puerto = 3900;
app.set('port', process.env.PORT || puerto);


moongose.set('useFindAndModify', false);
moongose.Promise = global.Promise;
moongose.connect('mongodb+srv://sergio_admin:yfLZomHuxGfx735x@frameworksbbdd-8dw9v.mongodb.net/api_rest_blog?retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true})
    .then(() => {
        console.log('La conexión se ha realizado con éxito');

        // Creamos el servidor y escuchar peticiones http

        app.listen(puerto, () => {
            console.log('El servidor está ejecutandose en ' + puerto);
        })
});