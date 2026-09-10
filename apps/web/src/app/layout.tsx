import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Behouse — Location de biens meublés',
  description:
    'Behouse est une marketplace multi-agences de location de biens meublés.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): React.JSX.Element {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
