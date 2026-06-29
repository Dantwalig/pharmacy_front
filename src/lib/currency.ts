export function formatCurrency(amount: number | string | null | undefined): string {
    const num = Number(amount ?? 0);
    if (isNaN(num)) return '0 RWF';
    return `${num.toLocaleString()} RWF`;
}
