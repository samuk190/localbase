declare module '../../api-utils/addFile' {
  export default function addFile(
    data: File | Blob,
    filename: string,
    extension: string,
    keyProvided?: string
  ): Promise<void>;
}
