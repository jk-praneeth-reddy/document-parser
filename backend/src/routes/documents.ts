import { Router } from 'express'

const router = Router()

router.get('/', (_req, res) => {
  res.json({ data: [], message: 'List of documents' })
})

router.get('/:id', (req, res) => {
  res.json({ id: req.params.id, message: 'Document by ID' })
})

router.post('/', (req, res) => {
  res.status(201).json({ data: req.body, message: 'Document created' })
})

router.delete('/:id', (req, res) => {
  res.json({ id: req.params.id, message: 'Document deleted' })
})

export default router
