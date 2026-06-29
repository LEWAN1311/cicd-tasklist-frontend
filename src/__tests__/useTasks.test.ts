import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useTasks } from '../hooks/useTasks';
import * as taskApi from '../api/taskApi';
import type { Task } from '../types/task';

const taskA: Task = {
	id: 1,
	title: 'Tâche A',
	description: null,
	completed: false,
	createdAt: '2026-01-15T10:00:00Z',
	updatedAt: '2026-01-15T10:00:00Z',
};

const taskB: Task = {
	id: 2,
	title: 'Tâche B',
	description: null,
	completed: false,
	createdAt: '2026-01-16T10:00:00Z',
	updatedAt: '2026-01-16T10:00:00Z',
};

beforeEach(() => {
	vi.restoreAllMocks();
});

afterEach(() => {
	vi.restoreAllMocks();
});

describe('useTasks', () => {
	it('loads tasks on mount', async () => {
		vi.spyOn(taskApi, 'getTasks').mockResolvedValue([taskA]);

		const { result } = renderHook(() => useTasks());

		expect(result.current.loading).toBe(true);
		await waitFor(() => expect(result.current.loading).toBe(false));
		expect(result.current.tasks).toEqual([taskA]);
		expect(result.current.error).toBeNull();
	});

	it('sets an error when loading fails', async () => {
		vi.spyOn(taskApi, 'getTasks').mockRejectedValue(new Error('Échec réseau'));

		const { result } = renderHook(() => useTasks());

		await waitFor(() => expect(result.current.loading).toBe(false));
		expect(result.current.error).toBe('Échec réseau');
	});

	it('adds a task to the front of the list', async () => {
		vi.spyOn(taskApi, 'getTasks').mockResolvedValue([taskA]);
		vi.spyOn(taskApi, 'createTask').mockResolvedValue(taskB);

		const { result } = renderHook(() => useTasks());
		await waitFor(() => expect(result.current.loading).toBe(false));

		await act(async () => {
			await result.current.addTask({ title: 'Tâche B' });
		});

		expect(result.current.tasks).toEqual([taskB, taskA]);
	});

	it('edits an existing task', async () => {
		vi.spyOn(taskApi, 'getTasks').mockResolvedValue([taskA]);
		const edited = { ...taskA, title: 'Modifiée' };
		vi.spyOn(taskApi, 'updateTask').mockResolvedValue(edited);

		const { result } = renderHook(() => useTasks());
		await waitFor(() => expect(result.current.loading).toBe(false));

		await act(async () => {
			await result.current.editTask(1, { title: 'Modifiée' });
		});

		expect(result.current.tasks[0].title).toBe('Modifiée');
	});

	it('removes a task', async () => {
		vi.spyOn(taskApi, 'getTasks').mockResolvedValue([taskA, taskB]);
		vi.spyOn(taskApi, 'deleteTask').mockResolvedValue();

		const { result } = renderHook(() => useTasks());
		await waitFor(() => expect(result.current.loading).toBe(false));

		await act(async () => {
			await result.current.removeTask(1);
		});

		expect(result.current.tasks).toEqual([taskB]);
	});

	it('toggles a task completion state', async () => {
		vi.spyOn(taskApi, 'getTasks').mockResolvedValue([taskA]);
		const toggled = { ...taskA, completed: true };
		const updateSpy = vi.spyOn(taskApi, 'updateTask').mockResolvedValue(toggled);

		const { result } = renderHook(() => useTasks());
		await waitFor(() => expect(result.current.loading).toBe(false));

		await act(async () => {
			await result.current.toggleComplete(1);
		});

		expect(updateSpy).toHaveBeenCalledWith(1, { completed: true });
		expect(result.current.tasks[0].completed).toBe(true);
	});

	it('does nothing when toggling an unknown task', async () => {
		vi.spyOn(taskApi, 'getTasks').mockResolvedValue([taskA]);
		const updateSpy = vi.spyOn(taskApi, 'updateTask');

		const { result } = renderHook(() => useTasks());
		await waitFor(() => expect(result.current.loading).toBe(false));

		await act(async () => {
			await result.current.toggleComplete(999);
		});

		expect(updateSpy).not.toHaveBeenCalled();
	});
});
