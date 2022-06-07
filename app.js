const express = require('express');
const path = require('path');
const fetch = require('node-fetch');
const { client_id, client_secret } = require('./config');
const app = express();
const port = 8000;

const verbose = true;
const validFor = "24h";
const apiHost = 'qa3-api.matterport.com';

// direct string mutations provided, but feel free to look into a GraphQL client
const genPrivateLinkMutation = `
mutation createLink($modelId: ID!, $clientId: ID!, $clientSecret: String!, $validFor: Duration){
  createPrivateModelAccessLink(
    modelId: $modelId
    clientId: $clientId
    clientSecret: $clientSecret
    validFor: $validFor
  ) {
    accessToken
    application
    link
    validUntil
  }
}
`;

const revokeAccessTokenMutation = `
mutation deleteToken($clientId: ID!, $clientSecret: String!, $accessToken: ID!) {
  deletePrivateModelAccessToken(
    clientId: $clientId
    clientSecret: $clientSecret
    accessToken: $accessToken
  )
}
`;

app.use(express.static(__dirname + "/src"));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname + '/src/index.html'));
});

app.get('/get-access', async (req, res) => {
  const { m } = req.query;
  if(!m){
    res.status(500).send({
      error: "No model ID provided"
    });
    return;
  }
  try{
    const tokenEndpoint = `https://${apiHost}/api/oauth/token`;
    const tokenFetchInfo = {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: new URLSearchParams({
        grant_type: "client_credentials",
        client_id: client_id,
        client_secret: client_secret,
      }),
    }

    if(verbose)
      console.log(`1.  Fetching Access token from ${tokenEndpoint}`);
    
    const tokenRes = await fetch(tokenEndpoint, tokenFetchInfo);
    const tokenInfo = await tokenRes.json();
    if(tokenInfo.error){
      res.status(500).send({"error": tokenInfo.error});
      return;
    } 

    if(verbose)
      console.log(`    Received from ${tokenEndpoint}: ${tokenInfo.access_token}`);

    const modelApiEndpoint = `https://${apiHost}/api/models/graph`;
    const modelFetchInfo = {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${tokenInfo.access_token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        query: genPrivateLinkMutation,
        variables: {
          modelId: m,
          clientId: client_id,
          clientSecret: client_secret,
          validFor: validFor
        }
      })
    }

    if(verbose)
      console.log(`2.  Now fetching authorized model link from ${modelApiEndpoint}`)

    const accessRes = await fetch(modelApiEndpoint, modelFetchInfo);
    const accessData = await accessRes.json();

    if(verbose)
      console.log(`    Received from ${modelApiEndpoint}: ${accessData.data.createPrivateModelAccessLink.link}`)

    if(accessRes.error){
      res.status(500).send({"error": accessRes.error});
      return;
    }

    res.send(accessData.data.createPrivateModelAccessLink);
  }catch(e){
    console.log(e);
    res.status(500).send({
      error: e
    });
  } 

});

app.get('/revoke-access', async (req, res) => {
  const { access } = req.query;
  if(!access){
    res.status(500).send({
      error: "No access token provided"
    });
    return;
  }
  let access_token = access;
  if(access_token.startsWith("Bearer"))
    access_token = access.slice(7);

  const modelApiEndpoint = `https://${apiHost}/api/models/graph`;
  
  const revokeFetchInfo = {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${access_token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      query: revokeAccessTokenMutation,
      variables: {
        clientId: client_id,
        clientSecret: client_secret,
        accessToken: access_token
      }
    })
  }

  if(verbose)
    console.log(`Requesting revocation of access token ${access_token} from ${modelApiEndpoint}`);

  const result = await fetch(modelApiEndpoint, revokeFetchInfo);
  const revokeRes = await result.json();
  
  if(verbose)
      console.log(`Received from ${modelApiEndpoint}: ${JSON.stringify(revokeRes)}`)

  res.send();
});

app.listen(port, () => {console.log(`Listening on port ${port}...`)});
