import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { TaskForm } from '../components/TaskForm';

describe('TaskForm', () => {
	it('renders the create form by default', () => {
		render(<TaskForm onSubmit={vi.fn()} />);
		expect(screen.getByText('Nouvelle tâche')).toBeInTheDocument();
		expect(screen.getByRole('button', { name: 'Ajouter' })).toBeInTheDocument();
	});

	it('renders the edit form with initial values', () => {
		render(
			<TaskForm
				onSubmit={vi.fn()}
				mode="edit"
				initialValues={{ title: 'Existant', description: 'Desc' }}
			/>
		);
		expect(screen.getByText('Modifier la tâche')).toBeInTheDocument();
		expect(screen.getByLabelText('Titre')).toHaveValue('Existant');
		expect(screen.getByLabelText('Description')).toHaveValue('Desc');
	});

	it('shows a validation error when the title is empty', async () => {
		const user = userEvent.setup();
		const onSubmit = vi.fn();
		render(<TaskForm onSubmit={onSubmit} />);

		await user.click(screen.getByRole('button', { name: 'Ajouter' }));

		expect(screen.getByRole('alert')).toHaveTextContent('Le titre est requis');
		expect(onSubmit).not.toHaveBeenCalled();
	});

	it('submits the trimmed title and description', async () => {
		const user = userEvent.setup();
		const onSubmit = vi.fn();
		render(<TaskForm onSubmit={onSubmit} />);

		await user.type(screen.getByLabelText('Titre'), '  Ma tâche  ');
		await user.type(screen.getByLabelText('Description'), '  Détails  ');
		await user.click(screen.getByRole('button', { name: 'Ajouter' }));

		expect(onSubmit).toHaveBeenCalledWith({
			title: 'Ma tâche',
			description: 'Détails',
		});
	});

	it('submits with undefined description when empty', async () => {
		const user = userEvent.setup();
		const onSubmit = vi.fn();
		render(<TaskForm onSubmit={onSubmit} />);

		await user.type(screen.getByLabelText('Titre'), 'Sans description');
		await user.click(screen.getByRole('button', { name: 'Ajouter' }));

		expect(onSubmit).toHaveBeenCalledWith({
			title: 'Sans description',
			description: undefined,
		});
	});

	it('resets the fields after a create submit', async () => {
		const user = userEvent.setup();
		render(<TaskForm onSubmit={vi.fn()} />);

		const titleInput = screen.getByLabelText('Titre');
		await user.type(titleInput, 'À réinitialiser');
		await user.click(screen.getByRole('button', { name: 'Ajouter' }));

		expect(titleInput).toHaveValue('');
	});

	it('clears the validation error when typing', async () => {
		const user = userEvent.setup();
		render(<TaskForm onSubmit={vi.fn()} />);

		await user.click(screen.getByRole('button', { name: 'Ajouter' }));
		expect(screen.getByRole('alert')).toBeInTheDocument();

		await user.type(screen.getByLabelText('Titre'), 'a');
		expect(screen.queryByRole('alert')).not.toBeInTheDocument();
	});

	it('calls onCancel when the cancel button is clicked', async () => {
		const user = userEvent.setup();
		const onCancel = vi.fn();
		render(<TaskForm onSubmit={vi.fn()} onCancel={onCancel} mode="edit" />);

		await user.click(screen.getByRole('button', { name: 'Annuler' }));
		expect(onCancel).toHaveBeenCalled();
	});
});
