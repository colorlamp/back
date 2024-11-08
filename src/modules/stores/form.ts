import fs from "fs/promises";

interface FormInfo {
  content: string;
  answers: FormAnswer[];
}

interface FormAnswer {
  userId: string;
  content: string;
}

export default class FormStore {
  static #forms = new Array<FormInfo>();

  static getForms() {
    return this.#forms;
  }

  static async addForm(formInfo: FormInfo) {
    this.#forms.push(formInfo);
    await this.#saveForms();
  }

  static async loadForms() {
    try {
      const forms = JSON.parse(await fs.readFile("forms.json", "utf-8"));
      this.#forms = forms;
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
