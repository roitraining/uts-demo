# Universal Translation SErvice (UTS)Demo

## Overview
This demo is intended to show the "magic" you can achieve using GCP's ML APIs.

It takes one or more input videos and does the following:

1. Uses the Video Intelligence API to transcribe the spoken dialog
2. Uses the Translation API to translate the dialog into a new language
3. Uses the Speech-to-Text API to generate new spoken dialog

This demo could be extended to then reconstruct the video with the new dialog (that's up to you)

## Setup
1. Create or get access to a GCP project
1. In the project, make sure the APIs are enabled for
   - Cloud Text-to-Speech API,
   - Cloud Translation API,
   - Cloud Video Intelligence API
1. Create a Service Account and download the key file to the root folder of this demo (yea, right next to this file is good)
1. Assign the Project Viewer role to the service account within the project
2. Set environment variables to configure the application
   - ```export DEVSHELL_PROJECT_ID=<your-project-name>``` (unnecessary if running in Cloud Shell)
   - ```export TARGET_LANGUAGE=<language-code>``` (see [https://cloud.google.com/translate/docs/languages]())
   - ```export VOICE=<voice-language-code>>``` (see [https://cloud.google.com/speech-to-text/docs/languages]())
   - ```export GOOGLE_APPLICATION_CREDENTIALS=<path-to-keyfile>```
1. Copy any demo videos you like into the *inputs* directory

## Demo
1. Open a command prompt and change into the root of this project (I like to use VSCode, and open the terminal there so I can show the code while doing these other things)
1. Run ```npm i``` to rebuild the *node_modules* dependency folder
1. Run ```npm start``` to execute the code.

After the run three files should be written for each video into the outputs directory. The video transcription file, the translation file, and the spoken translation mp3.

1. Show the students the transcript
2. Show the students the translated text
3. Play the new audio file for the students
4. Discuss variations that would be interesting
