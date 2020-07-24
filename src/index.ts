import express, { Request } from 'express'
import axios from 'axios'
import { config } from 'dotenv'
import { Octokit } from '@octokit/rest'

config()

const app = express()
const { CLIENT_ID, CLIENT_SECRET } = process.env

app.use(express.static(__dirname + '/public'))

app.get('/oauth/redirect', async (req: Request) => {
  console.log(req.query)
  const requestToken = req.query.code.toString()
  //   try {
  //     const response = await octokit.request('POST https://github.com/login/oauth/access_token', {
  //       client_id: CLIENT_ID,
  //       client_secret: CLIENT_SECRET,
  //       code: requestToken,
  //       scopes: 'repo',
  //     })
  //     console.log(response)
  //   } catch (error) {
  //     console.error(error)
  //   }
  try {
    const tokenResponse = await axios({
      method: 'post',
      url: `https://github.com/login/oauth/access_token?client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}&code=${requestToken}&scope=user%20public_repo%20repo`,
      headers: {
        accept: 'application/json',
      },
    })
    const accessToken = tokenResponse.data.access_token
    console.log(accessToken)
    const octokit = new Octokit({ auth: accessToken })
    const response = await octokit.repos.createForAuthenticatedUser({
      name: 'hello_world',
    })
    console.log(response)
  } catch (error) {
    console.log(error)
  }
})

app.listen(8080)

// curl \
//   -X POST \
//   -H "Accept: " \
//   -H "Authorization: token 78cbecbe71cc27d6abf607bddc13f17b13697719" \
//   https://api.github.com/user/repos \
//   -d '{"name":"name"}'

// app.post('/api/access_token', (req, res) => {
//     if (!req.body.sessionCode) {
//       return
//     }

//     request.post({
//       url: 'https://github.com/login/oauth/access_token',
//       json: true,
//       form: {
//         client_id: clientId,
//         client_secret: clientSecret,
//         code: req.body.sessionCode
//       }
//     }, async function (requestError, githubResponse, {error, error_description, access_token}) {
//       if (error === 'bad_verification_code') {
//         res.status(401).send({error, error_description})
//         return
//       }

//       if (!access_token) {
//         res.status(401).send({
//           error: 'github_api_error',
//           error_description: 'No access token returned from GitHub'
//         })
//         return
//       }

//       octokit.authenticate({
//         type: 'oauth',
//         token: access_token
//       })

//       const {data: {login, avatar_url}} = await octokit.users.get({})
//       res.send({access_token, avatar_url, username: login})
//     })
//   })
