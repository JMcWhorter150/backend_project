const express = require('express');
const router = express.Router();

const selectRouter = require('./select');

const log = require('../models/log');

const bodyParser = require('body-parser');
const parseForm = bodyParser.urlencoded({
    extended: true
});

// const data = require('../modules/data');
const episodeObj = require('../lists/air-date-show');

const axios = require('axios').default;
const jeopardyAPI = 'https://jeopardy.bentleyherron.dev/api';

// Requires Login
function requireLogin(req, res, next) {
    if (req.session && req.session.user) {
        next();
    } else {
        res.redirect('/login');
    }
}

function getRandomEpisode (obj) {
    const keys = Object.keys(obj)
    return obj[keys[ keys.length * Math.random() << 0]];
};

async function getQuestionsForRound(showNumber='5392', roundNumber) {
    let array = [];
    let count = 1;
    while (count < 4) {
        try {
            const response = await axios.get(jeopardyAPI + `/shows/${showNumber}/${count}`);
            array.push(response.data.questions);
        } catch (error) {
            console.error(error);
        }
        count++;
    }
    return array;
}


router.get('/', async (req, res)=>{
    // Check if user is logged in for user id object for frontend
    if (req.session && req.session.user) {
            userObj = {
                user_id: req.session.user.id,
                username: req.session.user.name
            }
        } else {
            userObj = {
                user_id: null,
                username: 'Anonymous'
            }
    }
    // const data = await data.createArrayofArrayObject('2008-02-05');
    const episodeNum = getRandomEpisode(episodeObj)
    const data = await getQuestionsForRound(episodeNum);
    res.render('game', {
        locals: {
            pagetitle: 'Play Jeopardy',
            userinfo: JSON.stringify(userObj),
            arrayArrayObject: JSON.stringify(data)
        },
        partials: {
            head: '/partials/head',
            navbar: req.session.navbar.value,
            footer: '/partials/footer'
        }
    });
})

router.get('/:episodeNum(\\d+)', async (req, res)=>{
    const { episodeNum } = req.params;
    // Check if user is logged in for user id object for frontend
    if (req.session && req.session.user) {
            userObj = {
                user_id: req.session.user.id,
                username: req.session.user.username
            }
        } else {
            userObj = {
                user_id: null,
                username: 'Anonymous'
            }
    }
    const data = await getQuestionsForRound(episodeNum);
    res.render('game', {
        locals: {
            pagetitle: 'Play Jeopardy',
            userinfo: JSON.stringify(userObj),
            arrayArrayObject: JSON.stringify(data)
        },
        partials: {
            head: '/partials/head',
            navbar: req.session.navbar.value,
            footer: '/partials/footer'
        }
    });
})

router.post('/', parseForm, async (req, res) => {
    // console.log(req.body);
    // const { score, date, id, episodePlayed } = req.body;
    // console.log(`Received score: ${score}`);
    // console.log(`Date played: ${date}`);

    // const gameLog = await log.logGameToDatabase(id, date, episodePlayed);
    // const scoreLog = await log.logScoreToDatabase(id, game_id, score);
})




// Select game routing
router.use('/select', requireLogin, selectRouter);



module.exports = router;