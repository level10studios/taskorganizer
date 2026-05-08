import { test, expect } from '@playwright/test';
import { TaskPage } from './pages/TaskPage';

test.describe('Pruebas de Task Manager con POM', () => {
  let taskPage: TaskPage;

  // Esto se ejecuta antes de cada test: ahorramos líneas de código
  test.beforeEach(async ({ page }) => {
    taskPage = new TaskPage(page);
    await taskPage.goto();
  });

  test('Debe crear una nueva tarea y mostrarla en la columna "Por hacer"', async () => {
    await taskPage.crearTarea('Tarea básica');
    await expect(taskPage.columnTodo).toContainText('Tarea básica');
  });

  test('Historia de Usuario: Crear tarea con descripción larga', async () => {
    await taskPage.crearTarea('Codegen Generator', 'El codigo empezara a generar codigos...');
    await expect(taskPage.columnTodo).toContainText('Codegen Generator');
  });

  test('Bug Report: El sistema no debe permitir tareas duplicadas', async () => {
    await taskPage.crearTarea('agua');
    await taskPage.crearTarea('agua');
    // La lógica del bug sigue siendo la misma: esperamos 1 pero habrá 2
    await expect(taskPage.countTodo).toHaveText('1');
  });

  test('Validacion de campos limite de texto', async () => {
    await taskPage.inputTitle.fill('A'.repeat(120));
    const valorReal = await taskPage.inputTitle.inputValue();
    expect(valorReal.length).toBe(100);
  });
});