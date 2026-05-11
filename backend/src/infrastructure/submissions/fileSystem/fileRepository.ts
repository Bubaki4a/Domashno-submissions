import 'dotenv/config';
import { promises as fs } from 'fs';
import path from 'path';
import { Submission } from '../../../domain/entities/Submission/Submission';
import { SubmissionEntity } from '../../../domain/entities/Submission/SubmissionEntity';
import { ISubmissionRepository } from '../interfaces/ISubmissionRepository';

// Get DATA_FILE_PATH from environment variable, with fallback to default
const getDataFilePath = (): string => {
  const envPath = process.env.DATA_FILE_PATH;
  if (envPath) {
    // If it's an absolute path, use it directly
    if (path.isAbsolute(envPath)) {
      return envPath;
    }
    // If it's a relative path, resolve it relative to the backend directory
    return path.resolve(process.cwd(), envPath);
  }
  // Default fallback
  return path.join(__dirname, '../../../../data/submissions.json');
};

const DATA_FILE_PATH = getDataFilePath();

export class FileRepository implements ISubmissionRepository {

  private async ensureDataFile(): Promise<void> {
    try {
      await fs.access(DATA_FILE_PATH);
    } catch {
      // File doesn't exist, create it with empty array
      await fs.writeFile(DATA_FILE_PATH, JSON.stringify([], null, 2), 'utf-8');
    }
  }

  async save(submission: SubmissionEntity): Promise<void> {
    await this.ensureDataFile();

    const submissions = await this.findAll();
    submissions.push(submission.toJSON());

    await fs.writeFile(
      DATA_FILE_PATH,
      JSON.stringify(submissions, null, 2),
      'utf-8'
    );
  }

  async findAll(): Promise<Submission[]> {
    await this.ensureDataFile();

    try {
      const data = await fs.readFile(DATA_FILE_PATH, 'utf-8');
      const submissions: Submission[] = JSON.parse(data);
      return submissions;
    } catch (error) {
      // If file is empty or invalid, return empty array
      if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
        return [];
      }
      throw new Error(`Failed to read submissions: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async findById(id: string): Promise<Submission | null> {
    const submissions = await this.findAll();
    const submission = submissions.find(s => s.id === id);
    return submission || null;
  }

  async saveAll(submissions: Submission[]): Promise<void> {
    await this.ensureDataFile();

    await fs.writeFile(
      DATA_FILE_PATH,
      JSON.stringify(submissions, null, 2),
      'utf-8'
    );
  }
}
