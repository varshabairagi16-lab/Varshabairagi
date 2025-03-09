const axios = require('axios');
const GENIUS_API_TOKEN = 'gRv1cUGxYhzdvCjKBJqCwH9_VwmcZtNHpIYXyAQVr6c8dnMWO9Po7v-Lwz2w9UOQ2SjqJZdxzYEIcgmdAmgDXg';
const GENIUS_API_CLIENT_ID = 'zZ0MpucBCvw3uKiD-lmyBYyouvKNBShX5RnNMHeRhz5lRTKbObTiGDqhLh_VGeZ2';
module.exports.config = {
  name: 'lyrics',
  version: '2.0.0',
  hasPermission: 0,
  credits: 'Arun Kumar',
  description: 'Fetch lyrics of a song',
  commandCategory: 'media',
  usages: 'lyrics [song name]',
  cooldowns: 5
};
module.exports.run = async ({ api, event, args }) => {
  try {
    const songName = args.join(' ');
    const response = await axios.get(`https://api.genius.com/search?q=${encodeURIComponent(songName)}`, {
      headers: {
        Authorization: `Bearer ${GENIUS_API_TOKEN}`,
        'User-Agent': 'Arun'
      }
    });
    const data = response.data.response.hits[0];
    const lyricsResponse = await axios.get(data.result.url + '/lyrics', {
      headers: {
        Authorization: `Bearer ${GENIUS_API_TOKEN}`,
        'User-Agent': 'Arun'
      }
    });
    const lyrics = lyricsResponse.data.lyrics;
    const result = `❏ 
❏ Title: ${data.result.title}
❏ Artist: ${data.result.artist_names}
❏ Lyrics:
${lyrics}`;
    return api.sendMessage({ body: result }, event.threadID);
  } catch (error) {
    return console.error(error), api.sendMessage({ body: 'An error occurred while fetching lyrics.' }, event.threadID);
  }
};
