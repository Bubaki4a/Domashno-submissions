import { Router, Request, Response } from 'express';
import { CreateSubmissionRequest } from '../requests/Submission/CreateSubmissionRequest';
import { CreateSubmissionResponse } from '../responses/Submission/CreateSubmissionResponse';
import { UpdateSubmissionResponse } from '../responses/Submission/UpdateSubmissionResponse';
import { GetSubmissionsResponse } from '../responses/Submission/GetSubmissionsResponse';
import { CreateSubmissionUseCase } from '../../application/usecases/Submission/CreateSubmissionUseCase';
import { GetAllSubmissionsUseCase } from '../../application/usecases/Submission/GetAllSubmissionsUseCase';
import { UpdateSubmissionUseCase } from '../../application/usecases/Submission/UpdateSubmissionUseCase';
import { GetSubmissionByIdUseCase } from '../../application/usecases/Submission/GetSubmissionByIdUseCase';
import { createSubmissionRepository } from '../../infrastructure/repositories/repositoryFactory';

const router = Router();

// Initialize repository and use cases (dependency injection)
const repository = createSubmissionRepository();
const createSubmissionUseCase = new CreateSubmissionUseCase(repository);
const getAllSubmissionsUseCase = new GetAllSubmissionsUseCase(repository);
const updateSubmissionUseCase = new UpdateSubmissionUseCase(repository);
const getSubmissionByIdUseCase = new GetSubmissionByIdUseCase(repository);

router.post('/submit', async (req: Request, res: Response) => {
  try {
    const request: CreateSubmissionRequest = req.body;

    // Validate request body
    if (!request || typeof request !== 'object') {
      return res.status(400).json({
        error: 'Invalid request body',
        message: 'Request body must be a valid object'
      });
    }

    // Use case will handle validation through domain entity
    const response: CreateSubmissionResponse = await createSubmissionUseCase.execute(request);

    res.status(201).json(response);
  } catch (error) {
    if (error instanceof Error) {
      return res.status(400).json({
        success: false,
        error: error.message
      });
    }

    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'An unexpected error occurred'
    });
  }
});

router.get('/submissions', async (req: Request, res: Response) => {
  try {
    const response: GetSubmissionsResponse = await getAllSubmissionsUseCase.execute();

    res.status(200).json(response);
  } catch (error) {
    console.error('Error fetching submissions:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to fetch submissions'
    });
  }
});

router.get('/submissions/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const response: UpdateSubmissionResponse = await getSubmissionByIdUseCase.execute(id);
    res.status(200).json(response);
  } catch (error) {
    if (error instanceof Error) {
      const statusCode = error.message === 'Submission not found' ? 404 : 400;
      return res.status(statusCode).json({
        success: false,
        error: error.message
      });
    }
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'An unexpected error occurred'
    });
  }
});

router.put('/submissions/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    console.log(`PUT /api/submissions/${id} - Updating submission`);
    const request: CreateSubmissionRequest = req.body;

    // Validate request body
    if (!request || typeof request !== 'object') {
      return res.status(400).json({
        error: 'Invalid request body',
        message: 'Request body must be a valid object'
      });
    }

    // Use case will handle validation through domain entity
    const response: UpdateSubmissionResponse = await updateSubmissionUseCase.execute(id, request);

    res.status(200).json(response);
  } catch (error) {
    if (error instanceof Error) {
      const statusCode = error.message === 'Submission not found' ? 404 : 400;
      return res.status(statusCode).json({
        success: false,
        error: error.message
      });
    }

    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'An unexpected error occurred'
    });
  }
});

export { router as formRouter };
