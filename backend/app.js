var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const cardsRouter = require('./routes/cards');
const setsRouter = require('./routes/sets');
const cardTypesRouter = require('./routes/card_types');
const seriesRouter = require('./routes/series');

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

console.log('Mounting cardsRouter on /api/cards');
app.use('/api/cards', cardsRouter);

console.log('Mounting setsRouter on /api/sets');
app.use('/api/sets', setsRouter);

console.log('Mounting cardTypesRouter on /api/card_types');
app.use('/api/card-types', cardTypesRouter);

console.log('Mounting seriesRouter on /api/series');
app.use('/api/series', seriesRouter);

console.log('Mounting usersRouter on /api/users');
app.use('/api/users', usersRouter);

module.exports = app;
