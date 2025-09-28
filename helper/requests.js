export const requestSymbols = Object.freeze({
  GET: Symbol("GET"),
  POST: Symbol("POST"),
  PUT: Symbol("PUT")
});

/**
 *
 * @param {String} url
 * @param {JSON} body
 * @param {Symbol} method
 * @returns
 */
export async function jsonRequest(url, body, method = requestSymbols.GET) {
  // console.log(`---> request(${url}, ${JSON.stringify(body)}, ${method.description})`);
  let headers = {
    "Accept": "*/*",
    "Connection": "keep-alive",
    "Content-Type": "application/json"
  };
  let requestData = {
    method: method.description,
    headers: headers,
    mode: "cors",
    cache: "no-cache"
  };
  if (method === requestSymbols.POST || method === requestSymbols.PUT) {
    requestData.body = JSON.stringify(body);
  };
  let request = new Request(url, requestData);
  let response = await fetch(request);
  let status = response.status;
  if (status != 200) return null;

  let res = await response.json();
  // console.log("res:", res);
  return res;
}

export async function formDataRequest(url, formData) {
  let request = new Request(url, {
    method: 'POST',
    headers: {
      "Accept": "*/*",
      "Connection": "keep-alive"
    },
    body: formData,
    mode: "cors",
    cache: "no-cache"
  });

  let response = await fetch(request);
  return await response.json();
}

export async function fetchJsonData(url) {
  let res = await fetch(url);
  console.log(res);
  if (!(res.ok && res.status == 200)) return null;
  let jsonData = await res.json();
  console.log(jsonData);
  return jsonData;
}
