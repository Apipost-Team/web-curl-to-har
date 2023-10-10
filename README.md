# web-curl-to-har
This is a plugin used on the browser side to convert curl commands into har objects

## useage

```js
import webCurlToHar, { setConfig } from 'web-curl-to-har';

if (isElectron()) {
  if (process.env.NODE_ENV === 'development') {
    setConfig('./');
  } else {
    setConfig(window?.path.join(window.__dirname, './build/'));
  }
} else {
  setConfig('./');
}

const handleCurl2Har=()=>{
      const curl= `curl 'http://www.apipost.cn/' `
      const curlData = webCurlToHar(curl);
      console.log(curlData);
}


/*
logs:
[{"request":{"method":"GET","url":"http://www.apipost.cn/","httpVersion":"HTTP/1.1","cookies":[],"headers":[],"queryString":[],"headersSize":-1,"bodySize":-1}}]
*/

```
