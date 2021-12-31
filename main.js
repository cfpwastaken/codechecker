import ora from "ora";
import * as fs from "fs";
const file = process.argv[2];
let spinner = ora("Performing check on " + file).start();
spinner.info();

const content = fs.readFileSync(file, {encoding: 'utf8'});

spinner = ora("Checking for 'use strict'").start();
let strict = content.match(/'use strict';/g);
if (strict) {
    spinner.succeed("Found 'use strict'");
} else {
    spinner.warn("Missing 'use strict'");
}

spinner = ora("Checking for eval").start();
let evalCheck = content.match(/eval/g);
if (evalCheck) {
    spinner.fail("Found eval");
} else {
    spinner.succeed("No eval");
}

spinner = ora("Checking function count").start();
let funcCheck = content.match(/function/g);
if (funcCheck) {
    spinner.succeed("Found " + funcCheck.length + " functions");
} else {
    spinner.warn("No functions");
}

// check if all imports are defined at the top of the file
spinner = ora("Checking for imports").start();
// for every line
let imports = content.split("\n");
let importCheck = true;
let defined = false;
let importCount = 0;
let wrongImportCount = 0;
for (let i = 0; i < imports.length; i++) {
    // if it starts with import
    if (imports[i].startsWith("import")) {
        if(defined) {
            importCheck = false;
            wrongImportCount++;
        } else {
            importCount++;
        }
    } else {
        if(imports[i].startsWith("'use strict'")) continue;
        if(imports[i].trim() === "") continue;
        defined = true;
    }
}
if (importCheck) {
    spinner.succeed("Found " + importCount + " imports");
} else {
    spinner.warn("Found " + wrongImportCount + " wrong imports");
}

spinner = ora("Checking for repeating empty lines").start();
// for every line
let emptyLines = content.split("\n");
let emptyLineCheck = true;
let emptyLineCount = 0;
for (let i = 0; i < emptyLines.length; i++) {
    if (emptyLines[i].trim() === "") {
        emptyLineCount++;
        if(emptyLineCount > 2) {
            emptyLineCheck = false;
            break;
        }
    } else {
        emptyLineCount = 0;
    }
}
if (emptyLineCheck) {
    spinner.succeed("No repeated empty lines");
} else {
    spinner.warn("Found repeated empty lines (>2 empty lines)");
}