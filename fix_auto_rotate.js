const fs = require('fs');

let typesPath = 'app/types/controller.tsx';
let typesContent = fs.readFileSync(typesPath, 'utf8');

if (!typesContent.includes('AutoRotate')) {
typesContent += `
export interface AutoRotate {
  enabled: boolean;
  speed: number;
  axis: string;
}
`;
fs.writeFileSync(typesPath, typesContent);
}

let constsPath = 'app/consts/controller.tsx';
let constsContent = fs.readFileSync(constsPath, 'utf8');

if (!constsContent.includes('AutoRotate')) {
constsContent = constsContent.replace(
  /import \{/,
  'import {\n  AutoRotate,'
);

constsContent += `
export const D_AUTO_ROTATE: AutoRotate = {
  enabled: false,
  speed: 1,
  axis: "y",
};
`;
fs.writeFileSync(constsPath, constsContent);
}
