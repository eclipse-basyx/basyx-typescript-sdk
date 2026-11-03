/**
 * Names a file for a multipart upload, so that the name is sent as the `filename` parameter of the
 * file part's `Content-Disposition` header. AAS Part 2 V3.2 reads the file name only from there;
 * a plain `Blob` would otherwise be sent with the default name `blob`.
 *
 * @function withFileName
 * @param {Blob} file - The file content to upload.
 * @param {string} [fileName] - The requested file name. Without a name, the file is returned unchanged.
 * @returns {Blob} A `File` with the requested name and the content type of the given file.
 */
export function withFileName(file: Blob, fileName?: string): Blob {
    const name = fileName?.trim();
    if (!name) return file;
    if (file instanceof File && file.name === name) return file;

    return new File([file], name, { type: file.type });
}
