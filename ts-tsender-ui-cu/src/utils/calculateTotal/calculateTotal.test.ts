import { describe, it, expect } from "vitest"
import calculateTotal  from "./calculateTotal"

describe('calculateTotal', () => {
    it('should work with the newlines', () => {
        expect(calculateTotal('100\n200')).toBe(300);
        expect(calculateTotal('100,200')).toBe(300)
        expect(calculateTotal('500')).toBe(500)
    })

    it('should handle mixed delimiters',  () => {
        expect(calculateTotal("100,200\n300")).toBe(600);
        expect(calculateTotal("1.5\n2.5,3.5")).toBe(7.5);
        expect(calculateTotal("200,,200\n\n300")).toBe(700);
    })

    it("should handle empty input", () => {
        expect(calculateTotal('')).toBe(0);
        expect(calculateTotal(', \n, ')).toBe(0)
    })

    it("should ignore invalid numbers", () =>{
        expect(calculateTotal('abc, 100')).toBe(100);
        expect(calculateTotal('12three\n45')).toBe(57);
        expect(calculateTotal('123.45.67')).toBe(123.45);
    })

    it("should handle decimals", () => {
        expect(calculateTotal('1.1\n2.2, 3.3')).toBe(6.6);
        expect(calculateTotal('99.99, 0.01')).toBe(100);
    })

    it("should handle whitespaces", () => {
        expect(calculateTotal(" 100 \n 200 ")).toBe(300);
        expect(calculateTotal('\t123\n\r456')).toBe(579);
    })

    it("handles invalid inputs", () => {
        expect(calculateTotal("abc,100,def")).toBe(100)
    })
})