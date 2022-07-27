# Private Model Embed Sample Application

## Overview
A quick demo application that implements Private Model Embed for private Matterport models. Calls on the server involve
1. Acquiring access token using a registered OAuth app's credentials
2. Then acquiring authorized model link using the newly-acquiring access token

Information is then passed to the browser to embed the Matterport iframe.

## Installation

1. ```yarn install```
2. Edit ```config.js``` with the OAuth application's client ID and secret.
3. Edit ```src/index.js``` 'modelId' with a model SID managed by your org

## Running

```yarn start```
