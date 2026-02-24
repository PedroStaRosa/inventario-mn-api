interface CreateProductProps {
    code: string,
    description: string
}

export const sanitizeProduct = (product: CreateProductProps) => {

    let sanitizedCode = product.code;
    if (Number.isNaN(Number(sanitizedCode))) {
        throw new Error(`Código ${sanitizedCode} não é um código válido`)
    }

    sanitizedCode = sanitizedCode.replace(/^0+/, '').replace(/[^\d]/g, '');

    if (sanitizedCode === '') {
        sanitizedCode = '0';
    }
    let intCode = parseInt(sanitizedCode);
    if (isNaN(intCode)) {
        intCode = 0;
    }
    sanitizedCode = intCode.toString();

    return {
        code: sanitizedCode,
        description: typeof product.description === 'string' ? product.description.trim() : ''
    };
}