import fs from "fs/promises";

interface EventInfo {
  id: number;
  name: string;
  description: string;
  startAt: number;
  endAt: number;
  formId: number;
  userChatIds: string[];
}

export default class EventStore {
  static #events = new Array<EventInfo>();
  static #counter = 0;

  static getEvents() {
    return this.#events;
  }

  static getEvent(id: number) {
    return this.#events.find((event) => event.id === id);
  }

  static async addEvent(eventInfo: Omit<EventInfo, "id" | "userChatIds">) {
    this.#events.push({
      ...eventInfo,
      id: this.#counter++,
      userChatIds: [],
    });
    await this.#saveEvents();
  }

  static async addUserChatId(eventId: number, chatId: string) {
    const event = this.getEvent(eventId)!;

    event.userChatIds.push(chatId);
    await this.#saveEvents();
  }

  static async getChatIdsbyEventId(eventId: number) {
    const event = this.getEvent(eventId)!;

    return event.userChatIds;
  }

  static async loadEvents() {
    try {
      const events = JSON.parse(await fs.readFile("events.json", "utf-8"));
      this.#events = events;
      this.#counter = Math.max(...this.#events.map((event) => event.id)) + 1;
    } catch (error: any) {
      if (error.code !== "ENOENT") {
        throw error;
      }
    }
  }

  static async #saveEvents() {
    await fs.writeFile("events.json", JSON.stringify(this.#events));
  }
}
