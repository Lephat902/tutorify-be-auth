import axios, { AxiosError, AxiosInstance } from 'axios';
import { HttpException } from '@nestjs/common';
import * as FormData from 'form-data';
import { FileUploadResponseDto } from '../dtos';

export class FileServiceClient {
  private readonly httpClient: AxiosInstance;

  constructor() {
    this.httpClient = axios.create({
      baseURL: process.env.FILE_SERVICE_BASE_DOMAIN,
    });
  }

  private buildUrl(path: string): string {
    return `${this.httpClient.defaults.baseURL}${path}`;
  }

  private async handleRequest(requestPromise: Promise<any>) {
    try {
      const response = await requestPromise;
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        // convert AxiosError to HttpException
        console.log(error);
        throw new HttpException(error.response.data.message, error.response.data.statusCode);
      } else {
        throw error;
      }
    }
  }

  uploadSingleFile(file: Express.Multer.File): Promise<FileUploadResponseDto> {
    const url = this.buildUrl('upload/file');

    // Create a new FormData instance
    const formData = new FormData();
    formData.append('file', file.buffer, file.originalname);

    // Send the request
    return this.handleRequest(this.httpClient.post(url, formData));
  }

  uploadMultipleFiles(files: Express.Multer.File[]): Promise<FileUploadResponseDto[]> {
    const url = this.buildUrl('upload/files');

    // Create a new FormData instance
    const formData = new FormData();

    // Append each file to the form data
    files.forEach((file) => {
      formData.append('files', file.buffer, file.originalname);
    });

    // Send the request
    return this.handleRequest(this.httpClient.post(url, formData));
  }

  deleteSingleFile(id: string): Promise<void> {
    const url = this.buildUrl(`file/${id}`);

    // Send the request
    return this.handleRequest(this.httpClient.delete(url));
  }

  deleteMultipleFiles(ids: string[]): Promise<void> {
    const url = this.buildUrl('file/multiple');

    // Send the request
    return this.handleRequest(this.httpClient.delete(url, {
      data: {
        ids
      }
    }));
  }
}
