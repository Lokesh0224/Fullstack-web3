
export default function calculateTotal(amount: string): number{
    //split by both commas and newlines, then clean up the values
    const amountArray = amount
        .split(/[\n,]+/)
        .map(amt => amt.trim())
        .filter(amt => amt!=='')
        .map(amt => parseFloat(amt));

        return amountArray
             .filter(num => !isNaN(num))
             .reduce((sum, num) => sum+num, 0);

}