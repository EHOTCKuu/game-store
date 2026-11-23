import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('рендерит текст и вызывает onClick', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Купить</Button>);
    
    const button = screen.getByText('Купить');
    fireEvent.click(button);
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});