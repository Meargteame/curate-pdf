import { Router, Request, Response } from 'express';
import { Store } from '../db/store';

export const userRouter = Router();

// GET /api/v1/user
userRouter.get('/', (req: Request, res: Response): void => {
  const profile = Store.getUserProfile();
  const teamMembers = Store.getTeamMembers();
  res.json({
    data: {
      profile,
      teamMembers,
    }
  });
});

// PUT /api/v1/user
userRouter.put('/', (req: Request, res: Response): void => {
  const updated = Store.updateUserProfile(req.body);
  res.json({ data: updated, message: 'User profile updated successfully' });
});

// POST /api/v1/user/team
userRouter.post('/team', (req: Request, res: Response): void => {
  const { name, email, role, status } = req.body;
  if (!email) {
    res.status(400).json({ error: 'Email is required' });
    return;
  }
  const member = Store.addTeamMember({
    name: name || email.split('@')[0],
    email,
    role: role || 'Editor',
    status: status || 'Active',
  });
  res.status(201).json({ data: member });
});

// DELETE /api/v1/user/team/:id
userRouter.delete('/team/:id', (req: Request, res: Response): void => {
  Store.deleteTeamMember(req.params.id);
  res.json({ message: 'Team member removed', id: req.params.id });
});
