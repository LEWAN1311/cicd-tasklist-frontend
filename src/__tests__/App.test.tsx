import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import App from '../App';
import * as taskApi from '../api/taskApi';
import type { Task } from '../types/task';

const tasks: Task[] = [
	{
		id: 1,
		title: 'Tâche existante',
		description: null,
		completed: true,
		createdAt: '2026-01-15T10:00:00Z',
		updatedAt: '2026-01-15T10:00:00Z',
	},
];

beforeEach(() => {
	vi.restoreAllMocks();
});

describe('App', () => {
	it('renders the header and loaded tasks with stats', async () => {
		vi.spyOn(taskApi, 'getTasks').mockResolvedValue(tasks);

		render(<App />);

		expect(screen.getByText('Mes Tâches')).toBeInTheDocument();
		await waitFor(() =>
			expect(screen.getByText('Tâche existante')).toBeInTheDocument()
		);
		expect(screen.getByText('Total')).toBeInTheDocument();
		expect(screen.getByText('Terminées')).toBeInTheDocument();
	});

	it('adds a task through the form', async () => {
		const user = userEvent.setup();
		vi.spyOn(taskApi, 'getTasks').mockResolvedValue([]);
		const created: Task = {
			id: 2,
			title: 'Acheter du pain',
			description: null,
			completed: false,
			createdAt: '2026-01-17T10:00:00Z',
			updatedAt: '2026-01-17T10:00:00Z',
		};
		const createSpy = vi.spyOn(taskApi, 'createTask').mockResolvedValue(created);

		render(<App />);
		await waitFor(() => expect(screen.getByTestId('empty')).toBeInTheDocument());

		await user.type(screen.getByLabelText('Titre'), 'Acheter du pain');
		await user.click(screen.getByRole('button', { name: 'Ajouter' }));

		await waitFor(() =>
			expect(createSpy).toHaveBeenCalledWith({ title: 'Acheter du pain', description: undefined })
		);
		expect(await screen.findByText('Acheter du pain')).toBeInTheDocument();
	});
});
