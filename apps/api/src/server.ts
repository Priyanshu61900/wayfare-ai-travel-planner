import { createApp } from "./app.js";
import { config } from "./config.js";
import { LocalAiService, OpenAiService } from "./services/ai-service.js";
import { MemoryStore } from "./store/memory-store.js";
import { MongoStore } from "./store/mongo-store.js";

const store = config.MONGODB_URI ? new MongoStore(config.MONGODB_URI) : new MemoryStore();
const ai = config.OPENAI_API_KEY
  ? new OpenAiService(config.OPENAI_API_KEY, config.OPENAI_MODEL)
  : new LocalAiService();

await store.connect();
const server = createApp(store, ai).listen(config.PORT, () => {
  console.log(
    `Wayfare API listening on http://localhost:${config.PORT} (${config.MONGODB_URI ? "MongoDB" : "in-memory"} store, ${config.OPENAI_API_KEY ? config.OPENAI_MODEL : "local planner"})`
  );
});

const shutdown = async () => {
  server.close(async () => {
    await store.close();
    process.exit(0);
  });
};
process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

