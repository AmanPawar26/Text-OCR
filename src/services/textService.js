import fs from "fs-extra";
import path from "path";

export const saveAsTextFile = async (filename, text) => {
  const outputDir = path.resolve("src/output/text");
  await fs.ensureDir(outputDir);

  const txtPath = path.join(outputDir, `${Date.now()}_${filename}.txt`);
  await fs.writeFile(txtPath, text);
  return txtPath;
};
