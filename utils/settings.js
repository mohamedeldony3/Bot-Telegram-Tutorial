import fs from "fs";

export function getUserSettings(userId) {
  if (!fs.existsSync("settings.json")) return {};

  const data = JSON.parse(fs.readFileSync("settings.json"));

  return data[userId] || {};
}

export function saveSetting(userId, key, value) {
  let data = {};

  if (fs.existsSync("settings.json")) {
    data = JSON.parse(fs.readFileSync("settings.json"));
  }

  if (!data[userId]) data[userId] = {};

  data[userId][key] = value;

  fs.writeFileSync("settings.json", JSON.stringify(data, null, 2));
}
