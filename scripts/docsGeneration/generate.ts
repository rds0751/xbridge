import {Command, Option} from 'commander';
import {sync as rimrafSync} from "rimraf";
import {execSync} from "child_process";
import writeBetweenMarks from "./generateTableOfContents/parts/writeBetweenMarks";
import {
    CONTRACTS_AUTOGENERATED_DESCRIPTION_END_MARK,
    CONTRACTS_AUTOGENERATED_DESCRIPTION_START_MARK, GENERATED_CONTENTS_PATH, README_PATH
} from "./constants";
import {readFileSync} from "fs";
import {CONTRACT_DOCS_PATH} from "./generateTableOfContents/parts/constants";

const allowedDocTypes = ['main', 'readme', 'all'] as const;
const typeOption = new Option('--type <type>', 'documentation to generate')
    .choices([...allowedDocTypes])
    .makeOptionMandatory()

const documentationType = 'all'


const docgenCommonPart = 'solidity-docgen --input ./contracts/ --exclude ./contracts/mock --solc-module solc-0.8.7';
const docgenMainArgs = '--output ./docs/contracts/ --templates scripts/docsGeneration/templates/main';
const docgenReadmeArgs = '--output ./tmp/ --templates scripts/docsGeneration/templates/readme --helpers ./tmp/handlebarsHelpers.js --output-structure single';

const compileHandlebarsHelpers = 'yarn tsc scripts/docsGeneration/handlebarsHelpers.ts --esModuleInterop --outDir tmp';

function execAndLog(command: string): void {
    console.log(execSync(command).toString());
}

function generateMainDocs() {
    rimrafSync(CONTRACT_DOCS_PATH);
    execAndLog(`${docgenCommonPart} ${docgenMainArgs}`);
    execAndLog('yarn ts-node scripts/docsGeneration/removeAllButWhitelistedDocs.ts')
    execAndLog('yarn ts-node scripts/docsGeneration/generateTableOfContents/index.ts')
}

function addContractsDescriptionsToReadme(descriptions: string) {
    writeBetweenMarks(
        CONTRACTS_AUTOGENERATED_DESCRIPTION_START_MARK,
        CONTRACTS_AUTOGENERATED_DESCRIPTION_END_MARK,
        descriptions,
        README_PATH,
    )
}

function generateDocForReadme() {
    execAndLog(compileHandlebarsHelpers);
    execAndLog(`${docgenCommonPart} ${docgenReadmeArgs}`);
    const descriptions = readFileSync(GENERATED_CONTENTS_PATH)
        .toString()
        .trim()
        .replace(/\n{2,}/g, '\n');
    addContractsDescriptionsToReadme(descriptions);
    rimrafSync('tmp/*');
}

switch (documentationType) {
    case "all":
        generateMainDocs();
        generateDocForReadme();
        break;
    default:
        throw new Error(`Impossible type "${documentationType}"`)
}