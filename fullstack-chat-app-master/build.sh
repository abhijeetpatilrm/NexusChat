#!/bin/bash
cd fullstack-chat-app-master
npm install --prefix backend
npm install --prefix frontend
npm run build --prefix frontend
