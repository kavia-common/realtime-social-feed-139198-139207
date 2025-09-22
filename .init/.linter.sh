#!/bin/bash
cd /home/kavia/workspace/code-generation/realtime-social-feed-139198-139207/feed_frontend
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

