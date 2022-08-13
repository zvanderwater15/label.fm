# Label.fm

Work in Progress!


- Takes a last.fm username and displays the top record labels that user listens to.

- Consumes to the last.fm API for user listening history and musicbrainz API for album information.

- MERN stack SPA hosted on Heroku, using RabbitMQ to send messages between the API and the Worker.


## Frontend
Design specified in [Figma](https://www.figma.com/file/RNGHgKbIphz4RQbLzKdkrW/Music-Listening-Stats-team-library?node-id=411%3A14)

![The final design of the site's home page. The title is label.fm and the subtitle is "Your favorite record labels, based off your top 100 albums in last.fm. The user has a textbox to enter their first name.](StartingPage.png?raw=true "Final Homepage Design")

## Backend Workflow
![Once the user submits their username, the API checks if the user exists in last.fm. If not, they get a "No User Found" response. If so, it gets the record label information for their top albums in the MongoDB. If the database does not have the label information, then the missing mbids are sent to the queue. The worker will get label information from musicbrainz. When the job is complete, the user can then get their record label data.](flow.png?raw=true "Flow Diagram")

