import { GnomeProvider } from '@gnome-ui/react';
import type { Preview } from '@storybook/react-vite';
import '@gnome-ui/core/styles';
import '@gnome-ui/react/styles';
import '@gnome-ui/layout/styles';

const preview: Preview = {
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <GnomeProvider colorScheme="system">
        <Story />
      </GnomeProvider>
    ),
  ],
};

export default preview;
