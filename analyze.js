/*
  This is a demonstration of some of the pre-trained GCP ML models. Specifically,
  it takes a short input video, extracts the audio track as text, saves
  it as a file, runs a translation, safes that as a file, and
  finally it creates a new audio track and saves it as an mp3.
*/

// The project you're using. You may need to enable some of the ML
// APIs to allow this to work, like:
// Cloud Text-to-Speech API
// Cloud Translation API
// Cloud Video Intelligence API
const projectId = process.env.DEVSHELL_PROJECT_ID;

//required libraries:
//To extract the video's transcription:
const videoIntelligence = require('@google-cloud/video-intelligence');

//For easy access to the local file system:
const fs = require('fs');

//Some general utilities
const util = require('util');
//To do the translation:

const {
  Translate
} = require('@google-cloud/translate');

//To create the new audio track:
const textToSpeech = require('@google-cloud/text-to-speech');

//The target language for translation
if (process.env.TARGET_LANGUAGE){
  var targetLanguage = process.env.TARGET_LANGUAGE;
} else{
  var targetLanguage = 'fr';
}

//The target language for translation
if (process.env.VOICE){
  var voice = process.env.TARGET_LANGUAGE;
} else{
  var voice = 'en-US';
}

//This is the function doing all the work. It is called at the very
//bottom of this file in a try catch
async function analyzeVideoTranscription(filename, targetLanguage) {
  var inVideoFile = `inputs/${filename}`;
  var outputPrefix = `outputs/${filename}`;
  console.log(`Starting job! Translating ${inVideoFile} into ${targetLanguage}`);

  // Creates the Video Intelligence client
  const videoIntelligenceClient =
    new videoIntelligence.VideoIntelligenceServiceClient();
    console.log("videoIntelligenceClient created");

  //options
  const videoContext = {
    speechTranscriptionConfig: {
      languageCode: 'en-US',
      enableAutomaticPunctuation2: true,
    },
  };

  //Reads the local video file and base64 encodes it
  console.log("Base64 encoding local video file");
  const readFile = util.promisify(fs.readFile);
  const file = await readFile(inVideoFile);
  const inputContent = file.toString('base64');

  console.log(`${filename} encoded`);

  //what we want it to do. If you wanted to load the file from
  //a bucket, you could simply use inputUri instead of content
  //and pass it a gs:// url
  const request = {
    inputContent: inputContent,
    features: ['SPEECH_TRANSCRIPTION'],
    videoContext: videoContext,
  };
  console.log(`Transcribing video ${filename}...`);
  const [operation] = await videoIntelligenceClient.annotateVideo(request);

  const [operationResult] = await operation.promise();

  const alternative =
    operationResult.annotationResults[0].speechTranscriptions[0]
    .alternatives[0];

  //If you want to run through and get details on when exactly each word
  //was spoken, stuff like that, look at this:
  // alternative.words.forEach(wordInfo => {
  //   const start_time =
  //     wordInfo.startTime.seconds + wordInfo.startTime.nanos * 1e-9;
  //   const end_time = wordInfo.endTime.seconds + wordInfo.endTime.nanos * 1e-9;
  //   console.log('\t' + start_time + 's - ' + end_time + 's: ' + wordInfo.word);
  // });

  const videoTranscript = alternative.transcript;
  console.log(`${filename} transcription: ${videoTranscript}`);
  const oname = outputPrefix + '_transcript.txt';

  //
  fs.writeFile(oname, videoTranscript, 'utf8', (err) => {
    if (err) throw err;
    console.log(`The video transcript file for ${filename} has been saved!`);
  });

  console.log(`Now doing the translation for ${filename}`);

  // Instantiates a translate client
  const translate = new Translate({
    projectId: projectId,
  });
  let textTranslation = "Default text value (you shouldn't see)."
  translate
    .translate(videoTranscript, targetLanguage) //returns promise
    .then(results => { //wait on the translation to complete
      textTranslation = results[0];


      console.log(`Original text for ${filename}: ${videoTranscript}`);
      console.log(`Translation for ${filename}: ${textTranslation}`);
      console.log(`Writing translation file for ${filename}`);

      const transFileName = outputPrefix + `_translated_to_${targetLanguage}.txt`;

      //write the translated text
      fs.writeFile(transFileName, textTranslation, 'utf8', (err) => {
        if (err) throw err;
        console.log(`The video transcript file for ${filename} has been saved!`);
      });
    }).then(input => { //wait on all the translation file stuff to finish

      console.log(`Creating new audio file for ${filename}`);

      // Creates a client for text to speech
      const speechClient = new textToSpeech.TextToSpeechClient();

      // Construct the request
      const speechRequest = {
        input: {
          text: textTranslation //with the text to speak
        },
        // Select the language and SSML Voice Gender (optional)
        voice: {
          languageCode: voice,
          ssmlGender: 'MALE'
        },
        // Select the type of audio encoding
        audioConfig: {
          audioEncoding: 'MP3'
        },
      };

      // Do the Text-to-Speech request
      speechClient.synthesizeSpeech(speechRequest, (err, response) => {
        if (err) {
          console.error('synthesizeSpeech error:', err);
          return;
        }
        const speechName = outputPrefix + '_speech.mp3';

        // Write the binary audio content to a local file
        fs.writeFile(speechName, response.audioContent, 'binary', err => {
          if (err) {
            console.error('ERROR:', err);
            return;
          }
          console.log(`Audio content written to file: ${speechName}`);
        });

      });

    })
    .catch(err => {
      console.error('ERROR:', err);
    });
}

fs.readdir('inputs', function(err, files){
  if (err){
    console.error("Could not list files in directory", err);
  } else{
    files.forEach(function(file, index){
      try {
        analyzeVideoTranscription(file, targetLanguage);
      } catch (err) {
        console.log("Blew up calling analyzeVideoTranscription(): " + err);
      }
    });
  }
});


