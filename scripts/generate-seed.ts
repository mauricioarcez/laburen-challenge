import * as XLSX from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';

// Rutas
const excelPath = path.join(__dirname, '../data/products.xlsx');
const outputPath = path.join(__dirname, '../data/seed.sql');

// Mapeo de columnas Excel -> DB
const columnMapping: Record<string, string> = {
    'ID': 'id',
    'TIPO_PRENDA': 'tipo_prenda',
    'TALLA': 'talla',
    'COLOR': 'color',
    'CANTIDAD_DISPONIBLE': 'cantidad_disponible',
    'PRECIO_50_U': 'precio_50_u',
    'PRECIO_100_U': 'precio_100_u',
    'PRECIO_200_U': 'precio_200_u',
    'DISPONIBLE': 'disponible',
    'CATEGORÍA': 'categoria',
    'CATEGORIA': 'categoria', // sin tilde
    'DESCRIPCIÓN': 'descripcion',
    'DESCRIPCION': 'descripcion' // sin tilde
};

function normalizeHeader(header: string): string {
    return header.trim().toUpperCase().replace(/_/g, ' ');
}

function escapeString(val: any): string {
    if (val === null || val === undefined) return 'NULL';
    // Convertir a string
    const str = String(val);
    // Escapar comillas simples
    return `'${str.replace(/'/g, "''")}'`;
}

async function main() {
    console.log(`Leyendo archivo Excel desde: ${excelPath}`);

    if (!fs.existsSync(excelPath)) {
        console.error('El archivo Excel no existe.');
        process.exit(1);
    }

    const workbook = XLSX.readFile(excelPath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    // Leer como JSON
    const data = XLSX.utils.sheet_to_json(sheet);

    if (data.length === 0) {
        console.error('No se encontraron datos en la hoja.');
        process.exit(1);
    }

    console.log(`Encontrados ${data.length} registros.`);

    let sql = `-- Seed data generated from products.xlsx\n`;
    sql += `DELETE FROM products;\n`; // Limpiar tabla antes de insertar
    sql += `DELETE FROM products_fts;\n`; // Limpiar índice FTS

    const insertValues: string[] = [];

    // Normalizar headers para encontrar columnas
    // Tomamos el primer registro para ver keys reales
    const firstRow = data[0] as Record<string, any>;
    const headers = Object.keys(firstRow);

    console.log('Columnas encontradas:', headers);

    for (const row of data as Record<string, any>[]) {
        const values: Record<string, any> = {};

        // Mapear valores
        for (const [excelCol, dbCol] of Object.entries(columnMapping)) {
            // Buscar la key que coincida (ignorando case/acentos si es necesario, pero start simple)
            const key = headers.find(h =>
                h.toUpperCase() === excelCol ||
                h.toUpperCase().replace('Í', 'I') === excelCol.replace('Í', 'I')
            );

            if (key) {
                values[dbCol] = row[key];
            }
        }

        // Validar campos obligatorios
        if (!values.id) continue;

        // Formatear valores para SQL
        const id = escapeString(values.id);
        const tipo_prenda = escapeString(values.tipo_prenda);
        const talla = escapeString(values.talla);
        const color = escapeString(values.color);
        const cantidad = Number(values.cantidad_disponible) || 0;
        const p50 = Number(values.precio_50_u) || 0;
        const p100 = Number(values.precio_100_u) || 0;
        const p200 = Number(values.precio_200_u) || 0;

        // Convertir Disponible "Sí"/"No" o 1/0 a 1/0
        let disp = 1;
        if (typeof values.disponible === 'string') {
            disp = values.disponible.toLowerCase().includes('s') ? 1 : 0;
        } else if (typeof values.disponible === 'number') {
            disp = values.disponible > 0 ? 1 : 0;
        }

        const categoria = escapeString(values.categoria);
        const descripcion = escapeString(values.descripcion);

        insertValues.push(
            `(${id}, ${tipo_prenda}, ${talla}, ${color}, ${cantidad}, ${p50}, ${p100}, ${p200}, ${disp}, ${categoria}, ${descripcion})`
        );
    }

    if (insertValues.length > 0) {
        // SQLite tiene límite de variables pero aquí son literales.
        // Hacemos batches de 100 por seguridad y legibilidad
        const batchSize = 100;
        for (let i = 0; i < insertValues.length; i += batchSize) {
            const batch = insertValues.slice(i, i + batchSize);
            sql += `INSERT INTO products (id, tipo_prenda, talla, color, cantidad_disponible, precio_50_u, precio_100_u, precio_200_u, disponible, categoria, descripcion) VALUES \n${batch.join(',\n')};\n`;
        }
    }

    fs.writeFileSync(outputPath, sql);
    console.log(`Archivo SQL generado en: ${outputPath}`);
}

main().catch(console.error);
