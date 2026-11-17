import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';

const fontePrincipal = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'Atelier CloudOps — Cadastro de Clientes',
  description: 'Plataforma de cadastro e gestão de clientes da loja de roupas',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body
        className={fontePrincipal.className}
        style={{
          margin: 0,
          backgroundColor: '#fafaf9',
          color: '#1c1917',
          WebkitFontSmoothing: 'antialiased',
        }}
      >
        {children}
      </body>
    </html>
  );
}
