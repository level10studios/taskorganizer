import { test, expect } from '@playwright/test';

// TEST 1: Verificación básica
test('Debe crear una nueva tarea y mostrarla en la columna "Por hacer"', async ({ page }) => {
  await page.goto('http://localhost:5500/');
  await page.getByTestId('input-task-title').fill('Tarea básica');
  await page.getByTestId('btn-add-task').click();
  await expect(page.getByTestId('column-todo')).toContainText('Tarea básica');
});

// TEST 2: Descripción larga
test('Historia de Usuario: Crear tarea con descripción larga', async ({ page }) => {
  await page.goto('http://localhost:5500/');
  await page.getByTestId('input-task-title').fill('Codegen Generator');
  await page.getByTestId('input-task-desc').fill('El codigo empezara a generar codigos con respeto a lo que escribi');
  await page.getByTestId('btn-add-task').click();
  await expect(page.getByTestId('column-todo')).toContainText('Codegen Generator');
});

// TEST 4: ERROR DETECTADO - Prevención de tareas duplicadas
// ESTE TEST DEBE FALLAR (MARCAR ROJO) PARA REPORTAR EL BUG
test('Bug Report: El sistema no debe permitir tareas duplicadas', async ({ page }) => {
  await page.goto('http://localhost:5500/');

  // 1. Crear la primera tarea "agua"
  await page.getByTestId('input-task-title').fill('agua');
  await page.getByTestId('btn-add-task').click();

  // 2. Intentar crear la misma tarea "agua"
  await page.getByTestId('input-task-title').fill('agua');
  await page.getByTestId('btn-add-task').click();

  // 3. Verificación: El contador DEBE ser 1. 
  // Como tu app permite el duplicado, el contador dirá "2".
  // Playwright comparará "2" contra "1" y lanzará el error FAILED.
  await expect(page.getByTestId('count-todo')).toHaveText('1');
});

// TEST 5: Prioridad por defecto
test('Prioridad por defecto en nueva tarea', async ({ page }) => {
  await page.goto('http://localhost:5500/');
  await page.getByTestId('input-task-title').fill('comprar leche');
  await page.getByTestId('btn-add-task').click();
  // Corregimos el selector para que sea más robusto
  await expect(page.getByTestId('column-todo')).toContainText('Media');
});

// TEST 6: Validacion de campos limite de texto
test('test', async ({ page }) => {
  await page.goto('http://localhost:5500/');
  await page.getByRole('main').click();
  await page.getByTestId('input-task-title').click();
  await page.getByTestId('input-task-title').fill('A'.repeat(120));
  const valorReal = await page.getByTestId('input-task-title').inputValue();
  expect(valorReal.length).toBe(100);
});

// TEST 7: verificando el texto "Media" tras crear.
test('Verificar prioridad Media por defecto', async ({ page }) => {
  await page.goto('http://localhost:5500/'); // Siempre inicia con la URL
  await page.getByTestId('input-task-title').click();
  await page.getByTestId('input-task-title').fill('comprar leche');
  await page.getByTestId('btn-add-task').click();

  // CORRECCIÓN: El locator va dentro del expect, y luego el matcher .toBeVisible()
  await expect(page.getByTestId('column-todo').getByText('Media')).toBeVisible();
});