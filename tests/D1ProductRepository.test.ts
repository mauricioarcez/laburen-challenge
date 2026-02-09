import { describe, it, expect, mock, beforeEach } from 'bun:test';
import { D1ProductRepository } from '../src/infrastructure/repositories/D1ProductRepository';
import { ProductFilters } from '../src/domain/repositories/IProductRepository';

// Mock D1 Database
const mockD1 = {
    // Chain methods
    prepare: mock(),
    bind: mock(),
    // Data methods
    all: mock(),
    first: mock(),
};

// Setup mock behavior
const resetMocks = () => {
    // Return self to enable chaining: d1.prepare().bind()
    mockD1.prepare.mockImplementation(() => mockD1);
    mockD1.bind.mockImplementation(() => mockD1);

    // Default return values
    mockD1.all.mockResolvedValue({ results: [] });
    mockD1.first.mockResolvedValue(null);

    // Clear history
    mockD1.prepare.mockClear();
    mockD1.bind.mockClear();
    mockD1.all.mockClear();
    mockD1.first.mockClear();
};

const mockDb = {
    d1: mockD1 as any,
};

describe('D1ProductRepository', () => {
    let repository: D1ProductRepository;

    beforeEach(() => {
        resetMocks();
        repository = new D1ProductRepository(mockDb);
    });

    it('should pass the raw query to FTS MATCH without splitting', async () => {
        const filters: ProductFilters = {
            query: '(pantalon OR jean) AND (negro OR black)',
        };

        await repository.search(filters);

        expect(mockD1.prepare).toHaveBeenCalled();
        const sql = mockD1.prepare.mock.calls[0][0];

        // Verify SQL contains FTS match
        expect(sql).toContain('fts MATCH ?');

        // Verify bind params
        expect(mockD1.bind).toHaveBeenCalledWith('(pantalon OR jean) AND (negro OR black)');
    });

    it('should apply category filter', async () => {
        const filters: ProductFilters = {
            categoria: 'Deportivo',
        };

        await repository.search(filters);

        const sql = mockD1.prepare.mock.calls[0][0];
        expect(sql).toContain('p.categoria = ?');
        expect(mockD1.bind).toHaveBeenCalledWith('Deportivo');
    });

    it('should combine raw query and structured filters', async () => {
        const filters: ProductFilters = {
            query: 'camiseta',
            color: 'Rojo',
        };

        await repository.search(filters);

        const sql = mockD1.prepare.mock.calls[0][0];
        expect(sql).toContain('fts MATCH ?');
        expect(sql).toContain('p.color = ?');

        // Verify order of bind params (query first, then color)
        expect(mockD1.bind).toHaveBeenCalledWith('camiseta', 'Rojo');
    });

    // Wholesale check: verify we CAN filter by talla if requested, 
    // even if prompt encourages not to. The repo should just obey.
    it('should apply talla filter if provided', async () => {
        const filters: ProductFilters = {
            talla: 'M',
        };

        await repository.search(filters);

        const sql = mockD1.prepare.mock.calls[0][0];
        expect(sql).toContain('p.talla = ?');
        expect(mockD1.bind).toHaveBeenCalledWith('M');
    });
});
