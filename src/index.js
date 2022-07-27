document.addEventListener("DOMContentLoaded", init);

const modelId = "cHNF6PcUKCd";

const apiHost = "my.matterport.com";
const secureBtn = document.querySelector(".btn-secure");
const revokeBtn = document.querySelector(".btn-revoke");
const iframe = document.querySelector(".showcase-iframe");
const iframeReport = document.getElementById("iframe-src");

function init() {
  let iframeUrl = new URL(`https://${apiHost}/show/?m=${modelId}`);
  iframe.src = iframeUrl.href;
  iframeReport.innerText = `iframe src: ${iframeUrl.href}`;

  secureBtn.addEventListener("click", () => {
    const url = `/get-access?m=${iframeUrl.searchParams.get("m")}`;
    fetch(url, {
      method: "GET",
    })
      .then((res) => res.json())
      .then((data) => {
        iframeUrl = new URL(data.link);
        iframe.src = iframeUrl.href;
        iframeReport.innerText = `iframe src: ${iframeUrl.href}`;
      })
      .catch(console.error);
  });

  revokeBtn.addEventListener("click", () => {
    let iframeUrl = new URL(iframe.src);
    const url = `/revoke-access?access=${iframeUrl.searchParams.get("auth")}`;
    fetch(url, {
      method: "GET",
    })
      .then(() => {
        const src = iframe.src;
        iframe.addEventListener(
          "load",
          () => {
            iframe.src = src;
          },
          { once: true, capture: false }
        );
        iframe.src = "";
      })
      .catch(console.error);
  });
}
