import fs from "fs/promises";

interface QuestionInfo {
  question: string;
  answer: string;
}

export default class QuestionStore {
  static #questions = new Array<QuestionInfo>();

  static getQuestions() {
    return this.#questions;
  }

  static async addQuestion(questionInfo: QuestionInfo) {
    this.#questions.push(questionInfo);
    await this.#saveQuestions();
  }

  static async loadQuestions() {
    try {
      const questions = JSON.parse(await fs.readFile("questions.json", "utf-8"));
      this.#questions = questions;
    } catch (error: any) {
      if (error.code !== "ENOENT") {
        throw error;
      }
    }
  }

  static async #saveQuestions() {
    await fs.writeFile("questions.json", JSON.stringify(this.#questions));
  }
}
