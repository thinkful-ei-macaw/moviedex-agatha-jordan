require('dotenv').config();

const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');
const data = require('./moviedata.json');
const app = express();

app.use(morgan('dev'));
app.use(helmet());
app.use(cors());
app.use(validateAuth);

const API_TOKEN = process.env.API_TOKEN;

function validateAuth(req, res, next){
    const authValue = req.get('Authorization');
    if (authValue === undefined){
        return res.status(400).json({ error: 'Authorization header missing' })
    }

    if (!authValue.toLowerCase().startsWith('bearer')){
        return res.status(400).json({ error: 'Invalid Authorization method: Must use Bearer strategy' })
    }

    const token = authValue.split(' ')[1];
    if (token !== API_TOKEN){
        return res.status(401).json({ error: 'Invalid credentials' })
    }

    next();
}

function accessMovie(req, res){
    let movies = [...data];
    const search = ['genre','country','avg_vote'];

    if (!search.includes(req.query)){
        return res.status(400).send({ error: `oh no, you did it all wrong`})
    }

    if (req.query.genre){
        movies = movies.filter(movie => movie.genre.toLowerCase(req.query.genre))
    }

    if (req.query.country){
        movies = movies.filter(movie => movie.country.toLowerCase(req.query.country))
    }

    if (req.query.avg_vote){
        movies = movies.filter(movie => Number(movie.avg_vote) >= Number(req.query.avg_vote))
    }

    res.status(200).json(movies);
}

app.get('/movie', accessMovie);

app.listen('8000', () => console.log('I hope this works'));