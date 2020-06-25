const FONT_API_KEY = 'AIzaSyCS3S5i527evCkpF84e5tmGbwBXby430_4';

export function fetchList (apiKey = FONT_API_KEY) {
  return new Promise((resolve, reject) => {
    const url = `https://www.googleapis.com/webfonts/v1/webfonts?sort=popularity&key=${apiKey}`;
    const request = new XMLHttpRequest();
    request.overrideMimeType('application/json');
    request.open('GET', url, true);
    request.onreadystatechange = () => {
      // Request has completed
      if (request.readyState === 4) {
        // On error
        if (request.status !== 200) {
          return reject(new Error(`Response has status code ${request.status}`));
        }
        // On success
        const response = JSON.parse(request.responseText);
        return resolve(response.items);
      }
    };
    request.send();
  });
}
