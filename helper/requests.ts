export const requestSymbols = Object.freeze({
  GET: Symbol("GET"),
  POST: Symbol("POST"),
  PUT: Symbol("PUT")
});

export async function jsonRequest(url: string, body?: unknown, method: symbol = requestSymbols.GET): Promise<unknown> {
  // console.log(`---> request(${url}, ${JSON.stringify(body)}, ${method.description})`);
  let headers: Record<string, string> = {
    "Accept": "*/*",
    "Connection": "keep-alive",
    "Content-Type": "application/json"
  };
  let requestData: RequestInit = {
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

export async function formDataRequest(url: string, formData: FormData): Promise<unknown> {
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

export async function fetchJsonData(url: string): Promise<unknown> {
  let res = await fetch(url);
  console.log(res);
  if (!(res.ok && res.status == 200)) return null;
  let jsonData = await res.json();
  console.log(jsonData);
  return jsonData;
}
