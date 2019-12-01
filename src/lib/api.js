const API_URL = process.env.API_URL;
const Firebase = require('./firebase-client')
const validators = require('./validators')

const headers = async method => ({
  method: method,
  headers: {
    "Content-Type": "Application/json",
    "Accept": "Application/json",
    "Authorization": await Firebase.token()
  }
})

const apiRequest = async function(method, path, body, params) {
  if(params) path += `?${module.exports.buildQuery(params)}`
  const request = await headers(method);
  if (method !== 'GET') request.body = JSON.stringify(body);

  let res = await fetch(API_URL + path, request);
  let json = await res.json();

  if (res.ok) return json;
  else throw json.err ? json : Object.assign(json, { err: "An unexpected error has occurred" })
}

const validate = (struct, template, validatorSet = validators) => {
  let obj = {}; template = validatorSet[template];
  for (var k in template) {
    if (typeof template[k] === 'object') {
      let x = validate(struct, k, template);
      if (x === false) return false;
      else obj[k] = x;
    }
    else {
      let x = struct[k] !== undefined && template[k](struct[k]);
      if (x === false) {
        window.alert('Invalid ' + k);
        return false;
      }
      obj[k] = x;
    }
  }
  return obj;
}

module.exports = {
  get: (path, params) => apiRequest('GET', path, undefined, params),
  post: (path, body, params) => apiRequest('POST', path, body, params),
  put: (path, body, params) => apiRequest('PUT', path, body, params),
  delete: (path, body, params) => apiRequest('DELETE', path, body, params),

  imgPost: async (bucket, files) => {
    let body = new FormData();
    files.forEach(file => body.append('images', file));
    let res = await fetch(`${API_URL}/image/${bucket}`, {
      method: "POST",
      headers: { Authorization: await Firebase.token() },
      body: body
    });
    let json = await res.json();

    if (res.ok) return json;
    else throw json.err ? json : Object.assign(json, { err: "An unexpected error has occurred" })
  },

  buildQuery: queryObj => Object.entries(queryObj).map(x => x.join('=')).join('&'),
  validate: validate
}
