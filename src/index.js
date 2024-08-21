import { btoa } from "./utils.js";
import { warnIfPartsIgnored } from "./Warnings.js";
import { parse, COMMON_SUPPORTED_ARGS } from "./parse.js";
import { parseQueryString } from "./Query.js";
const multipart = require("parse-multipart-data");
const supportedArgs = new Set([
  ...COMMON_SUPPORTED_ARGS,
  //   "form",
  //   "form-string",
  // TODO: generate digest auth header
  "anyauth",
  "no-anyauth",
  "http1.1",
  "http2",
  "http2-prior-knowledge",
  "http3",
  "http3-only",
]);

function getFilesString(request) {
  if (!request.multipartUploads) {
    return undefined;
  }
  const dataList = [];
  for (const m of request.multipartUploads) {
    const fileName = m?.filename?.toString();
    const dataItem = {
      name: m?.name?.toString(),
      value: m?.content?.toString() || fileName,
    };
    if (fileName !== undefined) {
      dataItem.fileName = fileName;
    }
    dataList.push(dataItem);
  }
  if (dataList.length === 0) {
    return undefined;
  }
  const mimeType = request?.headers?.getContentType() || "multipart/form-data";
  return {
    mimeType,
    params: dataList,
  };
}

function getMultipartData(request, boundary) {
  let requestBody = request.data.toString();

  if (!requestBody) {
    return undefined;
  }

  const multyParts = multipart.parse(Buffer.from(requestBody), boundary);

  const dataList = [];
  for (let item of multyParts) {
    if (item.filename) {
      dataList.push({
        name: item.name,
        value: item.filename,
        fileName: item.filename,
      });
    } else {
      dataList.push({
        name: item.name,
        value: item?.data?.toString() || "",
      });
    }
  }
  if (dataList.length === 0) {
    return undefined;
  }
  const mimeType = request.headers.getContentType() || "";
  return {
    mimeType,
    params: dataList,
  };
}

function getDataString(request) {
  if (!request.data) {
    return null;
  }
  // TODO: is this correct?
  const mimeType = request.headers.getContentType() || "";
  try {
    // TODO: look at dataArray and generate fileName:
    const [parsedQuery] = parseQueryString(request.data);
    if (parsedQuery && parsedQuery.length) {
      return {
        mimeType,
        params: parsedQuery.map((q) => ({
          name: q[0].toString(),
          value: q[1].toString(),
        })),
      };
    }
  } catch (_a) {}
  const text = request.data.toString();
  return { mimeType, text };
}
function _requestAndUrlToHar(request, url, warnings = []) {
  const requestHar = {
    method: url.method.toString(),
    url: (url.queryList ? url.urlWithoutQueryList : url.url).toString(),
    httpVersion: request.http3
      ? "HTTP/3"
      : request.http2
      ? "HTTP/2"
      : "HTTP/1.1",
    cookies: [],
    headers: [],
    queryString: [],
    headersSize: -1,
    bodySize: -1,
  };
  if (request.cookies) {
    // TODO: repeated cookies
    requestHar.cookies = request.cookies.map((c) => ({
      name: c[0].toString(),
      value: c[1].toString(),
    }));
    request.headers.delete("Cookie");
  }
  if (request.headers.length) {
    requestHar.headers = request.headers.headers
      .filter((h) => h[1] !== null)
      .map((h) => ({ name: h[0].toString(), value: h[1].toString() }));
  }
  if (request.urls[0].auth) {
    const [user, password] = request.urls[0].auth;
    if (request.authType === "basic") {
      // Generate Authorization header by hand
      const authHeader =
        "Basic " + btoa(`${user.toString()}:${password.toString()}`);
      requestHar.headers.push({ name: "Authorization", value: authHeader });
    }
  }
  if (url.queryList) {
    requestHar.queryString = url.queryList.map((q) => ({
      // TODO: warn about variables
      name: q[0].toString(),
      value: q[1].toString(),
    }));
  }

  if (request?.multipartUploads) {
    const fileData = getFilesString(request);
    if (fileData) {
      requestHar.postData = fileData;
    }
  }

  //如果是文件
  const boundary = request.headers.getBoundary();
  if (boundary !== undefined) {
    const multipartData = getMultipartData(request, boundary);
    if (multipartData) {
      requestHar.postData = multipartData;
    }
    return requestHar;
  }

  if (request.data) {
    const harData = getDataString(request);
    if (harData) {
      requestHar.postData = harData;
    }
  }
  return requestHar;
}
function _toHarString(requests, warnings = []) {
  const harRequests = [];
  for (const request of requests) {
    for (const url of request.urls) {
      harRequests.push(_requestAndUrlToHar(request, url, warnings));
    }
  }
  return harRequests.map((r) => ({ request: r }));
}
function toHarStringWarn(curlCommand, warnings = []) {
  const requests = parse(curlCommand, supportedArgs, warnings);
  requests.map((r) => warnIfPartsIgnored(r, warnings, { multipleUrls: true }));
  const har = _toHarString(requests, warnings);
  return [har, warnings];
}
function toHarString(curlCommand) {
  return toHarStringWarn(curlCommand)[0];
}

export { setConfig } from "./shell/Parser.js";

export default toHarString;
