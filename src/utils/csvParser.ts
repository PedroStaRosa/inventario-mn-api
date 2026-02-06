import fs from "fs";
import csv from "csv-parser";

interface CsvConfig<T> {
    expectedHeaders: string[];
    mapRow: (row: any) => T;
    separator?: string;
    encoding?: BufferEncoding;
}

export function parseCsv<T>(
    file: string,
    config: CsvConfig<T>
): Promise<T[]> {
    const {
        expectedHeaders,
        mapRow,
        separator = ";",
        encoding = "latin1",
    } = config;

    return new Promise((resolve, reject) => {
        const results: T[] = [];
        let headersValidated = false;

        fs.createReadStream(file, { encoding })
            .pipe(csv({ separator }))
            .on("headers", (headers: string[]) => {
                headersValidated = expectedHeaders.every(header =>
                    headers.includes(header)
                );

                if (!headersValidated) {
                    reject(
                        new Error(
                            `CSV inválido. Esperado: ${expectedHeaders.join(", ")}`
                        )
                    );
                }
            })
            .on("data", (data) => {
                results.push(mapRow(data));
            })
            .on("end", async () => {
                try {
                    await fs.promises.unlink(file);
                } catch (error) {
                    console.error(`Falha ao remover arquivo: ${file}`, error);
                }
                resolve(results);
            })
            .on("error", async (err) => {
                /* fs.unlink(file, () => { }); */
                try {
                    await fs.promises.unlink(file);
                } catch (unlinkError) {
                    console.error(`Falha ao remover arquivo após erro: ${file}`, unlinkError);
                }
                reject(new Error("Erro ao processar CSV"));
            });
    });
}