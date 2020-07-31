import express, { Request, Express } from 'express'
// import axios from 'axios'
import { config } from 'dotenv'
// import { Octokit } from '@octokit/rest'
import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'
import passport from 'passport'
import { sign } from 'jsonwebtoken'
import { Strategy as GitHubStrategy } from 'passport-github2'
import passportJwt from 'passport-jwt'
// const serverless = require(`serverless-http`)

config()

const { CLIENT_ID, CLIENT_SECRET, PASSPORT_SECRET, COOKIE_SECURE } = process.env

// require(`./utils/auth`)

// const { COOKIE_SECURE, ENDPOINT } = require(`./utils/config`)

const app = express()

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(cookieParser())

function authJwt(email: string) {
  console.log(`hey jwt`)
  return sign({ user: { email } }, PASSPORT_SECRET)
}

passport.use(
  new GitHubStrategy(
    {
      clientID: CLIENT_ID,
      clientSecret: CLIENT_SECRET,
      callbackURL: `api/auth/github/callback`,
      scope: [`user:email`],
    },
    async (accessToken: any, refreshToken: any, profile: any, done: any) => {
      console.log(profile)
      console.log(accessToken)
      try {
        const email = profile.emails[0].value
        // Here you'd typically create a new or load an existing user and
        // store the bare necessary informations about the user in the JWT.
        const jwt = authJwt(email)

        return done(null, { email, jwt })
      } catch (error) {
        return done(error)
      }
    },
  ),
)

passport.use(
  new passportJwt.Strategy(
    {
      jwtFromRequest(req) {
        if (!req.cookies) throw new Error(`Missing cookie-parser middleware`)
        return req.cookies.jwt
      },
      secretOrKey: PASSPORT_SECRET,
    },
    async ({ user: { email } }, done) => {
      try {
        // Here you'd typically load an existing user
        // and use their data to create the JWT.
        const jwt = authJwt(email)

        return done(null, { email, jwt })
      } catch (error) {
        return done(error)
      }
    },
  ),
)

app.use(passport.initialize())

app.use((req) => {
  console.log(req.url)
})

app.use(express.static(__dirname + '/public'))

// const handleCallback = () => (req, res) => {
//   res.cookie(`jwt`, req.user.jwt, { httpOnly: true, COOKIE_SECURE }).redirect(`/`)
// }

app.get(`api/auth/github`, passport.authenticate(`github`, { session: false }))
app.get(
  `api/auth/github/callback`,
  passport.authenticate(`github`, { failureRedirect: `/`, session: false }),
  (req) => {
    console.log(req)
    // res.cookie(`jwt`, req.user.jwt, { httpOnly: true, COOKIE_SECURE }).redirect(`/`)
  },
)

interface UserWithEmail extends Express.User {
  email: string
}

interface UserReq extends Request {
  user: UserWithEmail
}

app.get(`api/auth/status`, passport.authenticate(`jwt`, { session: false }), (req: UserReq, res) => {
  if (req.user && req.user.email) {
    res.json({ email: req.user.email })
  }
})

// app.get('/oauth/redirect', async (req: Request) => {
//   console.log(req.query)
//   const requestToken = req.query.code.toString()
//   //   try {
//   //     const response = await octokit.request('POST https://github.com/login/oauth/access_token', {
//   //       client_id: CLIENT_ID,
//   //       client_secret: CLIENT_SECRET,
//   //       code: requestToken,
//   //       scopes: 'repo',
//   //     })
//   //     console.log(response)
//   //   } catch (error) {
//   //     console.error(error)
//   //   }
//   try {
//     const tokenResponse = await axios({
//       method: 'post',
//       url: `https://github.com/login/oauth/access_token?client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}&code=${requestToken}&scope=user%20public_repo%20repo`,
//       headers: {
//         accept: 'application/json',
//       },
//     })
//     const accessToken = tokenResponse.data.access_token
//     console.log(accessToken)
//     const octokit = new Octokit({ auth: accessToken })
//     const response = await octokit.repos.createForAuthenticatedUser({
//       name: 'hello_world',
//     })
//     console.log(response)
//   } catch (error) {
//     console.log(error)
//   }
// })

app.listen(8080)
// module.exports.handler = serverless(app)
