import express, { Request, Response } from 'express';
import axios from 'axios';
import { config } from 'dotenv';

config();

const app = express();
const { CLIENT_ID, CLIENT_SECRET } = process.env;

app.use(express.static(__dirname + '/public'));

app.get('/oauth/redirect', async (req: Request, res: Response) => {
    console.log('INFO :: REDIRECT ');
    const requestToken = req.query.code;
    const tokenResponse = await axios({
        method: 'post',
        url: `https://github.com/login/oauth/access_token?client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}&code=${requestToken}&scopes=repo`,
        headers: {
            accept: 'application/json',
        },
    });
    console.log(tokenResponse.data);
    const accessToken = tokenResponse.data.access_token;
    console.log(accessToken);
    res.status(200).json({ success: true });
});

app.listen(8080);

// curl \
//   -X POST \
//   -H "Accept: " \
//   -H "Authorization: token b75f2ebb38107ce35e5311293ab3398c266cce36" \
//   https://api.github.com/user/repos \
//   -d '{"name":"name"}'
