import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { Modal } from './Modal';

function Trigger({ withAutoFocus }: { withAutoFocus: boolean }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={() => setOpen(true)}>Open</button>
      {open && (
        <Modal title="Restock" onClose={() => setOpen(false)}>
          <input aria-label="Units" autoFocus={withAutoFocus} />
        </Modal>
      )}
    </>
  );
}

describe('Modal', () => {
  it('keeps focus on a field that asked for autoFocus, so typing goes straight into it', async () => {
    render(<Trigger withAutoFocus />);

    await userEvent.click(screen.getByRole('button', { name: 'Open' }));
    await userEvent.keyboard('3');

    expect(screen.getByLabelText('Units')).toHaveValue('3');
  });

  it('focuses the dialog itself when no field asks for focus', async () => {
    render(<Trigger withAutoFocus={false} />);

    await userEvent.click(screen.getByRole('button', { name: 'Open' }));

    expect(screen.getByRole('dialog')).toHaveFocus();
  });

  it('returns focus to the button that opened it after closing', async () => {
    render(<Trigger withAutoFocus />);
    const opener = screen.getByRole('button', { name: 'Open' });

    await userEvent.click(opener);
    await userEvent.keyboard('{Escape}');

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(opener).toHaveFocus();
  });
});
