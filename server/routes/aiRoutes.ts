import { Router } from 'express';
import { AIController } from '../controllers/aiController';

const router = Router();

// Public / Protected AI assistant endpoint
router.post('/ask', AIController.askAI);
router.post('/stream', AIController.streamAI);
router.post('/predict-eta', AIController.predictETA);
router.post('/tts', AIController.textToSpeech);

export default router;
