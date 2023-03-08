
const jwt = require('jsonwebtoken');
const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require('uuid');
const saltRounds = 10;
const privateKey = process.env.JWT_PRIVATE_KEY || 'secret';
const accessTokenTtl = process.env.ACCESS_TOKEN_TTL || '24h';

const allUsers = new Map()
allUsers.set('steven.vandepoel@uza.be', {
    _id: 1,
    email: 'steven.vandepoel@uza.be',
    password: 'test123',
    name: 'Steven Van de Poel',
    roles: ['Admin'],
    refreshToken: null,
    lastLogin:null
})

allUsers.set('thibaut.humblet@uza.be', {
    _id: 2,
    email: 'thibaut.humblet@uza.be',
    password: 'test123',
    name: 'Thibaut Humblet',
    roles: ['Admin'],
    refreshToken: null,
    lastLogin:null
})

async function loginUser(req, res, next) {
    try {
        let user = allUsers.get(req.body.email);
        if (!user) return res.status(400).json({ message: "User with email does not exist" })


        let isValid = false
        if (req.body.password) isValid = req.body.password === user.password;
        else if (req.body.refreshToken) isValid = await bcrypt.compare(req.body.refreshToken, user.refreshToken)

        if (!isValid) return res.status(400).json({ message: "Invalid credentials" })

        const refreshToken = uuidv4()
        bcrypt.hash(refreshToken, saltRounds, async (err, hash) => {
            if (err) return res.status(500).json({ message: "Error hashing refresh token" })

            user.refreshToken = hash
            user.lastLogin = Date.now()
            allUsers.set('steven', user)
            const accessToken = generateToken(user)

            return res.status(200).json({
                message: "User logged in successfully",
                accessToken,
                refreshToken
            })
        })
    }
    catch (err) {
        return res.status(500).json({ message: "Error logging in user" })
    }
}

function generateToken(user) {
    return jwt.sign(
        {
            email:user.email,
            roles:user.roles,
            lastLogin:user.lastLogin
        },
        privateKey,
        {
            expiresIn: accessTokenTtl
        }
    )
}

module.exports = {
    loginUser
}