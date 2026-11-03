import { withFileName } from '../../lib/multipartFile';

async function contentDispositionOf(file: Blob): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);
    const body = await new Response(formData).text();
    const header = body.split('\r\n').find((line) => line.startsWith('Content-Disposition'));
    return header ?? '';
}

describe('withFileName', () => {
    const blob = new Blob(['content'], { type: 'text/plain' });

    test('should send the requested name as filename of the file part', async () => {
        const named = withFileName(blob, 'manual.txt');

        expect(named).toBeInstanceOf(File);
        expect((named as File).name).toBe('manual.txt');
        expect(named.type).toBe('text/plain');
        expect(await named.text()).toBe('content');
        expect(await contentDispositionOf(named)).toBe(
            'Content-Disposition: form-data; name="file"; filename="manual.txt"'
        );
    });

    test('should replace the name of a named file', () => {
        const file = new File(['content'], 'original.txt', { type: 'text/plain' });

        expect((withFileName(file, 'renamed.txt') as File).name).toBe('renamed.txt');
    });

    test('should return a file that already has the requested name unchanged', () => {
        const file = new File(['content'], 'manual.txt', { type: 'text/plain' });

        expect(withFileName(file, 'manual.txt')).toBe(file);
    });

    test.each([undefined, '', '   '])('should return the file unchanged without a name (%j)', (fileName) => {
        expect(withFileName(blob, fileName)).toBe(blob);
    });

    test('should trim the requested name', () => {
        expect((withFileName(blob, '  manual.txt  ') as File).name).toBe('manual.txt');
    });
});
