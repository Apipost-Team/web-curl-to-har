import fs from "fs";
import path from "path";
import { toHarString } from '../src/index.js'
import { fileURLToPath } from "url";


const __dirname = path.dirname(fileURLToPath(import.meta.url));
const curlCommandsDir = path.resolve(__dirname, "./curl_commands");
const testFileNames = fs.readdirSync(curlCommandsDir).filter((f) => f.endsWith(".sh"));
for (const fileName of testFileNames) {
    const inputFilePath = path.resolve(curlCommandsDir, fileName);
    const inputFileContents = fs.readFileSync(inputFilePath, "utf8");

    const aaa = toHarString(inputFileContents);
    console.log(JSON.stringify(aaa));
}
