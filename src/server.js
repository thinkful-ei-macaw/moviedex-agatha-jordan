require('dotenv').config();

const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');
const data = require('./moviedata.json');
const app = express();

app.use(morgan('dev'));
app.use(helmet()); // disables header by default. makes more secure
app.use(cors()); // CORS-origin resource sharing. won't allow anyone touch a backend.
app.use(validateAuth); // checks all validation for all authorization endpoints)


// Validating Authorization before matching path, and moving to next step
const API_TOKEN = process.env.API_TOKEN;

function validateAuth(req, res, next){  // Validating response using middleware
    const authValue = req.get('Authorization'); // Grabbing the Authorization property. 
    if (authValue === undefined){
        return res.status(400).json({ error: 'Authorization header missing'})
    }

    if (!authValue.toLowerCase().startsWith('bearer')) { // bearer is a type of Authorization
        return res.status(400).json({ error: 'Invalid Authorization method: Must use Bearer strategy' })
    }

    const token = authValue.split(' ')[1]; // putting token in second position 
    if (token !== API_TOKEN){
        return res.status(401).json({ error: 'Invalid credentials' })
    }

    next();
}

function accessMovie(req, res){
    let movies = [...data];
    const search = ['genre','country','avg_vote'];
    
    for (const key in req.query) { // Loop through through keys in query object
        if (!search.includes(key)) { // if it does not include search method in array, throw this status
            return res.status(400).send({
                error: `oh no, you did it all wrong`
            })
        }
    }

    if (req.query.genre){
        movies = movies.filter(movie => movie.genre.toLowerCase() === req.query.genre.toLowerCase()) // comparing if movie genre search is lowercase with what we have on the server
    }

    if (req.query.country){
        movies = movies.filter(movie => movie.country.toLowerCase() === req.query.country.toLowerCase())
    }

    if (req.query.avg_vote){ // If true, filter movies that are equal to or higher than original query
        movies = movies.filter(movie => Number(movie.avg_vote) >= Number(req.query.avg_vote))
    }

    res.status(200).json(movies);
}

app.get('/movie', accessMovie);

app.listen('8000', () => console.log('I hope this works'));