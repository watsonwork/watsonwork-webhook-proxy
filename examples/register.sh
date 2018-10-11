#!/bin/bash
TOKEN=$(http -p b -f -a "$APPID:$SECRET" POST https://api.watsonwork.ibm.com/oauth/token grant_type=client_credentials  | jq -r .access_token)
http PUT "https://watsonwork-webhook-proxy-me.mybluemix.net/webhooks/${APPID}" Authorization:"Bearer $TOKEN" secret="$1"
