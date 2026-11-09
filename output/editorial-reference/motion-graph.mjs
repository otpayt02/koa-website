import {LocalBackend} from 'file:///C:/Users/olive/AppData/Roaming/npm/node_modules/gitnexus/dist/mcp/local/local-backend.js';
import fs from 'node:fs';
const backend=new LocalBackend();await backend.init();
const result=await backend.callTool('detect_changes',{scope:'all',repo:'.'});
fs.writeFileSync('C:/Users/olive/Projects/koa-website/output/editorial-reference/motion-graph.json',JSON.stringify(result,null,2));
fs.writeSync(1,JSON.stringify({summary:result.summary,partial:result.partial,truncated:result.truncated,error:result.error,processes:result.affected_processes}));
process.exit(result.error||result.partial||result.truncated?1:0);
