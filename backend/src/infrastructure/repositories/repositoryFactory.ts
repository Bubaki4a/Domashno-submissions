import { FileRepository } from '../submissions/fileSystem/fileRepository';
import { ISubmissionRepository } from '../submissions/interfaces/ISubmissionRepository';
import { IProductRepository } from '../providers/interfaces/IProductRepository';
import { IProviderRepository } from '../providers/interfaces/IProviderRepository';
import { ProductFileRepository } from '../providers/fileSystem/ProductFileRepository';
import { ProviderFileRepository } from '../providers/fileSystem/ProviderFileRepository';
import { DatabaseSubmissionRepository } from '../submissions/database/DatabaseSubmissionRepository';
import { DatabaseProductRepository } from '../providers/database/DatabaseProductRepository';
import { DatabaseProviderRepository } from '../providers/database/DatabaseProviderRepository';

type StorageDriver = 'file' | 'database';

const getStorageDriver = (): StorageDriver => {
  const raw = (process.env.STORAGE_DRIVER || 'file').toLowerCase().trim();

  if (raw === 'database' || raw === 'db' || raw === 'mysql') {
    return 'database';
  }

  return 'file';
};

export const createSubmissionRepository = (): ISubmissionRepository => {
  const driver = getStorageDriver();

  if (driver === 'database') {
    return new DatabaseSubmissionRepository();
  }

  return new FileRepository();
};

export const createProductRepository = (): IProductRepository => {
  const driver = getStorageDriver();

  if (driver === 'database') {
    return new DatabaseProductRepository();
  }

  return new ProductFileRepository();
};

export const createProviderRepository = (): IProviderRepository => {
  const driver = getStorageDriver();

  if (driver === 'database') {
    return new DatabaseProviderRepository();
  }

  return new ProviderFileRepository();
};

