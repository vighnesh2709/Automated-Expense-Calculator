import fs from "fs";
import { testing } from "./test.js";
import { blahblah } from "./test.js";
let ans = testing(10);
console.log(typeof (ans));
console.log(ans);
fs.writeFileSync("text.txt", "hello macchan");
let checking = await blahblah("hello");
console.log(checking);
