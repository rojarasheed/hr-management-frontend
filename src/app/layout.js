import './globals.css';

export const metadata = {
    title: 'HR Management System',
    description: 'HR Leave Management System',
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body>{children}</body>
        </html>
    );
}