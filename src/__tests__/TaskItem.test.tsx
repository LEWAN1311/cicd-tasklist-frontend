import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { TaskItem } from '../components/TaskItem';
import type { Task } from '../types/task';

const baseTask: Task = {
	id: 1,
	title: 'Ma tâche',
	description: 'Une description',
	completed: false,
	createdAt: '2026-01-15T10:00:00Z',
	updatedAt: '2026-01-15T10:00:00Z',
};

function renderItem(overrides: Partial<React.ComponentProps<typeof TaskItem>> = {}) {
	const props = {
		task: baseTask,
		onToggle: vi.fn(),
		onDelete: vi.fn(),
		onEdit: vi.fn(),
		...overrides,
	};
	render(<TaskItem {...props} />);
	return props;
}

describe('TaskItem', () => {
	it('renders the task title and description', () => {
		renderItem();
		expect(screen.getByText('Ma tâche')).toBeInTheDocument();
		expect(screen.getByText('Une description')).toBeInTheDocument();
	});

	it('calls onToggle when the checkbox is clicked', async () => {
		const user = userEvent.setup();
		const { onToggle } = renderItem();

		await user.click(screen.getByRole('checkbox'));
		expect(onToggle).toHaveBeenCalledWith(1);
	});

	it('enters edit mode and saves changes', async () => {
		const user = userEvent.setup();
		const { onEdit } = renderItem();

		await user.click(screen.getByLabelText('Modifier'));
		const titleInput = screen.getByLabelText('Modifier le titre');
		await user.clear(titleInput);
		await user.type(titleInput, 'Titre modifié');
		await user.click(screen.getByRole('button', { name: 'Enregistrer' }));

		expect(onEdit).toHaveBeenCalledWith(1, {
			title: 'Titre modifié',
			description: 'Une description',
		});
	});

	it('does not save when the edited title is empty', async () => {
		const user = userEvent.setup();
		const { onEdit } = renderItem();

		await user.click(screen.getByLabelText('Modifier'));
		await user.clear(screen.getByLabelText('Modifier le titre'));
		await user.click(screen.getByRole('button', { name: 'Enregistrer' }));

		expect(onEdit).not.toHaveBeenCalled();
	});

	it('cancels edit mode and restores the original values', async () => {
		const user = userEvent.setup();
		renderItem();

		await user.click(screen.getByLabelText('Modifier'));
		const titleInput = screen.getByLabelText('Modifier le titre');
		await user.clear(titleInput);
		await user.type(titleInput, 'Changement annulé');
		await user.click(screen.getByRole('button', { name: 'Annuler' }));

		expect(screen.getByText('Ma tâche')).toBeInTheDocument();
	});

	it('asks for confirmation before deleting', async () => {
		const user = userEvent.setup();
		const { onDelete } = renderItem();

		const deleteButton = screen.getByLabelText('Supprimer');
		await user.click(deleteButton);
		expect(onDelete).not.toHaveBeenCalled();

		await user.click(deleteButton);
		expect(onDelete).toHaveBeenCalledWith(1);
	});
});
