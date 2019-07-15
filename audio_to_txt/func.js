const fdk = require('@fnproject/fdk');
const fs1 = require('fs');
const fs = fs1.promises;
const request = require('request-promise');

fdk.handle(async (req) => {
  let idOfAudio;
  let firstResponce;
  let selectedAudioName;
  console.log('-------------------------------------------------------------');
  console.log("---> I got the call from front end!");
  console.log("Name: " + req.selectedAudioName);
  console.log("selected Audio: " + req.selectedAudio);
  selectedAudioName = req.selectedAudioName;
  let base64Audio = req.selectedAudio;
  // console.log(req.body["selectedAudio"]);
  console.log('-------------------------------------------------------------');
  console.log("---> Extracting the Audio!");

  base64Audio = base64Audio.substr(base64Audio.indexOf("base64,") + 7, base64Audio.length);
  console.log("base64Audio: " + base64Audio);
  console.log('-------------------------------------------------------------');

  try {
    await fs.appendFile("/tmp/" + selectedAudioName, base64Audio, { encoding: 'base64' });
    console.log('---> File created in ' + "/tmp/" + selectedAudioName);

    // sending the Audio file to the external API to get the text
    console.log('-------------------------------------------------------------');
    console.log("sending the Audio file to the external API to get the text");

    const options_1 = {
      method: 'POST',
      url: 'https://api.speechmatics.com/v1.0/user/68879/jobs/',
      qs: { auth_token: 'ZjlhMjE1MzEtNDJkMS00ZTRjLWI4OTktMjNkZDA2NjE0MWNh' },
      formData:
      {
        model: 'en-GB',
        data_file:
        {
          value: fs1.createReadStream("/tmp/" + selectedAudioName),
          options:
          {
            filename: selectedAudioName,
            contentType: null
          }
        }
      }
    };
    const body = await request(options_1);
    // I got the response from the API, successfully translated!
    console.log('-------------------------------------------------------------');

    firstResponce = JSON.parse(body);
    idOfAudio = firstResponce["id"]

    console.log('---> I got the response from the API, successfully translated!');
    console.log('---> Id: ' + idOfAudio);

    //----------------------------------------------------------
    // Get the Text from the API
    const options_2 = {
      method: 'GET',
      url: 'https://api.speechmatics.com/v1.0/user/68879/jobs/' + idOfAudio + '/transcript',
      qs: { auth_token: 'ZjlhMjE1MzEtNDJkMS00ZTRjLWI4OTktMjNkZDA2NjE0MWNh' },
    };

    const body2 = await request(options_2);
    console.log('-------------------------------------------------------------');
    console.log('---> I got the responce from API');
    // console.log(body2);

    console.log('-------------------------------------------------------------');
    fs1.unlinkSync(("/tmp/" + selectedAudioName));
    console.log('---> File Removed!');

    console.log('-------------------------------------------------------------');
    console.log('---> Send the result to the Front End!');

    return {
      "firstResponce": firstResponce,
      "secondResponse": JSON.parse(body2)
    };
  } catch (error) {
    throw new Error(error);
  }
});
