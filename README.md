# Demo: video to text, to translated text, to mp3

## Setup
1. Create or get access to a GCP project
1. In the project, make sure the APIs are enabled for Cloud Text-to-Speech API, Cloud Translation API, Cloud Video Intelligence API
1. Create a Service Account and download the key file to the root folder of this demo (yea, right next to this file is good)
1. Give the Service Account Project Viewer permissions
1. Edit the analyze.js file and set the projectId 
1. Open a command prompt and change into the root of this project (I like to use VSCode, and open the terminal there so I can show the code while doing these other things)
1. Run __*npm i*__ to rebuild the *node_modules* dependency folder
1. In the command prompt set an environmental variable GOOGLE_APPLICATION_CREDENTIALS and point it at your downloaded keyfile. On a Mac it's __*export GOOGLE_APPLICATION_CREDENTIALS="roi-ml-video-to-text-whatever.json"*__
1. Run __*npm start*__ to execute the code. 

After the run three files should appear. The video transcription file, the translation file, and the spoken translation mp3. All three files will have the same timestamp prefix.