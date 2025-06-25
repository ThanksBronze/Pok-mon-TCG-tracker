var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const cardsRouter = require('./routes/cards');

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
	req.user = { id: 1 };
	next();
});

app.use('/', indexRouter);
app.use('/users', usersRouter);

console.log('Mounting cardsRouter on /api/cards');
app.use('/api/cards', cardsRouter);

module.exports = app;
