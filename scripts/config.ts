import fs from "fs/promises"

var config: any;
/* update for file config.json */

export async function initConfig() {
   console.log("init");
   config = JSON.parse((await fs.readFile('./config.json')).toString());
   return config;
}

export function getConfig() {
   return config;
}

export function setConfig(path: string, val: string) {
   console.log(config);
   const splitPath = path.split('.').reverse()

   var ref = config;
   while (splitPath.length > 1) {
      let key = splitPath.pop();
      if (!key) break;
      ref = ref[key] ?? {};
   }

   let key = splitPath.pop();
   if (key)
      ref[key] = val;
}

export async function updateConfig() {
   console.log("write: ", JSON.stringify(config));
   return fs.writeFile('./config.json', JSON.stringify(config, null, 2));
}