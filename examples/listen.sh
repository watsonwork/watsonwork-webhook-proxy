#!/bin/bash
TOKEN=$(http -p b -f -a "$APPID:$SECRET" POST https://api.watsonwork.ibm.com/oauth/token grant_type=client_credentials  | jq -r .access_token)
node "$(dirname "$0")/../src/client.js" "$TOKEN" "wss://watsonwork-webhook-proxy.mybluemix.net/webhooks/$APPID"
