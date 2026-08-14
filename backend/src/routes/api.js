import { Router } from 'express';
import {
  handleCreateCard,
  handleGetCard,
  handleUpdateCard,
  handleHealthCheck,
} from '../controllers/cards.js';

const router = Router();

router.get('/health', handleHealthCheck);
router.post('/cards', handleCreateCard);
router.get('/cards/:id', handleGetCard);
router.put('/cards/:id', handleUpdateCard);

export default router;
