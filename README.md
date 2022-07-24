# Label.fm

Work in Progress!


- Takes a last.fm username and displays the top record labels that user listens to.

- Consumes to the last.fm API for user listening history and musicbrainz API for album information.

- MERN stack SPA hosted on Heroku, using RabbitMQ to send messages between the API and the Worker.



![Once the user submits their username, the API checks if the user exists in last.fm. If not, they get a "No User Found" response. If so, it gets the label information for their top albums in the MongoDB. If the database does not have the label information, then the missing mbids are sent to the queue. The worker will get label information from musicbrainz.](flow.png?raw=true "Flow Diagram")

