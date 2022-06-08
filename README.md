# Private Model Embed Sample Application

## Overview
A quick demo application that implements Private Model Embed for private Matterport models. Calls on the server involve
- Acquiring access token using a registered OAuth app's credentials
- Then acquiring authorized model link using the newly-acquiring access token

Information is then passed to the browser to embed the Matterport iframe.

## Installation

```yarn install```

Edit ```config.js``` with the OAuth application's client ID and secret.

## Running

```yarn start```
