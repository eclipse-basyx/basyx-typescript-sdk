// import * as fs from 'fs';
// import * as path from 'path';
// import { AasRepositoryClient } from '@/clients/AasRepositoryClient';
// import { AssetinformationThumbnailBody } from '@/generated/aas-repository/types.gen';

// async function fetchThumbnail() {
//     const baseURL = 'http://localhost:8081';
//     const aasIdentifier = 'L2lkcy9hYXMvMjk3OF83NjkyXzY5ODdfMzQwMQ';

//     const client = new AasRepositoryClient();

//     try {
//         const thumbnail = await client.getThumbnail(baseURL, aasIdentifier);
//         console.log('Thumbnail fetched successfully:', thumbnail);
//     } catch (error) {
//         console.error('Error fetching thumbnail:', error);
//     }
// }

// async function updateThumbnail() {
//     const baseURL = 'http://localhost:8081';
//     const aasIdentifier = 'L2lkcy9hYXMvMjk3OF83NjkyXzY5ODdfMzQwMQ';

//     // Read the file from the same directory
//     const filePath = path.join(__dirname, 'PoweredByBaSyx.svg');
//     const fileData = fs.readFileSync(filePath);

//     const thumbnail: AssetinformationThumbnailBody = {
//         fileName: 'PoweredByBaSyx.svg',
//         file: new Blob([fileData]),
//     };

//     const client = new AasRepositoryClient();

//     try {
//         await client.putThumbnail(baseURL, aasIdentifier, thumbnail);
//         console.log('Thumbnail updated successfully');
//     } catch (error) {
//         console.error('Error updating thumbnail:', error);
//     }
// }

// updateThumbnail();
// fetchThumbnail();
