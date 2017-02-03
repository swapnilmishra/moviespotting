**Moviespotting - The Idea**

The idea is to build a social network where in people would share which movie they are watching currently. Something on the lines of Goodreads for movies.

See these [screenshot](https://github.com/swapnilmishra/moviespotting/tree/master/Moviespotting-screenshots) for detail.

**How to run**

1. Make sure "nodejs" is installed, you can check this by running "node" command on terminal.
2. Make sure "npm" is installed, you can check this by running "npm" command on terminal.
3. Make sure "mongodb" is installed on your system and "mongod" binary file is in your path. Start mongo db server.
4. Run scripts which are inside [db-init](https://github.com/swapnilmishra/moviespotting/tree/master/db-init) folder. This will configure the db for you.
4. Goto root directory where "package.json" is located.
5. Run ```npm install```. This command will install all the required "nodejs" dependencies.
6. Run ```npm run build``` to build the stuff.
6. From the same folder run ```npm start```. This will start the server.
7. From browser open "http://localhost:3000" and you should see the app running.
