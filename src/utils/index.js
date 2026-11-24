function addZero(n) {
  return n >= 10 ? n : "0" + n;
}
export const getCurrentDateTime = function () {
  let date = new Date();
  let date_time = date.getFullYear() + "-";
  date_time += addZero(date.getMonth() + 1) + "-";
  date_time += addZero(date.getDate()) + " ";
  date_time += addZero(date.getHours()) + ":";
  date_time += addZero(date.getMinutes()) + ":";
  date_time += addZero(date.getSeconds());
  return date_time;
};

export const getCurrentTimestamp = () => {
  let timestamp = new Date().getTime();
  return timestamp;
};
export const timestamp2datetime = function (timestamp) {
  if (!timestamp) {
    return "";
  }
  timestamp = Number(timestamp);
  // 支持 10 位秒级时间戳，转换为毫秒
  if (String(timestamp).length === 10) {
    timestamp = timestamp * 1000;
  }
  let date = new Date(timestamp);
  let date_time = date.getFullYear() + "-";
  date_time += addZero(date.getMonth() + 1) + "-";
  date_time += addZero(date.getDate()) + " ";
  date_time += addZero(date.getHours()) + ":";
  date_time += addZero(date.getMinutes()) + ":";
  date_time += addZero(date.getSeconds());
  return date_time;
};
export const timestamp2date = function (timestamp) {
  if (!timestamp) {
    return "";
  }
  timestamp = Number(timestamp);
  // 支持 10 位秒级时间戳，转换为毫秒
  if (String(timestamp).length === 10) {
    timestamp = timestamp * 1000;
  }
  let date = new Date(timestamp);
  let date_time = date.getFullYear() + "-";
  date_time += addZero(date.getMonth() + 1) + "-";
  date_time += addZero(date.getDate());
  return date_time;
};
export const datatime2timestamp = () => {
  //console.info("datatime2timestamp");
};
