import { Page, Locator } from '@playwright/test';

export class TaskPage {
  readonly page: Page;
  readonly inputTitle: Locator;
  readonly inputDesc: Locator;
  readonly btnAdd: Locator;
  readonly columnTodo: Locator;
  readonly countTodo: Locator;

  constructor(page: Page) {
    this.page = page;
    // Centralizamos los selectores que ya usabas
    this.inputTitle = page.getByTestId('input-task-title');
    this.inputDesc = page.getByTestId('input-task-desc');
    this.btnAdd = page.getByTestId('btn-add-task');
    this.columnTodo = page.getByTestId('column-todo');
    this.countTodo = page.getByTestId('count-todo');
  }

  async goto() {
    // Usamos '/' porque ya configuramos el baseURL en playwright.config.ts
    await this.page.goto('/');
  }

  async crearTarea(titulo: string, descripcion: string = '') {
    await this.inputTitle.fill(titulo);
    if (descripcion) await this.inputDesc.fill(descripcion);
    await this.btnAdd.click();
  }
}