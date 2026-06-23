import serverless from "serverless-http";
import { createApp } from "../../apps/api/src/app.js";
import { config } from "../../apps/api/src/config.js";
import { LocalAiService, OpenAiService } from "../../apps/api/src/services/ai-service.js";
import { MemoryStore } from "../../apps/api/src/store/memory-store.js";
import { MongoStore } from "../../apps/api/src/store/mongo-store.js";

const store = config.MONGODB_URI ? new MongoStore(config.MONGODB_URI) : new MemoryStore();
const ai = config.OPENAI_API_KEY
  ? new OpenAiService(config.OPENAI_API_KEY, config.OPENAI_MODEL)
  : new LocalAiService();
const expressHandler = serverless(createApp(store, ai));

let initialization: Promise<void> | undefined;

const ensureConnected = () => {
  initialization ??= store.connect();
  return initialization;
};

export const handler = async (
  event: Parameters<typeof expressHandler>[0],
  context: Parameters<typeof expressHandler>[1]
) => {
  await ensureConnected();
  return expressHandler(event, context);
};

