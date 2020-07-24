import express, { Request } from 'express';
import axios from 'axios';
import { config } from 'dotenv';
import { Octokit } from '@octokit/core';

config();

const app = express();
const { CLIENT_ID, CLIENT_SECRET } = process.env;

app.use(express.static(__dirname + '/public'));

app.get('/oauth/redirect', async (req: Request) => {
    const requestToken = req.query.code;
    const tokenResponse = await axios({
        method: 'post',
        url: `https://github.com/login/oauth/access_token?client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}&code=${requestToken}&scope=user%20public_repo%20repo`,
        headers: {
            accept: 'application/json',
        },
    });
    const accessToken = tokenResponse.data.access_token;
    console.log(tokenResponse);
    const octokit = new Octokit({ auth: accessToken });
    const response = await octokit.request('POST /user/repos', {
        name: 'hello_world',
    });

    console.log(response);
});

app.listen(8080);

// curl \
//   -X POST \
//   -H "Accept: " \
//   -H "Authorization: token 78cbecbe71cc27d6abf607bddc13f17b13697719" \
//   https://api.github.com/user/repos \
//   -d '{"name":"name"}'
