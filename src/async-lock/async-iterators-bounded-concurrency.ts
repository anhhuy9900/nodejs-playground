import pLimit from 'p-limit';

const limit = pLimit(8); // pick based on downstream capacity
const tasks = [];

// for await (const chunk of bigInputStream) {
//   tasks.push(
//     limit(async () => {
//       const parsed = await parse(chunk);
//       await writeToDB(parsed); // slow sink, bounded by limit
//     })
//   );
// }
// await Promise.all(tasks);
