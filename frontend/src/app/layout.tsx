import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'CloudOps Lab — Cadastro de Clientes',
  description: 'Plataforma de cadastro de clientes da loja de roupas',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body style={{ fontFamily: 'system-ui, sans-serif', margin: 0, backgroundColor: '#f8fafc', color: '#0f172a' }}>
        {children}
      </body>
    </html>
  );
}
