import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'SHREE RADHE KRISHNA DIGITAL SERVICE | તમારી ડિજિટલ સેવા, એક જ સ્થળે',
  description:
    'શ્રી રાધે કૃષ્ણ ડિજિટલ સેવા - સાધલી, શિનોર, વડોદરા. PAN Card, આયુષ્માન ભારત, PM કિસાન, આવકનો દાખલો, ઈ-નિર્માણ, ચૂંટણી કાર્ડ અને All India PVC કાર્ડ સ્માર્ટ ડિલિવરી.',
  keywords: [
    'Shree Radhe Krishna Digital Service',
    'શ્રી રાધે કૃષ્ણ ડિજિટલ સેવા',
    'Sadhli Digital Seva',
    'Shinor Jan Seva Kendra',
    'PAN Card Sadhli',
    'Ayushman Card PMJAY',
    'PM Kisan KYC',
    'PVC Card Printing',
    'Income Certificate Gujarat',
  ],
  authors: [{ name: 'Shree Radhe Krishna Digital Service' }],
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="gu">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Noto+Sans+Gujarati:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased bg-[#090d16] text-[#e2e8f0] font-sans selection:bg-blue-600 selection:text-white">
        {children}
      </body>
    </html>
  );
}
