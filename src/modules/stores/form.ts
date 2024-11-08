import fs from "fs/promises";

interface FormInfo {
  id: number;
  content: string;
  answers: FormAnswer[];
}

interface FormAnswer {
  userId: string;
  content: string;
}

export default class FormStore {
  static #forms = new Array<FormInfo>();
  static #counter = 0;

  static getForms() {
    return this.#forms;
  }

  static getForm(id: number) {
    return this.#forms.find((form) => form.id === id);
  }

  static async addForm(formInfo: Exclude<FormInfo, "id" | "answers">) {
    this.#forms.push({
      ...formInfo,
      id: this.#counter++,
      answers: [],
    });
    await this.#saveForms();
  }

  static async loadForms() {
    try {
      const forms = JSON.parse(await fs.readFile("forms.json", "utf-8"));
      this.#forms = forms;
      this.#counter = Math.max(...this.#forms.map((form) => form.id)) + 1;
    } catch (error: any) {
      if (error.code !== "ENOENT") {
        throw error;
      }
    }
  }

  static async #saveForms() {
    await fs.writeFile("forms.json", JSON.stringify(this.#forms));
  }
}
