import Parser from "web-tree-sitter";
let parser = null;
export async function setConfig(path) {
  await Parser.init({
    locateFile(scriptName, scriptDirectory) {
      return path + scriptName;
    },
  });
  parser = new Parser();
  const Bash = await Parser.Language.load(path + "tree-sitter-bash.wasm");
  parser.setLanguage(Bash);
}
//setConfig("");

export default function getParser() {
  return parser;
}
