import { CCError } from "../utils.js";
// TODO: https://curl.se/docs/manpage.html#-F
// -F is the most complicated option, we only handle
// name=value and name=@file and name=<file
export function parseForm(form) {
    const multipartUploads = [];
    for (const multipartArgument of form) {
        if (!multipartArgument.value.includes("=")) {
            throw new CCError("invalid value for --form/-F: " +
                JSON.stringify(multipartArgument.value.toString()));
        }
        const [name, value] = multipartArgument.value.split("=", 2);
        const isString = multipartArgument.type === "string";
        if (!isString && value.charAt(0) === "@") {
            const contentFile = value.slice(1);
            const filename = contentFile;
            multipartUploads.push({ name, contentFile, filename });
        }
        else if (!isString && value.charAt(0) === "<") {
            const contentFile = value.slice(1);
            multipartUploads.push({ name, contentFile });
        }
        else {
            const content = value;
            multipartUploads.push({ name, content });
        }
    }
    return multipartUploads;
}
//# sourceMappingURL=form.js.map