const express = require('express');
const jwt = require('jsonwebtoken');

const app = express();

const accessScecretToken = "46044c169bfb8f315643def4a06a9b014849e6d0b140749bb5924aab3d538365a952537323c7ffac261bff493c5d10366576f19235331b74ee4008409de549ca";
const refreshScecretToken = "be0a2cd029d873cb9ebcfa696737f6b7716b36da44093aee1f81288d950e5c11ad028ed605490012b6f16a76a582f9ab50ba4d512bef350951e63e04833faac0";

app.use(express.json());

const posts = [{
        username: 'midlajc',
        title: 'Post 1'
    },
    {
        username: 'midlaj',
        title: 'Post 2'
    }
]

let refreshTokens = []

const authToken = (req, res, next) => {
    const accessHeader = req.headers['authorization']
    const token = accessHeader && accessHeader.split(' ')[1]
    if (token == null) res.sendStatus(401)
        // console.log(token);
    jwt.verify(token, accessScecretToken, (err, user) => {
        // console.log(err);
        if (err) return res.sendStatus(403)
        req.user = user;
        next()
    });
}


const generateAccessTocken = (user) => {
    return jwt.sign(user, accessScecretToken, { expiresIn: "30s" });
}

app.get('/', authToken, (req, res) => {
    res.json(posts.filter(posts => posts.username === req.user.username))
})

app.post('/login', (req, res) => {
    let username = req.body.username;
    const user = {
        username: username
    };
    let accessToken = generateAccessTocken(user);
    let refreshToken = jwt.sign(user, refreshScecretToken);
    refreshTokens.push(refreshToken);
    res.json({ accessToken: accessToken, refreshToken: refreshToken })
})

app.post('/token', (req, res) => {
    let refreshToken = req.body.token;
    console.log(refreshToken);
    if (refreshToken == null) return res.sendStatus(401)
    if (!refreshTokens.includes(refreshToken)) return res.sendStatus(403)
    jwt.verify(refreshToken, refreshScecretToken, (err, user) => {
        console.log(user);
        if (err) return res.sendStatus(403)
        const accessToken = generateAccessTocken({ username: user.username })
        res.json({ accessToken: accessToken })
    })
})

app.delete('/logout', (req, res) => {
    refreshTokens = refreshTokens.filter(token => token !== req.body.token)
    res.sendStatus(204)
})

app.listen(3000)