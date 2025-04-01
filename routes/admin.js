var express = require('express')
var router = express.Router()
var pool = require('./pool')
var jwt = require("jsonwebtoken")

var LocalStorage = require('node-localstorage').LocalStorage
var localstorage = new LocalStorage('./scratch')

router.get('/cleartoken', (req, res) => {
    localstorage.clear()
    res.json({ auth: true })
})

const verifyJWT = (req, res, next) => {
    console.log(req.headers);
    const token = req.headers.authorization;
    console.log("Token:", token);
    if (!token) {
        res.json({ auth: false, message: "We need a token, please give it to us next time" });
    } else {
        jwt.verify(token, "jwtSecret", (err, decoded) => {
            console.log(decoded);
            if (err) {
                console.log(err);
                res.json({ auth: false, message: "you are failed to authenticate" });
            } else {
                req.userID = decoded.id;
                next();
            }
        });
    }
};

router.get('/getToken', (req, res) => {
    var mytoken = JSON.parse(localstorage.getItem('jwttoken'))
    res.json({ token: mytoken.token })
})

router.get("/isUserAuth", verifyJWT, (req, res) => {
    res.json({ auth: true, message: "You are authenticated Congrats" });
});


router.post('/check_admin_login', function (req, res) {
    pool.query('select * from administrator where emailid=? and password=?', [req.body.emailaddress, req.body.password], function (error, result) {
        if (error) {
            return res.status(500).json({ status: false })
        }
        else {
            if (result.length == 1) {
                const token = jwt.sign({ emailid: result[0].emailid }, "jwtSecret", {
                    expiresIn: "1h",
                });
                localstorage.setItem('jwttoken', JSON.stringify({ token: token }))
                return res.status(200).json({ status: true, admin: result[0], token: token })
            }
            else {
                return res.status(200).json({ status: false })
            }
        }
    })
})



module.exports = router

