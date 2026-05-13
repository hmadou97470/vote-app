import mongoose, { Schema, model, models } from 'mongoose';

const SessionSchema = new Schema({
  code: { type: String, required: true, unique: true },
  active: { type: Boolean, default: true },
  subjects: [{
    question: String,
    isOpen: { type: Boolean, default: true },
    votes: [{ voterHash: String, choice: Boolean }]
  }]
});

export const Session = models.Session || model('Session', SessionSchema);