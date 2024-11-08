import fs from "fs/promises";

interface EventInfo {
  name: string;
  description: string;
  startAt: number;
  endAt: number;
  formId: number;
}

export default class EventStore {
  static #events = new Array<EventInfo>();

  static getEvents() {
    return this.#events;
  }

  static async addEvent(eventInfo: EventInfo) {
    this.#events.push(eventInfo);
    await this.#saveEvents();
  }

  static async loadEvents() {
    try {
      const events = JSON.parse(await fs.readFile("events.json", "utf-8"));
      this.#events = events;
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
